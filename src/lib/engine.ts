import { RawTransaction, EnrichedTransaction, Category, SubscriptionItem } from '@/types/finance';

export interface MerchantThemeInference {
  theme: string;
  themeCategory: Category;
  themeIcon: string;
  accountType: 'Merchant / Business' | 'Personal';
  cleanName: string;
}

export interface SimulatedAccount {
  id: string;
  name: string;
  vpa: string;
  theme: string;
  themeIcon: string;
  category: Category;
  defaultAmount: number;
  accountType: 'Merchant / Business' | 'Personal';
}

/**
 * 12 Curated Indian Merchant Accounts representing diverse spending themes
 */
export const PRESET_MERCHANT_ACCOUNTS: SimulatedAccount[] = [
  { id: 'm_spotify', name: 'Spotify India', vpa: 'spotify@icici', theme: 'Music & Audio Streaming', themeIcon: '🎵', category: 'Subscriptions & Digital', defaultAmount: 119, accountType: 'Merchant / Business' },
  { id: 'm_zara', name: 'Zara Fashion Store', vpa: 'zara.retail@hdfc', theme: 'Clothing & Fashion Apparel', themeIcon: '👗', category: 'Shopping & Discretionary', defaultAmount: 2490, accountType: 'Merchant / Business' },
  { id: 'm_blinkit', name: 'Blinkit Quick Commerce', vpa: 'blinkit.fresh@icici', theme: 'Groceries & Daily Essentials', themeIcon: '🥦', category: 'Groceries', defaultAmount: 480, accountType: 'Merchant / Business' },
  { id: 'm_swiggy', name: 'Swiggy Food Delivery', vpa: 'swiggy.orders@icici', theme: 'Food & Dining Delivery', themeIcon: '🍔', category: 'Dining & Nightlife', defaultAmount: 350, accountType: 'Merchant / Business' },
  { id: 'm_zomato', name: 'Zomato Dining & Bistro', vpa: 'zomato.pay@hdfc', theme: 'Food & Dining Delivery', themeIcon: '🍕', category: 'Dining & Nightlife', defaultAmount: 620, accountType: 'Merchant / Business' },
  { id: 'm_iocl', name: 'Indian Oil Fuel Station', vpa: 'iocl.fuels@sbi', theme: 'Fuel & Petroleum', themeIcon: '⛽', category: 'Transport & Fuel', defaultAmount: 500, accountType: 'Merchant / Business' },
  { id: 'm_apollo', name: 'Apollo Pharmacy', vpa: 'apollo.meds@icici', theme: 'Medicines & Healthcare', themeIcon: '💊', category: 'Healthcare', defaultAmount: 380, accountType: 'Merchant / Business' },
  { id: 'm_amazon', name: 'Amazon India Store', vpa: 'amazonpay@apl', theme: 'E-Commerce & Retail Shopping', themeIcon: '📦', category: 'Shopping & Discretionary', defaultAmount: 1450, accountType: 'Merchant / Business' },
  { id: 'm_croma', name: 'Croma Electronics', vpa: 'croma.tech@tatapay', theme: 'Electronics & Tech Gadgets', themeIcon: '💻', category: 'Shopping & Discretionary', defaultAmount: 2200, accountType: 'Merchant / Business' },
  { id: 'm_bookmyshow', name: 'BookMyShow Entertainment', vpa: 'bookmyshow@kotak', theme: 'Cinema & Event Tickets', themeIcon: '🎬', category: 'Subscriptions & Digital', defaultAmount: 550, accountType: 'Merchant / Business' },
  { id: 'm_bescom', name: 'BESCOM Electricity Utility', vpa: 'bescom.power@billdesk', theme: 'Electricity & Utility Bills', themeIcon: '⚡', category: 'Housing & Utilities', defaultAmount: 1420, accountType: 'Merchant / Business' },
  { id: 'm_decathlon', name: 'Decathlon Sports Gear', vpa: 'decathlon.gear@axisbank', theme: 'Sports & Fitness Equipment', themeIcon: '🏃', category: 'Shopping & Discretionary', defaultAmount: 999, accountType: 'Merchant / Business' },
];

/**
 * 5 Curated Personal / P2P Accounts
 */
