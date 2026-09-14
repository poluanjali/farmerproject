import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  RefreshCw,
  Award,
  DollarSign,
  Building2,
  Calendar,
  Volume2,
  CheckCircle2,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { MandiCropPrice, RegionalLanguage } from '../types';
import { speakRegionalText } from '../utils/speech';
import { formatBilingual } from '../utils/translations';

interface MandiPriceTrackerProps {
  currentLanguage: RegionalLanguage;
  selectedCropHint?: string;
}

export const MandiPriceTracker: React.FC<MandiPriceTrackerProps> = ({
  currentLanguage,
  selectedCropHint,
}) => {
  const [prices, setPrices] = useState<MandiCropPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(selectedCropHint || '');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [harvestQuintals, setHarvestQuintals] = useState<number>(25);
  const [selectedPriceForCalc, setSelectedPriceForCalc] = useState<MandiCropPrice | null>(null);

  const STATES = [
    'all',
    'Haryana',
    'Madhya Pradesh',
    'Karnataka',
    'Telangana',
    'Maharashtra',
    'Andhra Pradesh',
    'Bihar',
    'Rajasthan',
    'Uttar Pradesh',
  ];

  const fetchMandiPrices = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/mandi-prices', window.location.origin);
      if (searchQuery) url.searchParams.set('crop', searchQuery);
      if (selectedState !== 'all') url.searchParams.set('state', selectedState);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.prices) {
        setPrices(data.prices);
        if (!selectedPriceForCalc && data.prices.length > 0) {
          setSelectedPriceForCalc(data.prices[0]);
        }
      }
    } catch (err) {
      console.warn('Mandi prices fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiPrices();
  }, [searchQuery, selectedState]);

  const speakPrice = (item: MandiCropPrice) => {
    const lang = currentLanguage.code.toLowerCase().split('-')[0];
    let text = '';
    if (lang === 'te') {
      text = `${item.crop}: ${item.market} మార్కెట్లో ఈరోజు సగటు ధర క్వింటాలుకు ${item.modalPrice} రూపాయలు. కనిష్ట ధర ${item.minPrice}, గరిష్ట ధర ${item.maxPrice} రూపాయలు.`;
    } else if (lang === 'ta') {
      text = `${item.crop}: ${item.market} சந்தையில் இன்றைய சராசரி விலை குவிண்டாலுக்கு ${item.modalPrice} ரூபாய். குறைந்தபட்சம் ${item.minPrice}, அதிகபட்சம் ${item.maxPrice} ரூபாய்.`;
    } else if (lang === 'en') {
      text = `${item.crop}: Today's modal price in ${item.market} is ${item.modalPrice} Rupees per quintal. Minimum ${item.minPrice} and maximum ${item.maxPrice} Rupees.`;
    } else {
      text = `${item.crop}: ${item.market} मंडी में आज का भाव ${item.modalPrice} रुपये प्रति क्विंटल है। न्यूनतम भाव ${item.minPrice} और अधिकतम भाव ${item.maxPrice} रुपये रहा।`;
    }
    speakRegionalText(text, currentLanguage.code, 1.12);
  };

  return (
    <div id="mandi-price-tracker-module" className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <TrendingUp className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {formatBilingual('Live Mandi (Bazaar) Rates & Market Trends', 'mandiLiveRates', currentLanguage.code)}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                APMC Live
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {formatBilingual('Real-time APMC Mandi rates, MSP benchmarks & AI Sell/Hold advice', 'mandiAdvisory', currentLanguage.code)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMandiPrices}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{formatBilingual('Refresh Rates', 'refreshRates', currentLanguage.code)}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        
        {/* Search */}
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={currentLanguage.code === 'en' ? "Search crop (e.g. Paddy, Tomato, Cotton, Wheat, Onion)..." : "Search crop / फसल खोजें (धान, टमाटर, कपास, गेहूं)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* State Filter */}
        <div className="sm:col-span-5 flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">
              {currentLanguage.code === 'en' ? 'All States (Pan-India)' : 'All States (पूरे भारत की मंडियां)'}
            </option>
            {STATES.filter((s) => s !== 'all').map((st) => (
              <option key={st} value={st}>
                {st} Mandis
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Quick Crop Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['Paddy', 'Wheat', 'Tomato', 'Cotton', 'Soybean', 'Onion', 'Chilli', 'Mustard'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSearchQuery(c === searchQuery ? '' : c)}
            className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 border ${
              searchQuery.toLowerCase() === c.toLowerCase()
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Mandi Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prices.map((item) => {
          const isSelected = selectedPriceForCalc?.id === item.id;
          const diffFromMsp = item.modalPrice - item.mspPrice;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedPriceForCalc(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/30 shadow-sm'
                  : 'border-stone-200 hover:border-emerald-300 bg-white hover:shadow-2xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-stone-900 tracking-tight">
                      {item.crop}
                    </h3>
                    <span className="text-xs text-emerald-800 font-semibold">
                      ({item.cropHindi})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.market}, {item.state}</span>
                    <span>•</span>
                    <span className="italic">{item.variety}</span>
                  </div>
                </div>

                {/* Voice Speak Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakPrice(item);
                  }}
                  title="Listen to Mandi price in regional language"
                  className="p-1.5 text-stone-400 hover:text-emerald-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price Numbers Box */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {formatBilingual('Modal Rate', 'modalRateAvg', currentLanguage.code)}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-950">
                    ₹{item.modalPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-stone-500">/ Qtl</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.trend === 'up' ? (
                      <span className="flex items-center gap-0.5 text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +₹{item.changeAmount}
                      </span>
                    ) : item.trend === 'down' ? (
                      <span className="flex items-center gap-0.5 text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                        <TrendingDown className="w-3.5 h-3.5" />
                        -₹{Math.abs(item.changeAmount)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs font-black text-stone-600 bg-stone-200 px-2 py-0.5 rounded-md">
                        <Minus className="w-3.5 h-3.5" />
                        Stable
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-1">
                    Range: ₹{item.minPrice} - ₹{item.maxPrice}
                  </span>
                </div>
              </div>

              {/* MSP Comparison & AI Sell/Hold Advice */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px] text-stone-600">
                  <span>Govt MSP Benchmark: <strong>₹{item.mspPrice}/Qtl</strong></span>
                  <span className={diffFromMsp >= 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {diffFromMsp >= 0 ? `+₹${diffFromMsp} Above MSP` : `₹${Math.abs(diffFromMsp)} Below MSP`}
                  </span>
                </div>

                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-stone-800 text-[11px] leading-relaxed">
                  <strong className="text-amber-950 font-bold block mb-0.5">
                    💡 {formatBilingual('AI Market Outlook', 'marketOutlook', currentLanguage.code)}:
                  </strong>
                  {item.sellAdvice}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Harvest Payout Calculator (What will farmer get in hand) */}
      {selectedPriceForCalc && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                {formatBilingual('Harvest Profit Calculator', 'harvestProfitCalc', currentLanguage.code)}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {formatBilingual('Expected Earnings', 'expectedEarnings', currentLanguage.code)}: {selectedPriceForCalc.crop}
              </h3>
            </div>

            <div className="text-xs text-emerald-200">
              Current Rate: <strong>₹{selectedPriceForCalc.modalPrice} / Quintal</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Input Quintals */}
            <div className="space-y-1.5">
              <label className="text-xs text-emerald-200 font-semibold block">
                {formatBilingual('Estimated Harvest Quantity (Quintals)', 'estimatedQuantity', currentLanguage.code)}:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={harvestQuintals}
                  onChange={(e) => setHarvestQuintals(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-emerald-800/80 border border-emerald-600 rounded-xl px-3.5 py-2 text-white font-black text-base focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-emerald-300 font-bold shrink-0">Quintals</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-xs text-emerald-200 font-semibold block">
                Quick Selection:
              </span>
              <div className="flex gap-1.5">
                {[10, 25, 50, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setHarvestQuintals(q)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      harvestQuintals === q
                        ? 'bg-amber-400 text-emerald-950 border-amber-400'
                        : 'bg-emerald-800/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {q} Q
                  </button>
                ))}
              </div>
            </div>

            {/* Total Payout */}
            <div className="bg-emerald-800/90 p-3.5 rounded-2xl border border-emerald-600 text-right space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold block">
                {formatBilingual('Total Gross Mandi Payout', 'grossPayout', currentLanguage.code)}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                ₹{(harvestQuintals * selectedPriceForCalc.modalPrice).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-300 block">
                Net gain above MSP: +₹{(harvestQuintals * Math.max(0, selectedPriceForCalc.modalPrice - selectedPriceForCalc.mspPrice)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
