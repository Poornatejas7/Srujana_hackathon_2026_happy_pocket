'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingDown, 
  HelpCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface AIAdvisorTabProps {
  trueLivingExpenses: number;
  monthlyCommitments: number;
  rawOutflows: number;
  noiseDeducted: number;
  onExploreSubscriptions?: () => void;
  onExploreTax?: () => void;
}

export default function AIAdvisorTab({
  trueLivingExpenses,
  monthlyCommitments,
  rawOutflows,
  noiseDeducted,
  onExploreSubscriptions,
  onExploreTax,
}: AIAdvisorTabProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Namaste! I'm your Happy Pocket AI. I analyzed your bank feed: you had ₹${rawOutflows.toLocaleString('en-IN')} in total statement activity, but ₹${noiseDeducted.toLocaleString('en-IN')} was just noise (self-transfers and Meesho return refunds). Your actual living outflow is ₹${trueLivingExpenses.toLocaleString('en-IN')}. Where would you like to save next?`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const quickPrompts = [
    'Where is my money leaking this month?',
    'Show my zombie recurring subscriptions',
    'How much can I claim in tax deductions?',
    'What if I cut food delivery by 20%?',
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let reply = '';
    const q = text.toLowerCase();

    if (q.includes('leak') || q.includes('spending') || q.includes('food')) {
      reply = `You spent ₹4,200 on dining & food delivery (Swiggy/Zomato) and ₹${monthlyCommitments.toLocaleString('en-IN')} on digital subscriptions (Netflix, Google Play AutoPay). Cutting food delivery frequency twice a week will save ₹1,400/month (₹16,800/year)!`;
    } else if (q.includes('sub') || q.includes('netflix') || q.includes('zombie')) {
      reply = `I found 2 active AutoPay mandates: Netflix India (₹649/mo) and Spotify (₹119/mo). If you pause the unused entertainment tier, you instantly retain ₹9,216 annually in disposable income.`;
    } else if (q.includes('tax') || q.includes('80c') || q.includes('deduct')) {
      reply = `I discovered eligible tax deductions: ₹1,50,000 Section 80C limit (EPF/ELSS), ₹25,000 Section 80D (Health Insurance), and ₹50,000 Section 80CCD(1B) (NPS). Check our Tax Finder tab to download the breakdown!`;
    } else {
      reply = `Based on your zero-distortion ledger: your savings rate is healthy at ~58%. To maximize compounding, consider diverting ₹5,000/month of filtered surplus into an index SIP yielding 12% CAGR.`;
    }

    const aiMsg = {
      sender: 'ai' as const,
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputVal('');
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-4">
      {/* Header card */}
      <div className="p-4 sm:p-5 rounded-[26px] bg-gradient-to-br from-slate-900 to-[#0A172E] text-white shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400">
            <Bot className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Happy Pocket AI Financial Advisor
            </h3>
            <p className="text-[11px] text-slate-400">
              Zero-knowledge spending intelligence & leak discovery
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Suggested Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="text-[11px] py-1.5 px-3 rounded-xl bg-white border border-slate-200/80 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-medium transition cursor-pointer shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-3 min-h-[220px] max-h-[340px] overflow-y-auto p-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-orange-500 text-white rounded-br-xs shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
              {m.time}
            </span>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputVal);
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask AI where money leaked..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-xs"
        />
        <button
          type="submit"
          className="p-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white transition shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
