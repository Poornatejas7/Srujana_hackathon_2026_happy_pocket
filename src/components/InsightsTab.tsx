'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PieChart as PieChartIcon,
  Sliders,
  RotateCcw,
  RefreshCw,
  Info,
  DollarSign,
  AlertCircle,
  Clock,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  ShieldAlert,
  Percent,
  Check,
  X,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Target,
  HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import CategoryClassifierModal from '@/components/CategoryClassifierModal';
import { Category } from '@/types/finance';
import {
  OverviewMetrics,
  DetectedSubscription,
  DiscretionaryCategoryAnalysis,
  IntelligentInsight,
  calculateInvestmentProjection,
  calculateEmergencyFundPlan,
  calculateHealthInsurancePlan,
} from '@/lib/insightsEngine';

interface InsightsTabProps {
  onNavigateTab?: (tab: string) => void;
  className?: string;
  transactions?: any[];
}

export default function InsightsTab({ onNavigateTab, className = '', transactions = [] }: InsightsTabProps) {
  // Navigation Sub-Tab State
  const [activeSection, setActiveSection] = useState<
    'overview' | 'subscriptions' | 'discretionary' | 'recommendations' | 'investment' | 'protection'
  >('overview');

  // Mode and Filter State - defaults to live mode (clean empty canvas)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'30d' | '90d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Data States
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>([]);
  const [discretionaryCategories, setDiscretionaryCategories] = useState<
    DiscretionaryCategoryAnalysis[]
  >([]);
  const [recommendations, setRecommendations] = useState<IntelligentInsight[]>([]);
  const [expandedInsightIds, setExpandedInsightIds] = useState<Record<string, boolean>>({});
  const [dbStatusLabel, setDbStatusLabel] = useState<string>('Connecting...');

  // User Interactive Preferences
  const [categoryReductions, setCategoryReductions] = useState<Record<string, number>>({
    'Bakery items & snacks': 25,
    'Frequent food delivery': 25,
    'Restaurants & dining out': 25,
    'Gaming & entertainment': 25,
    'Shopping & impulse purchases': 25,
  });

  // Investment Simulator State
  const [investmentMonthly, setInvestmentMonthly] = useState<number>(3500);
  const [investmentYears, setInvestmentYears] = useState<number>(5);
  const [investmentRate, setInvestmentRate] = useState<number>(12);
  const [selectedAmfiScheme, setSelectedAmfiScheme] = useState<string>('UTI Nifty 50 Index Direct');

  // Protection Planner State
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState<number>(6);
  const [currentSavingsInput, setCurrentSavingsInput] = useState<number>(45000);
  const [healthPremiumInput, setHealthPremiumInput] = useState<number>(1200);

  // Category Classifier Modal State
  const [classifierModal, setClassifierModal] = useState<{
    isOpen: boolean;
    merchantName: string;
    currentCategory?: string;
  }>({
    isOpen: false,
    merchantName: '',
  });

  // Client mounting indicator for Recharts hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. Fetch All Insights Data from Backend APIs
  const fetchAllInsightsData = async (forceDemo: boolean = isDemoMode) => {
    try {
      setIsLoading(true);
      const demoQuery = forceDemo ? '?demo=true' : '';

      const [resOverview, resSubs, resSpending, resRecs] = await Promise.all([
        fetch(`/api/insights/overview${demoQuery}`),
        fetch(`/api/insights/recurring${demoQuery}`),
        fetch(`/api/insights/spending${demoQuery}`),
        fetch(`/api/insights/recommendations${demoQuery}`),
      ]);

      const [dataOverview, dataSubs, dataSpending, dataRecs] = await Promise.all([
        resOverview.json(),
        resSubs.json(),
        resSpending.json(),
        resRecs.json(),
      ]);

      if (dataOverview.success) {
        setOverview(dataOverview.overview);
        setDbStatusLabel(dataOverview.database);
        if (dataOverview.overview?.potentialMonthlySavings) {
          setInvestmentMonthly((prev) =>
            prev === 3500 ? Math.max(1000, dataOverview.overview.potentialMonthlySavings) : prev
          );
        }
      }

      if (dataSubs.success && Array.isArray(dataSubs.subscriptions)) {
        setSubscriptions(dataSubs.subscriptions);
      }

      if (dataSpending.success && Array.isArray(dataSpending.categories)) {
        setDiscretionaryCategories(dataSpending.categories);
        // Sync local reduction targets
        const initialMap: Record<string, number> = {};
        dataSpending.categories.forEach((c: DiscretionaryCategoryAnalysis) => {
          initialMap[c.categoryName] = c.selectedReductionPercent;
        });
        setCategoryReductions((prev) => ({ ...prev, ...initialMap }));
      }

      if (dataRecs.success && Array.isArray(dataRecs.recommendations)) {
        setRecommendations(dataRecs.recommendations);
      }
    } catch (err: any) {
      console.error('Failed to load insights data:', err);
      showToast('Error syncing insights data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInsightsData(isDemoMode);
  }, [isDemoMode]);

  // 2. Dynamic Savings Recalculation across Discretionary Categories
  const dynamicPotentialSavings = useMemo(() => {
    let monthly = 0;
    discretionaryCategories.forEach((cat) => {
      const reduction = (categoryReductions[cat.categoryName] ?? 25) / 100;
      monthly += cat.averageMonthlySpending * reduction;
    });

    // Add subscriptions marked as unnecessary
    subscriptions.forEach((sub) => {
      if (sub.userVerdict === 'unnecessary') {
        monthly += sub.estimatedMonthlyCost;
      }
    });

    return {
      monthly: Math.round(monthly),
      annual: Math.round(monthly * 12),
    };
  }, [discretionaryCategories, categoryReductions, subscriptions]);

  // 3. Dynamic Investment Projection Calculation
  const investmentProjection = useMemo(() => {
    return calculateInvestmentProjection(investmentMonthly, investmentYears, investmentRate);
  }, [investmentMonthly, investmentYears, investmentRate]);

  // 4. Dynamic Emergency Fund Calculation
  const emergencyPlan = useMemo(() => {
    const essential = overview?.essentialExpenses || 24000;
    return calculateEmergencyFundPlan(
      essential,
      emergencyTargetMonths,
      currentSavingsInput,
      dynamicPotentialSavings.monthly || 2500
    );
  }, [overview, emergencyTargetMonths, currentSavingsInput, dynamicPotentialSavings]);

  // 5. Dynamic Health Insurance Calculation
  const healthPlan = useMemo(() => {
    return calculateHealthInsurancePlan(healthPremiumInput);
  }, [healthPremiumInput]);

  // Action: Change category reduction percent
  const handleUpdateCategoryReduction = async (categoryName: string, percent: number) => {
    setCategoryReductions((prev) => ({ ...prev, [categoryName]: percent }));
    showToast(`Updated ${categoryName} reduction to ${percent}%`);

    try {
      await fetch('/api/insights/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_category_reduction',
          targetId: categoryName,
          category: categoryName,
          reductionPercent: percent,
        }),
      });
    } catch (e) {
      // Offline resilient
    }
  };

  // Action: Subscription review / verdict
  const handleSubscriptionVerdict = async (
    subId: string,
    verdict: 'necessary' | 'unnecessary' | 'dismissed'
  ) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          return {
            ...s,
            userVerdict: verdict,
            status: verdict === 'dismissed' ? 'Dismissed' : s.status,
          };
        }
        return s;
      })
    );

    const labelMap = {
      necessary: 'Marked as Essential Commitment',
      unnecessary: 'Marked for Cancellation / Savings',
      dismissed: 'Subscription Dismissed',
    };
    showToast(labelMap[verdict]);

    try {
      await fetch('/api/insights/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscription_verdict',
          targetId: subId,
          verdict,
        }),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Action: Dismiss recommendation insight
  const handleDismissInsight = async (insightId: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== insightId));
    showToast('Insight dismissed');

    try {
      await fetch('/api/insights/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss_insight',
          targetId: insightId,
        }),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Action: Mark insight reviewed
  const handleReviewInsight = async (insightId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === insightId ? { ...r, status: 'reviewed' } : r))
    );
    showToast('Marked insight as reviewed');

    try {
      await fetch('/api/insights/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_insight',
          targetId: insightId,
        }),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Action: Seed / Reset Demo Transactions in MongoDB Atlas
  const handleSeedDemoData = async () => {
    try {
      setIsSeeding(true);
      showToast('Seeding 40 realistic UPI transactions into Atlas DB...');
      const res = await fetch('/api/insights/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overwrite: true }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Successfully seeded MongoDB Atlas with demo data!');
        setIsDemoMode(false); // Switch to live DB mode
        fetchAllInsightsData(false);
      } else {
        showToast(data.error || 'Failed to seed Atlas DB');
      }
    } catch (err: any) {
      showToast('Error seeding database');
    } finally {
      setIsSeeding(false);
    }
  };

  // Toggle card expansion
  const toggleInsightExpand = (id: string) => {
    setExpandedInsightIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`w-full space-y-4 select-none pb-4 ${className}`}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP CONTROL BAR: DEMO MODE TOGGLE & ATLAS STATUS */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                {isDemoMode ? 'Demo Sandbox Mode' : 'Live MongoDB Atlas'}
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                  isDemoMode
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isDemoMode ? 'Demo Data' : 'Live Records'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {isDemoMode ? 'Realistic 40 Indian UPI records' : dbStatusLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Demo Mode Switcher */}
          <button
            type="button"
            onClick={() => setIsDemoMode((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
              isDemoMode
                ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle between live MongoDB Atlas data and curated Demo Mode"
          >
            {isDemoMode ? 'Switch to Live DB' : 'Switch to Demo'}
          </button>

          {/* Seed DB Button */}
          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
            title="Populate MongoDB Atlas with realistic demo transactions"
          >
            <RotateCcw className={`w-3 h-3 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>Seed Atlas DB</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUB-MODULE NAVIGATION PILLS (6 Core Insights Sections) */}
      {/* ======================================================== */}
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1 py-1">
        <div className="inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs gap-1 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'subscriptions', label: 'AutoPay', icon: Calendar },
            { id: 'discretionary', label: 'Discretionary', icon: ShoppingBag },
            { id: 'recommendations', label: 'Insights', icon: Zap },
            { id: 'investment', label: 'Investments', icon: TrendingUp },
            { id: 'protection', label: 'Protection', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: FINANCIAL HEALTH OVERVIEW DASHBOARD */}
      {/* ======================================================== */}
      {activeSection === 'overview' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Simplified Potential Savings Hero Card */}
          <div className="bg-white rounded-[24px] p-4.5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Potential Savings</h3>
                  <span className="text-[10px] text-slate-400 font-medium">From discretionary spend</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('investment')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 text-orange-600 font-bold text-xs transition cursor-pointer"
              >
                <span>Project Growth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-100">
              <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100/80">
                <span className="text-[11px] font-semibold text-slate-500 block">Monthly Savings</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  ₹{dynamicPotentialSavings.monthly.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/80">
                <span className="text-[11px] font-semibold text-orange-700 block">Annual Savings</span>
                <div className="text-xl sm:text-2xl font-black text-orange-600 tracking-tight mt-0.5">
                  ₹{dynamicPotentialSavings.annual.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metric Tiles (Grid 2x2) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Total Spending This Month */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Living Spend</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">
                ₹{(overview?.totalSpendingThisMonth || 0).toLocaleString('en-IN')}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                <span>Net outflow this month</span>
              </div>
            </div>

            {/* 2. Recurring Monthly Payments */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Recurring Monthly Payments</span>
              <span className="text-lg font-black text-purple-600 mt-0.5 block">
                ₹{(overview?.recurringMonthlyPayments || 0).toLocaleString('en-IN')}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-purple-500 font-medium mt-1">
                <Calendar className="w-3 h-3" />
                <span>{overview?.activeSubscriptionsCount || 0} services detected</span>
              </div>
            </div>

            {/* 3. Essential Expenses */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Essential Commitments</span>
              <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                ₹{(overview?.essentialExpenses || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rent, Groceries & Utilities
              </span>
            </div>

            {/* 4. Discretionary Expenses */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Discretionary Expenses</span>
              <span className="text-lg font-black text-orange-600 mt-0.5 block">
                ₹{(overview?.discretionaryExpenses || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dining, Shopping & Snacks
              </span>
            </div>
          </div>

          {/* Anti-Distortion & Noise Elimination Transparency Card */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/70 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-emerald-950">
                  Anti-Distortion Engine Applied (Zero Double-Counting)
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Excluded <strong>₹{(overview?.internalTransfersExcluded || 0).toLocaleString('en-IN')}</strong> of self-account transfers and reconciled <strong>₹{(overview?.refundsNetted || 0).toLocaleString('en-IN')}</strong> of returned order refunds from inflating your living expenditure.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Navigator to Deep Dives */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Explore Deeper Insights
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveSection('subscriptions')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/80 border border-slate-100 text-left transition cursor-pointer"
              >
                <span className="font-bold text-slate-800 block">Auto-Pay Monitor</span>
                <span className="text-[10px] text-slate-500">Detect creeping price hikes →</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('discretionary')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/80 border border-slate-100 text-left transition cursor-pointer"
              >
                <span className="font-bold text-slate-800 block">Discretionary Spend</span>
                <span className="text-[10px] text-slate-500">Adjust reduction targets →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: RECURRING PAYMENTS & SUBSCRIPTION DETECTOR */}
      {/* ======================================================== */}
      {activeSection === 'subscriptions' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Subscriptions Header Summary */}
          <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Monthly Commitments</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">
                ₹{subscriptions.reduce((sum, s) => (s.status !== 'Dismissed' ? sum + s.estimatedMonthlyCost : sum), 0).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500"> / month</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Annual Commitment</span>
              <span className="text-sm font-bold text-purple-600 block">
                ₹{subscriptions.reduce((sum, s) => (s.status !== 'Dismissed' ? sum + s.estimatedAnnualCost : sum), 0).toLocaleString('en-IN')} / yr
              </span>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-2.5">
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
                No recurring subscriptions detected.
              </div>
            ) : (
              subscriptions.map((sub) => {
                const isExpanded = !!expandedInsightIds[sub.id];
                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-2xl p-4 border transition shadow-xs ${
                      sub.isPriceIncrease
                        ? 'border-red-200 bg-red-50/20'
                        : sub.isDuplicateCandidate
                        ? 'border-indigo-200 bg-indigo-50/20'
                        : sub.status === 'Dismissed'
                        ? 'opacity-60 border-slate-200'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {/* Main Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                          {sub.themeIcon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{sub.merchantName}</h4>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                sub.status === 'Active candidate'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.status === 'Dismissed'
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {sub.status}
                            </span>
                            {sub.isPriceIncrease && (
                              <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md">
                                Price Hike +{sub.priceIncreasePercent}%
                              </span>
                            )}
                            {sub.isDuplicateCandidate && (
                              <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                                Overlaps with {sub.duplicateWith}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            ₹{sub.amount.toLocaleString('en-IN')} per {sub.frequency} • Next: {new Date(sub.predictedNextPaymentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-slate-900 block">
                          ₹{sub.estimatedMonthlyCost.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">/ month</span>
                      </div>
                    </div>

                    {/* Annual Note for Annual Plans */}
                    {sub.frequency === 'annual' && (
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                        💡 Annual charge: ₹{sub.amount.toLocaleString('en-IN')} once a year. Calculated monthly equivalent: ₹{sub.estimatedMonthlyCost}/mo.
                      </div>
                    )}

                    {/* Expand Details & Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <button
                        type="button"
                        onClick={() => toggleInsightExpand(sub.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Evidence & History</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSubscriptionVerdict(sub.id, 'necessary')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            sub.userVerdict === 'necessary'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Necessary
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubscriptionVerdict(sub.id, 'unnecessary')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            sub.userVerdict === 'unnecessary'
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Mark as Leaking
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubscriptionVerdict(sub.id, 'dismissed')}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1 animate-fadeIn">
                        <div><strong>Evidence:</strong> {sub.evidence}</div>
                        <div><strong>Detection Confidence:</strong> {sub.confidence}% algorithm certainty</div>
                        <div><strong>Category:</strong> {sub.category}</div>
                        <div><strong>Last Billed:</strong> {new Date(sub.lastPaymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: DISCRETIONARY & POTENTIALLY WASTEFUL SPEND */}
      {/* ======================================================== */}
      {activeSection === 'discretionary' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Section Description Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900">
              Discretionary Spending Reduction Calculator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Select what percentage of spending in each category you want to reduce.
              Savings are projected based on your historical monthly average.
            </p>
          </div>

          {/* Category Cards with Reduction Sliders */}
          <div className="space-y-3">
            {discretionaryCategories.map((cat) => {
              const currentReduction = categoryReductions[cat.categoryName] ?? cat.selectedReductionPercent;
              const projectedMonthly = Math.round(cat.averageMonthlySpending * (currentReduction / 100));
              const projectedAnnual = projectedMonthly * 12;

              return (
                <div
                  key={cat.categoryName}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1 bg-slate-50 rounded-xl">{cat.themeIcon}</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cat.categoryName}</h4>
                        <span className="text-[11px] text-slate-400">
                          {cat.transactionCount} transactions • {cat.percentageOfTotal}% of discretionary spend
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black text-slate-900 block">
                        ₹{cat.averageMonthlySpending.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">Monthly Avg</span>
                    </div>
                  </div>

                  {/* Spending Windows & Trend Badges */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50/80 p-2.5 rounded-xl text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Last 30 Days</span>
                      <span className="font-bold text-slate-800">₹{cat.totalLast30Days.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Last 90 Days</span>
                      <span className="font-bold text-slate-800">₹{cat.totalLast90Days.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Trend</span>
                      <span
                        className={`font-bold flex items-center gap-0.5 ${
                          cat.spendingTrendPercent > 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {cat.spendingTrendPercent > 0 ? `+${cat.spendingTrendPercent}%` : `${cat.spendingTrendPercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Reduction Buttons: 0%, 25%, 50%, 100% */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium text-[11px]">Choose Reduction Target:</span>
                      <span className="font-extrabold text-[#F97316] text-[11px]">
                        Save ₹{projectedMonthly.toLocaleString('en-IN')}/mo (₹{projectedAnnual.toLocaleString('en-IN')}/yr)
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 25, 50, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleUpdateCategoryReduction(cat.categoryName, pct)}
                          className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            currentReduction === pct
                              ? 'bg-[#F97316] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {pct === 0 ? 'Keep 100%' : `Cut ${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: INTELLIGENT RULE-BASED RECOMMENDATIONS */}
      {/* ======================================================== */}
      {activeSection === 'recommendations' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Rule-Based Financial Insights
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {recommendations.length} actionable anomalies & opportunities found
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Zero Generic AI Fluff
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
                All insights reviewed or dismissed! You're in great shape.
              </div>
            ) : (
              recommendations.map((rec) => {
                const isExpanded = !!expandedInsightIds[rec.id];
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5 hover:border-slate-200 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border mt-0.5 ${
                            rec.badgeColor || 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          {rec.insightType.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {rec.title}
                        </h4>
                      </div>

                      {rec.potentialMonthlySavings > 0 && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-600 block">
                            +₹{rec.potentialMonthlySavings.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-slate-400">/mo savings</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rec.description}
                    </p>

                    {/* Action Recommendation Banner */}
                    <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100/80 text-[11px] text-orange-950 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended Action:</strong> {rec.suggestedAction}
                      </div>
                    </div>

                    {/* Expandable Evidence Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => toggleInsightExpand(rec.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Transaction Evidence ({rec.confidence}% conf)</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReviewInsight(rec.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissInsight(rec.id)}
                          className="px-2 py-1 rounded-lg text-slate-400 hover:text-red-500 text-[10px] font-bold transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1 animate-fadeIn border border-slate-100">
                        <div><strong>Evidence Details:</strong> {rec.evidence}</div>
                        <div><strong>Category:</strong> {rec.category}</div>
                        <div><strong>Observed Outflow:</strong> ₹{rec.observedAmount.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: "WHAT IF YOU INVESTED?" INVESTMENT SIMULATOR */}
      {/* ======================================================== */}
      {activeSection === 'investment' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Investment Hero Calculator */}
          <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                  <TrendingUp className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  What If You Invested This?
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                AMFI CAGR Compounder
              </span>
            </div>

            {/* Projection Summary Tiles */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-emerald-50/80 rounded-2xl border border-orange-100/90 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Total Invested</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 block">
                  ₹{investmentProjection.totalInvested.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-x border-orange-200/60 px-1">
                <span className="text-[10px] text-slate-500 font-bold block">Future Value</span>
                <span className="text-sm sm:text-base font-black text-[#F97316] mt-0.5 block">
                  ₹{investmentProjection.futureValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block">Wealth Created</span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5 block">
                  +₹{investmentProjection.wealthCreated.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Recharts Area Chart: Total Invested vs Projected Value */}
            <div className="w-full h-48 pt-2">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={investmentProjection.projectionPoints}>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickFormatter={(val) => `Yr ${val}`}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `₹${Number(value).toLocaleString('en-IN')}`,
                        name === 'futureValue' ? 'Projected Value' : 'Total Contributions',
                      ]}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalInvested"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#investedGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="futureValue"
                      stroke="#F97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#growthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Slider 1: Monthly Investment Amount */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Monthly Savings Amount:</span>
                <span className="font-extrabold text-[#F97316]">₹{investmentMonthly.toLocaleString('en-IN')} / month</span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={investmentMonthly}
                onChange={(e) => setInvestmentMonthly(Number(e.target.value))}
                className="w-full accent-[#F97316] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹500</span>
                <span>₹10,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Slider 2: Investment Duration (1 to 30 Years) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Investment Horizon:</span>
                <span className="font-extrabold text-slate-900">{investmentYears} Years ({investmentYears * 12} Months)</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Slider 3: Illustrative Return Assumption (0% to 25%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Illustrative Annual Return:</span>
                <span className="font-extrabold text-emerald-600">{investmentRate}% CAGR</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={investmentRate}
                onChange={(e) => setInvestmentRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Cash/Zero Return)</span>
                <span>12% (Nifty 50 Index)</span>
                <span>25% (High Alpha)</span>
              </div>
            </div>

            {/* Mathematical Formula Explanation */}
            <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 leading-relaxed space-y-1 border border-slate-100">
              <div className="font-bold text-slate-700">Formula Convention:</div>
              <div>
                Monthly Compounding Future Value: <code className="font-mono bg-white px-1 py-0.5 rounded">FV = P × [((1 + r)^n − 1) / r]</code> where <em>P</em> = ₹{investmentMonthly}, <em>r</em> = {(investmentRate / 12).toFixed(4)}% monthly rate, and <em>n</em> = {investmentYears * 12} months. (When <em>r</em> = 0, FV = P × n).
              </div>
            </div>

            {/* Prominent Disclaimer */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mandatory Disclaimer:</strong> Illustrative projection only. Market returns are not guaranteed. Actual outcomes may differ and investments can lose value. Figures exclude applicable fees and taxes unless explicitly modelled.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 6: FINANCIAL PROTECTION & EMERGENCY FUND PLANNER */}
      {/* ======================================================== */}
      {activeSection === 'protection' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Card 1: Emergency Fund Planner */}
          <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldAlert className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Emergency Fund Readiness
                </h3>
                <span className="text-[11px] text-slate-400">
                  Protect against job loss, medical emergencies & unexpected repairs
                </span>
              </div>
            </div>

            {/* Target vs Progress */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/80">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Reserve</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  ₹{emergencyPlan.emergencyFundTarget.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">
                  {emergencyTargetMonths} months of essential spend
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Remaining Gap</span>
                <span className="text-base sm:text-lg font-black text-orange-600 mt-0.5 block">
                  ₹{emergencyPlan.remainingTarget.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">
                  {emergencyPlan.fundingProgressPercent}% funded
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, emergencyPlan.fundingProgressPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Current: ₹{currentSavingsInput.toLocaleString('en-IN')}</span>
                <span>Target: ₹{emergencyPlan.emergencyFundTarget.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Target Months Selector (3, 6, 9, 12) */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-600 font-semibold block">Coverage Duration:</span>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEmergencyTargetMonths(m)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      emergencyTargetMonths === m
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Reach Plan */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-100">
              <span className="font-bold text-slate-800 block">Personalized Savings Roadmap:</span>
              <p className="text-[11px] leading-relaxed">
                By funneling your potential monthly savings of <strong>₹{dynamicPotentialSavings.monthly.toLocaleString('en-IN')}</strong>, you will fully bridge your emergency fund target in approximately <strong>{emergencyPlan.estimatedMonthsToTarget} months</strong>.
              </p>
            </div>
          </div>

          {/* Card 2: Health Insurance Planning Guidance */}
          <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                <HeartPulse className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Health Insurance Planning
                </h3>
                <span className="text-[11px] text-slate-400">
                  Comprehensive coverage benchmarks & Section 80D tax savings
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Users may compare health insurance policies based on their family medical history, network hospitals, premiums, room-rent capping exclusions, and pre-existing disease waiting periods.
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/80">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Allocated Monthly Premium</span>
                <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                  ₹{healthPremiumInput.toLocaleString('en-IN')} / mo
                </span>
                <span className="text-[10px] text-slate-500">₹{healthPlan.annualPremium.toLocaleString('en-IN')} / year</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Estimated 80D Tax Save</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 mt-0.5 block">
                  ₹{healthPlan.taxSection80DBenefit.toLocaleString('en-IN')} / yr
                </span>
                <span className="text-[10px] text-slate-500">Under 20% tax slab</span>
              </div>
            </div>

            {/* Slider to adjust insurance premium allocation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Allocate Monthly Toward Health Coverage:</span>
                <span className="font-extrabold text-[#F97316]">₹{healthPremiumInput} / mo</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={healthPremiumInput}
                onChange={(e) => setHealthPremiumInput(Number(e.target.value))}
                className="w-full accent-[#F97316] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-slate-100">
              <strong>IRDAI Benchmark Note:</strong> An allocation of ₹1,000 - ₹1,500/month generally covers ₹10 Lakhs - ₹15 Lakhs sum-insured family floater in metropolitan areas with no room-rent capping. Actual policy eligibility and benefits require specific underwriting data.
            </div>
          </div>
        </div>
      )}

      {/* Category Classifier Modal for User Corrections */}
      {classifierModal.isOpen && (
        <CategoryClassifierModal
          isOpen={classifierModal.isOpen}
          onClose={() => setClassifierModal({ isOpen: false, merchantName: '' })}
          merchantName={classifierModal.merchantName}
          currentCategory={classifierModal.currentCategory}
          onSaveCategory={(newCat) => {
            showToast(`Reclassified ${classifierModal.merchantName} to ${newCat}`);
            setClassifierModal({ isOpen: false, merchantName: '' });
            fetchAllInsightsData(isDemoMode);
          }}
        />
      )}
    </div>
  );
}
