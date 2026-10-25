import { connectToDatabase } from '@/lib/mongodb';
import { TransactionModel } from '@/models/Transaction';
import { UserFinancialPreferencesModel } from '@/models/UserFinancialPreferences';
import { DEMO_TRANSACTIONS } from '@/data/demoInsightsData';
import { TransactionLike } from './insightsEngine';

export interface IUserPreferencesData {
  categoryReductionTargets?: Record<string, number>;
  emergencyFundMonths?: number;
  currentEmergencySavings?: number;
  healthInsuranceAllocation?: number;
  dismissedInsightIds?: string[];
  reviewedInsightIds?: string[];
  reviewedSubscriptionIds?: Record<string, 'necessary' | 'unnecessary' | 'dismissed'>;
}

export async function getTransactionsAndPreferences(
  userId: string = 'acc_primary_sbi',
  forceDemo: boolean = false
): Promise<{
  transactions: TransactionLike[];
  preferences: IUserPreferencesData;
  isDemoData: boolean;
  dbStatus: string;
}> {
  const defaultPrefs: IUserPreferencesData = {
    categoryReductionTargets: {
      'Bakery items & snacks': 0.25,
      'Frequent food delivery': 0.25,
      'Restaurants & dining out': 0.25,
      'Gaming & entertainment': 0.25,
      'Shopping & impulse purchases': 0.25,
    },
    emergencyFundMonths: 6,
    currentEmergencySavings: 45000,
    healthInsuranceAllocation: 1200,
    dismissedInsightIds: [],
    reviewedInsightIds: [],
    reviewedSubscriptionIds: {},
  };

  // If explicitly requested demo mode
  if (forceDemo) {
    return {
      transactions: DEMO_TRANSACTIONS,
      preferences: defaultPrefs,
      isDemoData: true,
      dbStatus: 'Demo Mode (Curated Dataset)',
    };
  }

  try {
    await connectToDatabase();

    // Fetch user preferences
    const rawPrefs = await UserFinancialPreferencesModel.findOne({ userId }).lean();
    const prefsDoc: IUserPreferencesData = rawPrefs
      ? {
          categoryReductionTargets: rawPrefs.categoryReductionTargets
            ? (rawPrefs.categoryReductionTargets as Record<string, number>)
            : defaultPrefs.categoryReductionTargets,
          emergencyFundMonths: rawPrefs.emergencyFundMonths ?? defaultPrefs.emergencyFundMonths,
          currentEmergencySavings:
            rawPrefs.currentEmergencySavings ?? defaultPrefs.currentEmergencySavings,
          healthInsuranceAllocation:
            rawPrefs.healthInsuranceAllocation ?? defaultPrefs.healthInsuranceAllocation,
          dismissedInsightIds: rawPrefs.dismissedInsightIds || [],
          reviewedInsightIds: rawPrefs.reviewedInsightIds || [],
          reviewedSubscriptionIds:
            (rawPrefs.reviewedSubscriptionIds as Record<string, 'necessary' | 'unnecessary' | 'dismissed'>) ||
            {},
        }
      : defaultPrefs;

    // Fetch real transactions from MongoDB Atlas
    const dbTxs = await TransactionModel.find({
      $or: [{ accountId: userId }, { accountId: { $exists: true } }],
    })
      .sort({ timestamp: -1 })
      .limit(300)
      .lean();

    // If real database has sufficient records, use real transactions
    if (dbTxs && dbTxs.length >= 3) {
      const sanitized: TransactionLike[] = dbTxs.map((t: any) => ({
        id: (t._id || t.id).toString(),
        accountId: (t.accountId || userId) as string,
        timestamp: t.timestamp,
        rawDescription: t.rawDescription as string,
        amount: Number(t.amount) || 0,
        currency: (t.currency || 'INR') as string,
        txMode: (t.txMode || 'UPI') as string,
        upiRrn: t.upiRrn as string,
        payeeName: t.payeeName as string,
        cleanMerchant: (t.cleanMerchant || t.payeeName) as string,
        accountType: (t.accountType || 'Personal') as string,
        direction: (t.direction || (Number(t.amount) > 0 ? 'CREDIT' : 'DEBIT')) as string,
        theme: t.theme as string,
        themeIcon: t.themeIcon as string,
        category: t.category as string,
        discretionarySubcategory: t.discretionarySubcategory as string,
        tier: t.tier as string,
        isRecurring: Boolean(t.isRecurring),
        isInternalTransfer: Boolean(t.isInternalTransfer),
        isRefundOrReversal: Boolean(t.isRefundOrReversal),
        netOutflowAmount: t.netOutflowAmount !== undefined ? Number(t.netOutflowAmount) : Math.abs(Number(t.amount) || 0),
        confidenceScore: Number(t.confidenceScore) || 85,
        isAmbiguous: Boolean(t.isAmbiguous),
        needsReview: Boolean(t.needsReview),
        userOverridden: Boolean(t.userOverridden),
        remark: t.remark as string,
      }));

      return {
        transactions: sanitized,
        preferences: prefsDoc,
        isDemoData: false,
        dbStatus: 'MongoDB Atlas Connected',
      };
    }

    // Otherwise fall back to realistic demo transactions
    return {
      transactions: DEMO_TRANSACTIONS,
      preferences: prefsDoc,
      isDemoData: true,
      dbStatus: 'Demo Mode (Atlas database sparse)',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('MongoDB connection fallback to demo dataset:', errorMsg);
    return {
      transactions: DEMO_TRANSACTIONS,
      preferences: defaultPrefs,
      isDemoData: true,
      dbStatus: 'Offline Resilient (Demo Dataset)',
    };
  }
}
