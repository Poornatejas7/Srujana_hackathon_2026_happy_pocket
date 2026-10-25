export interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'CREDIT_CARD' | 'SAVINGS' | 'UPI_WALLET';
  institution: string;
  accountNumberMask: string;
  balance: number;
  currency: string;
  color: string;
}

export type Category = 
  | 'Housing & Utilities'
  | 'Groceries'
  | 'Dining & Nightlife'
  | 'Subscriptions & Digital'
  | 'Transport & Fuel'
  | 'Healthcare'
  | 'Shopping & Discretionary'
  | 'Internal Transfer'
  | 'Reimbursement / Split'
  | 'Income';

export interface RawTransaction {
  id: string;
  accountId: string;
  timestamp: string; // ISO string
  rawDescription: string;
  amount: number; // negative for outflow/debit, positive for inflow/credit
  currency: string;
  balance?: number;
  // Dissected Details Column Fields
  txMode?: string;          // e.g. "WDL TFR", "DEP TFR"
  upiRrn?: string;          // 12-digit UPI Reference / RRN number e.g. "203821706198"
  payeeName?: string;        // Clean Beneficiary / Merchant e.g. "MEESHO", "NETFLIX", "KOTRESH C"
  bankCode?: string;         // Underlying Bank e.g. "UTIB" (Axis), "ICIC", "HDFC", "SBIN", "CNRB"
  vpaHandle?: string;        // UPI VPA identifier e.g. "MEESHOONLI", "netflix.bd", "mykotresh-"
  remark?: string;           // Transaction user note e.g. "Sent", "UPI", "Execu", "Paym"
  terminalRef?: string;      // Core banking terminal reference e.g. "0097695162091 AT 40184"
  branchLocation?: string;   // Branch / City e.g. "DONIMALAI TOWNSHIP"
  accountType?: 'Merchant / Business' | 'Personal';
}

export interface EnrichedTransaction extends RawTransaction {
  cleanMerchant: string;
  accountType: 'Merchant / Business' | 'Personal';
  category: Category;
  tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income';
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  isInternalTransfer: boolean;
  pairedTransferId?: string;
  isRefundOrReversal: boolean;
  pairedRefundId?: string;
  isSharedSplitExpense: boolean;
  netOutflowAmount: number; // after subtracting paired refunds/reimbursements
  confidenceScore: number;
  anomalyWarning?: string;
  userOverridden?: boolean;
}

export interface SubscriptionItem {
  merchant: string;
  category: string;
  monthlyCost: number;
  frequency: string;
  lastCharged: string;
  nextExpected: string;
  status: 'Active' | 'Creeping Price Hike' | 'Zombie/Unused Trial';
  annualImpact: number;
  confidence: number;
}
