import { RawTransaction, EnrichedTransaction, Category, SubscriptionItem } from '@/types/finance';

/**
 * Extracts clean entity name and transaction intent from raw Indian UPI narrations.
 * Examples:
 * - "WDL TFR UPI/DR/103643355290/NETFLIX/H DFC/netflix.bd/Execu" -> "Netflix India"
 * - "WDL TFR UPI/DR/163871391966/Google P/utib/playstore1/Mand" -> "Google Play Subscriptions"
 * - "WDL TFR UPI/DR/655912700086/Godaddy/ HDFC/godaddy.bd/Pay" -> "GoDaddy Domains"
 * - "DEP TFR UPI/CR/656771804358/KOTRESH C/CNRB/mykotresh-/UPI" -> "Self Transfer (Kotresh C - Canara Bank)"
 * - "DEP TFR UPI/CR/625534769719/MEESHO T/YESB/mtpl1@yesb/CT22" -> "Meesho Refund"
 */
export function extractUPIEntity(raw: string, explicitMcc?: string): {
  cleanName: string;
  category: Category;
  tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income';
  isSelfTransfer: boolean;
  isRecurring: boolean;
  isRefund: boolean;
  mcc?: string;
} {
  const upper = raw.toUpperCase();

  // Primary Check: If explicit ISO/NPCI MCC is present, it takes highest precedence
  if (explicitMcc) {
    if (explicitMcc === '5411' || explicitMcc === '5422' || explicitMcc === '5499') {
      return { cleanName: 'Groceries & Essentials', category: 'Groceries', tier: 'Essential', isSelfTransfer: false, isRecurring: false, isRefund: false, mcc: explicitMcc };
    }
    if (explicitMcc === '5812' || explicitMcc === '5814') {
      return { cleanName: 'Restaurant & Dining', category: 'Dining & Nightlife', tier: 'Discretionary', isSelfTransfer: false, isRecurring: false, isRefund: false, mcc: explicitMcc };
    }
    if (explicitMcc === '5651' || explicitMcc === '5691' || explicitMcc === '5621') {
      return { cleanName: 'Textiles & Apparel Store', category: 'Shopping & Discretionary', tier: 'Discretionary', isSelfTransfer: false, isRecurring: false, isRefund: false, mcc: explicitMcc };
    }
    if (explicitMcc === '5541' || explicitMcc === '5542') {
      return { cleanName: 'Automotive Fuel Station', category: 'Transport & Fuel', tier: 'Essential', isSelfTransfer: false, isRecurring: false, isRefund: false, mcc: explicitMcc };
    }
    if (explicitMcc === '4899') {
      return { cleanName: 'Cable, Satellite & Streaming (OTT)', category: 'Subscriptions & Digital', tier: 'Discretionary', isSelfTransfer: false, isRecurring: true, isRefund: false, mcc: explicitMcc };
    }
    if (explicitMcc === '5912' || explicitMcc === '8062' || explicitMcc === '8011') {
      return { cleanName: 'Medical & Healthcare', category: 'Healthcare', tier: 'Essential', isSelfTransfer: false, isRecurring: false, isRefund: false, mcc: explicitMcc };
    }
    if (explicitMcc === '6538' || explicitMcc === '0000') {
      return { cleanName: 'P2P Peer Transfer', category: 'Reimbursement / Split', tier: 'Transfer_or_Offset', isSelfTransfer: false, isRecurring: false, isRefund: false, mcc: explicitMcc };
    }
  }

  // 1. Self-Transfer Detection (User's own name in UPI VPA or Canara / Other Bank accounts)
  if (upper.includes('KOTRESH C') || upper.includes('MYKOTRESH') || upper.includes('SELF') || upper.includes('OWN A/C')) {
    return {
      cleanName: 'Self-Transfer (Kotresh C - Canara Bank / Own A/C)',
      category: 'Internal Transfer',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: true,
      isRecurring: false,
      isRefund: false
    };
  }

  // 2. Family / Close P2P transfers (e.g. Veerabhadrappa C, Harsha)
  if (upper.includes('VEERABHA')) {
    return {
      cleanName: 'Veerabhadrappa C (Family Transfer)',
      category: 'Reimbursement / Split',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false
    };
  }
  if (upper.includes('HARSHA')) {
    return {
      cleanName: 'K Harsha (P2P Transfer / Shared)',
      category: 'Reimbursement / Split',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false
    };
  }

  // 3. Indian Recurring & Digital Subscriptions
  if (upper.includes('NETFLIX')) {
    return {
      cleanName: 'Netflix India',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false
    };
  }
  if (upper.includes('GOOGLE P') || upper.includes('PLAYSTORE') || upper.includes('MAND')) {
    return {
      cleanName: 'Google Play AutoPay / Subscription',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false
    };
  }
  if (upper.includes('GODADDY')) {
    return {
      cleanName: 'GoDaddy Domains & Hosting',
      category: 'Subscriptions & Digital',
      tier: 'Essential',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false
    };
  }
  if (upper.includes('SPOTIFY')) {
    return {
      cleanName: 'Spotify India',
      category: 'Subscriptions & Digital',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false
    };
  }

  // 4. E-Commerce & Shopping (with refund detection)
  if (upper.includes('MEESHO')) {
    const isRefund = upper.includes('CR/') || upper.includes('DEP TFR') || upper.includes('REFUND');
    return {
      cleanName: isRefund ? 'Meesho Refund / Return Credit' : 'Meesho Online Shopping',
      category: isRefund ? 'Reimbursement / Split' : 'Shopping & Discretionary',
      tier: isRefund ? 'Transfer_or_Offset' : 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund
    };
  }
  if (upper.includes('AMAZON') || upper.includes('AMZN')) {
    return {
      cleanName: 'Amazon India',
      category: 'Shopping & Discretionary',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false
    };
  }
  if (upper.includes('FLIPKART')) {
    return {
      cleanName: 'Flipkart',
      category: 'Shopping & Discretionary',
      tier: 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false
    };
  }

  // 5. Food, Dining & Quick Commerce
  if (upper.includes('SWIGGY')) {
    return { cleanName: 'Swiggy Food Delivery', category: 'Dining & Nightlife', tier: 'Discretionary', isSelfTransfer: false, isRecurring: false, isRefund: false };
  }
  if (upper.includes('ZOMATO')) {
    return { cleanName: 'Zomato Dining', category: 'Dining & Nightlife', tier: 'Discretionary', isSelfTransfer: false, isRecurring: false, isRefund: false };
  }
  if (upper.includes('BLINKIT') || upper.includes('ZEPTO') || upper.includes('INSTAMART')) {
    return { cleanName: 'Quick Commerce Groceries', category: 'Groceries', tier: 'Essential', isSelfTransfer: false, isRecurring: false, isRefund: false };
  }

  // 6. Fuel & Transport
  if (upper.includes('INDIAN O') || upper.includes('IOCL') || upper.includes('BHARAT PETRO') || upper.includes('HPCL')) {
    return { cleanName: 'Indian Oil / Fuel Station', category: 'Transport & Fuel', tier: 'Essential', isSelfTransfer: false, isRecurring: false, isRefund: false };
  }
  if (upper.includes('UBER') || upper.includes('OLA') || upper.includes('RAPIDO')) {
    return { cleanName: 'Cab / Auto Ride (Uber/Ola/Rapido)', category: 'Transport & Fuel', tier: 'Discretionary', isSelfTransfer: false, isRecurring: false, isRefund: false };
  }

  // 7. General Store Merchants & PineLabs POS
  if (upper.includes('PINELABS') || upper.includes('PAYTM') || upper.includes('BHARATPE')) {
    return { cleanName: 'Local Merchant (POS QR)', category: 'Shopping & Discretionary', tier: 'Discretionary', isSelfTransfer: false, isRecurring: false, isRefund: false };
  }

  // Generic fallback: Extract payee name from UPI/DR/12345/NAME/BANK/
  const upiMatch = raw.match(/UPI\/(?:DR|CR)\/\d+\/([^\/]+)/i);
  if (upiMatch && upiMatch[1]) {
    const rawPayee = upiMatch[1].replace(/[^a-zA-Z0-9\s.]/g, '').trim();
    if (rawPayee.length > 2) {
      return {
        cleanName: `UPI Payee: ${rawPayee}`,
        category: 'Shopping & Discretionary',
        tier: 'Discretionary',
        isSelfTransfer: false,
        isRecurring: false,
        isRefund: false
      };
    }
  }

  return {
    cleanName: raw.slice(0, 32),
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isSelfTransfer: false,
    isRecurring: false,
    isRefund: false
  };
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
  };
} {
  // Step 1: Process each transaction with UPI engine
  const enriched: EnrichedTransaction[] = rawTxs.map(tx => {
    const upiInfo = extractUPIEntity(tx.rawDescription, tx.mcc);
    let category = upiInfo.category;
    let tier = upiInfo.tier;
    let confidenceScore = tx.mcc ? 0.99 : 0.92;

    if (tx.amount > 0 && tier !== 'Income' && !upiInfo.isSelfTransfer) {
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
      cleanMerchant: upiInfo.cleanName,
      category,
      tier,
      isRecurring: upiInfo.isRecurring,
      isInternalTransfer: upiInfo.isSelfTransfer,
      isRefundOrReversal: upiInfo.isRefund,
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

  // Step 3: Reconcile Refunds (e.g. Meesho return ₹532)
  for (const credit of enriched.filter(t => t.amount > 0 && (t.isRefundOrReversal || /MEESHO/i.test(t.cleanMerchant)))) {
    const debit = enriched.find(d => d.amount < 0 && /MEESHO/i.test(d.cleanMerchant) && d.netOutflowAmount > 0);
    if (debit) {
      credit.isRefundOrReversal = true;
      credit.pairedRefundId = debit.id;
      debit.netOutflowAmount = Math.max(0, debit.netOutflowAmount - credit.amount);
      debit.anomalyWarning = `Refund matched: ₹${credit.amount.toFixed(2)} credited back`;
    }
  }

  // Step 4: Group recurring UPI mandates & Subscriptions (Netflix, Google Play, Godaddy)
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
    // If merchant has recurring tag or occurs across multiple months with consistent amount
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

  // Step 5: Compute KPIs in INR
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
      zombieSubscriptionsTotal: 0
    }
  };
}
