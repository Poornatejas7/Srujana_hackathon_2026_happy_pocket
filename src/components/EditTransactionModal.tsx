'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  Store, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  AlertTriangle,
  FileText,
  Trash2,
  Calendar,
  Layers,
  Save,
  Clock,
  Hash
} from 'lucide-react';
import { Category } from '@/types/finance';
import { getCategoryIcon, getCategoryThemeLabel } from '@/lib/engine';
import { DisplayTransaction } from './RecentTransactions';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: DisplayTransaction | null;
  onSave: (updatedData: {
    id: string;
    title: string;
    category: Category;
    accountType: 'Merchant / Business' | 'Personal';
    theme: string;
    themeIcon: string;
    remark?: string;
    rememberForFuture: boolean;
  }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

interface CategoryOption {
  id: Category;
  label: string;
  icon: string;
  color: string;
  border: string;
  desc: string;
}

const ALL_CATEGORIES: CategoryOption[] = [
  { id: 'Groceries', label: 'Groceries', icon: '🥦', color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/40', desc: 'Kirana, vegetables, fruits, daily provisions' },
  { id: 'Dining & Nightlife', label: 'Dining & Food', icon: '🍔', color: 'text-orange-400 bg-orange-500/10', border: 'border-orange-500/40', desc: 'Restaurants, cafes, bakeries, snacks & swiggy' },
  { id: 'Shopping & Discretionary', label: 'Shopping', icon: '🛍️', color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/40', desc: 'Clothing, retail goods, e-commerce & mall' },
  { id: 'Housing & Utilities', label: 'Housing & Utilities', icon: '🏠', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/40', desc: 'Electricity, water, rent, hardware & maintenance' },
  { id: 'Transport & Fuel', label: 'Transport & Fuel', icon: '⛽', color: 'text-cyan-400 bg-cyan-500/10', border: 'border-cyan-500/40', desc: 'Petrol, diesel, auto spares, cab & bike fuel' },
  { id: 'Healthcare', label: 'Healthcare', icon: '💊', color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/40', desc: 'Pharmacy, medical shop, clinic & lab tests' },
  { id: 'Education', label: 'Education', icon: '🎓', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/40', desc: 'College fees, school tuition, books & courses' },
  { id: 'Investments', label: 'Investments', icon: '📈', color: 'text-emerald-300 bg-emerald-500/10', border: 'border-emerald-500/40', desc: 'Mutual funds, SIP, stocks, Zerodha & Groww' },
  { id: 'Insurance', label: 'Insurance', icon: '🛡️', color: 'text-indigo-400 bg-indigo-500/10', border: 'border-indigo-500/40', desc: 'Life insurance, health cover, vehicle premium' },
  { id: 'Loan & EMI', label: 'Loan & EMI', icon: '💳', color: 'text-violet-400 bg-violet-500/10', border: 'border-violet-500/40', desc: 'Credit card bill, personal loan, home loan EMI' },
  { id: 'Travel', label: 'Travel', icon: '✈️', color: 'text-sky-400 bg-sky-500/10', border: 'border-sky-500/40', desc: 'Train IRCTC, flights, buses, hotel booking' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎟️', color: 'text-pink-400 bg-pink-500/10', border: 'border-pink-500/40', desc: 'Movies BookMyShow, gaming, shows & cinema' },
  { id: 'Electronics', label: 'Electronics', icon: '💻', color: 'text-teal-400 bg-teal-500/10', border: 'border-teal-500/40', desc: 'Gadgets, laptop, mobile store, appliances' },
  { id: 'Personal Care', label: 'Personal Care', icon: '💄', color: 'text-fuchsia-400 bg-fuchsia-500/10', border: 'border-fuchsia-500/40', desc: 'Salon, spa, beauty, haircut & grooming' },
  { id: 'Subscriptions & Digital', label: 'Subscriptions', icon: '📱', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/40', desc: 'OTT, Netflix, Spotify, mobile recharge & cloud' },
  { id: 'Internal Transfer', label: 'Self Transfer', icon: '🏦', color: 'text-slate-300 bg-slate-500/10', border: 'border-slate-500/40', desc: 'Transfer between your own bank accounts' },
  { id: 'Reimbursement / Split', label: 'P2P / Family Split', icon: '🤝', color: 'text-teal-300 bg-teal-500/10', border: 'border-teal-500/40', desc: 'Friend reimbursement, bill split & family money' },
  { id: 'Other / Unknown', label: 'Other / Unknown', icon: '❓', color: 'text-slate-400 bg-slate-800', border: 'border-slate-700', desc: 'Unclassified entity pending category review' },
];

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onSave,
  onDelete,
}: EditTransactionModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Groceries');
  const [accountType, setAccountType] = useState<'Merchant / Business' | 'Personal'>('Merchant / Business');
  const [customNote, setCustomNote] = useState('');
  const [rememberForFuture, setRememberForFuture] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || transaction.payeeName || '');
      setCategory((transaction.category as Category) || 'Shopping & Discretionary');
      setAccountType(transaction.accountType || (transaction.isInternalTransfer ? 'Personal' : 'Merchant / Business'));
      setCustomNote(transaction.remark || transaction.theme || '');
      setRememberForFuture(true);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const isUnclassified = transaction.isAmbiguous || transaction.needsReview || transaction.category === 'Other / Unknown';
  const isP2P = accountType === 'Personal' || transaction.category === 'Reimbursement / Split' || transaction.category === 'Internal Transfer';
  const isInflow = transaction.amount > 0;

  const handleSaveClick = async () => {
    try {
      setIsSaving(true);
      const newTheme = customNote.trim() || getCategoryThemeLabel(category);
      const newIcon = getCategoryIcon(category);

      await onSave({
        id: transaction.id,
        title: title.trim() || transaction.title,
        category,
        accountType,
        theme: newTheme,
        themeIcon: newIcon,
        remark: customNote.trim(),
        rememberForFuture,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    if (window.confirm('Are you sure you want to remove this transaction from your ledger?')) {
      try {
        setIsDeleting(true);
        await onDelete(transaction.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-[32px] bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden animate-slideRight">
        
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isUnclassified 
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                : isP2P
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>
              {isUnclassified ? <AlertTriangle className="w-5 h-5" /> : isP2P ? <User className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Edit Transaction Data
              </h3>
              <p className="text-[11px] text-slate-400">
                {isUnclassified 
                  ? 'Reclassify unestablished vendor or ambiguous entity' 
                  : isP2P 
                  ? 'Manage personal peer-to-peer or family transfer' 
                  : 'Update classified merchant details & category'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin">
          
          {/* Transaction Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                isInflow ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {isInflow ? <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /> : <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />}
              </div>
              <div>
                <span className={`text-sm font-extrabold ${isInflow ? 'text-emerald-400' : 'text-white'}`}>
                  {isInflow ? '+₹' : '-₹'}{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{transaction.rawTimeText || transaction.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Current Classification Badge */}
            <div className="text-right">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block ${
                isUnclassified
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isP2P
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {isUnclassified ? '⚠️ Unclassified Entity' : isP2P ? '👤 Personal P2P' : '🏬 Classified Merchant'}
              </span>
              {transaction.upiRrn && (
                <span className="block text-[9px] font-mono text-slate-500 mt-1">
                  RRN: {transaction.upiRrn}
                </span>
              )}
            </div>
          </div>

          {/* Field 1: Entity Name / Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Entity / Merchant / Contact Name</span>
              <span className="text-[10px] text-slate-400 font-normal">Displayed in ledger</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sri Balaji Kirana Store, Rahul Verma..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 font-medium"
            />
          </div>

          {/* Field 2: Account Type Selector (Merchant vs Personal P2P) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Account / Entity Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAccountType('Merchant / Business');
                  if (category === 'Reimbursement / Split' || category === 'Internal Transfer') {
                    setCategory('Shopping & Discretionary');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer text-xs ${
                  accountType === 'Merchant / Business'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/40'
                    : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Merchant / Business</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('Personal');
                  if (category !== 'Internal Transfer') {
                    setCategory('Reimbursement / Split');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer text-xs ${
                  accountType === 'Personal'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40'
                    : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal (P2P / Self)</span>
              </button>
            </div>
          </div>

          {/* Field 3: Category Selection Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Financial Category</span>
              <span className="text-[10px] text-orange-400 font-semibold">{category}</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto p-1 bg-slate-950/40 rounded-2xl border border-slate-800/80 scrollbar-thin">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === 'Internal Transfer' || cat.id === 'Reimbursement / Split') {
                        setAccountType('Personal');
                      }
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold shadow-xs'
                        : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <span className="text-[11px] truncate flex-1">{cat.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-orange-400 shrink-0 stroke-[3]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field 4: Custom Note / Purpose */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Transaction Note / Theme</span>
              <span className="text-[10px] text-slate-500 font-mono">Optional</span>
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Groceries & Kirana Store, Dinner split, Office monitor..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          {/* Field 5: Remember for future */}
          <div 
            onClick={() => setRememberForFuture(prev => !prev)}
            className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Remember rule for future transactions
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Automatically categorize &ldquo;{title || transaction.title}&rdquo; as {category}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={rememberForFuture}
              onChange={() => {}}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 bg-slate-900 border-slate-700"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 shrink-0 flex items-center justify-between gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting || isSaving}
              className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Delete transaction from ledger"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save & Update'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
