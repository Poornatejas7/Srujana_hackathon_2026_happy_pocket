import { RawTransaction, EnrichedTransaction, Category, SubscriptionItem } from '@/types/finance';

/**
 * High-precision Indian banking categorization engine that classifies
 * transactions between 'Merchant / Business' and 'Personal' accounts,
 * cleans the payee names, and identifies internal transfers, refunds & recurring subscriptions.
 */
export function extractUPIEntity(raw: string, payeeName?: string, vpaHandle?: string): {
  cleanName: string;
  accountType: 'Merchant / Business' | 'Personal';
  category: Category;
  tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income';
  isSelfTransfer: boolean;
  isRecurring: boolean;
  isRefund: boolean;
  confidenceScore: number;
} {
  const upper = (raw + ' ' + (payeeName || '') + ' ' + (vpaHandle || '')).toUpperCase();

  // 1. Self-Transfer Detection (User's own accounts)
  if (
    upper.includes('KOTRESH C') ||
    upper.includes('MYKOTRESH') ||
    upper.includes('SELF') ||
    upper.includes('OWN A/C') ||
    upper.includes('OWN ACCOUNT') ||
    upper.includes('TFR TO SELF') ||
    upper.includes('TRANSFER TO SELF') ||
    upper.includes('MARCUS HYSA')
  ) {
    return {
      cleanName: 'Self-Transfer (Kotresh C - Canara Bank / Own A/C)',
      accountType: 'Personal',
      category: 'Internal Transfer',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: true,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }

  // 2. Personal P2P Family & Peer Transfers
  if (upper.includes('VEERABHA')) {
    return {
      cleanName: 'Veerabhadrappa C (Family Transfer)',
      accountType: 'Personal',
      category: 'Reimbursement / Split',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.98
    };
  }
  if (upper.includes('HARSHA')) {
    return {
      cleanName: 'K Harsha (P2P Transfer / Shared)',
      accountType: 'Personal',
      category: 'Reimbursement / Split',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.97
    };
  }
  if (
    upper.includes('P2P') ||
    upper.includes('DINNER SPLIT') ||
    upper.includes('ROOM RENT') ||
    upper.includes('REIMBURSEMENT') ||
    upper.includes('SHARED BILL') ||
    upper.includes('BORROW')
  ) {
    return {
      cleanName: payeeName ? `P2P: ${payeeName}` : 'P2P Personal Split / Transfer',
      accountType: 'Personal',
      category: 'Reimbursement / Split',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.95
    };
  }

  // 3. Indian Recurring & Digital Subscriptions (Merchant / Business)
  if (upper.includes('NETFLIX')) {
    return {
      cleanName: 'Netflix India',
      accountType: 'Merchant / Business',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('GOOGLE P') || upper.includes('PLAYSTORE') || upper.includes('GOOGLE PLAY') || upper.includes('MAND')) {
    return {
      cleanName: 'Google Play AutoPay / Subscription',
      accountType: 'Merchant / Business',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('GODADDY')) {
    return {
      cleanName: 'GoDaddy Domains & Hosting',
      accountType: 'Merchant / Business',
      category: 'Subscriptions & Digital',
      tier: 'Essential',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('SPOTIFY')) {
    return {
      cleanName: 'Spotify India',
      accountType: 'Merchant / Business',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('PRIME') || upper.includes('AMAZONPRIME') || upper.includes('HOTSTAR') || upper.includes('YOUTUBE')) {
    return {
      cleanName: 'OTT Digital Entertainment',
      accountType: 'Merchant / Business',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.97
    };
  }

  // 4. E-Commerce & Retail Merchants
  if (upper.includes('MEESHO')) {
    const isRefund = upper.includes('CR/') || upper.includes('DEP TFR') || upper.includes('REFUND') || upper.includes('CR ');
    return {
      cleanName: isRefund ? 'Meesho Refund / Return Credit' : 'Meesho Online Shopping',
      accountType: 'Merchant / Business',
      category: isRefund ? 'Reimbursement / Split' : 'Shopping & Discretionary',
      tier: isRefund ? 'Transfer_or_Offset' : 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund,
      confidenceScore: 0.98
    };
  }
  if (upper.includes('AMAZON') || upper.includes('AMZN')) {
    return {
      cleanName: 'Amazon India',
      accountType: 'Merchant / Business',
      category: 'Shopping & Discretionary',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('FLIPKART')) {
    return {
      cleanName: 'Flipkart Online Shopping',
      accountType: 'Merchant / Business',
      category: 'Shopping & Discretionary',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('ZARA')) {
    const isRefund = upper.includes('REFUND') || upper.includes('RETURN') || upper.includes(' CR');
    return {
      cleanName: isRefund ? 'Zara Store Return Refund' : 'Zara Store Retail',
      accountType: 'Merchant / Business',
      category: isRefund ? 'Reimbursement / Split' : 'Shopping & Discretionary',
      tier: isRefund ? 'Transfer_or_Offset' : 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund,
      confidenceScore: 0.98
    };
  }

  // 5. Food, Dining & Quick Commerce Merchants
  if (upper.includes('SWIGGY')) {
    return {
      cleanName: 'Swiggy Food Delivery',
      accountType: 'Merchant / Business',
      category: 'Dining & Nightlife',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('ZOMATO')) {
    return {
      cleanName: 'Zomato Dining & Delivery',
      accountType: 'Merchant / Business',
      category: 'Dining & Nightlife',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }
  if (upper.includes('DOMINOS') || upper.includes('PIZZA') || upper.includes('MCDONALD') || upper.includes('KFC') || upper.includes('STARBUCKS') || upper.includes('SUBWAY') || upper.includes('BURGER KING')) {
    return {
      cleanName: upper.includes('DOMINOS') ? "Domino's Pizza" : upper.includes('MCDONALD') ? "McDonald's" : upper.includes('KFC') ? "KFC India" : upper.includes('STARBUCKS') ? "Starbucks Coffee" : "Fast Food & Dining",
      accountType: 'Merchant / Business',
      category: 'Dining & Nightlife',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.98
    };
  }
  if (upper.includes('NOBU')) {
    return {
      cleanName: 'Nobu Restaurant Dining',
      accountType: 'Merchant / Business',
      category: 'Dining & Nightlife',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.95
    };
  }
  if (upper.includes('BLINKIT') || upper.includes('ZEPTO') || upper.includes('INSTAMART') || upper.includes('BIGBASKET') || upper.includes('DMART')) {
    return {
      cleanName: 'Groceries & Quick Commerce',
      accountType: 'Merchant / Business',
      category: 'Groceries',
      tier: 'Essential',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.98
    };
  }

  // 6. Fuel, Transport & Travel Merchants
  if (upper.includes('INDIAN O') || upper.includes('IOCL') || upper.includes('BHARAT PETRO') || upper.includes('HPCL') || upper.includes('SHELL')) {
    return {
      cleanName: 'Fuel Station (IOCL/BPCL/HPCL)',
      accountType: 'Merchant / Business',
      category: 'Transport & Fuel',
      tier: 'Essential',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.98
    };
  }
  if (upper.includes('UBER') || upper.includes('OLA') || upper.includes('RAPIDO')) {
    return {
      cleanName: 'Cab / Ride Transit',
      accountType: 'Merchant / Business',
      category: 'Transport & Fuel',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.98
    };
  }

  // 7. Utilities & Household Bills (Business)
  if (upper.includes('ELECTRICITY') || upper.includes('CON EDISON') || upper.includes('BESCOM') || upper.includes('TATA POWER') || upper.includes('AIRTEL') || upper.includes('JIO')) {
    return {
      cleanName: 'Electricity & Utility Bills',
      accountType: 'Merchant / Business',
      category: 'Housing & Utilities',
      tier: 'Essential',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.98
    };
  }

  // 8. General Commercial & Corporate Entity Suffix Detection
  const businessPattern = /\b(PVT LTD|LIMITED|LTD|CORP|INC|ENTERPRISES|TRADERS|STORE|STORES|SUPERMARKET|MART|RETAIL|SHOP|BAKERY|HOTEL|RESTAURANT|CAFE|SALON|HOSPITAL|CLINIC|PHARMACY|FUELS|PETROLEUM|AGENCIES|SERVICES|SOLUTIONS|VENTURES|LOGISTICS|COMMUNICATIONS|JEWELLERS|SILKS|TEXTILES|ELECTRONICS|HARDWARE|GARMENTS|MALL|PINELABS|BHARATPE|PAYTM QR|BILLDESK|RAZORPAY|CASHFREE|PAYU|CCAVENUE|POS|ECOM|ACH|NACH|ECS|MANDATE)\b/i;
  
  if (businessPattern.test(upper) || (vpaHandle && (vpaHandle.includes('.bd') || vpaHandle.includes('@yesb') || vpaHandle.includes('@okbizaxis') || vpaHandle.includes('@bharatpe')))) {
    return {
      cleanName: payeeName || 'Commercial Merchant / Store',
      accountType: 'Merchant / Business',
      category: 'Shopping & Discretionary',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.92
    };
  }

  // 9. Income & Salary credits
  if (upper.includes('SALARY') || upper.includes('PAYROLL') || upper.includes('TECH CORP') || upper.includes('INFOSYS') || upper.includes('TCS') || upper.includes('WIPRO')) {
    return {
      cleanName: payeeName || 'Salary Credit (Employer)',
      accountType: 'Merchant / Business',
      category: 'Income',
      tier: 'Income',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }

  // 10. Default heuristic: Extract payee name from standard UPI pattern
  const upiMatch = raw.match(/UPI\/(?:DR|CR)\/\d+\/([^\/]+)/i);
  if (upiMatch && upiMatch[1]) {
    const rawPayee = upiMatch[1].replace(/[^a-zA-Z0-9\s.]/g, '').trim();
    if (rawPayee.length > 2) {
      // If name has 2 words and looks like a human person name (e.g. "SANTHOSH KUMAR", "RAMESH B")
      const words = rawPayee.split(/\s+/);
      const isPersonName = words.length >= 2 && !businessPattern.test(rawPayee);

      return {
        cleanName: `UPI Payee: ${rawPayee}`,
        accountType: isPersonName ? 'Personal' : 'Merchant / Business',
        category: 'Shopping & Discretionary',
        tier: 'Discretionary',
        isSelfTransfer: false,
        isRecurring: false,
        isRefund: false,
        confidenceScore: 0.85
      };
    }
  }

  return {
    cleanName: (payeeName || raw).slice(0, 36),
    accountType: 'Personal',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isSelfTransfer: false,
    isRecurring: false,
    isRefund: false,
    confidenceScore: 0.75
  };
}

/**
 * Universal classifier to be used everywhere in backend and frontend.
 */
export function classifyMerchantVsPersonal(
  rawDescription: string,
  payeeName?: string,
  vpaHandle?: string,
  txMode?: string
) {
  return extractUPIEntity(rawDescription, payeeName, vpaHandle);
}

export function enrichAndAnalyzeTransactions(
  rawTxs: RawTransaction[],
  userOverrides: Record<string, { category: Category; tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income' }> = {}
): {
  enriched: EnrichedTransaction[];
  subscriptions: SubscriptionItem[];
  kpis: {
    rawOutflows: number;
    trueLivingExpenses: number;
    internalTransfersDetected: number;
    refundsReconciled: number;
    sharedBillCredits: number;
    monthlyRecurringCommitments: number;
    zombieSubscriptionsTotal: number;
    merchantCount: number;
    personalCount: number;
  };
} {
  // Step 1: Process each transaction with UPI engine and classify Merchant vs Personal
  const enriched: EnrichedTransaction[] = rawTxs.map(tx => {
    const info = extractUPIEntity(tx.rawDescription, tx.payeeName, tx.vpaHandle);
    let category = info.category;
    let tier = info.tier;
    let confidenceScore = info.confidenceScore;

    if (tx.amount > 0 && tier !== 'Income' && !info.isSelfTransfer) {
      tier = 'Transfer_or_Offset';
      category = 'Reimbursement / Split';
    }

    if (userOverrides[tx.id]) {
      category = userOverrides[tx.id].category;
      tier = userOverrides[tx.id].tier;
      confidenceScore = 1.0;
    }

    return {
      ...tx,
      cleanMerchant: info.cleanName,
      accountType: info.accountType,
      category,
      tier,
      isRecurring: info.isRecurring,
      isInternalTransfer: info.isSelfTransfer,
      isRefundOrReversal: info.isRefund,
      isSharedSplitExpense: false,
      netOutflowAmount: tx.amount < 0 ? Math.abs(tx.amount) : 0,
      confidenceScore,
      userOverridden: !!userOverrides[tx.id]
    };
  });

  // Step 2: Anti-Distortion - Net self transfers & family flows
  enriched.forEach(tx => {
    if (tx.isInternalTransfer) {
      tx.netOutflowAmount = 0;
      tx.anomalyWarning = 'Self-transfer between your own bank accounts safely excluded';
    }
  });

  // Step 3: Reconcile Refunds (e.g. Meesho or Zara return credit)
  for (const credit of enriched.filter(t => t.amount > 0 && (t.isRefundOrReversal || /MEESHO|ZARA/i.test(t.cleanMerchant)))) {
    const debit = enriched.find(d => d.amount < 0 && (/MEESHO|ZARA/i.test(d.cleanMerchant)) && d.netOutflowAmount > 0);
    if (debit) {
      credit.isRefundOrReversal = true;
      credit.pairedRefundId = debit.id;
      debit.netOutflowAmount = Math.max(0, debit.netOutflowAmount - credit.amount);
      debit.anomalyWarning = `Refund matched: ₹${credit.amount.toFixed(2)} credited back`;
    }
  }

  // Step 4: Group recurring UPI mandates & Subscriptions
  const merchantGroups: Record<string, EnrichedTransaction[]> = {};
  enriched.forEach(tx => {
    if (tx.amount < 0 && !tx.isInternalTransfer) {
      const key = tx.cleanMerchant;
      if (!merchantGroups[key]) merchantGroups[key] = [];
      merchantGroups[key].push(tx);
    }
  });

  const subscriptions: SubscriptionItem[] = [];

  for (const [merchant, txs] of Object.entries(merchantGroups)) {
    if (txs.some(t => t.isRecurring) || (txs.length >= 2 && /NETFLIX|GOOGLE|PLAYSTORE|GODADDY|SPOTIFY/i.test(merchant))) {
      txs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const latest = txs[txs.length - 1];
      const monthlyCost = Math.abs(latest.amount);

      subscriptions.push({
        merchant,
        category: latest.category,
        monthlyCost,
        frequency: 'monthly',
        lastCharged: latest.timestamp,
        nextExpected: new Date(new Date(latest.timestamp).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        annualImpact: monthlyCost * 12,
        confidence: 0.95
      });

      txs.forEach(t => {
        t.isRecurring = true;
        t.recurringFrequency = 'monthly';
      });
    }
  }

  // Step 5: Compute KPIs in INR & Merchant vs Personal counts
  const rawOutflows = enriched
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const internalTransfersDetected = enriched
    .filter(t => t.isInternalTransfer && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const refundsReconciled = enriched
    .filter(t => t.isRefundOrReversal)
    .reduce((sum, t) => sum + t.amount, 0);

  const sharedBillCredits = enriched
    .filter(t => t.tier === 'Transfer_or_Offset' && t.amount > 0 && !t.isInternalTransfer && !t.isRefundOrReversal)
    .reduce((sum, t) => sum + t.amount, 0);

  const trueLivingExpenses = enriched
    .filter(t => t.amount < 0 && !t.isInternalTransfer && t.category !== 'Reimbursement / Split')
    .reduce((sum, t) => sum + t.netOutflowAmount, 0);

  const monthlyRecurringCommitments = subscriptions
    .reduce((sum, s) => sum + s.monthlyCost, 0);

  const merchantCount = enriched.filter(t => t.accountType === 'Merchant / Business').length;
  const personalCount = enriched.filter(t => t.accountType === 'Personal').length;

  return {
    enriched,
    subscriptions,
    kpis: {
      rawOutflows,
      trueLivingExpenses,
      internalTransfersDetected,
      refundsReconciled,
      sharedBillCredits,
      monthlyRecurringCommitments,
      zombieSubscriptionsTotal: 0,
      merchantCount,
      personalCount
    }
  };
}
