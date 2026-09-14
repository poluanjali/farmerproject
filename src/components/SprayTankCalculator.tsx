import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Droplets,
  DollarSign,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Leaf,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SprayCalculationResult, RegionalLanguage } from '../types';
import { formatBilingual } from '../utils/translations';

interface SprayTankCalculatorProps {
  currentLanguage: RegionalLanguage;
  initialDosagePerLiter?: number;
  initialDosageUnit?: 'g' | 'ml';
  initialCropName?: string;
  initialChemicalName?: string;
  onClose?: () => void;
}

export const SprayTankCalculator: React.FC<SprayTankCalculatorProps> = ({
  currentLanguage,
  initialDosagePerLiter = 2.0,
  initialDosageUnit = 'g',
  initialCropName,
  initialChemicalName,
  onClose,
}) => {
  const [tankSize, setTankSize] = useState<number>(16); // Default 16L standard pump
  const [areaAcres, setAreaAcres] = useState<number>(1.0);
  const [dosagePerLiter, setDosagePerLiter] = useState<number>(initialDosagePerLiter);
  const [dosageUnit, setDosageUnit] = useState<'g' | 'ml'>(initialDosageUnit);
  const [calculation, setCalculation] = useState<SprayCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Auto-calculate on changes
  useEffect(() => {
    calculate();
  }, [tankSize, areaAcres, dosagePerLiter, dosageUnit]);

  const calculate = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/calculate-spray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tankSizeLiters: tankSize,
          totalAreaAcres: areaAcres,
          dosagePerLiter: dosagePerLiter,
          dosageUnit,
          waterPerAcreLiters: 200,
        }),
      });
      const data = await res.json();
      if (data.success && data.calculation) {
        setCalculation(data.calculation);
      }
    } catch (err) {
      console.warn('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const TANK_PRESETS = [
    { label: '15L Manual Pump (हाथ की टंकी)', size: 15, desc: 'Standard manual knapsack' },
    { label: '16L Battery Sprayer (16L बैटरी स्प्रेयर)', size: 16, desc: 'Most popular 16L farm pump' },
    { label: '20L Power Sprayer (20L पावर स्प्रेयर)', size: 20, desc: 'High capacity battery pump' },
    { label: '200L Tractor Drum (200L ट्रैक्टर ड्रम)', size: 200, desc: 'Tractor trolley boom spray' },
  ];

  return (
    <div id="spray-tank-calculator-module" className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
            <FlaskConical className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {formatBilingual('Knapsack Spray & Tank Calculator', 'sprayCalculator', currentLanguage.code)}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                Precision Agri
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {formatBilingual('Know exact chemical dose per pump tank & avoid crop burn', 'sprayAdvisory', currentLanguage.code)}
            </p>
          </div>
        </div>

        {initialChemicalName && (
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
            <span className="text-emerald-700 font-bold block text-[10px] uppercase">Prescribed Chemical</span>
            <span className="font-extrabold text-emerald-950">{initialChemicalName}</span>
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Tank Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide">
            <Droplets className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatBilingual('1. Select Sprayer Tank Size', 'tankSize', currentLanguage.code)}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TANK_PRESETS.map((p) => (
              <button
                key={p.size}
                type="button"
                onClick={() => setTankSize(p.size)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  tankSize === p.size
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50'
                }`}
              >
                <div className="font-black text-sm text-emerald-900">{p.size} Liters</div>
                <div className="text-[10px] text-gray-500 line-clamp-1">{p.label.split('(')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Field Area (Acres) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              {formatBilingual('2. Field Area', 'fieldArea', currentLanguage.code)}
            </label>
            <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {areaAcres} Acre{areaAcres > 1 ? 's' : ''}
            </span>
          </div>

          <input
            type="range"
            min="0.25"
            max="10"
            step="0.25"
            value={areaAcres}
            onChange={(e) => setAreaAcres(parseFloat(e.target.value))}
            className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>0.25 Acre (10 Guntha)</span>
            <span>2.5 Acres</span>
            <span>10 Acres</span>
          </div>

          <div className="flex gap-1.5 pt-1">
            {[0.5, 1.0, 2.0, 3.0, 5.0].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setAreaAcres(quick)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  areaAcres === quick
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {quick} Ac
              </button>
            ))}
          </div>
        </div>

        {/* 3. Dosage per Liter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center justify-between">
            <span>{formatBilingual('3. Dosage per Liter Water', 'dosagePerLiter', currentLanguage.code)}</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.1"
              max="20"
              step="0.1"
              value={dosagePerLiter}
              onChange={(e) => setDosagePerLiter(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex rounded-xl overflow-hidden border border-stone-300 shrink-0">
              <button
                type="button"
                onClick={() => setDosageUnit('g')}
                className={`px-3 py-2 text-xs font-black transition-colors ${
                  dosageUnit === 'g'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                g {currentLanguage.code === 'en' ? '(Powder)' : '(पाउडर)'}
              </button>
              <button
                type="button"
                onClick={() => setDosageUnit('ml')}
                className={`px-3 py-2 text-xs font-black transition-colors ${
                  dosageUnit === 'ml'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                ml {currentLanguage.code === 'en' ? '(Liquid)' : '(तरल)'}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500">
            Recommended standard: 1.5 to 2.5 {dosageUnit}/L for foliar sprays.
          </p>
        </div>

      </div>

      {/* Calculated Results Banner */}
      {calculation && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Chemical Per Tank (The Most Critical Number for Farmers) */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-emerald-950 p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950/80">
                {formatBilingual('Dose Per 1 Tank', 'chemicalPerTank', currentLanguage.code)} ({tankSize}L)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                {calculation.chemicalPerTank} {dosageUnit}
              </div>
              <p className="text-[11px] font-bold text-emerald-950/90 leading-tight">
                {currentLanguage.code === 'en' ? `Pour exactly ${calculation.chemicalPerTank} ${dosageUnit} into each tank` : `हर एक टंकी में ठीक इतना ही ${dosageUnit === 'g' ? 'पाउडर' : 'तरल'} डालें`}
              </p>
            </div>

            {/* 2. Total Tanks Required */}
            <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                {formatBilingual('Total Tanks to Spray', 'tanksNeeded', currentLanguage.code)}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {calculation.totalTanksNeeded} {currentLanguage.code === 'en' ? 'Tanks' : ''}
              </div>
              <p className="text-[11px] text-emerald-100/90">
                {currentLanguage.code === 'en' 
                  ? `For ${areaAcres} acre(s) • Total ${calculation.totalTanksNeeded} tanks needed` 
                  : `${areaAcres} एकड़ के लिए कुल ${calculation.totalTanksNeeded} टंकियां लगेंगी`}
              </p>
            </div>

            {/* 3. Total Water Volume */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {formatBilingual('Total Water Required', 'waterNeeded', currentLanguage.code)}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-stone-900">
                {calculation.totalWaterNeededLiters} L
              </div>
              <p className="text-[11px] text-stone-600">
                (Standard 200 L/acre water volume)
              </p>
            </div>

            {/* 4. Total Chemical Needed to Buy */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {formatBilingual('Total Chemical to Buy', 'totalChemicalToBuy', currentLanguage.code)}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {calculation.totalChemicalNeeded >= 1000
                  ? `${(calculation.totalChemicalNeeded / 1000).toFixed(2)} kg/L`
                  : `${calculation.totalChemicalNeeded} ${dosageUnit}`}
              </div>
              <p className="text-[11px] text-stone-600">
                {currentLanguage.code === 'en' ? 'Total quantity to purchase from store' : 'दुकान से खरीदने की कुल मात्रा'}
              </p>
            </div>

          </div>

          {/* Economics & Bio Savings Comparison */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-emerald-950 text-sm block">
                  {formatBilingual('Bio-Alternative Cost Comparison', 'costComparison', currentLanguage.code)}:
                </span>
                <span className="text-emerald-800">
                  Estimated Chemical Spray Cost: <strong>₹{calculation.estimatedCostChemicalRupees}</strong> vs Organic Neem/Bio Spray: <strong>₹{calculation.estimatedCostOrganicRupees}</strong>
                </span>
              </div>
            </div>

            <div className="bg-white px-3.5 py-1.5 rounded-xl border border-emerald-300 font-extrabold text-emerald-800 shrink-0">
              Potential Savings: ~₹{calculation.savingsRupees} with Integrated Pest Management
            </div>
          </div>

          {/* Precision Application Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
            <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Recommended Spray Nozzle:</strong>
                {calculation.nozzleType}
              </div>
            </div>

            <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Walking Speed & Canopy Height:</strong>
                {calculation.spraySpeedAdvice}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
