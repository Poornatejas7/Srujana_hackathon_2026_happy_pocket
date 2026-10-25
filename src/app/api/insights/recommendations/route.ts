import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsAndPreferences } from '@/lib/insightsDataHelper';
import {
  detectRecurringSubscriptions,
  analyzeDiscretionarySpending,
  generateIntelligentInsights,
} from '@/lib/insightsEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'acc_primary_sbi';
    const demo = searchParams.get('demo') === 'true';

    const { transactions, preferences, isDemoData, dbStatus } =
      await getTransactionsAndPreferences(userId, demo);

    const userVerdicts = preferences?.reviewedSubscriptionIds || {};
    const subscriptions = detectRecurringSubscriptions(transactions, userVerdicts);

    const userReductionTargets = preferences?.categoryReductionTargets || {};
    const discretionaryAnalyses = analyzeDiscretionarySpending(transactions, userReductionTargets);

    const dismissedIds = preferences?.dismissedInsightIds || [];
    const recommendations = generateIntelligentInsights(
      transactions,
      subscriptions,
      discretionaryAnalyses,
      dismissedIds
    );

    return NextResponse.json({
      success: true,
      database: dbStatus,
      isDemoData,
      count: recommendations.length,
      recommendations,
    });
  } catch (err: any) {
    console.error('Error in GET /api/insights/recommendations:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
