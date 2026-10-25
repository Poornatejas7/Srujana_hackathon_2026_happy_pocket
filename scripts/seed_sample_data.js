const mongoose = require('mongoose');
const uri = 'mongodb+srv://mykotresh_db_user:ROSTZ9GaDGOqjmaV@cluster0.0bnasia.mongodb.net/happypocket?appName=Cluster0';

const sampleTransactions = [
  // 1. Monthly Salary Credit (NEFT Inflow)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 24 * 86400000), // 24 days ago
    rawDescription: 'NEFT CR TECH CORP INDIA SALARY OCT 991823',
    amount: 45000.0,
    currency: 'INR',
    txMode: 'NEFT',
    upiRrn: '992817263541',
    payeeName: 'Tech Corp India Pvt Ltd',
    cleanMerchant: 'Tech Corp India',
    accountType: 'Merchant / Business',
    direction: 'CREDIT',
    theme: 'Monthly Salary Credit',
    themeIcon: '💼',
    category: 'Income',
    tier: 'Income',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    confidenceScore: 99,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 2. Daily Groceries & Supermarket
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 21 * 86400000), // 21 days ago
    rawDescription: 'UPI/P2M/LAKSHMI KIRANA/881923/HDFC/lakshmikirana@upi',
    amount: -480.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '881923104928',
    payeeName: 'Sri Lakshmi Kirana Stores',
    cleanMerchant: 'Sri Lakshmi Kirana',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Daily Essentials & Groceries',
    themeIcon: '🛒',
    category: 'Groceries',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 480.0,
    confidenceScore: 95,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 3. Quick Commerce (Blinkit 10-min groceries)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 19 * 86400000), // 19 days ago
    rawDescription: 'UPI/P2M/BLINKIT BANGALORE/882736/HDFC/blinkit@icici',
    amount: -350.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '882736192847',
    payeeName: 'Blinkit Commerce Pvt Ltd',
    cleanMerchant: 'Blinkit Quick Commerce',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Quick Delivery Groceries',
    themeIcon: '⚡',
    category: 'Groceries',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 350.0,
    confidenceScore: 95,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 4. Late Night Food Delivery - Impulse Avoidable Leakage
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 17 * 86400000), // 17 days ago
    rawDescription: 'UPI/P2M/SWIGGY FOOD/883921/HDFC/swiggy@axisbank',
    amount: -420.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '883921928374',
    payeeName: 'Swiggy Food Delivery',
    cleanMerchant: 'Swiggy Food Delivery',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Food Delivery Order',
    themeIcon: '🍔',
    category: 'Dining & Delivery',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 420.0,
    confidenceScore: 92,
    isUnnecessary: true,
    unnecessaryReason: 'Impulse late-night food ordering',
    spendNature: 'Unnecessary_Leakage',
    needsReview: false,
  },

  // 5. Local Bakery & Sweets
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 15 * 86400000), // 15 days ago
    rawDescription: 'UPI/P2M/IYENGAR BAKERY/884719/HDFC/iyengarbakery@okaxis',
    amount: -160.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '884719283741',
    payeeName: 'Iyengar Bakery & Sweets',
    cleanMerchant: 'Iyengar Bakery',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Snacks & Bakery',
    themeIcon: '☕',
    category: 'Dining & Delivery',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 160.0,
    confidenceScore: 90,
    spendNature: 'Want',
    isUnnecessary: false,
    needsReview: false,
  },

  // 6. BESCOM Electricity Utility Bill
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 14 * 86400000), // 14 days ago
    rawDescription: 'UPI/P2M/BESCOM ELECTRICITY/885612/HDFC/bescom@billdesk',
    amount: -1420.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '885612938471',
    payeeName: 'BESCOM Electricity Bangalore',
    cleanMerchant: 'BESCOM Electricity',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Monthly Power Utility',
    themeIcon: '💡',
    category: 'Housing & Utilities',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1420.0,
    confidenceScore: 98,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 7. Indian Oil Petrol Pump
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 12 * 86400000), // 12 days ago
    rawDescription: 'UPI/P2M/INDIAN OIL INDIRANAGAR/886523/HDFC/iocpumphdfc@okhdfcbank',
    amount: -600.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '886523918273',
    payeeName: 'Indian Oil Corporation Petrol Pump',
    cleanMerchant: 'Indian Oil Station',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Vehicle Petrol Refuel',
    themeIcon: '⛽',
    category: 'Transport & Fuel',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 600.0,
    confidenceScore: 96,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 8. Apollo Pharmacy
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 10 * 86400000), // 10 days ago
    rawDescription: 'UPI/P2M/APOLLO PHARMACY/887419/HDFC/apollopharmacy@hdfc',
    amount: -380.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '887419382910',
    payeeName: 'Apollo Pharmacy Indira Nagar',
    cleanMerchant: 'Apollo Pharmacy',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Prescription Medicine',
    themeIcon: '💊',
    category: 'Healthcare & Wellness',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 380.0,
    confidenceScore: 95,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 9. Zara Fast Fashion - Impulse Avoidable Leakage
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 8 * 86400000), // 8 days ago
    rawDescription: 'UPI/P2M/ZARA RETAIL INDIA/888321/HDFC/zara@hdfcbank',
    amount: -2490.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '888321829102',
    payeeName: 'Zara Retail Fashion India',
    cleanMerchant: 'Zara Fashion Store',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Fast Fashion Purchase',
    themeIcon: '🛍️',
    category: 'Shopping & Fashion',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 2490.0,
    confidenceScore: 93,
    isUnnecessary: true,
    unnecessaryReason: 'Fast fashion impulse purchase',
    spendNature: 'Unnecessary_Leakage',
    needsReview: false,
  },

  // 10. Amazon India Marketplace
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 6 * 86400000), // 6 days ago
    rawDescription: 'UPI/P2M/AMAZON PAY INDIA/889218/HDFC/amazonpay@icici',
    amount: -899.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '889218392019',
    payeeName: 'Amazon Seller Services India',
    cleanMerchant: 'Amazon India',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Home & Kitchen Essentials',
    themeIcon: '📦',
    category: 'Shopping & Fashion',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 899.0,
    confidenceScore: 94,
    spendNature: 'Want',
    isUnnecessary: false,
    needsReview: false,
  },

  // 11. Spotify India Monthly Subscription
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 5 * 86400000), // 5 days ago
    rawDescription: 'UPI/AUTOPAY/SPOTIFY INDIA/890123/HDFC/spotify@sbi',
    amount: -119.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '890123491823',
    payeeName: 'Spotify India Entertainment',
    cleanMerchant: 'Spotify India',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Audio Streaming Plan',
    themeIcon: '🎵',
    category: 'Subscriptions & Digital',
    tier: 'Discretionary',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 119.0,
    confidenceScore: 97,
    spendNature: 'Want',
    isUnnecessary: false,
    needsReview: false,
  },

  // 12. P2P Personal Transfer - Roommate Rent/Wi-Fi Split
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 4 * 86400000), // 4 days ago
    rawDescription: 'UPI/P2P/HARSHA K APARTMENT SPLIT/891234/HDFC/harsha@okhdfcbank',
    amount: -3500.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '891234918274',
    payeeName: 'K Harsha',
    cleanMerchant: 'K Harsha',
    accountType: 'Personal',
    direction: 'DEBIT',
    theme: 'Shared Apartment & Wi-Fi Split',
    themeIcon: '👥',
    category: 'Personal Transfers',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 3500.0,
    confidenceScore: 92,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 13. P2P Personal Transfer - Father Support
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 3 * 86400000), // 3 days ago
    rawDescription: 'UPI/P2P/VEERABHADRAPPA C HOME ALLOWANCE/892345/HDFC/veerabhadrappa@sbi',
    amount: -4000.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '892345829103',
    payeeName: 'Veerabhadrappa C',
    cleanMerchant: 'Veerabhadrappa C',
    accountType: 'Personal',
    direction: 'DEBIT',
    theme: 'Monthly Home Allowance',
    themeIcon: '👨‍👩‍👧',
    category: 'Family & Childcare',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 4000.0,
    confidenceScore: 95,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 14. P2P Inflow / Credit - Priya Work Lunch Reimbursement
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
    rawDescription: 'UPI/P2P/PRIYA SHARMA LUNCH REIMBURSE/893456/HDFC/priyasharma@okaxis',
    amount: 450.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '893456829102',
    payeeName: 'Priya Sharma',
    cleanMerchant: 'Priya Sharma',
    accountType: 'Personal',
    direction: 'CREDIT',
    theme: 'Team Lunch Reimbursement',
    themeIcon: '🤝',
    category: 'Personal Transfers',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    confidenceScore: 91,
    spendNature: 'Need',
    isUnnecessary: false,
    needsReview: false,
  },

  // 15. Unclassified / Ambiguous Transaction - Needs Review
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date(Date.now() - 1 * 86400000), // 1 day ago
    rawDescription: 'UPI/P2M/BALAJI TRADERS BANGALORE/894567/HDFC/balajitraders@icici',
    amount: -750.0,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '894567291038',
    payeeName: 'Balaji Traders & Enterprises',
    cleanMerchant: 'Balaji Enterprises',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Unclassified Vendor Review',
    themeIcon: '❓',
    category: 'Other Expenses',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 750.0,
    confidenceScore: 40,
    isAmbiguous: true,
    needsReview: true,
    spendNature: 'Want',
    isUnnecessary: false,
    remark: 'Requires user verification and classification',
  },
];

async function seedData() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas.');

    // 1. Clear old transactions
    await mongoose.connection.collection('transactions').deleteMany({});
    console.log('Cleared existing transactions.');

    // 2. Insert curated meaningful sample transactions
    const result = await mongoose.connection.collection('transactions').insertMany(sampleTransactions);
    console.log(`Successfully seeded ${result.insertedCount} meaningful transactions.`);

    // 3. Set primary account balance to ₹34,432.00 (reflecting ₹45,450 inflow - ₹15,568 outflow + ₹4,550 base)
    const targetBalance = 34432.00;
    await mongoose.connection.collection('bankaccounts').updateOne(
      { isPrimaryUser: true },
      { 
        $set: { 
          balance: targetBalance,
          bankName: 'HDFC Bank',
          accountHolder: 'Kotresh C',
          accountNumber: '50100482910283',
          maskedAccountNumber: '•••• 0283',
          upiId: 'kotresh@okhdfcbank',
          accountType: 'Savings Account',
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    console.log(`Updated Primary Bank Account balance to ₹${targetBalance.toLocaleString('en-IN')}`);

    const count = await mongoose.connection.collection('transactions').countDocuments();
    console.log(`Total verified transactions in MongoDB Atlas: ${count}`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedData();
