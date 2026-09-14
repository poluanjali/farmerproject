import React, { useState, useEffect, useMemo } from 'react';
import {
  CropSoilAnalysisResult,
  RegionalLanguage,
} from '../types';
import {
  X,
  Printer,
  Share2,
  Check,
  Award,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Clock,
  Phone,
  Plus,
  Minus,
  Sparkles,
  Droplets,
  Sprout,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { BilingualText } from './BilingualText';
import { formatBilingual } from '../utils/translations';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CropSoilAnalysisResult;
  currentLanguage: RegionalLanguage;
  farmerName?: string;
  fieldAreaAcres?: number;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  result,
  currentLanguage,
  farmerName: initialFarmerName = 'Kisan Bhai',
  fieldAreaAcres: initialAcres = 1,
}) => {
  const [farmerName, setFarmerName] = useState(initialFarmerName);
  const [areaAcres, setAreaAcres] = useState<number>(initialAcres || 1);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine mode
  const isSoilMode = useMemo(() => {
    if (result.mode === 'soil') return true;
    const spray = result.pesticideGuide?.recommendedSpray?.toLowerCase() || '';
    const isSprayNA =
      !spray ||
      spray.includes('not applicable') ||
      spray.includes('వర్తించదు') ||
      spray.includes('लागू नहीं') ||
      spray.includes('n/a') ||
      spray.includes('none');
    return Boolean(result.soilHealth?.soilType && isSprayNA);
  }, [result]);

  const isPreventiveMode = useMemo(() => {
    if (isSoilMode) return false;
    const spray = result.pesticideGuide?.recommendedSpray?.toLowerCase() || '';
    const isSprayNA =
      !spray ||
      spray.includes('not applicable') ||
      spray.includes('వర్తించదు') ||
      spray.includes('लागू नहीं') ||
      spray.includes('none') ||
      spray.includes('no spray') ||
      spray.includes('not required') ||
      spray.includes('healthy');
    return result.healthStatus === 'healthy' || isSprayNA;
  }, [isSoilMode, result]);

  const isCurativeMode = !isSoilMode && !isPreventiveMode;

  // Prescription ID and timestamp
  const prescriptionId = useMemo(() => {
    return `KM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  const inspectionDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Acreage adjustments
  const handleIncreaseAcres = () => {
    setAreaAcres((prev) => +(prev + (prev < 2 ? 0.5 : 1)).toFixed(1));
  };

  const handleDecreaseAcres = () => {
    setAreaAcres((prev) => (prev > 0.5 ? +(prev - (prev <= 2 ? 0.5 : 1)).toFixed(1) : 0.5));
  };

  // Calculations for curative chemical
  const calculatedChemicalDetails = useMemo(() => {
    const rawPerAcre = result.pesticideGuide?.dosagePerAcre || '';
    const match = rawPerAcre.match(/([\d.]+)\s*(grams?|gm?|g|ml|liters?|ltr|l|kg)/i);
    const waterLiters = Math.round(areaAcres * 200);
    const tanksCount = Math.ceil(waterLiters / 16);

    let calculatedQuantity = '';
    if (match) {
      const perAcreVal = parseFloat(match[1]);
      const unit = match[2];
      const totalVal = (perAcreVal * areaAcres).toFixed(perAcreVal % 1 === 0 ? 0 : 1);
      calculatedQuantity = `${totalVal} ${unit} in ~${waterLiters} Liters water (${tanksCount} Backpack Tanks of 16L)`;
    } else {
      calculatedQuantity = `Proportional dose in ~${waterLiters} Liters water (${tanksCount} Backpack Tanks of 16L)`;
    }

    return {
      waterLiters,
      tanksCount,
      calculatedQuantity,
    };
  }, [result, areaAcres]);

  // Calculations for soil mode
  const calculatedSoilDetails = useMemo(() => {
    const fymMin = (areaAcres * 4).toFixed(1);
    const fymMax = (areaAcres * 5).toFixed(1);
    const gypsumMin = Math.round(areaAcres * 75);
    const gypsumMax = Math.round(areaAcres * 100);
    const trichodermaKg = +(areaAcres * 2).toFixed(1);
    const psbKg = +(areaAcres * 2).toFixed(1);

    // Contextual amendments based on detected soil type
    const soilTypeLower = (result.soilHealth?.soilType || result.detectedEntity || '').toLowerCase();
    let amendmentTitle = 'Soil Amendment / నేల సవరణ';
    let amendmentText = 'Gypsum 75-100 kg/acre to improve porosity, drainage, and root respiration.';
    
    if (soilTypeLower.includes('red') || soilTypeLower.includes('लाल') || soilTypeLower.includes('ఎర్ర')) {
      amendmentTitle = 'Soil Neutralizer & Phosphorus Booster (సున్నం / రాక్ ఫాస్ఫేట్)';
      amendmentText = `Agricultural Lime @ ${Math.round(areaAcres * 100)} kg or Single Super Phosphate (SSP) to correct acidity and supply calcium + sulfur.`;
    } else if (soilTypeLower.includes('sand') || soilTypeLower.includes('बलुई') || soilTypeLower.includes('ఇసుక')) {
      amendmentTitle = 'Moisture & Silt Conditioner (ఒండ్రు మట్టి / పచ్చిరొట్ట ఎరువు)';
      amendmentText = `Tank silt incorporation (10-15 cartloads) + green manuring (Dhaincha/Sunhemp) to boost moisture retention.`;
    } else {
      amendmentTitle = 'Flocculation & Aeration Conditioner (జిప్సం / వేసవి దుక్కులు)';
      amendmentText = `Gypsum ${gypsumMin} - ${gypsumMax} kg to enhance clay drainage, prevent surface crusting, and reduce soil compaction.`;
    }

    return {
      fymMin,
      fymMax,
      gypsumMin,
      gypsumMax,
      trichodermaKg,
      psbKg,
      amendmentTitle,
      amendmentText,
    };
  }, [result, areaAcres]);

  // Share text generation
  const shareText = useMemo(() => {
    if (isSoilMode) {
      const primaryCrops = result.cultivableCrops?.primaryCrops?.join(', ') || 'Cotton, Soybean, Pulses, Wheat';
      return `*🌱 KISAN MITRA - SOIL HEALTH & FERTILIZER PRESCRIPTION SLIP*
📋 *Prescription ID:* ${prescriptionId}
👤 *Farmer:* ${farmerName} | *Field Size:* ${areaAcres} Acre(s)
📅 *Date:* ${inspectionDate}
🔬 *Soil Type:* ${result.detectedEntity}
📊 *Fertility Index:* ${result.healthScorePercent}% (${result.healthStatus.toUpperCase()})
🧪 *Estimated pH:* ${result.soilHealth?.phRangeEstimate || '6.5 - 7.5'}

🌾 *PRESCRIBED BASAL NUTRIENTS & AMENDMENTS:*
• *Organic FYM / Compost:* ${calculatedSoilDetails.fymMin} - ${calculatedSoilDetails.fymMax} Tonnes
• *Soil Conditioner:* ${calculatedSoilDetails.amendmentText}
• *Bio-fertilizer Inoculation:* ${calculatedSoilDetails.trichodermaKg} kg Trichoderma viride + ${calculatedSoilDetails.psbKg} kg PSB mixed with compost
• *Tillage & Drainage:* Deep summer plowing; prepare Broad Bed Furrow (BBF) to prevent waterlogging

🌽 *RECOMMENDED HIGH-YIELD CROPS:*
• ${primaryCrops}

⚠️ *Dealer Notice:* Dispense certified bio-fertilizers, quality gypsum, and certified seeds.
📞 *Kisan Helpline:* 1800-180-1551 (Toll-Free, 6 AM - 10 PM)
*Certified by Kisan Mitra Extension Agronomist*`;
    }

    if (isPreventiveMode) {
      return `*🌱 KISAN MITRA - PREVENTIVE CROP HEALTH ADVISORY SLIP*
📋 *Prescription ID:* ${prescriptionId}
👤 *Farmer:* ${farmerName} | *Field Size:* ${areaAcres} Acre(s)
📅 *Date:* ${inspectionDate}
🔬 *Crop:* ${result.detectedEntity}
📊 *Health Index:* ${result.healthScorePercent}% (HEALTHY & VIGOROUS)

🌿 *PREVENTIVE NUTRITION & BIO-PROTECTION:*
• *Foliar Nutrient Booster:* Water-soluble 19:19:19 @ 5g/L (or Grade-II Micronutrients @ 2.5g/L)
• *Organic Shield:* Cold-pressed Neem Oil 1500 ppm @ 3 ml/L + sticker
• *Water Volume for ${areaAcres} Acre(s):* ~${calculatedChemicalDetails.waterLiters} Liters (${calculatedChemicalDetails.tanksCount} Backpack Tanks)
• *Best Spray Window:* Early morning (7-10 AM) or calm evening

📞 *Kisan Helpline:* 1800-180-1551 (Toll-Free)
*Certified by Kisan Mitra Extension Agronomist*`;
    }

    // Curative mode
    return `*🌱 KISAN MITRA - AI AGRONOMIST CROP PRESCRIPTION SLIP*
📋 *Prescription ID:* ${prescriptionId}
👤 *Farmer:* ${farmerName} | *Field Size:* ${areaAcres} Acre(s)
📅 *Date:* ${inspectionDate}
🔬 *Diagnosis:* ${result.detectedEntity}
📊 *Severity:* ${result.healthStatus.toUpperCase()} (Health Index: ${result.healthScorePercent}%)
${result.scientificOrLocalName ? `🧪 *Pathogen / Pest:* ${result.scientificOrLocalName}\n` : ''}
💊 *PRESCRIBED CHEMICAL FORMULATION:*
• *Medicine:* ${result.pesticideGuide.recommendedSpray}
• *Dose per Liter:* ${result.pesticideGuide.dosagePerLiter}
• *Dose per Acre:* ${result.pesticideGuide.dosagePerAcre}
👉 *Total for your ${areaAcres} Acre(s):* ${calculatedChemicalDetails.calculatedQuantity}
• *Application:* ${result.pesticideGuide.applicationMethod}
• *Waiting Period (PHI):* ${result.pesticideGuide.safetyIntervalDays || '7'} Days

🌿 *ORGANIC / BIOLOGICAL ALTERNATIVE:*
• ${result.pesticideGuide.organicAlternative}

⚠️ *Dealer Notice:* Dispense ONLY the generic/active compound specified above.
📞 *Kisan Helpline:* 1800-180-1551 (Toll-Free, 6 AM - 10 PM)
*Certified by Kisan Mitra Extension Agronomist*`;
  }, [
    isSoilMode,
    isPreventiveMode,
    prescriptionId,
    farmerName,
    areaAcres,
    inspectionDate,
    result,
    calculatedSoilDetails,
    calculatedChemicalDetails,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="prescription-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-emerald-300 overflow-hidden flex flex-col max-h-[94vh] my-auto print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Action Bar (hidden in print) - STICKY TOP */}
        <div className="sticky top-0 z-30 shrink-0 bg-emerald-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-sm print:hidden">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm min-w-0 pr-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span className="truncate">
              {isSoilMode
                ? formatBilingual('Soil Health & Fertilizer Prescription Slip', 'soilPrescriptionSlip', currentLanguage.code)
                : isPreventiveMode
                ? formatBilingual('Preventive Crop Health & Foliar Nutrition Slip', 'preventiveCropSlip', currentLanguage.code)
                : formatBilingual('Doctor Prescription Slip', 'prescriptionSlip', currentLanguage.code)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-bold transition-colors cursor-pointer"
              title="Print Prescription"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              type="button"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Prominent Cross Mark (Close button) */}
            <button
              id="close-prescription-modal"
              onClick={onClose}
              type="button"
              aria-label="Close prescription"
              title="Close (Esc)"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm ring-1 ring-white/20 ml-1 cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
              <span className="font-extrabold text-xs">✕ Close</span>
            </button>
          </div>
        </div>

        {/* Prescription Card Content (Scrollable & Printable area) */}
        <div id="printable-prescription" className="overflow-y-auto flex-1 p-4 sm:p-7 space-y-4 text-stone-900 font-sans print:p-6">
          
          {/* Header of Prescription */}
          <div className="border-b-2 border-emerald-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-400 flex items-center justify-center font-black text-base shadow-xs">
                  KM
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-none">
                    KISAN MITRA AGRI CLINIC
                  </h1>
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest block mt-0.5">
                    {isSoilMode
                      ? 'Certified Soil Health & Basal Nutrition Advisory'
                      : 'AI Agronomist Diagnosis & Clinical Prescription'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                ICAR Extension Advisory & Krishi Vigyan Kendra Framework Standard
              </p>
            </div>

            <div className="text-left sm:text-right bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 shrink-0">
              <div className="text-xs font-mono font-bold text-emerald-900 flex items-center gap-1.5 justify-end">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{prescriptionId}</span>
              </div>
              <div className="text-[11px] text-stone-600 mt-0.5">
                {inspectionDate}
              </div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">
                Standard Verified Slip
              </div>
            </div>
          </div>

          {/* Farmer Meta & Interactive Farm Size Adjuster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
            <div className="sm:col-span-1">
              <span className="text-stone-500 font-semibold block">{formatBilingual('Farmer Name', 'farmerName', currentLanguage.code)}:</span>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="Enter farmer name"
                className="font-bold text-stone-900 bg-transparent border-b border-stone-300 focus:outline-none focus:border-emerald-600 w-full py-0.5 text-sm print:border-none"
              />
            </div>

            <div className="sm:col-span-1">
              <span className="text-stone-500 font-semibold block">{formatBilingual('Diagnosis Specimen', 'diagnosisLabel', currentLanguage.code)}:</span>
              <div className="font-extrabold text-stone-900 text-sm">
                <BilingualText text={result.detectedEntity} layout="inline" langCode={currentLanguage.code} />
              </div>
              {result.scientificOrLocalName && (
                <div className="text-[11px] text-emerald-800 italic font-medium truncate">
                  {result.scientificOrLocalName}
                </div>
              )}
            </div>

            {/* Field Area Selector with +/- Controls */}
            <div className="sm:col-span-1 bg-white p-2 rounded-xl border border-stone-200 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                {formatBilingual('Field Size', 'fieldAreaAcres', currentLanguage.code)}:
              </span>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDecreaseAcres}
                    className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors print:hidden cursor-pointer"
                    title="Decrease Acres"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-black text-emerald-950 text-sm px-1 min-w-[3rem] text-center">
                    {areaAcres} Acre{areaAcres > 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseAcres}
                    className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors print:hidden cursor-pointer"
                    title="Increase Acres"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">
                  Scaling Active
                </span>
              </div>
            </div>
          </div>

          {/* Status & Clinical Index Banner */}
          <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {result.healthStatus === 'healthy' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              ) : result.healthStatus === 'moderate' ? (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
              )}
              <div className="min-w-0">
                <span className="font-extrabold text-stone-900 uppercase">
                  {isSoilMode ? 'Fertility Status' : 'Severity'}: {result.healthStatus}
                </span>
                <span className="text-stone-600 block text-[11px] truncate">
                  {result.conditionSummary}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2 border-l border-amber-200 ml-2">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                {isSoilMode ? 'Fertility Score' : 'Health Index'}
              </span>
              <span className="text-base font-black text-emerald-900">
                {result.healthScorePercent}%
              </span>
            </div>
          </div>

          {/* ==================== 1. SOIL MODE PRESCRIPTION ==================== */}
          {isSoilMode && (
            <div className="space-y-4">
              
              {/* Rx Prescribed Basal Amendments */}
              <div className="border-2 border-emerald-700 rounded-2xl p-4 bg-emerald-50/40 space-y-3.5">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-emerald-900 font-serif italic">℞</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                      {formatBilingual('Prescribed Soil Amendments & Basal Nutrients', 'prescribedSoilTreatment', currentLanguage.code)}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    Soil-Specific Dosage
                  </span>
                </div>

                {/* Grid of Basal Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Organic FYM / Compost */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <span>Basal Organic Manure / సేంద్రియ ఎరువు:</span>
                    </div>
                    <div className="text-sm font-black text-emerald-950 mt-1">
                      {calculatedSoilDetails.fymMin} - {calculatedSoilDetails.fymMax} Tonnes FYM / Compost
                    </div>
                    <span className="text-[11px] text-stone-600 mt-0.5 block">
                      (లేదా {+(areaAcres * 2).toFixed(1)} - {+(areaAcres * 2.5).toFixed(1)} టన్నుల వర్మీ కంపోస్ట్)
                    </span>
                  </div>

                  {/* Soil Amendment (Gypsum / Lime) */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{calculatedSoilDetails.amendmentTitle}:</span>
                    </div>
                    <div className="text-xs font-extrabold text-stone-900 mt-1 leading-snug">
                      {calculatedSoilDetails.amendmentText}
                    </div>
                  </div>

                  {/* Bio-fertilizers & Root Inoculants */}
                  <div className="bg-white p-3 rounded-xl border border-stone-200 sm:col-span-2">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                      <Leaf className="w-4 h-4 text-emerald-700" />
                      <span>Bio-Fertilizer & Root Protection Inoculants / జీవ ఎరువులు:</span>
                    </div>
                    <div className="text-xs text-stone-800 mt-1 leading-relaxed">
                      Mix <strong className="text-emerald-950">{calculatedSoilDetails.trichodermaKg} kg Trichoderma viride</strong> +{' '}
                      <strong className="text-emerald-950">{calculatedSoilDetails.psbKg} kg PSB (Phosphate Solubilizing Bacteria)</strong> in 100 kg well-decomposed FYM, keep moist in shade for 7 days, and broadcast across the field before final harrowing.
                    </div>
                  </div>
                </div>

                {/* Soil Profile Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Soil Type</span>
                    <span className="font-extrabold text-emerald-950 text-xs truncate block">
                      {result.soilHealth?.soilType || result.detectedEntity}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Estimated pH</span>
                    <span className="font-extrabold text-emerald-950 text-xs block">
                      {result.soilHealth?.phRangeEstimate || '6.5 - 7.8'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Fertility Grade</span>
                    <span className="font-extrabold text-emerald-950 text-xs block">
                      {result.soilHealth?.estimatedFertility || 'Medium'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Organic Matter</span>
                    <span className="font-extrabold text-emerald-950 text-xs block">
                      {result.healthScorePercent >= 70 ? 'Optimal' : 'Needs Booster'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Crops & Rotation */}
              <div className="bg-green-50/70 p-3.5 rounded-xl border border-green-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-green-950 text-xs sm:text-sm">
                  <Sprout className="w-4 h-4 text-green-700" />
                  <span>{formatBilingual('Recommended High-Yield Crops for this Soil', 'soilHealth', currentLanguage.code)}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-800">
                  <div className="bg-white p-2.5 rounded-lg border border-green-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Best Fit Crops:</span>
                    <span className="font-extrabold text-emerald-900 text-xs">
                      {result.cultivableCrops?.primaryCrops?.join(', ') || 'Cotton, Soybean, Wheat, Gram, Pigeon Pea'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-green-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Commercial Cash Crops:</span>
                    <span className="font-extrabold text-emerald-900 text-xs">
                      {result.cultivableCrops?.commercialCashCrops?.join(', ') || 'Chili, Onion, Groundnut, Sugarcane'}
                    </span>
                  </div>
                </div>
                {result.cultivableCrops?.cropRotationTip && (
                  <p className="text-[11px] text-stone-700 italic mt-1">
                    💡 <strong>Crop Rotation Tip: </strong>
                    <BilingualText text={result.cultivableCrops.cropRotationTip} layout="inline" langCode={currentLanguage.code} />
                  </p>
                )}
              </div>

              {/* Tillage & Water Drainage Advice */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>Drainage & Tillage Guidelines / నీటిపారుదల & దుక్కి సలహా:</span>
                </span>
                <p className="text-stone-700 leading-relaxed text-[11px]">
                  Carry out deep summer plowing to eliminate soil-borne pathogens. In heavy clay or regur soils, construct Broad Bed Furrows (BBF) or ridges to avoid waterlogging during intense monsoon rains.
                </p>
              </div>

              {/* Input Dealer Notice for Soil Inputs */}
              <div className="bg-stone-100 p-3 rounded-xl border border-dashed border-stone-400 text-[11px] text-stone-700">
                <span className="font-bold text-stone-900 block mb-0.5">
                  ⚠️ {formatBilingual('Input Dealer Notice', 'dealerNotice', currentLanguage.code)}:
                </span>
                Please dispense certified bio-fertilizers (Trichoderma / PSB), certified farmyard inputs, quality agricultural Gypsum, and certified high-germination seeds. Do not push unneeded chemical pesticides or unverified growth stimulants.
              </div>

            </div>
          )}

          {/* ==================== 2. PREVENTIVE CROP PRESCRIPTION ==================== */}
          {isPreventiveMode && (
            <div className="space-y-4">
              
              {/* Preventive Foliar Care Card */}
              <div className="border-2 border-emerald-600 rounded-2xl p-4 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-emerald-900 font-serif italic">℞</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                      {formatBilingual('Preventive Health & Foliar Nutrition Slip', 'preventiveCropSlip', currentLanguage.code)}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    Crop Vigorous & Healthy
                  </span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Organic Preventive Shield */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span>Preventive Organic Barrier / నివారణ సేంద్రియ రక్షణ:</span>
                    </div>
                    <div className="text-sm font-black text-emerald-950 mt-1">
                      Cold-Pressed Neem Oil (1500 ppm) @ 3 ml per Liter of water
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Mix with 1 ml liquid soap/sticker per liter to create an insect repellant shield against sucking pests (thrips, aphids, whitefly).
                    </p>
                  </div>

                  {/* Foliar Nutrition Booster */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Foliar Growth & Flower Booster / పోషక పిచికారీ:</span>
                    </div>
                    <div className="text-sm font-black text-emerald-950 mt-1">
                      Water-Soluble 19:19:19 (NPK) @ 5 grams per Liter of water
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      (లేదా సూక్ష్మపోషకాల మిశ్రమం Grade-II @ 2.5 గ్రాములు / లీటరు నీటికి).
                    </p>
                  </div>

                  {/* Dynamic Water & Area Calculation */}
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-950 block">
                      Total Water Volume for your {areaAcres} Acre(s):
                    </span>
                    <div className="text-sm font-black text-emerald-900 mt-0.5">
                      ~{calculatedChemicalDetails.waterLiters} Liters of clean water ({calculatedChemicalDetails.tanksCount} Backpack Tanks of 16L)
                    </div>
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      Spray during calm morning (7 AM - 10 AM) or late afternoon.
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Guidelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-green-50/70 p-3 rounded-xl border border-green-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-green-900">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span>Canopy & Soil Maintenance:</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed text-[11px]">
                    Maintain moderate soil moisture. Avoid excessive urea/nitrogen application to prevent lush tender foliage that attracts pests.
                  </p>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Inspection Frequency:</span>
                  </div>
                  <p className="text-stone-800 text-[11px]">
                    Re-check under leaf surfaces every <strong>5–7 days</strong> during active vegetative and flowering stages.
                  </p>
                </div>
              </div>

              {/* Dealer Notice */}
              <div className="bg-stone-100 p-3 rounded-xl border border-dashed border-stone-400 text-[11px] text-stone-700">
                <span className="font-bold text-stone-900 block mb-0.5">
                  ⚠️ {formatBilingual('Input Dealer Notice', 'dealerNotice', currentLanguage.code)}:
                </span>
                The crop is healthy. Please dispense only genuine water-soluble fertilizers, cold-pressed neem oil, and organic bio-stimulants. Do NOT sell chemical pesticides unless fresh pest incidence is confirmed.
              </div>

            </div>
          )}

          {/* ==================== 3. CURATIVE CROP PRESCRIPTION ==================== */}
          {isCurativeMode && (
            <div className="space-y-4">
              
              {/* Rx Prescribed Chemical Treatment */}
              <div className="border-2 border-emerald-600 rounded-2xl p-4 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-emerald-900 font-serif italic">℞</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                      {formatBilingual('Prescribed Spray Formulation', 'prescribedSpray', currentLanguage.code)}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    Verified Curative Dosage
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  {/* Recommended Medicine */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      {formatBilingual('Chemical Spray Formulation', 'chemicalSpray', currentLanguage.code)}:
                    </span>
                    <div className="text-base font-black text-emerald-950 mt-0.5">
                      <BilingualText text={result.pesticideGuide.recommendedSpray} layout="inline" langCode={currentLanguage.code} />
                    </div>
                  </div>

                  {/* Exact Dosage Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">
                        {formatBilingual('Exact Dosage (Per Liter Water)', 'exactDosage', currentLanguage.code)}:
                      </span>
                      <span className="font-extrabold text-emerald-900 text-sm">
                        <BilingualText text={result.pesticideGuide.dosagePerLiter} layout="inline" langCode={currentLanguage.code} />
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">
                        {formatBilingual('Per Acre Dose', 'perAcre', currentLanguage.code)}:
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        <BilingualText text={result.pesticideGuide.dosagePerAcre} layout="inline" langCode={currentLanguage.code} />
                      </span>
                    </div>
                  </div>

                  {/* Dynamically Calculated Quantity for Farmer's Specific Acreage */}
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 text-xs">
                    <span className="font-extrabold text-amber-950 block uppercase tracking-wider text-[10px]">
                      👉 {formatBilingual('Total Required for your Farm Area', 'totalChemicalNeeded', currentLanguage.code)} ({areaAcres} Acre{areaAcres > 1 ? 's' : ''}):
                    </span>
                    <div className="text-sm sm:text-base font-black text-emerald-950 mt-0.5">
                      {calculatedChemicalDetails.calculatedQuantity}
                    </div>
                    <span className="text-[10px] text-stone-600 mt-0.5 block">
                      Calculated as per CIBRC & ICAR standard spray volume (200 Liters water per acre).
                    </span>
                  </div>

                  {/* Application Method */}
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-stone-700">Application Method: </span>
                    <BilingualText text={result.pesticideGuide.applicationMethod} layout="inline" langCode={currentLanguage.code} />
                  </div>
                </div>
              </div>

              {/* Organic Alternative & Safety Interval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-green-50/70 p-3 rounded-xl border border-green-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-green-900">
                    <Leaf className="w-4 h-4 text-green-700" />
                    <span>{formatBilingual('Organic / Biological Alternative', 'organicBio', currentLanguage.code)}:</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed text-[11px]">
                    <BilingualText text={result.pesticideGuide.organicAlternative} layout="inline" langCode={currentLanguage.code} />
                  </p>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>{formatBilingual('Waiting Period (PHI)', 'waitingPeriod', currentLanguage.code)}:</span>
                  </div>
                  <p className="text-stone-800 text-[11px]">
                    Do not harvest or consume produce for at least{' '}
                    <strong className="text-amber-900 font-extrabold">
                      {result.pesticideGuide.safetyIntervalDays || '7'} days
                    </strong>{' '}
                    post application to eliminate chemical residue.
                  </p>
                </div>
              </div>

              {/* Strict Mandate for Agro-Chemical Dealer */}
              <div className="bg-stone-100 p-3 rounded-xl border border-dashed border-stone-400 text-[11px] text-stone-700">
                <span className="font-bold text-stone-900 block mb-0.5">
                  ⚠️ {formatBilingual('Input Dealer Notice', 'dealerNotice', currentLanguage.code)}:
                </span>
                Please dispense ONLY the generic/active compound specified above. Do not compel the farmer to purchase unrelated nutrient cocktails, stickers, or unprescribed high-margin mixtures.
              </div>

            </div>
          )}

          {/* Footer & Signature Stamp (Authentic Clinic Seal) */}
          <div className="border-t-2 border-stone-200 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-500">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Kisan Call Center: <strong className="text-emerald-950 font-bold">1800-180-1551</strong> (Toll Free, 6 AM - 10 PM)</span>
              </div>
              <div className="text-[10px] text-stone-500">
                Registration No: ICAR-EXT/2026/89421 • Dr. Kisan Mitra AI Agronomist Cell
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block border-2 border-emerald-700 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase text-emerald-800 rotate-[-1deg] bg-emerald-50">
                ✓ CERTIFIED AI AGRONOMIST CLINIC
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar (hidden in print) - STICKY BOTTOM */}
        <div className="sticky bottom-0 z-20 shrink-0 bg-stone-50 border-t border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-stone-500 hidden sm:block">
            Show this slip at your local Krishi Seva Kendra or fertilizer dealer.
          </div>
          <div className="flex items-center justify-end w-full sm:w-auto gap-2">
            <button
              id="close-prescription-footer-btn"
              onClick={onClose}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>{formatBilingual('Close', 'close', currentLanguage.code)}</span>
            </button>
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription Slip</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

