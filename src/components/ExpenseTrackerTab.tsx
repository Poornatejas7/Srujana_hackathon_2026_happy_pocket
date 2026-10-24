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
  MoreHorizontal 
} from 'lucide-react';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: string;
  percent: number;
  iconBg: string;
  barColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    amount: '₹4,200',
    percent: 34,
    iconBg: 'bg-[#FF8A00]',
    barColor: 'bg-[#6366F1]',
    icon: Utensils,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    amount: '₹3,000',
    percent: 24,
    iconBg: 'bg-[#2F80ED]',
    barColor: 'bg-[#2F80ED]',
    icon: ShoppingCart,
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    amount: '₹1,500',
    percent: 12,
    iconBg: 'bg-[#8B5CF6]',
    barColor: 'bg-[#8B5CF6]',
    icon: Play,
  },
  {
    id: 'travel',
    name: 'Fuel & Travel',
    amount: '₹1,250',
    percent: 10,
    iconBg: 'bg-[#10B981]',
    barColor: 'bg-[#34D399]',
    icon: Fuel,
  },
  {
    id: 'others',
    name: 'Others',
    amount: '₹2,500',
    percent: 20,
    iconBg: 'bg-[#94A3B8]',
    barColor: 'bg-[#94A3B8]',
    icon: MoreHorizontal,
  },
];

// SVG Donut Chart helper calculating exact donut slices with gap
function DonutChart() {
  const size = 114;
  const center = size / 2;
  const outerR = 48;
  const innerR = 27;

  // Slices: [percent, color]
  const slices = [
    { percent: 34, color: '#FF9500' }, // Orange - Food & Dining
    { percent: 24, color: '#2F80ED' }, // Blue - Shopping
    { percent: 12, color: '#8B5CF6' }, // Purple - Subscriptions
    { percent: 10, color: '#10B981' }, // Green - Travel
    { percent: 20, color: '#60A5FA' }, // Light Blue - Others
  ];

  let accumulatedAngle = -75; // Starting top-right tilt like in screenshot

  const paths = slices.map((slice, index) => {
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
        {/* Center white circle */}
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
          {/* Wallet main body */}
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
          {/* Wallet right clasp tab */}
          <path
            d="M17 7.5H22.5C23.8807 7.5 25 8.61929 25 10V12C25 13.3807 23.8807 14.5 22.5 14.5H17"
            stroke="#1E293B"
            strokeWidth="2.2"
            fill="#FFFFFF"
          />
          {/* Clasp inner button */}
          <circle cx="21" cy="11" r="1.3" fill="#1E293B" />
        </svg>
      </div>
    </div>
  );
}

export default function ExpenseTrackerTab() {
  return (
    <div className="w-full space-y-3.5 select-none animate-fadeIn">
      {/* 1. Date Selector Pill */}
      <div className="flex items-center justify-center pt-0.5 pb-1">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-200/60 cursor-pointer hover:bg-slate-50 transition active:scale-95">
          <Calendar className="w-4 h-4 text-slate-700 stroke-[2.2]" />
          <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">
            October 2026
          </span>
          <ChevronDown className="w-4 h-4 text-slate-700 stroke-[2.2]" />
        </div>
      </div>

      {/* 2. Total Spent Summary Card with Donut Chart */}
      <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100 flex items-center justify-between gap-3">
        {/* Left Side: Total Spent text, amount, badge */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
            Total Spent
          </h3>
          <div className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-none mt-2">
            ₹12,450
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F8EE] rounded-full mt-3 border border-emerald-100/60">
            <ArrowDown className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
            <span className="text-[#10B981] text-[11px] font-bold">
              8% from last month
            </span>
          </div>
        </div>

        {/* Right Side: Donut Chart with center Wallet Icon */}
        <DonutChart />
      </div>

      {/* 3. Section Title */}
      <div className="pt-1 px-1">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          Spending by Category
        </h3>
      </div>

      {/* 4. Category Cards List */}
      <div className="space-y-2.5 pb-1">
        {EXPENSE_CATEGORIES.map((cat) => {
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
                  <Icon
                    className={`w-5 h-5 text-white ${
                      cat.id === 'subscriptions' ? 'fill-white' : ''
                    }`}
                  />
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
                <span className="text-[11px] font-semibold text-slate-400 w-7 text-right">
                  {cat.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
