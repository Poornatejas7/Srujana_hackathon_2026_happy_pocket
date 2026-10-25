import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { connectToDatabase } from '@/lib/mongodb';
import { TransactionModel } from '@/models/Transaction';
import { extractUPIEntity } from '@/lib/engine';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = (formData.get('password') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to temp location
    const tempFileName = `bank_stmt_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    const scriptPath = path.join(process.cwd(), 'scripts', 'parse_pdf.py');

    // Run Python parser (try 'python' first, then 'python3')
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

    let resultJson = '';
    try {
      resultJson = await runPython('python');
    } catch {
      resultJson = await runPython('python3');
    }

    const parsed = JSON.parse(resultJson);
    if (parsed.is_encrypted) {
      return NextResponse.json(parsed, { status: 200 });
    }

    if (!parsed.success || !parsed.transactions || parsed.transactions.length === 0) {
      return NextResponse.json({ error: parsed.error || 'Failed to extract transactions' }, { status: 422 });
    }

    // Connect to MongoDB Atlas
    await connectToDatabase();

    // Clean and Categorize every transaction between 'Merchant / Business' and 'Personal'
    const cleanedTransactions = parsed.transactions.map((tx: any, idx: number) => {
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
        txMode: tx.txMode || (tx.rawDescription && /UPI/i.test(tx.rawDescription) ? 'UPI' : 'NEFT'),
        upiRrn: tx.upiRrn || (tx.id && tx.id.length >= 12 ? tx.id.slice(-12) : `RRN${Date.now()}${idx}`),
        payeeName: tx.payeeName || classification.cleanName,
        bankCode: tx.bankCode || '',
        vpaHandle: tx.vpaHandle || '',
        remark: tx.remark || 'Imported Statement',
        cleanMerchant: classification.cleanName,
        accountType: classification.accountType, // 'Merchant / Business' vs 'Personal'
        direction: amountVal > 0 ? 'CREDIT' : 'DEBIT',
        category: classification.category,
        tier: classification.tier,
        isRecurring: classification.isRecurring,
        isInternalTransfer: classification.isSelfTransfer,
        isRefundOrReversal: classification.isRefund,
        netOutflowAmount: amountVal < 0 ? Math.abs(amountVal) : 0,
        userOverridden: false,
      };
    });

    // Save/Upsert into MongoDB Atlas
    let savedDocs: any[] = [];
    try {
      savedDocs = await TransactionModel.insertMany(cleanedTransactions, { ordered: false });
    } catch (dbErr: any) {
      // In case of any duplicate RRNs, fetch the inserted ones
      if (dbErr.insertedDocs && dbErr.insertedDocs.length > 0) {
        savedDocs = dbErr.insertedDocs;
      } else {
        // Fallback: insert one by one
        for (const doc of cleanedTransactions) {
          try {
            const created = await TransactionModel.create(doc);
            savedDocs.push(created);
          } catch {
            // Ignore duplicate collision
          }
        }
      }
    }

    const merchantCount = cleanedTransactions.filter((t: any) => t.accountType === 'Merchant / Business').length;
    const personalCount = cleanedTransactions.filter((t: any) => t.accountType === 'Personal').length;

    return NextResponse.json({
      success: true,
      message: 'Bank transactions parsed, categorized and saved to MongoDB Atlas',
      database: 'happypocket',
      collection: 'transactions',
      extractedCount: cleanedTransactions.length,
      savedToMongoCount: savedDocs.length,
      merchantCount,
      personalCount,
      transactions: savedDocs.length > 0 ? savedDocs : cleanedTransactions,
    });
  } catch (err: any) {
    console.error('PDF parsing endpoint error:', err);
    return NextResponse.json({ error: err.message || 'Internal error parsing statement' }, { status: 500 });
  } finally {
    if (tempFilePath) {
      unlink(tempFilePath).catch(() => {});
    }
  }
}
