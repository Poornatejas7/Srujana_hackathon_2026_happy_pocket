'use client';

import React from 'react';
import { 
  Home, 
  CreditCard, 
  Lightbulb, 
  User, 
  Repeat, 
  Bot, 
  ReceiptIndianRupee, 
  Layers 
} from 'lucide-react';

export type NavTab = 
  | 'home' 
  | 'payments' 
  | 'expense' 
  | 'insights' 
  | 'history' 
  | 'profile' 
  | 'subscriptions' 
  | 'advisor' 
  | 'tax' 
  | 'wealth';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  className?: string;
}

function ExpenseTrackerBarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <rect x="3" y="10" width="4.2" height="11" rx="2.1" />
      <rect x="9.9" y="3.5" width="4.2" height="17.5" rx="2.1" />
      <rect x="16.8" y="13" width="4.2" height="8" rx="2.1" />
    </svg>
  );
}

export default function BottomNav({
  activeTab,
  onChangeTab,
  className = '',
}: BottomNavProps) {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'payments' as NavTab,
      label: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'expense' as NavTab,
      label: 'Expenses',
      icon: ExpenseTrackerBarIcon,
    },
    {
      id: 'insights' as NavTab,
      label: 'Insights',
      icon: Lightbulb,
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className={`w-full bg-white/95 backdrop-blur-md border-t border-slate-100/90 px-3 py-2 sm:py-2.5 shadow-[0_-4px_24px_rgba(15,23,42,0.05)] rounded-t-[28px] sm:rounded-b-[28px] ${className}`}
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-0.5 px-0.5 transition-all group focus:outline-none cursor-pointer"
            >
              <div
                className={`transition-colors duration-200 flex items-center justify-center h-6 ${
                  isActive
                    ? 'text-[#F97316]'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {tab.id === 'expense' ? (
                  <ExpenseTrackerBarIcon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#F97316]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                ) : (
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-[10px] sm:text-[11px] tracking-tight mt-1 transition-colors duration-200 text-center truncate max-w-[70px] ${
                  isActive
                    ? 'font-bold text-[#F97316]'
                    : 'font-medium text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Underline */}
              <div className="h-1 mt-1 flex items-center justify-center">
                {isActive ? (
                  <div className="w-6 h-[3px] bg-[#F97316] rounded-full" />
                ) : (
                  <div className="w-6 h-[3px] bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
