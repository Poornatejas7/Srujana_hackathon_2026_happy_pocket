import { RawTransaction, EnrichedTransaction, Category, SubscriptionItem } from '@/types/finance';

export interface MerchantThemeInference {
  theme: string;
  themeCategory: Category;
  themeIcon: string;
  accountType: 'Merchant / Business' | 'Personal';
  cleanName: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  isAmbiguous: boolean;
  needsReview?: boolean;
  ambiguityReason?: string;
  suggestedCategories?: Category[];
  userOverridden?: boolean;
}

export const USER_MERCHANT_OVERRIDES_KEY = 'hp_merchant_category_overrides';

export function getCategoryIcon(category: Category): string {
  switch (category) {
    case 'Groceries': return '🥦';
    case 'Housing & Utilities': return '🏠';
    case 'Dining & Nightlife': return '🍔';
    case 'Transport & Fuel': return '⛽';
    case 'Healthcare': return '💊';
    case 'Education': return '🎓';
    case 'Investments': return '📈';
    case 'Insurance': return '🛡️';
    case 'Loan & EMI': return '💳';
    case 'Travel': return '✈️';
    case 'Entertainment': return '🎟️';
    case 'Shopping & Discretionary': return '🛍️';
    case 'Electronics': return '💻';
    case 'Personal Care': return '💄';
    case 'Subscriptions & Digital': return '🎵';
    case 'Internal Transfer': return '🏦';
    case 'Reimbursement / Split': return '🤝';
    case 'Income': return '💰';
    case 'Unnecessary & Impulse Spend': return '🚨';
    case 'Other / Unknown': return '❓';
    default: return '🏪';
  }
}

export function getCategoryThemeLabel(category: Category): string {
  switch (category) {
    case 'Groceries': return 'Groceries & Kirana Store';
    case 'Housing & Utilities': return 'Hardware, Electricals & Utilities';
    case 'Dining & Nightlife': return 'Food & Dining Service';
    case 'Transport & Fuel': return 'Transport, Spares & Fuel';
    case 'Healthcare': return 'Medicines & Healthcare Store';
    case 'Education': return 'Education & Tuition Fees';
    case 'Investments': return 'Mutual Funds & Stock Investments';
    case 'Insurance': return 'Life & Health Insurance Premium';
    case 'Loan & EMI': return 'Loan Repayment & Equated Monthly Installment';
    case 'Travel': return 'Flights, Trains & Travel Accommodations';
    case 'Entertainment': return 'Movies, Events & Live Shows';
    case 'Shopping & Discretionary': return 'General Merchandise & Retail';
    case 'Electronics': return 'Consumer Electronics & Gadgets';
    case 'Personal Care': return 'Salon, Spa & Personal Grooming';
    case 'Subscriptions & Digital': return 'Digital & Utility Service';
    case 'Internal Transfer': return 'Self-Transfer (Own A/C)';
    case 'Reimbursement / Split': return 'Friend & Family Transfer';
    case 'Unnecessary & Impulse Spend': return 'Unnecessary & Impulse Expenditure';
    case 'Income': return 'Salary / Business Inflow';
    case 'Other / Unknown': return 'Unclassified / Review Needed';
    default: return 'Commercial Merchant Store';
  }
}

