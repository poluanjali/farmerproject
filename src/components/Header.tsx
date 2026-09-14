import React from 'react';
import { REGIONAL_LANGUAGES, RegionalLanguage } from '../types';
import { Sprout, Volume2, PhoneCall, Globe2 } from 'lucide-react';
import { formatBilingual } from '../utils/translations';

interface HeaderProps {
  currentLanguage: RegionalLanguage;
  onSelectLanguage: (lang: RegionalLanguage) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onSelectLanguage,
  autoSpeak,
  onToggleAutoSpeak,
}) => {
  return (
    <header id="kisan-header" className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-sm">
                <Sprout className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Kisan Mitra
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-100 border border-emerald-600">
                    {formatBilingual('AI Doctor', 'aiDoctor', currentLanguage.code)}
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-medium">
                  {formatBilingual('AI Crop & Soil Advisory', 'aiCropAdvisory', currentLanguage.code)} • {currentLanguage.nativeName} ({currentLanguage.name})
                </p>
              </div>
            </div>

            {/* Helpline quick link for mobile */}
            <a
              href="tel:18001801551"
              title="Kisan Call Centre Toll Free"
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 text-xs font-medium border border-emerald-700"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>1800-180-1551</span>
            </a>
          </div>

          {/* Controls: Language Selector & Auto-Voice Toggle */}
          <div className="flex items-center flex-wrap justify-end gap-2.5 w-full sm:w-auto">
            
            {/* Regional Language Dropdown / Picker */}
            <div className="flex items-center gap-1.5 bg-emerald-900/90 rounded-xl px-3 py-1.5 border border-emerald-700 shadow-xs">
              <Globe2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <label htmlFor="language-select" className="sr-only">Select Language</label>
              <select
                id="language-select"
                value={currentLanguage.code}
                onChange={(e) => {
                  const found = REGIONAL_LANGUAGES.find(l => l.code === e.target.value);
                  if (found) onSelectLanguage(found);
                }}
                className="bg-transparent text-white font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
              >
                {REGIONAL_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-emerald-900 text-white">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Voice Toggle */}
            <button
              id="auto-speak-toggle"
              type="button"
              onClick={onToggleAutoSpeak}
              title={autoSpeak ? "Voice advisory will play automatically" : "Voice advisory is muted"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                autoSpeak
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-sm'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-700 hover:bg-emerald-900'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${autoSpeak ? 'text-emerald-950 animate-pulse' : 'text-emerald-400'}`} />
              <span>{autoSpeak ? formatBilingual('Voice ON', 'voiceAdvisory', currentLanguage.code) : 'Voice OFF'}</span>
            </button>

            {/* Helpline desktop badge */}
            <a
              id="kisan-helpline-link"
              href="tel:18001801551"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold border border-emerald-700 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>1800-180-1551</span>
            </a>

          </div>
        </div>
      </div>
    </header>
  );
};
