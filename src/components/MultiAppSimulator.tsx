'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, CreditCard, 
  Flame, Film, Music, ShoppingBag, Utensils, Zap, Send,
  Tv, Car, ShieldAlert, Sparkles, AlertCircle, RefreshCw, Smartphone,
  Wifi, Battery, Search, Mic, Camera, Globe, MessageSquare, Phone,
  QrCode, Play, Radio, Info, Building2, Wallet
} from 'lucide-react';

export interface PaymentExecutionParams {
  app: string;
  payee: string;
  amount: number;
  category: string;
  method: 'UPI' | 'Card' | 'AutoPay Mandate' | 'NetBanking';
  mcc?: string;
  rawDescription?: string;
  isRecurring?: boolean;
  isInternalTransfer?: boolean;
}

interface MultiAppSimulatorProps {
  balance: number;
  onExecutePayment: (params: PaymentExecutionParams) => void;
  compact?: boolean;
  pendingSmsNotification?: { title: string; body: string; code?: string } | null;
}

type AppId = 'home' | 'phonepe' | 'netflix' | 'blinkit';

interface PhoneAppDef {
  id: AppId;
  name: string;
  badge?: string;
  category: 'UPI & Banking' | 'Subscriptions' | 'Quick Commerce';
}

const ANDROID_APPS: PhoneAppDef[] = [
  { id: 'phonepe', name: 'PhonePe', category: 'UPI & Banking' },
  { id: 'netflix', name: 'Netflix', badge: 'AutoPay', category: 'Subscriptions' },
  { id: 'blinkit', name: 'Blinkit', category: 'Quick Commerce' },
];

