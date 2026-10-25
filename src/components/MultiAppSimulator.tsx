'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, CreditCard, 
  Flame, Film, Music, ShoppingBag, Utensils, Zap, Send,
  Tv, Car, ShieldAlert, Sparkles, AlertCircle, RefreshCw, Smartphone,
  Wifi, Battery, Search, Mic, Camera, Globe, MessageSquare, Phone,
  QrCode, Play, Radio, Info
} from 'lucide-react';

export interface PaymentExecutionParams {
  app: string;
  payee: string;
  amount: number;
  category: string;
  method: 'UPI' | 'Card' | 'AutoPay Mandate' | 'NetBanking';
  rawDescription?: string;
  isRecurring?: boolean;
  isInternalTransfer?: boolean;
}

interface MultiAppSimulatorProps {
  balance: number;
  onExecutePayment: (params: PaymentExecutionParams) => void;
  compact?: boolean;
}

type AppId = 'home' | 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'netflix' | 'spotify' | 'swiggy' | 'blinkit';

interface PhoneAppDef {
  id: AppId;
  name: string;
  iconBg: string;
  badge?: string;
  category: 'UPI & Banking' | 'Entertainment' | 'Daily Orders';
}

const ANDROID_APPS: PhoneAppDef[] = [
  { id: 'gpay', name: 'Google Pay', iconBg: 'bg-white shadow-sm border border-slate-200', category: 'UPI & Banking' },
  { id: 'phonepe', name: 'PhonePe', iconBg: 'bg-[#5f259f] text-white', category: 'UPI & Banking' },
  { id: 'paytm', name: 'Paytm', iconBg: 'bg-[#002e6e] text-white', category: 'UPI & Banking' },
  { id: 'cred', name: 'CRED', iconBg: 'bg-[#121212] text-white', category: 'UPI & Banking' },
  { id: 'netflix', name: 'Netflix', iconBg: 'bg-[#000000] text-red-600', badge: 'AutoPay', category: 'Entertainment' },
  { id: 'spotify', name: 'Spotify', iconBg: 'bg-[#1DB954] text-black', badge: 'Mandate', category: 'Entertainment' },
  { id: 'swiggy', name: 'Swiggy', iconBg: 'bg-[#fc8019] text-white', category: 'Daily Orders' },
  { id: 'blinkit', name: 'Blinkit', iconBg: 'bg-[#f8cb46] text-slate-950', category: 'Daily Orders' },
];

