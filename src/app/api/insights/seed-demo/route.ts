import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TransactionModel } from '@/models/Transaction';
import { DEMO_TRANSACTIONS } from '@/data/demoInsightsData';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Clear existing transactions if overwrite requested
    const { overwrite = false } = await req.json().catch(() => ({}));

    if (overwrite) {
      await TransactionModel.deleteMany({});
    }

    // Insert demo transactions with clean mapping
    const docs = DEMO_TRANSACTIONS.map((t) => ({
      accountId: t.accountId || 'acc_primary_sbi',
      timestamp: new Date(t.timestamp),
      rawDescription: t.rawDescription,
      amount: t.amount,
      currency: t.currency || 'INR',
      txMode: t.txMode || 'UPI',
      upiRrn: t.upiRrn,
      payeeName: t.payeeName,
      cleanMerchant: t.cleanMerchant,
      accountType: t.accountType || 'Personal',
      direction: t.direction || (t.amount > 0 ? 'CREDIT' : 'DEBIT'),
      theme: t.theme,
      themeIcon: t.themeIcon,
      category: t.category,
      tier: t.tier,
      isRecurring: t.isRecurring,
      isInternalTransfer: t.isInternalTransfer,
      isRefundOrReversal: t.isRefundOrReversal,
      netOutflowAmount: t.netOutflowAmount,
      confidenceScore: t.confidenceScore,
      isAmbiguous: t.isAmbiguous || false,
      needsReview: t.needsReview || false,
      remark: t.remark,
    }));

    const inserted = await TransactionModel.insertMany(docs, { ordered: false });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} realistic demo transactions into MongoDB Atlas`,
      count: inserted.length,
      database: 'happypocket',
      collection: 'transactions',
    });
  } catch (err: any) {
    console.error('Error seeding demo transactions:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to seed demo transactions into database',
      },
      { status: 500 }
    );
  }
}
