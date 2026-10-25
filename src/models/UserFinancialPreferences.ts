import mongoose, { Schema, Document } from 'mongoose';

export interface IUserFinancialPreferencesDocument extends Document {
  userId: string;
  categoryReductionTargets: Record<string, number>;
  monthlyCategoryBudgets: Record<string, number>;
  essentialExpenseEstimate?: number;
  emergencyFundMonths: number;
  currentEmergencySavings: number;
  investmentSimulationPreferences: {
    monthlyContribution: number;
    durationYears: number;
    expectedAnnualReturn: number;
    selectedScheme?: string;
  };
  healthInsuranceAllocation: number;
  dismissedInsightIds: string[];
  reviewedInsightIds: string[];
  reviewedSubscriptionIds: Record<string, 'necessary' | 'unnecessary' | 'dismissed'>;
  createdAt: Date;
  updatedAt: Date;
}

const UserFinancialPreferencesSchema: Schema = new Schema(
  {
    userId: { type: String, default: 'acc_primary_sbi', required: true, unique: true, index: true },
    categoryReductionTargets: {
      type: Map,
      of: Number,
      default: () => ({
        'Bakery items & snacks': 0.25,
        'Food delivery': 0.25,
        'Restaurants & dining': 0.25,
        'Gaming & entertainment': 0.25,
        'Shopping & impulse': 0.25,
      }),
    },
    monthlyCategoryBudgets: {
      type: Map,
      of: Number,
      default: () => ({}),
    },
    essentialExpenseEstimate: { type: Number, default: 0 },
    emergencyFundMonths: { type: Number, default: 6 },
    currentEmergencySavings: { type: Number, default: 45000 },
    investmentSimulationPreferences: {
      monthlyContribution: { type: Number, default: 2500 },
      durationYears: { type: Number, default: 5 },
      expectedAnnualReturn: { type: Number, default: 12 },
      selectedScheme: { type: String, default: 'UTI_NIFTY50' },
    },
    healthInsuranceAllocation: { type: Number, default: 1200 },
    dismissedInsightIds: [{ type: String }],
    reviewedInsightIds: [{ type: String }],
    reviewedSubscriptionIds: {
      type: Map,
      of: String,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: 'user_financial_preferences',
  }
);

export const UserFinancialPreferencesModel =
  mongoose.models.UserFinancialPreferences ||
  mongoose.model<IUserFinancialPreferencesDocument>(
    'UserFinancialPreferences',
    UserFinancialPreferencesSchema
  );
