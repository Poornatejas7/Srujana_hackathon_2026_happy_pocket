'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  ArrowDown, 
  ArrowUpRight,
  Utensils, 
  ShoppingCart, 
  Play, 
  Fuel, 
  MoreHorizontal,
  Home,
  HeartPulse,
  Send,
  Building2,
  Tag,
  Search,
  Filter,
  Users,
  Store,
  Layers,
  Sparkles,
  CheckCircle2,
  Receipt,
  Clock,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Hash,
  ShieldAlert,
  ShieldCheck,
  PiggyBank,
  AlertTriangle,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { DisplayTransaction } from './RecentTransactions';
import { RawTransaction } from '@/types/finance';

interface ExpenseTrackerTabProps {
  transactions?: DisplayTransaction[];
  rawTransactions?: RawTransaction[];
  onNavigateToAdvisor?: () => void;
  onClassifyMerchant?: (merchantName: string, currentCategory?: string) => void;
}

interface TransferItem {
  id: string;
  transferIndex: number;
  date: string;
  timeText?: string;
  amount: number; // Particular amount transferred that time
  rrn?: string;
  remark?: string;
  rawDescription?: string;
}

interface RecipientAccountSummary {
  name: string;
  vpaHandle: string;
  theme: string;
  themeIcon: string;
  accountType: 'Merchant / Business' | 'Personal';
  count: number; // how many times this account received money
  totalAmount: number;
  minAmount: number;
  maxAmount: number;
  avgAmount: number;
  hasVaryingAmounts: boolean;
  transfers: TransferItem[]; // List of particular transfers with their exact amounts
}

interface CategoryExpenseGroup {
  category: string;
  totalAmount: number;
  percent: number;
  txCount: number; // how many times money was sent in this category
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  barColor: string;
  recipients: RecipientAccountSummary[];
}

// Icon and color map per Category
const CATEGORY_STYLE_MAP: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  barColor: string;
  donutColor: string;
}> = {
  'Food & Dining': {
    icon: Utensils,
    iconBg: 'bg-[#FF8A00]',
    barColor: 'bg-[#FF8A00]',
    donutColor: '#FF9500',
  },
  'Dining & Nightlife': {
    icon: Utensils,
    iconBg: 'bg-[#FF8A00]',
    barColor: 'bg-[#FF8A00]',
    donutColor: '#FF9500',
  },
  'Groceries': {
    icon: ShoppingCart,
    iconBg: 'bg-[#10B981]',
    barColor: 'bg-[#10B981]',
    donutColor: '#10B981',
  },
  'Shopping & Discretionary': {
    icon: ShoppingCart,
    iconBg: 'bg-[#2F80ED]',
    barColor: 'bg-[#2F80ED]',
    donutColor: '#2F80ED',
  },
  'Shopping': {
    icon: ShoppingCart,
    iconBg: 'bg-[#2F80ED]',
    barColor: 'bg-[#2F80ED]',
    donutColor: '#2F80ED',
  },
  'Subscriptions & Digital': {
    icon: Play,
    iconBg: 'bg-[#8B5CF6]',
    barColor: 'bg-[#8B5CF6]',
    donutColor: '#8B5CF6',
  },
  'Subscriptions': {
    icon: Play,
    iconBg: 'bg-[#8B5CF6]',
    barColor: 'bg-[#8B5CF6]',
    donutColor: '#8B5CF6',
  },
  'Transport & Fuel': {
    icon: Fuel,
    iconBg: 'bg-[#F59E0B]',
    barColor: 'bg-[#F59E0B]',
    donutColor: '#F59E0B',
  },
  'Healthcare': {
    icon: HeartPulse,
    iconBg: 'bg-[#EF4444]',
    barColor: 'bg-[#EF4444]',
    donutColor: '#EF4444',
  },
  'Housing & Utilities': {
    icon: Home,
    iconBg: 'bg-[#06B6D4]',
    barColor: 'bg-[#06B6D4]',
    donutColor: '#06B6D4',
  },
  'Reimbursement / Split': {
    icon: Send,
    iconBg: 'bg-[#3B82F6]',
    barColor: 'bg-[#3B82F6]',
    donutColor: '#3B82F6',
  },
  'Internal Transfer': {
    icon: Building2,
    iconBg: 'bg-[#64748B]',
    barColor: 'bg-[#64748B]',
    donutColor: '#64748B',
  },
  'Others': {
    icon: MoreHorizontal,
    iconBg: 'bg-[#94A3B8]',
    barColor: 'bg-[#94A3B8]',
    donutColor: '#94A3B8',
  },
};

