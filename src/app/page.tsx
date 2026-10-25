'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wifi, 
  CheckCircle2, 
  Menu,
  ChevronDown,
  Power,
  Volume2,
  VolumeX,
  Volume1,
  RotateCw,
  Camera,
  RefreshCw,
  Undo2,
  Circle,
  Square,
  QrCode,
  Send,
  BarChart3,
  Database,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  Sparkles,
  Maximize2,
  Landmark
} from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';
import AccountCard from '@/components/AccountCard';
import ActionButtons from '@/components/ActionButtons';
import AccountAggregatorModal from '@/components/AccountAggregatorModal';
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
import MerchantDashboard from '@/components/MerchantDashboard';
import AccountSwitcherModal, { UserRole } from '@/components/AccountSwitcherModal';
import StatementUploadModal from '@/components/StatementUploadModal';
import MyQrModal from '@/components/MyQrModal';
import AndroidDrawer from '@/components/AndroidDrawer';
import CategoryClassifierModal from '@/components/CategoryClassifierModal';
import { RawTransaction, Category } from '@/types/finance';
import { enrichAndAnalyzeTransactions, getCategoryIcon, getCategoryThemeLabel, saveUserMerchantOverride } from '@/lib/engine';

export default function HappyPocketApp() {
  const [balance, setBalance] = useState<number>(10000.00);
  const [primaryAccount, setPrimaryAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);
  const [dbCount, setDbCount] = useState<number>(0);
  
  // Financial engine state
  const [extractedRawTxs, setExtractedRawTxs] = useState<RawTransaction[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof enrichAndAnalyzeTransactions> | null>(null);

  // In-App Modals & Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAaOpen, setIsAaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('personal');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [classifierModalState, setClassifierModalState] = useState<{
    isOpen: boolean;
    merchantName: string;
    currentCategory?: string;
  }>({
    isOpen: false,
    merchantName: '',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Android Studio Emulator State
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [showVolumeHud, setShowVolumeHud] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [navStyle, setNavStyle] = useState<'buttons' | 'gesture'>('buttons');
  const [currentTime, setCurrentTime] = useState('09:41');
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Emulator Volume Trigger
  const handleVolumeChange = (delta: number) => {
    setVolumeLevel((prev) => {
      const next = Math.min(100, Math.max(0, prev + delta));
      setShowVolumeHud(true);
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = setTimeout(() => setShowVolumeHud(false), 2200);
      return next;
    });
  };

  // Emulator Screenshot Trigger
  const handleTakeScreenshot = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 350);
    showToast('📸 Screenshot saved to Android Studio /storage/emulated/0/Pictures');
  };

  // Emulator Restart App Trigger
  const handleRestartApp = () => {
    setIsPoweredOn(false);
    showToast('🔄 Restarting Happy Pocket Process (PID 14209)...');
    setTimeout(() => {
      setIsPoweredOn(true);
      loadFromDb();
    }, 600);
  };

  // Check login state and user role on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hp_logged_in');
      if (stored === 'false') {
        setIsLoggedIn(false);
      }
      const savedRole = localStorage.getItem('hp_user_role') as UserRole;
      if (savedRole && (savedRole === 'personal' || savedRole === 'medical' || savedRole === 'college')) {
        setCurrentUserRole(savedRole);
      }
    }
  }, []);

  // Fetch real data from MongoDB Atlas
  const loadFromDb = async () => {
    try {
      setIsDbLoading(true);

      // 1. Fetch Primary Bank Account from Core Banking Database
      try {
        const accRes = await fetch('/api/accounts');
        const accData = await accRes.json();
        if (accData.success && accData.primaryAccount) {
          setBalance(accData.primaryAccount.balance);
          setPrimaryAccount(accData.primaryAccount);
        }
      } catch (accErr) {
        console.warn('Accounts fetch fallback:', accErr);
      }

      // 2. Fetch Transactions Ledger
      const res = await fetch('/api/transactions');
      const data = await res.json();

      if (data.success && data.transactions && data.transactions.length > 0) {
        setDbCount(data.transactions.length);
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
          vpaHandle: t.vpaHandle,
          theme: t.theme,
          themeIcon: t.themeIcon,
          accountType: t.accountType || (t.isInternalTransfer ? 'Personal' : 'Merchant / Business'),
          isInternalTransfer: t.isInternalTransfer || false,
          isReimbursementOffset: t.isReimbursementOffset || false,
          isRecurringAutoPay: t.isRecurringAutoPay || false,
          isAmbiguous: t.isAmbiguous || false,
          needsReview: t.needsReview || false,
          confidenceScore: t.confidenceScore || 85,
          userOverridden: t.userOverridden || false,
          category: t.category,
        }));

        setExtractedRawTxs(rawList);
        const analyzed = enrichAndAnalyzeTransactions(rawList);
        setAnalysisResult(analyzed);

        const converted: DisplayTransaction[] = analyzed.enriched.map((item, idx) => ({
          id: item.id || `live_db_${idx}`,
          title: item.cleanMerchant || item.payeeName || item.rawDescription,
          rawTimeText: new Date(item.timestamp).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: item.timestamp,
          amount: item.amount,
          type: item.amount > 0 ? 'salary' : (item.category === 'Groceries' ? 'grocery' : item.category === 'Transport & Fuel' ? 'fuel' : item.isInternalTransfer ? 'transfer' : 'other'),
          accountType: item.accountType,
          theme: item.theme,
          themeIcon: item.themeIcon,
          vpaHandle: item.vpaHandle,
          payeeName: item.payeeName,
          category: item.category,
          isAmbiguous: item.isAmbiguous,
          needsReview: item.needsReview,
          confidenceScore: item.confidenceScore,
          userOverridden: item.userOverridden,
          isRecurringAutoPay: item.isRecurringAutoPay,
          isInternalTransfer: item.isInternalTransfer,
        }));

        if (converted.length > 0) {
          setTransactions(converted);
        }
      } else if (data.success && (!data.transactions || data.transactions.length === 0)) {
        setDbCount(0);
        setExtractedRawTxs([]);
        setAnalysisResult(null);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching database transactions:', err);
    } finally {
      setIsDbLoading(false);
    }
  };

  // Clear all transactions from MongoDB Atlas & restore bank balance
  const handleClearAllData = async () => {
    try {
      setIsDbLoading(true);
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_balance' }),
      });
      const res = await fetch('/api/transactions?all=true', { method: 'DELETE' });
      const data = await res.json();
      setBalance(10000.00);
      setDbCount(0);
      setExtractedRawTxs([]);
      setAnalysisResult(null);
      setTransactions([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hp_merchant_category_overrides');
      }
      showToast(`🗑️ Cleared transactions. Bank balance restored to ₹10,000.00`);
    } catch (err) {
      console.error('Failed to clear data:', err);
      showToast('Failed to clear database data');
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    loadFromDb();
  }, []);

  const handleLoginSuccess = (name?: string, role: UserRole = 'personal') => {
    setIsLoggedIn(true);
    setCurrentUserRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hp_logged_in', 'true');
      localStorage.setItem('hp_user_role', role);
    }
    loadFromDb();
    const roleLabels: Record<UserRole, string> = {
      personal: 'Kotresh C (Personal Banking)',
      medical: 'City Care Medicals (Merchant Portal)',
      college: 'St. Xavier College (Merchant Portal)',
    };
    showToast(`Logged in as ${roleLabels[role]}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hp_logged_in', 'false');
    }
    showToast('Logged out successfully');
  };

  const handleSwitchRole = (role: UserRole) => {
    setCurrentUserRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hp_user_role', role);
    }
    const roleLabels: Record<UserRole, string> = {
      personal: 'Personal Account',
      medical: 'City Care Medicals & Pharmacy',
      college: 'St. Xavier Engineering College',
    };
    showToast(`Switched to ${roleLabels[role]}`);
  };

  // Payment Success Handler
  const handlePaymentSuccess = (amount: number, merchant: string, txDoc?: any, newBal?: number) => {
    if (typeof newBal === 'number') {
      setBalance(newBal);
    } else {
      setBalance((prev) => Math.max(0, prev - amount));
    }
    const cat = txDoc?.category || 'Shopping & Discretionary';
    const txType = cat === 'Groceries' ? 'grocery' : cat === 'Transport & Fuel' ? 'fuel' : 'other';

    const newTx: DisplayTransaction = {
      id: txDoc?._id || txDoc?.id || `tx_${Date.now()}`,
      title: txDoc?.cleanMerchant || merchant,
      rawTimeText: 'Just now',
      timestamp: txDoc?.timestamp || new Date().toISOString(),
      amount: -amount,
      type: txType,
      accountType: 'Merchant / Business',
      theme: txDoc?.theme,
      themeIcon: txDoc?.themeIcon,
      vpaHandle: txDoc?.vpaHandle,
      payeeName: txDoc?.payeeName || merchant,
      category: cat,
    };
    setTransactions((prev) => [newTx, ...prev]);

    const rawEntry: RawTransaction = {
      id: newTx.id,
      accountId: txDoc?.accountId || '50100492817482',
      amount: -amount,
      rawDescription: txDoc?.rawDescription || `UPI/DR/${merchant}/PAYMENT`,
      currency: 'INR',
      timestamp: newTx.timestamp,
      txMode: 'UPI',
      upiRrn: txDoc?.upiRrn,
      payeeName: merchant,
      accountType: 'Merchant / Business',
      theme: txDoc?.theme,
      themeIcon: txDoc?.themeIcon,
      category: cat,
      isInternalTransfer: false,
      isReimbursementOffset: false,
      isRecurringAutoPay: false,
    };
    setExtractedRawTxs((prev) => {
      const updated = [rawEntry, ...prev];
      const analyzed = enrichAndAnalyzeTransactions(updated);
      setAnalysisResult(analyzed);
      return updated;
    });

    const themeMsg = txDoc?.theme ? ` [${txDoc.themeIcon || '🏷️'} ${cat}]` : '';
    showToast(`Paid ₹${amount.toLocaleString('en-IN')} to ${merchant}${themeMsg} • Settled via UPI!`);
  };

  // Send Money Handler
  const handleSendSuccess = (amount: number, recipient: string, txDoc?: any, newBal?: number) => {
    if (typeof newBal === 'number') {
      setBalance(newBal);
    } else {
      setBalance((prev) => Math.max(0, prev - amount));
    }
    const isSelf = txDoc?.isInternalTransfer || recipient.toLowerCase().includes('kotresh') || recipient.toLowerCase().includes('self');
    const cat = txDoc?.category || (isSelf ? 'Internal Transfer' : 'Reimbursement / Split');
    const newTx: DisplayTransaction = {
      id: txDoc?._id || txDoc?.id || `tx_${Date.now()}`,
      title: txDoc?.cleanMerchant || recipient,
      rawTimeText: 'Just now',
      timestamp: txDoc?.timestamp || new Date().toISOString(),
      amount: -amount,
      type: isSelf ? 'transfer' : 'other',
      accountType: 'Personal',
      theme: txDoc?.theme,
      themeIcon: txDoc?.themeIcon,
      vpaHandle: txDoc?.vpaHandle,
      payeeName: txDoc?.payeeName || recipient,
      category: cat,
    };
    setTransactions((prev) => [newTx, ...prev]);

    const rawEntry: RawTransaction = {
      id: newTx.id,
      accountId: txDoc?.accountId || '50100492817482',
      amount: -amount,
      rawDescription: txDoc?.rawDescription || `WDL TFR UPI/DR/TFR/${recipient}/UPI`,
      currency: 'INR',
      timestamp: newTx.timestamp,
      txMode: 'UPI',
      upiRrn: txDoc?.upiRrn,
      payeeName: recipient,
      accountType: 'Personal',
      theme: txDoc?.theme,
      themeIcon: txDoc?.themeIcon,
      category: cat,
      isInternalTransfer: isSelf,
      isReimbursementOffset: !isSelf,
      isRecurringAutoPay: false,
    };
    setExtractedRawTxs((prev) => {
      const updated = [rawEntry, ...prev];
      const analyzed = enrichAndAnalyzeTransactions(updated);
      setAnalysisResult(analyzed);
      return updated;
    });

    const themeMsg = txDoc?.theme ? ` [${txDoc.themeIcon || '👤'} ${cat}]` : '';
    showToast(`Sent ₹${amount.toLocaleString('en-IN')} to ${recipient}${themeMsg} • Settled via UPI!`);
  };

  // Statement Upload Handler
  const handleImportedTransactions = (imported: DisplayTransaction[], raw?: RawTransaction[]) => {
    setTransactions((prev) => [...imported, ...prev]);
    if (raw && raw.length > 0) {
      setExtractedRawTxs((prev) => [...raw, ...prev]);
      const analyzed = enrichAndAnalyzeTransactions([...raw, ...extractedRawTxs]);
      setAnalysisResult(analyzed);
    }
    showToast(`Categorized & saved ${imported.length} statement records to MongoDB Atlas!`);
  };

  // Quick Action triggers
  const handleScanPay = () => setIsScanOpen(true);
  const handleSendMoney = () => setIsSendOpen(true);
  const handleTransactionsClick = () => setActiveTab('history');

  const handleOpenClassifier = (merchantName: string, currentCategory?: string) => {
    setClassifierModalState({
      isOpen: true,
      merchantName,
      currentCategory,
    });
  };

  const handleSaveCategoryOverride = async (newCategory: Category, rememberForFuture: boolean) => {
    const targetMerchant = classifierModalState.merchantName;
    if (!targetMerchant) return;

    if (rememberForFuture) {
      saveUserMerchantOverride(targetMerchant, newCategory);
    }

    const newTheme = getCategoryThemeLabel(newCategory);
    const newIcon = getCategoryIcon(newCategory);

    // 1. Update in MongoDB Atlas
    try {
      const matchingTxs = transactions.filter(
        t => t.title.toLowerCase().includes(targetMerchant.toLowerCase()) || 
             (t.payeeName && t.payeeName.toLowerCase().includes(targetMerchant.toLowerCase()))
      );

      for (const tx of matchingTxs) {
        await fetch('/api/transactions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tx.id,
            category: newCategory,
            theme: newTheme,
            themeIcon: newIcon,
            isAmbiguous: false,
            needsReview: false,
            confidenceScore: 100,
            userOverridden: true,
          }),
        });
      }
    } catch (err) {
      console.error('Failed to update transactions in DB:', err);
    }

    // 2. Update local transactions state
    setTransactions(prev => prev.map(t => {
      const match = t.title.toLowerCase().includes(targetMerchant.toLowerCase()) || 
                    (t.payeeName && t.payeeName.toLowerCase().includes(targetMerchant.toLowerCase()));
      if (!match) return t;
      return {
        ...t,
        category: newCategory,
        theme: newTheme,
        themeIcon: newIcon,
        isAmbiguous: false,
        needsReview: false,
        userOverridden: true,
        confidenceScore: 100,
      };
    }));

    // 3. Update raw and re-run enrichment engine
    setExtractedRawTxs(prev => {
      const updated = prev.map(t => {
        const match = (t.payeeName && t.payeeName.toLowerCase().includes(targetMerchant.toLowerCase())) ||
                      t.rawDescription.toLowerCase().includes(targetMerchant.toLowerCase());
        if (!match) return t;
        return {
          ...t,
          category: newCategory,
          theme: newTheme,
          themeIcon: newIcon,
          isAmbiguous: false,
          needsReview: false,
          userOverridden: true,
          confidenceScore: 100,
        };
      });
      const analyzed = enrichAndAnalyzeTransactions(updated);
      setAnalysisResult(analyzed);
      return updated;
    });

    showToast(`"${targetMerchant}" categorized as ${newCategory}!`);
  };

  // Android System Navigation Buttons handler
  const handleAndroidBack = () => {
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
      return;
    }
    if (isScanOpen) {
      setIsScanOpen(false);
      return;
    }
    if (isSendOpen) {
      setIsSendOpen(false);
      return;
    }
    if (isUploadOpen) {
      setIsUploadOpen(false);
      return;
    }
    if (isQrOpen) {
      setIsQrOpen(false);
      return;
    }
    if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  const handleAndroidHome = () => {
    setIsDrawerOpen(false);
    setIsScanOpen(false);
    setIsSendOpen(false);
    setIsUploadOpen(false);
    setIsQrOpen(false);
    setActiveTab('home');
  };

  const handleAndroidRecents = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#18191C] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ======================================================== */}
      {/* 1. ANDROID STUDIO IDE TOP WORKSPACE HEADER BAR */}
      {/* ======================================================== */}
      <header className="w-full bg-[#1E1F22] border-b border-[#2B2D30] px-4 py-2 flex items-center justify-between text-xs text-slate-300 shrink-0 z-40 shadow-xs">
        
        {/* Left: Android Studio Branding & Device Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Green Android Icon */}
            <div className="w-6 h-6 rounded-md bg-[#3DDC84] flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <span className="text-[11px]">🤖</span>
            </div>
            <span className="font-extrabold text-white text-xs tracking-tight">
              Android Studio
            </span>
          </div>

          <span className="h-3.5 w-px bg-slate-700 hidden sm:inline" />

          {/* Running Device Tab */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#2B2D30] border border-[#3E4249] text-white">
            <Smartphone className="w-3.5 h-3.5 text-[#3DDC84]" />
            <span className="font-semibold text-[11px] truncate">
              Pixel 8 Pro • API 34 (Android 14)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Happy Pocket (Debug v2.4)
          </span>
        </div>

        {/* Right: Live Diagnostics & Emulator Toolbar Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* MongoDB Atlas Live Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="font-bold hidden sm:inline">Atlas DB:</span>
            <span>{dbCount > 0 ? `${dbCount} Txs` : 'Connected'}</span>
          </div>

          {/* Hot Reload / Refresh */}
          <button
            type="button"
            onClick={loadFromDb}
            title="Hot Reload Data from Atlas"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2B2D30] hover:bg-[#35383E] text-slate-200 transition cursor-pointer border border-[#3E4249]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isDbLoading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-bold hidden sm:inline">Sync DB</span>
          </button>

          {/* Navigation Mode Switcher: 3-Buttons vs Gesture */}
          <div className="flex items-center bg-[#2B2D30] rounded-md border border-[#3E4249] p-0.5">
            <button
              type="button"
              onClick={() => setNavStyle('buttons')}
              title="Android 3-Button Navigation (Back, Home, Overview)"
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                navStyle === 'buttons' ? 'bg-[#3E4249] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Button
            </button>
            <button
              type="button"
              onClick={() => setNavStyle('gesture')}
              title="Android Gesture Navigation Pill"
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                navStyle === 'gesture' ? 'bg-[#3E4249] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gesture
            </button>
          </div>

          {/* Quick Power Toggle */}
          <button
            type="button"
            onClick={() => setIsPoweredOn((prev) => !prev)}
            title={isPoweredOn ? 'Put Emulator in Standby' : 'Wake Emulator'}
            className={`p-1.5 rounded-md border transition cursor-pointer ${
              isPoweredOn 
                ? 'bg-[#2B2D30] hover:bg-red-950/60 text-slate-300 hover:text-red-400 border-[#3E4249]' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>

      </header>

      {/* ======================================================== */}
      {/* 2. EMULATOR WORKSPACE CANVAS (Android Studio Viewport) */}
      {/* ======================================================== */}
      <main className="flex-1 w-full bg-[radial-gradient(#26282E_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center p-2 sm:p-6 overflow-y-auto relative">
        
        {/* Floating Toast Notification inside Emulator view */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Emulator Container (Phone Frame + Floating Side Toolbar) */}
        <div className="relative flex items-center justify-center gap-4 max-w-full">
          
          {/* -------------------------------------------------------- */}
          {/* THE SMARTPHONE DEVICE (PIXEL 8 PRO HARDWARE BEZEL) */}
          {/* -------------------------------------------------------- */}
          <div className="relative w-[380px] sm:w-[412px] h-[840px] max-h-[92vh] bg-[#1E2024] rounded-[52px] p-[10px] shadow-[0_0_0_8px_#27292D,0_0_0_10px_#3E4249,0_30px_70px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-all duration-300 border border-slate-700/50">
            
            {/* Physical Hardware Buttons on Bezel */}
            {/* Left Volume Rocker */}
            <div className="absolute -left-[14px] top-32 w-[5px] h-20 bg-[#35383F] rounded-l-md border-l border-y border-[#4B4F58] flex flex-col justify-between py-1 shadow-md">
              <button
                type="button"
                onClick={() => handleVolumeChange(10)}
                title="Hardware Volume Up"
                className="w-full h-8 hover:bg-[#4B4F58] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleVolumeChange(-10)}
                title="Hardware Volume Down"
                className="w-full h-8 hover:bg-[#4B4F58] cursor-pointer"
              />
            </div>

            {/* Right Power Key */}
            <div className="absolute -right-[14px] top-28 w-[5px] h-14 bg-[#35383F] rounded-r-md border-r border-y border-[#4B4F58] shadow-md">
              <button
                type="button"
                onClick={() => setIsPoweredOn((prev) => !prev)}
                title="Hardware Power Button"
                className="w-full h-full hover:bg-[#4B4F58] cursor-pointer"
              />
            </div>

            {/* Speaker Ear Slit at Top Hardware Bezel */}
            <div className="w-20 h-1 bg-[#0F1012] rounded-full mx-auto mb-1 shrink-0 shadow-inner" />

            {/* -------------------------------------------------------- */}
            {/* SCREEN DISPLAY GLASS (ANDROID APPLICATION VIEWPORT) */}
            {/* -------------------------------------------------------- */}
            <div className="w-full flex-1 bg-[#EEF2F6] text-slate-900 rounded-[44px] overflow-hidden flex flex-col relative shadow-inner">
              
              {/* Screenshot Camera Flash Animation */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-flash" />
              )}

              {/* Volume HUD Toast Overlay */}
              {showVolumeHud && (
                <div className="absolute right-3 top-16 z-40 bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
                  {volumeLevel === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volumeLevel < 50 ? (
                    <Volume1 className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-150"
                      style={{ width: `${volumeLevel}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold">{volumeLevel}%</span>
                </div>
              )}

              {/* Standby / Screen Off Overlay */}
              {!isPoweredOn ? (
                <div 
                  onClick={() => setIsPoweredOn(true)}
                  className="absolute inset-0 z-40 bg-[#0B0D10] flex flex-col items-center justify-center p-6 text-center cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-slate-800/80 text-orange-400 mb-3 border border-slate-700 animate-pulse">
                    <Power className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-extrabold text-base tracking-tight">
                    Pixel 8 Pro Standby
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tap screen or press Power button to unlock
                  </p>
                  <span className="mt-4 text-[11px] font-mono text-slate-500">
                    Android 14 • Happy Pocket
                  </span>
                </div>
              ) : null}

              {/* AUTH SCREEN IF NOT LOGGED IN */}
              {!isLoggedIn ? (
                <div className="w-full h-full flex flex-col overflow-y-auto scrollbar-none">
                  {/* Status Bar */}
                  <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none shrink-0">
                    <span className="font-bold text-xs tracking-tight font-sans">{currentTime}</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 shadow-inner" />
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="text-[10px] font-bold">5G</span>
                      <Wifi className="w-3 h-3 stroke-[2.4]" />
                      <div className="w-4 h-2 rounded-[3px] border-[1.2px] border-slate-800 p-0.5 flex items-center">
                        <div className="w-full h-full bg-slate-800 rounded-[1px]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <AuthScreen onLoginSuccess={handleLoginSuccess} initialMode="login" initialRole={currentUserRole} />
                  </div>
                </div>
              ) : currentUserRole === 'medical' || currentUserRole === 'college' ? (
                /* ======================================================== */
                /* MERCHANT PORTAL: MEDICAL SHOP OR EDUCATION COLLEGE */
                /* "which should show only thr qr code and the recived money total money" */
                /* ======================================================== */
                <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50">
                  {/* Android Status Bar */}
                  <div className="w-full pt-2.5 pb-1 px-6 flex items-center justify-between text-slate-800 select-none shrink-0 bg-white z-20">
                    <span className="font-bold text-xs tracking-tight font-sans">{currentTime}</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 shadow-inner" />
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="text-[10px] font-extrabold tracking-wider">5G</span>
                      <Wifi className="w-3 h-3 stroke-[2.4]" />
                      <div className="w-4 h-2 rounded-[3px] border-[1.2px] border-slate-800 p-0.5 flex items-center">
                        <div className="w-[90%] h-full bg-slate-800 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Merchant View Showing Only QR Code & Total Received Money */}
                  <div className="flex-1 overflow-hidden">
                    <MerchantDashboard 
                      merchantType={currentUserRole} 
                      onSwitchAccount={() => setIsSwitcherOpen(true)} 
                      onLogout={handleLogout} 
                    />
                  </div>

                  {/* Android Bottom Navigation Gesture Bar (Tap to Switch Account) */}
                  <div className="w-full py-1.5 px-6 flex items-center justify-center shrink-0 bg-white border-t border-slate-100 z-20">
                    <div 
                      onClick={() => setIsSwitcherOpen(true)}
                      title="Tap to Switch Account"
                      className="w-32 h-1 bg-slate-800 rounded-full cursor-pointer hover:bg-slate-950 transition"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* ======================================================== */}
                  {/* 1. ANDROID 14 SYSTEM STATUS BAR */}
                  {/* ======================================================== */}
                  <div className="w-full pt-2.5 pb-1 px-6 flex items-center justify-between text-slate-800 select-none shrink-0 bg-transparent z-20">
                    {/* Left: Dynamic Clock */}
                    <span className="font-bold text-xs tracking-tight font-sans">
                      {currentTime}
                    </span>

                    {/* Center: Camera Punch-Hole Cutout */}
                    <div 
                      className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 shadow-inner" 
                      title="Android Front Camera"
                    />

                    {/* Right: Cellular 5G, Wi-Fi, Battery */}
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="text-[10px] font-extrabold tracking-wider">5G</span>
                      {/* Wi-Fi Icon */}
                      <Wifi className="w-3 h-3 stroke-[2.4]" />
                      {/* Battery 98% Icon */}
                      <div className="w-4 h-2 rounded-[3px] border-[1.2px] border-slate-800 p-0.5 flex items-center">
                        <div className="w-[90%] h-full bg-slate-800 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* 2. TOP MOBILE APP HEADER WITH CLEAR DROP-DOWN MENU ICON */}
                  {/* ======================================================== */}
                  <div className="px-4 pt-1.5 pb-2 flex items-center justify-between shrink-0 bg-transparent z-20">
                    
                    {/* Left: CLEAR DROP-DOWN MENU ICON (Hamburger button) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center gap-1.5 p-2 px-2.5 rounded-2xl bg-white shadow-xs border border-slate-200/90 hover:bg-slate-50 text-slate-800 active:scale-95 transition-all cursor-pointer group"
                        aria-label="Open Dropdown Menu"
                        title="Open Menu • All Functionalities"
                      >
                        <Menu className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-extrabold text-slate-700 hidden sm:inline">
                          Menu
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                      </button>

                      {/* Mascot Brand Logo */}
                      <div 
                        className="flex items-center cursor-pointer active:scale-95 transition-transform"
                        onClick={() => setActiveTab('home')}
                        title="Happy Pocket Home"
                      >
                        <HappyPocketLogo size={42} />
                      </div>
                    </div>

                    {/* Center: Dynamic Screen Title if not Home */}
                    {activeTab !== 'home' && (
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight capitalize truncate max-w-[130px]">
                        {activeTab === 'expense' ? 'Expenses' : activeTab === 'insights' ? 'Smart Insights' : activeTab}
                      </h2>
                    )}

                    {/* Right: Quick Action Buttons (QR Scanner & Profile Avatar) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsQrOpen(true)}
                        title="My Bharat QR"
                        className="p-2 rounded-2xl bg-white shadow-xs border border-slate-200/90 text-slate-700 hover:text-orange-500 transition cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <div 
                        onClick={() => setIsSwitcherOpen(true)}
                        title="Switch Bank Account (Personal, Medical Shop, College)"
                        className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer hover:ring-2 hover:ring-orange-400 transition bg-amber-100 flex items-center justify-center shrink-0"
                      >
                        <img
                          src="/avatar.jpg"
                          alt="Kotresh C"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                  </div>

                  {/* ======================================================== */}
                  {/* 3. SCROLLABLE SCREEN BODY VIEWPORT (ALL FUNCTIONALITIES) */}
                  {/* ======================================================== */}
                  <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-1.5 space-y-3.5 relative">
                    
                    {/* TAB 1: HOME DASHBOARD */}
                    {activeTab === 'home' && (
                      <>
                        {/* Account Card (Core Banking Balance & Masked number) */}
                        <AccountCard
                          bankName={primaryAccount?.bankName || 'HDFC Bank'}
                          accountName="Savings Account"
                          accountNumberMask={primaryAccount?.maskedAccountNumber || '•••• 7482'}
                          upiId={primaryAccount?.upiId || 'poornatejas@okhdfcbank'}
                          balance={balance}
                          onRefresh={loadFromDb}
                        />

                        {/* 3 Quick Action Buttons: Scan & Pay, Send Money, Transactions */}
                        <ActionButtons
                          onScanPayClick={handleScanPay}
                          onSendMoneyClick={handleSendMoney}
                          onTransactionsClick={handleTransactionsClick}
                        />

                        {/* Live RBI Account Aggregator Quick Connect Banner */}
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-sm border border-emerald-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                              <Landmark className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">Live RBI Account Aggregator</span>
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/30 text-emerald-300 rounded border border-emerald-400/30">ReBIT</span>
                              </div>
                              <p className="text-[10px] text-emerald-200/80">Consent-based live bank statements & real balances</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAaOpen(true)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-[11px] shadow transition cursor-pointer shrink-0"
                          >
                            Link Bank
                          </button>
                        </div>

                        {/* Quick Atlas Sync Chip */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-700">
                              Real-Time Ledger: {transactions.length} records
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('expense')}
                            className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                          >
                            Track Velocity →
                          </button>
                        </div>

                        {/* Recent Transactions List with Theme Badges */}
                        <RecentTransactions
                          transactions={transactions.slice(0, 4)}
                          onTransactionClick={() => setActiveTab('history')}
                          onViewAll={() => setActiveTab('history')}
                        />
                      </>
                    )}

                    {/* TAB 2: EXPENSE TRACKER & VELOCITY (PARTICULAR AMOUNTS) */}
                    {activeTab === 'expense' && (
                      <div className="pb-2">
                        <ExpenseTrackerTab 
                          transactions={transactions} 
                          rawTransactions={extractedRawTxs} 
                          onNavigateToAdvisor={() => setActiveTab('insights')}
                          onClassifyMerchant={handleOpenClassifier}
                        />
                      </div>
                    )}

                    {/* TAB 3: SMART INSIGHTS & AI WEALTH ADVISOR */}
                    {activeTab === 'insights' && (
                      <div className="pb-2">
                        <InsightsTab transactions={transactions} />
                      </div>
                    )}

                    {/* TAB 4: UPI BILL PAYMENTS & RECHARGES */}
                    {activeTab === 'payments' && (
                      <div className="pb-2">
                        <PaymentsTab
                          onScanClick={handleScanPay}
                          onSendClick={handleSendMoney}
                        />
                      </div>
                    )}

                    {/* TAB 5: TRANSACTIONS HISTORY & FILTER */}
                    {activeTab === 'history' && (
                      <div className="pb-2">
                        <HistoryTab
                          transactions={transactions}
                          onOpenUpload={() => setIsUploadOpen(true)}
                          onOpenAccountAggregator={() => setIsAaOpen(true)}
                          onClassifyMerchant={handleOpenClassifier}
                        />
                      </div>
                    )}

                    {/* TAB 6: ACCOUNT PROFILE & SECURITY */}
                    {activeTab === 'profile' && (
                      <div className="pb-2">
                        <ProfileTab 
                          onShowQR={() => setIsQrOpen(true)} 
                          onLogout={handleLogout}
                          onClearData={handleClearAllData}
                        />
                      </div>
                    )}

                  </div>

                  {/* ======================================================== */}
                  {/* 4. FIXED BOTTOM NAVIGATION BAR */}
                  {/* ======================================================== */}
                  <div className="shrink-0 bg-transparent z-20">
                    <BottomNav
                      activeTab={activeTab}
                      onChangeTab={(t) => setActiveTab(t)}
                    />
                  </div>

                  {/* ======================================================== */}
                  {/* 5. ANDROID SYSTEM NAVIGATION (3-BUTTON OR GESTURE PILL) */}
                  {/* ======================================================== */}
                  <div className="w-full py-1.5 px-6 flex items-center justify-center shrink-0 bg-white/95 border-t border-slate-100 z-20">
                    {navStyle === 'buttons' ? (
                      /* Android 3-Button Navigation (Back, Home, Overview) */
                      <div className="w-full flex items-center justify-around text-slate-600">
                        {/* Back Button (◁) */}
                        <button
                          type="button"
                          onClick={handleAndroidBack}
                          title="Android Back Button"
                          className="p-1 hover:text-slate-900 active:scale-90 transition cursor-pointer"
                        >
                          <Undo2 className="w-4 h-4 stroke-[2.2]" />
                        </button>

                        {/* Home Button (○) */}
                        <button
                          type="button"
                          onClick={handleAndroidHome}
                          title="Android Home Button"
                          className="p-1 hover:text-slate-900 active:scale-90 transition cursor-pointer"
                        >
                          <Circle className="w-4 h-4 stroke-[2.4]" />
                        </button>

                        {/* Overview / Recents Button (▢) -> Opens Drawer */}
                        <button
                          type="button"
                          onClick={handleAndroidRecents}
                          title="Android Recents / Menu Drawer Button"
                          className="p-1 hover:text-slate-900 active:scale-90 transition cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 stroke-[2.4]" />
                        </button>
                      </div>
                    ) : (
                      /* Android Gesture Navigation Pill */
                      <div 
                        onClick={handleAndroidHome}
                        title="Android Gesture Bar (Tap for Home)"
                        className="w-32 h-1 bg-slate-800 rounded-full cursor-pointer hover:bg-slate-950 transition"
                      />
                    )}
                  </div>

                  {/* ======================================================== */}
                  {/* 6. ANDROID NAVIGATION DRAWER (DROPDOWN MENU) */}
                  {/* ======================================================== */}
                  <AndroidDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    activeTab={activeTab}
                    onSelectTab={(t) => setActiveTab(t)}
                    onOpenScanPay={() => setIsScanOpen(true)}
                    onOpenSendMoney={() => setIsSendOpen(true)}
                    onOpenUploadStatement={() => setIsUploadOpen(true)}
                    onOpenAccountAggregator={() => setIsAaOpen(true)}
                    onOpenAccountSwitcher={() => setIsSwitcherOpen(true)}
                    onOpenMyQr={() => setIsQrOpen(true)}
                    onRefreshData={loadFromDb}
                    onLogout={handleLogout}
                    balance={balance}
                  />

                </>
              )}

            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* FLOATING ANDROID STUDIO EMULATOR TOOLBAR (SIDE DOCK) */}
          {/* -------------------------------------------------------- */}
          <aside 
            aria-label="Android Studio Controls"
            className="hidden md:flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-[#26282E] border border-[#3E4249] shadow-xl text-slate-400 self-center"
          >
            {/* Power Button */}
            <button
              type="button"
              onClick={() => setIsPoweredOn((prev) => !prev)}
              title={isPoweredOn ? 'Power Standby' : 'Power On'}
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Power className="w-4 h-4" />
            </button>

            {/* Volume Up */}
            <button
              type="button"
              onClick={() => handleVolumeChange(10)}
              title="Volume Up (+)"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Volume Down */}
            <button
              type="button"
              onClick={() => handleVolumeChange(-10)}
              title="Volume Down (-)"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Volume1 className="w-4 h-4" />
            </button>

            <span className="w-4 h-px bg-slate-700 my-0.5" />

            {/* Take Screenshot */}
            <button
              type="button"
              onClick={handleTakeScreenshot}
              title="Take Emulator Screenshot"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Restart Process */}
            <button
              type="button"
              onClick={handleRestartApp}
              title="Restart Application Process"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <span className="w-4 h-px bg-slate-700 my-0.5" />

            {/* Back (◁) */}
            <button
              type="button"
              onClick={handleAndroidBack}
              title="Back"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* Home (○) */}
            <button
              type="button"
              onClick={handleAndroidHome}
              title="Home"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Circle className="w-4 h-4" />
            </button>

            {/* Recents / Menu (▢) */}
            <button
              type="button"
              onClick={handleAndroidRecents}
              title="Overview / Dropdown Menu"
              className="p-2 rounded-xl hover:bg-[#35383E] hover:text-white transition cursor-pointer"
            >
              <Square className="w-4 h-4" />
            </button>
          </aside>

        </div>

      </main>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE MODALS (SCAN & PAY, SEND, STATEMENT, QR) */}
      {/* ======================================================== */}
      <ScanPayModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        balance={balance}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        balance={balance}
        onSendSuccess={handleSendSuccess}
      />

      <StatementUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportTransactions={handleImportedTransactions}
      />

      <AccountAggregatorModal
        isOpen={isAaOpen}
        onClose={() => setIsAaOpen(false)}
        onSuccess={async (newBalance, count) => {
          await loadFromDb();
          showToast(`🏛️ Linked Bank via RBI Account Aggregator! Synced ${count} verified records.`);
        }}
      />

      <MyQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />

      <CategoryClassifierModal
        isOpen={classifierModalState.isOpen}
        onClose={() => setClassifierModalState(prev => ({ ...prev, isOpen: false }))}
        merchantName={classifierModalState.merchantName}
        currentCategory={classifierModalState.currentCategory}
        onSaveCategory={handleSaveCategoryOverride}
      />

      <AccountSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentRole={currentUserRole}
        onSelectRole={handleSwitchRole}
        onLogout={handleLogout}
        personalBalance={balance}
      />

    </div>
  );
}
