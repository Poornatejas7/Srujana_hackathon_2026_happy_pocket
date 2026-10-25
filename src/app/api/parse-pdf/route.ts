import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { connectToDatabase } from '@/lib/mongodb';
import { TransactionModel } from '@/models/Transaction';
import { extractUPIEntity } from '@/lib/engine';
import { extractTextFromPDF, parseBankStatementLines, parseCSVStatement } from '@/lib/pdfParser';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = (formData.get('password') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No statement file provided' }, { status: 400 });
    }

    const fileName = (file.name || '').toLowerCase();
    const isCsv = fileName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedTransactions: any[] = [];

    if (isCsv) {
      // 1. CSV Statement Parsing
      const csvText = buffer.toString('utf-8');
      const rawTxs = parseCSVStatement(csvText, 'acc_primary_sbi');
      if (rawTxs.length === 0) {
        return NextResponse.json({ 
          error: 'No recognizable transaction rows found in CSV. Please verify column headers.' 
        }, { status: 422 });
      }
      parsedTransactions = rawTxs;
    } else {
      // 2. PDF Statement Parsing
      const tempFileName = `bank_stmt_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
      tempFilePath = path.join(os.tmpdir(), tempFileName);
      await writeFile(tempFilePath, buffer);

      const scriptPath = path.join(process.cwd(), 'scripts', 'parse_pdf.py');
      const pyArgs = [scriptPath, tempFilePath];
      if (password) {
        pyArgs.push(password);
      }

      const runPython = (cmd: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const py = spawn(cmd, pyArgs);
          let stdout = '';
          let stderr = '';

          py.stdout.on('data', data => { stdout += data.toString(); });
          py.stderr.on('data', data => { stderr += data.toString(); });

          py.on('error', err => reject(err));
          py.on('close', code => {
            if (code !== 0) {
              reject(new Error(stderr || `Python parser exited with code ${code}`));
            } else {
              resolve(stdout);
            }
          });
        });
      };

      let pythonSuccess = false;
      try {
        let resultJson = '';
        try {
          resultJson = await runPython('python');
        } catch {
          try {
            resultJson = await runPython('python3');
          } catch {
            resultJson = await runPython('py');
          }
        }

        const parsed = JSON.parse(resultJson);
        if (parsed.is_encrypted) {
          return NextResponse.json(parsed, { status: 200 });
        }
        if (parsed.success && parsed.transactions && parsed.transactions.length > 0) {
          parsedTransactions = parsed.transactions;
          pythonSuccess = true;
        }
      } catch (pyErr) {
        // Python execution failed or python runtime not installed
        console.warn('Python PDF parser unavailable, falling back to pdfjs-dist:', pyErr);
      }

      // In-process fallback using pdfjs-dist
      if (!pythonSuccess) {
        try {
          const lines = await extractTextFromPDF(arrayBuffer);
          const extractedTxs = parseBankStatementLines(lines, 'acc_primary_sbi');
          if (extractedTxs.length > 0) {
            parsedTransactions = extractedTxs;
          }
        } catch (pdfJsErr: any) {
          console.error('pdfjs-dist extraction failed:', pdfJsErr);
        }
      }
    }

    if (!parsedTransactions || parsedTransactions.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to extract any financial transactions from the uploaded statement.' 
      }, { status: 422 });
    }

    // Connect to MongoDB Atlas
    await connectToDatabase();

    // Clean, Enrich and Categorize every transaction
    const candidateDocs = parsedTransactions.map((tx: any, idx: number) => {
      const classification = extractUPIEntity(
        tx.rawDescription || '',
        tx.payeeName || '',
        tx.vpaHandle || ''
      );

      const isCredit = tx.amount > 0 || (tx.rawDescription && /DEP TFR|CR\b|\bCREDIT\b|\bUPI\/CR\b|RECEIVED|SALARY/i.test(tx.rawDescription));
      const amountVal = isCredit ? Math.abs(tx.amount) : -Math.abs(tx.amount);
      const parsedDate = tx.timestamp ? new Date(tx.timestamp) : new Date();

      return {
        accountId: tx.accountId || 'acc_primary_sbi',
        timestamp: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        rawDescription: tx.rawDescription || 'Bank Transaction',
        amount: amountVal,
        currency: tx.currency || 'INR',
        txMode: tx.txMode || (tx.rawDescription && /UPI/i.test(tx.rawDescription) ? 'UPI' : 'TRANSFER'),
        upiRrn: tx.upiRrn || (tx.id && tx.id.length >= 12 ? tx.id.slice(-12) : `RRN${Date.now()}${idx}`),
        payeeName: tx.payeeName || classification.cleanName,
        bankCode: tx.bankCode || '',
        vpaHandle: tx.vpaHandle || '',
        remark: tx.remark || 'Imported Statement',
        cleanMerchant: classification.cleanName,
        accountType: classification.accountType,
        direction: amountVal > 0 ? 'CREDIT' : 'DEBIT',
        theme: classification.theme,
        themeIcon: classification.themeIcon,
        category: classification.category,
        tier: classification.tier,
        isRecurring: classification.isRecurring,
        isInternalTransfer: classification.isSelfTransfer,
        isRefundOrReversal: classification.isRefund,
        netOutflowAmount: amountVal < 0 ? Math.abs(amountVal) : 0,
        isAmbiguous: classification.isAmbiguous || false,
        needsReview: classification.needsReview || false,
        confidenceScore: Math.round(classification.confidenceScore * 100),
        userOverridden: false,
      };
    });

    // Deduplication Engine: prevent importing duplicate transactions
    const candidateRRNs = candidateDocs.map(d => d.upiRrn).filter(Boolean);
    const existingTransactions = await TransactionModel.find({
      $or: [
        { upiRrn: { $in: candidateRRNs } },
        {
          timestamp: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      ]
    }).select('upiRrn rawDescription amount timestamp');

    const existingRrnSet = new Set(existingTransactions.map(t => t.upiRrn).filter(Boolean));
    const existingSignatureSet = new Set(
      existingTransactions.map(t => 
        `${new Date(t.timestamp).toISOString().slice(0, 10)}_${t.amount}_${t.rawDescription.trim().toLowerCase().slice(0, 24)}`
      )
    );

    const nonDuplicateDocs = candidateDocs.filter(d => {
      if (d.upiRrn && existingRrnSet.has(d.upiRrn)) return false;
      const sig = `${new Date(d.timestamp).toISOString().slice(0, 10)}_${d.amount}_${d.rawDescription.trim().toLowerCase().slice(0, 24)}`;
      if (existingSignatureSet.has(sig)) return false;
      return true;
    });

    let savedDocs: any[] = [];
    if (nonDuplicateDocs.length > 0) {
      try {
        savedDocs = await TransactionModel.insertMany(nonDuplicateDocs, { ordered: false });
      } catch (dbErr: any) {
        if (dbErr.insertedDocs && dbErr.insertedDocs.length > 0) {
          savedDocs = dbErr.insertedDocs;
        } else {
          for (const doc of nonDuplicateDocs) {
            try {
              const created = await TransactionModel.create(doc);
              savedDocs.push(created);
            } catch {
              // Ignore duplicate collision
            }
          }
        }
      }
    }

    const merchantCount = nonDuplicateDocs.filter((t: any) => t.accountType === 'Merchant / Business').length;
    const personalCount = nonDuplicateDocs.filter((t: any) => t.accountType === 'Personal').length;
    const duplicatesSkipped = candidateDocs.length - nonDuplicateDocs.length;

    return NextResponse.json({
      success: true,
      message: nonDuplicateDocs.length > 0 
        ? `Successfully imported ${savedDocs.length} transactions (${duplicatesSkipped} duplicates skipped)` 
        : `Statement already fully synchronized. 0 new transactions, ${duplicatesSkipped} duplicates skipped.`,
      database: 'happypocket',
      collection: 'transactions',
      extractedCount: candidateDocs.length,
      savedToMongoCount: savedDocs.length,
      duplicatesSkipped,
      merchantCount,
      personalCount,
      transactions: savedDocs.length > 0 ? savedDocs : candidateDocs,
    });
  } catch (err: any) {
    console.error('Statement parsing endpoint error:', err);
    return NextResponse.json({ error: err.message || 'Internal error parsing statement' }, { status: 500 });
  } finally {
    if (tempFilePath) {
      unlink(tempFilePath).catch(() => {});
    }
  }
}