// SVG Donut Chart helper calculating exact donut slices with gap
function DynamicDonutChart({ slices }: { slices: { percent: number; color: string; label: string }[] }) {
  const size = 118;
  const center = size / 2;
  const outerR = 48;
  const innerR = 27;

  const validSlices = slices.length > 0 ? slices : [{ percent: 100, color: '#E2E8F0', label: 'No Data' }];

  let accumulatedAngle = -90;

  const paths = validSlices.map((slice, index) => {
    const angle = Math.max(2, (slice.percent / 100) * 360);
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1Out = center + outerR * Math.cos(startRad);
    const y1Out = center + outerR * Math.sin(startRad);
    const x2Out = center + outerR * Math.cos(endRad);
    const y2Out = center + outerR * Math.sin(endRad);

    const x2In = center + innerR * Math.cos(endRad);
    const y2In = center + innerR * Math.sin(endRad);
    const x1In = center + innerR * Math.cos(startRad);
    const y1In = center + innerR * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = [
      `M ${x1Out} ${y1Out}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Out} ${y2Out}`,
      `L ${x2In} ${y2In}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1In} ${y1In}`,
      'Z',
    ].join(' ');

    return (
      <path
        key={index}
        d={d}
        fill={slice.color}
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
    );
  });

  return (
    <div className="relative w-[118px] h-[118px] flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {paths}
        <circle cx={center} cy={center} r={innerR - 1.5} fill="#FFFFFF" />
      </svg>

      {/* Center Wallet Outline Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          width="26"
          height="22"
          viewBox="0 0 26 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="2.5"
            width="22"
            height="17"
            rx="4"
            stroke="#1E293B"
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d="M17 7.5H22.5C23.8807 7.5 25 8.61929 25 10V12C25 13.3807 23.8807 14.5 22.5 14.5H17"
            stroke="#1E293B"
            strokeWidth="2.2"
            fill="#FFFFFF"
          />
          <circle cx="21" cy="11" r="1.3" fill="#1E293B" />
        </svg>
      </div>
    </div>
  );
}

export default function ExpenseTrackerTab({
  transactions = [],
  rawTransactions = [],
  onNavigateToAdvisor,
  onClassifyMerchant,
}: ExpenseTrackerTabProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [expandedMerchantName, setExpandedMerchantName] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'merchants' | 'personal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllRecipientsView, setShowAllRecipientsView] = useState(false);
  const [activeAnalysisCard, setActiveAnalysisCard] = useState<'velocity' | 'distortion' | 'leakage'>('velocity');

  // Raw transactions lookup map for rich details (RRN, remark, rawDescription)
  const rawLookup = useMemo(() => {
    const map = new Map<string, RawTransaction>();
    rawTransactions.forEach(r => {
      if (r.id) map.set(r.id, r);
      if (r.rawDescription) map.set(r.rawDescription, r);
    });
    return map;
  }, [rawTransactions]);

  // Filter only outgoing debit transactions
  const debitTransactions = useMemo(() => {
    return transactions.filter(t => t.amount < 0);
  }, [transactions]);

  // ========================================================
  // REAL-WORLD SPENDING EXPENDITURE INTELLIGENCE ENGINE
  // ========================================================
  const realWorldMetrics = useMemo(() => {
    const grossOutflow = debitTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

    // 1. Anti-Distortion: Identify Non-Living Transfers
    const selfTransfers = debitTransactions
      .filter(t => t.category === 'Internal Transfer' || t.title.toLowerCase().includes('own') || t.title.toLowerCase().includes('canara'))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const personalReimbursements = debitTransactions
      .filter(t => t.accountType === 'Personal' && t.category !== 'Internal Transfer')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    // True Net Living Expenditure (Actual cost of living that drains net worth)
    const trueLivingExpenses = Math.max(0, grossOutflow - selfTransfers - personalReimbursements);

    // 2. Spending Velocity & Burn Rate (Assuming day 25 of 31-day month)
    const currentDayOfMonth = 25;
    const daysInMonth = 31;
    const dailyBurnRate = trueLivingExpenses > 0 ? (trueLivingExpenses / currentDayOfMonth) : 0;
    const projectedMonthEnd = dailyBurnRate * daysInMonth;
    const safeDailyLimit = 950; // benchmark daily limit for ₹30,000 monthly living budget
    const isPacingOverBudget = dailyBurnRate > safeDailyLimit;

    // 3. Essential Commitments vs Discretionary Leakage
    const essentialCategories = ['Groceries', 'Housing & Utilities', 'Transport & Fuel', 'Healthcare'];
    const discretionaryCategories = ['Dining & Nightlife', 'Food & Dining', 'Shopping & Discretionary', 'Shopping', 'Subscriptions & Digital', 'Subscriptions'];

    const essentialSpend = debitTransactions
      .filter(t => essentialCategories.includes(t.category || ''))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const discretionarySpend = debitTransactions
      .filter(t => discretionaryCategories.includes(t.category || ''))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const livingTotal = essentialSpend + discretionarySpend || 1;
    const discretionaryPercent = Math.round((discretionarySpend / livingTotal) * 100);
    const essentialPercent = 100 - discretionaryPercent;

    // 4. Recoverable Leakage (Frequent discretionary impulse dining + apparel)
    const swiggyZaraOrders = debitTransactions
      .filter(t => /SWIGGY|ZOMATO|ZARA/i.test(t.title))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const recoverableLeakage = Math.round(swiggyZaraOrders * 0.45); // 45% impulse portion can be saved

    // 5. Compounded SIP Growth from Recoverable Leakage (at 14.5% AMFI historical Index return)
    // Formula: P * [ (1 + r)^n - 1 ] * (1 + r) / r
    const monthlyRate = 0.145 / 12;
    const sipMonths5Yr = 60;
    const sipMonths10Yr = 120;
    const sipFutureValue5Yr = recoverableLeakage > 0 
      ? Math.round(recoverableLeakage * ((Math.pow(1 + monthlyRate, sipMonths5Yr) - 1) / monthlyRate) * (1 + monthlyRate))
      : 0;
    const sipFutureValue10Yr = recoverableLeakage > 0 
      ? Math.round(recoverableLeakage * ((Math.pow(1 + monthlyRate, sipMonths10Yr) - 1) / monthlyRate) * (1 + monthlyRate))
      : 0;

    return {
      grossOutflow,
      selfTransfers,
      personalReimbursements,
      trueLivingExpenses,
      dailyBurnRate,
      projectedMonthEnd,
      safeDailyLimit,
      isPacingOverBudget,
      essentialSpend,
      discretionarySpend,
      discretionaryPercent,
      essentialPercent,
      recoverableLeakage,
      sipFutureValue5Yr,
      sipFutureValue10Yr,
    };
  }, [debitTransactions]);

  // Aggregate Category breakdown with Recipient Accounts and the PARTICULAR AMOUNTS TRANSFERRED EACH TIME
  const categoryGroups: CategoryExpenseGroup[] = useMemo(() => {
    if (!debitTransactions || debitTransactions.length === 0) {
      return [];
    }

    const catMap = new Map<string, {
      totalAmount: number;
      txCount: number;
      recipientsMap: Map<string, {
        name: string;
        vpaHandle: string;
        theme: string;
        themeIcon: string;
        accountType: 'Merchant / Business' | 'Personal';
        transfers: TransferItem[];
      }>;
    }>();

    debitTransactions.forEach(t => {
      // Apply view filter (merchants vs personal)
      if (viewFilter === 'merchants' && t.accountType !== 'Merchant / Business') return;
      if (viewFilter === 'personal' && t.accountType !== 'Personal') return;

      const catName = t.category || 'Others';
      const absAmount = Math.abs(t.amount);

      if (!catMap.has(catName)) {
        catMap.set(catName, {
          totalAmount: 0,
          txCount: 0,
          recipientsMap: new Map(),
        });
      }

      const entry = catMap.get(catName)!;
      entry.totalAmount += absAmount;
      entry.txCount += 1;

      // Group recipient account
      const recipientKey = t.title.trim();
      if (!entry.recipientsMap.has(recipientKey)) {
        entry.recipientsMap.set(recipientKey, {
          name: t.title,
          vpaHandle: t.vpaHandle || `${t.title.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
          theme: t.theme || 'Commercial Expense',
          themeIcon: t.themeIcon || (t.accountType === 'Personal' ? '👤' : '🏪'),
          accountType: t.accountType || 'Merchant / Business',
          transfers: [],
        });
      }

      const rawMatch = rawLookup.get(t.id) || rawLookup.get((t as any).rawDescription);
      const rec = entry.recipientsMap.get(recipientKey)!;

      // Add particular transfer entry
      rec.transfers.push({
        id: t.id,
        transferIndex: rec.transfers.length + 1,
        date: t.rawTimeText || new Date(t.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeText: new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        amount: absAmount, // PARTICULAR AMOUNT TRANSFERRED THIS TIME
        rrn: rawMatch?.upiRrn || (t as any).upiRrn,
        remark: rawMatch?.remark || (t as any).remark || (t as any).rawDescription,
        rawDescription: rawMatch?.rawDescription || (t as any).rawDescription,
      });
    });

    const totalAllCategories = Array.from(catMap.values()).reduce((sum, item) => sum + item.totalAmount, 0) || 1;

    const list: CategoryExpenseGroup[] = [];
    catMap.forEach((val, catName) => {
      const style = CATEGORY_STYLE_MAP[catName] || CATEGORY_STYLE_MAP['Others'];
      const percent = Math.round((val.totalAmount / totalAllCategories) * 100);
      
      const recipients: RecipientAccountSummary[] = Array.from(val.recipientsMap.values()).map(r => {
        const totalAmount = r.transfers.reduce((s, x) => s + x.amount, 0);
        const amounts = r.transfers.map(x => x.amount);
        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);
        const avgAmount = totalAmount / (amounts.length || 1);
        const hasVaryingAmounts = amounts.length > 1 && minAmount !== maxAmount;

        // Sort transfers from newest to oldest
        const sortedTransfers = [...r.transfers].reverse().map((tr, idx) => ({
          ...tr,
          transferIndex: r.transfers.length - idx
        }));

        return {
          name: r.name,
          vpaHandle: r.vpaHandle,
          theme: r.theme,
          themeIcon: r.themeIcon,
          accountType: r.accountType,
          count: r.transfers.length,
          totalAmount,
          minAmount,
          maxAmount,
          avgAmount,
          hasVaryingAmounts,
          transfers: sortedTransfers,
        };
      }).sort((a, b) => b.totalAmount - a.totalAmount);

      list.push({
        category: catName,
        totalAmount: val.totalAmount,
        percent,
        txCount: val.txCount,
        icon: style.icon,
        iconBg: style.iconBg,
        barColor: style.barColor,
        recipients,
      });
    });

    // Sort by total expense descending
    return list.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [debitTransactions, viewFilter, rawLookup]);

  // Overall Total Spent
  const totalSpent = useMemo(() => {
    return categoryGroups.reduce((acc, c) => acc + c.totalAmount, 0);
  }, [categoryGroups]);

  // Total times money was transferred
  const totalTimesTransferred = useMemo(() => {
    return categoryGroups.reduce((acc, c) => acc + c.txCount, 0);
  }, [categoryGroups]);

  // Master list of all distinct recipient accounts across all categories
  const allRecipientAccounts = useMemo(() => {
    const map = new Map<string, RecipientAccountSummary & { category: string }>();

    categoryGroups.forEach(cg => {
      cg.recipients.forEach(r => {
        if (!map.has(r.name)) {
          map.set(r.name, { ...r, category: cg.category });
        } else {
          const existing = map.get(r.name)!;
          const mergedTransfers = [...existing.transfers, ...r.transfers];
          const totalAmount = mergedTransfers.reduce((s, x) => s + x.amount, 0);
          const amounts = mergedTransfers.map(x => x.amount);
          const minAmount = Math.min(...amounts);
          const maxAmount = Math.max(...amounts);
          const avgAmount = totalAmount / (amounts.length || 1);

          existing.count = mergedTransfers.length;
          existing.totalAmount = totalAmount;
          existing.minAmount = minAmount;
          existing.maxAmount = maxAmount;
          existing.avgAmount = avgAmount;
          existing.hasVaryingAmounts = amounts.length > 1 && minAmount !== maxAmount;
          existing.transfers = mergedTransfers;
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count || b.totalAmount - a.totalAmount);
  }, [categoryGroups]);

  // Filtered by user search
  const filteredCategoryGroups = useMemo(() => {
    if (!searchQuery.trim()) return categoryGroups;
    const q = searchQuery.toLowerCase();
    return categoryGroups.filter(cg => 
      cg.category.toLowerCase().includes(q) ||
      cg.recipients.some(r => 
        r.name.toLowerCase().includes(q) || 
        r.vpaHandle.toLowerCase().includes(q) ||
        r.theme.toLowerCase().includes(q)
      )
    );
  }, [categoryGroups, searchQuery]);

  // Slices for Donut Chart
  const donutSlices = useMemo(() => {
    return categoryGroups.map(cg => {
      const style = CATEGORY_STYLE_MAP[cg.category] || CATEGORY_STYLE_MAP['Others'];
      return {
        percent: cg.percent,
        color: style.donutColor,
        label: cg.category,
      };
    });
  }, [categoryGroups]);

  const toggleCategoryExpand = (catName: string) => {
    setExpandedCategoryId(prev => (prev === catName ? null : catName));
  };

  const toggleMerchantExpand = (merchantName: string) => {
    setExpandedMerchantName(prev => (prev === merchantName ? null : merchantName));
  };

  // Check for ambiguous recipients (e.g. Lakshmi Traders, Hanuman Enterprises)
  const ambiguousRecipients = useMemo(() => {
    return allRecipientAccounts.filter(r => 
      /TRADER|ENTERPRISE|AGENC|BHANDAR/i.test(r.name) || 
      r.transfers.some(t => (t as any).isAmbiguous || (t as any).needsReview)
    );
  }, [allRecipientAccounts]);

  return (
    <div className="w-full space-y-4 select-none animate-fadeIn">
      
      {/* 1. Date Selector Pill & Mode Switch */}
      <div className="flex items-center justify-between pt-0.5 pb-1 flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-2xl shadow-xs border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition active:scale-95 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
          <span className="font-bold text-slate-800 tracking-tight">
            October 2026 (Live Run-Rate)
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
        </div>

        {/* Toggle between Category View and All Accounts View */}
        <button
          type="button"
          onClick={() => setShowAllRecipientsView(!showAllRecipientsView)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
            showAllRecipientsView
              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{showAllRecipientsView ? 'Category View' : 'All Accounts Breakdown'}</span>
        </button>
      </div>

      {/* 1.5. AMBIGUOUS MERCHANTS CATEGORY CONFIRMATION BANNER (e.g. Lakshmi Traders, Hanuman Enterprises) */}
      {ambiguousRecipients.length > 0 && (
        <div className="p-3.5 rounded-[22px] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 shadow-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <h4 className="text-xs font-extrabold text-amber-950">
                Confirm Store Categories ({ambiguousRecipients.length})
              </h4>
            </div>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              Category Needed
            </span>
          </div>

          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Stores with generic commercial names like <strong>{ambiguousRecipients.map(r => r.name).join(', ')}</strong> can sell groceries, hardware, or general items. Tap below to tell Happy Pocket the exact category:
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {ambiguousRecipients.map(r => (
              <button
                key={r.name}
                type="button"
                onClick={() => onClassifyMerchant?.(r.name, r.category)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <span>🏪 {r.name}</span>
                <span className="text-[10px] text-amber-700 font-normal">({r.category})</span>
                <Tag className="w-3 h-3 text-orange-500 ml-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. REAL-WORLD FINANCE: TRUE LIVING EXPENDITURE VS GROSS OUTFLOW */}
      <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              True Net Living Expenditure
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Atlas Synced
            </span>
          </div>

          {/* TRUE LIVING EXPENDITURE (Excluding Self-Transfers & P2P Offsets) */}
          <div className="text-2xl sm:text-[32px] font-black text-slate-900 tracking-tight leading-none mt-2 font-sans">
            ₹{realWorldMetrics.trueLivingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <p className="text-[11px] text-slate-500 font-medium mt-1.5">
            {realWorldMetrics.grossOutflow > 0 ? (
              <>Gross Bank Debits: <span className="line-through text-slate-400">₹{realWorldMetrics.grossOutflow.toLocaleString('en-IN')}</span> (₹{realWorldMetrics.selfTransfers.toLocaleString('en-IN')} self-transfers excluded)</>
            ) : (
              <>No expenses recorded yet • Ledger is clean</>
            )}
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 rounded-full border border-orange-200/60">
              <span className="text-orange-700 text-[11px] font-bold">
                {totalTimesTransferred} Total Transfers
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full">
              <span className="text-slate-600 text-[11px] font-medium">
                {allRecipientAccounts.length} Receiving Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Donut Chart */}
        <DynamicDonutChart slices={donutSlices} />
      </div>

      {/* ======================================================== */}
      {/* 3. REAL-WORLD FINANCIAL INTELLIGENCE CARDS (3 TABS)      */}
      {/* ======================================================== */}
      <div className="space-y-2">
        {/* Sub-Tabs for Intelligence */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveAnalysisCard('velocity')}
            className={`py-2 px-1 rounded-xl transition cursor-pointer text-center ${
              activeAnalysisCard === 'velocity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Run-Rate
          </button>
          <button
            type="button"
            onClick={() => setActiveAnalysisCard('distortion')}
            className={`py-2 px-1 rounded-xl transition cursor-pointer text-center ${
              activeAnalysisCard === 'distortion'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anti-Distortion
          </button>
          <button
            type="button"
            onClick={() => setActiveAnalysisCard('leakage')}
            className={`py-2 px-1 rounded-xl transition cursor-pointer text-center ${
              activeAnalysisCard === 'leakage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SIP Opportunity
          </button>
        </div>

        {/* Tab 1: Daily Run-Rate & Real-Time Velocity */}
        {activeAnalysisCard === 'velocity' && (
          <div className="p-4 rounded-[22px] bg-white border border-slate-100 shadow-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Real-Time Spending Velocity</h4>
                  <p className="text-[10px] text-slate-400">Day 25 of 31 • Projected end-of-month run rate</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                realWorldMetrics.isPacingOverBudget
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {realWorldMetrics.isPacingOverBudget ? 'Above Safe Velocity' : 'Optimal Pace ✓'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Burn Rate</span>
                <span className="text-base font-extrabold text-slate-900 font-sans mt-0.5 block">
                  ₹{realWorldMetrics.dailyBurnRate.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">/ day</span>
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">Benchmark limit: ₹{realWorldMetrics.safeDailyLimit}/day</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Projected Month-End</span>
                <span className="text-base font-extrabold text-slate-900 font-sans mt-0.5 block">
                  ₹{realWorldMetrics.projectedMonthEnd.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">Actual net expenditure pace</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Anti-Distortion (Gross vs Real Expenditure Breakdown) */}
        {activeAnalysisCard === 'distortion' && (
          <div className="p-4 rounded-[22px] bg-white border border-slate-100 shadow-xs space-y-2.5 animate-fadeIn text-xs">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900">Why Banking Apps Skew Your True Expenditure</h4>
            </div>
            
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-sans">Gross Bank Outflow (SMS Debits)</span>
                <span className="font-bold text-slate-900">₹{realWorldMetrics.grossOutflow.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900">
                <span className="font-sans">(-) Own Bank Account Transfers</span>
                <span className="font-bold">-₹{realWorldMetrics.selfTransfers.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900">
                <span className="font-sans">(-) Personal &amp; Shared Reimbursements</span>
                <span className="font-bold">-₹{realWorldMetrics.personalReimbursements.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold">
                <span className="font-sans">(=) True Net Cost of Living</span>
                <span className="text-emerald-700 text-sm">₹{realWorldMetrics.trueLivingExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SIP Opportunity from Impulse Leakage */}
        {activeAnalysisCard === 'leakage' && (
          <div className="p-4 rounded-[22px] bg-white border border-slate-100 shadow-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Identified Impulse Leakage $\rightarrow$ Wealth SIP</h4>
                  <p className="text-[10px] text-slate-400">Convert unneeded dining &amp; apparel trends to index wealth</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100 text-xs text-purple-950 space-y-2">
              <div className="flex justify-between items-center">
                <span>Recoverable Monthly Leakage:</span>
                <span className="font-extrabold text-sm text-purple-900 font-sans">
                  ₹{realWorldMetrics.recoverableLeakage.toLocaleString('en-IN')} <span className="text-[10px] font-normal">/ month</span>
                </span>
              </div>
              <div className="h-px bg-purple-200/60" />
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">5 Years @ 14.5% Index CAGR</span>
                  <span className="font-bold text-emerald-700 text-sm font-sans">₹{realWorldMetrics.sipFutureValue5Yr.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">10 Years @ 14.5% Index CAGR</span>
                  <span className="font-bold text-emerald-700 text-sm font-sans">₹{realWorldMetrics.sipFutureValue10Yr.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {onNavigateToAdvisor && (
                <button
                  type="button"
                  onClick={onNavigateToAdvisor}
                  className="w-full mt-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <span>Deploy into Real Mutual Fund SIPs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Search & Filter Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search category, merchant, or account name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Filter Chips: All vs Merchants vs Personal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          {[
            { id: 'all', label: `All Outflows (${totalTimesTransferred} times)` },
            { id: 'merchants', label: 'Merchants & Stores' },
            { id: 'personal', label: 'Personal Transfers' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setViewFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] whitespace-nowrap cursor-pointer ${
                viewFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. MAIN CONTENT VIEW: Show All Recipient Accounts OR Category Breakdown */}
      {showAllRecipientsView ? (
        /* ======================================================== */
        /* MASTER VIEW: ALL RECIPIENT ACCOUNTS & TIMES RECEIVED     */
        /* ======================================================== */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              <span>All Accounts &amp; Merchants that Received Money ({allRecipientAccounts.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {allRecipientAccounts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl text-xs text-slate-400 border border-slate-100">
                No matching accounts found.
              </div>
            ) : (
              allRecipientAccounts.map((acc, idx) => {
                const isMerchantExpanded = expandedMerchantName === acc.name;
                return (
                  <div
                    key={`${acc.name}_${idx}`}
                    className="bg-white rounded-[24px] p-4 shadow-2xs border border-slate-100 hover:border-slate-200 transition space-y-3"
                  >
                    <div 
                      onClick={() => toggleMerchantExpand(acc.name)}
                      className="flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center text-xl shrink-0">
                          {acc.themeIcon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {acc.name}
                            </h4>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 ${
                                acc.accountType === 'Merchant / Business'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {acc.accountType === 'Merchant / Business' ? 'Merchant' : 'Personal'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                            UPI ID: {acc.vpaHandle}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                            Theme: {acc.theme} • {acc.category}
                          </p>
                        </div>
                      </div>

                      {/* Right: Frequency badge and Total Amount */}
                      <div className="text-right shrink-0">
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold mb-1">
                          Received {acc.count} {acc.count === 1 ? 'time' : 'times'}
                        </div>
                        <div className="text-sm font-black text-slate-900 font-sans">
                          ₹{acc.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                          {isMerchantExpanded ? 'Tap to collapse' : 'Tap to see each transfer'}
                        </div>
                      </div>
                    </div>

                    {/* VARYING AMOUNTS PILL BAR */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex-wrap gap-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                        <span>Amounts Transferred:</span>
                      </span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 flex-wrap">
                        {acc.transfers.map((tr, tIdx) => (
                          <span
                            key={tr.id || tIdx}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs text-orange-600 shadow-2xs"
                          >
                            ₹{tr.amount.toLocaleString('en-IN')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* EXPANDABLE FULL TRANSFER BREAKDOWN TABLE */}
                    {isMerchantExpanded && (
                      <div className="pt-2 border-t border-slate-100 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          <span>Particular Transfers to {acc.name}:</span>
                          <span className="text-[10px] text-slate-400 lowercase font-mono">
                            Avg: ₹{acc.avgAmount.toFixed(2)}/transfer
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {acc.transfers.map((tr) => (
                            <div
                              key={tr.id}
                              className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    #{tr.transferIndex}
                                  </span>
                                  <span className="font-bold text-slate-900 truncate">
                                    {tr.remark || tr.rawDescription}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 pl-7 font-mono">
                                  <span>{tr.date} {tr.timeText ? `at ${tr.timeText}` : ''}</span>
                                  {tr.rrn && <span>• Ref: {tr.rrn}</span>}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-extrabold font-sans text-sm text-slate-900 block">
                                  ₹{tr.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Particular Transfer
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* CATEGORY BREAKDOWN WITH TIMES SENT & RECIPIENT ACCOUNTS */
        /* ======================================================== */
        <div className="space-y-3 pb-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Spending by Category &amp; Recipient Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              Tap any category to inspect accounts
            </span>
          </div>

          {filteredCategoryGroups.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl text-xs text-slate-400 border border-slate-100">
              No expenses recorded yet in MongoDB Atlas.
            </div>
          ) : (
            filteredCategoryGroups.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = expandedCategoryId === cat.category;

              return (
                <div
                  key={cat.category}
                  className="bg-white rounded-[24px] shadow-2xs border border-slate-100 hover:border-slate-200 transition overflow-hidden"
                >
                  {/* Category Card Header */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.category)}
                    className="px-4 py-3.5 flex items-center justify-between cursor-pointer group"
                  >
                    {/* Left: Icon, Name & Progress Bar */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-3">
                      <div
                        className={`w-11 h-11 rounded-full ${cat.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-orange-600 transition truncate">
                            {cat.category}
                          </h4>
                          {/* REQUIRED: Show how many times money was sent in each category */}
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-extrabold shrink-0">
                            Sent {cat.txCount} {cat.txCount === 1 ? 'time' : 'times'}
                          </span>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full ${cat.barColor} transition-all duration-500`}
                            style={{ width: `${Math.max(4, cat.percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount, Percentage & Expand Chevron */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="text-[13px] font-bold text-slate-900 font-sans block">
                          ₹{cat.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {cat.percent}% • {cat.recipients.length} {cat.recipients.length === 1 ? 'account' : 'accounts'}
                        </span>
                      </div>
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500 group-hover:text-slate-800 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* EXPANDED ACCORDION: LIST OF ACCOUNTS & PARTICULAR AMOUNTS*/}
                  {/* ======================================================== */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-50/80 border-t border-slate-100 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-orange-500" />
                          <span>Accounts &amp; Names that Received Money in {cat.category}:</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {cat.recipients.length} receiving accounts
                        </span>
                      </div>

                      <div className="space-y-3">
                        {cat.recipients.map((rec, rIdx) => (
                          <div
                            key={`${rec.name}_${rIdx}`}
                            className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs hover:border-orange-300 transition space-y-2.5"
                          >
                            {/* Merchant / Recipient Account Header */}
                            <div className="flex items-center justify-between gap-2.5">
                              {/* Left details */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-base shrink-0">
                                  {rec.themeIcon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                      {rec.name}
                                    </h5>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 ${
                                        rec.accountType === 'Merchant / Business'
                                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                                      }`}
                                    >
                                      {rec.accountType === 'Merchant / Business' ? 'Merchant' : 'Personal'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                                    UPI ID: {rec.vpaHandle}
                                  </p>
                                  <p className="text-[10px] text-emerald-600 font-medium truncate mt-0.5">
                                    Selling Theme: {rec.theme}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Frequency & Total Amount */}
                              <div className="text-right shrink-0">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-extrabold">
                                  Received {rec.count} {rec.count === 1 ? 'time' : 'times'}
                                </span>
                                <div className="text-xs sm:text-sm font-black text-slate-900 font-sans mt-0.5">
                                  ₹{rec.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>

                            {/* PARTICULAR AMOUNT TRANSFERRED EACH TIME (REQUIRED BY USER) */}
                            <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                  <Receipt className="w-3 h-3 text-orange-500" />
                                  <span>Particular Amount Transferred Each Time ({rec.count} transfers):</span>
                                </span>
                                {rec.hasVaryingAmounts && (
                                  <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    Amounts Vary Across Visits
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                {rec.transfers.map((tr) => (
                                  <div
                                    key={tr.id}
                                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/70 flex items-center justify-between text-xs hover:bg-orange-50/30 transition"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                                        #{tr.transferIndex}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-slate-800 truncate">
                                          {tr.remark || tr.rawDescription}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-mono">
                                          {tr.date} {tr.timeText ? `• ${tr.timeText}` : ''} {tr.rrn ? `• Ref: ${tr.rrn}` : ''}
                                        </p>
                                      </div>
                                    </div>

                                    {/* The Particular Amount */}
                                    <div className="text-right shrink-0">
                                      <span className="font-extrabold font-sans text-xs sm:text-sm text-slate-900">
                                        ₹{tr.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
