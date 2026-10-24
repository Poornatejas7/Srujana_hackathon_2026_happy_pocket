'use client';

import React from 'react';
import { ShoppingCart, Fuel, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export interface DisplayTransaction {
  id: string;
  title: string;
  timestamp: string;
  amount: number; // positive for inflow, negative for outflow
  type: 'grocery' | 'fuel' | 'salary' | 'transfer' | 'other';
  rawTimeText?: string;
}

interface RecentTransactionsProps {
  transactions?: DisplayTransaction[];
  onViewAll?: () => void;
  onTransactionClick?: (tx: DisplayTransaction) => void;
}

export default function RecentTransactions({
  transactions = [],
  onViewAll,
  onTransactionClick,
}: RecentTransactionsProps) {
  const displayItems = transactions || [];
  return (
    <div className="w-full rounded-[26px] sm:rounded-[30px] bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100/80">
      {/* Title & View All */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Recent Transactions
        </h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            See all
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3.5 sm:space-y-4">
        {displayItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No live transactions recorded yet in database.
          </div>
        ) : (
          displayItems.map((tx) => {
          const isInflow = tx.amount > 0;

          // Render proper icon & background per type
          let iconElement = <ShoppingCart className="w-5 h-5 stroke-[2.2]" />;
          let iconBg = 'bg-[#FFF3EC] text-[#F97316]';

          if (tx.type === 'grocery') {
            iconElement = <ShoppingCart className="w-5 h-5 stroke-[2.2]" />;
            iconBg = 'bg-[#FFF3EC] text-[#F97316]';
          } else if (tx.type === 'fuel') {
            iconElement = <Fuel className="w-5 h-5 stroke-[2.2]" />;
            iconBg = 'bg-[#FFF3EC] text-[#F97316]';
          } else if (tx.type === 'salary') {
            iconElement = <Wallet className="w-5 h-5 stroke-[2.2]" />;
            iconBg = 'bg-[#EBFBF3] text-[#10B981]';
          } else if (isInflow) {
            iconElement = <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />;
            iconBg = 'bg-[#EBFBF3] text-[#10B981]';
          } else {
            iconElement = <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />;
            iconBg = 'bg-[#FFF3EC] text-[#F97316]';
          }

          return (
            <div
              key={tx.id}
              onClick={() => onTransactionClick?.(tx)}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              {/* Left: Icon & Meta */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${iconBg}`}
                >
                  {iconElement}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {tx.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                    {tx.rawTimeText || tx.timestamp}
                  </p>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="text-right">
                <span
                  className={`text-sm sm:text-base font-extrabold font-sans tracking-tight ${
                    isInflow ? 'text-[#10B981]' : 'text-slate-900'
                  }`}
                >
                  {isInflow ? '+₹' : '-₹'}
                  {Math.abs(tx.amount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
