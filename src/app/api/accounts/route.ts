import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BankAccountModel } from '@/models/BankAccount';

export const INITIAL_BANK_ACCOUNTS = [
  // 1. Primary User Account (Starting Balance: ₹10,000)
  {
    accountNumber: '50100492817482',
    maskedAccountNumber: '•••• 7482',
    ifsc: 'HDFC0000492',
    bankName: 'HDFC Bank',
    accountHolderName: 'Poornatejas',
    upiId: 'poornatejas@okhdfcbank',
    accountType: 'SAVINGS' as const,
    balance: 10000.00,
    currency: 'INR',
    upiPin: '1234',
    isPrimaryUser: true,
  },
  // 2. Merchant 1: Amazon India Marketplace
  {
    accountNumber: '000205018472',
    maskedAccountNumber: '•••• 8472',
    ifsc: 'ICIC0000002',
    bankName: 'ICICI Bank',
    accountHolderName: 'Amazon Pay India',
    upiId: 'amazonpay@apl',
    accountType: 'MERCHANT' as const,
    balance: 1540000.00,
    currency: 'INR',
    isPrimaryUser: false,
    merchantCategory: 'Shopping & Discretionary',
    mcc: '5311',
    theme: 'E-Commerce & Retail Shopping',
    themeIcon: '📦',
  },
  // 3. Merchant 2: Sri Krishna Iyengar Bakery & Sweets (Bakery / Small Shop)
  {
    accountNumber: '30194827104',
    maskedAccountNumber: '•••• 7104',
    ifsc: 'SBIN0004018',
    bankName: 'State Bank of India',
    accountHolderName: 'Iyengar Bakery & Sweets',
    upiId: 'iyengarbakery@paytm',
    accountType: 'MERCHANT' as const,
    balance: 32450.00,
    currency: 'INR',
    isPrimaryUser: false,
    merchantCategory: 'Dining & Nightlife',
    mcc: '5462',
    theme: 'Bakery & Fresh Confectionery',
    themeIcon: '🥖',
  },
  // 4. Merchant 3: Sri Lakshmi Kirana & General Stores (Kirana Store / Small Groceries)
  {
    accountNumber: '184729103847',
    maskedAccountNumber: '•••• 3847',
    ifsc: 'CNRB0001847',
    bankName: 'Canara Bank',
    accountHolderName: 'Sri Lakshmi Kirana Stores',
    upiId: 'lakshmikirana@upi',
    accountType: 'MERCHANT' as const,
    balance: 18200.00,
    currency: 'INR',
    isPrimaryUser: false,
    merchantCategory: 'Groceries',
    mcc: '5411',
    theme: 'Groceries & Daily Essentials',
    themeIcon: '🥦',
  },
  // 5. Merchant 4: Chai Point & Snacks Corner (Small Tea Stall & Snacks)
  {
    accountNumber: '918274019283',
    maskedAccountNumber: '•••• 9283',
    ifsc: 'UTIB0000192',
    bankName: 'Axis Bank',
    accountHolderName: 'Chai Point & Snacks',
    upiId: 'chaipoint@axl',
    accountType: 'MERCHANT' as const,
    balance: 9120.00,
    currency: 'INR',
    isPrimaryUser: false,
    merchantCategory: 'Dining & Nightlife',
    mcc: '5814',
    theme: 'Tea Stall & Quick Snacks',
    themeIcon: '☕',
  },
  // 6. Merchant 5: Sri Hanuman Hardware & Electricals (Small Hardware / Repair Shop)
  {
    accountNumber: '048200210009',
    maskedAccountNumber: '•••• 0009',
    ifsc: 'PUNB0048200',
    bankName: 'Punjab National Bank',
    accountHolderName: 'Sri Hanuman Hardware',
    upiId: 'hanumanhardware@upi',
    accountType: 'MERCHANT' as const,
    balance: 45800.00,
    currency: 'INR',
    isPrimaryUser: false,
    merchantCategory: 'Housing & Utilities',
    mcc: '5251',
    theme: 'Hardware, Paints & Electricals',
    themeIcon: '🔧',
  },
  // 7. Personal Contact: Harsha Vardhan (P2P Transfer)
  {
    accountNumber: '201948291048',
    maskedAccountNumber: '•••• 1048',
    ifsc: 'SBIN0001928',
    bankName: 'State Bank of India',
    accountHolderName: 'Harsha Vardhan',
    upiId: 'harshavardhan@okaxis',
    accountType: 'SAVINGS' as const,
    balance: 5400.00,
    currency: 'INR',
    isPrimaryUser: false,
    merchantCategory: 'Reimbursement / Split',
    theme: 'Peer-to-Peer Split & Transfer',
    themeIcon: '🤝',
  },
];

// Ensure initial accounts exist in database
async function ensureAccountsSeeded() {
  const count = await BankAccountModel.countDocuments();
  if (count === 0) {
    await BankAccountModel.insertMany(INITIAL_BANK_ACCOUNTS);
  } else {
    // Ensure primary user exists
    const primary = await BankAccountModel.findOne({ isPrimaryUser: true });
    if (!primary) {
      await BankAccountModel.create(INITIAL_BANK_ACCOUNTS[0]);
    }
    // Ensure the 5 key merchants exist
    for (const acc of INITIAL_BANK_ACCOUNTS.slice(1)) {
      const exists = await BankAccountModel.findOne({ upiId: acc.upiId });
      if (!exists) {
        await BankAccountModel.create(acc);
      }
    }
  }
}

// 1. GET: Fetch User Primary Bank Account + 5 Merchant Accounts
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await ensureAccountsSeeded();

    const primaryAccount = await BankAccountModel.findOne({ isPrimaryUser: true }).lean();
    const merchants = await BankAccountModel.find({ accountType: 'MERCHANT' }).lean();
    const contacts = await BankAccountModel.find({ accountType: 'SAVINGS', isPrimaryUser: false }).lean();

    return NextResponse.json({
      success: true,
      primaryAccount: primaryAccount || INITIAL_BANK_ACCOUNTS[0],
      merchants,
      contacts,
    });
  } catch (err: any) {
    console.warn('Bank accounts database offline fallback:', err?.message);
    return NextResponse.json({
      success: true,
      isOffline: true,
      primaryAccount: INITIAL_BANK_ACCOUNTS[0],
      merchants: INITIAL_BANK_ACCOUNTS.filter(a => a.accountType === 'MERCHANT'),
      contacts: INITIAL_BANK_ACCOUNTS.filter(a => a.accountType === 'SAVINGS' && !a.isPrimaryUser),
    });
  }
}

// 2. POST: Reset accounts to initial state (e.g. restore ₹10,000 balance)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));

    if (body.action === 'reset_balance') {
      await BankAccountModel.updateOne(
        { isPrimaryUser: true },
        { $set: { balance: 10000.00 } }
      );
      return NextResponse.json({
        success: true,
        message: 'Primary account balance reset to ₹10,000.00',
        balance: 10000.00,
      });
    }

    if (body.action === 'reset_all') {
      await BankAccountModel.deleteMany({});
      await BankAccountModel.insertMany(INITIAL_BANK_ACCOUNTS);
      return NextResponse.json({
        success: true,
        message: 'Bank accounts reset with initial ₹10,000.00 user balance and 5 merchants',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
