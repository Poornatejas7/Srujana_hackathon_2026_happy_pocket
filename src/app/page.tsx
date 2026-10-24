'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Wifi, 
  BatteryMedium, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  CreditCard, 
  Landmark,
  ShieldCheck,
  TrendingUp,
  Receipt
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
import StatementUploadModal from '@/components/StatementUploadModal';
import MyQrModal from '@/components/MyQrModal';

export default function HappyPocketApp() {
  const [balance, setBalance] = useState<number>(14524.91);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>(DEFAULT_RECENT_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [desktopMode, setDesktopMode] = useState<'phone' | 'wide'>('phone');
  
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
      <aside aria-label="Desktop Viewport Switcher" className="hidden md:flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <HappyPocketLogo size={32} />
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
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-xs cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Import Statement</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8">
        
        {/* ======================================================== */}
        {/* VIEW 1: PHONE MOCKUP VIEW (Pixel-perfect to reference image) */}
        {/* ======================================================== */}
        {(desktopMode === 'phone' || typeof window === 'undefined') && (
          <div className="w-full max-w-[420px] mx-auto md:my-4 transition-all duration-300">
            {/* Phone outer bezel on desktop / clean on mobile */}
            <div className="w-full bg-[#EEF2F6] md:bg-white md:p-3 md:rounded-[52px] md:shadow-[0_25px_70px_rgba(15,23,42,0.14)] md:border-[8px] md:border-slate-800/90 relative overflow-hidden">
              
              {/* Phone Inner Screen Container */}
              <div className="w-full bg-[#EEF2F6] min-h-[820px] rounded-[36px] sm:rounded-[44px] flex flex-col justify-between overflow-hidden relative">
                
                {/* 1. Mobile Status Bar (9:41, Signal, Battery) */}
                <div className="w-full pt-3 px-7 flex items-center justify-between text-slate-800 select-none">
                  <span className="font-bold text-sm tracking-tight font-sans">9:41</span>
                  
                  {/* Status Bar Icons */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    {/* Cellular signal bars */}
                    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                      <rect x="0" y="8" width="3" height="4" rx="1" />
                      <rect x="4.5" y="5" width="3" height="7" rx="1" />
                      <rect x="9" y="2.5" width="3" height="9.5" rx="1" />
                      <rect x="13.5" y="0" width="3" height="12" rx="1" />
                    </svg>
                    {/* Wi-Fi Icon */}
                    <Wifi className="w-4 h-4 stroke-[2.4]" />
                    {/* Battery Icon */}
                    <div className="w-5 h-2.5 rounded-[4px] border-[1.5px] border-slate-800 p-0.5 flex items-center">
                      <div className="w-full h-full bg-slate-800 rounded-[1.5px]" />
                    </div>
                  </div>
                </div>

                {/* 2. App Header (Mascot & User Avatar) */}
                <div className="px-6 pt-3 pb-2 flex items-center justify-between">
                  {/* Left: Mascot Character */}
                  <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('home')}>
                    <HappyPocketLogo size={58} />
                  </div>

                  {/* Right: Circular User Avatar */}
                  <div 
                    onClick={() => setActiveTab('profile')}
                    className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-orange-400 transition"
                  >
                    <Image
                      src="/avatar.jpg"
                      alt="User Avatar"
                      fill
                      sizes="44px"
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* 3. Screen Scrollable Body Content */}
                <div className="px-5 py-2 flex-1 space-y-4 sm:space-y-5 overflow-y-auto max-h-[660px] pb-24">
                  {activeTab === 'home' && (
                    <>
                      {/* Signature Account Card */}
                      <AccountCard
                        accountName="Savings Account"
                        accountNumberMask="•••• 5274"
                        balance={balance}
                      />

                      {/* 3 Quick Action Buttons */}
                      <ActionButtons
                        onScanPayClick={handleScanPay}
                        onSendMoneyClick={handleSendMoney}
                        onTransactionsClick={handleTransactionsClick}
                      />

                      {/* Recent Transactions List */}
                      <RecentTransactions
                        transactions={transactions.slice(0, 5)}
                        onViewAll={() => setActiveTab('history')}
                      />
                    </>
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
                    <ProfileTab onShowQR={() => setIsQrOpen(true)} />
                  )}
                </div>

                {/* 4. Bottom Navigation Bar */}
                <div className="absolute bottom-0 inset-x-0 z-30">
                  <BottomNav
                    activeTab={activeTab}
                    onChangeTab={(t) => setActiveTab(t)}
                  />
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
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white shadow-xs">
                  <Image
                    src="/avatar.jpg"
                    alt="User Avatar"
                    fill
                    sizes="40px"
                    className="object-cover"
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
                    onViewAll={() => setActiveTab('history')}
                  />
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
                  <ProfileTab onShowQR={() => setIsQrOpen(true)} />
                )}

              </div>
            </div>
          </div>
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
