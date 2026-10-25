import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsAndPreferences } from '@/lib/insightsDataHelper';
import { analyzeDiscretionarySpending } from '@/lib/insightsEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'acc_primary_sbi';
    const demo = searchParams.get('demo') === 'true';

    const { transactions, preferences, isDemoData, dbStatus } =
      await getTransactionsAndPreferences(userId, demo);

    const userReductionTargets = preferences?.categoryReductionTargets || {};
    const categories = analyzeDiscretionarySpending(transactions, userReductionTargets);

    const totalPotentialMonthlySavings = categories.reduce(
      (acc, c) => acc + c.potentialMonthlySavings,
      0
    );
    const totalPotentialAnnualSavings = totalPotentialMonthlySavings * 12;

    return NextResponse.json({
      success: true,
      database: dbStatus,
      isDemoData,
      count: categories.length,
      totalPotentialMonthlySavings,
      totalPotentialAnnualSavings,
      categories,
    });
  } catch (err: any) {
    console.error('Error in GET /api/insights/spending:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to analyze discretionary spending' },
      { status: 500 }
    );
  }
}
