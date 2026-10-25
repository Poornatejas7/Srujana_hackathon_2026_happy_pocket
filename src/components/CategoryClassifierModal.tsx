'use client';

import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Store, 
  ShoppingCart, 
  Home, 
  Utensils, 
  Fuel, 
  HeartPulse, 
  Tv, 
  Users, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Category } from '@/types/finance';

interface CategoryClassifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
  currentCategory?: string;
  transactionId?: string;
  onSaveCategory: (newCategory: Category, rememberForFuture: boolean) => void;
}

interface CategoryOption {
  id: Category;
  label: string;
  theme: string;
  icon: string;
  description: string;
  lucideIcon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'Groceries',
    label: 'Groceries & Kirana Store',
    theme: 'Groceries & Daily Essentials',
    icon: '🥦',
    description: 'Daily provisions, vegetables, fruits, dairy, supermarket & kirana',
    lucideIcon: ShoppingCart,
    color: 'text-emerald-400 bg-emerald-500/10',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500',
  },
  {
    id: 'Housing & Utilities',
    label: 'Hardware & Home Supplies',
    theme: 'Hardware, Electricals & Utilities',
    icon: '🏠',
    description: 'Hardware, sanitary, electricals, paints, plumbing, utilities',
    lucideIcon: Home,
    color: 'text-amber-400 bg-amber-500/10',
    borderColor: 'border-amber-500/30 hover:border-amber-500',
  },
  {
    id: 'Shopping & Discretionary',
    label: 'Retail Shopping & Goods',
    theme: 'General Merchandise & Retail',
    icon: '🛍️',
    description: 'General store, clothing, footwear, stationery, gifts & gadgets',
    lucideIcon: Store,
    color: 'text-purple-400 bg-purple-500/10',
    borderColor: 'border-purple-500/30 hover:border-purple-500',
  },
  {
    id: 'Dining & Nightlife',
    label: 'Food, Dining & Sweets',
    theme: 'Food, Snacks & Dining',
    icon: '🍔',
    description: 'Restaurants, sweet shops, bakeries, cafes, chai & quick snacks',
    lucideIcon: Utensils,
    color: 'text-orange-400 bg-orange-500/10',
    borderColor: 'border-orange-500/30 hover:border-orange-500',
  },
  {
    id: 'Transport & Fuel',
    label: 'Transport, Spares & Fuel',
    theme: 'Fuel, Auto Spares & Commute',
    icon: '⛽',
    description: 'Petrol pumps, vehicle spare parts, puncture repair, mechanic, cab',
    lucideIcon: Fuel,
    color: 'text-cyan-400 bg-cyan-500/10',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500',
  },
  {
    id: 'Healthcare',
    label: 'Pharmacy & Healthcare',
    theme: 'Medicines & Medical Supplies',
    icon: '💊',
    description: 'Local chemist, pharmacy, medical clinic, lab tests & medicines',
    lucideIcon: HeartPulse,
    color: 'text-rose-400 bg-rose-500/10',
    borderColor: 'border-rose-500/30 hover:border-rose-500',
  },
  {
    id: 'Subscriptions & Digital',
    label: 'Digital, Utility & Bills',
    theme: 'Mobile, Cable & Subscriptions',
    icon: '📱',
    description: 'Mobile recharge, cable, broadband internet, digital services',
    lucideIcon: Tv,
    color: 'text-blue-400 bg-blue-500/10',
    borderColor: 'border-blue-500/30 hover:border-blue-500',
  },
  {
    id: 'Reimbursement / Split',
    label: 'Personal Peer / Family',
    theme: 'Personal Contact Transfer',
    icon: '🤝',
    description: 'P2P friend, colleague reimbursement, bill split or family support',
    lucideIcon: Users,
    color: 'text-teal-400 bg-teal-500/10',
    borderColor: 'border-teal-500/30 hover:border-teal-500',
  },
];

export default function CategoryClassifierModal({
  isOpen,
  onClose,
  merchantName,
  currentCategory,
  onSaveCategory,
}: CategoryClassifierModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    (currentCategory as Category) || 'Groceries'
  );
  const [rememberForFuture, setRememberForFuture] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveCategory(selectedCategory, rememberForFuture);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-[32px] bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden animate-slideRight">
        
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Classify Merchant
              </h3>
              <p className="text-xs text-slate-400">
                Help Happy Pocket categorize this store
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
          
          {/* Ambiguity Alert Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-white">
                  Ambiguous Merchant: &ldquo;{merchantName}&rdquo;
                </p>
                <p className="text-[11px] text-amber-300/90 mt-1 leading-relaxed">
                  Stores with generic business names like <em>Traders</em> or <em>Enterprises</em> can sell groceries, hardware, or general goods. Select the exact category below to keep your living expense velocity accurate.
                </p>
              </div>
            </div>
          </div>

          {/* Category Selection List */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Select Spending Category:
            </label>

            <div className="space-y-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.lucideIcon;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500 ring-1 ring-orange-500/50 shadow-md'
                        : `bg-slate-800/60 ${cat.borderColor}`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${cat.color}`}>
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? 'bg-orange-500 border-orange-400 text-white' 
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remember For Future Checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between cursor-pointer"
            onClick={() => setRememberForFuture((prev) => !prev)}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Remember for future transactions
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Auto-classify &quot;{merchantName}&quot; as {selectedCategory} every time
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Update Ledger</span>
          </button>
        </div>

      </div>
    </div>
  );
}
