'use client';

import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  Volume2, 
  ShieldCheck, 
  ArrowDownLeft, 
  RotateCw, 
  LogOut, 
  Users, 
  Sparkles,
  TrendingUp,
  Receipt,
  Download,
  Share2,
  SlidersHorizontal,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MerchantDashboardProps {
  merchantType: 'medical' | 'college';
  onSwitchAccount: () => void;
  onLogout: () => void;
}

interface MerchantData {
  accountHolderName: string;
  upiId: string;
  bankName: string;
  maskedAccountNumber: string;
  ifsc: string;
  balance: number;
  theme: string;
  themeIcon: string;
}

interface ReceivedPayment {
  id: string;
  amount: number;
  customerName: string;
  timestamp: string;
  upiRrn: string;
  remark?: string;
}

export default function MerchantDashboard({
  merchantType,
  onSwitchAccount,
  onLogout,
}: MerchantDashboardProps) {
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [totalReceived, setTotalReceived] = useState<number>(0);
  const [todayReceived, setTodayReceived] = useState<number>(0);
  const [transactions, setTransactions] = useState<ReceivedPayment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showAmountInput, setShowAmountInput] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [soundboxNotice, setSoundboxNotice] = useState<string | null>(null);

  // Fetch real-time merchant data from API
  const fetchMerchantData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/merchant?role=${merchantType}`);
      const data = await res.json();
      if (data.success && data.merchant) {
        setMerchant(data.merchant);
        setTotalReceived(data.totalReceived);
        setTodayReceived(data.todayReceived);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching merchant details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
    const interval = setInterval(fetchMerchantData, 12000);
    return () => clearInterval(interval);
  }, [merchantType]);

  const isMedical = merchantType === 'medical';

  const title = isMedical ? 'City Care Medicals & Pharmacy' : "St. Xavier Engineering College";
  const icon = isMedical ? '💊' : '🎓';
  const categoryLabel = isMedical ? 'Medical Shop & Healthcare' : 'Higher Education & College';
  const defaultUpi = isMedical ? 'citycaremedicals@okhdfcbank' : 'xaviercollege@sbi';
  const defaultBank = isMedical ? 'HDFC Bank •••• 9283' : 'SBI •••• 1928';

  const upiId = merchant?.upiId || defaultUpi;
  const balance = merchant?.balance ?? totalReceived;

  // Generate UPI QR URI
  const qrUri = customAmount && parseFloat(customAmount) > 0
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(title)}&am=${customAmount}&cu=INR`
    : `upi://pay?pa=${upiId}&pn=${encodeURIComponent(title)}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Play Indian Soundbox Speech
  const triggerSoundbox = (amt: number) => {
    const speechText = `₹${amt.toFixed(2)} received on Happy Pocket UPI`;
    setSoundboxNotice(`🔊 Soundbox: "${speechText}"`);
    setTimeout(() => setSoundboxNotice(null), 4500);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis not available:', e);
      }
    }
  };

  // Simulate an incoming customer payment
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const simAmount = customAmount && parseFloat(customAmount) > 0 
        ? parseFloat(customAmount) 
        : (isMedical ? 420.00 : 3500.00);

      const customerNames = ['Kotresh C', 'Priya Sharma', 'Rahul Verma', 'Sneha Patel', 'Harsha Vardhan'];
      const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];

      const res = await fetch('/api/merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: merchantType,
          upiId,
          amount: simAmount,
          customerName: randomCustomer,
          note: isMedical ? 'Prescription medicine bill' : 'Semester exam & tuition fee',
        }),
      });

      const data = await res.json();
      if (data.success) {
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {}

        triggerSoundbox(simAmount);
        await fetchMerchantData();
        setCustomAmount('');
        setShowAmountInput(false);
      }
    } catch (err) {
      console.error('Error simulating customer payment:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-none pb-12 select-none animate-fadeIn">
      
      {/* ======================================================== */}
      {/* 1. TOP MERCHANT APP HEADER */}
      {/* ======================================================== */}
      <div className="px-4 pt-2 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-xl shadow-sm">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight line-clamp-1">
                {title}
              </h2>
              <span title="RBI Certified Merchant">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {merchant?.bankName || defaultBank} • <span className="font-mono text-emerald-600 font-bold">Verified</span>
            </p>
          </div>
        </div>

        {/* Top Action Buttons: Switch Account & Logout */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSwitchAccount}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Switch Bank Account"
          >
            <Users className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">Switch</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 transition cursor-pointer"
            title="Sign Out to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        
        {/* ======================================================== */}
        {/* 2. TOTAL MONEY RECEIVED HERO CARD */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] text-white p-5 shadow-lg border border-emerald-600/30">
          
          {/* Subtle Background Glow Vector */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Receipt className="w-3 h-3 text-emerald-300" />
                <span>Total Money Received</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight font-sans text-white drop-shadow-sm flex items-center">
                <span className="font-semibold text-2xl mr-0.5">₹</span>
                {balance.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* Live Refresh Trigger */}
            <button
              type="button"
              onClick={fetchMerchantData}
              className={`p-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 transition cursor-pointer ${isLoading ? 'animate-spin' : ''}`}
              title="Refresh Balance"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics Row: Today's Inflow & Transactions count */}
          <div className="relative z-10 mt-4 pt-3.5 border-t border-emerald-700/50 flex items-center justify-between text-xs text-emerald-100">
            <div>
              <span className="text-[10px] text-emerald-300/80 block">Today's Inflow</span>
              <span className="font-bold font-mono text-sm text-white">
                ₹{todayReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-emerald-300/80 block">Payments Settled</span>
              <span className="font-bold font-mono text-sm text-white">
                {transactions.length} Received
              </span>
            </div>
          </div>

          {/* Instant Soundbox Audio Chime Trigger */}
          <div className="relative z-10 mt-3 flex items-center justify-between bg-emerald-950/50 p-2 px-3 rounded-xl border border-emerald-500/20 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-200 font-medium">Smart Voice Soundbox Active</span>
            </div>
            <button
              type="button"
              onClick={() => triggerSoundbox(balance > 0 ? balance : 500)}
              className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        {/* Live Soundbox Voice Banner */}
        {soundboxNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-bounce">
            <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{soundboxNotice}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. OFFICIAL MERCHANT QR CODE STANDEE ("SHOW ONLY QR CODE") */}
        {/* ======================================================== */}
        <div className="rounded-[28px] bg-white border border-slate-200/90 shadow-sm p-5 text-center relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-extrabold text-slate-800 tracking-tight">Merchant UPI QR Code</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Instant Settlement
            </span>
          </div>

          {/* High-Resolution QR Code Standee */}
          <div className="p-4 bg-slate-50/80 rounded-3xl border border-slate-100 inline-block shadow-inner relative group">
            
            {/* Visual QR Matrix Vector */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative mx-auto">
              <QrCode className="w-full h-full text-slate-900 stroke-[1.6]" />
              
              {/* Center Merchant Business Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-lg">
                  {icon}
                </div>
              </div>
            </div>

            {/* Custom Dynamic Amount Pill (if specified) */}
            {customAmount && parseFloat(customAmount) > 0 && (
              <div className="mt-2 text-xs font-bold text-emerald-700 font-mono">
                Scan to pay exactly ₹{parseFloat(customAmount).toFixed(2)}
              </div>
            )}
          </div>

          {/* Merchant UPI ID with 1-Tap Copy */}
          <div className="mt-3.5 flex items-center justify-center gap-2 p-2 px-3 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-xs mx-auto">
            <span className="font-mono text-xs font-bold text-slate-800 truncate">
              {upiId}
            </span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="p-1 text-slate-500 hover:text-emerald-600 transition cursor-pointer shrink-0"
              title="Copy UPI ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Dynamic Amount / Simulate Controls */}
          <div className="mt-4 flex items-center justify-center gap-2">
            
            {/* Toggle Set Custom Amount */}
            <button
              type="button"
              onClick={() => setShowAmountInput(prev => !prev)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>{showAmountInput ? 'Clear Amount' : 'Set Bill Amount'}</span>
            </button>

            {/* Simulate Customer Payment Button */}
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isSimulating ? 'Processing...' : 'Simulate Payment'}</span>
            </button>
          </div>

          {/* Amount Input Drawer */}
          {showAmountInput && (
            <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-w-xs mx-auto flex items-center gap-2 animate-fadeIn">
              <span className="text-sm font-bold text-slate-600">₹</span>
              <input
                type="number"
                placeholder={isMedical ? 'e.g. 420' : 'e.g. 3500'}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setCustomAmount('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
              >
                Reset
              </button>
            </div>
          )}

          {/* Accepted UPI Apps Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>Paytm</span>
            <span>•</span>
            <span>BHIM UPI</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. RECEIVED MONEY STREAM ("THE RECIVED MONEY") */}
        {/* ======================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Received Payments</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Feed ({transactions.length})
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time Core Ledger</span>
          </div>

          {transactions.length === 0 ? (
            /* Empty State: Waiting for payments */
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-xl">
                {icon}
              </div>
              <h4 className="text-xs font-bold text-slate-800">Waiting for customer payments</h4>
              <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                Scan the QR code above or switch to your Personal Account to pay this merchant.
              </p>
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition cursor-pointer"
              >
                + Receive Test Payment
              </button>
            </div>
          ) : (
            /* Transactions List */
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-emerald-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {tx.customerName}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          Settled
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>
                          {new Date(tx.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span>RRN: {tx.upiRrn.slice(-6)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-600 font-mono block">
                      +₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Credited to A/C</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
