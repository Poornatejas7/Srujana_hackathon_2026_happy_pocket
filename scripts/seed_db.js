const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const TransactionSchema = new mongoose.Schema(
  {
    accountId: { type: String, default: 'acc_primary_sbi', index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    rawDescription: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    txMode: { type: String, default: 'UPI' },
    upiRrn: { type: String, index: true },
    payeeName: { type: String },
    bankCode: { type: String },
    vpaHandle: { type: String },
    remark: { type: String },
    cleanMerchant: { type: String, index: true },
    accountType: { 
      type: String, 
      enum: ['Merchant / Business', 'Personal'], 
      default: 'Personal', 
      index: true 
    },
    direction: { 
      type: String, 
      enum: ['DEBIT', 'CREDIT'], 
      default: 'DEBIT' 
    },
    theme: { type: String, index: true },
    themeIcon: { type: String },
    category: { type: String, default: 'Shopping & Discretionary', index: true },
    tier: { type: String, default: 'Discretionary', index: true },
    isRecurring: { type: Boolean, default: false },
    isInternalTransfer: { type: Boolean, default: false },
    isRefundOrReversal: { type: Boolean, default: false },
    netOutflowAmount: { type: Number },
    userOverridden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TransactionSchema.index({ accountType: 1, category: 1 });
TransactionSchema.index({ accountType: 1, timestamp: -1 });

const TransactionModel = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

/**
 * 12 Curated Merchant Accounts + 5 Curated Personal Accounts
 * Demonstrating REAL-WORLD behavior: the same merchant receives DIFFERENT particular amounts each time!
 */
const sampleTransactions = [
  // ==========================================
  // 12 DISTINCT MERCHANT ACCOUNTS (Diverse Themes with Multiple Varying Transfers)
  // ==========================================

  // 1. Spotify India (Theme: Music & Audio Streaming)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-01T08:00:00Z'),
    amount: -119.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '992837162541',
    rawDescription: 'WDL TFR UPI/DR/992837162541/SPOTIFY INDIA/HDFC/spotify@icici/Music Stream',
    payeeName: 'Spotify India',
    cleanMerchant: 'Spotify India',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'spotify@icici',
    theme: 'Music & Audio Streaming',
    themeIcon: '🎵',
    category: 'Subscriptions & Digital',
    tier: 'Discretionary',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 119.00,
    remark: 'Premium Individual Monthly Subscription'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-18T10:30:00Z'),
    amount: -29.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '992837162542',
    rawDescription: 'WDL TFR UPI/DR/992837162542/SPOTIFY INDIA/HDFC/spotify@icici/Audiobook Extra',
    payeeName: 'Spotify India',
    cleanMerchant: 'Spotify India',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'spotify@icici',
    theme: 'Music & Audio Streaming',
    themeIcon: '🎵',
    category: 'Subscriptions & Digital',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 29.00,
    remark: 'Audiobook Chapter Add-on'
  },

  // 2. Zara Fashion Store (Theme: Clothing & Fashion Apparel - Varying Amounts)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-03T16:20:00Z'),
    amount: -2490.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '391028475619',
    rawDescription: 'WDL TFR UPI/DR/391028475619/ZARA FASHION/HDFC/zara.retail@hdfc/Clothing',
    payeeName: 'Zara Fashion Store',
    cleanMerchant: 'Zara Fashion Store',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'zara.retail@hdfc',
    theme: 'Clothing & Fashion Apparel',
    themeIcon: '👗',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 2490.00,
    remark: 'Autumn Linen Shirt'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-20T14:15:00Z'),
    amount: -4200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '391028475620',
    rawDescription: 'WDL TFR UPI/DR/391028475620/ZARA FASHION/HDFC/zara.retail@hdfc/Denim Jacket',
    payeeName: 'Zara Fashion Store',
    cleanMerchant: 'Zara Fashion Store',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'zara.retail@hdfc',
    theme: 'Clothing & Fashion Apparel',
    themeIcon: '👗',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 4200.00,
    remark: 'Denim Jacket & Leather Belt'
  },

  // 3. Blinkit Quick Commerce (Theme: Groceries & Daily Essentials - 3 Distinct Amounts)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-05T08:30:00Z'),
    amount: -480.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '772910384619',
    rawDescription: 'WDL TFR UPI/DR/772910384619/BLINKIT/ICIC/blinkit.fresh@icici/Groceries',
    payeeName: 'Blinkit Quick Commerce',
    cleanMerchant: 'Blinkit Quick Commerce',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'blinkit.fresh@icici',
    theme: 'Groceries & Daily Essentials',
    themeIcon: '🥦',
    category: 'Groceries',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 480.00,
    remark: 'Organic Vegetables & Dairy Milk'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-16T11:15:00Z'),
    amount: -1299.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '772910384620',
    rawDescription: 'WDL TFR UPI/DR/772910384620/BLINKIT/ICIC/blinkit.fresh@icici/Weekly Groceries',
    payeeName: 'Blinkit Quick Commerce',
    cleanMerchant: 'Blinkit Quick Commerce',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'blinkit.fresh@icici',
    theme: 'Groceries & Daily Essentials',
    themeIcon: '🥦',
    category: 'Groceries',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1299.00,
    remark: 'Weekly Household Pantry Essentials'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-24T19:40:00Z'),
    amount: -245.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '772910384621',
    rawDescription: 'WDL TFR UPI/DR/772910384621/BLINKIT/ICIC/blinkit.fresh@icici/Snacks',
    payeeName: 'Blinkit Quick Commerce',
    cleanMerchant: 'Blinkit Quick Commerce',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'blinkit.fresh@icici',
    theme: 'Groceries & Daily Essentials',
    themeIcon: '🥦',
    category: 'Groceries',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 245.00,
    remark: 'Evening Snacks & Cold Pressed Juice'
  },

  // 4. Swiggy Food Delivery (Theme: Food & Dining Delivery - 3 Distinct Amounts)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-07T13:15:00Z'),
    amount: -350.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '429182001928',
    rawDescription: 'WDL TFR UPI/DR/429182001928/SWIGGY/ICIC/swiggy.orders@icici/Food',
    payeeName: 'Swiggy Food Delivery',
    cleanMerchant: 'Swiggy Food Delivery',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'swiggy.orders@icici',
    theme: 'Food & Dining Delivery',
    themeIcon: '🍔',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 350.00,
    remark: 'Weekday Lunch Bowl'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-18T20:30:00Z'),
    amount: -720.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '429182001929',
    rawDescription: 'WDL TFR UPI/DR/429182001929/SWIGGY/ICIC/swiggy.orders@icici/Dinner Gourmet',
    payeeName: 'Swiggy Food Delivery',
    cleanMerchant: 'Swiggy Food Delivery',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'swiggy.orders@icici',
    theme: 'Food & Dining Delivery',
    themeIcon: '🍔',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 720.00,
    remark: 'Weekend Gourmet Dinner with Dessert'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-22T17:00:00Z'),
    amount: -180.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '429182001930',
    rawDescription: 'WDL TFR UPI/DR/429182001930/SWIGGY/ICIC/swiggy.orders@icici/Coffee Snack',
    payeeName: 'Swiggy Food Delivery',
    cleanMerchant: 'Swiggy Food Delivery',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'swiggy.orders@icici',
    theme: 'Food & Dining Delivery',
    themeIcon: '🍔',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 180.00,
    remark: 'Artisanal Coffee & Cookies'
  },

  // 5. Zomato Restaurant (Theme: Food & Dining Delivery)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-09T20:45:00Z'),
    amount: -620.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '581920394812',
    rawDescription: 'WDL TFR UPI/DR/581920394812/ZOMATO DINING/HDFC/zomato.pay@hdfc/Bistro Dinner',
    payeeName: 'Zomato Dining & Bistro',
    cleanMerchant: 'Zomato Dining & Bistro',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'zomato.pay@hdfc',
    theme: 'Food & Dining Delivery',
    themeIcon: '🍕',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 620.00,
    remark: 'Woodfired Pizza & Mocktails'
  },

  // 6. Indian Oil Fuel Station (Theme: Fuel & Petroleum - 2 Distinct Amounts)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-11T11:00:00Z'),
    amount: -500.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '883719284710',
    rawDescription: 'WDL TFR UPI/DR/883719284710/INDIAN OIL/SBIN/iocl.fuels@sbi/Petrol',
    payeeName: 'Indian Oil Fuel Station',
    cleanMerchant: 'Indian Oil Fuel Station',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'SBIN',
    vpaHandle: 'iocl.fuels@sbi',
    theme: 'Fuel & Petroleum',
    themeIcon: '⛽',
    category: 'Transport & Fuel',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 500.00,
    remark: 'City Commute Petrol Top-Up'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-21T18:45:00Z'),
    amount: -2100.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '883719284711',
    rawDescription: 'WDL TFR UPI/DR/883719284711/INDIAN OIL/SBIN/iocl.fuels@sbi/Full Tank',
    payeeName: 'Indian Oil Fuel Station',
    cleanMerchant: 'Indian Oil Fuel Station',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'SBIN',
    vpaHandle: 'iocl.fuels@sbi',
    theme: 'Fuel & Petroleum',
    themeIcon: '⛽',
    category: 'Transport & Fuel',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 2100.00,
    remark: 'Highway Long Drive Full Tank Fuel'
  },

  // 7. Apollo Pharmacy (Theme: Medicines & Healthcare - 2 Distinct Amounts)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-13T18:10:00Z'),
    amount: -380.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '662910482019',
    rawDescription: 'WDL TFR UPI/DR/662910482019/APOLLO PHARMACY/ICIC/apollo.meds@icici/Medicines',
    payeeName: 'Apollo Pharmacy',
    cleanMerchant: 'Apollo Pharmacy',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'apollo.meds@icici',
    theme: 'Medicines & Healthcare',
    themeIcon: '💊',
    category: 'Healthcare',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 380.00,
    remark: 'Prescription Vitamins & First Aid Kit'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-22T10:20:00Z'),
    amount: -950.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '662910482020',
    rawDescription: 'WDL TFR UPI/DR/662910482020/APOLLO PHARMACY/ICIC/apollo.meds@icici/Prescriptions',
    payeeName: 'Apollo Pharmacy',
    cleanMerchant: 'Apollo Pharmacy',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'apollo.meds@icici',
    theme: 'Medicines & Healthcare',
    themeIcon: '💊',
    category: 'Healthcare',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 950.00,
    remark: 'Monthly Health Care & Diagnostics Kit'
  },

  // 8. Amazon India Store (Theme: E-Commerce & Retail Shopping)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-15T14:30:00Z'),
    amount: -1450.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '739102847192',
    rawDescription: 'WDL TFR UPI/DR/739102847192/AMAZON INDIA/APL/amazonpay@apl/Online Shopping',
    payeeName: 'Amazon India Store',
    cleanMerchant: 'Amazon India Store',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'APL',
    vpaHandle: 'amazonpay@apl',
    theme: 'E-Commerce & Retail Shopping',
    themeIcon: '📦',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1450.00,
    remark: 'Home Organizers & Desk Lamp'
  },

  // 9. Croma Electronics (Theme: Electronics & Tech Gadgets - 2 Distinct Amounts)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-17T17:00:00Z'),
    amount: -2200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '849102847591',
    rawDescription: 'WDL TFR UPI/DR/849102847591/CROMA/TATAPAY/croma.tech@tatapay/Gadgets',
    payeeName: 'Croma Electronics',
    cleanMerchant: 'Croma Electronics',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'TATAPAY',
    vpaHandle: 'croma.tech@tatapay',
    theme: 'Electronics & Tech Gadgets',
    themeIcon: '💻',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 2200.00,
    remark: 'Wireless Mechanical Keyboard'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-23T12:30:00Z'),
    amount: -699.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '849102847592',
    rawDescription: 'WDL TFR UPI/DR/849102847592/CROMA/TATAPAY/croma.tech@tatapay/Charger Cable',
    payeeName: 'Croma Electronics',
    cleanMerchant: 'Croma Electronics',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'TATAPAY',
    vpaHandle: 'croma.tech@tatapay',
    theme: 'Electronics & Tech Gadgets',
    themeIcon: '💻',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 699.00,
    remark: 'Braided Type-C Fast Charger Cable'
  },

  // 10. BookMyShow Entertainment (Theme: Cinema & Event Tickets)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-19T19:30:00Z'),
    amount: -550.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '951028374619',
    rawDescription: 'WDL TFR UPI/DR/951028374619/BOOKMYSHOW/KOTAK/bookmyshow@kotak/Movie Tickets',
    payeeName: 'BookMyShow Entertainment',
    cleanMerchant: 'BookMyShow Entertainment',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'KOTAK',
    vpaHandle: 'bookmyshow@kotak',
    theme: 'Cinema & Event Tickets',
    themeIcon: '🎬',
    category: 'Subscriptions & Digital',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 550.00,
    remark: 'IMAX Cinema Tickets'
  },

  // 11. BESCOM Electricity Utility (Theme: Electricity & Utility Bills)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-21T10:00:00Z'),
    amount: -1420.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '661928475819',
    rawDescription: 'WDL TFR UPI/DR/661928475819/BESCOM POWER/BILLDESK/bescom.power@billdesk/Power Bill',
    payeeName: 'BESCOM Electricity Utility',
    cleanMerchant: 'BESCOM Electricity Utility',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'BILLDESK',
    vpaHandle: 'bescom.power@billdesk',
    theme: 'Electricity & Utility Bills',
    themeIcon: '⚡',
    category: 'Housing & Utilities',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1420.00,
    remark: 'Monthly Residential Electricity Bill'
  },

  // 12. Decathlon Sports Gear (Theme: Sports & Fitness Equipment)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-23T15:45:00Z'),
    amount: -999.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '741029485712',
    rawDescription: 'WDL TFR UPI/DR/741029485712/DECATHLON/AXIS/decathlon.gear@axisbank/Sports Gear',
    payeeName: 'Decathlon Sports Gear',
    cleanMerchant: 'Decathlon Sports Gear',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'AXIS',
    vpaHandle: 'decathlon.gear@axisbank',
    theme: 'Sports & Fitness Equipment',
    themeIcon: '🏃',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 999.00,
    remark: 'Running Shoes & Fitness Resistance Bands'
  },

  // ==========================================
  // 5 DISTINCT PERSONAL ACCOUNTS (Multiple Real-World Varying Transfers)
  // ==========================================

  // 1. Kotresh C (Self Canara Bank Own A/C - Theme: Self-Transfer (Own A/C))
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-02T11:00:00Z'),
    amount: -5000.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '656771804358',
    rawDescription: 'WDL TFR UPI/DR/656771804358/KOTRESH C/CNRB/mykotresh@cnrb/Self Transfer',
    payeeName: 'Kotresh C',
    cleanMerchant: 'Self-Transfer (Kotresh C - Canara Bank / Own A/C)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'CNRB',
    vpaHandle: 'mykotresh@cnrb',
    theme: 'Self-Transfer (Own A/C)',
    themeIcon: '🏦',
    category: 'Internal Transfer',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: true,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Self Transfer Own Canara Bank Savings'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-15T16:00:00Z'),
    amount: -2500.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '656771804359',
    rawDescription: 'WDL TFR UPI/DR/656771804359/KOTRESH C/CNRB/mykotresh@cnrb/Emergency Reserve',
    payeeName: 'Kotresh C',
    cleanMerchant: 'Self-Transfer (Kotresh C - Canara Bank / Own A/C)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'CNRB',
    vpaHandle: 'mykotresh@cnrb',
    theme: 'Self-Transfer (Own A/C)',
    themeIcon: '🏦',
    category: 'Internal Transfer',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: true,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Emergency Reserve Deposit to Canara A/C'
  },

  // 2. Veerabhadrappa C (Father - Theme: Family Support Transfer)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-06T12:30:00Z'),
    amount: -3000.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '902816401923',
    rawDescription: 'WDL TFR UPI/DR/902816401923/VEERABHADRAPPA C/SBIN/veeru@oksbi/Family Support',
    payeeName: 'Veerabhadrappa C',
    cleanMerchant: 'Veerabhadrappa C (Family Transfer)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'SBIN',
    vpaHandle: 'veeru@oksbi',
    theme: 'Family Support Transfer',
    themeIcon: '👨‍👦',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Family Support Monthly Transfer'
  },

  // 3. Harsha K (Roommate - Theme: Shared Rent & Bill Split - 3 Distinct Transfers)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-10T10:15:00Z'),
    amount: -1800.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '819283019283',
    rawDescription: 'WDL TFR UPI/DR/819283019283/HARSHA K/HDFC/harsha@okhdfc/Flat Split',
    payeeName: 'Harsha K',
    cleanMerchant: 'Harsha K (Roommate)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'harsha@okhdfc',
    theme: 'Shared Rent & Bill Split',
    themeIcon: '🤝',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Shared Apartment Internet & Cook Split'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-19T21:00:00Z'),
    amount: -450.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '819283019284',
    rawDescription: 'WDL TFR UPI/DR/819283019284/HARSHA K/HDFC/harsha@okhdfc/Groceries Share',
    payeeName: 'Harsha K',
    cleanMerchant: 'Harsha K (Roommate)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'harsha@okhdfc',
    theme: 'Shared Rent & Bill Split',
    themeIcon: '🤝',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Weekend Groceries Share Reimbursement'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-25T09:00:00Z'),
    amount: -3200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '819283019285',
    rawDescription: 'WDL TFR UPI/DR/819283019285/HARSHA K/HDFC/harsha@okhdfc/Electricity Share',
    payeeName: 'Harsha K',
    cleanMerchant: 'Harsha K (Roommate)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'harsha@okhdfc',
    theme: 'Shared Rent & Bill Split',
    themeIcon: '🤝',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Apartment Maintenance & Electricity Split'
  },

  // 4. Priya Sharma (Colleague - Theme: Work Lunch & Taxi Share - 2 Distinct Transfers)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-14T14:00:00Z'),
    amount: -450.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '912837465910',
    rawDescription: 'WDL TFR UPI/DR/912837465910/PRIYA SHARMA/AXIS/priya.sharma@okaxis/Lunch Share',
    payeeName: 'Priya Sharma',
    cleanMerchant: 'Priya Sharma (Colleague)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'AXIS',
    vpaHandle: 'priya.sharma@okaxis',
    theme: 'Work Lunch & Taxi Share',
    themeIcon: '🥗',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Team Lunch Share Reimbursement'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-23T18:45:00Z'),
    amount: -280.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '912837465911',
    rawDescription: 'WDL TFR UPI/DR/912837465911/PRIYA SHARMA/AXIS/priya.sharma@okaxis/Uber Share',
    payeeName: 'Priya Sharma',
    cleanMerchant: 'Priya Sharma (Colleague)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'AXIS',
    vpaHandle: 'priya.sharma@okaxis',
    theme: 'Work Lunch & Taxi Share',
    themeIcon: '🥗',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Office Return Uber Taxi Share'
  },

  // 5. Rahul Verma (Friend - Theme: Personal Reimbursement)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-18T18:30:00Z'),
    amount: -1200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '829103948571',
    rawDescription: 'WDL TFR UPI/DR/829103948571/RAHUL VERMA/PAYTM/rahul.verma@paytm/Reimbursement',
    payeeName: 'Rahul Verma',
    cleanMerchant: 'Rahul Verma (Friend)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'PAYTM',
    vpaHandle: 'rahul.verma@paytm',
    theme: 'Personal Reimbursement',
    themeIcon: '💸',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Weekend Roadtrip Fuel & Toll Reimbursement'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to database: "${mongoose.connection.name}"`);

    // Clear old records to seed pristine, categorized records
    await TransactionModel.deleteMany({});
    console.log('Cleared previous collection.');

    const inserted = await TransactionModel.insertMany(sampleTransactions);
    console.log(`\n======================================================`);
    console.log(`SUCCESS! Seeded ${inserted.length} real-world transactions into MongoDB Atlas.`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Collection: transactions`);
    
    const merchantCount = inserted.filter(t => t.accountType === 'Merchant / Business').length;
    const personalCount = inserted.filter(t => t.accountType === 'Personal').length;
    console.log(`- Merchant / Business Transfers: ${merchantCount}`);
    console.log(`- Personal Transfers: ${personalCount}`);
    console.log(`======================================================\n`);

    // Group by payee to show varying transfer amounts
    const payeeGroups = {};
    inserted.forEach(t => {
      if (!payeeGroups[t.cleanMerchant]) payeeGroups[t.cleanMerchant] = [];
      payeeGroups[t.cleanMerchant].push(Math.abs(t.amount));
    });

    console.log('Account Particular Amounts Transferred Each Time:');
    Object.entries(payeeGroups).forEach(([name, amounts]) => {
      console.log(` • ${name} (${amounts.length} times): [₹${amounts.join(', ₹')}]`);
    });

    await mongoose.disconnect();
    console.log('\nDatabase connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
