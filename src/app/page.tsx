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
    <div className="min-h-screen bg-[#18191C] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ======================================================== */}
      {/* 1. TOP WORKSPACE APPLICATION HEADER */}
      {/* ======================================================== */}
      <header className="w-full bg-[#181A1F] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 shrink-0 z-40 shadow-xs">
        
        {/* Left: Brand Identity & Active Profile */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-extrabold shadow-sm">
              <span className="text-xs">⚡</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-xs tracking-tight">
                  Happy Pocket
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  FinLens
                </span>
              </div>
            </div>
          </div>

          <span className="h-3.5 w-px bg-slate-800 hidden sm:inline" />

          {/* Running Device Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[11px]">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[10px]">Pixel 8 Pro</span>
          </div>
        </div>

        {/* Right: Atlas Live Diagnostics, Seed Demo & Sync */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Seed Meaningful Sample Data Button */}
          <button
            type="button"
            onClick={handleSeedSampleData}
            title="Seed 15 Realistic Indian UPI Transactions into MongoDB Atlas"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 active:scale-95 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Sample Data</span>
          </button>

          {/* MongoDB Atlas Live Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold hidden sm:inline">Atlas:</span>
            <span>{dbCount > 0 ? `${dbCount} Txs` : 'Connected'}</span>
          </div>

          {/* Sync DB */}
          <button
            type="button"
            onClick={loadFromDb}
            title="Sync Data from Atlas"
            className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700/60 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isDbLoading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-bold hidden md:inline">Sync</span>
          </button>

          {/* Navigation Mode Pill */}
          <div className="hidden md:flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setNavStyle('buttons')}
              title="Android 3-Button Navigation"
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                navStyle === 'buttons' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Btn
            </button>
            <button
              type="button"
              onClick={() => setNavStyle('gesture')}
              title="Android Gesture Pill"
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                navStyle === 'gesture' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gesture
            </button>
          </div>

          {/* Power Standby */}
          <button
            type="button"
            onClick={() => setIsPoweredOn((prev) => !prev)}
            title={isPoweredOn ? 'Put Display in Standby' : 'Wake Display'}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isPoweredOn 
                ? 'bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border-slate-700/60' 
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

        {/* Device Container (Clean Smartphone Display) */}
        <div className="relative flex items-center justify-center max-w-full">
          
          {/* -------------------------------------------------------- */}
          {/* THE SMARTPHONE DEVICE (CLEAN SLIM FLAGSHIP BEZEL) */}
          {/* -------------------------------------------------------- */}
          <div className="relative w-[380px] sm:w-[412px] h-[840px] max-h-[92vh] bg-[#1A1C20] rounded-[48px] p-[9px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col justify-between transition-all duration-300">
            
            {/* Speaker Ear Slit at Top Hardware Bezel */}
            <div className="w-16 h-1 bg-[#0D0E10] rounded-full mx-auto mb-1 shrink-0 shadow-inner" />

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

                        {/* Streamlined RBI Account Aggregator Quick Pill */}
                        <button
                          type="button"
                          onClick={() => setIsAaOpen(true)}
                          className="w-full py-2 px-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/20 text-white flex items-center justify-between transition cursor-pointer group shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              <Landmark className="w-3 h-3" />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-200 group-hover:text-emerald-100 transition-colors">
                              RBI Account Aggregator • Live Bank Consent
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                            Connect →
                          </span>
                        </button>

                        {/* Recent Transactions List with Theme Badges */}
                        <RecentTransactions
                          transactions={transactions.slice(0, 4)}
                          onTransactionClick={handleOpenEditTransaction}
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
                          onEditTransaction={handleOpenEditTransaction}
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
                          onEditTransaction={handleOpenEditTransaction}
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
                          onSeedSampleData={handleSeedSampleData}
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
                    onSeedSampleData={handleSeedSampleData}
                    balance={balance}
                  />

                </>
              )}

            </div>
          </div>

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
