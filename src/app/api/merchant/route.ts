import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BankAccountModel } from '@/models/BankAccount';
import { TransactionModel } from '@/models/Transaction';

const ROLE_VPA_MAP: Record<string, string> = {
  medical: 'citycaremedicals@okhdfcbank',
  college: 'xaviercollege@sbi',
};

// Generate realistic 12-digit UPI RRN
function generateUpiRrn(): string {
  const yearDigit = '6'; // 2026
  const dayOfYear = Math.floor(Math.random() * 365).toString().padStart(3, '0');
  const sequence = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${yearDigit}${dayOfYear}${sequence}`;
}

// 1. GET: Fetch merchant account details, total received money, and received payments stream
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'medical' or 'college'
    const upiId = searchParams.get('upiId') || (role ? ROLE_VPA_MAP[role] : null);
    const accountNumber = searchParams.get('accountNumber');

    await connectToDatabase();

    let query: any = {};
    if (upiId) {
      query = { upiId: new RegExp(`^${upiId}$`, 'i') };
    } else if (accountNumber) {
      query = { accountNumber };
    } else if (role === 'medical') {
      query = { upiId: 'citycaremedicals@okhdfcbank' };
    } else if (role === 'college') {
      query = { upiId: 'xaviercollege@sbi' };
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide role ("medical" or "college") or upiId parameter' },
        { status: 400 }
      );
    }

    let merchant = await BankAccountModel.findOne(query).lean();

    // Fallback if not yet seeded
    if (!merchant) {
      if (role === 'medical' || upiId?.includes('medical')) {
        merchant = await BankAccountModel.create({
          accountNumber: '50100492819283',
          maskedAccountNumber: '•••• 9283',
          ifsc: 'HDFC0000492',
          bankName: 'HDFC Bank',
          accountHolderName: 'City Care Medicals & Pharmacy',
          upiId: 'citycaremedicals@okhdfcbank',
          accountType: 'MERCHANT',
          balance: 0.00,
          currency: 'INR',
          upiPin: '1234',
          isPrimaryUser: false,
          merchantCategory: 'Healthcare',
          mcc: '5912',
          theme: 'Medical Shop & Pharmaceuticals',
          themeIcon: '💊',
        });
      } else if (role === 'college' || upiId?.includes('college')) {
        merchant = await BankAccountModel.create({
          accountNumber: '301948271928',
          maskedAccountNumber: '•••• 1928',
          ifsc: 'SBIN0002819',
          bankName: 'State Bank of India',
          accountHolderName: 'St. Xavier Engineering College',
          upiId: 'xaviercollege@sbi',
          accountType: 'MERCHANT',
          balance: 0.00,
          currency: 'INR',
          upiPin: '1234',
          isPrimaryUser: false,
          merchantCategory: 'Education & Learning',
          mcc: '8220',
          theme: 'Education College & Tuition Fees',
          themeIcon: '🎓',
        });
      }
    }

    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Merchant account not found' }, { status: 404 });
    }

    // Fetch all CREDIT transactions received by this merchant
    const transactions = await TransactionModel.find({
      accountId: merchant.accountNumber,
      amount: { $gt: 0 },
    })
      .sort({ timestamp: -1 })
      .lean();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayReceived = transactions
      .filter((t: any) => new Date(t.timestamp) >= startOfToday)
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    const totalReceived = Math.max(
      merchant.balance,
      transactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
    );

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant._id,
        accountNumber: merchant.accountNumber,
        maskedAccountNumber: merchant.maskedAccountNumber,
        bankName: merchant.bankName,
        ifsc: merchant.ifsc,
        accountHolderName: merchant.accountHolderName,
        upiId: merchant.upiId,
        balance: merchant.balance,
        currency: merchant.currency || 'INR',
        merchantCategory: merchant.merchantCategory,
        theme: merchant.theme,
        themeIcon: merchant.themeIcon,
      },
      totalReceived,
      todayReceived,
      transactionCount: transactions.length,
      transactions: transactions.map((t: any) => ({
        id: t._id,
        amount: Math.abs(t.amount),
        customerName: t.payeeName || 'Customer',
        timestamp: t.timestamp,
        upiRrn: t.upiRrn || 'N/A',
        remark: t.remark || 'UPI Payment Received',
        bankCode: t.bankCode || 'UPI',
        rawDescription: t.rawDescription,
      })),
      qrPayload: `upi://pay?pa=${merchant.upiId}&pn=${encodeURIComponent(merchant.accountHolderName)}&cu=INR`,
    });
  } catch (err: any) {
    console.error('Error fetching merchant data:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch merchant data' }, { status: 500 });
  }
}

// 2. POST: Simulate or record a customer payment directly to this merchant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, upiId, amount = 350, customerName = 'Kotresh C', note = 'Medicine bill payment' } = body;

    const targetUpi = upiId || (role ? ROLE_VPA_MAP[role] : 'citycaremedicals@okhdfcbank');
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    await connectToDatabase();

    const merchant = await BankAccountModel.findOne({ upiId: new RegExp(`^${targetUpi}$`, 'i') });
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
    }

    // Credit merchant balance
    merchant.balance = Math.round((merchant.balance + numAmount) * 100) / 100;
    await merchant.save();

    // Create CREDIT transaction entry
    const rrn = generateUpiRrn();
    const tx = await TransactionModel.create({
      accountId: merchant.accountNumber,
      timestamp: new Date(),
      rawDescription: `UPI/P2M/${customerName.toUpperCase()}/${rrn}/${merchant.bankName.slice(0, 4)}`,
      amount: numAmount,
      currency: 'INR',
      txMode: 'UPI',
      upiRrn: rrn,
      payeeName: customerName,
      cleanMerchant: customerName,
      bankCode: 'UPI',
      vpaHandle: `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`,
      remark: note,
      accountType: 'Personal',
      direction: 'CREDIT',
      theme: 'Customer Payment Received',
      themeIcon: '💰',
      category: 'Income',
      tier: 'Income',
      isRecurring: false,
      isInternalTransfer: false,
      isRefundOrReversal: false,
      confidenceScore: 100,
      userOverridden: false,
    });

    return NextResponse.json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} received successfully!`,
      newBalance: merchant.balance,
      rrn,
      transaction: {
        id: tx._id,
        amount: numAmount,
        customerName,
        timestamp: tx.timestamp,
        upiRrn: rrn,
        remark: note,
      },
    });
  } catch (err: any) {
    console.error('Error simulating merchant payment:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to simulate payment' }, { status: 500 });
  }
}
