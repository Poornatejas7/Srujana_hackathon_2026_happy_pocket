import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccountDocument extends Document {
  accountNumber: string;
  maskedAccountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  upiId: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'MERCHANT';
  balance: number;
  currency: string;
  upiPin?: string;
  isPrimaryUser: boolean;
  merchantCategory?: string;
  mcc?: string;
  theme?: string;
  themeIcon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema: Schema = new Schema(
  {
    accountNumber: { type: String, required: true, unique: true, index: true },
    maskedAccountNumber: { type: String, required: true },
    ifsc: { type: String, required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true, index: true },
    upiId: { type: String, required: true, unique: true, index: true },
    accountType: { 
      type: String, 
      enum: ['SAVINGS', 'CURRENT', 'MERCHANT'], 
      default: 'SAVINGS', 
      index: true 
    },
    balance: { type: Number, required: true, default: 10000.00 },
    currency: { type: String, default: 'INR' },
    upiPin: { type: String, default: '1234' },
    isPrimaryUser: { type: Boolean, default: false, index: true },
    merchantCategory: { type: String },
    mcc: { type: String },
    theme: { type: String },
    themeIcon: { type: String },
  },
  {
    timestamps: true,
  }
);

export const BankAccountModel =
  mongoose.models.BankAccount ||
  mongoose.model<IBankAccountDocument>('BankAccount', BankAccountSchema);
