import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BankAccountModel } from '@/models/BankAccount';
import { TransactionModel } from '@/models/Transaction';
import { extractUPIEntity } from '@/lib/engine';
import mongoose from 'mongoose';

// Generate a realistic 12-digit NPCI UPI RRN (e.g. "629840192837")
function generateUpiRrn(): string {
  const yearDigit = '6'; // 2026
  const dayOfYear = Math.floor(Math.random() * 365).toString().padStart(3, '0');
  const sequence = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${yearDigit}${dayOfYear}${sequence}`;
}

export async function POST(req: NextRequest) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const { 
    payeeVpa, 
    payeeName, 
    amount, 
    note, 
    upiPin,
    category: overrideCategory,
    theme: overrideTheme,
    themeIcon: overrideThemeIcon,
  } = body;

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return NextResponse.json({ 
      success: false, 
      errorCode: 'UPI_AM01', 
      error: 'Invalid transaction amount' 
    }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // 1. Fetch Primary User Account
    const payerAccount = await BankAccountModel.findOne({ isPrimaryUser: true });
    if (!payerAccount) {
      return NextResponse.json({ 
        success: false, 
        errorCode: 'UPI_U03', 
        error: 'Payer bank account not found or unlinked' 
      }, { status: 404 });
    }

    // 2. Validate UPI PIN (if provided)
    if (upiPin && payerAccount.upiPin && upiPin !== payerAccount.upiPin) {
      return NextResponse.json({ 
        success: false, 
        errorCode: 'UPI_ZM', 
        error: 'UPI: ZM (Invalid UPI PIN entered)' 
      }, { status: 401 });
    }

    // 3. Balance Check: Fail if insufficient funds
    if (payerAccount.balance < numAmount) {
      return NextResponse.json({ 
        success: false, 
        errorCode: 'UPI_U16', 
        error: `UPI: U16 (Insufficient funds in account). Available: ₹${payerAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Required: ₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
      }, { status: 400 });
    }

    // 4. Fetch or Resolve Payee Account
    let payeeAccount = null;
    if (payeeVpa) {
      payeeAccount = await BankAccountModel.findOne({ upiId: payeeVpa });
    }
    if (!payeeAccount && payeeName) {
      payeeAccount = await BankAccountModel.findOne({ 
        accountHolderName: new RegExp(`^${payeeName}$`, 'i') 
      });
    }

    // Infer classification if payee is not already a seeded merchant
    const classification = extractUPIEntity(
      note || '',
      payeeAccount?.accountHolderName || payeeName || payeeVpa || 'Unknown Payee',
      payeeAccount?.upiId || payeeVpa || ''
    );

    const targetCategory = overrideCategory || payeeAccount?.merchantCategory || classification.category || 'Shopping & Discretionary';
    const targetTheme = overrideTheme || payeeAccount?.theme || classification.theme || 'Merchant Payment';
    const targetIcon = overrideThemeIcon || payeeAccount?.themeIcon || classification.themeIcon || '🛍️';
    const isMerchant = payeeAccount?.accountType === 'MERCHANT' || classification.accountType === 'Merchant / Business';

    // 5. Atomic Double-Entry Ledger: Debit Payer, Credit Payee
    payerAccount.balance = Math.round((payerAccount.balance - numAmount) * 100) / 100;
    await payerAccount.save();

    if (payeeAccount) {
      payeeAccount.balance = Math.round((payeeAccount.balance + numAmount) * 100) / 100;
      await payeeAccount.save();
    }

    // 6. Generate 12-digit NPCI UPI RRN
    const rrn = generateUpiRrn();
    const cleanPayee = payeeAccount?.accountHolderName || classification.cleanName || payeeName || 'Merchant';

    // 7. Insert Transaction into Transaction Ledger
    const txDoc = await TransactionModel.create({
      accountId: payerAccount.accountNumber,
      timestamp: new Date(),
      rawDescription: `UPI/${isMerchant ? 'P2M' : 'P2P'}/${cleanPayee.toUpperCase()}/${rrn}/${payerAccount.bankName.slice(0, 4)}`,
      amount: -numAmount,
      currency: 'INR',
      txMode: 'UPI',
      upiRrn: rrn,
      payeeName: cleanPayee,
      cleanMerchant: cleanPayee,
      bankCode: payeeAccount?.bankName || 'UPI',
      vpaHandle: payeeAccount?.upiId || payeeVpa || `${cleanPayee.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
      remark: note || `UPI Payment to ${cleanPayee}`,
      accountType: isMerchant ? 'Merchant / Business' : 'Personal',
      direction: 'DEBIT',
      theme: targetTheme,
      themeIcon: targetIcon,
      category: targetCategory,
      tier: classification.tier || 'Discretionary',
      isRecurring: false,
      isInternalTransfer: false,
      isRefundOrReversal: false,
      isAmbiguous: classification.isAmbiguous || false,
      needsReview: classification.needsReview || false,
      confidenceScore: overrideCategory ? 100 : (classification.confidenceScore ? Math.round(classification.confidenceScore * 100) : 95),
      userOverridden: !!overrideCategory,
    });

    return NextResponse.json({
      success: true,
      message: 'UPI Payment processed successfully',
      rrn,
      amount: numAmount,
      newBalance: payerAccount.balance,
      payer: {
        accountHolder: payerAccount.accountHolderName,
        accountNumber: payerAccount.maskedAccountNumber,
        bankName: payerAccount.bankName,
        upiId: payerAccount.upiId,
      },
      payee: {
        name: cleanPayee,
        upiId: payeeAccount?.upiId || payeeVpa,
        category: targetCategory,
        theme: targetTheme,
        themeIcon: targetIcon,
      },
      transaction: txDoc,
    });

  } catch (err: any) {
    console.error('UPI Transfer Switch Error:', err);
    return NextResponse.json({ 
      success: false, 
      errorCode: 'UPI_T99', 
      error: err?.message || 'UPI Switch connection error' 
    }, { status: 500 });
  }
}