export const PRESET_PERSONAL_ACCOUNTS: SimulatedAccount[] = [
  { id: 'p_kotresh', name: 'Kotresh C (Self Canara Bank)', vpa: 'mykotresh@cnrb', theme: 'Self-Transfer (Own A/C)', themeIcon: '🏦', category: 'Internal Transfer', defaultAmount: 5000, accountType: 'Personal' },
  { id: 'p_veeru', name: 'Veerabhadrappa C (Father)', vpa: 'veeru@oksbi', theme: 'Family Support Transfer', themeIcon: '👨‍👦', category: 'Reimbursement / Split', defaultAmount: 3000, accountType: 'Personal' },
  { id: 'p_harsha', name: 'Harsha K (Roommate)', vpa: 'harsha@okhdfc', theme: 'Shared Rent & Bill Split', themeIcon: '🤝', category: 'Reimbursement / Split', defaultAmount: 1800, accountType: 'Personal' },
  { id: 'p_priya', name: 'Priya Sharma (Colleague)', vpa: 'priya.sharma@okaxis', theme: 'Work Lunch & Taxi Share', themeIcon: '🥗', category: 'Reimbursement / Split', defaultAmount: 450, accountType: 'Personal' },
  { id: 'p_rahul', name: 'Rahul Verma (Friend)', vpa: 'rahul.verma@paytm', theme: 'Personal Reimbursement', themeIcon: '💸', category: 'Reimbursement / Split', defaultAmount: 1200, accountType: 'Personal' },
];

/**
 * Zero-Prior-Knowledge Smart Classifier:
 * Dynamically infers what theme/product an unknown merchant is selling
 * even if never seen before.
 */
