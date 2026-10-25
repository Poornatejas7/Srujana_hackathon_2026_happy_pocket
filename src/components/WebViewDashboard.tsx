'use client';

import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  RefreshCw, 
  Search, 
  Send, 
  QrCode, 
  Upload, 
  Tag, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Store, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  SlidersHorizontal,
  Flame,
  PieChart,
  Film,
  Zap,
  Play,
  Layers,
  Sparkles,
  CreditCard,
  Building2,
  Lock,
  ChevronRight,
  Monitor,
  Smartphone
} from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';
import { DisplayTransaction } from '@/components/RecentTransactions';
import { NavTab } from '@/components/BottomNav';
import { RawTransaction, Category } from '@/types/finance';
import { UserRole } from '@/components/AccountSwitcherModal';
import { PRESET_MERCHANT_ACCOUNTS } from '@/lib/engine';
import ExpenseTrackerTab from '@/components/ExpenseTrackerTab';
import HistoryTab from '@/components/HistoryTab';
import InsightsTab from '@/components/InsightsTab';
import PaymentsTab from '@/components/PaymentsTab';
import ProfileTab from '@/components/ProfileTab';

export interface WebViewDashboardProps {
  transactions: DisplayTransaction[];
  rawTransactions: RawTransaction[];
  balance: number;
  primaryAccount: any;
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onScanClick: () => void;
  onSendClick: () => void;
  onUploadClick: () => void;
  onAaClick: () => void;
  onRefresh: () => void;
  isDbLoading: boolean;
  dbCount: number;
  onEditTransaction?: (tx: DisplayTransaction) => void;
  onClassifyMerchant?: (merchantName: string, currentCategory?: string) => void;
  currentUserRole: UserRole;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onClearData: () => void;
  onQuickSimulatePay?: (merchant: any) => void;
}

