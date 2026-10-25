'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingDown, 
  HelpCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';

import RecommenderCard from '@/components/RecommenderCard';

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
  const [showRecommender, setShowRecommender] = useState<boolean>(true);
  const initialGreeting = useMemo(() => {
    if (rawOutflows > 0) {
      return `Namaste! I'm your Happy Pocket AI. I analyzed your bank feed: you had ₹${rawOutflows.toLocaleString('en-IN')} in total statement activity, with ₹${trueLivingExpenses.toLocaleString('en-IN')} in true living expenses (₹${noiseDeducted.toLocaleString('en-IN')} non-expense transfers filtered out). Where would you like to save next?`;
    }
    return `Namaste! I'm your Happy Pocket AI. Your ledger is currently clean and empty. As you make UPI payments, scan QR codes, or import transactions, I will analyze your true living expenses and highlight leaks in real time. How can I assist you today?`;
  }, [rawOutflows, trueLivingExpenses, noiseDeducted]);

  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>(() => [
    {
      sender: 'ai',
      text: rawOutflows > 0 
        ? `Namaste! I'm your Happy Pocket AI. I analyzed your bank feed: you had ₹${rawOutflows.toLocaleString('en-IN')} in total statement activity, with ₹${trueLivingExpenses.toLocaleString('en-IN')} in true living expenses. Where would you like to save next?`
        : `Namaste! I'm your Happy Pocket AI. Your ledger is currently clean and empty. As you make UPI payments, scan QR codes, or import transactions, I will analyze your true living expenses and highlight leaks in real time. How can I assist you today?`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const quickPrompts = [
    'Turn my leaks into SIP & Insurance',
    'Where is my money leaking this month?',
    'Show my zombie recurring subscriptions',
    'How much can I claim in tax deductions?',
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

    if (rawOutflows === 0) {
      if (q.includes('sip') || q.includes('insurance') || q.includes('invest')) {
        setShowRecommender(true);
        reply = `Your spending ledger is currently empty. However, you can use the live Wealth Simulator below to see how allocating any monthly surplus into Nifty 50 Index funds and Health cover compounds over 5 years!`;
      } else if (q.includes('leak') || q.includes('spending') || q.includes('food')) {
        reply = `You haven't recorded any expenses yet! Once you start using Scan & Pay or Send Money, I will monitor your velocity and highlight any impulse dining or shopping leaks.`;
      } else if (q.includes('sub') || q.includes('zombie') || q.includes('netflix')) {
        reply = `No recurring subscriptions found in your ledger yet. As soon as auto-debits occur, I will detect them and show you alternatives.`;
      } else if (q.includes('tax') || q.includes('80c') || q.includes('deduct')) {
        reply = `I can help you claim tax deductions: up to ₹1.5L under Section 80C (ELSS/EPF), ₹25K under Section 80D (Health Insurance), and ₹50K under 80CCD(1B) (NPS).`;
      } else {
        reply = `Your account is ready. Record a transaction with Scan & Pay or Send Money to see live AI insights!`;
      }
    } else {
      if (q.includes('sip') || q.includes('insurance') || q.includes('reclaim')) {
        setShowRecommender(true);
        reply = `I converted your leaks into live recommendations: Routing filtered surplus into UTI Nifty 50 & Parag Parikh Flexi Cap, plus Term Life cover. See the interactive simulator below.`;
      } else if (q.includes('leak') || q.includes('spending') || q.includes('food')) {
        reply = `Your net living expenditure is ₹${trueLivingExpenses.toLocaleString('en-IN')}. Check the Expense Tracker tab to see category velocity!`;
      } else if (q.includes('sub') || q.includes('zombie')) {
        reply = `Your recurring commitments currently total ₹${monthlyCommitments.toLocaleString('en-IN')}/month. Check the Insights tab for auto-pay details.`;
      } else if (q.includes('tax') || q.includes('80c') || q.includes('deduct')) {
        reply = `Eligible deductions: ₹1,50,000 Section 80C limit (EPF/ELSS), ₹25,000 Section 80D (Health Insurance), and ₹50,000 Section 80CCD(1B) (NPS).`;
      } else {
        reply = `Based on your zero-distortion ledger: your net living outflow is ₹${trueLivingExpenses.toLocaleString('en-IN')}.`;
      }
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
      <div className="p-4 sm:p-5 rounded-[26px] bg-gradient-to-br from-slate-900 to-[#0A172E] text-white shadow-md relative overflow-hidden flex items-center justify-between">
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

        <button
          type="button"
          onClick={() => setShowRecommender(!showRecommender)}
          className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 transition cursor-pointer shrink-0"
        >
          {showRecommender ? 'Hide Simulator' : 'Show Simulator'}
        </button>
      </div>

      {/* Embedded Live Recommender Card */}
      {showRecommender && (
        <RecommenderCard
          initialLeakage={monthlyCommitments > 0 ? monthlyCommitments + 1500 : 2500}
        />
      )}

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
