'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  Receipt,
  LogOut
} from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';
import AccountCard from '@/components/AccountCard';
import ActionButtons from '@/components/ActionButtons';
import RecentTransactions, { 
  DisplayTransaction, 
  DEFAULT_RECENT_TRANSACTIONS 
} from '@/components/RecentTransactions';
import BottomNav, { NavTab } from '@/components/BottomNav';
import ScanPayModal from '@/components/ScanPayModal';
import SendMoneyModal from '@/components/SendMoneyModal';
import PaymentsTab from '@/components/PaymentsTab';
import HistoryTab from '@/components/HistoryTab';
import ProfileTab from '@/components/ProfileTab';
import ExpenseTrackerTab from '@/components/ExpenseTrackerTab';
import InsightsTab from '@/components/InsightsTab';
import AuthScreen from '@/components/AuthScreen';
import StatementUploadModal from '@/components/StatementUploadModal';
import MyQrModal from '@/components/MyQrModal';

export default function HappyPocketApp() {
  const [balance, setBalance] = useState<number>(14524.91);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>(DEFAULT_RECENT_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [desktopMode, setDesktopMode] = useState<'phone' | 'wide'>('phone');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Modals state
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoginSuccess = (accountNum?: string) => {
    setIsLoggedIn(true);
    showToast(`Welcome! Logged in as ${accountNum || 'Account User'}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
    showToast('Logged out successfully');
  };

  // Handle successful payments
  const handlePaymentSuccess = (amount: number, merchant: string) => {
    setBalance((prev) => Math.max(0, prev - amount));
    const newTx: DisplayTransaction = {
      id: `tx_${Date.now()}`,
      title: merchant,
      rawTimeText: 'Just now',
      timestamp: new Date().toISOString(),
      amount: -amount,
      type: 'other',
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Paid ₹${amount.toLocaleString('en-IN')} to ${merchant}`);
  };

  // Handle successful money transfers
  const handleSendSuccess = (amount: number, recipient: string) => {
    setBalance((prev) => Math.max(0, prev - amount));
    const newTx: DisplayTransaction = {
      id: `tx_${Date.now()}`,
      title: `Transfer to ${recipient}`,
      rawTimeText: 'Just now',
      timestamp: new Date().toISOString(),
      amount: -amount,
      type: 'transfer',
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Sent ₹${amount.toLocaleString('en-IN')} to ${recipient}`);
  };

  // Handle imported statement items
  const handleImportedTransactions = (imported: DisplayTransaction[]) => {
    setTransactions((prev) => [...imported, ...prev]);
    showToast(`Imported ${imported.length} statement records!`);
  };

  // Quick Action handlers
  const handleScanPay = () => setIsScanOpen(true);
  const handleSendMoney = () => setIsSendOpen(true);
  const handleTransactionsClick = () => setActiveTab('history');

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Desktop Helper / Mode Switcher Banner (Visible only on tablets & desktop >= 768px) */}
      <aside aria-label="Desktop Viewport Switcher" className="hidden md:flex items-center justify-between px-8 py-2.5 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <HappyPocketLogo size={28} />
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              Happy Pocket
            </span>
          </div>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-slate-500 font-medium">
            Next.js Responsive Banking App
          </span>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setDesktopMode('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              desktopMode === 'phone'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-500" />
            <span>Mobile Frame</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopMode('wide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              desktopMode === 'wide'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-orange-500" />
            <span>Responsive Dashboard</span>
          </button>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-xs cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Import Statement</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold transition shadow-xs cursor-pointer border border-slate-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleLoginSuccess('Quick Demo User')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold transition shadow-xs cursor-pointer"
            >
              <span>Instant Enter (Demo)</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-4">
        
        {/* ======================================================== */}
        {/* AUTH STATE: WHEN NOT LOGGED IN, SHOW LOGIN & REGISTER */}
        {/* ======================================================== */}
        {!isLoggedIn ? (
          <div className="w-full flex flex-col items-center gap-8 py-4">
            {/* Screen 1: Welcome Back (Interactive Login Screen) */}
            <div className="w-full max-w-[380px] sm:max-w-[390px] mx-auto transition-all duration-300">
              <div className="w-full bg-[#EEF2F6] md:rounded-[48px] md:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:border-[10px] md:border-white overflow-hidden">
                <AuthScreen onLoginSuccess={handleLoginSuccess} initialMode="login" />
              </div>
            </div>

            {/* Section Divider downwards */}
            <div className="flex items-center gap-3 w-full max-w-[390px] px-2">
              <div className="h-px bg-slate-300 flex-1" />
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest bg-white/90 px-3.5 py-1 rounded-full border border-slate-200 shadow-xs">
                Extra Page Downwards • Create Account (Register)
              </span>
              <div className="h-px bg-slate-300 flex-1" />
            </div>

            {/* Screen 2: Create Account (Register Screen Preview) */}
            <div className="w-full max-w-[380px] sm:max-w-[390px] mx-auto transition-all duration-300">
              <div className="w-full bg-[#EEF2F6] md:rounded-[48px] md:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:border-[10px] md:border-white overflow-hidden">
                <AuthScreen onLoginSuccess={handleLoginSuccess} initialMode="register" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* VIEW 1: PHONE MOCKUP VIEW (Pixel-perfect replica of reference image) */}
            {/* ======================================================== */}
            {desktopMode === 'phone' && (
              <div className="w-full max-w-[380px] sm:max-w-[390px] mx-auto md:my-2 transition-all duration-300">
            {/* White smartphone bezel matching screenshot */}
            <div className="w-full bg-[#EEF2F6] md:rounded-[48px] md:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:border-[10px] md:border-white overflow-hidden">
              
              {/* Phone Inner Screen Container */}
              <div className="w-full bg-[#EEF2F6] flex flex-col justify-between overflow-hidden">
                
                {/* 1. Mobile Status Bar (9:41, Signal, Battery) */}
                <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none">
                  <span className="font-bold text-sm tracking-tight font-sans">9:41</span>
                  
                  {/* Status Bar Icons */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    {/* Cellular signal bars */}
                    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                      <rect x="0" y="7" width="2.8" height="4" rx="0.8" />
                      <rect x="4.5" y="4.5" width="2.8" height="6.5" rx="0.8" />
                      <rect x="9" y="2" width="2.8" height="9" rx="0.8" />
                      <rect x="13.5" y="0" width="2.8" height="11" rx="0.8" />
                    </svg>
                    {/* Wi-Fi Icon */}
                    <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
                    {/* Battery Icon */}
                    <div className="w-5 h-2.5 rounded-[4px] border-[1.5px] border-slate-800 p-0.5 flex items-center">
                      <div className="w-full h-full bg-slate-800 rounded-[1.5px]" />
                    </div>
                  </div>
                </div>

                {/* 2. App Header (Mascot, Title & User Avatar) */}
                <div className="px-5 pt-2 pb-2 flex items-center justify-between">
                  {/* Left: Mascot Character */}
                  <div 
                    className="flex items-center cursor-pointer active:scale-95 transition-transform" 
                    onClick={() => setActiveTab('home')}
                  >
                    <HappyPocketLogo size={50} />
                  </div>

                  {/* Center: Title when on Expense Tracker or Insights */}
                  {activeTab === 'expense' && (
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      Expense Tracker
                    </h2>
                  )}
                  {activeTab === 'insights' && (
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      Smart Insights
                    </h2>
                  )}

                  {/* Right: Circular User Avatar */}
                  <div 
                    onClick={() => setActiveTab('profile')}
                    className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-orange-400 transition bg-amber-100 flex items-center justify-center shrink-0"
                  >
                    <img
                      src="/avatar.jpg"
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 3. Screen Body Content */}
                <div className="px-4 py-1 space-y-3.5">
                  {activeTab === 'home' && (
                    <>
                      {/* Signature Account Card with Midnight Navy & Orange Wave */}
                      <AccountCard
                        accountName="Savings Account"
                        accountNumberMask="•••• 5274"
                        balance={balance}
                      />

                      {/* 3 Quick Action Buttons: Scan & Pay, Send Money, Transactions */}
                      <ActionButtons
                        onScanPayClick={handleScanPay}
                        onSendMoneyClick={handleSendMoney}
                        onTransactionsClick={handleTransactionsClick}
                      />

                      {/* Recent Transactions List (Grocery, Fuel, Salary) */}
                      <RecentTransactions
                        transactions={transactions.slice(0, 3)}
                        onTransactionClick={() => setActiveTab('history')}
                      />
                    </>
                  )}

                  {activeTab === 'expense' && (
                    <ExpenseTrackerTab />
                  )}

                  {activeTab === 'insights' && (
                    <InsightsTab />
                  )}

                  {activeTab === 'payments' && (
                    <PaymentsTab
                      onScanClick={handleScanPay}
                      onSendClick={handleSendMoney}
                    />
                  )}

                  {activeTab === 'history' && (
                    <HistoryTab
                      transactions={transactions}
                      onOpenUpload={() => setIsUploadOpen(true)}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileTab 
                      onShowQR={() => setIsQrOpen(true)} 
                      onLogout={handleLogout}
                    />
                  )}
                </div>

                {/* 4. Bottom Navigation Bar */}
                <div className="mt-3">
                  <BottomNav
                    activeTab={activeTab}
                    onChangeTab={(t) => setActiveTab(t)}
                  />
                </div>

              </div>
            </div>

            {/* ======================================================== */}
            {/* EXTRA PAGE DOWNWARDS: EXPENSE TRACKER (Exact Reference Page) */}
            {/* ======================================================== */}
            <div className="mt-10 pt-4 flex flex-col items-center">
              <div className="flex items-center gap-3 w-full px-2 mb-6">
                <div className="h-px bg-slate-300 flex-1" />
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest bg-white/90 px-3.5 py-1 rounded-full border border-slate-200 shadow-xs">
                  Extra Page Downwards • Expense Tracker
                </span>
                <div className="h-px bg-slate-300 flex-1" />
              </div>

              {/* White smartphone bezel matching screenshot */}
              <div className="w-full bg-[#EEF2F6] md:rounded-[48px] md:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:border-[10px] md:border-white overflow-hidden">
                <div className="w-full bg-[#EEF2F6] flex flex-col justify-between overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none">
                    <span className="font-bold text-sm tracking-tight font-sans">9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                        <rect x="0" y="7" width="2.8" height="4" rx="0.8" />
                        <rect x="4.5" y="4.5" width="2.8" height="6.5" rx="0.8" />
                        <rect x="9" y="2" width="2.8" height="9" rx="0.8" />
                        <rect x="13.5" y="0" width="2.8" height="11" rx="0.8" />
                      </svg>
                      <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
                      <div className="w-5 h-2.5 rounded-[4px] border-[1.5px] border-slate-800 p-0.5 flex items-center">
                        <div className="w-full h-full bg-slate-800 rounded-[1.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* Header: Mascot, Centered Title & Avatar */}
                  <div className="px-5 pt-2 pb-2 flex items-center justify-between">
                    <div 
                      className="flex items-center cursor-pointer active:scale-95 transition-transform"
                      onClick={() => setActiveTab('home')}
                    >
                      <HappyPocketLogo size={50} />
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      Expense Tracker
                    </h2>

                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-100 flex items-center justify-center shrink-0">
                      <img
                        src="/avatar.jpg"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Screen Body Content: Expense Tracker */}
                  <div className="px-4 py-1">
                    <ExpenseTrackerTab />
                  </div>

                  {/* Bottom Navigation with Expense Tracker active */}
                  <div className="mt-3">
                    <BottomNav
                      activeTab="expense"
                      onChangeTab={(t) => setActiveTab(t)}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* EXTRA PAGE DOWNWARDS: SMART INSIGHTS (Our Theme) */}
            {/* ======================================================== */}
            <div className="mt-10 pt-4 flex flex-col items-center">
              <div className="flex items-center gap-3 w-full px-2 mb-6">
                <div className="h-px bg-slate-300 flex-1" />
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest bg-white/90 px-3.5 py-1 rounded-full border border-slate-200 shadow-xs">
                  Extra Page Downwards • Smart Insights (Happy Pocket Theme)
                </span>
                <div className="h-px bg-slate-300 flex-1" />
              </div>

              {/* White smartphone bezel matching screenshot */}
              <div className="w-full bg-[#EEF2F6] md:rounded-[48px] md:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:border-[10px] md:border-white overflow-hidden">
                <div className="w-full bg-[#EEF2F6] flex flex-col justify-between overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none">
                    <span className="font-bold text-sm tracking-tight font-sans">9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                        <rect x="0" y="7" width="2.8" height="4" rx="0.8" />
                        <rect x="4.5" y="4.5" width="2.8" height="6.5" rx="0.8" />
                        <rect x="9" y="2" width="2.8" height="9" rx="0.8" />
                        <rect x="13.5" y="0" width="2.8" height="11" rx="0.8" />
                      </svg>
                      <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
                      <div className="w-5 h-2.5 rounded-[4px] border-[1.5px] border-slate-800 p-0.5 flex items-center">
                        <div className="w-full h-full bg-slate-800 rounded-[1.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* Header: Mascot, Centered Title & Avatar in Happy Pocket Theme */}
                  <div className="px-5 pt-2 pb-2 flex items-center justify-between">
                    <div 
                      className="flex items-center cursor-pointer active:scale-95 transition-transform"
                      onClick={() => setActiveTab('home')}
                    >
                      <HappyPocketLogo size={50} />
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      Smart Insights
                    </h2>

                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-100 flex items-center justify-center shrink-0">
                      <img
                        src="/avatar.jpg"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Screen Body Content: Insights in Happy Pocket Theme */}
                  <div className="px-4 py-1">
                    <InsightsTab />
                  </div>

                  {/* Bottom Navigation with Insights active */}
                  <div className="mt-2">
                    <BottomNav
                      activeTab="insights"
                      onChangeTab={(t) => setActiveTab(t)}
                    />
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: RESPONSIVE WIDE DASHBOARD VIEW (Desktop Optimized) */}
        {/* ======================================================== */}
        {desktopMode === 'wide' && (
          <div className="w-full max-w-6xl mx-auto space-y-6 transition-all duration-300 py-4 px-4 sm:px-6">
            
            {/* Top Brand Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-[32px] bg-white border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-4">
                <HappyPocketLogo size={64} />
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Happy Pocket
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Unified UPI Payments & Living Expense Visibility
                  </p>
                </div>
              </div>

              {/* User Profile Mini Card */}
              <div className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-xs">
                  <img
                    src="/avatar.jpg"
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Poornatejas</span>
                  <span className="text-[10px] text-slate-400 font-mono">tejas@okhdfcbank</span>
                </div>
              </div>
            </div>

            {/* Dashboard 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (5 Cols): Card + Quick Actions */}
              <div className="lg:col-span-5 space-y-6">
                {/* Account Card */}
                <AccountCard
                  accountName="Savings Account"
                  accountNumberMask="•••• 5274"
                  balance={balance}
                />

                {/* 3 Quick Action Buttons */}
                <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Quick Operations
                  </h4>
                  <ActionButtons
                    onScanPayClick={handleScanPay}
                    onSendMoneyClick={handleSendMoney}
                    onTransactionsClick={handleTransactionsClick}
                  />
                </div>

                {/* Financial Health Summary Widget */}
                <div className="rounded-[28px] bg-gradient-to-br from-slate-900 to-[#0A172E] p-6 text-white shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Noise Deductions
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Zero Distortion
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400 block">Self-Transfers</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        ₹15,000.00
                      </span>
                      <span className="text-[10px] text-emerald-400">Excluded from spend</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400 block">Refunds Paired</span>
                      <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">
                        ₹4,200.00
                      </span>
                      <span className="text-[10px] text-cyan-400">Net living balanced</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Ledger & Tab Content */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Tab Navigation Bar on Desktop */}
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
                  {[
                    { id: 'home', label: 'Overview' },
                    { id: 'expense', label: 'Expense Tracker' },
                    { id: 'insights', label: 'Smart Insights' },
                    { id: 'history', label: `Transactions (${transactions.length})` },
                    { id: 'payments', label: 'UPI Bill Payments' },
                    { id: 'profile', label: 'Account Profile' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                        activeTab === t.id
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Panes */}
                {activeTab === 'home' && (
                  <RecentTransactions
                    transactions={transactions}
                    onTransactionClick={() => setActiveTab('history')}
                  />
                )}

                {activeTab === 'expense' && (
                  <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                    <ExpenseTrackerTab />
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                    <InsightsTab />
                  </div>
                )}

                {activeTab === 'history' && (
                  <HistoryTab
                    transactions={transactions}
                    onOpenUpload={() => setIsUploadOpen(true)}
                  />
                )}

                {activeTab === 'payments' && (
                  <PaymentsTab
                    onScanClick={handleScanPay}
                    onSendClick={handleSendMoney}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileTab 
                    onShowQR={() => setIsQrOpen(true)} 
                    onLogout={handleLogout}
                  />
                )}

              </div>
            </div>
          </div>
        )}

      </>
    )}
  </main>

      {/* Interactive Modals */}
      <ScanPayModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSendSuccess={handleSendSuccess}
      />

      <StatementUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportTransactions={handleImportedTransactions}
      />

      <MyQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />

    </div>
  );
}
