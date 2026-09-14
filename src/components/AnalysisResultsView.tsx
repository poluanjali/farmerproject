import React, { useState } from 'react';
import {
  CropSoilAnalysisResult,
  RegionalLanguage,
} from '../types';
import {
  ShieldAlert,
  Bug,
  Droplets,
  FlaskConical,
  SunMedium,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Leaf,
  Calendar,
  Wind,
  ShieldCheck,
  Award,
  FileText,
  Calculator,
  TrendingUp,
  CloudSun,
  Share2,
} from 'lucide-react';
import { BilingualText } from './BilingualText';
import { PrescriptionModal } from './PrescriptionModal';
import { formatBilingual } from '../utils/translations';

interface AnalysisResultsViewProps {
  result: CropSoilAnalysisResult;
  currentLanguage: RegionalLanguage;
  photoPreviewUrl?: string | null;
  onOpenCalculator?: (params?: { chemicalName?: string; dosagePerLiter?: number; cropName?: string }) => void;
  onOpenWeather?: () => void;
  onOpenMandi?: (cropName?: string) => void;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  result,
  currentLanguage,
  photoPreviewUrl,
  onOpenCalculator,
  onOpenWeather,
  onOpenMandi,
}) => {
  const [showPrescriptionModal, setShowPrescriptionModal] = useState<boolean>(false);
  const isCrop = result.mode === 'crop' || result.mode === 'both';
  const isSoil = result.mode === 'soil' || result.mode === 'both';

  const getStatusBadge = () => {
    switch (result.healthStatus) {
      case 'healthy':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          text: 'Healthy Condition',
          subText: 'स्वस्थ स्थिति',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
        };
      case 'moderate':
        return {
          bg: 'bg-amber-100 text-amber-950 border-amber-300',
          text: 'Moderate Attention Needed',
          subText: 'मध्यम लक्षण - ध्यान दें',
          icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
        };
      case 'critical':
      case 'alert':
      default:
        return {
          bg: 'bg-red-100 text-red-950 border-red-300',
          text: 'Critical Disease Alert',
          subText: 'गंभीर रोग संकेत',
          icon: <ShieldAlert className="w-4 h-4 text-red-700" />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div id="kisan-analysis-results" className="space-y-5">
      
      {/* 1. Primary Diagnosis Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          
          {/* Photo Thumbnail if available */}
          {photoPreviewUrl && (
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-2xs">
              <img
                src={photoPreviewUrl}
                alt="Analyzed Crop or Soil"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Diagnosis Details */}
          <div className="flex-1 space-y-3.5 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-800 text-white uppercase tracking-wider">
                  {result.mode === 'crop' ? 'Crop Diagnosis' : result.mode === 'soil' ? 'Soil Test' : 'Crop & Soil'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${statusBadge.bg}`}>
                  {statusBadge.icon}
                  <span>{statusBadge.text}</span>
                </span>
              </div>

              {/* Health Score Meter */}
              <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                <Award className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">
                  Health Score:
                </span>
                <span className="text-sm font-black text-emerald-800">
                  {result.healthScorePercent}%
                </span>
              </div>
            </div>

            {/* Entity Name */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                <BilingualText text={result.detectedEntity} className="text-xl sm:text-2xl font-black text-gray-900" layout="inline" langCode={currentLanguage.code} />
              </h2>
              {result.scientificOrLocalName && (
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 italic mt-0.5">
                  {result.scientificOrLocalName}
                </p>
              )}
            </div>

            {/* Summary description */}
            <div className="text-sm sm:text-base text-gray-800 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
              <BilingualText text={result.conditionSummary} className="text-sm sm:text-base text-gray-900 font-medium" subClassName="text-xs sm:text-sm text-emerald-900/90 font-normal mt-1 block" layout="stacked" langCode={currentLanguage.code} />
            </div>

            {/* Farmer Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>{formatBilingual('Get Doctor Prescription Slip', 'prescriptionSlip', currentLanguage.code)}</span>
              </button>

              {onOpenCalculator && (
                <button
                  type="button"
                  onClick={() => onOpenCalculator({
                    chemicalName: result.pesticideGuide.recommendedSpray,
                    cropName: result.detectedEntity,
                  })}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs sm:text-sm font-black transition-all shadow-xs"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{formatBilingual('Calculate Spray Tanks', 'calculateTanks', currentLanguage.code)}</span>
                </button>
              )}

              {onOpenWeather && (
                <button
                  type="button"
                  onClick={onOpenWeather}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs sm:text-sm font-bold transition-all"
                >
                  <CloudSun className="w-4 h-4 text-sky-600" />
                  <span>{formatBilingual('Check Spray Weather', 'checkWeather', currentLanguage.code)}</span>
                </button>
              )}

              {onOpenMandi && (
                <button
                  type="button"
                  onClick={() => onOpenMandi(result.detectedEntity)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs sm:text-sm font-bold transition-all"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>{formatBilingual('Live Mandi Rates', 'mandiBhav', currentLanguage.code)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Early Disease Signals & Pests (if crop related) */}
      {isCrop && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Early Disease Signals Card */}
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-900 font-extrabold text-base border-b border-red-50 pb-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>{formatBilingual('Early Disease Symptoms', 'earlySignals', currentLanguage.code)}</span>
            </div>
            {result.earlyDiseaseSignals && result.earlyDiseaseSignals.length > 0 ? (
              <ul className="space-y-2.5">
                {result.earlyDiseaseSignals.map((signal, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <BilingualText text={signal} className="text-xs sm:text-sm text-gray-800 font-medium" subClassName="text-xs text-red-800/80 mt-0.5 block" layout="stacked" langCode={currentLanguage.code} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600">No acute disease marks observed in sample.</p>
            )}
          </div>

          {/* Identified Pests Card */}
          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-950 font-extrabold text-base border-b border-amber-50 pb-2">
              <Bug className="w-5 h-5 text-amber-600" />
              <span>{formatBilingual('Identified Pests & Insects', 'identifiedPests', currentLanguage.code)}</span>
            </div>
            {result.identifiedPests && result.identifiedPests.length > 0 ? (
              <ul className="space-y-2.5">
                {result.identifiedPests.map((pest, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <BilingualText text={pest} className="text-xs sm:text-sm text-gray-800 font-medium" subClassName="text-xs text-amber-800/80 mt-0.5 block" layout="stacked" langCode={currentLanguage.code} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600">Pest activity appears minimal or controlled.</p>
            )}
          </div>

        </div>
      )}

      {/* 3. Pesticide Dosage & Pest Control Guide (Crucial Requirement) */}
      <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                {formatBilingual('Pesticide Dosage & Pest Control Guide', 'pesticideGuide', currentLanguage.code)}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Accurate chemical spray, per-liter water ratio, and organic alternative
              </p>
            </div>
          </div>

          {result.pesticideGuide.safetyIntervalDays && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
              {formatBilingual('Waiting Period (PHI)', 'waitingPeriod', currentLanguage.code)}: {result.pesticideGuide.safetyIntervalDays} Days
            </span>
          )}
        </div>

        {/* Highlighted Dosage Callout Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              {formatBilingual('Chemical Spray Formulation', 'chemicalSpray', currentLanguage.code)}:
            </span>
            <div className="mt-1">
              <BilingualText
                text={result.pesticideGuide.recommendedSpray}
                className="text-base font-extrabold text-emerald-950"
                subClassName="text-xs text-emerald-800/90 font-medium mt-0.5 block"
                layout="stacked"
                langCode={currentLanguage.code}
              />
            </div>
            <div className="text-xs text-emerald-800 mt-2">
              <span className="font-semibold">Method: </span>
              <BilingualText text={result.pesticideGuide.applicationMethod} layout="inline" langCode={currentLanguage.code} />
            </div>
          </div>

          <div className="bg-amber-50/90 p-4 rounded-xl border-2 border-amber-300">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              {formatBilingual('Exact Dosage (Per Liter Water)', 'exactDosage', currentLanguage.code)}:
            </span>
            <div className="mt-1">
              <BilingualText
                text={result.pesticideGuide.dosagePerLiter}
                className="text-lg font-black text-amber-950"
                subClassName="text-xs text-amber-800 font-semibold mt-0.5 block"
                layout="stacked"
                langCode={currentLanguage.code}
              />
            </div>
            <div className="text-xs text-amber-900 font-bold mt-2">
              <span>{formatBilingual('Per Acre Dose', 'perAcre', currentLanguage.code)}: </span>
              <BilingualText text={result.pesticideGuide.dosagePerAcre} layout="inline" langCode={currentLanguage.code} />
            </div>
          </div>
        </div>

        {/* Organic Alternative */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-start gap-3">
          <Leaf className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-green-900 uppercase tracking-wide">
              {formatBilingual('Organic / Biological Alternative', 'organicBio', currentLanguage.code)}:
            </span>
            <div className="mt-1">
              <BilingualText
                text={result.pesticideGuide.organicAlternative}
                className="text-xs sm:text-sm text-green-950 font-semibold"
                subClassName="text-xs text-green-900/90 font-normal mt-0.5 block"
                layout="stacked"
                langCode={currentLanguage.code}
              />
            </div>
          </div>
        </div>

        {/* Safety Precautions */}
        {result.pesticideGuide.precautions && result.pesticideGuide.precautions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-gray-700">
              Safety Precautions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.pesticideGuide.precautions.map((precaution, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <BilingualText text={precaution} layout="inline" langCode={currentLanguage.code} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Soil Health & Cultivable Crops (Crucial Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Soil Analysis & Fertility */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base border-b border-emerald-50 pb-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>{formatBilingual('Soil Health & Cultivable Crops', 'soilHealth', currentLanguage.code)}</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-gray-100">
              <span className="font-medium text-gray-600">Soil Type:</span>
              <BilingualText text={result.soilHealth.soilType} className="font-bold text-gray-900" layout="inline" langCode={currentLanguage.code} />
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-gray-100">
              <span className="font-medium text-gray-600">Texture & Moisture:</span>
              <BilingualText text={result.soilHealth.textureAndMoisture} className="font-bold text-gray-900" layout="inline" langCode={currentLanguage.code} />
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-gray-100">
              <span className="font-medium text-gray-600">Fertility Level:</span>
              <BilingualText text={result.soilHealth.estimatedFertility} className="font-bold text-emerald-700" layout="inline" langCode={currentLanguage.code} />
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-gray-100">
              <span className="font-medium text-gray-600">pH Estimate:</span>
              <span className="font-bold text-gray-900">{result.soilHealth.phRangeEstimate}</span>
            </div>
          </div>

          {/* Organic matter tips */}
          {result.soilHealth.organicMatterTips && result.soilHealth.organicMatterTips.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-700 block mb-1">
                Soil Enrichment Recommendations:
              </span>
              <ul className="space-y-1">
                {result.soilHealth.organicMatterTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <BilingualText text={tip} layout="inline" langCode={currentLanguage.code} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Cultivable Crops for this Soil */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base border-b border-emerald-50 pb-2">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <span>Cultivable Crops for this Soil</span>
          </div>

          {/* Primary Recommended Crops */}
          <div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">
              Best Suitable Crops:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.cultivableCrops.primaryCrops.map((crop, idx) => (
                <span key={idx} className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <BilingualText text={crop} layout="inline" langCode={currentLanguage.code} />
                </span>
              ))}
            </div>
          </div>

          {/* Commercial Cash Crops */}
          <div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">
              High-Profit Cash Crops:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.cultivableCrops.commercialCashCrops.map((crop, idx) => (
                <span key={idx} className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300">
                  <BilingualText text={crop} layout="inline" langCode={currentLanguage.code} />
                </span>
              ))}
            </div>
          </div>

          {/* Seasonal & Rotation */}
          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <div className="text-xs text-gray-700">
              <span className="font-bold text-emerald-900">Recommended Season: </span>
              <BilingualText text={result.cultivableCrops.seasonalFit} layout="inline" langCode={currentLanguage.code} />
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-bold text-emerald-900">Crop Rotation: </span>
              <BilingualText text={result.cultivableCrops.cropRotationTip} layout="inline" langCode={currentLanguage.code} />
            </div>
          </div>
        </div>

      </div>

      {/* 5. Weather Advisory & Today's Action Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Weather & Irrigation Advisory */}
        <div className="bg-sky-50/70 rounded-2xl p-5 border border-sky-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sky-950 font-extrabold text-base border-b border-sky-200/80 pb-2">
            <SunMedium className="w-5 h-5 text-sky-600" />
            <span>{formatBilingual('Weather & Spray Timing Advisory', 'weatherAdvice', currentLanguage.code)}</span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-sky-950">
            <div className="flex items-start gap-2">
              <Droplets className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-sky-950">Irrigation Advice:</span>
                <BilingualText text={result.weatherAndFieldAdvisory.irrigationAdvice} layout="stacked" subClassName="text-xs text-sky-800 font-normal mt-0.5 block" langCode={currentLanguage.code} />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Wind className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-sky-950">Weather Precaution:</span>
                <BilingualText text={result.weatherAndFieldAdvisory.weatherPrecaution} layout="stacked" subClassName="text-xs text-sky-800 font-normal mt-0.5 block" langCode={currentLanguage.code} />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-sky-950">Best Time to Spray:</span>
                <BilingualText text={result.weatherAndFieldAdvisory.bestTimeToAct} className="font-semibold text-emerald-900" layout="inline" langCode={currentLanguage.code} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Checklist */}
        <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-950 font-extrabold text-base border-b border-amber-200/80 pb-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span>{formatBilingual('Immediate 3-Step Action Plan', 'actionPlan', currentLanguage.code)}</span>
          </div>

          <div className="space-y-2">
            {result.quickActionSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-emerald-950 font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <BilingualText text={step} className="font-semibold text-gray-900" subClassName="text-xs text-emerald-900 font-normal mt-0.5 block" layout="stacked" langCode={currentLanguage.code} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Digital Agronomist Prescription Modal */}
      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        result={result}
        currentLanguage={currentLanguage}
      />

    </div>
  );
};
