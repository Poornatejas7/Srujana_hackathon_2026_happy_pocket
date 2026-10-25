import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsAndPreferences } from '@/lib/insightsDataHelper';
import {
  detectRecurringSubscriptions,
  analyzeDiscretionarySpending,
  calculateOverviewMetrics,
  calculateEmergencyFundPlan,
  calculateHealthInsurancePlan,
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

    const overview = calculateOverviewMetrics(
      transactions,
      discretionaryAnalyses,
      subscriptions,
      isDemoData
    );

    const emergencyFund = calculateEmergencyFundPlan(
      overview.essentialExpenses || 24000,
      preferences?.emergencyFundMonths || 6,
      preferences?.currentEmergencySavings || 45000,
      overview.potentialMonthlySavings || 2500
    );

    const healthInsurance = calculateHealthInsurancePlan(
      preferences?.healthInsuranceAllocation || 1200
    );

    return NextResponse.json({
      success: true,
      database: dbStatus,
      isDemoData,
      overview,
      emergencyFund,
      healthInsurance,
      activeSubscriptionsCount: subscriptions.filter((s) => s.status !== 'Dismissed').length,
      discretionaryCategoriesCount: discretionaryAnalyses.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in GET /api/insights/overview:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch financial overview' },
      { status: 500 }
    );
  }
}
