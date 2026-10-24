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
  category?: string;
  tier?: string;
  isRecurring?: boolean;
  isInternalTransfer?: boolean;
  isRefundOrReversal?: boolean;
  netOutflowAmount?: number;
  userOverridden?: boolean;
  createdAt: Date;
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
    cleanMerchant: { type: String },
    category: { type: String, default: 'Shopping & Discretionary' },
    tier: { type: String, default: 'Discretionary' },
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

// Prevent duplicate indexing collisions by enforcing unique compound index on RRN + timestamp + amount where RRN exists
TransactionSchema.index({ upiRrn: 1, timestamp: 1, amount: 1 }, { unique: false });

export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