/* Authentic Image Logos downloaded from official sources */
export const AppLogos: Record<string, React.FC<{ size?: number }>> = {
  gpay: ({ size = 48 }) => (
    <img 
      src="/icons/gpay.png" 
      alt="Google Pay" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  phonepe: ({ size = 48 }) => (
    <img 
      src="/icons/phonepe.png" 
      alt="PhonePe" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  paytm: ({ size = 48 }) => (
    <img 
      src="/icons/paytm.png" 
      alt="Paytm" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  cred: ({ size = 48 }) => (
    <img 
      src="/icons/cred.png" 
      alt="CRED" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  netflix: ({ size = 48 }) => (
    <img 
      src="/icons/netflix.png" 
      alt="Netflix" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  spotify: ({ size = 48 }) => (
    <img 
      src="/icons/spotify.png" 
      alt="Spotify" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  swiggy: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="w-full h-full shadow-sm rounded-2xl">
      <rect width="48" height="48" rx="14" fill="#FC8019"/>
      <path d="M24 10C18.5 10 14 14.5 14 20C14 27.5 24 38 24 38C24 38 34 27.5 34 20C34 14.5 29.5 10 24 10ZM24 23.5C22.1 23.5 20.5 21.9 20.5 20C20.5 18.1 22.1 16.5 24 16.5C25.9 16.5 27.5 18.1 27.5 20C27.5 21.9 25.9 23.5 24 23.5Z" fill="white"/>
    </svg>
  ),
  blinkit: ({ size = 48 }) => (
    <img 
      src="/icons/blinkit.png" 
      alt="Blinkit" 
      width={size} 
      height={size} 
      className="w-full h-full object-cover rounded-2xl shadow-sm"
    />
  ),
  chrome: ({ size = 44 }) => (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-md bg-white">
      <img 
        src="/icons/chrome.png" 
        alt="Google Chrome" 
        width={size} 
        height={size} 
        className="w-full h-full object-contain p-1"
      />
    </div>
  ),
  phoneCall: ({ size = 44 }) => (
    <div style={{ width: size, height: size }} className="rounded-full bg-[#00C853] flex items-center justify-center text-white shadow-md shrink-0">
      <Phone className="w-5 h-5 text-white" />
    </div>
  ),
  messages: ({ size = 44 }) => (
    <div style={{ width: size, height: size }} className="rounded-full bg-[#1A73E8] flex items-center justify-center text-white shadow-md shrink-0">
      <MessageSquare className="w-5 h-5 text-white" />
    </div>
  )
};

export const MultiAppSimulator: React.FC<MultiAppSimulatorProps> = ({
  balance,
  onExecutePayment,
  compact = false,
  pendingSmsNotification = null
}) => {
  const [activeApp, setActiveApp] = useState<AppId>('home');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // App interaction form state
  const [upiPayee, setUpiPayee] = useState('Swiggy');
  const [upiAmount, setUpiAmount] = useState('380');
  const [upiMethod, setUpiMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiCategory, setUpiCategory] = useState('Food & Dining');
  const [isSelfTransfer, setIsSelfTransfer] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Standard' | 'Premium'>('Standard');

  // Trigger Android heads-up notification
  const triggerSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const executePay = (params: PaymentExecutionParams) => {
    onExecutePayment(params);
    triggerSuccess(`Transaction Successful! Paid ₹${params.amount} via ${params.app}`);
  };

  // Current system clock
  const currentTime = "11:58";

  return (
    <div className="w-full h-full flex flex-col font-sans select-none relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/android_wallpaper.jpg')" }}>
      
      {/* Semi-transparent dark overlay to enhance Android text contrast */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-0" />

      {/* ========================================================= */}
      {/* 1. ANDROID STATUS BAR (With Center Punch-Hole Camera) */}
      {/* ========================================================= */}
      <div className="relative pt-2.5 pb-1 px-4 flex items-center justify-between text-white text-[11px] font-sans font-medium tracking-tight z-30 select-none">
        
        {/* Left: Android Clock + App Notification Icons */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="font-mono text-xs text-white drop-shadow">{currentTime}</span>
          <div className="flex items-center gap-1 ml-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-400" />
          </div>
        </div>

        {/* Center: Real Android Punch-Hole Camera Lens */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-black border-[1.5px] border-slate-700/80 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-900" />
          </div>
        </div>

        {/* Right: Android System Status Icons (VoLTE / 5G / WiFi / Battery) */}
        <div className="flex items-center gap-1.5 text-white drop-shadow">
          <span className="text-[9px] font-bold tracking-tight bg-black/40 px-1 py-0.5 rounded text-white border border-white/10">5G</span>
          <Wifi className="w-3.5 h-3.5 text-white" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-mono">87%</span>
            <div className="w-4 h-2 rounded-[2px] border border-white p-0.5 flex items-center">
              <div className="w-3 h-1 bg-emerald-400 rounded-[0.5px]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ANDROID HEADS-UP PUSH NOTIFICATION (Pop-down on Pay / Incoming OTP) */}
      {/* ========================================================= */}
      {pendingSmsNotification && (
        <div className="absolute top-10 left-3 right-3 z-50 p-3 rounded-2xl bg-[#1C172E]/98 backdrop-blur-md border border-purple-500/80 text-white shadow-2xl flex items-start gap-2.5 animate-in slide-in-from-top-6 duration-200">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">{pendingSmsNotification.title}</span>
              <span className="text-[9px] text-slate-400 font-mono">Just now</span>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">{pendingSmsNotification.body}</p>
            {pendingSmsNotification.code && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-mono font-black text-amber-300 bg-black/50 px-2 py-0.5 rounded border border-amber-500/40 tracking-widest">
                  OTP: {pendingSmsNotification.code}
                </span>
                <span className="text-[9px] text-purple-300">Enter in desktop window</span>
              </div>
            )}
          </div>
        </div>
      )}

      {successToast && (
        <div className="absolute top-10 left-3 right-3 z-50 p-3 rounded-2xl bg-[#141A29]/95 backdrop-blur-md border border-emerald-500/50 text-white shadow-2xl flex items-start gap-2.5 animate-in slide-in-from-top-6 duration-200">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Google Play Services • UPI</span>
              <span className="text-[9px] text-slate-400 font-mono">Just now</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5 truncate">{successToast}</p>
            <p className="text-[10px] text-slate-300">Synced to Happy Pocket Engine Database</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ANDROID MAIN SCREEN VIEWPORT */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col overflow-y-auto px-3.5 py-2 space-y-3 relative z-10">

        {/* --------------------------------------------------------- */}
        {/* VIEW: ANDROID HOME SCREEN */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'home' && (
          <div className="flex flex-col justify-between h-full min-h-[460px] animate-in fade-in duration-200">
            
            {/* Top Section: Glance, Search, and App Grid */}
            <div className="space-y-4">
              {/* Android Glance Widget (Date & Weather) */}
              <div className="pt-2 px-2 flex items-start justify-between text-white drop-shadow-md">
                <div>
                  <div className="text-3xl font-light text-white tracking-tight">Sunday, Oct 25</div>
                  <div className="text-xs text-slate-200 flex items-center gap-1.5 mt-1 font-medium">
                    <span>26°C • Mostly Clear</span>
                  </div>
                </div>
              </div>

              {/* Google Android Material Search Pill */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg text-white">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm text-blue-400 bg-white w-5 h-5 rounded-full flex items-center justify-center">G</span>
                  <span className="text-xs text-slate-100 font-medium">Search apps, UPI payees...</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-100">
                  <Mic className="w-4 h-4 hover:text-white cursor-pointer" />
                  <Camera className="w-4 h-4 hover:text-white cursor-pointer" />
                </div>
              </div>

              {/* App Drawer Label */}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 drop-shadow">
                  Installed Apps
                </span>
                <span className="text-[10px] bg-purple-600/90 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                  3 Apps (PhonePe, Netflix, Blinkit)
                </span>
              </div>

              {/* Android Squircle App Grid with Official Logos */}
              <div className="grid grid-cols-3 gap-3">
                {ANDROID_APPS.map(app => {
                  const LogoComp = AppLogos[app.id];
                  return (
                    <button
                      type="button"
                      key={app.id}
                      onClick={() => setActiveApp(app.id)}
                      className="flex flex-col items-center gap-1.5 p-1 rounded-2xl transition-all cursor-pointer group active:scale-95"
                    >
                      <div className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 relative overflow-hidden">
                        {LogoComp ? <LogoComp size={52} /> : null}

                        {app.badge && (
                          <span className="absolute top-0 right-0 text-[8px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase shadow-md border border-white/20 z-10 scale-90">
                            {app.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-white drop-shadow truncate w-full text-center">
                        {app.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Android Hotseat Dock Bar (Call, Chrome, Messages, PhonePe) - Anchored at Bottom */}
            <div className="pt-2 mt-auto mb-1 flex items-center justify-around px-2 border-t border-white/20 bg-black/25 backdrop-blur-md rounded-2xl py-2 shadow-lg">
              <div className="w-11 h-11 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <AppLogos.phoneCall size={44} />
              </div>
              <div className="w-11 h-11 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <AppLogos.chrome size={44} />
              </div>
              <div className="w-11 h-11 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <AppLogos.messages size={44} />
              </div>
              <button
                type="button"
                onClick={() => setActiveApp('phonepe')}
                className="w-11 h-11 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                title="Launch PhonePe"
              >
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-md shrink-0">
                  <AppLogos.phonepe size={44} />
                </div>
              </button>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* --------------------------------------------------------- */}
        {/* VIEW: AUTHENTIC PHONEPE INTERFACE (MATCHING REAL APP) */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'phonepe' && (
          <div className="space-y-3 animate-in fade-in duration-150 bg-[#0f0c20] -mx-3.5 -my-2 p-3 text-white min-h-[580px] flex flex-col justify-between select-none">
            
            {/* Top PhonePe Header: Profile Avatar, QR Icon, Help & Notification */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveApp('home')}
                  className="w-8 h-8 rounded-full bg-amber-400 border-2 border-purple-300 flex items-center justify-center text-slate-900 font-bold text-xs relative cursor-pointer shadow-md"
                  title="Back to Phone Home"
                >
                  <span>K</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black/80 rounded-full flex items-center justify-center text-[7px] text-white">
                    <QrCode className="w-2.5 h-2.5 text-white" />
                  </div>
                </button>
                <div className="text-left">
                  <div className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                    <span>Add Address</span>
                    <span className="text-[8px]">▼</span>
                  </div>
                  <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
                    <span>Kotresh • SBI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('Pine Labs Supermarket');
                    setUpiAmount('480');
                    setUpiCategory('Groceries');
                    setIsSelfTransfer(false);
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition"
                  title="Scan Any QR"
                >
                  <QrCode className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveApp('home')}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition text-xs font-bold text-purple-200"
                  title="Close PhonePe"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* PhonePe Gradient Hero Banner: "SAVE IN SILVER DAILY" */}
            <div className="rounded-2xl p-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 border border-purple-400/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black tracking-wider uppercase text-white drop-shadow">
                    SAVE IN SILVER DAILY ›
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 text-[8px] font-bold text-purple-100">
                    <span className="bg-white/15 px-1.5 py-0.5 rounded-full">💧 999 Purity</span>
                    <span className="bg-white/15 px-1.5 py-0.5 rounded-full">₹0 Storage Fees</span>
                    <span className="bg-white/15 px-1.5 py-0.5 rounded-full">🛡️ 100% Secure</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 border-2 border-white shadow-md flex items-center justify-center text-slate-800 font-black text-xs shrink-0">
                  Ag
                </div>
              </div>
            </div>

            {/* Money Transfers Section (4 Circular Icons: To Mobile, To Bank & Self, Wallet, Check Balance) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-white tracking-wide">Money Transfers</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  🤝 Invite Now
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {/* 1. To Mobile Number */}
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('Ramesh Kumar');
                    setUpiAmount('500');
                    setUpiCategory('Shopping & Discretionary');
                    setIsSelfTransfer(false);
                  }}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md group-hover:bg-purple-500 transition relative">
                    <Phone className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-200 leading-tight">To Mobile Number</span>
                </button>

                {/* 2. To Bank & Self A/c (Noise Filter Trigger) */}
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('Kotresh C (Canara Bank / Self)');
                    setUpiAmount('15000');
                    setUpiCategory('Internal Transfer');
                    setIsSelfTransfer(true);
                  }}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md group-hover:bg-purple-500 transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-200 leading-tight">To Bank & Self A/c</span>
                </button>

                {/* 3. PhonePe Wallet */}
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('PhonePe Wallet Top-up');
                    setUpiAmount('1000');
                    setUpiCategory('Internal Transfer');
                    setIsSelfTransfer(true);
                  }}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5 transition cursor-pointer active:scale-95 group relative"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md group-hover:bg-purple-500 transition relative">
                    <Wallet className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 text-[7px] bg-orange-500 text-white font-black px-1 rounded-full uppercase shadow">
                      Cashback
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-200 leading-tight">PhonePe Wallet</span>
                </button>

                {/* 4. Check Balance */}
                <button
                  type="button"
                  onClick={() => triggerSuccess(`SBI Account Balance: ₹${balance.toLocaleString('en-IN')}`)}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md group-hover:bg-purple-500 transition">
                    <span className="font-bold text-sm">₹</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-200 leading-tight">Check Balance</span>
                </button>
              </div>
            </div>

            {/* Quick Action Pill Bar */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div 
                onClick={() => {
                  setUpiPayee('MMTC-PAMP Pure Silver');
                  setUpiAmount('250');
                  setUpiCategory('Shopping & Discretionary');
                  setIsSelfTransfer(false);
                }}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-purple-500/50 transition"
              >
                <span>🪙</span>
                <span className="font-bold text-slate-200 truncate">Start saving in pure Silver</span>
              </div>
              <div 
                onClick={() => {
                  setUpiPayee('Nippon India SIP Mandate');
                  setUpiAmount('1000');
                  setUpiCategory('Subscriptions & Digital');
                  setIsSelfTransfer(false);
                }}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-purple-500/50 transition"
              >
                <span>📈</span>
                <span className="font-bold text-slate-200 truncate">Daily Mutual Fund SIP</span>
              </div>
            </div>

            {/* Recharge & Bills Section (Mobile, Rent via Credit Card, Electricity, Loan Repayment) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-white tracking-wide px-1">Recharge & Bills</span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('Jio Prepaid Recharge');
                    setUpiAmount('299');
                    setUpiCategory('Housing & Utilities');
                    setIsSelfTransfer(false);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <span className="text-base">⚡</span>
                  <span className="text-[8px] font-medium text-slate-200 leading-tight">Mobile Recharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('House Rent Payment');
                    setUpiAmount('18000');
                    setUpiCategory('Housing & Utilities');
                    setIsSelfTransfer(false);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <span className="text-base">🏠</span>
                  <span className="text-[8px] font-medium text-slate-200 leading-tight">Rent via Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('BESCOM Electricity Bill');
                    setUpiAmount('1450');
                    setUpiCategory('Housing & Utilities');
                    setIsSelfTransfer(false);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <span className="text-base">💡</span>
                  <span className="text-[8px] font-medium text-slate-200 leading-tight">Electricity Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUpiPayee('HDFC Loan Repayment');
                    setUpiAmount('6500');
                    setUpiCategory('Housing & Utilities');
                    setIsSelfTransfer(false);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <span className="text-base">💰</span>
                  <span className="text-[8px] font-medium text-slate-200 leading-tight">Loan Repayment</span>
                </button>
              </div>
            </div>

            {/* Quick Live Pay Execution Bar */}
            <div className="p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="truncate max-w-[170px] text-purple-200">{upiPayee}</span>
                <span className="font-mono text-emerald-400">₹{upiAmount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={upiAmount}
                  onChange={e => setUpiAmount(e.target.value)}
                  className="w-20 bg-black/60 border border-purple-500/40 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white"
                  placeholder="₹"
                />
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseFloat(upiAmount);
                    if (!amt || isNaN(amt)) return;
                    executePay({
                      app: 'PhonePe',
                      payee: upiPayee,
                      amount: amt,
                      category: upiCategory,
                      method: 'UPI',
                      isInternalTransfer: isSelfTransfer,
                      rawDescription: `UPI/DR/${Math.floor(100000000000 + Math.random() * 900000000000)}/${upiPayee.toUpperCase()}/PHONEPE`
                    });
                  }}
                  className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[11px] rounded-lg shadow-md transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Money (UPI)</span>
                </button>
              </div>
            </div>

            {/* Bottom PhonePe Navigation Bar (Home, Search, Center QR Scan, Alerts, History) */}
            <div className="pt-2 px-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[9px] relative">
              <button 
                type="button"
                onClick={() => setActiveApp('phonepe')} 
                className="flex flex-col items-center text-purple-400 font-bold"
              >
                <span className="text-sm">🏠</span>
                <span>Home</span>
              </button>

              <button 
                type="button" 
                onClick={() => triggerSuccess('Searching merchants and UPI contacts...')} 
                className="flex flex-col items-center hover:text-white"
              >
                <span className="text-sm">🔍</span>
                <span>Search</span>
              </button>

              {/* Big Center Glowing Purple QR Scan Button */}
              <button
                type="button"
                onClick={() => {
                  setUpiPayee('Zudio Fashion Store');
                  setUpiAmount('1499');
                  setUpiCategory('Shopping & Discretionary');
                  setIsSelfTransfer(false);
                }}
                className="w-11 h-11 -mt-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 border-white shadow-lg shadow-purple-600/50 flex items-center justify-center text-white cursor-pointer active:scale-90 transition"
                title="Scan & Pay"
              >
                <QrCode className="w-6 h-6" />
              </button>

              <button 
                type="button" 
                onClick={() => triggerSuccess('No pending payment requests.')} 
                className="flex flex-col items-center hover:text-white"
              >
                <span className="text-sm">🔔</span>
                <span>Alerts</span>
              </button>

              <button 
                type="button" 
                onClick={() => triggerSuccess(`Viewing last 34 real transactions in Atlas DB`)} 
                className="flex flex-col items-center hover:text-white"
              >
                <span className="text-sm">🕒</span>
                <span>History</span>
              </button>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW: NETFLIX OTT APP */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'netflix' && (
          <div className="space-y-3 animate-in fade-in duration-150 bg-black/95 backdrop-blur-lg p-3 rounded-3xl border border-red-900/60">
            <div className="flex items-center justify-between py-1 border-b border-red-950 pb-2">
              <button
                type="button"
                onClick={() => setActiveApp('home')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <div className="flex items-center gap-1.5">
                <AppLogos.netflix size={22} />
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Netflix India</span>
              </div>
              <div className="w-6" />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950 via-slate-950 to-black border border-red-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AppLogos.netflix size={32} />
                  <div>
                    <h3 className="text-sm font-black text-white">Netflix Subscription</h3>
                    <p className="text-[10px] text-red-300">Monthly AutoPay e-Mandate</p>
                  </div>
                </div>
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                  RECURRING DRAIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tests how Happy Pocket isolates passive monthly subscriptions and calculates 5-year investment lost.
              </p>
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlan('Standard')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  selectedPlan === 'Standard'
                    ? 'bg-red-950/40 border-red-600 text-white'
                    : 'bg-[#141B2D] border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-white">Standard HD</div>
                <div className="text-sm font-black font-mono text-red-400 mt-1">₹499 / mo</div>
                <span className="text-[10px] text-slate-400">2 Devices</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('Premium')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  selectedPlan === 'Premium'
                    ? 'bg-red-950/40 border-red-600 text-white'
                    : 'bg-[#141B2D] border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-white">Premium 4K HDR</div>
                <div className="text-sm font-black font-mono text-red-400 mt-1">₹649 / mo</div>
                <span className="text-[10px] text-slate-400">4 Devices</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const amt = selectedPlan === 'Standard' ? 499 : 649;
                executePay({
                  app: 'Netflix',
                  payee: `Netflix ${selectedPlan} Subscription`,
                  amount: amt,
                  category: 'Subscriptions & Mandates',
                  method: 'AutoPay Mandate',
                  isRecurring: true,
                  rawDescription: `AUTOPAY/UPI/NFTX${Math.floor(100000 + Math.random() * 900000)}/NETFLIX RECURRING MANDATE`
                });
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>Authorize AutoPay Mandate (₹{selectedPlan === 'Standard' ? '499' : '649'}/mo)</span>
            </button>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW: BLINKIT QUICK COMMERCE */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'blinkit' && (
          <div className="space-y-3 animate-in fade-in duration-150 bg-slate-950/95 backdrop-blur-lg p-3 rounded-3xl border border-yellow-500/30">
            <div className="flex items-center justify-between py-1 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveApp('home')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <div className="flex items-center gap-1.5">
                <AppLogos.blinkit size={22} />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Blinkit 10m Delivery
                </span>
              </div>
              <div className="w-6" />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 text-white shadow-lg space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Blinkit Instant Groceries
                </h3>
                <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded-full font-bold">10 MINS</span>
              </div>
              <p className="text-[11px] text-white/90">
                Order daily living essentials. Happy Pocket categorizes real living expenses directly.
              </p>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {[
                { item: 'Organic Milk, Eggs & Bread', amt: 240, tag: 'Groceries' },
                { item: 'Fresh Fruit Basket & Berries', amt: 450, tag: 'Groceries' },
                { item: 'Weekly Household Essentials', amt: 890, tag: 'Groceries' }
              ].map(order => (
                <div key={order.item} className="p-3 rounded-2xl bg-[#141B2D] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{order.item}</div>
                    <div className="text-[10px] text-slate-400 font-mono">₹{order.amt} • {order.tag}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      executePay({
                        app: 'Blinkit',
                        payee: `Blinkit - ${order.item}`,
                        amount: order.amt,
                        category: order.tag,
                        method: 'UPI',
                        rawDescription: `UPI/DR/${Math.floor(100000000000 + Math.random() * 900000000000)}/BLINKIT/PHONEPE`
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs cursor-pointer shadow-xs active:scale-95 transition"
                  >
                    Order & Pay
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 3. ANDROID 3-BUTTON SYSTEM NAVIGATION BAR (Back, Home, Recents) */}
      {/* ========================================================= */}
      <div className="mt-auto py-2 px-8 bg-black/70 backdrop-blur-md border-t border-white/10 flex items-center justify-around z-30 select-none shrink-0">
        
        {/* Android Back Button (Triangle pointing left) */}
        <button
          type="button"
          onClick={() => setActiveApp('home')}
          className="p-2 hover:bg-white/15 rounded-full text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
          title="Back to Home"
        >
          <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-300 drop-shadow" />
        </button>

        {/* Android Home Button (Circle) */}
        <button
          type="button"
          onClick={() => setActiveApp('home')}
          className="p-2 hover:bg-white/15 rounded-full text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
          title="Home"
        >
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 drop-shadow" />
        </button>

        {/* Android Recents / Overview Button (Square) */}
        <button
          type="button"
          onClick={() => {
            const nextIdx = (ANDROID_APPS.findIndex(a => a.id === activeApp) + 1) % ANDROID_APPS.length;
            setActiveApp(ANDROID_APPS[nextIdx].id);
          }}
          className="p-2 hover:bg-white/15 rounded-full text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
          title="Switch App (Recents)"
        >
          <div className="w-3 h-3 rounded-[2px] border-2 border-slate-300 drop-shadow" />
        </button>

      </div>

    </div>
  );
};
