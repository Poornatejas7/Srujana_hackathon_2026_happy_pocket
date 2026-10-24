'use client';

import React from 'react';
import { Home, CreditCard, Clock, User } from 'lucide-react';

export type NavTab = 'home' | 'payments' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  className?: string;
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
      id: 'history' as NavTab,
      label: 'History',
      icon: Clock,
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className={`w-full bg-white/95 backdrop-blur-md border-t border-slate-100/90 px-6 py-2 sm:py-3 shadow-[0_-4px_24px_rgba(15,23,42,0.05)] rounded-t-[28px] sm:rounded-b-[28px] ${className}`}
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
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all group focus:outline-none"
            >
              <div
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-[#F97316]'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              </div>

              <span
                className={`text-[11px] sm:text-xs tracking-tight mt-1 transition-colors duration-200 ${
                  isActive
                    ? 'font-bold text-[#F97316]'
                    : 'font-medium text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Underline matching screenshot */}
              <div className="h-1 mt-1 flex items-center justify-center">
                {isActive ? (
                  <div className="w-7 h-[3px] bg-[#F97316] rounded-full" />
                ) : (
                  <div className="w-7 h-[3px] bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
