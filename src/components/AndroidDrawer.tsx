'use client';

import React from 'react';
import { 
  X, 
  Home, 
  BarChart3, 
  History, 
  QrCode, 
  Send, 
  Lightbulb, 
  FileUp, 
  CreditCard, 
  User, 
  LogOut, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Receipt,
  Landmark,
  Users
} from 'lucide-react';
import { NavTab } from './BottomNav';

interface AndroidDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenScanPay: () => void;
  onOpenSendMoney: () => void;
  onOpenUploadStatement: () => void;
  onOpenAccountAggregator?: () => void;
  onOpenAccountSwitcher?: () => void;
  onOpenMyQr: () => void;
  onRefreshData: () => void;
  onLogout: () => void;
  balance: number;
}

interface MenuItem {
  id: string;
  label: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
  isActive?: boolean;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AndroidDrawer({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenScanPay,
  onOpenSendMoney,
  onOpenUploadStatement,
  onOpenAccountAggregator,
  onOpenAccountSwitcher,
  onOpenMyQr,
  onRefreshData,
  onLogout,
  balance,
}: AndroidDrawerProps) {
  if (!isOpen) return null;

  const menuSections: MenuSection[] = [
    {
      title: 'CORE MODULES',
      items: [
        {
          id: 'home',
          label: 'Home Dashboard',
          subtext: 'Account Balance & Quick Ledger',
          icon: Home,
          color: 'text-orange-500 bg-orange-50 border-orange-200',
          action: () => {
            onSelectTab('home');
            onClose();
          },
          isActive: activeTab === 'home',
        },
        {
          id: 'expense',
          label: 'Expense Tracker & Velocity',
          subtext: 'Particular Transfer Amounts & Anti-Distortion',
          icon: BarChart3,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          action: () => {
            onSelectTab('expense');
            onClose();
          },
          isActive: activeTab === 'expense',
          badge: 'Live Data',
        },
        {
          id: 'history',
          label: 'Transactions Ledger',
          subtext: 'Full Searchable Database & Filters',
          icon: History,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          action: () => {
            onSelectTab('history');
            onClose();
          },
          isActive: activeTab === 'history',
        },
        {
          id: 'insights',
          label: 'Financial Insights & Savings',
          subtext: 'AutoPay, Discretionary Spend & Investment Sandbox',
          icon: Lightbulb,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          action: () => {
            onSelectTab('insights');
            onClose();
          },
          isActive: activeTab === 'insights',
          badge: 'Smart Insights',
        },
        {
          id: 'payments',
          label: 'UPI Bill Payments',
          subtext: 'Recharges, Utilities & Subscriptions',
          icon: CreditCard,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          action: () => {
            onSelectTab('payments');
            onClose();
          },
          isActive: activeTab === 'payments',
        },
      ],
    },
    {
      title: 'PAYMENT ACTIONS',
      items: [
        {
          id: 'scan_pay',
          label: 'Scan & Pay UPI QR',
          subtext: 'Real-time Camera & Instant Atlas Sync',
          icon: QrCode,
          color: 'text-orange-500 bg-orange-50 border-orange-200',
          action: () => {
            onClose();
            onOpenScanPay();
          },
        },
        {
          id: 'send_money',
          label: 'Send Money (P2P)',
          subtext: 'Transfers to Friends & Saved Contacts',
          icon: Send,
          color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
          action: () => {
            onClose();
            onOpenSendMoney();
          },
        },
        {
          id: 'my_qr',
          label: 'My Bharat QR Code',
          subtext: 'Receive UPI Payments Instantly',
          icon: QrCode,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          action: () => {
            onClose();
            onOpenMyQr();
          },
        },
        {
          id: 'upload_statement',
          label: 'Import Bank Statement',
          subtext: 'PDF Parser & AI Theme Ingestion',
          icon: FileUp,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          action: () => {
            onClose();
            onOpenUploadStatement();
          },
          badge: 'PDF / CSV',
        },
        {
          id: 'account_aggregator',
          label: 'Live RBI Account Aggregator',
          subtext: 'Direct OTP Consent & Bank Sync',
          icon: Landmark,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          action: () => {
            onClose();
            onOpenAccountAggregator?.();
          },
          badge: 'RBI Consent',
        },
      ],
    },
    {
      title: 'ACCOUNT & SYSTEM',
      items: [
        {
          id: 'switch_account',
          label: 'Switch Bank Account',
          subtext: 'Personal, Medical Shop & College',
          icon: Users,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          action: () => {
            onClose();
            onOpenAccountSwitcher?.();
          },
          badge: '3 Accounts',
        },
        {
          id: 'profile',
          label: 'My Profile & Security',
          subtext: 'UPI PIN, Limits & Biometrics',
          icon: User,
          color: 'text-slate-700 bg-slate-100 border-slate-200',
          action: () => {
            onSelectTab('profile');
            onClose();
          },
          isActive: activeTab === 'profile',
        },
        {
          id: 'refresh',
          label: 'Sync MongoDB Atlas',
          subtext: 'Refresh Live Transaction Ledger',
          icon: RefreshCw,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          action: () => {
            onRefreshData();
            onClose();
          },
        },
      ],
    },
  ];

  return (
    <div className="absolute inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel (Android Material 3 Navigation Drawer) */}
      <div className="relative w-[86%] sm:w-[320px] h-full bg-white text-slate-900 shadow-2xl flex flex-col z-10 animate-slideRight border-r border-slate-200/80">
        
        {/* Drawer Header (Account Banner) */}
        <div className="p-5 pt-8 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A172E] text-white shrink-0 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-500/10 blur-xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-lg pointer-events-none" />

          {/* Top row with Close button */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-extrabold tracking-widest uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
              Happy Pocket • Android App
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-400 shadow-md shrink-0 bg-amber-100 flex items-center justify-center">
              <img
                src="/avatar.jpg"
                alt="Kotresh C"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white tracking-tight truncate">
                  Kotresh C
                </h3>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-300 font-mono truncate">
                tejas@okhdfcbank
              </p>
            </div>
          </div>

          {/* Quick Balance Chip */}
          <div className="mt-4 p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs relative z-10">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Available Balance</span>
              <span className="font-extrabold font-mono text-white text-sm">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              SBI • 5274
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs scrollbar-thin">
          {menuSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition cursor-pointer text-left group ${
                      item.isActive
                        ? 'bg-orange-50 text-orange-950 font-bold shadow-xs border border-orange-200'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs truncate ${item.isActive ? 'font-extrabold text-orange-600' : 'font-semibold text-slate-800'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate font-normal">
                        {item.subtext}
                      </span>
                    </div>

                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${item.isActive ? 'text-orange-500' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-slate-500">
              Atlas DB Active
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
