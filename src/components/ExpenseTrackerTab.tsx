'use client';

import React from 'react';
import { 
  Calendar, 
  ChevronDown, 
  ArrowDown, 
  Utensils, 
  ShoppingCart, 
  Play, 
  Fuel, 
  MoreHorizontal,
  Home,
  HeartPulse,
  Building
} from 'lucide-react';
import { RawTransaction } from '@/types/finance';

export interface ExpenseTrackerTabProps {
  transactions?: RawTransaction[];
}

interface ProcessedCategory {
  id: string;
  name: string;
  amountNumber: number;
  amount: string;
  percent: number;
  iconBg: string;
  barColor: string;
  sliceColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_META: Record<string, {
  name: string;
  iconBg: string;
  barColor: string;
  sliceColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  'Shopping & Discretionary': {
    name: 'Shopping & Discretionary',
    iconBg: 'bg-[#2F80ED]',
    barColor: 'bg-[#2F80ED]',
    sliceColor: '#2F80ED',
    icon: ShoppingCart,
  },
  'Dining & Nightlife': {
    name: 'Food & Dining',
    iconBg: 'bg-[#FF8A00]',
    barColor: 'bg-[#FF8A00]',
    sliceColor: '#FF9500',
    icon: Utensils,
  },
  'Groceries': {
    name: 'Groceries & Provisions',
    iconBg: 'bg-[#10B981]',
    barColor: 'bg-[#10B981]',
    sliceColor: '#10B981',
    icon: ShoppingCart,
  },
  'Subscriptions & Digital': {
    name: 'Subscriptions & Digital',
    iconBg: 'bg-[#8B5CF6]',
    barColor: 'bg-[#8B5CF6]',
    sliceColor: '#8B5CF6',
    icon: Play,
  },
  'Transport & Fuel': {
    name: 'Fuel & Travel',
    iconBg: 'bg-[#06B6D4]',
    barColor: 'bg-[#06B6D4]',
    sliceColor: '#06B6D4',
    icon: Fuel,
  },
  'Housing & Utilities': {
    name: 'Bills & Utilities',
    iconBg: 'bg-[#F59E0B]',
    barColor: 'bg-[#F59E0B]',
    sliceColor: '#F59E0B',
    icon: Home,
  },
  'Healthcare': {
    name: 'Health & Pharmacy',
    iconBg: 'bg-[#EC4899]',
    barColor: 'bg-[#EC4899]',
    sliceColor: '#EC4899',
    icon: HeartPulse,
  },
  'Internal Transfer': {
    name: 'Self Transfers',
    iconBg: 'bg-[#64748B]',
    barColor: 'bg-[#64748B]',
    sliceColor: '#64748B',
    icon: Building,
  },
};

function DynamicDonutChart({ slices }: { slices: { percent: number; color: string }[] }) {
  const size = 114;
  const center = size / 2;
  const outerR = 48;
  const innerR = 27;

  let accumulatedAngle = -75;

  const validSlices = slices.length > 0 ? slices : [{ percent: 100, color: '#E2E8F0' }];

  const paths = validSlices.map((slice, index) => {
    const angle = (slice.percent / 100) * 360;
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
    <div className="relative w-[114px] h-[114px] flex items-center justify-center shrink-0">
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

export default function ExpenseTrackerTab({ transactions }: ExpenseTrackerTabProps) {
  // If transactions are provided directly from props, use them, otherwise fallback to local fetch if standalone route
  const [dbTxs, setDbTxs] = React.useState<RawTransaction[]>(transactions || []);
  const [loading, setLoading] = React.useState(!transactions || transactions.length === 0);

  React.useEffect(() => {
    if (transactions && transactions.length > 0) {
      setDbTxs(transactions);
      setLoading(false);
      return;
    }

    async function fetchFromDb() {
      try {
        const res = await fetch('/api/transactions');
        const json = await res.json();
        if (json.success && json.transactions) {
          setDbTxs(json.transactions);
        }
      } catch (err) {
        console.error('Failed to load DB transactions in ExpenseTrackerTab:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFromDb();
  }, [transactions]);

  // Aggregate debit outflow expenses by category from real database
  const debitTxs = dbTxs.filter((t) => t.amount < 0);
  const totalSpent = debitTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const categoryTotals: Record<string, number> = {};
  for (const t of debitTxs) {
    const cat = t.category || 'Other Discretionary';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  }

  // Sort by highest amount
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const categories: ProcessedCategory[] = sortedCategories.map(([catName, amt]) => {
    const meta = CATEGORY_META[catName] || {
      name: catName,
      iconBg: 'bg-[#94A3B8]',
      barColor: 'bg-[#94A3B8]',
      sliceColor: '#94A3B8',
      icon: MoreHorizontal,
    };

    const percent = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;

    return {
      id: catName,
      name: meta.name,
      amountNumber: amt,
      amount: `₹${amt.toLocaleString('en-IN')}`,
      percent,
      iconBg: meta.iconBg,
      barColor: meta.barColor,
      sliceColor: meta.sliceColor,
      icon: meta.icon,
    };
  });

  const donutSlices = categories.map((c) => ({
    percent: c.percent,
    color: c.sliceColor,
  }));

  return (
    <div className="w-full space-y-3.5 select-none animate-fadeIn">
      {/* 1. Date Selector Pill */}
      <div className="flex items-center justify-center pt-0.5 pb-1">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-200/60 cursor-pointer hover:bg-slate-50 transition active:scale-95">
          <Calendar className="w-4 h-4 text-slate-700 stroke-[2.2]" />
          <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">
            October 2026 • Live Database
          </span>
          <ChevronDown className="w-4 h-4 text-slate-700 stroke-[2.2]" />
        </div>
      </div>

      {/* 2. Total Spent Summary Card with Donut Chart */}
      <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100 flex items-center justify-between gap-3">
        {/* Left Side: Total Spent text, amount, badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              Total Spent
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
              Live DB
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-none mt-2">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F8EE] rounded-full mt-3 border border-emerald-100/60">
            <ArrowDown className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
            <span className="text-[#10B981] text-[11px] font-bold">
              {debitTxs.length} real transactions in Atlas
            </span>
          </div>
        </div>

        {/* Right Side: Dynamic Donut Chart with center Wallet Icon */}
        <DynamicDonutChart slices={donutSlices} />
      </div>

      {/* 3. Section Title */}
      <div className="pt-1 px-1 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          Spending by Category
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          {categories.length} Categories
        </span>
      </div>

      {/* 4. Category Cards List */}
      <div className="space-y-2.5 pb-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Connecting to database and calculating live category spends...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses recorded yet in database.
          </div>
        ) : (
          categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-[22px] px-4 py-3 flex items-center justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)] border border-slate-100 hover:border-slate-200 transition"
              >
                {/* Left: Icon, Name & Progress Bar */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-3">
                  <div
                    className={`w-11 h-11 rounded-full ${cat.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <Icon className="w-5 h-5 text-white stroke-[2.2]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-slate-900 truncate">
                      {cat.name}
                    </h4>
                    {/* Progress Bar Track */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full ${cat.barColor} transition-all duration-500`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Amount and Percentage */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[13px] font-bold text-slate-900 font-sans">
                    {cat.amount}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                    {cat.percent}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
