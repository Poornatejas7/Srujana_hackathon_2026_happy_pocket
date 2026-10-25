export interface StockSipOption {
  symbol: string;
  name: string;
  category: 'Index' | 'FlexiCap' | 'Bluechip_Stock' | 'Tech_Sectoral';
  historicalCagr3Y: number;    // e.g. 14.8 (%)
  historicalCagr5Y: number;    // e.g. 13.5 (%)
  riskLevel: 'Low-Moderate' | 'Moderate' | 'High';
  currentNavOrPrice: number;    // In ₹
  amfiSchemeCode?: number;     // Official AMFI Code for live NAV lookup
  fundHouse?: string;
}

export interface InsuranceRecommendation {
  type: 'TERM_LIFE' | 'HEALTH_COMPREHENSIVE';
  provider: string;             // e.g. "HDFC Life Click 2 Protect" or "Care Supreme"
  sumAssured: number;           // In ₹ e.g. ₹1,00,00,000 (1 Crore) or ₹15,00,000 (15 Lakhs)
  annualPremium: number;        // In ₹
  monthlyEquivalent: number;    // In ₹
  taxSectionBenefit: '80C' | '80D';
  estimatedAnnualTaxSavings: number; // e.g. ₹2,400 (under 20% slab)
  features: string[];
}

export interface SipAllocationItem {
  option: StockSipOption;
  monthlyContribution: number;
  projectedValue5Y: number;
  projectedValue10Y: number;
}

export interface RecommenderPlan {
  totalLeakingMonthly: number;
  allocatedSipMonthly: number;
  allocatedInsuranceMonthly: number;
  recommendedSips: SipAllocationItem[];
  recommendedInsurance: InsuranceRecommendation[];
  totalAnnualTaxSavings: number;
  total5YrWealthCreated: number;
  total10YrWealthCreated: number;
  totalSafetyCoverage: number; // Sum of Insurance covers (e.g. ₹1.15 Crore)
}
