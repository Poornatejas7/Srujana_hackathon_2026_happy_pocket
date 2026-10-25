/**
 * Happy Pocket Financial Insights & Anti-Distortion Savings Engine
 * Implements rule-based intelligence, recurrence detection, discretionary analysis,
 * actuarial compound growth projections, and financial protection calculations.
 */

export interface TransactionLike {
  id?: string;
  _id?: string | { toString(): string };
  accountId?: string;
  timestamp?: string | Date;
  rawDescription?: string;
  amount: number;
  currency?: string;
  txMode?: string;
  upiRrn?: string;
  payeeName?: string;
  cleanMerchant?: string;
  accountType?: 'Merchant / Business' | 'Personal' | string;
  direction?: 'DEBIT' | 'CREDIT' | string;
  theme?: string;
  themeIcon?: string;
  category?: string;
  discretionarySubcategory?: string;
  tier?: string;
  isRecurring?: boolean;
  isInternalTransfer?: boolean;
  isRefundOrReversal?: boolean;
  netOutflowAmount?: number;
  confidenceScore?: number;
  isAmbiguous?: boolean;
  needsReview?: boolean;
  userOverridden?: boolean;
  remark?: string;
}

export interface OverviewMetrics {
  totalSpendingThisMonth: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  recurringMonthlyPayments: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  totalIncomeThisMonth: number;
  netSavingsCapacity: number;
  internalTransfersExcluded: number;
  refundsNetted: number;
  transactionCount: number;
  activeSubscriptionsCount: number;
  isDemoData: boolean;
}

export interface DetectedSubscription {
  id: string;
  merchantName: string;
  amount: number;
  frequency: 'monthly' | 'annual' | 'weekly';
  estimatedMonthlyCost: number;
  estimatedAnnualCost: number;
  lastPaymentDate: string;
  predictedNextPaymentDate: string;
  confidence: number;
  status: 'Active candidate' | 'Needs confirmation' | 'Dismissed';
  userVerdict?: 'necessary' | 'unnecessary' | 'dismissed';
  isPriceIncrease: boolean;
  previousAmount?: number;
  priceIncreasePercent?: number;
  isDuplicateCandidate: boolean;
  duplicateWith?: string;
  category: string;
  themeIcon: string;
  evidence: string;
  transactionIds: string[];
}

export interface DiscretionaryCategoryAnalysis {
  categoryName: string;
  themeIcon: string;
  totalLast30Days: number;
  totalLast90Days: number;
  averageMonthlySpending: number;
  transactionCount: number;
  percentageOfTotal: number;
  spendingTrendPercent: number; // positive = increased vs prior period
  selectedReductionPercent: number; // e.g. 25, 50, 100
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  suggested25: number;
  suggested50: number;
  suggested100: number;
  isConfirmedByUser: boolean;
  clarificationNeeded?: boolean;
}

export interface IntelligentInsight {
  id: string;
  insightType:
    | 'RECURRING_SUBSCRIPTION'
    | 'FREQUENT_PURCHASE'
    | 'PRICE_INCREASE'
    | 'SPENDING_TREND'
    | 'DUPLICATE_SUBSCRIPTION'
    | 'UNUSUAL_EXPENSE'
    | 'SAVINGS_OPPORTUNITY';
  title: string;
  description: string;
  category: string;
  observedAmount: number;
  estimatedMonthlyAmount: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  confidence: number;
  evidence: string;
  suggestedAction: string;
  status: 'active' | 'reviewed' | 'dismissed';
  transactionIds: string[];
  badgeColor?: string;
}

export interface InvestmentProjectionPoint {
  year: number;
  month: number;
  totalInvested: number;
  futureValue: number;
  wealthCreated: number;
}

export interface EmergencyFundAnalysis {
  essentialMonthlyExpenses: number;
  targetMonths: number;
  emergencyFundTarget: number;
  currentEmergencySavings: number;
  remainingTarget: number;
  fundingProgressPercent: number;
  estimatedMonthsToTarget: number; // based on potential savings
}

export interface HealthInsuranceAnalysis {
  allocatedMonthlyPremium: number;
  recommendedSumAssured: number;
  annualPremium: number;
  taxSection80DBenefit: number;
  guidelinesSummary: string;
}

