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
      default: 'Merchant / Business', 
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
    isAmbiguous: { type: Boolean, default: true, index: true },
    needsReview: { type: Boolean, default: true, index: true },
    confidenceScore: { type: Number, default: 48 },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

const ambiguousTxs = [
  // 1. Lakshmi Traders - Visit 1
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-23T11:30:00Z'),
    rawDescription: 'WDL TFR UPI/DR/529810293812/LAKSHMI TRADERS/PAY/lakshmitraders@okaxis/UPI',
    amount: -1450.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '529810293812',
    payeeName: 'Lakshmi Traders',
    bankCode: 'UTIB',
    vpaHandle: 'lakshmitraders@okaxis',
    remark: 'Provisions & Groceries Purchase',
    cleanMerchant: 'Lakshmi Traders',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Commercial Traders (Needs Confirmation)',
    themeIcon: '🏪',
    category: 'Groceries',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 1450.00,
    isAmbiguous: true,
    needsReview: true,
    confidenceScore: 48,
    userOverridden: false,
  },
  // 2. Lakshmi Traders - Visit 2 (Different Amount to show realistic repeat spending)
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-24T17:45:00Z'),
    rawDescription: 'WDL TFR UPI/DR/529810293813/LAKSHMI TRADERS/PAY/lakshmitraders@okaxis/UPI',
    amount: -480.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '529810293813',
    payeeName: 'Lakshmi Traders',
    bankCode: 'UTIB',
    vpaHandle: 'lakshmitraders@okaxis',
    remark: 'Daily essentials purchase',
    cleanMerchant: 'Lakshmi Traders',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Commercial Traders (Needs Confirmation)',
    themeIcon: '🏪',
    category: 'Groceries',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 480.00,
    isAmbiguous: true,
    needsReview: true,
    confidenceScore: 48,
    userOverridden: false,
  },
  // 3. Hanuman Enterprises
  {
    accountId: 'acc_primary_sbi',
    timestamp: new Date('2026-10-22T14:15:00Z'),
    rawDescription: 'WDL TFR UPI/DR/739102938123/HANUMAN ENTERPRISES/PAY/hanumanent@sbi/UPI',
    amount: -820.00,
    currency: 'INR',
    txMode: 'UPI',
    upiRrn: '739102938123',
    payeeName: 'Hanuman Enterprises',
    bankCode: 'SBIN',
    vpaHandle: 'hanumanent@sbi',
    remark: 'Hardware & plumbing supplies',
    cleanMerchant: 'Hanuman Enterprises',
    accountType: 'Merchant / Business',
    direction: 'DEBIT',
    theme: 'Commercial Enterprises (Needs Confirmation)',
    themeIcon: '🏪',
    category: 'Housing & Utilities',
    tier: 'Discretionary',
    isRecurring: false,
    isInternalTransfer: false,
    isRefundOrReversal: false,
    netOutflowAmount: 820.00,
    isAmbiguous: true,
    needsReview: true,
    confidenceScore: 48,
    userOverridden: false,
  },
];

async function addAmbiguousMerchants() {
  try {
    console.log('Connecting to MongoDB Atlas at:', MONGODB_URI.split('@')[1]);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB Atlas!');

    // Check if they already exist
    for (const tx of ambiguousTxs) {
      const exists = await TransactionModel.findOne({ upiRrn: tx.upiRrn });
      if (!exists) {
        await TransactionModel.create(tx);
        console.log(`Inserted ambiguous merchant: ${tx.cleanMerchant} (₹${Math.abs(tx.amount)})`);
      } else {
        console.log(`Already exists: ${tx.cleanMerchant} (${tx.upiRrn})`);
      }
    }

    const totalCount = await TransactionModel.countDocuments();
    console.log(`Total transactions in Atlas: ${totalCount}`);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error adding ambiguous merchants:', err);
    process.exit(1);
  }
}

addAmbiguousMerchants();