export default function WebViewDashboard({
  transactions,
  rawTransactions,
  balance,
  primaryAccount,
  activeTab,
  onChangeTab,
  onScanClick,
  onSendClick,
  onUploadClick,
  onAaClick,
  onRefresh,
  isDbLoading,
  dbCount,
  onEditTransaction,
  onClassifyMerchant,
  currentUserRole,
  onSwitchAccount,
  onLogout,
  onClearData,
  onQuickSimulatePay,
}: WebViewDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'merchants' | 'personal' | 'unclassified' | 'entertainment'>('all');

  // Calculate real metrics
  const {
    totalOutflow,
    livingExpenditure,
    unclassifiedCount,
    entertainmentSpend,
    essentialPercent,
    discretionaryPercent,
    categoryTotals,
    subscriptionsList
  } = useMemo(() => {
    let outflow = 0;
    let nonLiving = 0;
    let unclassified = 0;
    let entertainment = 0;
    let essential = 0;
    let discretionary = 0;
    const catMap: Record<string, { amount: number; count: number; icon: string }> = {};

    transactions.forEach(t => {
      if (t.amount < 0) {
        const abs = Math.abs(t.amount);
        outflow += abs;

        const isSelf = t.category === 'Internal Transfer' || t.title.toLowerCase().includes('own') || t.title.toLowerCase().includes('canara');
        const isPersonal = t.accountType === 'Personal' && !isSelf;
        if (isSelf || isPersonal) {
          nonLiving += abs;
        }

        const cat = t.category || 'Other / Unknown';
        if (cat === 'Other / Unknown' || t.isAmbiguous || t.needsReview) {
          unclassified += 1;
        }

        if (cat === 'Entertainment' || t.theme?.toLowerCase().includes('streaming') || t.theme?.toLowerCase().includes('netflix') || t.theme?.toLowerCase().includes('prime')) {
          entertainment += abs;
        }

        const isEssential = ['Groceries', 'Housing & Utilities', 'Transport & Fuel', 'Healthcare', 'Education'].includes(cat);
        if (isEssential) essential += abs;
        else discretionary += abs;

        if (!catMap[cat]) {
          catMap[cat] = { amount: 0, count: 0, icon: t.themeIcon || '🛍️' };
        }
        catMap[cat].amount += abs;
        catMap[cat].count += 1;
      }
    });

    const living = Math.max(0, outflow - nonLiving);
    const sum = (essential + discretionary) || 1;
    const essPct = Math.round((essential / sum) * 100);
    const discPct = 100 - essPct;

    const subs = transactions.filter(t => 
      t.isRecurringAutoPay || 
      /NETFLIX|PRIME|SPOTIFY|HOTSTAR|YOUTUBE|GOOGLE PLAY|GODADDY/i.test(t.title + ' ' + (t.rawDescription || ''))
    );

    return {
      totalOutflow: outflow,
      livingExpenditure: living,
      unclassifiedCount: unclassified,
      entertainmentSpend: entertainment,
      essentialPercent: essPct,
      discretionaryPercent: discPct,
      categoryTotals: Object.entries(catMap).map(([category, data]) => ({
        category,
        ...data,
      })).sort((a, b) => b.amount - a.amount),
      subscriptionsList: subs,
    };
  }, [transactions]);

  // Filtered transactions for the ledger view
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        const matchTheme = t.theme?.toLowerCase().includes(q);
        const matchRemark = (t as any).remark?.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchTheme && !matchRemark) return false;
      }

      if (filterType === 'merchants') return t.accountType === 'Merchant / Business';
      if (filterType === 'personal') return t.accountType === 'Personal';
      if (filterType === 'unclassified') return t.category === 'Other / Unknown' || t.isAmbiguous || t.needsReview;
      if (filterType === 'entertainment') return t.category === 'Entertainment' || t.theme?.toLowerCase().includes('streaming');
      return true;
    });
  }, [transactions, searchQuery, filterType]);

  return (
    <div className="w-full min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      
      {/* ======================================================== */}
      {/* 1. TOP WEB NAVIGATION BAR */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-700/60 px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity & Active Navigation */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => onChangeTab('home')}
              className="flex items-center gap-3 cursor-pointer group"
              title="Happy Pocket Home"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <HappyPocketLogo size={28} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-white tracking-tight">
                    Happy Pocket
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    FinLens Web
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Smart UPI Banking &amp; Financial Visibility
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
              {[
                { id: 'home', label: 'Dashboard', icon: '🏠' },
                { id: 'expense', label: 'Expenses & Velocity', icon: '📊' },
                { id: 'history', label: 'History Ledger', icon: '📜' },
                { id: 'insights', label: 'AI Advisor', icon: '💡' },
                { id: 'payments', label: 'UPI Bill Pay', icon: '⚡' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Core Banking Balance Badge & Primary Actions */}
          <div className="flex items-center gap-3">
            {/* Live Core Banking Balance Card Pill */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/70 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                  SBI / HDFC Core Balance
                </span>
                <span className="text-sm font-extrabold text-white font-sans tracking-tight">
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={onRefresh}
                title="Sync from MongoDB Atlas"
                className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer ml-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onScanClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan &amp; Pay</span>
              </button>

              <button
                type="button"
                onClick={onSendClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs border border-slate-700 shadow-sm transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Send Money</span>
              </button>

              <button
                type="button"
                onClick={onAaClick}
                title="Live RBI Account Aggregator"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBI AA</span>
              </button>

              <button
                type="button"
                onClick={onSwitchAccount}
                title="Switch User Role (Personal, Medical Shop, College)"
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-orange-500/60 transition cursor-pointer text-xs"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-400 ring-1 ring-white/20">
                  <img src="/avatar.jpg" alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-slate-200 hidden md:inline capitalize">
                  {currentUserRole}
                </span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN WEB DASHBOARD CONTENT VIEWPORT */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* VIEW 1: HOME EXECUTIVE DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-6">

            {/* TOP 4 FINANCIAL INTELLIGENCE KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Core Banking Balance */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-600 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Bank Account (SBI/HDFC)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-white font-sans tracking-tight">
                    ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>A/C: •••• 7482</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-sans">Active &amp; Verified</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">NPCI UPI ID:</span>
                  <span className="font-mono text-cyan-300 font-semibold truncate max-w-[130px]">
                    poornatejas@okhdfcbank
                  </span>
                </div>
              </div>

              {/* Card 2: True Net Living Expenditure */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-600 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Net Living Outflow
                  </span>
                  <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs">
                    <Flame className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-white font-sans tracking-tight">
                    ₹{livingExpenditure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>Gross: ₹{totalOutflow.toLocaleString('en-IN')}</span>
                    <span>•</span>
                    <span className="text-orange-400 font-semibold">Excludes Transfers</span>
                  </div>
                </div>
                {/* Essential vs Discretionary Split Progress Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Essential: {essentialPercent}%</span>
                    <span>Discretionary: {discretionaryPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${essentialPercent}%` }} />
                    <div className="bg-orange-500 h-full" style={{ width: `${discretionaryPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Card 3: Entertainment & Subscriptions (Netflix, Prime, Spotify) */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-600 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Entertainment &amp; OTT
                  </span>
                  <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
                    <Film className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-white font-sans tracking-tight">
                    ₹{entertainmentSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-purple-300 mt-1 font-medium">
                    <span>🎬 Netflix, Prime, Spotify, Cinema</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Detected Subscriptions:</span>
                  <span className="font-bold text-purple-300">
                    {subscriptionsList.length} services
                  </span>
                </div>
              </div>

              {/* Card 4: Unclassified Entities & Classification Status */}
              <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border rounded-2xl p-4 shadow-sm relative overflow-hidden group transition ${
                unclassifiedCount > 0 ? 'border-amber-500/60 shadow-amber-950/20' : 'border-slate-700/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Entity Classification
                  </span>
                  <span className={`p-1.5 rounded-lg text-xs ${
                    unclassifiedCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {unclassifiedCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-white font-sans tracking-tight">
                    {unclassifiedCount > 0 ? `${unclassifiedCount} Unclassified` : '100% Classified'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {unclassifiedCount > 0 ? 'Review generic stores or peers' : 'All transactions mapped to categories'}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Action:</span>
                  {unclassifiedCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setFilterType('unclassified')}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Filter &amp; Classify →
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold">Ledger Clean</span>
                  )}
                </div>
              </div>

            </div>

            {/* TWO-COLUMN EXECUTIVE DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT 7/12: REAL-TIME LEDGER WITH INSTANT EDIT BUTTONS */}
              <div className="lg:col-span-8 bg-[#1E293B] border border-slate-700/80 rounded-3xl p-5 shadow-sm space-y-4">
                
                {/* Header & Filter Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                      <span>Live Transactions Ledger</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {filteredTransactions.length} of {transactions.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click any transaction or tap &quot;Edit&quot; to change payee, category, or account type
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search payee, remark, theme..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: `All (${transactions.length})` },
                    { id: 'entertainment', label: `🎬 Entertainment & Subscriptions` },
                    { id: 'merchants', label: '🏬 Merchants & Stores' },
                    { id: 'personal', label: '👤 Personal P2P' },
                    { id: 'unclassified', label: `⚠️ Unclassified (${unclassifiedCount})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterType(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-[11px] ${
                        filterType === f.id
                          ? 'bg-orange-500 text-white shadow-xs'
                          : f.id === 'unclassified' && unclassifiedCount > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Transactions Table / Card Rows */}
                <div className="space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
                      <p className="text-sm">No transactions match your current search / filter.</p>
                      <button
                        type="button"
                        onClick={onScanClick}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow transition cursor-pointer"
                      >
                        + Create a Test Transaction
                      </button>
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isDebit = tx.amount < 0;
                      const isUnclassified = tx.category === 'Other / Unknown' || tx.isAmbiguous || tx.needsReview;
                      const isPersonal = tx.accountType === 'Personal';

                      return (
                        <div
                          key={tx.id}
                          onClick={() => onEditTransaction?.(tx)}
                          className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 hover:border-slate-500/80 hover:bg-slate-800/60 transition flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          {/* Left: Avatar Icon & Payee details */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                              {tx.themeIcon || (isPersonal ? '👤' : '🏪')}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-orange-400 transition">
                                  {tx.title}
                                </h4>
                                
                                {/* Account Type badge */}
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0 ${
                                  isPersonal 
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}>
                                  {isPersonal ? 'Personal' : 'Merchant'}
                                </span>

                                {/* Category Chip */}
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                  {tx.category || 'Other / Unknown'}
                                </span>

                                {/* Ambiguity badge */}
                                {isUnclassified && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                    ⚠️ Needs Review
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono flex-wrap">
                                <span>{tx.rawTimeText || 'Recent'}</span>
                                {tx.upiRrn && <span>• Ref: {tx.upiRrn}</span>}
                                {tx.theme && (
                                  <span className="text-slate-400 font-sans truncate max-w-[200px]">
                                    • {tx.theme}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Dedicated Edit Button */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className={`text-sm sm:text-base font-extrabold font-sans block ${
                                isDebit ? 'text-white' : 'text-emerald-400'
                              }`}>
                                {isDebit ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {isDebit ? 'Debited via UPI' : 'Credited'}
                              </span>
                            </div>

                            {/* DEDICATED EDIT BUTTON BASED ON CLASSIFICATION */}
                            {isUnclassified ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTransaction?.(tx);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                                title="Classify Unclassified Transaction"
                              >
                                <span>⚠️ Classify</span>
                              </button>
                            ) : isPersonal ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTransaction?.(tx);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                                title="Edit P2P Transaction"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit P2P</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTransaction?.(tx);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                                title="Edit Classified Transaction"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* RIGHT 5/12: FAST TEST SIMULATOR & CATEGORY BREAKDOWN */}
              <div className="lg:col-span-4 space-y-6">

                {/* 1-Click Test Merchant Simulator */}
                <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Instant 1-Click Pay Simulator</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Live Atlas Settlement</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test how Happy Pocket automatically classifies entertainment, subscriptions, groceries, and dining:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {PRESET_MERCHANT_ACCOUNTS.slice(0, 6).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (onQuickSimulatePay) {
                            onQuickSimulatePay(preset);
                          } else {
                            onScanClick();
                          }
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/80 hover:border-orange-500/60 hover:bg-slate-800/80 transition text-left space-y-1 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{preset.themeIcon}</span>
                          <span className="text-xs font-black text-white font-sans">
                            ₹{preset.defaultAmount}
                          </span>
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-200 truncate group-hover:text-orange-400">
                          {preset.name}
                        </h5>
                        <p className="text-[9px] text-slate-400 truncate">
                          {preset.category}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spending by Category Breakdown */}
                <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-cyan-400" />
                      <span>Category Distribution</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => onChangeTab('expense')}
                      className="text-xs text-orange-400 hover:underline font-bold cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {categoryTotals.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No category data yet.</p>
                    ) : (
                      categoryTotals.slice(0, 5).map((cat) => {
                        const pct = totalOutflow > 0 ? Math.round((cat.amount / totalOutflow) * 100) : 0;
                        return (
                          <div key={cat.category} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <span>{cat.icon}</span>
                                <span className="truncate max-w-[140px]">{cat.category}</span>
                              </span>
                              <span className="font-extrabold text-white font-sans">
                                ₹{cat.amount.toLocaleString('en-IN')} <span className="text-slate-400 text-[10px] font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(4, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Live RBI Account Aggregator Status Banner */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 space-y-2 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-extrabold">RBI Account Aggregator (ReBIT)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold">
                      Verified FIP
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    Consent-driven synchronization with HDFC, SBI, ICICI, and Axis core banking servers.
                  </p>
                  <button
                    type="button"
                    onClick={onAaClick}
                    className="w-full mt-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Bank Consent</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: EXPENSE TRACKER & VELOCITY */}
        {activeTab === 'expense' && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-sm">
            <ExpenseTrackerTab
              transactions={transactions}
              rawTransactions={rawTransactions}
              onNavigateToAdvisor={() => onChangeTab('insights')}
              onClassifyMerchant={onClassifyMerchant}
              onEditTransaction={onEditTransaction}
            />
          </div>
        )}

        {/* VIEW 3: HISTORY LEDGER */}
        {activeTab === 'history' && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-sm">
            <HistoryTab
              transactions={transactions}
              onOpenUpload={onUploadClick}
              onOpenAccountAggregator={onAaClick}
              onClassifyMerchant={onClassifyMerchant}
              onEditTransaction={onEditTransaction}
            />
          </div>
        )}

        {/* VIEW 4: SMART INSIGHTS & AI WEALTH ADVISOR */}
        {activeTab === 'insights' && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-sm">
            <InsightsTab transactions={transactions} />
          </div>
        )}

        {/* VIEW 5: UPI BILL PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-sm max-w-3xl mx-auto">
            <PaymentsTab
              onScanClick={onScanClick}
              onSendClick={onSendClick}
            />
          </div>
        )}

        {/* VIEW 6: ACCOUNT PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-sm max-w-3xl mx-auto">
            <ProfileTab
              onShowQR={onScanClick}
              onLogout={onLogout}
              onClearData={onClearData}
            />
          </div>
        )}

      </main>

    </div>
  );
}