export const MultiAppSimulator: React.FC<MultiAppSimulatorProps> = ({
  balance,
  onExecutePayment,
  compact = false
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
    <div className="w-full h-full flex flex-col bg-[#0B0F19] text-slate-100 font-sans select-none relative overflow-hidden">
      
      {/* ========================================================= */}
      {/* 1. ANDROID STATUS BAR (With Center Punch-Hole Camera) */}
      {/* ========================================================= */}
      <div className="relative pt-2.5 pb-1 px-4 flex items-center justify-between text-slate-300 text-[11px] font-sans font-medium tracking-tight z-30 select-none">
        
        {/* Left: Android Clock + App Notification Icons */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="font-mono text-xs">{currentTime}</span>
          <div className="flex items-center gap-1 ml-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          </div>
        </div>

        {/* Center: Real Android Punch-Hole Camera Lens */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-black border-[1.5px] border-slate-800 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-900" />
          </div>
        </div>

        {/* Right: Android System Status Icons (VoLTE / 5G / WiFi / Battery) */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-[9px] font-bold tracking-tight bg-slate-800/80 px-1 py-0.5 rounded text-slate-300">5G</span>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-mono">87%</span>
            <div className="w-4 h-2 rounded-[2px] border border-slate-300 p-0.5 flex items-center">
              <div className="w-3 h-1 bg-emerald-400 rounded-[0.5px]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ANDROID HEADS-UP PUSH NOTIFICATION (Pop-down on Pay) */}
      {/* ========================================================= */}
      {successToast && (
        <div className="absolute top-10 left-3 right-3 z-50 p-3 rounded-2xl bg-[#1E2640] border border-emerald-500/40 text-white shadow-2xl flex items-start gap-2.5 animate-in slide-in-from-top-6 duration-200">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Google Play Services • UPI</span>
              <span className="text-[9px] text-slate-400 font-mono">Just now</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5 truncate">{successToast}</p>
            <p className="text-[10px] text-slate-400">Synced to Happy Pocket Engine Database</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ANDROID MAIN SCREEN VIEWPORT */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">

        {/* --------------------------------------------------------- */}
        {/* VIEW: ANDROID HOME SCREEN */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Android Glance Widget (Date, Weather, Balance) */}
            <div className="pt-2 px-2 flex items-start justify-between">
              <div>
                <div className="text-2xl font-light text-white tracking-tight">Sunday, Oct 25</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span>26°C • Mostly Clear</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Bank Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Google Android Material Search Pill */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-full bg-[#1A2234]/90 border border-slate-700/60 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="font-black text-sm text-blue-400">G</span>
                <span className="text-xs text-slate-400 font-medium">Search apps, UPI payees...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mic className="w-4 h-4 hover:text-white cursor-pointer" />
                <Camera className="w-4 h-4 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* App Drawer Label */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Installed Payment & OTT Apps
              </span>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
                8 Apps
              </span>
            </div>

            {/* Android Squircle App Grid */}
            <div className="grid grid-cols-4 gap-3">
              {ANDROID_APPS.map(app => (
                <button
                  type="button"
                  key={app.id}
                  onClick={() => setActiveApp(app.id)}
                  className="flex flex-col items-center gap-1.5 p-1 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group active:scale-95"
                >
                  <div className={`w-13 h-13 rounded-[22px] ${app.iconBg} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 relative`}>
                    {app.id === 'gpay' && (
                      <div className="flex items-center justify-center font-black text-slate-800 text-lg">
                        <span className="text-blue-500">G</span><span className="text-red-500">P</span><span className="text-amber-500">a</span><span className="text-emerald-500">y</span>
                      </div>
                    )}
                    {app.id === 'phonepe' && (
                      <span className="font-extrabold text-white text-base">पे</span>
                    )}
                    {app.id === 'paytm' && (
                      <span className="font-black text-white text-xs tracking-tight">Paytm</span>
                    )}
                    {app.id === 'cred' && (
                      <div className="font-black text-white text-xs border border-white/40 p-1 rounded-md">CRED</div>
                    )}
                    {app.id === 'netflix' && (
                      <Film className="w-6 h-6 text-red-600" />
                    )}
                    {app.id === 'spotify' && (
                      <Music className="w-6 h-6 text-black" />
                    )}
                    {app.id === 'swiggy' && (
                      <Utensils className="w-6 h-6 text-white" />
                    )}
                    {app.id === 'blinkit' && (
                      <ShoppingBag className="w-6 h-6 text-slate-950" />
                    )}

                    {app.badge && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 truncate w-full text-center">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Android Preset Scenarios Card */}
            <div className="p-3.5 rounded-2xl bg-[#141B2D] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400" />
                  <span>One-Touch Stress Test Events</span>
                </span>
                <span className="text-[9px] text-orange-400 font-mono">SIMULATION</span>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => executePay({
                    app: 'Google Pay',
                    payee: 'Self Marcus HYSA Transfer',
                    amount: 15000,
                    category: 'Internal Transfer',
                    method: 'UPI',
                    isInternalTransfer: true,
                    rawDescription: 'UPI/DR/839103948291/SELF MARCUS HYSA/OKSBI'
                  })}
                  className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>⚠️ Self-Transfer Noise</span>
                      <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 rounded">₹15,000</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Verifies Happy Pocket filters it out of real living expenses</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => executePay({
                    app: 'Netflix',
                    payee: 'Netflix Entertainment Mandate',
                    amount: 649,
                    category: 'Subscriptions & Mandates',
                    method: 'AutoPay Mandate',
                    isRecurring: true,
                    rawDescription: 'AUTOPAY/MANDATE/NFTX99182/NETFLIX RECURRING'
                  })}
                  className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div>
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <span>🔁 Netflix AutoPay Mandate</span>
                      <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 rounded">₹649/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Verifies subscription detection and 1-click mandate killer</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Android Hotseat Dock Bar (Call, Chrome, Messages, Camera) */}
            <div className="pt-2 flex items-center justify-around px-2 border-t border-slate-800/60">
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Phone className="w-5 h-5" />
              </div>
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveApp('gpay')}
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-md font-bold text-xs"
              >
                GPay
              </button>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW: GOOGLE PAY / PHONEPE / PAYTM / CRED */}
        {/* --------------------------------------------------------- */}
        {(['gpay', 'phonepe', 'paytm', 'cred'] as AppId[]).includes(activeApp) && (
          <div className="space-y-3 animate-in fade-in duration-150">
            
            {/* Android App Action Bar */}
            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={() => setActiveApp('home')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {activeApp === 'gpay' && 'Google Pay'}
                {activeApp === 'phonepe' && 'PhonePe UPI'}
                {activeApp === 'paytm' && 'Paytm'}
                {activeApp === 'cred' && 'CRED Pay'}
              </span>
              <div className="w-6" />
            </div>

            {/* App Top Branding */}
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${
              activeApp === 'gpay' ? 'from-blue-600 to-indigo-700' :
              activeApp === 'phonepe' ? 'from-purple-700 to-indigo-800' :
              activeApp === 'paytm' ? 'from-cyan-600 to-blue-700' : 'from-slate-900 to-black'
            } text-white shadow-lg space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">
                  {activeApp.toUpperCase()} LIVE GATEWAY
                </span>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">NPCI • UPI 2.0</span>
              </div>
              <p className="text-[11px] text-white/80">
                Choose payee or type below. Transaction broadcasts into Happy Pocket normalized ledger.
              </p>
            </div>

            {/* Payment Method Selector (UPI / Card / NetBanking) */}
            <div className="grid grid-cols-3 gap-1 bg-[#141B2D] p-1 rounded-xl border border-slate-800">
              {(['UPI', 'Card', 'NetBanking'] as const).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setUpiMethod(m)}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                    upiMethod === m 
                      ? 'bg-orange-500 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Quick Contact Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequent Payees:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { name: 'Swiggy', amt: '380', cat: 'Food & Dining' },
                  { name: 'Zomato', amt: '450', cat: 'Food & Dining' },
                  { name: 'Blinkit', amt: '290', cat: 'Groceries' },
                  { name: 'Indian Oil', amt: '650', cat: 'Transportation' },
                  { name: 'Uber Cab', amt: '240', cat: 'Transportation' },
                  { name: 'Marcus Self-Transfer', amt: '15000', cat: 'Internal Transfer' },
                ].map(p => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => {
                      setUpiPayee(p.name);
                      setUpiAmount(p.amt);
                      setUpiCategory(p.cat);
                      setIsSelfTransfer(p.cat === 'Internal Transfer');
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                      upiPayee === p.name 
                        ? 'bg-orange-500/20 border-orange-500 text-white' 
                        : 'bg-[#141B2D] border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{p.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono">₹{p.amt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details Input Card */}
            <div className="space-y-2 bg-[#141B2D] p-3.5 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payee Name / UPI ID</label>
                <input
                  type="text"
                  value={upiPayee}
                  onChange={e => setUpiPayee(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={upiAmount}
                  onChange={e => setUpiAmount(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-sm font-black font-mono text-emerald-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Self-transfer toggle */}
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelfTransfer}
                  onChange={e => {
                    setIsSelfTransfer(e.target.checked);
                    if (e.target.checked) setUpiCategory('Internal Transfer');
                  }}
                  className="rounded text-orange-500 focus:ring-0"
                />
                <span className="text-[11px]">Mark as Self-Transfer (Noise)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const amt = parseFloat(upiAmount);
                  if (!amt || isNaN(amt)) return;
                  const appName = activeApp === 'gpay' ? 'Google Pay' : activeApp === 'phonepe' ? 'PhonePe' : activeApp === 'paytm' ? 'Paytm' : 'CRED';
                  executePay({
                    app: appName,
                    payee: upiPayee,
                    amount: amt,
                    category: upiCategory,
                    method: upiMethod,
                    isInternalTransfer: isSelfTransfer,
                    rawDescription: `${upiMethod}/DR/${Math.floor(100000000000 + Math.random() * 900000000000)}/${upiPayee.toUpperCase()}/${appName.toUpperCase()}`
                  });
                }}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pay ₹{upiAmount} via {activeApp.toUpperCase()}</span>
              </button>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW: NETFLIX OTT APP */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'netflix' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={() => setActiveApp('home')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Netflix India</span>
              <div className="w-6" />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950 via-slate-950 to-black border border-red-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg">
                    N
                  </div>
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
        {/* VIEW: SPOTIFY APP */}
        {/* --------------------------------------------------------- */}
        {activeApp === 'spotify' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={() => setActiveApp('home')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Spotify Music</span>
              <div className="w-6" />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950 via-slate-950 to-black border border-emerald-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black text-lg">
                    <Music className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Spotify Premium</h3>
                    <p className="text-[10px] text-emerald-300">UPI Recurring e-Mandate</p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  AUTOPAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Setup ad-free music subscription. The engine extracts the mandate schedule to calculate compound savings.
              </p>
            </div>

            <div className="p-3.5 bg-[#141B2D] rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Spotify Individual</span>
                <span className="text-xs font-bold font-mono text-emerald-400">₹119 / month</span>
              </div>
              <p className="text-[11px] text-slate-400">Auto-renews every 30 days via UPI mandate.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                executePay({
                  app: 'Spotify',
                  payee: 'Spotify Premium Music',
                  amount: 119,
                  category: 'Subscriptions & Mandates',
                  method: 'AutoPay Mandate',
                  isRecurring: true,
                  rawDescription: 'AUTOPAY/UPI/SPOTIFY9281/SPOTIFY INDIA RECURRING'
                });
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Music className="w-4 h-4" />
              <span>Subscribe & Authorize Mandate (₹119/mo)</span>
            </button>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* VIEW: SWIGGY / BLINKIT APPS */}
        {/* --------------------------------------------------------- */}
        {(['swiggy', 'blinkit'] as AppId[]).includes(activeApp) && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={() => setActiveApp('home')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {activeApp === 'swiggy' ? 'Swiggy Food' : 'Blinkit 10m'}
              </span>
              <div className="w-6" />
            </div>

            <div className={`p-4 rounded-2xl bg-gradient-to-r ${
              activeApp === 'swiggy' ? 'from-orange-600 to-amber-700' : 'from-yellow-600 to-amber-600'
            } text-white shadow-lg space-y-1`}>
              <h3 className="text-sm font-black uppercase tracking-tight">
                {activeApp === 'swiggy' ? 'Swiggy Food & Instamart' : 'Blinkit Instant Groceries'}
              </h3>
              <p className="text-[11px] text-white/80">
                Select your order and checkout using UPI or card.
              </p>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {(activeApp === 'swiggy' ? [
                { item: 'Biryani Feast + Starter', amt: 480, tag: 'Food & Dining' },
                { item: 'Artisan Sourdough Pizza', amt: 620, tag: 'Food & Dining' },
                { item: 'Cold Brew & Croissant', amt: 290, tag: 'Food & Dining' }
              ] : [
                { item: 'Organic Milk, Eggs & Bread', amt: 240, tag: 'Groceries' },
                { item: 'Fresh Fruit Basket & Berries', amt: 450, tag: 'Groceries' },
                { item: 'Weekly Household Essentials', amt: 890, tag: 'Groceries' }
              ]).map(order => (
                <div key={order.item} className="p-3 rounded-2xl bg-[#141B2D] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{order.item}</div>
                    <div className="text-[10px] text-slate-400 font-mono">₹{order.amt} • {order.tag}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      executePay({
                        app: activeApp === 'swiggy' ? 'Swiggy' : 'Blinkit',
                        payee: `${activeApp === 'swiggy' ? 'Swiggy' : 'Blinkit'} - ${order.item}`,
                        amount: order.amt,
                        category: order.tag,
                        method: 'UPI',
                        rawDescription: `UPI/DR/${Math.floor(100000000000 + Math.random() * 900000000000)}/${activeApp.toUpperCase()}/OKAXIS`
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition"
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
      <div className="py-2.5 px-8 bg-[#070A10] border-t border-slate-800/80 flex items-center justify-around z-30 select-none">
        
        {/* Android Back Button (Triangle pointing left) */}
        <button
          type="button"
          onClick={() => setActiveApp('home')}
          className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
          title="Back to Home"
        >
          <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-400" />
        </button>

        {/* Android Home Button (Circle) */}
        <button
          type="button"
          onClick={() => setActiveApp('home')}
          className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
          title="Home"
        >
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
        </button>

        {/* Android Recents / Overview Button (Square) */}
        <button
          type="button"
          onClick={() => {
            const nextIdx = (ANDROID_APPS.findIndex(a => a.id === activeApp) + 1) % ANDROID_APPS.length;
            setActiveApp(ANDROID_APPS[nextIdx].id);
          }}
          className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
          title="Switch App (Recents)"
        >
          <div className="w-3 h-3 rounded-[2px] border-2 border-slate-400" />
        </button>

      </div>

    </div>
  );
};
