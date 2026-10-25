const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mykotresh_db_user:ROSTZ9GaDGOqjmaV@cluster0.0bnasia.mongodb.net/happypocket?appName=Cluster0';

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

const TransactionModel = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

const sampleTransactions = [
  // 1. Merchant / Business: Salary Credit (Employer)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-01T09:30:00Z'),
    amount: 75000.00,
    currency: 'INR',
    txMode: 'NEFT',
    rawDescription: 'NEFT/N1029384756102938/TECH CORP SALARY OCT 2026',
    payeeName: 'Tech Corp India Salary',
    cleanMerchant: 'Tech Corp India Salary',
    accountType: 'Merchant / Business',
    direction: 'CREDIT',
    category: 'Income',
    tier: 'Income',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Salary Credit'
  },
  // 2. Merchant / Business: Swiggy Food Delivery
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-02T13:15:00Z'),
    amount: -450.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '429182001928',
    rawDescription: 'WDL TFR UPI/DR/429182001928/SWIGGY/ICIC/swiggy@icici/UPI',
    payeeName: 'Swiggy',
    cleanMerchant: 'Swiggy Food Delivery',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'swiggy@icici',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 450.00,
    remark: 'UPI Food Delivery'
  },
  // 3. Personal: Self-Transfer (Kotresh C - Canara Bank Own A/C)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-03T11:00:00Z'),
    amount: -15000.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '656771804358',
    rawDescription: 'WDL TFR UPI/DR/656771804358/KOTRESH C/CNRB/mykotresh-canara/UPI',
    payeeName: 'Kotresh C',
    cleanMerchant: 'Self-Transfer (Kotresh C - Canara Bank / Own A/C)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'CNRB',
    vpaHandle: 'mykotresh-canara',
    category: 'Internal Transfer',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: true,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Self Transfer Own A/C'
  },
  // 4. Merchant / Business: Netflix India Monthly Subscription
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-05T08:00:00Z'),
    amount: -649.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '103643355290',
    rawDescription: 'WDL TFR UPI/DR/103643355290/NETFLIX/HDFC/netflix.bd/Execu',
    payeeName: 'Netflix',
    cleanMerchant: 'Netflix India',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'netflix.bd',
    category: 'Subscriptions & Digital',
    tier: 'Discretionary',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 649.00,
    remark: 'Execu AutoPay Mandate'
  },
  // 5. Merchant / Business: Spotify India Premium
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-08T10:20:00Z'),
    amount: -119.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '992837162541',
    rawDescription: 'WDL TFR UPI/DR/992837162541/SPOTIFY/HDFC/spotify.bd/Execu',
    payeeName: 'Spotify',
    cleanMerchant: 'Spotify India',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'spotify.bd',
    category: 'Subscriptions & Digital',
    tier: 'Discretionary',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 119.00,
    remark: 'Execu AutoPay Mandate'
  },
  // 6. Personal: Family Support Transfer (Veerabhadrappa C)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-09T16:45:00Z'),
    amount: -4500.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '902816401923',
    rawDescription: 'WDL TFR UPI/DR/902816401923/VEERABHADRAPPA C/SBIN/veeru@oksbi/UPI',
    payeeName: 'Veerabhadrappa C',
    cleanMerchant: 'Veerabhadrappa C (Family Transfer)',
    accountType: 'Personal',
    direction: 'DEBIT',
    bankCode: 'SBIN',
    vpaHandle: 'veeru@oksbi',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Family Support Transfer'
  },
  // 7. Merchant / Business: Zara Store Clothing
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-12T14:30:00Z'),
    amount: -4200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '391028475619',
    rawDescription: 'WDL TFR UPI/DR/391028475619/ZARA STORE/HDFC/zara.bd/POS',
    payeeName: 'Zara Store Retail',
    cleanMerchant: 'Zara Store Retail',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'zara.bd',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0, // Paired with return refund
    remark: 'Zara Store Apparel'
  },
  // 8. Merchant / Business: Zara Store Return Refund
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-15T11:15:00Z'),
    amount: 4200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '391028475620',
    rawDescription: 'DEP TFR UPI/CR/391028475620/ZARA STORE RETURN REFUND/HDFC/zara@hdfc/REFUND',
    payeeName: 'Zara Store Retail',
    cleanMerchant: 'Zara Store Return Refund',
    accountType: 'Merchant / Business',
    direction: 'CREDIT',
    bankCode: 'HDFC',
    vpaHandle: 'zara@hdfc',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: true,
    netOutflowAmount: 0,
    remark: 'Zara Store Refund Credit'
  },
  // 9. Merchant / Business: Nobu Restaurant Group Dinner Bill
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-16T21:00:00Z'),
    amount: -5400.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '782910485721',
    rawDescription: 'WDL TFR UPI/DR/782910485721/NOBU DINNER SHARABLE BILL/ICIC/nobu@icici/DINNER',
    payeeName: 'Nobu Restaurant',
    cleanMerchant: 'Nobu Restaurant Dining',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'nobu@icici',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 2700.00, // Remaining half after friend's split
    remark: 'Nobu Dinner'
  },
  // 10. Personal: Dinner Split Reimbursement (Harsha K)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-17T10:30:00Z'),
    amount: 2700.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '819283019283',
    rawDescription: 'DEP TFR UPI/CR/819283019283/HARSHA K/HDFC/harsha@okhdfc/Dinner split',
    payeeName: 'Harsha K',
    cleanMerchant: 'K Harsha (P2P Transfer / Shared)',
    accountType: 'Personal',
    direction: 'CREDIT',
    bankCode: 'HDFC',
    vpaHandle: 'harsha@okhdfc',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'P2P Dinner Split Reimbursement'
  },
  // 11. Merchant / Business: GoDaddy Domains & Hosting
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-18T07:45:00Z'),
    amount: -899.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '655912700086',
    rawDescription: 'WDL TFR UPI/DR/655912700086/Godaddy/ HDFC/godaddy.bd/Pay',
    payeeName: 'GoDaddy',
    cleanMerchant: 'GoDaddy Domains & Hosting',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'HDFC',
    vpaHandle: 'godaddy.bd',
    category: 'Subscriptions & Digital',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 899.00,
    remark: 'Domain Renewal'
  },
  // 12. Merchant / Business: Meesho Return Refund Credit
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-20T15:20:00Z'),
    amount: 532.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '625534769719',
    rawDescription: 'DEP TFR UPI/CR/625534769719/MEESHO T/YESB/mtpl1@yesb/CT22',
    payeeName: 'Meesho Online Shopping',
    cleanMerchant: 'Meesho Refund / Return Credit',
    accountType: 'Merchant / Business',
    direction: 'CREDIT',
    bankCode: 'YESB',
    vpaHandle: 'mtpl1@yesb',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: true,
    netOutflowAmount: 0,
    remark: 'Meesho Refund'
  },
  // 13. Merchant / Business: Con Edison Utility Bill
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-22T09:10:00Z'),
    amount: -1850.00,
    currency: 'INR',
    txMode: 'NACH',
    rawDescription: 'ACH/CON EDISON ELECTRICITY/UMRN78192038475619283746/MONTHLY',
    payeeName: 'Con Edison Electricity',
    cleanMerchant: 'Electricity & Utility Bills',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    category: 'Housing & Utilities',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1850.00,
    remark: 'Electricity Bill'
  },
  // 14. Merchant / Business: Indian Oil Petrol Pump
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-24T12:00:00Z'),
    amount: -650.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '883719284710',
    rawDescription: 'WDL TFR UPI/DR/883719284710/INDIAN OIL/SBIN/iocl@sbi/FUEL',
    payeeName: 'Indian Oil Station',
    cleanMerchant: 'Fuel Station (IOCL/BPCL/HPCL)',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'SBIN',
    vpaHandle: 'iocl@sbi',
    category: 'Transport & Fuel',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 650.00,
    remark: 'Petrol Fuel'
  },
  // 15. Merchant / Business: Blinkit Grocery
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-25T08:30:00Z'),
    amount: -1299.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '772910384619',
    rawDescription: 'WDL TFR UPI/DR/772910384619/BLINKIT COMMERCE/ICIC/blinkit@icici/GROCERY',
    payeeName: 'Blinkit Commerce',
    cleanMerchant: 'Groceries & Quick Commerce',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    bankCode: 'ICIC',
    vpaHandle: 'blinkit@icici',
    category: 'Groceries',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1299.00,
    remark: 'Weekly Fresh Groceries'
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
    console.log(`SUCCESS! Seeded ${inserted.length} transactions into MongoDB Atlas.`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Collection: transactions`);
    
    const merchantCount = inserted.filter(t => t.accountType === 'Merchant / Business').length;
    const personalCount = inserted.filter(t => t.accountType === 'Personal').length;
    console.log(`- Merchant / Business Accounts: ${merchantCount}`);
    console.log(`- Personal Accounts: ${personalCount}`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
