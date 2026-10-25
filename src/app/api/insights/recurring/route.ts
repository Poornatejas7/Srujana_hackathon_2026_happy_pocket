import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsAndPreferences } from '@/lib/insightsDataHelper';
import { detectRecurringSubscriptions } from '@/lib/insightsEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'acc_primary_sbi';
    const demo = searchParams.get('demo') === 'true';

    const { transactions, preferences, isDemoData, dbStatus } =
      await getTransactionsAndPreferences(userId, demo);

    const userVerdicts = preferences?.reviewedSubscriptionIds || {};
    const subscriptions = detectRecurringSubscriptions(transactions, userVerdicts);

    const activeSubs = subscriptions.filter((s) => s.status !== 'Dismissed');
    const totalMonthlyCost = activeSubs.reduce((acc, s) => acc + s.estimatedMonthlyCost, 0);
    const totalAnnualCost = activeSubs.reduce((acc, s) => acc + s.estimatedAnnualCost, 0);
    const priceIncreases = subscriptions.filter((s) => s.isPriceIncrease);
    const duplicates = subscriptions.filter((s) => s.isDuplicateCandidate);

    return NextResponse.json({
      success: true,
      database: dbStatus,
      isDemoData,
      count: subscriptions.length,
      activeCount: activeSubs.length,
      totalMonthlyCost: Math.round(totalMonthlyCost),
      totalAnnualCost: Math.round(totalAnnualCost),
      priceIncreasesCount: priceIncreases.length,
      duplicatesCount: duplicates.length,
      subscriptions,
    });
  } catch (err: any) {
    console.error('Error in GET /api/insights/recurring:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to detect recurring subscriptions' },
      { status: 500 }
    );
  }
}