export function inferMerchantTheme(
  inputNameOrRaw: string,
  vpaHandle?: string
): MerchantThemeInference {
  const upper = (inputNameOrRaw + ' ' + (vpaHandle || '')).toUpperCase();

  // 1. Personal / Self / Peer Checks
  if (
    upper.includes('KOTRESH') || upper.includes('MYKOTRESH') || upper.includes('SELF') ||
    upper.includes('OWN A/C') || upper.includes('OWN ACCOUNT') || upper.includes('TFR TO SELF')
  ) {
    return {
      theme: 'Self-Transfer (Own A/C)',
      themeCategory: 'Internal Transfer',
      themeIcon: '🏦',
      accountType: 'Personal',
      cleanName: 'Self-Transfer (Kotresh C - Canara Bank / Own A/C)',
    };
  }

  if (
    upper.includes('VEERABHA') || upper.includes('HARSHA') || upper.includes('PRIYA') ||
    upper.includes('RAHUL') || upper.includes('P2P') || upper.includes('FAMILY') ||
    upper.includes('MOM') || upper.includes('DAD') || upper.includes('ROOM RENT') || upper.includes('SPLIT')
  ) {
    return {
      theme: 'Personal / Peer-to-Peer Transfer',
      themeCategory: 'Reimbursement / Split',
      themeIcon: '👤',
      accountType: 'Personal',
      cleanName: inputNameOrRaw.trim() || 'Personal Contact',
    };
  }

  // 2. Music & Audio Streaming (e.g. Spotify, Apple Music, Gaana)
  if (
    upper.includes('SPOTIFY') || upper.includes('MUSIC') || upper.includes('AUDIO') ||
    upper.includes('GAANA') || upper.includes('WYNK') || upper.includes('SOUNDCLOUD') ||
    upper.includes('PODCAST') || upper.includes('STREAM') || upper.includes('TUNE')
  ) {
    return {
      theme: 'Music & Audio Streaming',
      themeCategory: 'Subscriptions & Digital',
      themeIcon: '🎵',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Spotify India',
    };
  }

  // 3. Clothing & Fashion Apparel (e.g. Zara, H&M, Levis, Cloth, Boutique)
  if (
    upper.includes('ZARA') || upper.includes('CLOTH') || upper.includes('APPAREL') ||
    upper.includes('WEAR') || upper.includes('TEXTILE') || upper.includes('GARMENT') ||
    upper.includes('FASHION') || upper.includes('TAILOR') || upper.includes('BOUTIQUE') ||
    upper.includes('DRESS') || upper.includes('SHIRT') || upper.includes('DENIM') ||
    upper.includes('FABINDIA') || upper.includes('SILKS') || upper.includes('H&M') ||
    upper.includes('LEVI') || upper.includes('MYNTRA') || upper.includes('AJIO') || upper.includes('TRENDS')
  ) {
    return {
      theme: 'Clothing & Fashion Apparel',
      themeCategory: 'Shopping & Discretionary',
      themeIcon: '👗',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Zara Fashion Store',
    };
  }

  // 4. Groceries & Daily Essentials (e.g. Blinkit, Zepto, Kirana, Mart)
  if (
    upper.includes('GROCERY') || upper.includes('GROCERIES') || upper.includes('BLINKIT') ||
    upper.includes('ZEPTO') || upper.includes('INSTAMART') || upper.includes('MART') ||
    upper.includes('SUPERMARKET') || upper.includes('KIRANA') || upper.includes('FRESH') ||
    upper.includes('VEGETABLE') || upper.includes('FRUITS') || upper.includes('DAIRY') ||
    upper.includes('MILK') || upper.includes('DMART') || upper.includes('BIGBASKET') || upper.includes('PROVISION')
  ) {
    return {
      theme: 'Groceries & Daily Essentials',
      themeCategory: 'Groceries',
      themeIcon: '🥦',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Blinkit Quick Commerce',
    };
  }

  // 5. Food & Dining Delivery (e.g. Swiggy, Zomato, Dominos, McDonald's, Restaurant, Cafe, Bakery)
  if (
    upper.includes('SWIGGY') || upper.includes('ZOMATO') || upper.includes('FOOD') ||
    upper.includes('DINING') || upper.includes('RESTAURANT') || upper.includes('CAFE') ||
    upper.includes('KITCHEN') || upper.includes('BAKERY') || upper.includes('BAKE') ||
    upper.includes('BISTRO') || upper.includes('PIZZA') || upper.includes('BURGER') ||
    upper.includes('CHAI') || upper.includes('COFFEE') || upper.includes('DHABA') ||
    upper.includes('BIRYANI') || upper.includes('HOTEL') || upper.includes('SWEETS') ||
    upper.includes('MCDONALD') || upper.includes('KFC') || upper.includes('DOMINOS')
  ) {
    return {
      theme: 'Food & Dining Delivery',
      themeCategory: 'Dining & Nightlife',
      themeIcon: '🍔',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Swiggy Food Delivery',
    };
  }

  // 6. Fuel & Petroleum (e.g. Indian Oil, Bharat Petroleum, HPCL, Shell)
  if (
    upper.includes('FUEL') || upper.includes('PETROL') || upper.includes('DIESEL') ||
    upper.includes('GAS') || upper.includes('IOCL') || upper.includes('BPCL') ||
    upper.includes('HPCL') || upper.includes('SHELL') || upper.includes('PETROLEUM') ||
    upper.includes('STATION') || upper.includes('INDIAN OIL')
  ) {
    return {
      theme: 'Fuel & Petroleum',
      themeCategory: 'Transport & Fuel',
      themeIcon: '⛽',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Indian Oil Fuel Station',
    };
  }

  // 7. Medicines & Healthcare (e.g. Apollo, Pharmacy, Clinic, Meds)
  if (
    upper.includes('PHARMACY') || upper.includes('PHARMA') || upper.includes('MEDICAL') ||
    upper.includes('MEDICINE') || upper.includes('MEDS') || upper.includes('CLINIC') ||
    upper.includes('HOSPITAL') || upper.includes('HEALTH') || upper.includes('DIAGNOSTICS') ||
    upper.includes('APOLLO') || upper.includes('CHEMIST') || upper.includes('DOCTOR') ||
    upper.includes('1MG') || upper.includes('NETMEDS') || upper.includes('PHARMEASY')
  ) {
    return {
      theme: 'Medicines & Healthcare',
      themeCategory: 'Healthcare',
      themeIcon: '💊',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Apollo Pharmacy',
    };
  }

  // 8. Electronics & Tech Gadgets (e.g. Croma, Electronics, Tech, Laptop)
  if (
    upper.includes('CROMA') || upper.includes('ELECTRONIC') || upper.includes('ELECTRONICS') ||
    upper.includes('GADGET') || upper.includes('MOBILE') || upper.includes('TECH') ||
    upper.includes('COMPUTER') || upper.includes('LAPTOP') || upper.includes('APPLE') ||
    upper.includes('SAMSUNG') || upper.includes('HARDWARE') || upper.includes('DEVICE')
  ) {
    return {
      theme: 'Electronics & Tech Gadgets',
      themeCategory: 'Shopping & Discretionary',
      themeIcon: '💻',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Croma Electronics',
    };
  }

  // 9. Cinema & Event Entertainment (e.g. BookMyShow, Movie, Cinema)
  if (
    upper.includes('BOOKMYSHOW') || upper.includes('CINEMA') || upper.includes('MOVIE') ||
    upper.includes('THEATRE') || upper.includes('FILM') || upper.includes('MULTIPLEX') ||
    upper.includes('PVR') || upper.includes('INOX') || upper.includes('SHOW') || upper.includes('TICKET')
  ) {
    return {
      theme: 'Cinema & Event Tickets',
      themeCategory: 'Subscriptions & Digital',
      themeIcon: '🎬',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'BookMyShow Entertainment',
    };
  }

  // 10. Electricity & Utility Bills (e.g. BESCOM, Power, Electricity)
  if (
    upper.includes('BESCOM') || upper.includes('ELECTRICITY') || upper.includes('ELECTRIC') ||
    upper.includes('POWER') || upper.includes('UTILITY') || upper.includes('WATER') ||
    upper.includes('BILL') || upper.includes('BROADBAND') || upper.includes('WIFI') ||
    upper.includes('AIRTEL') || upper.includes('JIO') || upper.includes('TATA POWER')
  ) {
    return {
      theme: 'Electricity & Utility Bills',
      themeCategory: 'Housing & Utilities',
      themeIcon: '⚡',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'BESCOM Electricity Utility',
    };
  }

  // 11. Sports & Fitness Gear (e.g. Decathlon, Gym, Sport)
  if (
    upper.includes('DECATHLON') || upper.includes('SPORT') || upper.includes('SPORTS') ||
    upper.includes('GYM') || upper.includes('FITNESS') || upper.includes('YOGA') ||
    upper.includes('WORKOUT') || upper.includes('ARENA') || upper.includes('FIT')
  ) {
    return {
      theme: 'Sports & Fitness Equipment',
      themeCategory: 'Shopping & Discretionary',
      themeIcon: '🏃',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Decathlon Sports Gear',
    };
  }

  // 12. E-Commerce & Retail Shopping (e.g. Amazon, Flipkart, Meesho)
  if (
    upper.includes('AMAZON') || upper.includes('FLIPKART') || upper.includes('MEESHO') ||
    upper.includes('STORE') || upper.includes('RETAIL') || upper.includes('SHOP') ||
    upper.includes('TRADERS') || upper.includes('ENTERPRISE')
  ) {
    return {
      theme: 'E-Commerce & Retail Shopping',
      themeCategory: 'Shopping & Discretionary',
      themeIcon: '📦',
      accountType: 'Merchant / Business',
      cleanName: inputNameOrRaw.trim() || 'Amazon India Store',
    };
  }

  // Fallback: Check commercial gateway signatures
  const isCommercial = /\b(PVT LTD|LIMITED|LTD|CORP|INC|ENTERPRISES|TRADERS|STORE|STORES|MART|RETAIL|SHOP|SERVICES|SOLUTIONS|PAY|BILL|POS|QR)\b/i.test(upper) ||
    (vpaHandle && (vpaHandle.includes('.bd') || vpaHandle.includes('@yesb') || vpaHandle.includes('@okbizaxis') || vpaHandle.includes('@bharatpe')));

  return {
    theme: isCommercial ? 'Commercial Merchant Store' : 'Personal / Peer Transfer',
    themeCategory: 'Shopping & Discretionary',
    themeIcon: isCommercial ? '🛍️' : '👤',
    accountType: isCommercial ? 'Merchant / Business' : 'Personal',
    cleanName: inputNameOrRaw.trim() || (isCommercial ? 'Merchant Store' : 'Personal Contact'),
  };
}

