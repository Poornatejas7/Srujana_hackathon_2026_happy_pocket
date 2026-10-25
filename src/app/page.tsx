'use client';

import React, { useState, useEffect } from 'react';
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
  Repeat,
  Columns
} from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';
import AccountCard from '@/components/AccountCard';
import ActionButtons from '@/components/ActionButtons';
import RecentTransactions, { 
  DisplayTransaction 
} from '@/components/RecentTransactions';
import BottomNav, { NavTab } from '@/components/BottomNav';
import ScanPayModal from '@/components/ScanPayModal';
import SendMoneyModal from '@/components/SendMoneyModal';
import SubscriptionsTab from '@/components/SubscriptionsTab';
import AIAdvisorTab from '@/components/AIAdvisorTab';
import TaxFinderTab from '@/components/TaxFinderTab';
import MultiBankWealthTab from '@/components/MultiBankWealthTab';
import ExpenseTrackerTab from '@/components/ExpenseTrackerTab';
import InsightsTab from '@/components/InsightsTab';
import PaymentsTab from '@/components/PaymentsTab';
import HistoryTab from '@/components/HistoryTab';
import ProfileTab from '@/components/ProfileTab';
import StatementUploadModal from '@/components/StatementUploadModal';
import MyQrModal from '@/components/MyQrModal';
import { MultiAppSimulator, PaymentExecutionParams } from '@/components/MultiAppSimulator';
import { RawTransaction, Category } from '@/types/finance';
import { parseBankStatementLines } from '@/lib/pdfParser';
import { enrichAndAnalyzeTransactions } from '@/lib/engine';

