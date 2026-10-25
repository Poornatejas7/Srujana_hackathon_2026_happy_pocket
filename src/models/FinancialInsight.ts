import mongoose, { Schema, Document } from 'mongoose';

export type InsightType =
  | 'RECURRING_SUBSCRIPTION'
  | 'FREQUENT_PURCHASE'
  | 'PRICE_INCREASE'
  | 'SPENDING_TREND'
  | 'DUPLICATE_SUBSCRIPTION'
  | 'UNUSUAL_EXPENSE'
  | 'SAVINGS_OPPORTUNITY';

export type InsightStatus = 'active' | 'reviewed' | 'dismissed';

export interface IFinancialInsightDocument extends Document {
  userId: string;
  insightType: InsightType;
  title: string;
  description: string;
  category: string;
  transactionIds: string[];
  observedAmount: number;
  estimatedMonthlyAmount: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  confidence: number; // 0 - 100
  evidence: string;
  suggestedAction: string;
  status: InsightStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialInsightSchema: Schema = new Schema(
  {
    userId: { type: String, default: 'acc_primary_sbi', index: true, required: true },
    insightType: {
      type: String,
      required: true,
      enum: [
        'RECURRING_SUBSCRIPTION',
        'FREQUENT_PURCHASE',
        'PRICE_INCREASE',
        'SPENDING_TREND',
        'DUPLICATE_SUBSCRIPTION',
        'UNUSUAL_EXPENSE',
        'SAVINGS_OPPORTUNITY',
      ],
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General', index: true },
    transactionIds: [{ type: String }],
    observedAmount: { type: Number, default: 0 },
    estimatedMonthlyAmount: { type: Number, default: 0 },
    potentialMonthlySavings: { type: Number, default: 0 },
    potentialAnnualSavings: { type: Number, default: 0 },
    confidence: { type: Number, default: 85 },
    evidence: { type: String, default: '' },
    suggestedAction: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'reviewed', 'dismissed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'financial_insights',
  }
);

FinancialInsightSchema.index({ userId: 1, insightType: 1 });
FinancialInsightSchema.index({ userId: 1, status: 1 });
FinancialInsightSchema.index({ userId: 1, createdAt: -1 });

export const FinancialInsightModel =
  mongoose.models.FinancialInsight ||
  mongoose.model<IFinancialInsightDocument>('FinancialInsight', FinancialInsightSchema);
