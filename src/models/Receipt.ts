import mongoose, { Schema, Document } from 'mongoose';

export interface IReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export interface IReceiptDocument extends Document {
  orderId: string;
  merchant: string;
  orderDate: Date;
  totalAmount: number;
  taxAmount?: number;
  shippingFee?: number;
  currency: string;
  items: IReceiptItem[];
  status: 'MATCHED' | 'UNMATCHED' | 'PARTIAL';
  matchedTransactionId?: string;
  matchedConfidence?: number;
  matchSignals?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    category: { type: String },
  },
  { _id: false }
);

const ReceiptSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    merchant: { type: String, required: true, index: true },
    orderDate: { type: Date, required: true, index: true },
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    items: [ReceiptItemSchema],
    status: { 
      type: String, 
      enum: ['MATCHED', 'UNMATCHED', 'PARTIAL'], 
      default: 'UNMATCHED', 
      index: true 
    },
    matchedTransactionId: { type: String, index: true },
    matchedConfidence: { type: Number, default: 0 },
    matchSignals: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

ReceiptSchema.index({ merchant: 1, orderDate: -1 });

export const ReceiptModel =
  mongoose.models.Receipt ||
  mongoose.model<IReceiptDocument>('Receipt', ReceiptSchema);
