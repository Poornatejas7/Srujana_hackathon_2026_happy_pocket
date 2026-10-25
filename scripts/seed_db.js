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
    cleanMerchant: { type: String },
    category: { type: String, default: 'Shopping & Discretionary' },
    tier: { type: String, default: 'Discretionary' },
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
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-01T09:30:00Z'),
    amount: 75000.00,
    currency: 'INR',
    txMode: 'NEFT',
    rawDescription: 'NEFT/N1029384756102938/TECH CORP SALARY OCT 2026',
    payeeName: 'Tech Corp India Salary',
    cleanMerchant: 'Tech Corp India Salary',
    category: 'Income',
    tier: 'Income',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Salary Credit'
  },
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
    bankCode: 'ICIC',
    vpaHandle: 'swiggy@icici',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 450.00,
    remark: 'UPI Food'
  },
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
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-12T16:40:00Z'),
    amount: -4200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '391028472910',
    rawDescription: 'WDL TFR UPI/DR/391028472910/ZARA STORE/UTIB/zaraindia/UPI',
    payeeName: 'Zara Store',
    cleanMerchant: 'Zara Store Fashion',
    bankCode: 'UTIB',
    vpaHandle: 'zaraindia',
    category: 'Shopping & Discretionary',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'UPI Merchant'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-15T14:10:00Z'),
    amount: 4200.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '391028472999',
    rawDescription: 'DEP TFR UPI/CR/391028472999/ZARA STORE/UTIB/zaraindia/REFUND',
    payeeName: 'Zara Store',
    cleanMerchant: 'Zara Store Return Refund',
    bankCode: 'UTIB',
    vpaHandle: 'zaraindia',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: true,
    netOutflowAmount: 0,
    remark: 'Refund Credit'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-16T21:30:00Z'),
    amount: -5400.00,
    currency: 'INR',
    txMode: 'CARD_POS',
    rawDescription: 'POS 0097695162091 AT NOBU RESTAURANT BANGALORE',
    payeeName: 'Nobu Restaurant',
    cleanMerchant: 'Nobu Restaurant Dining',
    category: 'Dining & Nightlife',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 2700.00,
    remark: 'POS Swipe'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-17T10:05:00Z'),
    amount: 2700.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '881290348123',
    rawDescription: 'DEP TFR UPI/CR/881290348123/HARSHA K/OKAXIS/harsha@okaxis/DINNER SPLIT',
    payeeName: 'K Harsha',
    cleanMerchant: 'K Harsha (P2P Transfer / Shared)',
    bankCode: 'OKAXIS',
    vpaHandle: 'harsha@okaxis',
    category: 'Reimbursement / Split',
    tier: 'Transfer_or_Offset',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 0,
    remark: 'Dinner Split Reimbursed'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-20T09:00:00Z'),
    amount: -25000.00,
    currency: 'INR',
    txMode: 'NEFT',
    rawDescription: 'NEFT/N9028374619283746/AVALON BAY HOUSE RENT OCT',
    payeeName: 'Avalon Bay Housing Rent',
    cleanMerchant: 'Avalon Bay Housing Rent',
    category: 'Housing & Utilities',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 25000.00,
    remark: 'Monthly Rent'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-22T18:45:00Z'),
    amount: -1850.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '501928374619',
    rawDescription: 'WDL TFR UPI/DR/501928374619/BESCOM ELEC/SBIN/bescom@sbi/BILL',
    payeeName: 'BESCOM Electricity',
    cleanMerchant: 'BESCOM Electricity Utility',
    bankCode: 'SBIN',
    vpaHandle: 'bescom@sbi',
    category: 'Housing & Utilities',
    tier: 'Essential',
    isRecurring: true,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1850.00,
    remark: 'Electricity Bill'
  },
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-24T12:00:00Z'),
    amount: -650.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '883719284710',
    rawDescription: 'WDL TFR UPI/DR/883719284710/INDIAN OIL/SBIN/iocl@sbi/FUEL',
    payeeName: 'Indian Oil Station',
    cleanMerchant: 'Indian Oil / Fuel Station',
    bankCode: 'SBIN',
    vpaHandle: 'iocl@sbi',
    category: 'Transport & Fuel',
    tier: 'Essential',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 650.00,
    remark: 'Petrol Fuel'
  }
];

async function seed() {
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear old sample records to ensure pristine real data
    await TransactionModel.deleteMany({});
    console.log('Cleared previous collection.');

    const inserted = await TransactionModel.insertMany(sampleTransactions);
    console.log(`Successfully seeded ${inserted.length} real transactions into MongoDB Atlas!`);

    await mongoose.disconnect();
    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
