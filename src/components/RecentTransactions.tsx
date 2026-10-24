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
  onTransactionClick?: (tx: DisplayTransaction) => void;
}

export const DEFAULT_RECENT_TRANSACTIONS: DisplayTransaction[] = [
  {
    id: 'tx_default_1',
    title: 'Grocery',
    rawTimeText: 'Today, 10:24 AM',
    timestamp: new Date().toISOString(),
    amount: -1299.00,
    type: 'grocery',
  },
  {
    id: 'tx_default_2',
    title: 'Fuel',
    rawTimeText: 'Today, 08:15 AM',
    timestamp: new Date().toISOString(),
    amount: -650.00,
    type: 'fuel',
  },
  {
    id: 'tx_default_3',
    title: 'Salary',
    rawTimeText: 'Yesterday, 12:00 PM',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    amount: 24000.00,
    type: 'salary',
  },
];

export default function RecentTransactions({
  transactions = DEFAULT_RECENT_TRANSACTIONS,
  onTransactionClick,
}: RecentTransactionsProps) {
  return (
    <div className="w-full rounded-[24px] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-slate-100/90">
      {/* Title */}
      <div className="mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Recent Transactions
        </h3>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5 sm:space-y-3">
        {transactions.map((tx) => {
          const isInflow = tx.amount > 0;

          // Render proper icon & background per type
          let iconElement = <ShoppingCart className="w-4 h-4 stroke-[2.2]" />;
          let iconBg = 'bg-[#FFF3EC] text-[#F97316]';

          if (tx.type === 'grocery') {
            iconElement = <ShoppingCart className="w-4 h-4 stroke-[2.2]" />;
            iconBg = 'bg-[#FFF3EC] text-[#F97316]';
          } else if (tx.type === 'fuel') {
            iconElement = <Fuel className="w-4 h-4 stroke-[2.2]" />;
            iconBg = 'bg-[#FFF3EC] text-[#F97316]';
          } else if (tx.type === 'salary') {
            iconElement = <Wallet className="w-4 h-4 stroke-[2.2]" />;
            iconBg = 'bg-[#EBFBF3] text-[#10B981]';
          } else if (isInflow) {
            iconElement = <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />;
            iconBg = 'bg-[#EBFBF3] text-[#10B981]';
          } else {
            iconElement = <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />;
            iconBg = 'bg-[#FFF3EC] text-[#F97316]';
          }

          return (
            <div
              key={tx.id}
              onClick={() => onTransactionClick?.(tx)}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              {/* Left: Icon & Title/Time */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                >
                  {iconElement}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {tx.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {tx.rawTimeText || tx.timestamp}
                  </p>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="text-right">
                <span
                  className={`text-xs sm:text-sm font-extrabold font-sans tracking-tight ${
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
        })}
      </div>
    </div>
  );
}