// =========================================================================
// 1. COMPOUND GROWTH MATHEMATICAL SIMULATOR
// Formula: FV = P * ((1 + r)^n - 1) / r
// When r = 0: FV = P * n
// =========================================================================
export function calculateInvestmentProjection(
  monthlyContribution: number,
  years: number,
  annualReturnRatePercent: number
): {
  totalInvested: number;
  futureValue: number;
  wealthCreated: number;
  projectionPoints: InvestmentProjectionPoint[];
  monthlyRate: number;
} {
  const P = Math.max(0, monthlyContribution);
  const n = Math.max(1, Math.min(30, years)) * 12;
  const annualRate = Math.max(0, annualReturnRatePercent);
  const r = annualRate / 100 / 12;

  let futureValue = 0;
  if (r === 0) {
    futureValue = P * n;
  } else {
    futureValue = P * ((Math.pow(1 + r, n) - 1) / r);
  }

  const totalInvested = P * n;
  const wealthCreated = Math.max(0, futureValue - totalInvested);

  // Generate annual plot points for Recharts area / line chart
  const projectionPoints: InvestmentProjectionPoint[] = [];
  const totalYears = Math.max(1, Math.min(30, years));

  // Year 0 starting point
  projectionPoints.push({
    year: 0,
    month: 0,
    totalInvested: 0,
    futureValue: 0,
    wealthCreated: 0,
  });

  for (let y = 1; y <= totalYears; y++) {
    const months = y * 12;
    const invested = P * months;
    let fv = 0;
    if (r === 0) {
      fv = invested;
    } else {
      fv = P * ((Math.pow(1 + r, months) - 1) / r);
    }

    projectionPoints.push({
      year: y,
      month: months,
      totalInvested: Math.round(invested),
      futureValue: Math.round(fv),
      wealthCreated: Math.round(Math.max(0, fv - invested)),
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(futureValue),
    wealthCreated: Math.round(wealthCreated),
    projectionPoints,
    monthlyRate: r,
  };
}

// =========================================================================
// 2. KNOWN SUBSCRIPTION & RECURRING CATALOG (Indian Fintech NPCI Reference)
// =========================================================================
const KNOWN_SUBSCRIPTION_SERVICES: Record<
  string,
  {
    category: string;
    themeIcon: string;
    serviceType: 'streaming' | 'music' | 'gaming' | 'membership' | 'cloud' | 'news';
  }
> = {
  netflix: { category: 'Subscriptions & Digital', themeIcon: '🍿', serviceType: 'streaming' },
  spotify: { category: 'Subscriptions & Digital', themeIcon: '🎵', serviceType: 'music' },
  'youtube premium': { category: 'Subscriptions & Digital', themeIcon: '▶️', serviceType: 'music' },
  'amazon prime': { category: 'Subscriptions & Digital', themeIcon: '📦', serviceType: 'streaming' },
  hotstar: { category: 'Subscriptions & Digital', themeIcon: '⭐', serviceType: 'streaming' },
  'disney+ hotstar': { category: 'Subscriptions & Digital', themeIcon: '⭐', serviceType: 'streaming' },
  'apple icloud': { category: 'Subscriptions & Digital', themeIcon: '☁️', serviceType: 'cloud' },
  'google one': { category: 'Subscriptions & Digital', themeIcon: '☁️', serviceType: 'cloud' },
  'cult.fit': { category: 'Health & Fitness', themeIcon: '🏋️', serviceType: 'membership' },
  'chatgpt plus': { category: 'Subscriptions & Digital', themeIcon: '🤖', serviceType: 'cloud' },
  'claude ai': { category: 'Subscriptions & Digital', themeIcon: '🧠', serviceType: 'cloud' },
  playstation: { category: 'Shopping & Discretionary', themeIcon: '🎮', serviceType: 'gaming' },
  'xbox game pass': { category: 'Shopping & Discretionary', themeIcon: '🎮', serviceType: 'gaming' },
};

// =========================================================================
// 3. RECURRING SUBSCRIPTION DETECTOR
// =========================================================================
export function detectRecurringSubscriptions(
  transactions: TransactionLike[],
  userVerdicts: Record<string, 'necessary' | 'unnecessary' | 'dismissed'> = {}
): DetectedSubscription[] {
  // Filter out internal transfers and credit transactions
  const debits = transactions.filter(
    (t) =>
      !t.isInternalTransfer &&
      t.amount < 0 &&
      t.tier !== 'Transfer_or_Offset' &&
      t.category !== 'Internal Transfer'
  );

  // Group debits by clean merchant or payee
  const grouped: Record<string, TransactionLike[]> = {};
  debits.forEach((t) => {
    const rawKey = (t.cleanMerchant || t.payeeName || t.rawDescription || 'Unknown').trim();
    const key = rawKey.toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const detected: DetectedSubscription[] = [];

  Object.entries(grouped).forEach(([key, txList]) => {
    // Sort transactions by timestamp ascending
    const sorted = [...txList].sort(
      (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );

    const latest = sorted[sorted.length - 1];
    const merchantName = latest.cleanMerchant || latest.payeeName || 'Unknown Merchant';
    const absLatestAmount = Math.abs(latest.amount);

    // Check if known subscription or explicitly marked recurring or has multiple repeated records
    const isKnown = Object.keys(KNOWN_SUBSCRIPTION_SERVICES).some((s) => key.includes(s));
    const isMarkedRecurring = sorted.some((t) => t.isRecurring);
    const hasRepeatedCadence = sorted.length >= 2;

    if (!isKnown && !isMarkedRecurring && !hasRepeatedCadence) {
      return;
    }

    // Determine cadence (monthly vs annual)
    let frequency: 'monthly' | 'annual' | 'weekly' = 'monthly';
    let estimatedMonthlyCost = absLatestAmount;
    let estimatedAnnualCost = absLatestAmount * 12;

    if (sorted.length >= 2) {
      const t1 = new Date(sorted[sorted.length - 2].timestamp || 0).getTime();
      const t2 = new Date(sorted[sorted.length - 1].timestamp || 0).getTime();
      const diffDays = Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));

      if (diffDays >= 300) {
        frequency = 'annual';
        estimatedMonthlyCost = Math.round((absLatestAmount / 12) * 100) / 100;
        estimatedAnnualCost = absLatestAmount;
      } else if (diffDays <= 10) {
        frequency = 'weekly';
        estimatedMonthlyCost = Math.round(absLatestAmount * 4.33);
        estimatedAnnualCost = Math.round(absLatestAmount * 52);
      }
    } else if (absLatestAmount >= 1200 && key.includes('annual')) {
      frequency = 'annual';
      estimatedMonthlyCost = Math.round((absLatestAmount / 12) * 100) / 100;
      estimatedAnnualCost = absLatestAmount;
    }

    // Check Price Increase
    let isPriceIncrease = false;
    let previousAmount: number | undefined;
    let priceIncreasePercent: number | undefined;

    if (sorted.length >= 2) {
      const prevAmount = Math.abs(sorted[sorted.length - 2].amount);
      if (absLatestAmount > prevAmount && prevAmount > 0) {
        isPriceIncrease = true;
        previousAmount = prevAmount;
        priceIncreasePercent = Math.round(((absLatestAmount - prevAmount) / prevAmount) * 100);
      }
    }

    // Predict Next Payment Date
    const lastDate = new Date(latest.timestamp || Date.now());
    const nextDate = new Date(lastDate);
    if (frequency === 'annual') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else if (frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    // Match Theme Icon
    let themeIcon = latest.themeIcon || '🔄';
    let serviceCategory = latest.category || 'Subscriptions & Digital';
    for (const [subKey, meta] of Object.entries(KNOWN_SUBSCRIPTION_SERVICES)) {
      if (key.includes(subKey)) {
        themeIcon = meta.themeIcon;
        serviceCategory = meta.category;
        break;
      }
    }

    // Calculate Confidence
    let confidence = 75;
    if (isKnown) confidence += 15;
    if (sorted.length >= 2) confidence += 8;
    confidence = Math.min(99, confidence);

    const subId = `sub_${key.replace(/[^a-z0-9]/g, '_')}`;
    const userVerdict = userVerdicts[subId] || userVerdicts[merchantName.toLowerCase()];

    let status: DetectedSubscription['status'] = 'Active candidate';
    if (userVerdict === 'dismissed') {
      status = 'Dismissed';
    } else if (confidence < 80) {
      status = 'Needs confirmation';
    }

    detected.push({
      id: subId,
      merchantName,
      amount: absLatestAmount,
      frequency,
      estimatedMonthlyCost,
      estimatedAnnualCost,
      lastPaymentDate: lastDate.toISOString(),
      predictedNextPaymentDate: nextDate.toISOString(),
      confidence,
      status,
      userVerdict,
      isPriceIncrease,
      previousAmount,
      priceIncreasePercent,
      isDuplicateCandidate: false,
      category: serviceCategory,
      themeIcon,
      evidence: `${sorted.length} transactions recorded (${frequency}) • Last charge: ₹${absLatestAmount.toLocaleString('en-IN')}`,
      transactionIds: sorted.map((t) => (t._id || t.id || '').toString()),
    });
  });

  // Check Duplicate Subscriptions (e.g. Spotify and YouTube Premium both active in music streaming)
  const musicSubs = detected.filter((d) =>
    ['spotify', 'youtube', 'apple music', 'amazon music', 'gaana', 'wynk'].some((m) =>
      d.merchantName.toLowerCase().includes(m)
    )
  );
  if (musicSubs.length >= 2) {
    musicSubs.forEach((sub, idx) => {
      sub.isDuplicateCandidate = true;
      const other = musicSubs.find((_, i) => i !== idx);
      if (other) {
        sub.duplicateWith = other.merchantName;
      }
    });
  }

  return detected;
}

// =========================================================================
// 4. DISCRETIONARY SPENDING ANALYZER
// Categories from Prompt Section 4:
// - Bakery items & snacks
// - Frequent food delivery
// - Restaurants & dining out
// - Alcohol-related purchases
// - Cigarettes & tobacco
// - Gaming & entertainment
// - Shopping & impulse purchases
// - Unused subscriptions
// - Other user-selected discretionary
// =========================================================================
export const DISCRETIONARY_CATEGORIES_CONFIG: Array<{
  name: string;
  themeIcon: string;
  keywords: string[];
  defaultReduction: number;
}> = [
  {
    name: 'Bakery items & snacks',
    themeIcon: '🥐',
    keywords: ['bakery', 'tea', 'chai', 'snack', 'theobroma', 'iyengar', 'haldiram', 'sweet', 'biscuit', 'puff', 'cookie'],
    defaultReduction: 25,
  },
  {
    name: 'Frequent food delivery',
    themeIcon: '🛵',
    keywords: ['swiggy', 'zomato', 'eatclub', 'magicpin', 'dunzo', 'zepto cafe'],
    defaultReduction: 25,
  },
  {
    name: 'Restaurants & dining out',
    themeIcon: '🍽️',
    keywords: ['restaurant', 'dining', 'brewery', 'pub', 'cafe', 'barbeque', 'toit', 'meghana', 'truffles', 'bistro'],
    defaultReduction: 25,
  },
  {
    name: 'Gaming & entertainment',
    themeIcon: '🎮',
    keywords: ['steam', 'playstation', 'xbox', 'nintendo', 'bookmyshow', 'pvr', 'inox', 'cinema', 'games'],
    defaultReduction: 25,
  },
  {
    name: 'Shopping & impulse purchases',
    themeIcon: '🛍️',
    keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'ajio', 'meesho', 'nykaa', 'croma', 'retail'],
    defaultReduction: 25,
  },
  {
    name: 'Alcohol & nightlife',
    themeIcon: '🍸',
    keywords: ['liquor', 'wine', 'beer', 'spirits', 'tasmac', 'madhuloka', 'drops'],
    defaultReduction: 50,
  },
  {
    name: 'Cigarettes & tobacco',
    themeIcon: '🚬',
    keywords: ['tobacco', 'paan', 'smoke', 'cigar'],
    defaultReduction: 50,
  },
  {
    name: 'Unused subscriptions',
    themeIcon: '📺',
    keywords: ['netflix', 'spotify', 'hotstar', 'prime', 'subscription', 'youtube premium', 'icloud'],
    defaultReduction: 50,
  },
];

export function analyzeDiscretionarySpending(
  transactions: TransactionLike[],
  userTargets: Record<string, number> = {}
): DiscretionaryCategoryAnalysis[] {
  const debits = transactions.filter(
    (t) =>
      !t.isInternalTransfer &&
      t.amount < 0 &&
      t.tier !== 'Transfer_or_Offset' &&
      t.tier !== 'Essential' &&
      t.category !== 'Housing & Utilities' &&
      t.category !== 'Groceries' &&
      t.category !== 'Healthcare'
  );

  const now = Date.now();
  const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;
  const MS_90_DAYS = 90 * 24 * 60 * 60 * 1000;

  // Total discretionary spend to compute percentage shares
  const totalDiscretionaryOutflow = debits.reduce((acc, t) => acc + Math.abs(t.amount), 0) || 1;

  const results: DiscretionaryCategoryAnalysis[] = DISCRETIONARY_CATEGORIES_CONFIG.map((cfg) => {
    // Find matching transactions
    const matched = debits.filter((t) => {
      if (t.discretionarySubcategory === cfg.name) return true;
      const combined = `${t.cleanMerchant || ''} ${t.payeeName || ''} ${t.rawDescription || ''} ${t.theme || ''}`.toLowerCase();
      return cfg.keywords.some((kw) => combined.includes(kw));
    });

    const txs30d = matched.filter((t) => {
      const d = new Date(t.timestamp || 0).getTime();
      return now - d <= MS_30_DAYS;
    });

    const txs90d = matched.filter((t) => {
      const d = new Date(t.timestamp || 0).getTime();
      return now - d <= MS_90_DAYS;
    });

    // Previous 30-day block (31 to 60 days ago) for spending trend calculation
    const txsPrev30d = matched.filter((t) => {
      const d = new Date(t.timestamp || 0).getTime();
      return now - d > MS_30_DAYS && now - d <= 2 * MS_30_DAYS;
    });

    const total30 = txs30d.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const total90 = txs90d.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const prev30 = txsPrev30d.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const averageMonthly = total90 > 0 ? Math.round(total90 / 3) : Math.round(total30);

    let trendPercent = 0;
    if (prev30 > 0) {
      trendPercent = Math.round(((total30 - prev30) / prev30) * 100);
    } else if (total30 > 0) {
      trendPercent = 25; // baseline emerging category
    }

    const selectedReductionPercent =
      userTargets[cfg.name] !== undefined
        ? Math.round(userTargets[cfg.name] * 100)
        : cfg.defaultReduction;

    const potentialMonthlySavings = Math.round(averageMonthly * (selectedReductionPercent / 100));
    const potentialAnnualSavings = potentialMonthlySavings * 12;

    const percentageOfTotal = Math.round((averageMonthly / totalDiscretionaryOutflow) * 100);

    return {
      categoryName: cfg.name,
      themeIcon: cfg.themeIcon,
      totalLast30Days: Math.round(total30),
      totalLast90Days: Math.round(total90),
      averageMonthlySpending: averageMonthly,
      transactionCount: matched.length,
      percentageOfTotal: Math.min(100, Math.max(0, percentageOfTotal)),
      spendingTrendPercent: trendPercent,
      selectedReductionPercent,
      potentialMonthlySavings,
      potentialAnnualSavings,
      suggested25: Math.round(averageMonthly * 0.25),
      suggested50: Math.round(averageMonthly * 0.5),
      suggested100: Math.round(averageMonthly * 1.0),
      isConfirmedByUser: userTargets[cfg.name] !== undefined,
    };
  });

  // Filter out categories with zero spend unless configured
  return results.filter((r) => r.averageMonthlySpending > 0 || r.totalLast30Days > 0);
}

// =========================================================================
// 5. FINANCIAL OVERVIEW DASHBOARD METRICS
// =========================================================================
export function calculateOverviewMetrics(
  transactions: TransactionLike[],
  discretionaryAnalyses: DiscretionaryCategoryAnalysis[],
  subscriptions: DetectedSubscription[],
  isDemoData: boolean = false
): OverviewMetrics {
  let totalSpendingThisMonth = 0;
  let essentialExpenses = 0;
  let discretionaryExpenses = 0;
  let totalIncomeThisMonth = 0;
  let internalTransfersExcluded = 0;
  let refundsNetted = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  transactions.forEach((t) => {
    const d = new Date(t.timestamp || Date.now());
    const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;

    // Check internal transfers: NEVER count as living spending
    if (t.isInternalTransfer || t.category === 'Internal Transfer' || t.tier === 'Transfer_or_Offset') {
      internalTransfersExcluded += Math.abs(t.amount);
      return;
    }

    // Check refunds/reversals: net against spend
    if (t.isRefundOrReversal || (t.amount > 0 && t.category === 'Reimbursement / Split')) {
      refundsNetted += t.amount;
      return;
    }

    // Income
    if (t.amount > 0 && (t.direction === 'CREDIT' || t.category === 'Income' || t.tier === 'Income')) {
      if (isThisMonth || transactions.length < 20) {
        totalIncomeThisMonth += t.amount;
      }
      return;
    }

    // Outflow / Debit
    if (t.amount < 0) {
      const absAmount = Math.abs(t.amount);
      if (isThisMonth || transactions.length < 20) {
        totalSpendingThisMonth += absAmount;

        const isEssential =
          t.tier === 'Essential' ||
          t.category === 'Housing & Utilities' ||
          t.category === 'Groceries' ||
          t.category === 'Healthcare' ||
          t.category === 'Transport & Fuel';

        if (isEssential) {
          essentialExpenses += absAmount;
        } else {
          discretionaryExpenses += absAmount;
        }
      }
    }
  });

  // Net refunds against total spend
  if (refundsNetted > 0) {
    totalSpendingThisMonth = Math.max(0, totalSpendingThisMonth - refundsNetted);
    discretionaryExpenses = Math.max(0, discretionaryExpenses - refundsNetted);
  }

  // Active Recurring Monthly Payments
  const recurringMonthlyPayments = subscriptions
    .filter((s) => s.status !== 'Dismissed')
    .reduce((sum, s) => sum + s.estimatedMonthlyCost, 0);

  // Potential Monthly Savings from Discretionary Reductions
  const potentialMonthlySavingsFromDiscretionary = discretionaryAnalyses.reduce(
    (sum, a) => sum + a.potentialMonthlySavings,
    0
  );

  // Subscriptions marked unnecessary by user
  const unnecessarySubscriptionsSavings = subscriptions
    .filter((s) => s.userVerdict === 'unnecessary')
    .reduce((sum, s) => sum + s.estimatedMonthlyCost, 0);

  const potentialMonthlySavings = Math.round(
    potentialMonthlySavingsFromDiscretionary + unnecessarySubscriptionsSavings
  );
  const potentialAnnualSavings = potentialMonthlySavings * 12;

  const netSavingsCapacity = Math.max(0, totalIncomeThisMonth - totalSpendingThisMonth);

  return {
    totalSpendingThisMonth: Math.round(totalSpendingThisMonth),
    essentialExpenses: Math.round(essentialExpenses),
    discretionaryExpenses: Math.round(discretionaryExpenses),
    recurringMonthlyPayments: Math.round(recurringMonthlyPayments),
    potentialMonthlySavings,
    potentialAnnualSavings,
    totalIncomeThisMonth: Math.round(totalIncomeThisMonth),
    netSavingsCapacity: Math.round(netSavingsCapacity),
    internalTransfersExcluded: Math.round(internalTransfersExcluded),
    refundsNetted: Math.round(refundsNetted),
    transactionCount: transactions.length,
    activeSubscriptionsCount: subscriptions.filter((s) => s.status !== 'Dismissed').length,
    isDemoData,
  };
}

// =========================================================================
// 6. RULE-BASED FINANCIAL RECOMMENDATIONS ENGINE
// Prompt Section 5:
// A. Recurring subscriptions
// B. Frequent purchases
// C. Price increase
// D. Spending trend
// E. Possible duplicate subscription
// F. Unusual expense
// =========================================================================
export function generateIntelligentInsights(
  transactions: TransactionLike[],
  subscriptions: DetectedSubscription[],
  discretionaryAnalyses: DiscretionaryCategoryAnalysis[],
  dismissedIds: string[] = []
): IntelligentInsight[] {
  const insights: IntelligentInsight[] = [];
  const dismissedSet = new Set(dismissedIds);

  // ----------------------------------------------------
  // RULE A: Recurring Subscriptions Summary
  // ----------------------------------------------------
  const activeSubs = subscriptions.filter((s) => s.status !== 'Dismissed');
  if (activeSubs.length > 0) {
    const totalMonthly = Math.round(activeSubs.reduce((acc, s) => acc + s.estimatedMonthlyCost, 0));
    const id = 'insight_rule_a_recurring_summary';
    if (!dismissedSet.has(id)) {
      insights.push({
        id,
        insightType: 'RECURRING_SUBSCRIPTION',
        title: `${activeSubs.length} Active Recurring Subscriptions Detected`,
        description: `You are spending ₹${totalMonthly.toLocaleString('en-IN')} per month across ${activeSubs.length} recurring services (${activeSubs.map((s) => s.merchantName).join(', ')}). Review whether all are still actively used.`,
        category: 'Subscriptions & Digital',
        observedAmount: totalMonthly,
        estimatedMonthlyAmount: totalMonthly,
        potentialMonthlySavings: Math.round(totalMonthly * 0.4),
        potentialAnnualSavings: Math.round(totalMonthly * 0.4 * 12),
        confidence: 96,
        evidence: activeSubs.map((s) => `${s.merchantName}: ₹${s.amount}/${s.frequency}`).join(' • '),
        suggestedAction: 'Review active subscriptions and pause or downgrade unused tiers.',
        status: 'active',
        transactionIds: activeSubs.flatMap((s) => s.transactionIds),
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      });
    }
  }

  // ----------------------------------------------------
  // RULE B: Frequent Purchases (e.g. Bakery & Snacks)
  // ----------------------------------------------------
  const snackCategory = discretionaryAnalyses.find(
    (a) => a.categoryName === 'Bakery items & snacks' || a.categoryName === 'Frequent food delivery'
  );
  if (snackCategory && snackCategory.totalLast30Days > 1200) {
    const id = `insight_rule_b_frequent_${snackCategory.categoryName.replace(/[^a-z0-9]/g, '_')}`;
    if (!dismissedSet.has(id)) {
      const targetSavings = Math.round(snackCategory.averageMonthlySpending * 0.25);
      insights.push({
        id,
        insightType: 'FREQUENT_PURCHASE',
        title: `High Frequency in ${snackCategory.categoryName}`,
        description: `You spent ₹${snackCategory.totalLast30Days.toLocaleString('en-IN')} on ${snackCategory.categoryName.toLowerCase()} across ${snackCategory.transactionCount} transactions in the last 30 days. Reducing this by 25% could free up ₹${targetSavings.toLocaleString('en-IN')} per month for your emergency reserve.`,
        category: snackCategory.categoryName,
        observedAmount: snackCategory.totalLast30Days,
        estimatedMonthlyAmount: snackCategory.averageMonthlySpending,
        potentialMonthlySavings: targetSavings,
        potentialAnnualSavings: targetSavings * 12,
        confidence: 91,
        evidence: `${snackCategory.transactionCount} visits/orders in the last 30 days averaging ₹${Math.round(snackCategory.totalLast30Days / (snackCategory.transactionCount || 1))} each.`,
        suggestedAction: 'Set a weekly spending limit or switch to meal planning.',
        status: 'active',
        transactionIds: [],
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      });
    }
  }

  // ----------------------------------------------------
  // RULE C: Price Increase Detection
  // ----------------------------------------------------
  const priceHikeSub = subscriptions.find((s) => s.isPriceIncrease && s.status !== 'Dismissed');
  if (priceHikeSub && priceHikeSub.previousAmount) {
    const id = `insight_rule_c_price_hike_${priceHikeSub.id}`;
    if (!dismissedSet.has(id)) {
      const hikeDiff = priceHikeSub.amount - priceHikeSub.previousAmount;
      insights.push({
        id,
        insightType: 'PRICE_INCREASE',
        title: `Price Hike Detected on ${priceHikeSub.merchantName}`,
        description: `Your recurring payment for ${priceHikeSub.merchantName} increased from ₹${priceHikeSub.previousAmount} to ₹${priceHikeSub.amount} (+${priceHikeSub.priceIncreasePercent}%). Review whether this updated price aligns with your budget.`,
        category: priceHikeSub.category,
        observedAmount: priceHikeSub.amount,
        estimatedMonthlyAmount: priceHikeSub.estimatedMonthlyCost,
        potentialMonthlySavings: hikeDiff,
        potentialAnnualSavings: hikeDiff * 12,
        confidence: 98,
        evidence: `Previous billing: ₹${priceHikeSub.previousAmount} • Latest charge: ₹${priceHikeSub.amount} on ${new Date(priceHikeSub.lastPaymentDate).toLocaleDateString('en-IN')}`,
        suggestedAction: 'Check for annual plan discounts, student verification, or bundle options.',
        status: 'active',
        transactionIds: priceHikeSub.transactionIds,
        badgeColor: 'bg-red-50 text-red-700 border-red-200',
      });
    }
  }

  // ----------------------------------------------------
  // RULE D: Spending Trend Spike
  // ----------------------------------------------------
  const trendSpike = discretionaryAnalyses.find((a) => a.spendingTrendPercent >= 25);
  if (trendSpike) {
    const id = `insight_rule_d_trend_${trendSpike.categoryName.replace(/[^a-z0-9]/g, '_')}`;
    if (!dismissedSet.has(id)) {
      insights.push({
        id,
        insightType: 'SPENDING_TREND',
        title: `${trendSpike.categoryName} Rose by ${trendSpike.spendingTrendPercent}%`,
        description: `Your spending on ${trendSpike.categoryName.toLowerCase()} increased by ${trendSpike.spendingTrendPercent}% compared to the prior period (total ₹${trendSpike.totalLast30Days.toLocaleString('en-IN')}).`,
        category: trendSpike.categoryName,
        observedAmount: trendSpike.totalLast30Days,
        estimatedMonthlyAmount: trendSpike.averageMonthlySpending,
        potentialMonthlySavings: Math.round(trendSpike.averageMonthlySpending * 0.3),
        potentialAnnualSavings: Math.round(trendSpike.averageMonthlySpending * 0.3 * 12),
        confidence: 88,
        evidence: `30-Day spend: ₹${trendSpike.totalLast30Days} vs prior baseline. Now accounts for ${trendSpike.percentageOfTotal}% of discretionary spend.`,
        suggestedAction: 'Review recent orders and confirm if this was a one-time event or routine lifestyle creep.',
        status: 'active',
        transactionIds: [],
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      });
    }
  }

  // ----------------------------------------------------
  // RULE E: Possible Duplicate Subscription
  // ----------------------------------------------------
  const duplicateSub = subscriptions.find((s) => s.isDuplicateCandidate && s.status !== 'Dismissed');
  if (duplicateSub && duplicateSub.duplicateWith) {
    const id = `insight_rule_e_duplicate_${duplicateSub.id}`;
    if (!dismissedSet.has(id)) {
      insights.push({
        id,
        insightType: 'DUPLICATE_SUBSCRIPTION',
        title: `Possible Overlapping Services (${duplicateSub.merchantName} & ${duplicateSub.duplicateWith})`,
        description: `We detected two active subscriptions providing similar services (${duplicateSub.merchantName} and ${duplicateSub.duplicateWith}). Consolidating to one could save ₹${duplicateSub.estimatedMonthlyCost.toLocaleString('en-IN')} per month.`,
        category: duplicateSub.category,
        observedAmount: duplicateSub.amount,
        estimatedMonthlyAmount: duplicateSub.estimatedMonthlyCost,
        potentialMonthlySavings: duplicateSub.estimatedMonthlyCost,
        potentialAnnualSavings: duplicateSub.estimatedAnnualCost,
        confidence: 86,
        evidence: `Both ${duplicateSub.merchantName} and ${duplicateSub.duplicateWith} charged in the last 35 days.`,
        suggestedAction: 'Choose your preferred primary platform and cancel the secondary subscription.',
        status: 'active',
        transactionIds: duplicateSub.transactionIds,
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      });
    }
  }

  // ----------------------------------------------------
  // RULE F: Unusual Expense Spike
  // ----------------------------------------------------
  const debits = transactions.filter((t) => t.amount < 0 && !t.isInternalTransfer);
  if (debits.length >= 5) {
    const nonOutlierAmounts = debits.map((t) => Math.abs(t.amount)).sort((a, b) => a - b);
    const median = nonOutlierAmounts[Math.floor(nonOutlierAmounts.length / 2)] || 500;

    // A transaction > 5x median and > ₹5,000 that is not rent or internal transfer
    const unusualTx = debits.find(
      (t) =>
        Math.abs(t.amount) > 5 * median &&
        Math.abs(t.amount) >= 5000 &&
        t.category !== 'Housing & Utilities' &&
        t.cleanMerchant !== 'House Rent'
    );

    if (unusualTx) {
      const id = `insight_rule_f_unusual_${unusualTx.id || unusualTx._id}`;
      if (!dismissedSet.has(id)) {
        const absVal = Math.abs(unusualTx.amount);
        insights.push({
          id,
          insightType: 'UNUSUAL_EXPENSE',
          title: `Unusually Large Outflow at ${unusualTx.cleanMerchant || unusualTx.payeeName}`,
          description: `This transaction of ₹${absVal.toLocaleString('en-IN')} is ${(absVal / median).toFixed(1)}x larger than your median transaction size (₹${median.toLocaleString('en-IN')}). Verify that this was expected and categorized properly.`,
          category: unusualTx.category || 'Shopping & Discretionary',
          observedAmount: absVal,
          estimatedMonthlyAmount: 0,
          potentialMonthlySavings: 0,
          potentialAnnualSavings: 0,
          confidence: 94,
          evidence: `Merchant: ${unusualTx.cleanMerchant || unusualTx.payeeName} • Amount: ₹${absVal.toLocaleString('en-IN')} • Date: ${new Date(unusualTx.timestamp || 0).toLocaleDateString('en-IN')}`,
          suggestedAction: 'Review the purchase to verify if warranty/tax invoice needs to be saved.',
          status: 'active',
          transactionIds: [(unusualTx._id || unusualTx.id || '').toString()],
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        });
      }
    }
  }

  return insights;
}

// =========================================================================
// 7. EMERGENCY FUND & HEALTH INSURANCE PLANNER
// =========================================================================
export function calculateEmergencyFundPlan(
  essentialMonthlyExpenses: number,
  targetMonths: number = 6,
  currentEmergencySavings: number = 45000,
  potentialMonthlySavings: number = 2500
): EmergencyFundAnalysis {
  const target = Math.max(0, essentialMonthlyExpenses) * Math.max(1, targetMonths);
  const current = Math.max(0, currentEmergencySavings);
  const remaining = Math.max(0, target - current);
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;

  const monthlyPace = Math.max(500, potentialMonthlySavings);
  const monthsToTarget = remaining > 0 ? Math.ceil(remaining / monthlyPace) : 0;

  return {
    essentialMonthlyExpenses,
    targetMonths,
    emergencyFundTarget: Math.round(target),
    currentEmergencySavings: Math.round(current),
    remainingTarget: Math.round(remaining),
    fundingProgressPercent: progress,
    estimatedMonthsToTarget: monthsToTarget,
  };
}

export function calculateHealthInsurancePlan(
  allocatedMonthlyPremium: number = 1200,
  _userAge: number = 26
): HealthInsuranceAnalysis {
  const annualPremium = allocatedMonthlyPremium * 12;

  // Actuarial rule of thumb in Indian healthcare:
  // ₹1,000 - ₹1,500/mo secures ₹10 - ₹15 Lakhs comprehensive family floater coverage
  let recommendedSumAssured = 1000000;
  if (allocatedMonthlyPremium >= 2000) {
    recommendedSumAssured = 2500000;
  } else if (allocatedMonthlyPremium >= 1400) {
    recommendedSumAssured = 1500000;
  }

  // Section 80D tax benefit up to ₹25,000 for self/family (30% slab = ₹7,500 max tax save)
  const eligible80D = Math.min(25000, annualPremium);
  const taxBenefit = Math.round(eligible80D * 0.2); // assumed 20% slab

  return {
    allocatedMonthlyPremium,
    recommendedSumAssured,
    annualPremium,
    taxSection80DBenefit: taxBenefit,
    guidelinesSummary:
      'Compare IRDAI-approved health policies based on cashless network hospitals, no room-rent capping, 1-year pre-existing disease waiting period, and restoration benefits.',
  };
}
