'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Wifi, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  Receipt,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Sliders,
  DollarSign,
  Send,
  Edit3,
  Filter,
  Sparkles,
  Lock,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Bot,
  ReceiptIndianRupee,
  Repeat
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
import SubscriptionsTab from '@/components/SubscriptionsTab';
import AIAdvisorTab from '@/components/AIAdvisorTab';
import TaxFinderTab from '@/components/TaxFinderTab';
import MultiBankWealthTab from '@/components/MultiBankWealthTab';
import StatementUploadModal from '@/components/StatementUploadModal';
import MyQrModal from '@/components/MyQrModal';
import { RawTransaction, Category } from '@/types/finance';
import { parseBankStatementLines } from '@/lib/pdfParser';
import { enrichAndAnalyzeTransactions } from '@/lib/engine';

export default function HappyPocketApp() {
  const [balance, setBalance] = useState<number>(14524.91);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>(DEFAULT_RECENT_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [desktopMode, setDesktopMode] = useState<'phone' | 'wide'>('phone');
  
  // Financial engine state
  const [extractedRawTxs, setExtractedRawTxs] = useState<RawTransaction[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof enrichAndAnalyzeTransactions> | null>(null);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'insights' | 'ledger' | 'subscriptions' | 'tax' | 'sandbox'>('insights');
  const [selectedLedgerFilter, setSelectedLedgerFilter] = useState<string>('all');
  const [userOverrides, setUserOverrides] = useState<Record<string, { category: Category; tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income' }>>({});

  // What-If Sandbox Parameters
  const [trimDiningPercent, setTrimDiningPercent] = useState(15);

  // Modals state
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Account Aggregator (AA) Live Flow Simulator State
  const [isAAModalOpen, setIsAAModalOpen] = useState(false);
  const [aaStep, setAaStep] = useState<'MOBILE' | 'OTP' | 'SELECT_ACCOUNTS' | 'FETCHING' | 'SUCCESS'>('MOBILE');
  const [aaMobile, setAaMobile] = useState('9876543210');
  const [aaOtp, setAaOtp] = useState('');
  const [selectedAABanks, setSelectedAABanks] = useState<string[]>(['sbi_40665', 'canara_91636']);

  // Live UPI Phone Payment Simulator State
  const [isPhoneSimOpen, setIsPhoneSimOpen] = useState(false);
  const [simPayee, setSimPayee] = useState('Swiggy');
  const [simAmount, setSimAmount] = useState('450');
  const [simApp, setSimApp] = useState<'Google Pay' | 'PhonePe' | 'Paytm' | 'CRED'>('Google Pay');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Convert raw transactions to display transactions & update state
  const syncTransactionsWithEngine = (rawTxs: RawTransaction[], overrides = userOverrides) => {
    const analysis = enrichAndAnalyzeTransactions(rawTxs, overrides);
    setAnalysisResult(analysis);

    const converted: DisplayTransaction[] = analysis.enriched.map((item, idx) => ({
      id: item.id || `stmt_tx_${Date.now()}_${idx}`,
      title: item.cleanMerchant || item.payeeName || item.rawDescription,
      rawTimeText: new Date(item.timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      timestamp: item.timestamp,
      amount: item.amount,
      type: item.amount > 0 ? 'salary' : (item.category === 'Groceries' ? 'grocery' : item.category === 'Transport & Fuel' ? 'fuel' : item.isInternalTransfer ? 'transfer' : 'other'),
    }));

    setTransactions(converted);
  };

  // Human-in-the-Loop Category Override Handler
  const handleRecategorize = (txId: string, currentCategory: Category) => {
    const categories: Category[] = [
      'Housing & Utilities',
      'Groceries',
      'Dining & Nightlife',
      'Subscriptions & Digital',
      'Transport & Fuel',
      'Healthcare',
      'Shopping & Discretionary',
      'Internal Transfer',
      'Reimbursement / Split'
    ];
    const nextIdx = (categories.indexOf(currentCategory) + 1) % categories.length;
    const newCat = categories[nextIdx];
    const isEssential = ['Housing & Utilities', 'Groceries', 'Healthcare'].includes(newCat);
    const newTier = isEssential ? 'Essential' : (newCat === 'Internal Transfer' || newCat === 'Reimbursement / Split' ? 'Transfer_or_Offset' : 'Discretionary');

    const updated = {
      ...userOverrides,
      [txId]: { category: newCat, tier: newTier as any }
    };
    setUserOverrides(updated);
    if (extractedRawTxs.length > 0) {
      syncTransactionsWithEngine(extractedRawTxs, updated);
    }
  };

  // Handle successful payments
  const handlePaymentSuccess = (amount: number, merchant: string) => {
    setBalance((prev) => Math.max(0, prev - amount));
    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const newTx: RawTransaction = {
      id: `tx_${Date.now()}`,
      accountId: 'acc_primary_sbi',
      amount: -amount,
      rawDescription: `UPI/DR/${rrn}/${merchant.toUpperCase()}/OKAXIS`,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      txMode: 'UPI',
      upiRrn: rrn,
      payeeName: merchant,
      bankCode: 'OKAXIS',
      remark: 'UPI Payment'
    };

    const nextRaw = [newTx, ...extractedRawTxs];
    setExtractedRawTxs(nextRaw);
    syncTransactionsWithEngine(nextRaw);
    showToast(`Paid ₹${amount.toLocaleString('en-IN')} to ${merchant}`);
  };

  // Handle successful money transfers
  const handleSendSuccess = (amount: number, recipient: string) => {
    setBalance((prev) => Math.max(0, prev - amount));
    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const newTx: RawTransaction = {
      id: `tx_${Date.now()}`,
      accountId: 'acc_primary_sbi',
      amount: -amount,
      rawDescription: `UPI/DR/${rrn}/TRANSFER TO ${recipient.toUpperCase()}`,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      txMode: 'UPI',
      upiRrn: rrn,
      payeeName: recipient,
      remark: 'P2P Transfer'
    };

    const nextRaw = [newTx, ...extractedRawTxs];
    setExtractedRawTxs(nextRaw);
    syncTransactionsWithEngine(nextRaw);
    showToast(`Sent ₹${amount.toLocaleString('en-IN')} to ${recipient}`);
  };

  // Handle imported statement items
  const handleImportedTransactions = (imported: DisplayTransaction[], raw?: RawTransaction[]) => {
    if (raw && raw.length > 0) {
      setExtractedRawTxs(raw);
      syncTransactionsWithEngine(raw);
    } else {
      setTransactions((prev) => [...imported, ...prev]);
    }
    showToast(`Imported ${imported.length} statement records!`);
  };

  // Live UPI Phone Payment Simulator Trigger
  const handleLivePaymentSim = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(simAmount);
    if (!amt || isNaN(amt)) return;

    setBalance(prev => Math.max(0, prev - amt));
    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const vpa = `${simPayee.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
    const newTx: RawTransaction = {
      id: `tx_live_${Date.now()}`,
      accountId: 'acc_primary_sbi',
      amount: -amt,
      rawDescription: `WDL TFR UPI/DR/${rrn}/${simPayee.toUpperCase()}/UTIB/${vpa}/UPI`,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      txMode: 'UPI',
      upiRrn: rrn,
      payeeName: simPayee,
      bankCode: 'UTIB',
      vpaHandle: vpa,
      remark: 'UPI Live Payment',
      terminalRef: 'LIVE POS AT 40184'
    };

    const updated = [newTx, ...extractedRawTxs];
    setExtractedRawTxs(updated);
    syncTransactionsWithEngine(updated);

    showToast(`⚡ Paid ₹${amt} to ${simPayee} via ${simApp}! Auto-reflected in app.`);
    setIsPhoneSimOpen(false);
  };

  // Account Aggregator Workflow Handlers
  const handleAASubmitMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aaMobile || aaMobile.length < 10) return;
    setAaStep('OTP');
  };

  const handleAASubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (aaOtp.length < 4) return;
    setAaStep('SELECT_ACCOUNTS');
  };

  const handleAAAuthorize = async () => {
    setAaStep('FETCHING');
    setTimeout(() => {
      const demoLines = [
        "HDFC BANK LIMITED - ACCOUNT STATEMENT",
        "Account No: 50100412891920 Branch: KORAMANGALA",
        "01/10/2026 SALARY CREDIT TECH CORP 75,000.00 CR",
        "02/10/2026 UPI/429182/SWIGGY/swiggy@icici 450.00 DR",
        "03/10/2026 TFR TO SELF MARCUS HYSA 15,000.00 DR",
        "05/10/2026 NETFLIX ENTERTAINMENT MTHLY 649.00 DR",
        "08/10/2026 SPOTIFY INDIA PREMIUM 119.00 DR",
        "12/10/2026 UPI/391028/ZARA STORE 4,200.00 DR",
        "15/10/2026 ZARA STORE RETURN REFUND 4,200.00 CR",
        "16/10/2026 NOBU DINNER SHARABLE BILL 5,400.00 DR",
        "17/10/2026 UPI/8812/P2P DINNER SPLIT REIMBURSEMENT 2,700.00 CR",
        "20/10/2026 AVALON BAY RENT ACH 25,000.00 DR",
        "22/10/2026 CON EDISON ELECTRICITY 1,850.00 DR",
        "24/10/2026 LUMEN METABOLISM UNUSED SUB 2,999.00 DR"
      ];
      const raw = parseBankStatementLines(demoLines);
      setExtractedRawTxs(raw);
      syncTransactionsWithEngine(raw);

      setAaStep('SUCCESS');
      setTimeout(() => {
        setIsAAModalOpen(false);
        setAaStep('MOBILE');
        setAaOtp('');
        showToast("Connected via RBI Account Aggregator! Streamed live records.");
      }, 1000);
    }, 1400);
  };

  // Quick Action handlers
  const handleScanPay = () => setIsScanOpen(true);
  const handleSendMoney = () => setIsSendOpen(true);
  const handleTransactionsClick = () => setDesktopMode('wide');

  const filteredLedger = analysisResult?.enriched.filter(tx => {
    if (selectedLedgerFilter === 'recurring') return tx.isRecurring;
    if (selectedLedgerFilter === 'transfer') return tx.isInternalTransfer;
    if (selectedLedgerFilter === 'refund') return tx.isRefundOrReversal;
    if (selectedLedgerFilter === 'split') return tx.isSharedSplitExpense;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-800 animate-bounce">
          <Zap className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Desktop Helper / Mode Switcher Banner (Visible only on tablets & desktop >= 768px) */}
      <aside aria-label="Desktop Viewport Switcher" className="hidden md:flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <HappyPocketLogo size={32} />
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              Happy Pocket
            </span>
          </div>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-slate-500 font-medium">
            Financial Visibility, Hidden Drain Discovery & Multi-Bank Wealth Platform
          </span>
        </div>

        {/* Action Controls & Simulator Buttons */}
        <div className="flex items-center gap-2">
          {/* Simulate Live Payment */}
          <button
            type="button"
            onClick={() => setIsPhoneSimOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F97316] font-bold transition border border-orange-200 shadow-xs cursor-pointer"
            title="Simulate making a payment on GPay/PhonePe and watch it auto-reflect in app!"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulate Live Payment</span>
          </button>

          {/* Connect via AA */}
          <button
            type="button"
            onClick={() => setIsAAModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition border border-emerald-200 shadow-xs cursor-pointer"
            title="Connect bank accounts via RBI Account Aggregator"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connect via AA</span>
          </button>

          {/* Import Statement */}
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Upload Statement</span>
          </button>

          <span className="h-4 w-px bg-slate-200 mx-1" />

          {/* View Switcher Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDesktopMode('phone')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                desktopMode === 'phone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3 h-3 text-orange-500" />
              <span>Mobile View</span>
            </button>
            <button
              type="button"
              onClick={() => setDesktopMode('wide')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                desktopMode === 'wide'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3 h-3 text-orange-500" />
              <span>Full Dashboard</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8">
        
        {/* ======================================================== */}
        {/* VIEW 1: PHONE MOCKUP VIEW (Pixel-perfect Mobile App) */}
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
                    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                      <rect x="0" y="8" width="3" height="4" rx="1" />
                      <rect x="4.5" y="5" width="3" height="7" rx="1" />
                      <rect x="9" y="2.5" width="3" height="9.5" rx="1" />
                      <rect x="13.5" y="0" width="3" height="12" rx="1" />
                    </svg>
                    <Wifi className="w-4 h-4 stroke-[2.4]" />
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
                    onClick={() => setActiveTab('advisor')}
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

                      {/* Financial Distortion Deduction Pill */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0A172E] text-white shadow-md space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            True Living Outflow
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Zero Distortion
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-lg font-bold font-mono">
                              ₹{analysisResult ? analysisResult.kpis.trueLivingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '31,540.00'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Excludes self-transfers & paired refunds
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDesktopMode('wide')}
                            className="text-[11px] text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
                          >
                            Analytics &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Recent Transactions List */}
                      <RecentTransactions
                        transactions={transactions.slice(0, 5)}
                        onViewAll={() => setDesktopMode('wide')}
                      />
                    </>
                  )}

                  {activeTab === 'subscriptions' && (
                    <SubscriptionsTab
                      subscriptions={analysisResult?.subscriptions || []}
                      onCancelSubscription={(m) => showToast(`Eliminated AutoPay mandate for ${m}!`)}
                    />
                  )}

                  {activeTab === 'advisor' && (
                    <AIAdvisorTab
                      trueLivingExpenses={analysisResult ? analysisResult.kpis.trueLivingExpenses : 31540}
                      monthlyCommitments={analysisResult ? analysisResult.kpis.monthlyRecurringCommitments : 768}
                      rawOutflows={analysisResult ? analysisResult.kpis.rawOutflows : 50740}
                      noiseDeducted={analysisResult ? (analysisResult.kpis.rawOutflows - analysisResult.kpis.trueLivingExpenses) : 19200}
                    />
                  )}

                  {activeTab === 'tax' && (
                    <TaxFinderTab />
                  )}

                  {activeTab === 'wealth' && (
                    <MultiBankWealthTab
                      onConnectAA={() => setIsAAModalOpen(true)}
                      onUploadStatement={() => setIsUploadOpen(true)}
                    />
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
        {/* VIEW 2: RESPONSIVE WIDE DASHBOARD VIEW (Desktop Full Screen) */}
        {/* ======================================================== */}
        {desktopMode === 'wide' && (
          <div className="w-full max-w-6xl mx-auto space-y-6 transition-all duration-300 py-4 px-4 sm:px-6">
            
            {/* Top Brand Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-[32px] bg-white border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-4">
                <HappyPocketLogo size={56} />
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Happy Pocket Intelligence Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero-Distortion Living Expense Discovery, Subscription Killer & Multi-Bank Wealth Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhoneSimOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Simulate Phone Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAAModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Connect AA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Upload PDF</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Left Account & KPIs / Right Interactive Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (5 Cols): Card, Action Buttons & Deduction Highlights */}
              <div className="lg:col-span-5 space-y-5">
                <AccountCard
                  accountName="Savings Account (Primary)"
                  accountNumberMask="•••• 5274"
                  balance={balance}
                />

                <div className="p-1 bg-white rounded-[26px] border border-slate-100 shadow-sm">
                  <ActionButtons
                    onScanPayClick={handleScanPay}
                    onSendMoneyClick={handleSendMoney}
                    onTransactionsClick={handleTransactionsClick}
                  />
                </div>

                {/* Anti-Distortion Noise Deductions Box */}
                <div className="rounded-[28px] bg-gradient-to-br from-slate-900 to-[#0A172E] p-6 text-white shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Anti-Distortion Engine
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400 block">Self-Transfers Filtered</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        ₹{analysisResult ? analysisResult.kpis.internalTransfersDetected.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '15,000.00'}
                      </span>
                      <span className="text-[10px] text-emerald-400">Excluded from spend</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400 block">Refunds Reconciled</span>
                      <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">
                        ₹{analysisResult ? analysisResult.kpis.refundsReconciled.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '4,200.00'}
                      </span>
                      <span className="text-[10px] text-cyan-400">Paired with purchase</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">True Living Outflow</span>
                      <span className="text-base font-bold font-mono text-white">
                        ₹{analysisResult ? analysisResult.kpis.trueLivingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '31,540.00'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Noise Deduction</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        -₹{analysisResult ? (analysisResult.kpis.rawOutflows - analysisResult.kpis.trueLivingExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '19,200.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Multi-Tab Engine Discovery */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Secondary Tab Switcher */}
                <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.03)] overflow-x-auto">
                  {[
                    { id: 'insights', label: 'Financial Discovery' },
                    { id: 'ledger', label: `Normalized Ledger (${analysisResult ? analysisResult.enriched.length : transactions.length})` },
                    { id: 'subscriptions', label: `Recurring Drains (${analysisResult ? analysisResult.subscriptions.length : 2})` },
                    { id: 'tax', label: 'Tax Deductions' },
                    { id: 'sandbox', label: 'What-If Savings Sandbox' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAnalyticsSubTab(t.id as any)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        analyticsSubTab === t.id
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* SubTab 1: Financial Discovery & Insights */}
                {analyticsSubTab === 'insights' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Commitments</span>
                        <div className="text-2xl font-bold font-mono text-slate-900">
                          ₹{analysisResult ? analysisResult.kpis.monthlyRecurringCommitments.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '768.00'}
                          <span className="text-xs font-normal text-slate-500"> /mo</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          ₹{analysisResult ? (analysisResult.kpis.monthlyRecurringCommitments * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '9,216.00'} annual burden across digital mandates.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Savings Rate</span>
                        <div className="text-2xl font-bold font-mono text-emerald-600">
                          {analysisResult ? ((1 - (analysisResult.kpis.trueLivingExpenses / Math.max(1, analysisResult.enriched.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 75000)))) * 100).toFixed(1) : '57.9'}%
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Discretionary spend remaining after clean living expenses.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Engine Highlights & Automated Reconciliations
                      </h3>
                      <div className="space-y-2">
                        {[
                          { title: 'Self-Transfer Excluded', desc: 'Transfer of ₹15,000 to Marcus HYSA excluded from expense baseline.', tag: 'Auto-Matched' },
                          { title: 'Refund Paired', desc: 'Zara Store return refund of ₹4,200 offset original debit with zero net distortion.', tag: 'Offset Paired' },
                          { title: 'P2P Dinner Split Receipt', desc: 'P2P reimbursement of ₹2,700 credited against Nobu dinner bill.', tag: 'Reimbursed' }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{item.title}</div>
                              <div className="text-[11px] text-slate-500">{item.desc}</div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              {item.tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SubTab 2: Normalized Ledger */}
                {analyticsSubTab === 'ledger' && (
                  <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={selectedLedgerFilter}
                          onChange={e => setSelectedLedgerFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
                        >
                          <option value="all">All Transactions ({analysisResult ? analysisResult.enriched.length : transactions.length})</option>
                          <option value="recurring">Recurring Only</option>
                          <option value="transfer">Self-Transfers Only</option>
                          <option value="refund">Refunds Only</option>
                          <option value="split">Shared Splits Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Beneficiary / Merchant</th>
                            <th className="py-2.5 px-3">Mode / RRN</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-center">Override</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analysisResult ? (
                            filteredLedger.map((tx) => {
                              const isInflow = tx.amount > 0;
                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                                    {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-2.5 px-3 max-w-[180px]">
                                    <div className="font-bold text-slate-900 truncate">
                                      {tx.payeeName || tx.cleanMerchant}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate" title={tx.rawDescription}>
                                      {tx.vpaHandle ? `@${tx.vpaHandle}` : tx.bankCode || 'UPI'}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <span className="font-bold text-slate-700 block">{tx.txMode || 'UPI'}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {tx.upiRrn ? `${tx.upiRrn}` : ''}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <span className="font-medium text-slate-700">{tx.category}</span>
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                                    isInflow ? 'text-emerald-600' : 'text-slate-900'
                                  }`}>
                                    {isInflow ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    {tx.isInternalTransfer && (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                        Self-Transfer
                                      </span>
                                    )}
                                    {tx.isRefundOrReversal && (
                                      <span className="bg-cyan-100 text-cyan-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                        Refund Paired
                                      </span>
                                    )}
                                    {tx.isSharedSplitExpense && (
                                      <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                        Split Reconciled
                                      </span>
                                    )}
                                    {tx.isRecurring && (
                                      <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                        Recurring
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleRecategorize(tx.id, tx.category)}
                                      className="inline-flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 font-bold transition"
                                      title="Cycle category"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Adjust
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                                  {tx.rawTimeText || 'Today'}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {tx.title}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">
                                  UPI
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 capitalize">
                                  {tx.type}
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                  tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                  {tx.amount > 0 ? '+₹' : '-₹'}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                                    Verified
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center text-slate-400">
                                  -
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SubTab 3: Recurring Drains & Subscriptions */}
                {analyticsSubTab === 'subscriptions' && (
                  <SubscriptionsTab
                    subscriptions={analysisResult?.subscriptions || []}
                    onCancelSubscription={(m) => showToast(`Eliminated AutoPay mandate for ${m}!`)}
                  />
                )}

                {/* SubTab 4: Tax Finder */}
                {analyticsSubTab === 'tax' && (
                  <TaxFinderTab />
                )}

                {/* SubTab 5: What-If Savings Sandbox */}
                {analyticsSubTab === 'sandbox' && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">What-If Financial Sandbox</h3>
                      <p className="text-xs text-slate-500">
                        Adjust parameters to calculate compound wealth impact over 1 year and 5 years.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Trim Discretionary / Food Delivery Spend: {trimDiningPercent}%
                        </label>
                        <span className="text-xs font-mono font-bold text-orange-600">
                          ₹{((4200 * trimDiningPercent) / 100).toFixed(0)} saved/mo
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={trimDiningPercent}
                        onChange={e => setTrimDiningPercent(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center">
                        <span className="text-[11px] font-bold text-orange-800 block">1-Year Wealth Impact</span>
                        <div className="text-xl font-bold font-mono text-orange-600 mt-1">
                          +₹{(((4200 * trimDiningPercent) / 100) * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-[10px] text-orange-700">Accumulated surplus</span>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                        <span className="text-[11px] font-bold text-emerald-800 block">5-Year SIP Impact (12% CAGR)</span>
                        <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                          +₹{((((4200 * trimDiningPercent) / 100) * 12 * 5) * 1.35).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-[10px] text-emerald-700">Compounded investment</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS */}
      {/* ======================================================== */}

      {/* 1. Scan & Pay Modal */}
      <ScanPayModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 2. Send Money Modal */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSendSuccess={handleSendSuccess}
      />

      {/* 3. Bank Statement PDF Parser Modal (with Password Decryption) */}
      <StatementUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportTransactions={handleImportedTransactions}
      />

      {/* 4. My QR Modal */}
      <MyQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />

      {/* 5. Live Phone UPI Payment Simulator Modal */}
      {isPhoneSimOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-orange-200 rounded-[32px] max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live UPI Phone Sim</h3>
                  <p className="text-[11px] text-slate-400">Simulate paying via phone app</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhoneSimOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2.5 py-1 rounded-lg bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLivePaymentSim} className="space-y-3.5">
              {/* App Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select UPI App</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Google Pay', 'PhonePe', 'Paytm', 'CRED'] as const).map(app => (
                    <button
                      type="button"
                      key={app}
                      onClick={() => setSimApp(app)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        simApp === app 
                          ? 'bg-orange-500 border-orange-500 text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Merchant Shortcuts */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quick Payees</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Swiggy', defaultAmt: '380' },
                    { name: 'Zomato', defaultAmt: '450' },
                    { name: 'Blinkit', defaultAmt: '290' },
                    { name: 'Indian Oil', defaultAmt: '650' },
                    { name: 'Uber Cab', defaultAmt: '210' },
                    { name: 'Netflix', defaultAmt: '649' }
                  ].map(m => (
                    <button
                      type="button"
                      key={m.name}
                      onClick={() => {
                        setSimPayee(m.name);
                        setSimAmount(m.defaultAmt);
                      }}
                      className={`px-2 py-1 text-[11px] rounded-lg border font-medium transition cursor-pointer ${
                        simPayee === m.name 
                          ? 'bg-orange-100 border-orange-300 text-orange-800 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payee Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Merchant / Payee Name</label>
                <input
                  type="text"
                  value={simPayee}
                  onChange={e => setSimPayee(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={simAmount}
                  onChange={e => setSimAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-orange-50 text-[10px] text-orange-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Simulates phone payment, webhook delivery & auto ledger update.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Pay ₹{simAmount} & Stream to App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. RBI Account Aggregator (AA) Consent Flow Simulator Modal */}
      {isAAModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-[32px] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900">RBI Account Aggregator</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Live Flow
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Encrypted Open Banking Stream</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAAModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2.5 py-1 rounded-lg bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Mobile Input */}
            {aaStep === 'MOBILE' && (
              <form onSubmit={handleAASubmitMobile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number Linked to Bank Accounts
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={aaMobile}
                      onChange={e => setAaMobile(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                  An OTP will be sent by RBI-licensed Account Aggregator (Setu / Sahamati). No bank login passwords needed.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Request Consent OTP
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {aaStep === 'OTP' && (
              <form onSubmit={handleAASubmitOtp} className="space-y-3.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Enter OTP</label>
                    <span className="text-[10px] text-slate-500">Sent to +91 {aaMobile}</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="1234"
                    value={aaOtp}
                    onChange={e => setAaOtp(e.target.value)}
                    autoFocus
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-center text-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 tracking-widest"
                  />
                  <p className="text-[10px] text-slate-500 text-center mt-1">Hint: Enter 1234 for sandbox authorization.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAaStep('MOBILE')}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Verify OTP
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Select Bank Accounts */}
            {aaStep === 'SELECT_ACCOUNTS' && (
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">Select Accounts to Link</h4>
                  <p className="text-[11px] text-slate-500">Discovered registered accounts with your phone number:</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'sbi_40665', name: 'State Bank of India', mask: '•••• 40665', type: 'Savings Account (Primary)' },
                    { id: 'canara_91636', name: 'Canara Bank', mask: '•••• 91636', type: 'Savings Account (Secondary)' }
                  ].map(acc => {
                    const isSelected = selectedAABanks.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setSelectedAABanks(prev => 
                            prev.includes(acc.id) ? prev.filter(x => x !== acc.id) : [...prev, acc.id]
                          );
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50/50' 
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{acc.mask} · {acc.type}</div>
                          </div>
                        </div>
                        <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAAAuthorize}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Authorize & Fetch Transactions
                </button>
              </div>
            )}

            {/* Step 4: Fetching */}
            {aaStep === 'FETCHING' && (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-slate-900">Pulling Encrypted Bank Packets...</div>
                <p className="text-xs text-slate-500">Decrypting FIP payload via Setu AA Gateway.</p>
              </div>
            )}

            {/* Step 5: Success */}
            {aaStep === 'SUCCESS' && (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">Accounts Linked Successfully!</div>
                <p className="text-xs text-emerald-700 font-mono">Streamed live records directly into ledger.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
