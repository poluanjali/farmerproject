import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Leaf,
  PhoneCall,
  Share2,
  CheckCircle2,
  Volume2,
  LifeBuoy,
} from 'lucide-react';
import { CropEmergencyGuide, RegionalLanguage } from '../types';
import { speakRegionalText } from '../utils/speech';
import { formatBilingual } from '../utils/translations';

interface OfflineCropFirstAidProps {
  currentLanguage: RegionalLanguage;
}

export const OfflineCropFirstAid: React.FC<OfflineCropFirstAidProps> = ({ currentLanguage }) => {
  const [selectedEmergency, setSelectedEmergency] = useState<string>('armyworm');

  const EMERGENCIES: CropEmergencyGuide[] = [
    {
      id: 'armyworm',
      crop: 'Maize, Paddy, Sugarcane, Millets',
      emergency: 'Sudden Fall Armyworm / Caterpillar Outbreak',
      emergencyHindi: 'फॉल आर्मीवर्म / लश्करी सुंडी का अचानक प्रकोप',
      urgency: 'critical',
      symptoms: [
        'Large ragged holes in leaves and central whorl eaten away overnight',
        'Sawdust-like brownish frass (caterpillar excreta) deep in the funnel',
        'Visible inverted "Y" mark on the head of caterpillars',
      ],
      first24HourAction: [
        'Act immediately before larvae bore deep into whorls; evening spray is most effective.',
        'Place bird perches (T-shaped bamboo sticks, 15-20 per acre) to invite predator birds.',
        'Apply dry sand or fine wood ash mixed with lime (9:1 ratio) directly into leaf whorls to dehydrate larvae.',
      ],
      organicImmediateSpray: 'Spray Bacillus thuringiensis (Bt) @ 2g/L or 5% Neem Seed Kernel Extract (NSKE) with 1 ml soap sticker per liter.',
      emergencyHelpline: '1800-180-1551',
    },
    {
      id: 'wilting',
      crop: 'Tomato, Chilli, Brinjal, Cotton, Pulses',
      emergency: 'Sudden Bacterial Wilt / Root Rot Post Heavy Rain',
      emergencyHindi: 'भारी बारिश के बाद अचानक पौधे मुरझाना (उकठा / जड़ गलन)',
      urgency: 'critical',
      symptoms: [
        'Vigorous green plants suddenly wilt during daytime without leaf yellowing',
        'Roots appear discolored, brown, water-soaked and peel easily',
        'Foul odor when broken stems are placed in clear water (bacterial stream)',
      ],
      first24HourAction: [
        'Stop irrigation immediately; dig drainage channels to drain stagnant water within 2 hours.',
        'Drench soil root zone with Copper Oxychloride 50% WP @ 3g/L + Streptocycline @ 1g per 10 Liters water.',
        'Remove and burn severely infected collapsed plants to prevent patch spread.',
      ],
      organicImmediateSpray: 'Soil drenching with Trichoderma viride @ 10g/L mixed with well-decomposed cow dung slurry.',
      emergencyHelpline: '1800-180-1551',
    },
    {
      id: 'yellow-rust',
      crop: 'Wheat, Barley',
      emergency: 'Yellow Rust Epidemic Outbreak',
      emergencyHindi: 'गेहूं में पीला रतुआ / हल्दी रोग का अचानक फैलाव',
      urgency: 'critical',
      symptoms: [
        'Powdery yellow streaks along the veins of wheat leaves like turmeric powder',
        'Yellow powder leaves a yellow stain on fingers when touched',
        'Rapid spread across the whole field in 48-72 hours under cool, humid weather',
      ],
      first24HourAction: [
        'Do not delay! Yellow rust can destroy 80-100% of the grain filling stage within 5 days.',
        'Spray Propiconazole 25% EC (Tilt) @ 1 ml per liter of water (200 ml in 200 liters of water per acre).',
        'Direct nozzle onto leaf surface during calm morning or late evening hours.',
      ],
      organicImmediateSpray: 'Immediate foliar spray of sour buttermilk (खट्टी छाछ - 5 liters fermented in copper pot) diluted in 100 liters of water.',
      emergencyHelpline: '1800-180-1551',
    },
    {
      id: 'zinc-deficiency',
      crop: 'Paddy (Khaira Disease), Maize, Citrus',
      emergency: 'Acute Zinc / Micronutrient Shock (Khaira Disease)',
      emergencyHindi: 'जिंक की गंभीर कमी / धान का खैरा रोग',
      urgency: 'high',
      symptoms: [
        'Rusty brown or bronze patches appearing between veins on lower leaves',
        'Stunted, bush-like crop growth with delayed tillering',
        'Roots turn brown with minimal new white root hairs',
      ],
      first24HourAction: [
        'Drain standing water and allow soil to aerate for 24 hours.',
        'Foliar rescue spray: Dissolve 5 kg Zinc Sulphate (21%) + 2.5 kg Slaked Lime in 200 Liters of water per acre.',
        'Alternatively use Chelated Zinc (EDTA 12%) @ 1g per liter water for rapid leaf absorption within 48 hours.',
      ],
      organicImmediateSpray: 'Foliar spray of Jeevamrit (10% solution) mixed with cow urine and wood ash extract.',
      emergencyHelpline: '1800-180-1551',
    },
    {
      id: 'frost-heat',
      crop: 'Mustard, Vegetables, Potato, Wheat',
      emergency: 'Extreme Frost (पाला) or Heat Wave Alert',
      emergencyHindi: 'पाला (पाला जमना) अथवा भीषण लू से फसल बचाव',
      urgency: 'high',
      symptoms: [
        'Ice crystals forming on leaves, water droplets frozen at dawn',
        'Leaf edges scorched black or curly brown due to rapid cell freezing',
        'Premature shriveling of flowering buds and pollen death',
      ],
      first24HourAction: [
        'Give light surface irrigation in late evening; moist soil retains 2-3°C higher temperature overnight.',
        'Create smoke (धुआं) on the windward side of field from midnight to 5 AM using dry grass and cow dung cakes.',
        'Foliar spray 0.1% Sulphuric Acid (1 ml concentrated H2SO4 per liter water) or Soluble Sulphur (80% WDG) @ 2g/L.',
      ],
      organicImmediateSpray: 'Spray liquid seaweed extract @ 2 ml/L or Panchagavya (3% solution) to induce abiotic stress resilience.',
      emergencyHelpline: '1800-180-1551',
    },
  ];

  const active = EMERGENCIES.find((e) => e.id === selectedEmergency) || EMERGENCIES[0];

  const speakEmergency = () => {
    const text = `${active.emergency}: ${active.first24HourAction.join(' ')}`;
    speakRegionalText(text, currentLanguage.code, 1.12);
  };

  const handleSosWhatsApp = () => {
    const text = `🚨 *EMERGENCY CROP RESCUE CALL*
Crop: ${active.crop}
Issue: ${active.emergency} (${active.emergencyHindi})
Symptoms: ${active.symptoms.join(', ')}
Urgent Advice Needed from Krishi Vigyan Kendra agronomist!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div id="offline-crop-first-aid-module" className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
            <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {formatBilingual('Emergency Crop First-Aid & 24h Field Rescue', 'firstAid', currentLanguage.code)}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-950 border border-red-300">
                Critical SOS
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {formatBilingual('Rapid rescue protocols when pest or disease strikes overnight', 'emergencyGuide', currentLanguage.code)}
            </p>
          </div>
        </div>

        {/* SOS Helpline Quick Call */}
        <a
          href="tel:18001801551"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <PhoneCall className="w-4 h-4 animate-pulse" />
          <span>Call Kisan Call Center (1800-180-1551)</span>
        </a>
      </div>

      {/* Emergency Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {EMERGENCIES.map((em) => (
          <button
            key={em.id}
            type="button"
            onClick={() => setSelectedEmergency(em.id)}
            className={`px-3.5 py-2 rounded-2xl font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
              selectedEmergency === em.id
                ? 'bg-red-700 text-white border-red-700 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{em.emergency.split('/')[0]}</span>
          </button>
        ))}
      </div>

      {/* Emergency Detail Card */}
      <div className="p-5 sm:p-6 rounded-3xl border-2 border-red-200 bg-red-50/30 space-y-4">
        
        {/* Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-700 text-white px-2 py-0.5 rounded-md">
                {active.urgency.toUpperCase()} EMERGENCY
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                Affects: {active.crop}
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-stone-900 mt-1">
              {active.emergency}
            </h3>
            <p className="text-xs text-red-900 font-bold">
              {active.emergencyHindi}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Listen</span>
            </button>
            <button
              type="button"
              onClick={handleSosWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span>Ask KVK Agronomist</span>
            </button>
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-stone-700 block">
            {formatBilingual('Field Symptoms Checklist', 'earlySignals', currentLanguage.code)}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {active.symptoms.map((s, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-red-100 text-xs text-stone-700">
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* First 24 Hours Golden Action Plan */}
        <div className="bg-white p-4 rounded-2xl border-2 border-red-400 space-y-2">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide text-red-700">
            <Clock className="w-4 h-4" />
            <span>{formatBilingual('Golden First 24-Hour Rescue Protocol', 'actionPlan', currentLanguage.code)}:</span>
          </div>

          <div className="space-y-1.5">
            {active.first24HourAction.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Organic Rescue Spray */}
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-start gap-2.5">
          <Leaf className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-emerald-950 font-bold block mb-0.5">
              {formatBilingual('Immediate Organic / Bio-Rescue Spray', 'organicBio', currentLanguage.code)}:
            </strong>
            <span className="text-emerald-900 leading-relaxed">
              {active.organicImmediateSpray}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
