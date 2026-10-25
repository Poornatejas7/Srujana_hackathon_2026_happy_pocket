'use client';

import React from 'react';
import { X, Check, ShieldCheck, LogOut, Landmark, User } from 'lucide-react';

export type UserRole = 'personal' | 'medical' | 'college';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onLogout: () => void;
  personalBalance?: number;
}

export default function AccountSwitcherModal({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  onLogout,
  personalBalance = 10000.00,
}: AccountSwitcherModalProps) {
  if (!isOpen) return null;

  const accounts = [
    {
      role: 'personal' as UserRole,
      title: 'Kotresh C (Personal)',
      type: 'Personal UPI Banking',
      bank: 'HDFC Bank •••• 7482',
      upi: 'poornatejas@okhdfcbank',
      icon: '👤',
      badge: 'Savings A/C',
      color: 'border-orange-500 bg-orange-50/50',
      activeColor: 'bg-orange-500 text-white',
    },
    {
      role: 'medical' as UserRole,
      title: 'City Care Medicals & Pharmacy',
      type: 'Merchant (Medical Shop)',
      bank: 'HDFC Bank •••• 9283',
      upi: 'citycaremedicals@okhdfcbank',
      icon: '💊',
      badge: 'Merchant QR',
      color: 'border-emerald-500 bg-emerald-50/50',
      activeColor: 'bg-emerald-600 text-white',
    },
    {
      role: 'college' as UserRole,
      title: "St. Xavier Engineering College",
      type: 'Merchant (Education College)',
      bank: 'State Bank of India •••• 1928',
      upi: 'xaviercollege@sbi',
      icon: '🎓',
      badge: 'Merchant QR',
      color: 'border-indigo-500 bg-indigo-50/50',
      activeColor: 'bg-indigo-600 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white text-slate-900 p-5 shadow-2xl overflow-hidden border border-slate-100 animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Switch Bank Account</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-[11px] text-slate-400">Select active banking or merchant profile</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Cards List */}
        <div className="mt-4 space-y-2.5">
          {accounts.map((acc) => {
            const isSelected = currentRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => {
                  onSelectRole(acc.role);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isSelected 
                    ? `${acc.color} shadow-sm border-2` 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-xl shrink-0">
                    {acc.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900">{acc.title}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {acc.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{acc.bank}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{acc.upi}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isSelected ? (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${acc.activeColor}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sign out button */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out to Login Screen</span>
          </button>
        </div>

      </div>
    </div>
  );
}
