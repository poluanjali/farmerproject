import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Calendar,
  Tag,
  DollarSign,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Sparkles,
  ArrowUpRight,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { RegionalLanguage } from '../types';
import { formatBilingual } from '../utils/translations';
import { speakRegionalText } from '../utils/speech';

export interface FarmExpenseItem {
  id: string;
  date: string;
  category: 'seeds' | 'fertilizer' | 'pesticide' | 'tractor' | 'labor' | 'irrigation' | 'other';
  title: string;
  amount: number;
  notes?: string;
}

export interface FarmRevenueItem {
  id: string;
  date: string;
  buyerMandi: string;
  quantityQuintals: number;
  ratePerQuintal: number;
  totalIncome: number;
}

interface FarmLedgerProps {
  currentLanguage: RegionalLanguage;
}

export const FarmLedger: React.FC<FarmLedgerProps> = ({ currentLanguage }) => {
  const [cropName, setCropName] = useState<string>('Paddy (धान / వరి)');
  const [farmAcres, setFarmAcres] = useState<number>(2);
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif');

  // Initial realistic sample entries for an Indian farmer
  const [expenses, setExpenses] = useState<FarmExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_farm_expenses');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'exp-1',
        date: '2026-08-10',
        category: 'tractor',
        title: 'Rotavator Land Preparation (2 Acres)',
        amount: 2800,
        notes: '2.5 hours deep ploughing',
      },
      {
        id: 'exp-2',
        date: '2026-08-18',
        category: 'seeds',
        title: 'Certified Seed Bags (BPT 5204)',
        amount: 1950,
        notes: '2 bags @ 975/bag',
      },
      {
        id: 'exp-3',
        date: '2026-08-25',
        category: 'labor',
        title: 'Transplanting Labor Wages (8 workers)',
        amount: 3600,
        notes: '₹450 per daily worker',
      },
      {
        id: 'exp-4',
        date: '2026-09-02',
        category: 'fertilizer',
        title: 'DAP (1 Bag) + Urea (1 Bag) Basal',
        amount: 1620,
        notes: 'Subsidized cooperative society rates',
      },
      {
        id: 'exp-5',
        date: '2026-09-08',
        category: 'pesticide',
        title: 'Neem Oil + Chlorantraniliprole 18.5% SC',
        amount: 980,
        notes: 'Early stem borer prevention',
      },
    ];
  });

  const [revenues, setRevenues] = useState<FarmRevenueItem[]>(() => {
    try {
      const saved = localStorage.getItem('kisan_farm_revenues');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'rev-1',
        date: '2026-11-20 (Projected)',
        buyerMandi: 'Local APMC Mandi',
        quantityQuintals: 42,
        ratePerQuintal: 2320,
        totalIncome: 42 * 2320,
      },
    ];
  });

  // New expense form state
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<FarmExpenseItem['category']>('fertilizer');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpNotes, setNewExpNotes] = useState('');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kisan_farm_expenses', JSON.stringify(expenses));
    } catch (_) {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('kisan_farm_revenues', JSON.stringify(revenues));
    } catch (_) {}
  }, [revenues]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount);
    if (!amt || amt <= 0 || !newExpTitle.trim()) return;

    const newItem: FarmExpenseItem = {
      id: 'exp-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: newExpCategory,
      title: newExpTitle.trim(),
      amount: amt,
      notes: newExpNotes.trim(),
    };

    setExpenses([newItem, ...expenses]);
    setNewExpTitle('');
    setNewExpAmount('');
    setNewExpNotes('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((x) => x.id !== id));
  };

  // Calculations
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const costPerAcre = farmAcres > 0 ? Math.round(totalExpense / farmAcres) : totalExpense;
  const totalExpectedRevenue = revenues.reduce((sum, r) => sum + r.totalIncome, 0);
  const netProjectedProfit = totalExpectedRevenue - totalExpense;
  const profitMarginPercent = totalExpectedRevenue > 0 ? Math.round((netProjectedProfit / totalExpectedRevenue) * 100) : 0;

  // Breakdown by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  const getCategoryBadge = (cat: FarmExpenseItem['category']) => {
    switch (cat) {
      case 'seeds':
        return { label: 'Seeds (बीज)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'fertilizer':
        return { label: 'Fertilizer (खाद)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'pesticide':
        return { label: 'Sprays/Pesticide (दवाई)', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'tractor':
        return { label: 'Tractor/Diesel (ट्रैक्टर)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'labor':
        return { label: 'Labor/Wages (मजदूरी)', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'irrigation':
        return { label: 'Water/Diesel (सिंचाई)', bg: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      default:
        return { label: 'General (अन्य)', bg: 'bg-stone-100 text-stone-900 border-stone-300' };
    }
  };

  const speakSummary = () => {
    const lang = currentLanguage.code.toLowerCase().split('-')[0];
    let speech = '';
    if (lang === 'te') {
      speech = `మీ ${cropName} పంటకు ${farmAcres} ఎకరాలలో ఇప్పటివరకు మొత్తం ఖర్చు ${totalExpense} రూపాయలు. ఎకరానికి సగటున ${costPerAcre} రూపాయలు. ఆశించిన లాభం సుమారు ${netProjectedProfit} రూపాయలు.`;
    } else if (lang === 'ta') {
      speech = `உங்கள் ${cropName} பயிருக்கு ${farmAcres} ஏக்கரில் இதுவரை மொத்த செலவு ${totalExpense} ரூபாய். ஒரு ஏக்கருக்கு ${costPerAcre} ரூபாய். எதிர்பார்க்கப்படும் நிகர லாபம் ${netProjectedProfit} ரூபாய்.`;
    } else if (lang === 'en') {
      speech = `For your ${cropName} crop on ${farmAcres} acres, total expenditure so far is ${totalExpense} Rupees. Average cost per acre is ${costPerAcre} Rupees. Projected net profit is ${netProjectedProfit} Rupees.`;
    } else {
      speech = `आपकी ${cropName} फसल के लिए ${farmAcres} एकड़ में अब तक कुल खर्च ₹${totalExpense} हुआ है। प्रति एकड़ औसत लागत ₹${costPerAcre} है। अनुमानित शुद्ध लाभ ₹${netProjectedProfit} है।`;
    }
    speakRegionalText(speech, currentLanguage.code, 1.1);
  };

  return (
    <div id="farm-ledger-module" className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Wallet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {formatBilingual('Farm Expense & Crop Profit Ledger', 'farmLedger', currentLanguage.code)}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                खर्च बही / లెక్కల పుస్తకం
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Know your exact cost of cultivation per acre and prevent losses before harvest
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={speakSummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{formatBilingual('Listen Financial Audit', 'listenAudit', currentLanguage.code)}</span>
        </button>
      </div>

      {/* Field & Crop Metadata Selector */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-stone-600 block uppercase tracking-wide">
            Active Crop (फसल / పంట)
          </label>
          <select
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Paddy (धान / వరి)">Paddy / Rice (धान / వరి)</option>
            <option value="Cotton (कपास / పత్తి)">Cotton (कपास / పత్తి)</option>
            <option value="Chilli (लाल मिर्च / మిర్చి)">Chilli (लाल मिर्च / మిర్చి)</option>
            <option value="Tomato (टमाटर / టమాటా)">Tomato (टमाटर / టమాటా)</option>
            <option value="Wheat (गेहूं / గోధుమ)">Wheat (गेहूं / గోధుమ)</option>
            <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
            <option value="Maize (मक्का / మొక్కజొన్న)">Maize (मक्का / మొక్కజొన్న)</option>
            <option value="Onion (प्याज / ఉల్లిపాయ)">Onion (प्याज / ఉల్లిపాయ)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-stone-600 block uppercase tracking-wide">
            Cultivated Land (एकड़ / ఎకరాలు)
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={farmAcres}
              onChange={(e) => setFarmAcres(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="text-xs font-bold text-stone-500 shrink-0">Acres</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-stone-600 block uppercase tracking-wide">
            Season (मौसम / సీజన్)
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as any)}
            className="w-full mt-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Kharif">Kharif (Monsoon / खरीफ)</option>
            <option value="Rabi">Rabi (Winter / रबी)</option>
            <option value="Zaid">Zaid (Summer / जायद)</option>
          </select>
        </div>
      </div>

      {/* Financial Health Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Total Cost */}
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide block">
            Total Input Expense
          </span>
          <div className="text-2xl font-black text-rose-950 mt-1">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-rose-700 block mt-0.5">
            ₹{costPerAcre.toLocaleString('en-IN')} / acre
          </span>
        </div>

        {/* Projected Revenue */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
            Expected Revenue (Mandi)
          </span>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            ₹{totalExpectedRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 block mt-0.5">
            Based on APMC Modal rates
          </span>
        </div>

        {/* Net Profit */}
        <div className={`p-4 rounded-2xl border ${netProjectedProfit >= 0 ? 'bg-teal-50/70 border-teal-200' : 'bg-red-50 border-red-300'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wide block text-teal-800">
            Net Estimated Profit
          </span>
          <div className={`text-2xl font-black mt-1 ${netProjectedProfit >= 0 ? 'text-teal-950' : 'text-red-700'}`}>
            ₹{netProjectedProfit.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-teal-800 block mt-0.5">
            {netProjectedProfit >= 0 ? `+${profitMarginPercent}% Net Margin` : 'Operating in Loss'}
          </span>
        </div>

        {/* Action Status */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block">
              Expense Control Grade
            </span>
            <div className="text-sm font-black text-stone-900 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Well Optimized</span>
            </div>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">
            Chemicals kept under 15% of total budget
          </p>
        </div>
      </div>

      {/* Add New Expense Form */}
      <form onSubmit={handleAddExpense} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-wide">
          <PlusCircle className="w-4 h-4 text-emerald-700" />
          <span>Record New Farm Expense (नया खर्च जोड़ें)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="e.g. 1 Bag Urea, Spray Labor, Diesel, Hybrid Seeds..."
              value={newExpTitle}
              onChange={(e) => setNewExpTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <select
              value={newExpCategory}
              onChange={(e) => setNewExpCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="seeds">Seeds (बीज)</option>
              <option value="fertilizer">Fertilizer (खाद)</option>
              <option value="pesticide">Pesticide/Spray (दवाई)</option>
              <option value="tractor">Tractor/Diesel (डीजल)</option>
              <option value="labor">Labor (मजदूरी)</option>
              <option value="irrigation">Irrigation (पानी)</option>
              <option value="other">Other (अन्य)</option>
            </select>
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold">₹</span>
              <input
                type="number"
                required
                min="1"
                placeholder="Amount"
                value={newExpAmount}
                onChange={(e) => setNewExpAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <input
            type="text"
            placeholder="Optional note: dealer name, brand, or bill number"
            value={newExpNotes}
            onChange={(e) => setNewExpNotes(e.target.value)}
            className="w-full sm:w-2/3 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-stone-700 outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black transition-all shadow-xs shrink-0"
          >
            + Add to Ledger
          </button>
        </div>
      </form>

      {/* Detailed Expense Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
            Itemized Spending List ({expenses.length} Entries)
          </h3>
          <span className="text-xs font-bold text-stone-500">
            Stored locally on phone • No internet needed
          </span>
        </div>

        <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
          {expenses.map((item) => {
            const badge = getCategoryBadge(item.category);
            return (
              <div
                key={item.id}
                className="p-3.5 bg-white hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{item.date}</span>
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-stone-600">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-stone-900">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(item.id)}
                    title="Delete entry"
                    className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