export default function HappyPocketApp() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [desktopMode, setDesktopMode] = useState<'phone' | 'wide' | 'split'>('split');
  
  // Financial engine state
  const [extractedRawTxs, setExtractedRawTxs] = useState<RawTransaction[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof enrichAndAnalyzeTransactions> | null>(null);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'insights' | 'expense_tracker' | 'smart_insights' | 'raw_transactions' | 'ledger' | 'subscriptions' | 'tax' | 'sandbox'>('insights');
  const [selectedLedgerFilter, setSelectedLedgerFilter] = useState<string>('all');
  const [userOverrides, setUserOverrides] = useState<Record<string, { category: Category; tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income' }>>({});
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);

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

  // Load real data from MongoDB Atlas on mount
  useEffect(() => {
    async function loadFromDb() {
      try {
        setIsDbLoading(true);
        const res = await fetch('/api/transactions');
        const data = await res.json();

        if (data.success && data.transactions && data.transactions.length > 0) {
          const rawList: RawTransaction[] = data.transactions.map((t: any) => ({
            id: t._id || t.id,
            accountId: t.accountId || 'acc_primary_sbi',
            amount: t.amount,
            rawDescription: t.rawDescription,
            currency: t.currency || 'INR',
            timestamp: t.timestamp,
            txMode: t.txMode || 'UPI',
            upiRrn: t.upiRrn,
            payeeName: t.payeeName,
            bankCode: t.bankCode,
            vpaHandle: t.vpaHandle,
            remark: t.remark,
            cleanMerchant: t.cleanMerchant,
            category: t.category,
            tier: t.tier,
            isRecurring: t.isRecurring,
            isInternalTransfer: t.isInternalTransfer,
            isRefundOrReversal: t.isRefundOrReversal,
            netOutflowAmount: t.netOutflowAmount,
            userOverridden: t.userOverridden
          }));

          setExtractedRawTxs(rawList);
          syncTransactionsWithEngine(rawList);

          // Calculate real balance directly from DB transactions (sum of all inflows & outflows)
          const netChange = rawList.reduce((acc, curr) => acc + curr.amount, 0);
          setBalance(netChange);
        } else {
          setExtractedRawTxs([]);
          setTransactions([]);
          setAnalysisResult(enrichAndAnalyzeTransactions([]));
          setBalance(0);
        }
      } catch (err) {
        console.error('Failed to load transactions from MongoDB:', err);
        setExtractedRawTxs([]);
        setTransactions([]);
        setAnalysisResult(enrichAndAnalyzeTransactions([]));
        setBalance(0);
      } finally {
        setIsDbLoading(false);
      }
    }

    loadFromDb();
  }, []);

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

  // Human-in-the-Loop Category Override Handler (Persisted to MongoDB)
  const handleRecategorize = async (txId: string, currentCategory: Category) => {
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

    // Persist category edit to MongoDB Atlas
    try {
      await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: txId, category: newCat, tier: newTier, userOverridden: true }),
      });
      showToast(`Category updated to "${newCat}" in Atlas Database!`);
    } catch (e) {
      console.warn('Failed to update category in database:', e);
    }
  };

  // Delete / Cancel Mandate from MongoDB Atlas
  const handleCancelMandate = async (merchant: string) => {
    try {
      await fetch(`/api/transactions?merchant=${encodeURIComponent(merchant)}`, {
        method: 'DELETE',
      });
      // Remove from local memory
      const filtered = extractedRawTxs.filter(t => 
        !t.payeeName?.toLowerCase().includes(merchant.toLowerCase()) && 
        !t.rawDescription?.toLowerCase().includes(merchant.toLowerCase())
      );
      setExtractedRawTxs(filtered);
      syncTransactionsWithEngine(filtered);
      showToast(`Deleted "${merchant}" mandate from Atlas Database!`);
    } catch (e) {
      console.warn('Failed to delete mandate from database:', e);
    }
  };

  // Helper to persist transaction to MongoDB
  const persistToDatabase = async (txs: RawTransaction | RawTransaction[]) => {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txs),
      });
    } catch (e) {
      console.warn('Database save warning:', e);
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
    persistToDatabase(newTx);
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
    persistToDatabase(newTx);
    showToast(`Sent ₹${amount.toLocaleString('en-IN')} to ${recipient}`);
  };

  // Handle imported statement items
  const handleImportedTransactions = (imported: DisplayTransaction[], raw?: RawTransaction[]) => {
    if (raw && raw.length > 0) {
      setExtractedRawTxs(raw);
      syncTransactionsWithEngine(raw);
      persistToDatabase(raw);
    } else {
      setTransactions((prev) => [...imported, ...prev]);
    }
    showToast(`Imported ${imported.length} statement records!`);
  };

  // Multi-App Simulator Execution Handler (Google Pay, PhonePe, Paytm, CRED, Netflix, Spotify, Swiggy, Blinkit)
  const handleMultiAppPayment = (params: PaymentExecutionParams) => {
    const amt = params.amount;
    if (!amt || isNaN(amt)) return;

    setBalance(prev => Math.max(0, prev - amt));
    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const vpa = `${params.payee.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;

    const newTx: RawTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      accountId: 'acc_primary_sbi',
      amount: -amt,
      rawDescription: params.rawDescription || `${params.method}/DR/${rrn}/${params.payee.toUpperCase()}/${params.app.toUpperCase()}`,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      txMode: params.method === 'AutoPay Mandate' ? 'MANDATE' : params.method === 'Card' ? 'POS' : 'UPI',
      upiRrn: rrn,
      payeeName: params.payee,
      bankCode: 'OKAXIS',
      vpaHandle: vpa,
      category: params.category as any,
      remark: `${params.method} via ${params.app}`,
      isRecurring: params.isRecurring || false,
      isInternalTransfer: params.isInternalTransfer || false
    };

    const updated = [newTx, ...extractedRawTxs];
    setExtractedRawTxs(updated);
    syncTransactionsWithEngine(updated);
    persistToDatabase(newTx);

    showToast(`⚡ Paid ₹${amt} via ${params.app}! Auto-reflected in Happy Pocket.`);
    setIsPhoneSimOpen(false);
  };

  // Live UPI Phone Payment Simulator Trigger (Legacy fallback)
  const handleLivePaymentSim = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(simAmount);
    if (!amt || isNaN(amt)) return;

    handleMultiAppPayment({
      app: simApp,
      payee: simPayee,
      amount: amt,
      category: 'Food & Dining',
      method: 'UPI'
    });
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
      persistToDatabase(raw);

      setAaStep('SUCCESS');
      setTimeout(() => {
        setIsAAModalOpen(false);
        setAaStep('MOBILE');
        setAaOtp('');
        showToast("Connected via RBI Account Aggregator! Streamed live records to Atlas.");
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

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2">

          {/* View Switcher Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDesktopMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                desktopMode === 'split'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Split Screen: Payment Simulator on Left, Solution on Right"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split Screen (Simulator + Solution)</span>
            </button>
            <button
              type="button"
              onClick={() => setDesktopMode('phone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                desktopMode === 'phone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View only the UPI Payment Simulator inside a mobile phone chassis"
            >
              <Smartphone className="w-3.5 h-3.5 text-orange-500" />
              <span>Simulator (Mobile View)</span>
            </button>
            <button
              type="button"
              onClick={() => setDesktopMode('wide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                desktopMode === 'wide'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View only the Happy Pocket Financial Intelligence Solution dashboard"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solution (Full Dashboard)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8">
        
        {/* ======================================================== */}
        {/* VIEW 1: AUTHENTIC ANDROID MOBILE PHONE PAYMENT SIMULATOR */}
        {/* ======================================================== */}
        {desktopMode === 'phone' && (
          <div className="w-full max-w-[390px] mx-auto md:my-4 transition-all duration-300">
            {/* Android Device Outer Bezel with Sleek Rounded Corners & Volume/Power Buttons */}
            <div className="w-full bg-[#1A1F2C] p-2 rounded-[44px] shadow-[0_25px_70px_rgba(11,15,25,0.4)] border-[6px] border-[#2A3142] relative">
              
              {/* Android Top Micro Speaker Slit */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#2D3748] rounded-full z-20" />

              {/* Android Inner AMOLED Screen */}
              <div className="w-full bg-[#0B0F19] rounded-[36px] overflow-hidden flex flex-col min-h-[680px]">
                <MultiAppSimulator
                  balance={balance}
                  onExecutePayment={handleMultiAppPayment}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: RESPONSIVE WIDE DASHBOARD VIEW (Desktop Full Screen) */}
        {/* ======================================================== */}
        {desktopMode === 'wide' && (
          <div className="w-full max-w-7xl mx-auto space-y-6 transition-all duration-300 py-4 px-4 sm:px-6">
            
            {/* Desktop Chassis Card - Pure Financial Intelligence Solution */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_15px_50px_rgba(15,23,42,0.08)] border border-slate-200/90 space-y-6">
              
              {/* Browser / Desktop Window Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <div className="ml-3 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs flex items-center gap-1.5 border border-slate-200/60">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>app.happypocket.in/dashboard/insights</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAAModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition border border-emerald-200 shadow-xs cursor-pointer"
                    title="Connect bank accounts via RBI Account Aggregator"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connect via AA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                    title="Upload bank statement PDF"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Upload Statement</span>
                  </button>

                  <span className="h-4 w-px bg-slate-200 mx-1" />

                  <div className="flex items-center gap-1.5">
                    <HappyPocketLogo size={28} />
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">Happy Pocket Financial Intelligence</span>
                  </div>
                </div>
              </div>

              {/* Problem Statement Header Banner */}
              <div className="bg-gradient-to-br from-[#0A172E] to-slate-900 rounded-[28px] p-6 text-white shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/10 text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                        Problem Statement Solution
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        Zero-Distortion Financial Visibility Engine
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                    Problem Solved
                  </span>
                </div>

                {/* 3 Core Anti-Distortion KPI Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Raw Statement Outflows</span>
                    <div className="text-2xl font-black font-mono text-white mt-1">
                      ₹{analysisResult ? analysisResult.kpis.rawOutflows.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Includes all noise</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[11px] text-rose-300 block font-bold uppercase tracking-wider">Noise Deductions</span>
                    <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                      -₹{analysisResult ? (analysisResult.kpis.rawOutflows - analysisResult.kpis.trueLivingExpenses).toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
                    </div>
                    <span className="text-xs text-rose-300 mt-1 block">Self-transfers & refunds</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-300 block font-bold uppercase tracking-wider">True Living Expenses</span>
                    <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                      ₹{analysisResult ? analysisResult.kpis.trueLivingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
                    </div>
                    <span className="text-xs text-emerald-400 font-bold mt-1 block">100% distortion-free</span>
                  </div>
                </div>
              </div>
                
              {/* SubTab Switcher for Problem Statement Solution */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-200/80 overflow-x-auto">
                {[
                  { id: 'insights', label: 'True Living Discovery' },
                  { id: 'raw_transactions', label: `Raw Statements / DB (${extractedRawTxs.length})` },
                  { id: 'ledger', label: `Normalized Ledger (${analysisResult ? analysisResult.enriched.length : transactions.length})` },
                  { id: 'expense_tracker', label: 'Expense Tracker' },
                  { id: 'smart_insights', label: 'Mandates & Better Swaps' },
                  { id: 'subscriptions', label: `AutoPay Mandates (${analysisResult ? analysisResult.subscriptions.length : 2})` },
                  { id: 'tax', label: 'Tax Deductions' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAnalyticsSubTab(t.id as any)}
                    className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      analyticsSubTab === t.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Pane 1: Expense Tracker */}
              {analyticsSubTab === ('expense_tracker' as any) && (
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                  <ExpenseTrackerTab transactions={extractedRawTxs} />
                </div>
              )}

              {/* Tab Pane 2: Smart Insights */}
              {analyticsSubTab === ('smart_insights' as any) && (
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                  <InsightsTab transactions={extractedRawTxs} />
                </div>
              )}

              {/* Tab Pane 3: Subscriptions Killer */}
              {analyticsSubTab === 'subscriptions' && (
                <SubscriptionsTab
                  subscriptions={analysisResult?.subscriptions || []}
                  onCancelSubscription={handleCancelMandate}
                />
              )}

              {/* Tab Pane 4: Tax Finder */}
              {analyticsSubTab === 'tax' && (
                <TaxFinderTab />
              )}

              {/* Tab Pane 5: Normalized Ledger Table */}
              {analyticsSubTab === 'ledger' && (
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Real Database Ledger Stream
                    </h4>
                    <select
                      value={selectedLedgerFilter}
                      onChange={e => setSelectedLedgerFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-1.5 text-slate-700 focus:outline-none"
                    >
                      <option value="all">All ({analysisResult ? analysisResult.enriched.length : transactions.length})</option>
                      <option value="recurring">Recurring Only</option>
                      <option value="transfer">Self-Transfers Only</option>
                      <option value="refund">Refunds Only</option>
                      <option value="split">Shared Splits Only</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Merchant</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-center">Engine Treatment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLedger.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-2 px-3 max-w-[140px] truncate font-bold text-slate-900">
                              {tx.payeeName || tx.cleanMerchant}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-medium text-slate-700">{tx.category}</span>
                            </td>
                            <td className={`py-2 px-3 text-right font-bold font-mono ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {tx.isInternalTransfer ? (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                  Excluded (Self)
                                </span>
                              ) : tx.isRecurring ? (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                  Recurring Drain
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                  Clean Living
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab Pane: Raw Statement Transactions Stream */}
              {analyticsSubTab === 'raw_transactions' && (
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Raw Statement Stream (Unfiltered / Distortion Present)
                        </h4>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full font-mono">
                          {extractedRawTxs.length} Raw Records
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        This is the un-sanitized log directly from the bank or live simulator. Notice how self-transfers and refund round-trips distort your perception of total spending.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Outflow</span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        ₹{extractedRawTxs.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Raw Description / Payee</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Raw Amount</th>
                          <th className="py-2.5 px-3 text-center">Problem / Distortion Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {extractedRawTxs.map((tx) => {
                          const isDebit = tx.amount < 0;
                          const isTransfer = tx.isInternalTransfer || (tx.category === 'Internal Transfer');
                          const isRefund = tx.category === 'Reimbursement / Split' || !isDebit;
                          const isRecurring = tx.isRecurring;
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                {new Date(tx.timestamp || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="py-2.5 px-3 max-w-[200px] truncate">
                                <div className="font-bold text-slate-900">{tx.rawDescription || tx.payeeName || tx.cleanMerchant}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{tx.upiRrn || tx.id}</div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  !isDebit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {isDebit ? 'DEBIT' : 'CREDIT'}
                                </span>
                              </td>
                              <td className={`py-2.5 px-3 text-right font-black font-mono ${
                                !isDebit ? 'text-emerald-600' : 'text-slate-900'
                              }`}>
                                {!isDebit ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isTransfer ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                    ⚠️ Noise: Self-Transfer
                                  </span>
                                ) : isRefund ? (
                                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                                    🔄 Split / Offset
                                  </span>
                                ) : isRecurring ? (
                                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                                    🔁 Hidden Recurring Drain
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                    Standard Expense
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab Pane 6: Insights Default */}
              {analyticsSubTab === 'insights' && (
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
                      <span className="text-[11px] font-bold text-orange-800 uppercase block tracking-wider">Monthly Recurring Drain</span>
                      <div className="text-2xl font-bold font-mono text-orange-700 mt-1">
                        ₹{analysisResult ? analysisResult.kpis.monthlyRecurringCommitments.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'} /mo
                      </div>
                      <span className="text-xs text-orange-600 mt-1 block">Fixed annual burden of ₹{analysisResult ? (analysisResult.kpis.monthlyRecurringCommitments * 12).toLocaleString('en-IN') : '0'}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">True Living Ratio</span>
                      <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                        {analysisResult && analysisResult.kpis.rawOutflows > 0 ? ((analysisResult.kpis.trueLivingExpenses / analysisResult.kpis.rawOutflows) * 100).toFixed(1) : '100.0'}%
                      </div>
                      <span className="text-xs text-emerald-600 mt-1 block">100% clean living expenses</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Why Happy Pocket Solves Financial Fog:</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Traditional UPI apps (GPay, PhonePe) display transaction logs as raw streams where moving money between your own accounts or returning an e-commerce order appears as massive spending. <strong>Happy Pocket normalizes, dedupes, and isolates true living expenses</strong> with zero manual bookkeeping.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: SPLIT SCREEN VIEW (Payment Simulation vs Problem Statement Solution) */}
        {/* ======================================================== */}
        {desktopMode === 'split' && (
          <div className="w-full max-w-[1880px] mx-auto space-y-4 transition-all duration-300 py-1 px-2 sm:px-4">
            
            {/* Split Screen Row: Mobile Screen (Left) + Vertical Divider + Desktop App Dashboard (Right) */}
            <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
              
              {/* ======================================================== */}
              {/* LEFT BOARD: COMPACT MOBILE SCREEN SIMULATOR */}
              {/* ======================================================== */}
              <div className="w-full lg:w-[350px] shrink-0 flex flex-col items-center">
                
                {/* Board Label */}
                <div className="w-full max-w-[340px] mb-2 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-black tracking-wider uppercase text-slate-700">
                      Payment Simulator
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    Mobile View
                  </span>
                </div>

                {/* Android Device Chassis - Compact Width */}
                <div className="w-full max-w-[340px] bg-[#1A1F2C] p-2 rounded-[42px] shadow-[0_20px_60px_rgba(11,15,25,0.4)] border-[5px] border-[#2A3142] relative">
                  
                  {/* Android Top Micro Speaker Slit */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#2D3748] rounded-full z-20" />

                  {/* Android Inner AMOLED Screen */}
                  <div className="w-full bg-[#0B0F19] rounded-[34px] overflow-hidden flex flex-col min-h-[640px]">
                    <MultiAppSimulator
                      balance={balance}
                      onExecutePayment={handleMultiAppPayment}
                      compact={true}
                    />
                  </div>
                </div>

              </div>

              {/* ======================================================== */}
              {/* VERTICAL SPLIT DIVIDER LINE WITH REALTIME SYNC BADGE */}
              {/* ======================================================== */}
              <div className="hidden lg:flex flex-col items-center justify-center self-stretch relative py-4 px-1">
                <div className="w-[2px] h-full min-h-[600px] bg-gradient-to-b from-orange-400 via-slate-300 to-emerald-400 rounded-full" />
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 bg-white border-2 border-slate-200 shadow-md py-2 px-1.5 rounded-2xl z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <div className="text-[9px] font-black text-slate-700 tracking-tighter uppercase [writing-mode:vertical-lr] rotate-180 py-1">
                    LIVE SYNC
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* ======================================================== */}
              {/* RIGHT BOARD: HAPPY POCKET DESKTOP SCREEN BOARD (EXPANDED WIDTH) */}
              {/* ======================================================== */}
              <div className="flex-1 w-full min-w-0 space-y-4">
                
                {/* Board Label */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black tracking-wider uppercase text-slate-700">
                      Happy Pocket Financial Intelligence
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    Desktop Screen Dashboard
                  </span>
                </div>

                {/* Desktop Monitor Style Chassis Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)] border border-slate-200/90 space-y-5">
                  
                  {/* Browser / Desktop Window Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                      </div>
                      <div className="ml-3 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-[11px] flex items-center gap-1.5 border border-slate-200/60">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>app.happypocket.in/dashboard/insights</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsAAModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition border border-emerald-200 shadow-xs cursor-pointer"
                        title="Connect bank accounts via RBI Account Aggregator"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connect via AA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                        title="Upload bank statement PDF"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Upload Statement</span>
                      </button>

                      <span className="h-4 w-px bg-slate-200 mx-1" />

                      <div className="flex items-center gap-1.5">
                        <HappyPocketLogo size={24} />
                        <span className="font-extrabold text-xs text-slate-900 tracking-tight hidden sm:inline">Happy Pocket Desktop</span>
                      </div>
                    </div>
                  </div>

                  {/* Problem Statement Header */}
                  <div className="bg-gradient-to-br from-[#0A172E] to-slate-900 rounded-[28px] p-5 sm:p-6 text-white shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                            Problem Statement Solution
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Zero-Distortion Financial Visibility Engine
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Problem Solved
                      </span>
                    </div>

                    {/* 3 Core Anti-Distortion KPI Highlights */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Raw Statement Outflows</span>
                        <div className="text-lg font-black font-mono text-white mt-1">
                          ₹{analysisResult ? analysisResult.kpis.rawOutflows.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
                        </div>
                        <span className="text-[10px] text-slate-400">Includes all noise</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-rose-300 block font-bold uppercase">Noise Deductions</span>
                        <div className="text-lg font-black font-mono text-rose-400 mt-1">
                          -₹{analysisResult ? (analysisResult.kpis.rawOutflows - analysisResult.kpis.trueLivingExpenses).toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
                        </div>
                        <span className="text-[10px] text-rose-300">Self-transfers & refunds</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-300 block font-bold uppercase">True Living Expenses</span>
                        <div className="text-lg font-black font-mono text-emerald-300 mt-1">
                          ₹{analysisResult ? analysisResult.kpis.trueLivingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">100% distortion-free</span>
                      </div>
                    </div>
                  </div>

                {/* SubTab Switcher for Problem Statement Solution */}
                <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.03)] overflow-x-auto">
                  {[
                    { id: 'insights', label: 'True Living Discovery' },
                    { id: 'raw_transactions', label: `Raw Statements / DB (${extractedRawTxs.length})` },
                    { id: 'ledger', label: `Normalized Ledger (${analysisResult ? analysisResult.enriched.length : transactions.length})` },
                    { id: 'expense_tracker', label: 'Expense Tracker' },
                    { id: 'smart_insights', label: 'Mandates & Better Swaps' },
                    { id: 'subscriptions', label: `AutoPay Mandates (${analysisResult ? analysisResult.subscriptions.length : 2})` },
                    { id: 'tax', label: 'Tax Deductions' },
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

                {/* Tab Pane 1: Expense Tracker */}
                {analyticsSubTab === ('expense_tracker' as any) && (
                  <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <ExpenseTrackerTab transactions={extractedRawTxs} />
                  </div>
                )}

                {/* Tab Pane 2: Smart Insights */}
                {analyticsSubTab === ('smart_insights' as any) && (
                  <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <InsightsTab transactions={extractedRawTxs} />
                  </div>
                )}

                {/* Tab Pane 3: Subscriptions Killer */}
                {analyticsSubTab === 'subscriptions' && (
                  <SubscriptionsTab
                    subscriptions={analysisResult?.subscriptions || []}
                    onCancelSubscription={handleCancelMandate}
                  />
                )}

                {/* Tab Pane 4: Tax Finder */}
                {analyticsSubTab === 'tax' && (
                  <TaxFinderTab />
                )}

                {/* Tab Pane 5: Normalized Ledger Table */}
                {analyticsSubTab === 'ledger' && (
                  <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Real Database Ledger Stream
                      </h4>
                      <select
                        value={selectedLedgerFilter}
                        onChange={e => setSelectedLedgerFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-2.5 py-1 text-slate-700 focus:outline-none"
                      >
                        <option value="all">All ({analysisResult ? analysisResult.enriched.length : transactions.length})</option>
                        <option value="recurring">Recurring Only</option>
                        <option value="transfer">Self-Transfers Only</option>
                        <option value="refund">Refunds Only</option>
                        <option value="split">Shared Splits Only</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Merchant</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-center">Engine Treatment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredLedger.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="py-2 px-3 max-w-[140px] truncate font-bold text-slate-900">
                                {tx.payeeName || tx.cleanMerchant}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className="font-medium text-slate-700">{tx.category}</span>
                              </td>
                              <td className={`py-2 px-3 text-right font-bold font-mono ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {tx.isInternalTransfer ? (
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                    Excluded (Self)
                                  </span>
                                ) : tx.isRecurring ? (
                                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                    Recurring Drain
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                    Clean Living
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Pane: Raw Statement Transactions Stream */}
                {analyticsSubTab === 'raw_transactions' && (
                  <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Raw Statement Stream (Unfiltered / Distortion Present)
                          </h4>
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full font-mono">
                            {extractedRawTxs.length} Raw Records
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          This is the un-sanitized log directly from the bank or live simulator. Notice how self-transfers and refund round-trips distort your perception of total spending.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Outflow</span>
                        <span className="text-sm font-black font-mono text-slate-900">
                          ₹{extractedRawTxs.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Raw Description / Payee</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3 text-right">Raw Amount</th>
                            <th className="py-2.5 px-3 text-center">Problem / Distortion Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {extractedRawTxs.map((tx) => {
                            const isDebit = tx.amount < 0;
                            const isTransfer = tx.isInternalTransfer || (tx.category === 'Internal Transfer');
                            const isRefund = tx.category === 'Reimbursement / Split' || !isDebit;
                            const isRecurring = tx.isRecurring;
                            return (
                              <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                  {new Date(tx.timestamp || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-2.5 px-3 max-w-[200px] truncate">
                                  <div className="font-bold text-slate-900">{tx.rawDescription || tx.payeeName || tx.cleanMerchant}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{tx.upiRrn || tx.id}</div>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    !isDebit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {isDebit ? 'DEBIT' : 'CREDIT'}
                                  </span>
                                </td>
                                <td className={`py-2.5 px-3 text-right font-black font-mono ${
                                  !isDebit ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                  {!isDebit ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {isTransfer ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                      ⚠️ Noise: Self-Transfer
                                    </span>
                                  ) : isRefund ? (
                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                                      🔄 Split / Offset
                                    </span>
                                  ) : isRecurring ? (
                                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                                      🔁 Hidden Recurring Drain
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                      Standard Expense
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Pane 6: Insights Default */}
                {analyticsSubTab === 'insights' && (
                  <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
                        <span className="text-[10px] font-bold text-orange-800 uppercase block">Monthly Recurring Drain</span>
                        <div className="text-xl font-bold font-mono text-orange-700 mt-0.5">
                          ₹{analysisResult ? analysisResult.kpis.monthlyRecurringCommitments.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'} /mo
                        </div>
                        <span className="text-[10px] text-orange-600">Fixed annual burden of ₹{analysisResult ? (analysisResult.kpis.monthlyRecurringCommitments * 12).toLocaleString('en-IN') : '0'}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">True Living Ratio</span>
                        <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                          {analysisResult && analysisResult.kpis.rawOutflows > 0 ? ((analysisResult.kpis.trueLivingExpenses / analysisResult.kpis.rawOutflows) * 100).toFixed(1) : '100.0'}%
                        </div>
                        <span className="text-[10px] text-emerald-600">100% clean living expenses</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900">Why Happy Pocket Solves Financial Fog:</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Traditional UPI apps (GPay, PhonePe) display transaction logs as raw streams where moving money between your own accounts or returning an e-commerce order appears as massive spending. <strong>Happy Pocket normalizes, dedupes, and isolates true living expenses</strong> with zero manual bookkeeping.
                      </p>
                    </div>
                  </div>
                )}

                </div>
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