export function getUserMerchantOverrides(): Record<string, { category: Category; theme: string; themeIcon: string }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_MERCHANT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUserMerchantOverride(
  merchantName: string, 
  category: Category, 
  theme?: string, 
  themeIcon?: string
) {
  if (typeof window === 'undefined') return;
  try {
    const cleanKey = merchantName.trim().toLowerCase();
    const current = getUserMerchantOverrides();
    current[cleanKey] = {
      category,
      theme: theme || getCategoryThemeLabel(category),
      themeIcon: themeIcon || getCategoryIcon(category)
    };
    localStorage.setItem(USER_MERCHANT_OVERRIDES_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save merchant override:', err);
  }
}

/**
 * Real-world Unnecessary / Impulse Expenditure & Financial Leakage Detector
 * Identifies avoidable spending triggers:
 * - Impulse Food Delivery & Late-Night Dining (Swiggy, Zomato, Burger King, Domino's, midnight orders)
 * - Fast Fashion & Impulsive Retail Shopping (Zara, Meesho, Myntra, Shein, H&M)
 * - Excess / Unused Digital Subscriptions & Gaming micro-transactions
 * - Tobacco, Paan, Alcohol, Nightlife & Pubs
 * - Explicit User-flagged avoidable leakage
 */
export function detectUnnecessaryExpenditure(tx: {
  amount: number;
  category?: Category | string;
  cleanMerchant?: string;
  payeeName?: string;
  rawDescription?: string;
  timestamp?: string;
  isUnnecessary?: boolean;
  unnecessaryReason?: string;
}): {
  isUnnecessary: boolean;
  unnecessaryReason: string;
  spendNature: 'Need' | 'Want' | 'Unnecessary_Leakage';
} {
  // If explicitly flagged by user, respect user determination
  if (tx.isUnnecessary !== undefined) {
    return {
      isUnnecessary: !!tx.isUnnecessary,
      unnecessaryReason: tx.unnecessaryReason || (tx.isUnnecessary ? 'Marked by User as Avoidable Spend' : ''),
      spendNature: tx.isUnnecessary ? 'Unnecessary_Leakage' : 'Need',
    };
  }

  // If user classified into Unnecessary category
  if (tx.category === 'Unnecessary & Impulse Spend') {
    return {
      isUnnecessary: true,
      unnecessaryReason: tx.unnecessaryReason || 'Classified as Unnecessary & Impulse Spend',
      spendNature: 'Unnecessary_Leakage',
    };
  }

  // Inflows or zero-value transactions are not unnecessary expenses
  if (!tx.amount || tx.amount >= 0) {
    return {
      isUnnecessary: false,
      unnecessaryReason: '',
      spendNature: 'Need',
    };
  }

  const text = `${tx.cleanMerchant || ''} ${tx.payeeName || ''} ${tx.rawDescription || ''}`.toUpperCase();

  // 1. Tobacco, Paan, Alcohol, Bars, Breweries & Nightclubs
  if (
    /TOBACCO|CIGARETTE|SMOKE|VAPE|PAAN|PAN SHOP|BEER|WINE|LIQUOR|SPIRITS|BREWERY|BREWPUB|BAR\b|PUBS?\b|NIGHTCLUB|CLUB\b|CASINO|LOTTERY/i.test(text)
  ) {
    return {
      isUnnecessary: true,
      unnecessaryReason: 'Nightlife, Bar or Indulgence Outflow',
      spendNature: 'Unnecessary_Leakage',
    };
  }

  // 2. Late Night Food Delivery & Impulse Dining
  if (/SWIGGY|ZOMATO|DOMINO|PIZZA|BURGER KING|MCDONALD|KFC|STARBUCKS|SUBWAY|BAKERY|SWEETS|ICE CREAM|CAFE|CHAI POINT/i.test(text)) {
    let isLateNight = false;
    if (tx.timestamp) {
      try {
        const hour = new Date(tx.timestamp).getHours();
        if (hour >= 22 || hour <= 4) {
          isLateNight = true;
        }
      } catch {}
    }
    return {
      isUnnecessary: true,
      unnecessaryReason: isLateNight 
        ? 'Midnight Food Delivery & Night Craving' 
        : 'Impulse Food Delivery & Dining Out',
      spendNature: 'Unnecessary_Leakage',
    };
  }

  // 3. Fast Fashion & Impulse Retail Shopping
  if (/ZARA|H&M|MEESHO|MYNTRA|SHEIN|NYKAA|AJIO|URBANIC/i.test(text)) {
    return {
      isUnnecessary: true,
      unnecessaryReason: 'Fast Fashion & Discretionary Impulse Buy',
      spendNature: 'Unnecessary_Leakage',
    };
  }

  // 4. Gaming Micro-transactions & In-App Purchases
  if (/STEAM|PLAYSTATION|XBOX|BGMI|PUBG|VALORANT|DISCORD NITRO|SUPERCELL|RIOT/i.test(text)) {
    return {
      isUnnecessary: true,
      unnecessaryReason: 'Gaming & Virtual Currency Micro-transactions',
      spendNature: 'Unnecessary_Leakage',
    };
  }

  // 5. OTT Entertainment Streaming Subscriptions (when discretionary)
  if (tx.category === 'Subscriptions & Digital' && /NETFLIX|PRIME|HOTSTAR|SPOTIFY/i.test(text)) {
    return {
      isUnnecessary: true,
      unnecessaryReason: 'Non-Essential Entertainment Streaming Subscription',
      spendNature: 'Want',
    };
  }

  // Otherwise, default according to category
  const isWant = ['Shopping & Discretionary', 'Dining & Nightlife', 'Entertainment', 'Personal Care'].includes(tx.category as string);
  return {
    isUnnecessary: false,
    unnecessaryReason: '',
    spendNature: isWant ? 'Want' : 'Need',
  };
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
  { id: 'm_amazon', name: 'Amazon India Marketplace', vpa: 'amazonpay@apl', theme: 'E-Commerce & Retail Shopping', themeIcon: '📦', category: 'Shopping & Discretionary', defaultAmount: 850, accountType: 'Merchant / Business' },
  { id: 'm_iyengar_bakery', name: 'Iyengar Bakery & Sweets', vpa: 'iyengarbakery@paytm', theme: 'Bakery & Fresh Confectionery', themeIcon: '🥖', category: 'Dining & Nightlife', defaultAmount: 180, accountType: 'Merchant / Business' },
  { id: 'm_lakshmi_kirana', name: 'Sri Lakshmi Kirana Stores', vpa: 'lakshmikirana@upi', theme: 'Groceries & Daily Essentials', themeIcon: '🥦', category: 'Groceries', defaultAmount: 480, accountType: 'Merchant / Business' },
  { id: 'm_chai_point', name: 'Chai Point & Snacks', vpa: 'chaipoint@axl', theme: 'Tea Stall & Quick Snacks', themeIcon: '☕', category: 'Dining & Nightlife', defaultAmount: 40, accountType: 'Merchant / Business' },
  { id: 'm_hanuman_hardware', name: 'Sri Hanuman Hardware', vpa: 'hanumanhardware@upi', theme: 'Hardware, Paints & Electricals', themeIcon: '🔧', category: 'Housing & Utilities', defaultAmount: 750, accountType: 'Merchant / Business' },
  { id: 'm_blinkit', name: 'Blinkit Quick Commerce', vpa: 'blinkit.fresh@icici', theme: 'Groceries & Daily Essentials', themeIcon: '🥦', category: 'Groceries', defaultAmount: 480, accountType: 'Merchant / Business' },
  { id: 'm_swiggy', name: 'Swiggy Food Delivery', vpa: 'swiggy.orders@icici', theme: 'Food & Dining Delivery', themeIcon: '🍔', category: 'Dining & Nightlife', defaultAmount: 350, accountType: 'Merchant / Business' },
  { id: 'm_spotify', name: 'Spotify India', vpa: 'spotify@icici', theme: 'Music & Audio Streaming', themeIcon: '🎵', category: 'Subscriptions & Digital', defaultAmount: 119, accountType: 'Merchant / Business' },
  { id: 'm_iocl', name: 'Indian Oil Fuel Station', vpa: 'iocl.fuels@sbi', theme: 'Fuel & Petroleum', themeIcon: '⛽', category: 'Transport & Fuel', defaultAmount: 500, accountType: 'Merchant / Business' },
  { id: 'm_apollo', name: 'Apollo Pharmacy', vpa: 'apollo.meds@icici', theme: 'Medicines & Healthcare', themeIcon: '💊', category: 'Healthcare', defaultAmount: 380, accountType: 'Merchant / Business' },
  { id: 'm_citycare_medicals', name: 'City Care Medicals & Pharmacy', vpa: 'citycaremedicals@okhdfcbank', theme: 'Medical Shop & Pharmaceuticals', themeIcon: '💊', category: 'Healthcare', defaultAmount: 420, accountType: 'Merchant / Business' },
  { id: 'm_xavier_college', name: 'St. Xavier Engineering College', vpa: 'xaviercollege@sbi', theme: 'Education College & Tuition Fees', themeIcon: '🎓', category: 'Education', defaultAmount: 3500, accountType: 'Merchant / Business' },
  { id: 'm_zara', name: 'Zara Fashion Store', vpa: 'zara.retail@hdfc', theme: 'Clothing & Fashion Apparel', themeIcon: '👗', category: 'Shopping & Discretionary', defaultAmount: 2490, accountType: 'Merchant / Business' },
  { id: 'm_bescom', name: 'BESCOM Electricity Utility', vpa: 'bescom.power@billdesk', theme: 'Electricity & Utility Bills', themeIcon: '⚡', category: 'Housing & Utilities', defaultAmount: 1420, accountType: 'Merchant / Business' },
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
  const cleanInput = (inputNameOrRaw || '').trim();
  const cleanKey = cleanInput.toLowerCase();

  // 0. Check User Overrides First (Instant 100% Confidence)
  const overrides = getUserMerchantOverrides();
  if (overrides[cleanKey]) {
    const saved = overrides[cleanKey];
    return {
      theme: saved.theme,
      themeCategory: saved.category,
      themeIcon: saved.themeIcon,
      accountType: saved.category === 'Internal Transfer' || saved.category === 'Reimbursement / Split' ? 'Personal' : 'Merchant / Business',
      cleanName: cleanInput,
      confidence: 'high',
      confidenceScore: 100,
      isAmbiguous: false,
      userOverridden: true,
    };
  }

  const upper = (cleanInput + ' ' + (vpaHandle || '')).toUpperCase();

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
      confidence: 'high',
      confidenceScore: 99,
      isAmbiguous: false,
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
      cleanName: cleanInput || 'Personal Contact',
      confidence: 'high',
      confidenceScore: 96,
      isAmbiguous: false,
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
      cleanName: cleanInput || 'Spotify India',
      confidence: 'high',
      confidenceScore: 95,
      isAmbiguous: false,
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
      cleanName: cleanInput || 'Zara Fashion Store',
      confidence: 'high',
      confidenceScore: 95,
      isAmbiguous: false,
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
      cleanName: cleanInput || 'Blinkit Quick Commerce',
      confidence: 'high',
      confidenceScore: 94,
      isAmbiguous: false,
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
      cleanName: cleanInput || 'Swiggy Food Delivery',
      confidence: 'high',
      confidenceScore: 95,
      isAmbiguous: false,
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
      cleanName: cleanInput || 'Indian Oil Fuel Station',
      confidence: 'high',
      confidenceScore: 97,
      isAmbiguous: false,
    };
  }

  // 7. Insurance Premiums (e.g. LIC, Star Health, HDFC Ergo, Policybazaar)
  if (
    upper.includes('INSURANCE') || upper.includes('PREMIUM') || upper.includes('LIC') ||
    upper.includes('STAR HEALTH') || upper.includes('HDFC LIFE') || upper.includes('HDFC ERGO') ||
    upper.includes('ICICI PRU') || upper.includes('POLICYBAZAAR') || upper.includes('CARE HEALTH') ||
    upper.includes('MAX LIFE') || upper.includes('ACKO') || upper.includes('DIGIT')
  ) {
    return {
      theme: 'Life & Health Insurance Premium',
      themeCategory: 'Insurance',
      themeIcon: '🛡️',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Insurance Provider',
      confidence: 'high',
      confidenceScore: 96,
      isAmbiguous: false,
    };
  }

  // 8. Medicines & Healthcare (e.g. Apollo, Pharmacy, Clinic, Meds)
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
      cleanName: cleanInput || 'Apollo Pharmacy',
      confidence: 'high',
      confidenceScore: 95,
      isAmbiguous: false,
    };
  }

  // 9. Education & Tuition Fees (e.g. College, University, School, Tuition, Coursera)
  if (
    upper.includes('COLLEGE') || upper.includes('UNIVERSITY') || upper.includes('SCHOOL') ||
    upper.includes('TUITION') || upper.includes('FEES') || upper.includes('ACADEMY') ||
    upper.includes('INSTITUTE') || upper.includes('EDUCATION') || upper.includes('COURSERA') ||
    upper.includes('UDEMY') || upper.includes('EDX') || upper.includes('UNACADEMY') ||
    upper.includes('BYJU') || upper.includes('XAVIER')
  ) {
    return {
      theme: 'Education & Tuition Fees',
      themeCategory: 'Education',
      themeIcon: '🎓',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Educational Institution / College',
      confidence: 'high',
      confidenceScore: 96,
      isAmbiguous: false,
    };
  }

  // 10. Mutual Funds, Stocks & Investments (e.g. Zerodha, Groww, Upstox, Mutual Funds)
  if (
    upper.includes('ZERODHA') || upper.includes('GROWW') || upper.includes('UPSTOX') ||
    upper.includes('MUTUAL FUND') || upper.includes('SIP') || upper.includes('COIN') ||
    upper.includes('ANGELONE') || upper.includes('SHAREKHAN') || upper.includes('MOTILAL') ||
    upper.includes('INDMONEY') || upper.includes('KFINTECH') || upper.includes('CAMS') ||
    upper.includes('SECURITIES') || upper.includes('NPS') || upper.includes('PPF')
  ) {
    return {
      theme: 'Mutual Funds & Stock Investments',
      themeCategory: 'Investments',
      themeIcon: '📈',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Investment / Brokerage Account',
      confidence: 'high',
      confidenceScore: 97,
      isAmbiguous: false,
    };
  }

  // 11. Loan Repayment & EMI (e.g. Bajaj Finserv, Kreditbee, Cred, Loan)
  if (
    upper.includes('EMI') || upper.includes('LOAN') || upper.includes('BAJAJ FINANCE') ||
    upper.includes('BAJAJ FINSERV') || upper.includes('CREDIT CARD') || upper.includes('CRED') ||
    upper.includes('KREDITBEE') || upper.includes('HOME LOAN') || upper.includes('CAR LOAN') ||
    upper.includes('FINANCE') || upper.includes('MUTHOOT') || upper.includes('MANAPPURAM')
  ) {
    return {
      theme: 'Loan Repayment & Equated Monthly Installment',
      themeCategory: 'Loan & EMI',
      themeIcon: '💳',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Loan / Financial Institution',
      confidence: 'high',
      confidenceScore: 96,
      isAmbiguous: false,
    };
  }

  // 12. Travel, Commute & Bookings (e.g. IRCTC, MakeMyTrip, IndiGo, Uber, Ola)
  if (
    upper.includes('IRCTC') || upper.includes('RAILWAY') || upper.includes('MAKEMYTRIP') ||
    upper.includes('MMT') || upper.includes('INDIGO') || upper.includes('AIR INDIA') ||
    upper.includes('SPICEJET') || upper.includes('VISTARA') || upper.includes('UBER') ||
    upper.includes('OLA') || upper.includes('RAPIDO') || upper.includes('REDBUS') ||
    upper.includes('ABHIBUS') || upper.includes('METRO') || upper.includes('TOLL') ||
    upper.includes('FASTAG') || upper.includes('AIRPORT') || upper.includes('OYO')
  ) {
    return {
      theme: 'Flights, Trains & Travel Accommodations',
      themeCategory: 'Travel',
      themeIcon: '✈️',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Travel & Commute Booking',
      confidence: 'high',
      confidenceScore: 95,
      isAmbiguous: false,
    };
  }

  // 13. Electronics & Tech Gadgets (e.g. Croma, Reliance Digital, Apple, Samsung)
  if (
    upper.includes('CROMA') || upper.includes('RELIANCE DIGITAL') || upper.includes('VIJAY SALES') ||
    upper.includes('ELECTRONIC') || upper.includes('ELECTRONICS') || upper.includes('GADGET') ||
    upper.includes('MOBILE') || upper.includes('TECH') || upper.includes('COMPUTER') ||
    upper.includes('LAPTOP') || upper.includes('APPLE STORE') || upper.includes('SAMSUNG STORE') ||
    upper.includes('BOAT') || upper.includes('ONEPLUS')
  ) {
    return {
      theme: 'Consumer Electronics & Gadgets',
      themeCategory: 'Electronics',
      themeIcon: '💻',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Croma Electronics',
      confidence: 'high',
      confidenceScore: 93,
      isAmbiguous: false,
    };
  }

  // 14. Salon, Spa & Personal Grooming (e.g. Salon, Spa, Beauty, Parlour, Haircut)
  if (
    upper.includes('SALON') || upper.includes('SPA') || upper.includes('BEAUTY') ||
    upper.includes('PARLOUR') || upper.includes('HAIRCUT') || upper.includes('URBAN COMPANY') ||
    upper.includes('NATURALS') || upper.includes('GEETANJALI') || upper.includes('GROOMING') ||
    upper.includes('COSMETICS')
  ) {
    return {
      theme: 'Salon, Spa & Personal Grooming',
      themeCategory: 'Personal Care',
      themeIcon: '💄',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Personal Care & Salon',
      confidence: 'high',
      confidenceScore: 94,
      isAmbiguous: false,
    };
  }

  // 15. Cinema & Event Entertainment (e.g. BookMyShow, Movie, Cinema, PVR)
  if (
    upper.includes('BOOKMYSHOW') || upper.includes('CINEMA') || upper.includes('MOVIE') ||
    upper.includes('THEATRE') || upper.includes('FILM') || upper.includes('MULTIPLEX') ||
    upper.includes('PVR') || upper.includes('INOX') || upper.includes('DISNEY') ||
    upper.includes('HOTSTAR') || upper.includes('SONYLIV') || upper.includes('ZEE5') ||
    upper.includes('GAMING') || upper.includes('STEAM') || upper.includes('PLAYSTATION')
  ) {
    return {
      theme: 'Movies, Events & Live Shows',
      themeCategory: 'Entertainment',
      themeIcon: '🎟️',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'BookMyShow Entertainment',
      confidence: 'high',
      confidenceScore: 95,
      isAmbiguous: false,
    };
  }

  // 16. Electricity & Utility Bills (e.g. BESCOM, Power, Electricity)
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
      cleanName: cleanInput || 'BESCOM Electricity Utility',
      confidence: 'high',
      confidenceScore: 97,
      isAmbiguous: false,
    };
  }

  // 17. Sports & Fitness Gear (e.g. Decathlon, Gym, Sport)
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
      cleanName: cleanInput || 'Decathlon Sports Gear',
      confidence: 'high',
      confidenceScore: 94,
      isAmbiguous: false,
    };
  }

  // 18. E-Commerce Marketplaces (Amazon, Flipkart, Meesho)
  // Master prompt rule: "Do not classify every payment to Amazon as electronics or every payment to a shopping platform as a particular product type."
  if (
    upper.includes('AMAZON') || upper.includes('FLIPKART') || upper.includes('MEESHO') ||
    upper.includes('AJIO') || upper.includes('NYKAA')
  ) {
    return {
      theme: 'E-Commerce & Online Marketplace',
      themeCategory: 'Shopping & Discretionary',
      themeIcon: '📦',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'E-Commerce Marketplace',
      confidence: 'medium',
      confidenceScore: 82,
      isAmbiguous: false,
    };
  }

  // 19. AMBIGUOUS INDIAN TRADERS & ENTERPRISES (e.g. Lakshmi Traders, Hanuman Enterprises, Balaji Agencies)
  // These are generic commercial business names without clear single industry keywords
  const tradeSuffixMatch = upper.match(/\b(TRADERS|TRADER|ENTERPRISES|ENTERPRISE|AGENCIES|AGENCY|SUPPLIERS|DISTRIBUTORS|DISTRIBUTOR|ASSOCIATES|VENTURES|VENTURE|COMMERCIAL|BHANDAR|EMPORIUM)\b/);
  if (tradeSuffixMatch) {
    const keyword = tradeSuffixMatch[0];
    const isTrader = /TRADER|BHANDAR/i.test(keyword);
    const suggestedCategories: Category[] = [
      'Groceries',
      'Housing & Utilities',
      'Shopping & Discretionary',
      'Dining & Nightlife',
      'Transport & Fuel',
      'Healthcare',
      'Education',
      'Personal Care',
      'Other / Unknown'
    ];

    return {
      theme: `Commercial ${keyword} (Review Needed)`,
      themeCategory: isTrader ? 'Groceries' : 'Housing & Utilities',
      themeIcon: isTrader ? '🥦' : '🏠',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || `${keyword} Store`,
      confidence: 'low',
      confidenceScore: 48,
      isAmbiguous: true,
      needsReview: true,
      ambiguityReason: `Generic business keyword "${keyword}" detected. Stores like "${cleanInput}" can belong to Groceries, Hardware/Utilities, or Retail Shopping.`,
      suggestedCategories,
    };
  }

  // Fallback: Check commercial gateway signatures vs generic unknown
  const isCommercial = /\b(PVT LTD|LIMITED|LTD|CORP|INC|STORE|STORES|MART|RETAIL|SHOP|SERVICES|SOLUTIONS|PAY|BILL|POS|QR)\b/i.test(upper) ||
    (vpaHandle && (vpaHandle.includes('.bd') || vpaHandle.includes('@yesb') || vpaHandle.includes('@okbizaxis') || vpaHandle.includes('@bharatpe')));

  if (isCommercial) {
    return {
      theme: 'Commercial Merchant Store',
      themeCategory: 'Other / Unknown',
      themeIcon: '🏪',
      accountType: 'Merchant / Business',
      cleanName: cleanInput || 'Merchant Store',
      confidence: 'low',
      confidenceScore: 46,
      isAmbiguous: true,
      needsReview: true,
      ambiguityReason: 'Commercial vendor detected without established product category evidence.',
      suggestedCategories: [
        'Groceries',
        'Dining & Nightlife',
        'Shopping & Discretionary',
        'Housing & Utilities',
        'Transport & Fuel',
        'Healthcare',
        'Personal Care',
        'Other / Unknown'
      ],
    };
  }

  // Unknown peer or unclassified transfer
  return {
    theme: 'Unclassified Entity (Review Needed)',
    themeCategory: 'Other / Unknown',
    themeIcon: '❓',
    accountType: 'Personal',
    cleanName: cleanInput || 'Unknown Contact',
    confidence: 'low',
    confidenceScore: 40,
    isAmbiguous: true,
    needsReview: true,
    ambiguityReason: 'Insufficient transaction evidence to reliably determine spending category.',
    suggestedCategories: [
      'Reimbursement / Split',
      'Internal Transfer',
      'Shopping & Discretionary',
      'Dining & Nightlife',
      'Groceries',
      'Other / Unknown'
    ]
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
  isAmbiguous?: boolean;
  needsReview?: boolean;
  ambiguityReason?: string;
  suggestedCategories?: Category[];
  userOverridden?: boolean;
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
    tier: themeInfo.accountType === 'Personal' 
      ? 'Transfer_or_Offset' 
      : (['Housing & Utilities', 'Groceries', 'Healthcare', 'Education', 'Insurance', 'Transport & Fuel'].includes(themeInfo.themeCategory) ? 'Essential' : 'Discretionary'),
    isSelfTransfer: false,
    isRecurring: false,
    isRefund: false,
    confidenceScore: themeInfo.confidenceScore / 100,
    isAmbiguous: themeInfo.isAmbiguous,
    needsReview: !!themeInfo.needsReview,
    ambiguityReason: themeInfo.ambiguityReason,
    suggestedCategories: themeInfo.suggestedCategories,
    userOverridden: themeInfo.userOverridden
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
    unnecessaryExpenditureTotal: number;
    unnecessaryExpenditureCount: number;
    unnecessaryPercentage: number;
    unnecessarySIPProjection5Yr: number;
    unnecessarySIPProjection10Yr: number;
  };
} {
  // Step 1: Process each transaction with UPI engine and classify Merchant vs Personal
  const enriched: EnrichedTransaction[] = rawTxs.map(tx => {
    const info = extractUPIEntity(tx.rawDescription, tx.payeeName, tx.vpaHandle);
    let category = tx.category ? (tx.category as Category) : info.category;
    let tier = tx.category ? (tx.category === 'Internal Transfer' || tx.category === 'Reimbursement / Split' ? 'Transfer_or_Offset' : 'Discretionary') : info.tier;
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

    const userOverridden = !!userOverrides[tx.id] || !!tx.userOverridden || !!info.userOverridden;
    const isAmbiguous = userOverridden ? false : (tx.isAmbiguous !== undefined ? tx.isAmbiguous : info.isAmbiguous);
    const needsReview = userOverridden ? false : (tx.needsReview !== undefined ? tx.needsReview : info.needsReview);

    const unnecessaryDetection = detectUnnecessaryExpenditure({
      amount: tx.amount,
      category,
      cleanMerchant: tx.payeeName || info.cleanName,
      payeeName: tx.payeeName,
      rawDescription: tx.rawDescription,
      timestamp: tx.timestamp,
      isUnnecessary: tx.isUnnecessary,
      unnecessaryReason: tx.unnecessaryReason,
    });

    return {
      ...tx,
      cleanMerchant: tx.payeeName || info.cleanName,
      accountType: tx.accountType || info.accountType,
      theme: tx.theme || info.theme,
      themeIcon: tx.themeIcon || info.themeIcon,
      category,
      tier,
      isRecurring: info.isRecurring,
      isInternalTransfer: info.isSelfTransfer,
      isRefundOrReversal: info.isRefund,
      isSharedSplitExpense: false,
      netOutflowAmount: tx.amount < 0 ? Math.abs(tx.amount) : 0,
      confidenceScore: userOverridden ? 1.0 : (tx.confidenceScore ? tx.confidenceScore / 100 : confidenceScore),
      userOverridden,
      isAmbiguous,
      needsReview,
      isUnnecessary: unnecessaryDetection.isUnnecessary,
      unnecessaryReason: unnecessaryDetection.unnecessaryReason,
      spendNature: unnecessaryDetection.spendNature,
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

  const unnecessaryTxs = enriched.filter(t => t.amount < 0 && t.isUnnecessary && !t.isInternalTransfer);
  const unnecessaryExpenditureTotal = unnecessaryTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const unnecessaryExpenditureCount = unnecessaryTxs.length;
  const unnecessaryPercentage = trueLivingExpenses > 0 
    ? Math.round((unnecessaryExpenditureTotal / trueLivingExpenses) * 100) 
    : 0;

  // 14.5% AMFI Historical Index CAGR Compounded Monthly SIP formula
  const monthlyRate = 0.145 / 12;
  const unnecessarySIPProjection5Yr = unnecessaryExpenditureTotal > 0
    ? Math.round(unnecessaryExpenditureTotal * ((Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate) * (1 + monthlyRate))
    : 0;
  const unnecessarySIPProjection10Yr = unnecessaryExpenditureTotal > 0
    ? Math.round(unnecessaryExpenditureTotal * ((Math.pow(1 + monthlyRate, 120) - 1) / monthlyRate) * (1 + monthlyRate))
    : 0;

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
      personalCount,
      unnecessaryExpenditureTotal,
      unnecessaryExpenditureCount,
      unnecessaryPercentage,
      unnecessarySIPProjection5Yr,
      unnecessarySIPProjection10Yr,
    }
  };
}
