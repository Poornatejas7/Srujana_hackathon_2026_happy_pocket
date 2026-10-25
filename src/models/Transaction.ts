import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionDocument extends Document {
  accountId: string;
  timestamp: Date;
  rawDescription: string;
  amount: number; // positive for inflow, negative for outflow
  currency: string;
  txMode: string;
  upiRrn?: string;
  payeeName?: string;
  bankCode?: string;
  vpaHandle?: string;
  remark?: string;
  cleanMerchant?: string;
  accountType: 'Merchant / Business' | 'Personal';
  direction?: 'DEBIT' | 'CREDIT';
  category?: string;
  tier?: string;
  isRecurring?: boolean;
  isInternalTransfer?: boolean;
  isRefundOrReversal?: boolean;
  netOutflowAmount?: number;
  userOverridden?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
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
  {
    timestamps: true,
  }
);

// Helpful compound indexes for MongoDB Compass queries and aggregations
TransactionSchema.index({ accountType: 1, category: 1 });
TransactionSchema.index({ accountType: 1, timestamp: -1 });
TransactionSchema.index({ upiRrn: 1, timestamp: 1, amount: 1 }, { unique: false });

export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
