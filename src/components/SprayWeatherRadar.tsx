import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  MapPin,
  Volume2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { WeatherSprayWindow, RegionalLanguage } from '../types';
import { speakRegionalText } from '../utils/speech';
import { formatBilingual } from '../utils/translations';

interface SprayWeatherRadarProps {
  currentLanguage: RegionalLanguage;
  initialDistrict?: string;
}

export const SprayWeatherRadar: React.FC<SprayWeatherRadarProps> = ({
  currentLanguage,
  initialDistrict = 'Central Agri Belt',
}) => {
  const [district, setDistrict] = useState<string>(initialDistrict);
  const [weather, setWeather] = useState<WeatherSprayWindow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const DISTRICTS = [
    { name: 'Nashik / Deccan Belt', state: 'Maharashtra' },
    { name: 'Guntur / Krishna Delta', state: 'Andhra Pradesh' },
    { name: 'Warangal / North Telangana', state: 'Telangana' },
    { name: 'Karnal / GT Road Belt', state: 'Haryana' },
    { name: 'Indore / Malwa Region', state: 'Madhya Pradesh' },
    { name: 'Kolar / Southern Plateau', state: 'Karnataka' },
    { name: 'Bathinda / Malwa Punjab', state: 'Punjab' },
    { name: 'Agra / Yamuna Plains', state: 'Uttar Pradesh' },
  ];

  const fetchWeatherData = async (distName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spray-weather?district=${encodeURIComponent(distName)}`);
      const data = await res.json();
      if (data.success && data.weather) {
        setWeather(data.weather);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(district);
  }, [district]);

  const speakWeatherAdvice = () => {
    if (!weather) return;
    const lang = currentLanguage.code.toLowerCase().split('-')[0];
    let text = '';
    if (lang === 'te') {
      text = `${weather.district}: ఈరోజు పిచికారీకి వాతావరణం అనుకూలంగా ఉంది. గాలి వేగం గంటకు ${weather.windSpeedKmH} కిలోమీటర్లు మరియు వర్షం వచ్చే అవకాశం ${weather.rainChanceNext6h} శాతం మాత్రమే. ఉదయం 6:30 నుండి 10:00 గంటల వరకు పిచికారీకి అత్యుత్తమ సమయం.`;
    } else if (lang === 'ta') {
      text = `${weather.district}: இன்று தெளிப்புக்கு வானிலை சாதகமாக உள்ளது. காற்றின் வேகம் மணிக்கு ${weather.windSpeedKmH} கிமீ, மழை வாய்ப்பு ${weather.rainChanceNext6h} சதவீதம் மட்டுமே. காலை 6:30 முதல் 10:00 மணி வரை தெளிக்க சிறந்த நேரம்.`;
    } else if (lang === 'en') {
      text = `${weather.district}: Today's weather is safe for field spraying. Wind speed is ${weather.windSpeedKmH} kilometers per hour and rain probability is ${weather.rainChanceNext6h} percent. Best spraying window is 6:30 AM to 10:00 AM.`;
    } else {
      text = `${weather.district}: आज का मौसम स्प्रे के लिए अनुकूल है। हवा की गति ${weather.windSpeedKmH} किलोमीटर प्रति घंटा है और बारिश की संभावना केवल ${weather.rainChanceNext6h} प्रतिशत है। सुबह 6:30 से 10:00 बजे तक छिड़काव का सबसे अच्छा समय है।`;
    }
    speakRegionalText(text, currentLanguage.code, 1.12);
  };

  return (
    <div id="spray-weather-radar-module" className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sun className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {formatBilingual('Micro-Weather & Safe Spray Window Radar', 'sprayWeather', currentLanguage.code)}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-950 border border-sky-300">
                Rain & Drift Guard
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {formatBilingual('Never waste expensive pesticides due to rain wash-off or high wind drift', 'weatherAdvice', currentLanguage.code)}
            </p>
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {weather && (
        <div className="space-y-5">
          
          {/* Main Spray Suitability Verdict Banner */}
          <div
            className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              weather.spraySuitability === 'optimal'
                ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                : weather.spraySuitability === 'moderate'
                ? 'bg-amber-50/90 border-amber-400 text-amber-950'
                : 'bg-red-50/90 border-red-400 text-red-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                  weather.spraySuitability === 'optimal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-amber-500 text-white shadow-sm'
                }`}
              >
                {weather.spraySuitability === 'optimal' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-emerald-300">
                    Verdict: {formatBilingual('Safe to Spray Now', 'safeToSprayNow', currentLanguage.code)}
                  </span>
                  <button
                    type="button"
                    onClick={speakWeatherAdvice}
                    title="Speak weather advisory in regional language"
                    className="p-1 rounded-md text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  {weather.statusHeading}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900/90 mt-0.5 leading-relaxed max-w-2xl">
                  {weather.suitabilityReason}
                </p>
              </div>
            </div>

            {/* Optimal Hours Pill */}
            <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs shrink-0 text-left sm:text-right">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                {formatBilingual('Best Spraying Hours Today', 'bestSprayHours', currentLanguage.code)}
              </span>
              <div className="text-sm font-black text-emerald-900 mt-0.5 flex items-center sm:justify-end gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{weather.optimalSprayHours}</span>
              </div>
            </div>
          </div>

          {/* Environmental Parameter Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* 1. Wind Speed */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-600" />
                  {formatBilingual('Wind Speed', 'windSpeed', currentLanguage.code)}
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                  Safe (&lt;12)
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {weather.windSpeedKmH}{' '}
                <span className="text-xs font-semibold text-stone-500">km/h</span>
              </div>
              <p className="text-[10px] text-stone-500">Minimal spray drift risk</p>
            </div>

            {/* 2. Rain Probability */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  {formatBilingual('Rain Chance (6h)', 'rainChance', currentLanguage.code)}
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                  Low Risk
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {weather.rainChanceNext6h}%
              </div>
              <p className="text-[10px] text-stone-500">No immediate wash-off danger</p>
            </div>

            {/* 3. Temperature */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {formatBilingual('Temperature', 'temperature', currentLanguage.code)}
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                  Good
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {weather.currentTemp}°C
              </div>
              <p className="text-[10px] text-stone-500">Avoid midday heat &gt;34°C</p>
            </div>

            {/* 4. Relative Humidity */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  {formatBilingual('Humidity', 'humidity', currentLanguage.code)}
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                  Moderate
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {weather.humidity}%
              </div>
              <p className="text-[10px] text-stone-500">Ideal leaf stomata uptake</p>
            </div>

          </div>

          {/* 3-Day Spray Forecast Matrix */}
          <div className="bg-stone-50/70 rounded-2xl p-4 border border-stone-200 space-y-3">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {formatBilingual('3-Day Spray Planning Forecast', 'threeDayForecast', currentLanguage.code)}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {weather.forecastDays.map((f, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border bg-white flex flex-col justify-between space-y-2 ${
                    f.canSpray ? 'border-emerald-300 shadow-2xs' : 'border-red-300 bg-red-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm text-stone-900">{f.day}</span>
                      <span className="text-[11px] text-stone-500 block">{f.date}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        f.canSpray
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-red-100 text-red-900 border border-red-300'
                      }`}
                    >
                      {f.canSpray ? `✓ ${formatBilingual('Safe to Spray', 'safeToSpray', currentLanguage.code)}` : `✕ ${formatBilingual('Avoid Spray', 'avoidSpray', currentLanguage.code)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Temp: {f.tempMin}° - {f.tempMax}°C</span>
                    <span>Rain: {f.rainChance}%</span>
                  </div>

                  <div className="text-[11px] text-stone-500 font-medium">
                    {f.condition}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
