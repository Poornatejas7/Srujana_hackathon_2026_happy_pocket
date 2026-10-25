'use client';

import React from 'react';
import { ShoppingCart, Fuel, Wallet, ArrowUpRight, ArrowDownLeft, Store, UserCheck } from 'lucide-react';

export interface DisplayTransaction {
  id: string;
  title: string;
  timestamp: string;
  amount: number; // positive for inflow, negative for outflow
  type: 'grocery' | 'fuel' | 'salary' | 'transfer' | 'other';
  rawTimeText?: string;
  accountType?: 'Merchant / Business' | 'Personal';
  category?: string;
}

export const DEFAULT_RECENT_TRANSACTIONS: DisplayTransaction[] = [
  {
    id: 'tx_default_1',
    title: 'Grocery',
    rawTimeText: 'Today, 10:24 AM',
    timestamp: new Date().toISOString(),
    amount: -1299.00,
    type: 'grocery',
    accountType: 'Merchant / Business',
  },
  {
    id: 'tx_default_2',
    title: 'Fuel',
    rawTimeText: 'Today, 08:15 AM',
    timestamp: new Date().toISOString(),
    amount: -650.00,
    type: 'fuel',
    accountType: 'Merchant / Business',
  },
  {
    id: 'tx_default_3',
    title: 'Salary',
    rawTimeText: 'Yesterday, 12:00 PM',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    amount: 24000.00,
    type: 'salary',
    accountType: 'Merchant / Business',
  },
];

interface RecentTransactionsProps {
  transactions?: DisplayTransaction[];
  onViewAll?: () => void;
  onTransactionClick?: (tx: DisplayTransaction) => void;
}

export default function RecentTransactions({
  transactions = DEFAULT_RECENT_TRANSACTIONS,
  onViewAll,
  onTransactionClick,
}: RecentTransactionsProps) {
  const displayItems = transactions && transactions.length > 0 ? transactions : [];

  return (
    <div className="w-full rounded-[26px] sm:rounded-[30px] bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100/80">
      {/* Title & View All */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Transactions
          </h3>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Atlas Synced
          </span>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3 sm:space-y-3.5">
        {displayItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No transactions recorded yet in MongoDB.
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
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${iconBg}`}
                  >
                    {iconElement}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                        {tx.title}
                      </h4>
                      {tx.accountType && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 ${
                            tx.accountType === 'Merchant / Business'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {tx.accountType === 'Merchant / Business' ? 'Merchant' : 'Personal'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                      {tx.rawTimeText || tx.timestamp}
                    </p>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 ml-2">
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
