'use client';

import React, { useState } from 'react';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, FileUp } from 'lucide-react';
import { DisplayTransaction } from './RecentTransactions';

interface HistoryTabProps {
  transactions: DisplayTransaction[];
  onOpenUpload: () => void;
}

export default function HistoryTab({ transactions, onOpenUpload }: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'outflow' | 'inflow'>('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'outflow') return tx.amount < 0;
    if (filterType === 'inflow') return tx.amount > 0;
    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition shadow-sm shrink-0"
          title="Import Bank Statement PDF"
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>Statement</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 text-xs">
        {[
          { id: 'all', label: 'All' },
          { id: 'outflow', label: 'Debits (-)' },
          { id: 'inflow', label: 'Credits (+)' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              filterType === f.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100 divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transactions found matching your criteria.
          </div>
        ) : (
          filtered.map((tx) => {
            const isInflow = tx.amount > 0;
            return (
              <div key={tx.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {isInflow ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">{tx.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {tx.rawTimeText || tx.timestamp}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs sm:text-sm font-extrabold font-sans tracking-tight ${
                    isInflow ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {isInflow ? '+₹' : '-₹'}
                  {Math.abs(tx.amount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