/**
 * Extracts clean entity name and classifies Merchant vs Personal
 */
export function extractUPIEntity(raw: string, payeeName?: string, vpaHandle?: string): {
  cleanName: string;
  accountType: 'Merchant / Business' | 'Personal';
  theme: string;
  themeIcon: string;
  category: Category;
  tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income';
  isSelfTransfer: boolean;
  isRecurring: boolean;
  isRefund: boolean;
  confidenceScore: number;
} {
  const upper = (raw + ' ' + (payeeName || '') + ' ' + (vpaHandle || '')).toUpperCase();
  const themeInfo = inferMerchantTheme(payeeName || raw, vpaHandle);

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
      theme: 'Self-Transfer (Own A/C)',
      themeIcon: '🏦',
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
      theme: 'Family Support Transfer',
      themeIcon: '👨‍👦',
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
      theme: 'Shared Rent & Bill Split',
      themeIcon: '🤝',
      category: 'Reimbursement / Split',
      tier: 'Transfer_or_Offset',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.97
    };
  }

  // 3. Indian Recurring & Digital Subscriptions (Merchant / Business)
  if (upper.includes('NETFLIX')) {
    return {
      cleanName: 'Netflix India',
      accountType: 'Merchant / Business',
      theme: 'OTT Digital Entertainment',
      themeIcon: '🎬',
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
      theme: 'App & Game Subscriptions',
      themeIcon: '📱',
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
      theme: 'Web Hosting & Domains',
      themeIcon: '🌐',
      category: 'Subscriptions & Digital',
      tier: 'Essential',
      isSelfTransfer: false,
      isRecurring: true,
      isRefund: false,
      confidenceScore: 0.99
    };
  }

  // 4. E-Commerce & Retail Merchants with Refund handling
  if (upper.includes('MEESHO')) {
    const isRefund = upper.includes('CR/') || upper.includes('DEP TFR') || upper.includes('REFUND') || upper.includes('CR ');
    return {
      cleanName: isRefund ? 'Meesho Refund / Return Credit' : 'Meesho Online Shopping',
      accountType: 'Merchant / Business',
      theme: 'E-Commerce & Retail Shopping',
      themeIcon: '📦',
      category: isRefund ? 'Reimbursement / Split' : 'Shopping & Discretionary',
      tier: isRefund ? 'Transfer_or_Offset' : 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund,
      confidenceScore: 0.98
    };
  }
  if (upper.includes('ZARA')) {
    const isRefund = upper.includes('REFUND') || upper.includes('RETURN') || upper.includes(' CR');
    return {
      cleanName: isRefund ? 'Zara Store Return Refund' : 'Zara Fashion Store',
      accountType: 'Merchant / Business',
      theme: 'Clothing & Fashion Apparel',
      themeIcon: '👗',
      category: isRefund ? 'Reimbursement / Split' : 'Shopping & Discretionary',
      tier: isRefund ? 'Transfer_or_Offset' : 'Discretionary',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund,
      confidenceScore: 0.98
    };
  }

  // 5. Income & Salary credits
  if (upper.includes('SALARY') || upper.includes('PAYROLL') || upper.includes('TECH CORP') || upper.includes('INFOSYS') || upper.includes('TCS') || upper.includes('WIPRO')) {
    return {
      cleanName: payeeName || 'Salary Credit (Employer)',
      accountType: 'Merchant / Business',
      theme: 'Corporate Salary / Income',
      themeIcon: '💼',
      category: 'Income',
      tier: 'Income',
      isSelfTransfer: false,
      isRecurring: false,
      isRefund: false,
      confidenceScore: 0.99
    };
  }

  // 6. Generic Heuristic using Dynamic Inference
  return {
    cleanName: themeInfo.cleanName || (payeeName || raw).slice(0, 36),
    accountType: themeInfo.accountType,
    theme: themeInfo.theme,
    themeIcon: themeInfo.themeIcon,
    category: themeInfo.themeCategory,
    tier: themeInfo.accountType === 'Merchant / Business' ? 'Discretionary' : 'Transfer_or_Offset',
    isSelfTransfer: false,
    isRecurring: false,
    isRefund: false,
    confidenceScore: 0.88
  };
}

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
      theme: tx.theme || info.theme,
      themeIcon: tx.themeIcon || info.themeIcon,
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

  // Step 3: Reconcile Refunds
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
