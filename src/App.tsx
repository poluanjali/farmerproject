import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { REGIONAL_LANGUAGES, RegionalLanguage, CropSoilAnalysisResult, SampleFieldItem } from './types';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { VoiceInputBar } from './components/VoiceInputBar';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { FollowUpChat } from './components/FollowUpChat';
import { SprayTankCalculator } from './components/SprayTankCalculator';
import { MandiPriceTracker } from './components/MandiPriceTracker';
import { SprayWeatherRadar } from './components/SprayWeatherRadar';
import { KisanSchemesHub } from './components/KisanSchemesHub';
import { OfflineCropFirstAid } from './components/OfflineCropFirstAid';
import { FarmLedger } from './components/FarmLedger';
import { BilingualText } from './components/BilingualText';
import { formatBilingual } from './utils/translations';
import {
  Sparkles,
  AlertCircle,
  History,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Info,
  Stethoscope,
  FlaskConical,
  TrendingUp,
  CloudSun,
  Landmark,
  LifeBuoy,
  Phone,
  PhoneCall,
  ArrowRight,
  X,
  Wallet,
} from 'lucide-react';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<RegionalLanguage>(REGIONAL_LANGUAGES[0]);
  const [activeTab, setActiveTab] = useState<'doctor' | 'calculator' | 'mandi' | 'weather' | 'ledger' | 'schemes' | 'firstaid'>('doctor');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [queryText, setQueryText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CropSoilAnalysisResult | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; title: string; date: string; result: CropSoilAnalysisResult; image: string | null }[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Pre-filled state for secondary tools when opened from diagnosis
  const [calcPrefill, setCalcPrefill] = useState<{ chemicalName?: string; dosagePerLiter?: number; cropName?: string }>({});
  const [mandiCropHint, setMandiCropHint] = useState<string>('');

  // Load history from localStorage on start
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kisan_mitra_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Save history helper
  const saveToHistory = (newResult: CropSoilAnalysisResult, img: string | null) => {
    const item = {
      id: Date.now().toString(),
      title: newResult.detectedEntity,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      result: newResult,
      image: img,
    };
    const updated = [item, ...history.slice(0, 7)];
    setHistory(updated);
    try {
      localStorage.setItem('kisan_mitra_history', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleImageSelected = (base64OrUrl: string, sampleItem?: SampleFieldItem) => {
    setSelectedImage(base64OrUrl);
    setError(null);
    if (sampleItem) {
      setQueryText(sampleItem.promptHint);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !queryText.trim()) {
      setError('कृपया पहले फसल/मिट्टी का फोटो चुनें या बोलकर सवाल पूछें। / Please select a photo or enter a question.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const isUrl = selectedImage?.startsWith('http://') || selectedImage?.startsWith('https://') || selectedImage?.startsWith('/');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: isUrl ? undefined : selectedImage,
          imageUrl: isUrl ? selectedImage : undefined,
          question: queryText,
          languageCode: currentLanguage.code,
          languageName: currentLanguage.name,
          locationContext: 'Indian agricultural farm',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'खेत विश्लेषण विफल रहा, कृपया दोबारा प्रयास करें।');
      }

      setResult(data.result);
      saveToHistory(data.result, selectedImage);

      // Scroll smoothly to results
      setTimeout(() => {
        const el = document.getElementById('audio-advisory-player');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err: any) {
      console.error('Analysis error:', err);
      let errMsg = err?.message || 'जांच में त्रुटि हुई। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = 'AI सर्वर पर वर्तमान में अत्यधिक लोड है। कृपया नीचे "पुनः प्रयास करें / Retry Inspection" बटन दबाएं।';
      } else if (errMsg.includes('{"error"')) {
        try {
          const match = errMsg.match(/\{"error":.*?\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed?.error?.message) {
              errMsg = parsed.error.message;
            }
          }
        } catch (_) {}
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setQueryText('');
    setResult(null);
    setError(null);
  };

  const handleOpenCalculatorFromDiagnosis = (params?: { chemicalName?: string; dosagePerLiter?: number; cropName?: string }) => {
    if (params) {
      setCalcPrefill(params);
    }
    setActiveTab('calculator');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleOpenWeatherFromDiagnosis = () => {
    setActiveTab('weather');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleOpenMandiFromDiagnosis = (cropName?: string) => {
    if (cropName) {
      // clean cropName e.g. "Tomato Leaf Curl" -> "Tomato"
      const firstWord = cropName.split(' ')[0].replace(/[^a-zA-Z]/g, '');
      setMandiCropHint(firstWord);
    }
    setActiveTab('mandi');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      
      {/* Header with Language Selector & Voice Toggle */}
      <Header
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => {
          setCurrentLanguage(lang);
        }}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
      />

      {/* Main Navigation Tabs */}
      <nav aria-label="Main Navigation" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none text-xs sm:text-sm font-bold">
          
          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'doctor'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('AI Doctor', 'aiDoctor', currentLanguage.code)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('Spray Tank Calc', 'sprayCalculator', currentLanguage.code)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mandi')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'mandi'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('Live Mandi Rates', 'mandiRates', currentLanguage.code)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weather')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'weather'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <CloudSun className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('Spray Weather', 'sprayWeather', currentLanguage.code)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'ledger'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('Farm Ledger', 'farmLedger', currentLanguage.code)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'schemes'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Landmark className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('Kisan Schemes', 'kisanSchemes', currentLanguage.code)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firstaid')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === 'firstaid'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-amber-300" />
            <span>{formatBilingual('Field SOS', 'firstAid', currentLanguage.code)}</span>
          </button>

        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 sm:py-7 space-y-6">
        
        {/* Farmer Welcome & Mission Banner */}
        <section className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 text-white rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kisan Mitra • Complete Agriculture Hub
                </span>
                <span className="text-xs text-emerald-200 hidden sm:inline">
                  ICAR & KVK Advisory Standards
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                {currentLanguage.greeting}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                Photo Crop Diagnosis • Precision Spray Tanks • Live APMC Mandi Rates • Safe Weather Window • Direct Subsidies
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:18001801551"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-black transition-colors shrink-0 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{formatBilingual('Kisan Helpline 1800-180-1551', 'kisanHelplineBanner', currentLanguage.code)}</span>
              </a>

              {history.length > 0 && activeTab === 'doctor' && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-xs font-bold border border-emerald-600/80 transition-colors shrink-0 shadow-sm"
                >
                  <History className="w-3.5 h-3.5 text-amber-300" />
                  <span>{formatBilingual('History', 'historyTitle', currentLanguage.code)} ({history.length})</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Animated Tab Content Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {/* TAB 1: AI CROP & SOIL DOCTOR */}
            {activeTab === 'doctor' && (
              <div className="space-y-6">
                
                {/* Quick Agricultural Modules Carousel (Visible before diagnosis) */}
                {!result && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    
                    <button
                      type="button"
                      onClick={() => setActiveTab('calculator')}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group space-y-1"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div className="font-extrabold text-xs text-stone-900 group-hover:text-emerald-800">
                        {formatBilingual('Spray Tank Calc', 'sprayCalculator', currentLanguage.code)}
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {formatBilingual('Exact dose per pump tank', 'tankDoseAdvice', currentLanguage.code)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('mandi')}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group space-y-1"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="font-extrabold text-xs text-stone-900 group-hover:text-emerald-800">
                        {formatBilingual('Live Mandi Rates', 'mandiRates', currentLanguage.code)}
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {formatBilingual('APMC rates & MSP alerts', 'mandiAdvisory', currentLanguage.code)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('weather')}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group space-y-1"
                    >
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
                        <CloudSun className="w-4 h-4" />
                      </div>
                      <div className="font-extrabold text-xs text-stone-900 group-hover:text-emerald-800">
                        {formatBilingual('Spray Weather', 'sprayWeather', currentLanguage.code)}
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {formatBilingual('Safe spray hours & radar', 'weatherAdvice', currentLanguage.code)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('schemes')}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 text-left transition-all hover:shadow-xs group space-y-1"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div className="font-extrabold text-xs text-stone-900 group-hover:text-emerald-800">
                        {formatBilingual('Kisan Schemes', 'kisanSchemes', currentLanguage.code)}
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {formatBilingual('Subsidies & claims', 'officialAdvisory', currentLanguage.code)}
                      </p>
                    </button>

                  </div>
                )}

                {/* Saved Recent History Drawer / Panel */}
                {showHistory && history.length > 0 && (
                  <section className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-600" />
                        <span>{formatBilingual('Recent Field Reports', 'recentReports', currentLanguage.code)}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowHistory(false)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-semibold px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{formatBilingual('Close', 'close', currentLanguage.code)}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setResult(item.result);
                            setSelectedImage(item.image);
                            setShowHistory(false);
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:border-emerald-500 bg-emerald-50/30 text-left transition-all"
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {formatBilingual('Sample', 'sampleLeaves', currentLanguage.code)}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-gray-900 truncate">
                              <BilingualText text={item.title} langCode={currentLanguage.code} />
                            </div>
                            <div className="text-[11px] text-gray-500">{item.date}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Step 1: Photo Capture & Upload */}
                <PhotoUploader
                  currentLanguage={currentLanguage}
                  selectedImage={selectedImage}
                  onImageSelected={handleImageSelected}
                  onClearImage={handleClearImage}
                  isLoading={isLoading}
                />

                {/* Step 2: Regional Voice-to-Text & Query */}
                <VoiceInputBar
                  currentLanguage={currentLanguage}
                  queryText={queryText}
                  onChangeQuery={setQueryText}
                  onSubmit={handleAnalyze}
                  isLoading={isLoading}
                  hasImage={Boolean(selectedImage)}
                />

                {/* Error Notification with Immediate Retry */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-300 text-red-950 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">
                        {error}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{formatBilingual('Retry Inspection', 'retry', currentLanguage.code)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-xs text-stone-500 hover:text-stone-800 font-semibold px-2 py-1"
                      >
                        {formatBilingual('Close', 'close', currentLanguage.code)}
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {result && (
                  <section className="space-y-5 pt-2">
                    
                    {/* High Demand Contingency Notice Banner */}
                    {result.isContingency && (
                      <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                          <Info className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            {formatBilingual('High server demand: Loaded verified agricultural database backup.', 'highServerDemand', currentLanguage.code)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAnalyze}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold transition shrink-0"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>{formatBilingual('Run Live AI Scan', 'runLiveAi', currentLanguage.code)}</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Action Bar with Reset Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg sm:text-xl font-black text-gray-900">
                          {formatBilingual('Field Inspection Report', 'diagnosisReport', currentLanguage.code)}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{formatBilingual('New Inspection', 'newInspection', currentLanguage.code)}</span>
                      </button>
                    </div>

                    {/* Audio Player in Farmer's Regional Language */}
                    <AudioPlayerWidget
                      currentLanguage={currentLanguage}
                      scriptText={result.spokenAudioScript}
                      englishSummary={result.spokenAudioEnglishSummary}
                      autoPlay={autoSpeak}
                      audioData={result.audioData}
                    />

                    {/* Detailed Agricultural Diagnostics & Cards with Prescription Slip */}
                    <AnalysisResultsView
                      result={result}
                      currentLanguage={currentLanguage}
                      photoPreviewUrl={selectedImage}
                      onOpenCalculator={handleOpenCalculatorFromDiagnosis}
                      onOpenWeather={handleOpenWeatherFromDiagnosis}
                      onOpenMandi={handleOpenMandiFromDiagnosis}
                    />

                    {/* Farmer Follow-up Questions with Voice in Regional Language */}
                    <FollowUpChat
                      currentLanguage={currentLanguage}
                      previousAnalysis={result}
                    />

                  </section>
                )}

              </div>
            )}

            {/* TAB 2: KNAPSACK SPRAY & TANK CALCULATOR */}
            {activeTab === 'calculator' && (
              <div className="space-y-4">
                <SprayTankCalculator
                  currentLanguage={currentLanguage}
                  initialChemicalName={calcPrefill.chemicalName}
                  initialCropName={calcPrefill.cropName}
                  initialDosagePerLiter={calcPrefill.dosagePerLiter || 2.0}
                />
              </div>
            )}

            {/* TAB 3: LIVE MANDI BHAAV & MARKET TRENDS */}
            {activeTab === 'mandi' && (
              <div className="space-y-4">
                <MandiPriceTracker
                  currentLanguage={currentLanguage}
                  selectedCropHint={mandiCropHint}
                />
              </div>
            )}

            {/* TAB 4: SPRAY WEATHER RADAR */}
            {activeTab === 'weather' && (
              <div className="space-y-4">
                <SprayWeatherRadar
                  currentLanguage={currentLanguage}
                />
              </div>
            )}

            {/* TAB: FARM LEDGER & EXPENSE AUDIT */}
            {activeTab === 'ledger' && (
              <div className="space-y-4">
                <FarmLedger
                  currentLanguage={currentLanguage}
                />
              </div>
            )}

            {/* TAB 5: KISAN SCHEMES & SUBSIDIES */}
            {activeTab === 'schemes' && (
              <div className="space-y-4">
                <KisanSchemesHub
                  currentLanguage={currentLanguage}
                />
              </div>
            )}

            {/* TAB 6: EMERGENCY CROP FIRST AID */}
            {activeTab === 'firstaid' && (
              <div className="space-y-4">
                <OfflineCropFirstAid
                  currentLanguage={currentLanguage}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Farmer Information Footnote */}
        <section className="bg-emerald-900/5 rounded-2xl p-4 sm:p-5 border border-emerald-100 text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>{formatBilingual('Field Advisory & Safety Guidelines', 'fieldAdvisoryTitle', currentLanguage.code)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
              <span className="font-bold text-gray-900 block mb-1">
                {formatBilingual('1. Clear Photo', 'cameraPhoto', currentLanguage.code)}
              </span>
              <span>Take a focused, close-up photo of infected leaves, crop stems, or soil texture under natural daylight.</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
              <span className="font-bold text-gray-900 block mb-1">
                {formatBilingual('2. Pesticide Safety', 'chemicalSpray', currentLanguage.code)}
              </span>
              <span>Always wear protective gloves and face mask. Avoid spraying during high winds (&gt;12 km/h) or before rainfall.</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
              <span className="font-bold text-gray-900 block mb-1">
                {formatBilingual('3. Kisan Helpline', 'kisanHelplineBanner', currentLanguage.code)}
              </span>
              <span>For free certified agronomist assistance, dial Kisan Call Centre at <strong className="text-emerald-900">1800-180-1551</strong> (Toll-Free, 6 AM - 10 PM).</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 py-5 border-t border-emerald-900 text-center text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-white">{formatBilingual('Kisan Mitra', 'kisanMitraTitle', currentLanguage.code)}</span> • {formatBilingual('AI Farm Advisory for Indian Farmers', 'subTitle', currentLanguage.code)}
          </div>
          <div className="text-[11px] text-emerald-400">
            Powered by Gemini AI • Multimodal Crop & Soil Vision • Regional Voice System
          </div>
        </div>
      </footer>

    </div>
  );
}
