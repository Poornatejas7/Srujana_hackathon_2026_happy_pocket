'use client';

import React, { useState } from 'react';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, FileUp, Store, User, Database, AlertTriangle, Tag } from 'lucide-react';
import { DisplayTransaction } from './RecentTransactions';

interface HistoryTabProps {
  transactions: DisplayTransaction[];
  onOpenUpload: () => void;
  onClassifyMerchant?: (merchantName: string, currentCategory?: string) => void;
}

export default function HistoryTab({ transactions, onOpenUpload, onClassifyMerchant }: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'merchant' | 'personal' | 'outflow' | 'inflow'>('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.category && tx.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.accountType && tx.accountType.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterType === 'merchant') return tx.accountType === 'Merchant / Business';
    if (filterType === 'personal') return tx.accountType === 'Personal';
    if (filterType === 'outflow') return tx.amount < 0;
    if (filterType === 'inflow') return tx.amount > 0;
    return true;
  });

  const merchantCount = transactions.filter(t => t.accountType === 'Merchant / Business').length;
  const personalCount = transactions.filter(t => t.accountType === 'Personal').length;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by merchant, personal name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition shadow-sm shrink-0 cursor-pointer"
          title="Import Bank Statement PDF"
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>
      </div>

      {/* Account Type Classification Counter */}
      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-slate-100 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>MongoDB Atlas:</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-[11px]">
          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            {merchantCount} Merchant
          </span>
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {personalCount} Personal
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 text-xs overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All (${transactions.length})` },
          { id: 'merchant', label: `Merchants (${merchantCount})` },
          { id: 'personal', label: `Personal (${personalCount})` },
          { id: 'outflow', label: 'Debits (-)' },
          { id: 'inflow', label: 'Credits (+)' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] whitespace-nowrap cursor-pointer ${
              filterType === f.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="rounded-[28px] bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100 divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No matching transactions found in database.
          </div>
        ) : (
          filtered.map((tx) => {
            const isInflow = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1 group hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition"
              >
                {/* Left: Direction icon & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {isInflow ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.4]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
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

                      {/* Ambiguity / Needs Category confirmation button */}
                      {(tx.needsReview || tx.isAmbiguous || /TRADER|ENTERPRISE/i.test(tx.title)) && !tx.userOverridden ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClassifyMerchant?.(tx.title, tx.category);
                          }}
                          className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition active:scale-95 cursor-pointer shadow-2xs"
                          title="Click to tell Happy Pocket which category this store belongs to"
                        >
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                          <span>Confirm Category</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClassifyMerchant?.(tx.title, tx.category);
                          }}
                          className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Change Category"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-400 font-medium">
                        {tx.rawTimeText || tx.timestamp}
                      </p>
                      {tx.theme && (
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                          • {tx.themeIcon} {tx.theme}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-extrabold font-sans tracking-tight ${
                      isInflow ? 'text-emerald-600' : 'text-slate-900'
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
