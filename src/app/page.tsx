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
  Landmark,
  Monitor,
  LayoutDashboard,
  History,
  User,
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  Plus,
  FileUp
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
import EditTransactionModal from '@/components/EditTransactionModal';
import { RawTransaction, Category } from '@/types/finance';
import { 
  enrichAndAnalyzeTransactions, 
  getCategoryIcon, 
  getCategoryThemeLabel, 
  saveUserMerchantOverride,
  detectUnnecessaryExpenditure 
} from '@/lib/engine';

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
  const [editingTransaction, setEditingTransaction] = useState<DisplayTransaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View Mode: 'web' (Professional Web Portal) vs 'mobile' (Phone Preview Frame)
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');

  // Computed Financial Metrics for Professional Web UI
  const unclassifiedCount = useMemo(() => {
    return transactions.filter(t => t.needsReview || t.isAmbiguous || t.category === 'Other / Unknown').length;
  }, [transactions]);

  const totalInflow = useMemo(() => {
    return transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalOutflow = useMemo(() => {
    return transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const trueLivingSpend = useMemo(() => {
    if (analysisResult?.kpis?.trueLivingExpenses !== undefined) {
      return analysisResult.kpis.trueLivingExpenses;
    }
    return totalOutflow;
  }, [analysisResult, totalOutflow]);

  const netSavingsCapacity = useMemo(() => {
    return Math.max(0, totalInflow - trueLivingSpend);
  }, [totalInflow, trueLivingSpend]);

  const unnecessarySpendTotal = useMemo(() => {
    return analysisResult?.kpis?.unnecessaryExpenditureTotal ?? 
      transactions.filter(t => t.isUnnecessary && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [analysisResult, transactions]);

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
          isUnnecessary: t.isUnnecessary !== undefined ? t.isUnnecessary : undefined,
          unnecessaryReason: t.unnecessaryReason,
          spendNature: t.spendNature,
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
          rawDescription: item.rawDescription,
          upiRrn: item.upiRrn,
          remark: (item as any).remark,
          isUnnecessary: item.isUnnecessary,
          unnecessaryReason: item.unnecessaryReason,
          spendNature: item.spendNature,
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

    const unnecessaryInfo = detectUnnecessaryExpenditure({
      amount: -amount,
      category: cat,
      cleanMerchant: merchant,
      payeeName: merchant,
      rawDescription: txDoc?.rawDescription || `UPI/DR/${merchant}/PAYMENT`,
      timestamp: txDoc?.timestamp || new Date().toISOString(),
      isUnnecessary: txDoc?.isUnnecessary,
      unnecessaryReason: txDoc?.unnecessaryReason,
    });

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
      isUnnecessary: unnecessaryInfo.isUnnecessary,
      unnecessaryReason: unnecessaryInfo.unnecessaryReason,
      spendNature: unnecessaryInfo.spendNature,
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
      isUnnecessary: unnecessaryInfo.isUnnecessary,
      unnecessaryReason: unnecessaryInfo.unnecessaryReason,
      spendNature: unnecessaryInfo.spendNature,
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

  // Open Edit Transaction Modal (for unclassified, P2P, or classified transactions)
  const handleOpenEditTransaction = (tx: DisplayTransaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  // Save changes to edited transaction (MongoDB Atlas + local state + classifier memory)
  const handleSaveTransactionEdit = async (updatedData: {
    id: string;
    title: string;
    category: Category;
    accountType: 'Merchant / Business' | 'Personal';
    theme: string;
    themeIcon: string;
    remark?: string;
    rememberForFuture: boolean;
    isUnnecessary?: boolean;
    unnecessaryReason?: string;
  }) => {
    // 1. Remember future rule if checked
    if (updatedData.rememberForFuture && updatedData.title) {
      saveUserMerchantOverride(updatedData.title, updatedData.category);
    }

    // 2. Persist update in MongoDB Atlas
    try {
      await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedData.id,
          cleanMerchant: updatedData.title,
          payeeName: updatedData.title,
          category: updatedData.category,
          accountType: updatedData.accountType,
          theme: updatedData.theme,
          themeIcon: updatedData.themeIcon,
          remark: updatedData.remark,
          isAmbiguous: false,
          needsReview: false,
          confidenceScore: 100,
          userOverridden: true,
          isUnnecessary: updatedData.isUnnecessary || false,
          unnecessaryReason: updatedData.unnecessaryReason || '',
          spendNature: updatedData.isUnnecessary ? 'Unnecessary_Leakage' : 'Need',
        }),
      });
    } catch (err) {
      console.error('Failed to update transaction in MongoDB Atlas:', err);
    }

    // 3. Update local display transactions state
    setTransactions(prev => prev.map(t => {
      if (t.id !== updatedData.id) return t;
      return {
        ...t,
        title: updatedData.title,
        payeeName: updatedData.title,
        category: updatedData.category,
        accountType: updatedData.accountType,
        theme: updatedData.theme,
        themeIcon: updatedData.themeIcon,
        remark: updatedData.remark,
        isAmbiguous: false,
        needsReview: false,
        confidenceScore: 100,
        userOverridden: true,
        isUnnecessary: updatedData.isUnnecessary || false,
        unnecessaryReason: updatedData.unnecessaryReason || '',
        spendNature: (updatedData.isUnnecessary ? 'Unnecessary_Leakage' : 'Need') as 'Need' | 'Want' | 'Unnecessary_Leakage',
        type: t.amount > 0 ? 'salary' : (updatedData.category === 'Groceries' ? 'grocery' : updatedData.category === 'Transport & Fuel' ? 'fuel' : updatedData.accountType === 'Personal' ? 'transfer' : 'other'),
      };
    }));

    // 4. Update raw transactions state & re-run financial intelligence engine
    setExtractedRawTxs(prev => {
      const updated: RawTransaction[] = prev.map(t => {
        if (t.id !== updatedData.id) return t;
        return {
          ...t,
          payeeName: updatedData.title,
          category: updatedData.category,
          accountType: updatedData.accountType,
          theme: updatedData.theme,
          themeIcon: updatedData.themeIcon,
          remark: updatedData.remark,
          isAmbiguous: false,
          needsReview: false,
          confidenceScore: 100,
          userOverridden: true,
          isUnnecessary: updatedData.isUnnecessary || false,
          unnecessaryReason: updatedData.unnecessaryReason || '',
          spendNature: (updatedData.isUnnecessary ? 'Unnecessary_Leakage' : 'Need') as 'Need' | 'Want' | 'Unnecessary_Leakage',
        };
      });
      const analyzed = enrichAndAnalyzeTransactions(updated);
      setAnalysisResult(analyzed);
      return updated;
    });

    setIsEditModalOpen(false);
    setEditingTransaction(null);
    const unnecMsg = updatedData.isUnnecessary ? ' • Tagged as Unnecessary Leakage 🚨' : '';
    showToast(`Updated "${updatedData.title}" to [${updatedData.themeIcon} ${updatedData.category}]${unnecMsg}!`);
  };

  // Delete transaction from MongoDB Atlas and local state
  const handleDeleteTransaction = async (id: string) => {
    try {
      await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    setExtractedRawTxs(prev => {
      const updated = prev.filter(t => t.id !== id);
      const analyzed = enrichAndAnalyzeTransactions(updated);
      setAnalysisResult(analyzed);
      return updated;
    });
    setDbCount(prev => Math.max(0, prev - 1));

    setIsEditModalOpen(false);
    setEditingTransaction(null);
    showToast('Transaction deleted successfully.');
  };

  // Seed curated meaningful sample data into MongoDB Atlas
  const handleSeedSampleData = async () => {
    try {
      setIsDbLoading(true);
      showToast('🌱 Loading meaningful sample data...');
      const res = await fetch('/api/seed-sample', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadFromDb();
        showToast('🌱 Loaded 15 realistic Indian UPI & Banking records! Balance: ₹34,432.00');
      } else {
        showToast(data.error || 'Failed to seed sample data');
      }
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Failed to seed sample data');
    } finally {
      setIsDbLoading(false);
    }
  };

  // Android System Navigation Buttons handler
  const handleAndroidBack = () => {
    if (isEditModalOpen) {
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      return;
    }
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
    setIsEditModalOpen(false);
    setEditingTransaction(null);
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none antialiased overflow-x-hidden">
      
      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: PROFESSIONAL FINTECH WEB UI (DEFAULT) */}
      {/* ======================================================== */}
      {viewMode === 'web' ? (
        <div className="flex-1 flex w-full h-screen overflow-hidden">
          
          {/* 1. LEFT SIDEBAR NAVIGATION */}
          <aside className="w-64 bg-white border-r border-slate-200/80 hidden md:flex flex-col justify-between shrink-0 shadow-[1px_0_12px_rgba(15,23,42,0.02)] z-30">
            <div className="p-5 flex flex-col gap-5">
              {/* Brand Logo & Tagline */}
              <div 
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-3 cursor-pointer group"
                title="Happy Pocket • Home"
              >
                <div className="group-hover:scale-105 transition-transform">
                  <HappyPocketLogo size={36} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-sm tracking-tight">Happy Pocket</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-orange-100 text-orange-700 border border-orange-200">
                      FinLens
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Financial Intelligence</p>
                </div>
              </div>

              {/* Active Account Switcher Card */}
              <div
                onClick={() => setIsSwitcherOpen(true)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition cursor-pointer group"
                title="Switch Account Role (Personal, Medical Shop, College)"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-400 shrink-0 bg-amber-100 flex items-center justify-center">
                      <img src="/avatar.jpg" alt="Kotresh C" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {currentUserRole === 'medical' ? 'Medical Shop' : currentUserRole === 'college' ? 'College Account' : 'Kotresh C'}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {currentUserRole === 'personal' ? 'HDFC •••• 0283' : 'Merchant Portal'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                </div>
              </div>

              {/* Navigation Menu Items */}
              <nav className="space-y-1">
                {[
                  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'expense', label: 'Expense Velocity', icon: BarChart3, badge: 'Live' },
                  { id: 'insights', label: 'Smart Insights', icon: Sparkles },
                  { id: 'history', label: 'Transaction Ledger', icon: History, badge: unclassifiedCount > 0 ? `⚠️ ${unclassifiedCount}` : undefined },
                  { id: 'payments', label: 'UPI Bill Payments', icon: CreditCard },
                  { id: 'profile', label: 'Account & Security', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as NavTab)}
                      className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Bottom Footer */}
            <div className="p-4 border-t border-slate-200/80 space-y-2 bg-slate-50/50">
              {/* Atlas DB Live Status Badge */}
              <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                <div className="flex items-center gap-1.5 font-mono text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">Atlas:</span>
                  <span>{dbCount} Records</span>
                </div>
                <button
                  type="button"
                  onClick={loadFromDb}
                  className="text-slate-400 hover:text-cyan-600 transition cursor-pointer p-0.5"
                  title="Sync Atlas DB"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Load Sample Data Button */}
              <button
                type="button"
                onClick={handleSeedSampleData}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-bold border border-emerald-200/80 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </aside>

          {/* 2. MAIN APPLICATION WORKSPACE */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* Top Header Bar */}
            <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Hamburger Menu Toggle */}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Menu className="w-5 h-5 text-orange-500" />
                </button>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight capitalize truncate">
                    {activeTab === 'home' ? 'Financial Dashboard' : activeTab === 'expense' ? 'Expense Velocity & Anti-Distortion' : activeTab === 'insights' ? 'Smart Insights & Advisory' : activeTab === 'history' ? 'Transaction Ledger' : activeTab === 'payments' ? 'UPI Payments & Bills' : 'Account Profile'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate">
                    Indian Core Banking & UPI Intelligence • Real-Time Ledger
                  </p>
                </div>
              </div>

              {/* Right Action Tools */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* View Mode Toggle (Web Portal vs Phone Preview Frame) */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('web')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer bg-white text-slate-900 shadow-2xs"
                  >
                    <Monitor className="w-3.5 h-3.5 text-orange-500" />
                    <span className="hidden lg:inline">Web Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer text-slate-500 hover:text-slate-800"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden lg:inline">Phone Frame</span>
                  </button>
                </div>

                {/* Primary Action: Scan & Pay */}
                <button
                  type="button"
                  onClick={handleScanPay}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan & Pay</span>
                </button>

                {/* Send Money Button */}
                <button
                  type="button"
                  onClick={handleSendMoney}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                  <span>Send</span>
                </button>

                {/* RBI Bank Link */}
                <button
                  type="button"
                  onClick={() => setIsAaOpen(true)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Bank</span>
                </button>

                {/* QR Receive Quick Button */}
                <button
                  type="button"
                  onClick={() => setIsQrOpen(true)}
                  title="Show My Bharat QR"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition cursor-pointer border border-slate-200"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Scrollable Main Workspace Body */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
              {!isLoggedIn ? (
                <div className="max-w-md mx-auto pt-8">
                  <AuthScreen onLoginSuccess={handleLoginSuccess} initialMode="login" initialRole={currentUserRole} />
                </div>
              ) : currentUserRole === 'medical' || currentUserRole === 'college' ? (
                <div className="max-w-5xl mx-auto">
                  <MerchantDashboard 
                    merchantType={currentUserRole} 
                    onSwitchAccount={() => setIsSwitcherOpen(true)} 
                    onLogout={handleLogout} 
                  />
                </div>
              ) : activeTab === 'home' ? (
                <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
                  
                  {/* 4 TOP HIGH-IMPACT FINANCIAL KPI CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Core Banking Account Balance */}
                    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Available Core Balance</span>
                        <button type="button" onClick={loadFromDb} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                          <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <div className="my-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                          ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                        <span>{primaryAccount?.bankName || 'HDFC Bank'} •••• 0283</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>

                    {/* 2. Total Living Spend */}
                    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Total Living Spend</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Anti-Distortion Net
                        </span>
                      </div>
                      <div className="my-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                          ₹{trueLivingSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Net outflows this month</span>
                        <span className="font-semibold text-slate-700">{transactions.filter(t => t.amount < 0).length} Debits</span>
                      </div>
                    </div>

                    {/* 3. Net Savings Capacity */}
                    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Net Savings Capacity</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          +₹{totalInflow.toLocaleString('en-IN')} Inflow
                        </span>
                      </div>
                      <div className="my-2">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-sans">
                          +₹{netSavingsCapacity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Income minus Living spend</span>
                        <span className="font-bold text-emerald-600">
                          {totalInflow > 0 ? `${Math.round((netSavingsCapacity / totalInflow) * 100)}% Rate` : '0%'}
                        </span>
                      </div>
                    </div>

                    {/* 4. Avoidable Wealth Leakage */}
                    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <span>🚨</span>
                          <span>Avoidable Leakage</span>
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Impulse & Fast Fashion
                        </span>
                      </div>
                      <div className="my-2">
                        <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-sans">
                          ₹{unnecessarySpendTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="truncate">5-Yr SIP: ₹{(analysisResult?.kpis?.unnecessarySIPProjection5Yr || 260820).toLocaleString('en-IN')}</span>
                        <button 
                          type="button"
                          onClick={() => setActiveTab('expense')}
                          className="font-bold text-orange-600 hover:underline cursor-pointer text-[10px]"
                        >
                          Track →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TWO-COLUMN GRID: FULL TRANSACTIONS (65%) & SERVICES SIDEBAR (35%) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left (Col-Span-2): Full-featured Recent Transactions */}
                    <div className="lg:col-span-2">
                      <RecentTransactions
                        transactions={transactions}
                        onTransactionClick={handleOpenEditTransaction}
                        onViewAll={() => setActiveTab('history')}
                      />
                    </div>

                    {/* Right (Col-Span-1): Side Services Cards */}
                    <div className="space-y-4">
                      {/* Quick Payment Tools */}
                      <div className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Financial Actions</h3>
                        
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={handleScanPay}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-50/60 hover:bg-orange-100/70 border border-orange-200/80 transition cursor-pointer text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <QrCode className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block group-hover:text-orange-600 transition-colors">Scan & Pay UPI QR</span>
                                <span className="text-[10px] text-slate-500">Instant camera & merchant settlement</span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            type="button"
                            onClick={handleSendMoney}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Send className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">Send Money (P2P)</span>
                                <span className="text-[10px] text-slate-500">Transfers to friends & contacts</span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <FileUp className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">Import Bank Statement</span>
                                <span className="text-[10px] text-slate-500">PDF & CSV Parser with auto-categorization</span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Live RBI Account Aggregator Card */}
                      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-[26px] p-5 shadow-sm border border-emerald-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                              <Landmark className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs font-bold text-white">RBI Account Aggregator</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                            ReBIT
                          </span>
                        </div>

                        <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                          Link external savings accounts via RBI consent for real-time live statements, auto-reconciliation, and zero manual entry.
                        </p>

                        <button
                          type="button"
                          onClick={() => setIsAaOpen(true)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Connect Bank via OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* My Bharat QR Preview Card */}
                      <div className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.04)] flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Receive via UPI</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">kotresh@okhdfcbank</p>
                          <button
                            type="button"
                            onClick={() => setIsQrOpen(true)}
                            className="mt-2 text-[11px] font-bold text-orange-600 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>Display QR Code</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div 
                          onClick={() => setIsQrOpen(true)}
                          className="w-14 h-14 p-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:border-orange-400 transition"
                        >
                          <QrCode className="w-9 h-9 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : activeTab === 'expense' ? (
                <div className="max-w-6xl mx-auto pb-8">
                  <ExpenseTrackerTab 
                    transactions={transactions} 
                    rawTransactions={extractedRawTxs} 
                    onNavigateToAdvisor={() => setActiveTab('insights')}
                    onClassifyMerchant={handleOpenClassifier}
                    onEditTransaction={handleOpenEditTransaction}
                  />
                </div>
              ) : activeTab === 'insights' ? (
                <div className="max-w-6xl mx-auto pb-8">
                  <InsightsTab transactions={transactions} />
                </div>
              ) : activeTab === 'history' ? (
                <div className="max-w-6xl mx-auto pb-8">
                  <HistoryTab
                    transactions={transactions}
                    onOpenUpload={() => setIsUploadOpen(true)}
                    onOpenAccountAggregator={() => setIsAaOpen(true)}
                    onClassifyMerchant={handleOpenClassifier}
                    onEditTransaction={handleOpenEditTransaction}
                  />
                </div>
              ) : activeTab === 'payments' ? (
                <div className="max-w-6xl mx-auto pb-8">
                  <PaymentsTab
                    onScanClick={handleScanPay}
                    onSendClick={handleSendMoney}
                  />
                </div>
              ) : (
                <div className="max-w-4xl mx-auto pb-8">
                  <ProfileTab 
                    onShowQR={() => setIsQrOpen(true)} 
                    onLogout={handleLogout}
                    onClearData={handleClearAllData}
                    onSeedSampleData={handleSeedSampleData}
                  />
                </div>
              )}
            </main>
          </div>

        </div>
      ) : (
        /* ======================================================== */
        /* MODE 2: SMARTPHONE PREVIEW FRAME */
        /* ======================================================== */
        <div className="min-h-screen bg-[#18191C] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
          
          {/* Top Frame Workspace Header */}
          <header className="w-full bg-[#181A1F] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 shrink-0 z-40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <HappyPocketLogo size={28} />
                <span className="font-extrabold text-white text-xs tracking-tight">Happy Pocket</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Phone Preview
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Switch back to Web Portal */}
              <button
                type="button"
                onClick={() => setViewMode('web')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Open Web Portal</span>
              </button>

              <button
                type="button"
                onClick={handleSeedSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Sample Data</span>
              </button>
            </div>
          </header>

          {/* Centered Phone Canvas */}
          <main className="flex-1 w-full bg-[radial-gradient(#26282E_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center p-2 sm:p-6 overflow-y-auto relative">
            <div className="relative flex items-center justify-center max-w-full">
              <div className="relative w-[380px] sm:w-[412px] h-[840px] max-h-[92vh] bg-[#1A1C20] rounded-[48px] p-[9px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col justify-between transition-all duration-300">
                <div className="w-16 h-1 bg-[#0D0E10] rounded-full mx-auto mb-1 shrink-0 shadow-inner" />

                <div className="w-full flex-1 bg-[#EEF2F6] text-slate-900 rounded-[44px] overflow-hidden flex flex-col relative shadow-inner">
                  {!isLoggedIn ? (
                    <div className="w-full h-full flex flex-col overflow-y-auto scrollbar-none">
                      <div className="flex-1">
                        <AuthScreen onLoginSuccess={handleLoginSuccess} initialMode="login" initialRole={currentUserRole} />
                      </div>
                    </div>
                  ) : currentUserRole === 'medical' || currentUserRole === 'college' ? (
                    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50">
                      <div className="flex-1 overflow-hidden">
                        <MerchantDashboard 
                          merchantType={currentUserRole} 
                          onSwitchAccount={() => setIsSwitcherOpen(true)} 
                          onLogout={handleLogout} 
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Mobile App Header */}
                      <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0 bg-transparent z-20">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex items-center gap-1.5 p-2 px-2.5 rounded-2xl bg-white shadow-xs border border-slate-200/90 hover:bg-slate-50 text-slate-800 cursor-pointer"
                          >
                            <Menu className="w-4 h-4 text-orange-500" />
                            <span className="text-[11px] font-extrabold text-slate-700">Menu</span>
                          </button>
                          <HappyPocketLogo size={36} />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsQrOpen(true)}
                            className="p-2 rounded-2xl bg-white shadow-xs border border-slate-200/90 text-slate-700 hover:text-orange-500 cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <div 
                            onClick={() => setIsSwitcherOpen(true)}
                            className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer bg-amber-100 flex items-center justify-center shrink-0"
                          >
                            <img src="/avatar.jpg" alt="Kotresh C" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Scrollable Viewport */}
                      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-1.5 space-y-3.5 relative">
                        {activeTab === 'home' && (
                          <>
                            <AccountCard
                              bankName={primaryAccount?.bankName || 'HDFC Bank'}
                              accountName="Savings Account"
                              accountNumberMask={primaryAccount?.maskedAccountNumber || '•••• 7482'}
                              upiId={primaryAccount?.upiId || 'poornatejas@okhdfcbank'}
                              balance={balance}
                              onRefresh={loadFromDb}
                            />
                            <ActionButtons
                              onScanPayClick={handleScanPay}
                              onSendMoneyClick={handleSendMoney}
                              onTransactionsClick={handleTransactionsClick}
                            />
                            <button
                              type="button"
                              onClick={() => setIsAaOpen(true)}
                              className="w-full py-2 px-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/20 text-white flex items-center justify-between transition cursor-pointer group shadow-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                  <Landmark className="w-3 h-3" />
                                </div>
                                <span className="text-[11px] font-bold text-emerald-200">
                                  RBI Account Aggregator • Live Bank Consent
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400">Connect →</span>
                            </button>
                            <RecentTransactions
                              transactions={transactions.slice(0, 5)}
                              onTransactionClick={handleOpenEditTransaction}
                              onViewAll={() => setActiveTab('history')}
                            />
                          </>
                        )}
                        {activeTab === 'expense' && (
                          <div className="pb-2">
                            <ExpenseTrackerTab 
                              transactions={transactions} 
                              rawTransactions={extractedRawTxs} 
                              onNavigateToAdvisor={() => setActiveTab('insights')}
                              onClassifyMerchant={handleOpenClassifier}
                              onEditTransaction={handleOpenEditTransaction}
                            />
                          </div>
                        )}
                        {activeTab === 'insights' && (
                          <div className="pb-2">
                            <InsightsTab transactions={transactions} />
                          </div>
                        )}
                        {activeTab === 'history' && (
                          <div className="pb-2">
                            <HistoryTab
                              transactions={transactions}
                              onOpenUpload={() => setIsUploadOpen(true)}
                              onOpenAccountAggregator={() => setIsAaOpen(true)}
                              onClassifyMerchant={handleOpenClassifier}
                              onEditTransaction={handleOpenEditTransaction}
                            />
                          </div>
                        )}
                        {activeTab === 'payments' && (
                          <div className="pb-2">
                            <PaymentsTab
                              onScanClick={handleScanPay}
                              onSendClick={handleSendMoney}
                            />
                          </div>
                        )}
                        {activeTab === 'profile' && (
                          <div className="pb-2">
                            <ProfileTab 
                              onShowQR={() => setIsQrOpen(true)} 
                              onLogout={handleLogout}
                              onClearData={handleClearAllData}
                              onSeedSampleData={handleSeedSampleData}
                            />
                          </div>
                        )}
                      </div>

                      {/* Mobile Bottom Navigation */}
                      <div className="shrink-0 bg-transparent z-20">
                        <BottomNav
                          activeTab={activeTab}
                          onChangeTab={(t) => setActiveTab(t)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

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

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSave={handleSaveTransactionEdit}
        onDelete={handleDeleteTransaction}
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
