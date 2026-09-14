import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  Sun,
  Layers,
  Droplets,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  FileText,
  Phone,
  HelpCircle,
  Calculator,
  Volume2,
} from 'lucide-react';
import { KisanGovScheme, RegionalLanguage } from '../types';
import { speakRegionalText } from '../utils/speech';
import { formatBilingual } from '../utils/translations';

interface KisanSchemesHubProps {
  currentLanguage: RegionalLanguage;
}

export const KisanSchemesHub: React.FC<KisanSchemesHubProps> = ({ currentLanguage }) => {
  const [farmerAcres, setFarmerAcres] = useState<number>(2.5);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const SCHEMES: KisanGovScheme[] = [
    {
      id: 'pm-kisan',
      name: 'PM-Kisan Samman Nidhi',
      hindiName: 'प्रधानमंत्री किसान सम्मान निधि योजना',
      category: 'subsidy',
      benefitAmount: '₹6,000 / Year',
      benefitDescription: 'Direct bank transfer of ₹2,000 every 4 months directly into Aadhaar-seeded bank account for all landholding farmers.',
      eligibility: 'All small & marginal landholding farmer families with cultivable land in their name.',
      keyDocuments: ['Aadhaar Card', 'Land Record (7/12 or Khasra-Khatauni)', 'Active Bank Passbook with NPCI Aadhaar link'],
      helpline: '155261 / 1800-11-5526',
      officialUrl: 'https://pmkisan.gov.in',
      maxEstimatedGrant: 6000,
    },
    {
      id: 'pmfby',
      name: 'PM Fasal Bima Yojana (PMFBY)',
      hindiName: 'प्रधानमंत्री फसल बीमा योजना',
      category: 'insurance',
      benefitAmount: 'Full Crop Loss Compensation (Up to ₹45,000/acre)',
      benefitDescription: 'Comprehensive risk insurance covering pre-sowing to post-harvest crop loss from unseasonal rainfall, floods, pests & hailstorms. Premium only 1.5% to 2%.',
      eligibility: 'All farmers growing notified crops in notified areas. Important: Claim must be registered within 72 hours of localized calamity!',
      keyDocuments: ['Sowing Certificate (बुवाई प्रमाण पत्र)', 'Aadhaar Card', 'Bank Account Details', 'Land Ownership document'],
      helpline: '14447 (Toll-Free Crop Insurance Helpline)',
      officialUrl: 'https://pmfby.gov.in',
      maxEstimatedGrant: 45000,
    },
    {
      id: 'pm-kusum',
      name: 'PM-KUSUM Solar Agriculture Pump',
      hindiName: 'पीएम-कुसुम सौर ऊर्जा कृषि पंप योजना',
      category: 'machinery',
      benefitAmount: 'Up to 90% Subsidy on Solar Pump',
      benefitDescription: 'Government provides 60% subsidy + 30% bank loan for standalone 3HP to 7.5HP solar pumps, saving huge diesel fuel costs.',
      eligibility: 'Individual farmers, farmer groups (FPOs), water user associations.',
      keyDocuments: ['Aadhaar Card', 'Land Registry', 'Bank Account details', 'Self-declaration of borewell or open well source'],
      helpline: '1800-180-3333',
      officialUrl: 'https://pmkusum.mnre.gov.in',
      maxEstimatedGrant: 180000,
    },
    {
      id: 'micro-irrigation',
      name: 'Per Drop More Crop (Drip & Sprinkler)',
      hindiName: 'प्रति बूंद अधिक फसल (ड्रिप एवं फव्वारा सिंचाई)',
      category: 'subsidy',
      benefitAmount: '55% to 70% Subsidy on Drip Kits',
      benefitDescription: 'Up to 70% financial assistance for installing precision drip and sprinkler systems, reducing water usage by 50% and fertilizer cost by 30%.',
      eligibility: 'All category farmers with access to water source.',
      keyDocuments: ['Land 7/12 record', 'Soil & Water test report', 'Aadhaar Card', 'Quotation from empanelled micro-irrigation company'],
      helpline: '1800-180-1551',
      officialUrl: 'https://pmksy.gov.in',
      maxEstimatedGrant: 45000,
    },
    {
      id: 'soil-health-card',
      name: 'Soil Health Card & Micronutrient Support',
      hindiName: 'मृदा स्वास्थ्य कार्ड योजना',
      category: 'soil',
      benefitAmount: '100% Free Lab Testing + 50% Zinc/Gypsum Subsidy',
      benefitDescription: 'Free testing of 12 chemical and physical soil parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) with tailored fertilizer dosage cards.',
      eligibility: 'Every farmer in village clusters through Krishi Vigyan Kendra (KVK).',
      keyDocuments: ['Soil Sample Bag from field', 'Khasra Number', 'Aadhaar Card'],
      helpline: '1800-180-1551',
      officialUrl: 'https://soilhealth.dac.gov.in',
      maxEstimatedGrant: 2500,
    },
    {
      id: 'kcc',
      name: 'Kisan Credit Card (KCC)',
      hindiName: 'किसान क्रेडिट कार्ड (सस्ता फसली ऋण)',
      category: 'credit',
      benefitAmount: '4% Effective Interest Loan up to ₹3 Lakhs',
      benefitDescription: 'Collateral-free loan up to ₹1.6 Lakhs (and up to ₹3 Lakhs with 3% prompt repayment incentive) for seeds, fertilizer, and crop operations.',
      eligibility: 'Owner cultivators, tenant farmers, oral lessees, and sharecroppers.',
      keyDocuments: ['Land Records', 'Aadhaar & PAN Card', 'Voter ID', 'No dues certificate from local cooperative bank'],
      helpline: '1800-11-2211',
      officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
      maxEstimatedGrant: 120000,
    },
  ];

  const filteredSchemes = selectedCategory === 'all'
    ? SCHEMES
    : SCHEMES.filter(s => s.category === selectedCategory);

  // Total eligible benefits calculation
  const totalEstimatedBenefits = Math.round(
    6000 + // PM Kisan base
    (farmerAcres * 35000 * 0.05) + // Expected crop insurance cover value
    (farmerAcres <= 5 ? 40000 : 70000) // Drip & solar subsidy portion
  );

  const speakScheme = (s: KisanGovScheme) => {
    const lang = currentLanguage.code.toLowerCase().split('-')[0];
    let text = '';
    if (lang === 'te') {
      text = `${s.name}: లబ్ధి మొత్తం ${s.benefitAmount}. ${s.benefitDescription}`;
    } else if (lang === 'ta') {
      text = `${s.name}: உதவித்தொகை ${s.benefitAmount}. ${s.benefitDescription}`;
    } else if (lang === 'en') {
      text = `${s.name}: Financial benefit ${s.benefitAmount}. ${s.benefitDescription}`;
    } else {
      text = `${s.name}: लाभ राशि ${s.benefitAmount}। ${s.benefitDescription}`;
    }
    speakRegionalText(text, currentLanguage.code, 1.12);
  };

  return (
    <div id="kisan-schemes-hub-module" className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
            <Landmark className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {formatBilingual('Government Kisan Schemes & Direct Subsidies', 'kisanSchemes', currentLanguage.code)}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                Kisan Kalyan
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {formatBilingual('Step-by-step eligibility, documents & direct application portals', 'officialAdvisory', currentLanguage.code)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Phone className="w-3.5 h-3.5" />
          <span>{formatBilingual('Kisan Helpline', 'kisanHelpline', currentLanguage.code)}</span>
        </div>
      </div>

      {/* Interactive Land Acreage Subsidy Estimator */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Personalized Subsidy Calculator
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Estimated Government Support for Your Farm
            </h3>
          </div>

          <div className="bg-emerald-800/80 px-4 py-2 rounded-xl border border-emerald-600 text-right">
            <span className="text-[10px] text-emerald-200 uppercase font-bold block">
              Estimated Potential Benefit
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">
              ₹{totalEstimatedBenefits.toLocaleString('en-IN')}+
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
          <div className="w-full sm:w-2/3 space-y-1">
            <div className="flex justify-between text-xs text-emerald-200">
              <span>Select Your Cultivable Land:</span>
              <strong className="text-amber-300 font-black">{farmerAcres} Acres</strong>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={farmerAcres}
              onChange={(e) => setFarmerAcres(parseFloat(e.target.value))}
              className="w-full h-2 bg-emerald-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-1/3 justify-end text-xs">
            {[1, 2.5, 5, 10].map((ac) => (
              <button
                key={ac}
                type="button"
                onClick={() => setFarmerAcres(ac)}
                className={`flex-1 py-1 rounded-lg font-bold border transition-colors ${
                  farmerAcres === ac
                    ? 'bg-amber-400 text-emerald-950 border-amber-400'
                    : 'bg-emerald-800/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {ac} Ac
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Schemes (सभी योजनाएं)' },
          { id: 'subsidy', label: 'Cash Subsidies (नकद अनुदान)' },
          { id: 'insurance', label: 'Crop Insurance (फसल बीमा)' },
          { id: 'machinery', label: 'Solar & Machinery (सोलर व उपकरण)' },
          { id: 'credit', label: 'Cheap Credit / KCC (सस्ता कर्ज)' },
          { id: 'soil', label: 'Soil Health (मिट्टी स्वास्थ्य)' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
              selectedCategory === cat.id
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-white hover:shadow-sm transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-stone-900 tracking-tight">
                    {s.name}
                  </h4>
                  <span className="text-xs text-emerald-800 font-semibold block">
                    {s.hindiName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => speakScheme(s)}
                  title="Listen in regional language"
                  className="p-1.5 text-stone-400 hover:text-emerald-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Benefit Highlight Banner */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                  {formatBilingual('Direct Benefit Amount', 'directBenefit', currentLanguage.code)}:
                </span>
                <span className="text-sm font-black text-amber-950">
                  {s.benefitAmount}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed">
                {s.benefitDescription}
              </p>

              {/* Eligibility */}
              <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">
                  {formatBilingual('Eligibility & Criteria', 'eligibility', currentLanguage.code)}:
                </strong>
                {s.eligibility}
              </div>

              {/* Documents Checklist */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block">
                  Mandatory Documents Checklist:
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {s.keyDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Links & Helpline */}
            <div className="border-t border-stone-100 pt-3 flex items-center justify-between gap-2 text-xs">
              <span className="text-stone-500 text-[11px]">
                Helpline: <strong>{s.helpline}</strong>
              </span>

              <a
                href={s.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                <span>{formatBilingual('Apply on Govt Portal', 'applyPortal', currentLanguage.code)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
