export interface RegionalLanguage {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  greeting: string;
  placeholderText: string;
}

export const REGIONAL_LANGUAGES: RegionalLanguage[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    greeting: 'नमस्ते किसान भाई! फसल या मिट्टी की तुरंत जांच करें',
    placeholderText: 'यहाँ बोलें या लिखें (जैसे: धान के पत्ते पीले क्यों पड़ रहे हैं?)',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    greeting: 'నమస్కారం రైతు మిత్రమా! పంట లేదా నేల ఆరోగ్యాన్ని పరీక్షించండి',
    placeholderText: 'ఇక్కడ మాట్లాడండి లేదా రాయండి (ఉదా: పత్తి ఆకులు ఎర్రబడుతున్నాయి ఎందుకు?)',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    greeting: 'வணக்கம் விவசாய பெருமக்களே! பயிர் அல்லது மண் நலனை கண்டறியுங்கள்',
    placeholderText: 'இங்கு பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள் (எ.கா: நெல் இலைகள் மஞ்சள் ஆவது ஏன்?)',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    greeting: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ಬೆಳೆ ಅಥವಾ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಪರಿಶೀಲಿಸಿ',
    placeholderText: 'ಇಲ್ಲಿ ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಬರೆಯಿರಿ...',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    greeting: 'नमस्कार शेतकरी मित्र! आपल्या पिकाचे किंवा मातीचे त्वरित निदान करा',
    placeholderText: 'येथे बोला किंवा लिहा (उदा: सोयाबीन पिकावर कीड पडली आहे)...',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    greeting: 'নমস্কার কৃষক ভাই! আপনার ফসল বা মাটির স্বাস্থ্য পরীক্ষা করুন',
    placeholderText: 'এখানে কথা বলুন বা লিখুন...',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    greeting: 'નમસ્તે ખેડૂત મિત્ર! પાક અથવા જમીનનું સચોટ નિદાન મેળવો',
    placeholderText: 'અહીં બોલો અથવા લખો...',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਫਸਲ ਜਾਂ ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਕਰੋ',
    placeholderText: 'ਇੱਥੇ ਬੋਲੋ ਜਾਂ ਲਿਖੋ...',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    greeting: 'നമസ്കാരം കർഷക സുഹൃത്തേ! വിളയുടെയോ മണ്ണിന്റെയോ ആരോഗ്യം പരിശോധിക്കുക',
    placeholderText: 'ഇവിടെ സംസാരിക്കുക അല്ലെങ്കിൽ എഴുതുക...',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-IN',
    greeting: 'Welcome Farmer! Instant Crop & Soil Health Advisory',
    placeholderText: 'Speak or type your question (e.g. Paddy leaves turning yellow)...',
  },
];

export interface PesticideGuide {
  recommendedSpray: string;
  dosagePerLiter: string;
  dosagePerAcre: string;
  applicationMethod: string;
  precautions: string[];
  organicAlternative: string;
  safetyIntervalDays: string;
}

export interface SoilHealth {
  soilType: string;
  textureAndMoisture: string;
  estimatedFertility: string;
  phRangeEstimate: string;
  organicMatterTips: string[];
}

export interface CultivableCrops {
  primaryCrops: string[];
  commercialCashCrops: string[];
  seasonalFit: string;
  cropRotationTip: string;
}

export interface WeatherAndFieldAdvisory {
  irrigationAdvice: string;
  weatherPrecaution: string;
  bestTimeToAct: string;
}

export interface CropSoilAnalysisResult {
  mode: 'crop' | 'soil' | 'both';
  detectedEntity: string;
  scientificOrLocalName: string;
  healthStatus: 'healthy' | 'moderate' | 'critical' | 'alert';
  healthScorePercent: number;
  conditionSummary: string;
  earlyDiseaseSignals: string[];
  identifiedPests: string[];
  pesticideGuide: PesticideGuide;
  soilHealth: SoilHealth;
  cultivableCrops: CultivableCrops;
  weatherAndFieldAdvisory: WeatherAndFieldAdvisory;
  spokenAudioScript: string;
  spokenAudioEnglishSummary: string;
  quickActionSteps: string[];
  isContingency?: boolean;
  audioData?: string; // base64 data URI (data:audio/wav;base64,...) from studio voice synthesis
}

export interface SampleFieldItem {
  id: string;
  title: string;
  category: 'crop' | 'soil';
  description: string;
  imageUrl: string;
  promptHint: string;
}

export interface MandiCropPrice {
  id: string;
  crop: string;
  cropHindi: string;
  variety: string;
  market: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // ₹ per Quintal
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeAmount: number;
  mspPrice: number;
  demandStatus: 'high' | 'moderate' | 'low';
  sellAdvice: string;
  lastUpdated: string;
}

export interface SprayCalculationResult {
  tankSizeLiters: number;
  totalAreaAcres: number;
  dosagePerLiterNum: number;
  dosageUnit: 'g' | 'ml';
  waterPerAcreLiters: number;
  totalWaterNeededLiters: number;
  totalTanksNeeded: number;
  chemicalPerTank: number;
  totalChemicalNeeded: number;
  estimatedCostChemicalRupees: number;
  estimatedCostOrganicRupees: number;
  savingsRupees: number;
  nozzleType: string;
  spraySpeedAdvice: string;
}

export interface WeatherSprayWindow {
  district: string;
  state: string;
  currentTemp: number;
  humidity: number;
  windSpeedKmH: number;
  rainChanceNext6h: number;
  spraySuitability: 'optimal' | 'moderate' | 'unsafe';
  statusHeading: string;
  suitabilityReason: string;
  optimalSprayHours: string;
  evaporationRisk: 'low' | 'moderate' | 'high';
  driftRisk: 'low' | 'moderate' | 'high';
  forecastDays: Array<{
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    rainChance: number;
    windSpeed: number;
    canSpray: boolean;
    condition: string;
  }>;
}

export interface KisanGovScheme {
  id: string;
  name: string;
  hindiName: string;
  category: 'subsidy' | 'insurance' | 'credit' | 'machinery' | 'soil';
  benefitAmount: string;
  benefitDescription: string;
  eligibility: string;
  keyDocuments: string[];
  helpline: string;
  officialUrl: string;
  maxEstimatedGrant: number; // estimated grant calculation per acre or base
}

export interface CropEmergencyGuide {
  id: string;
  crop: string;
  emergency: string;
  emergencyHindi: string;
  urgency: 'high' | 'critical';
  symptoms: string[];
  first24HourAction: string[];
  organicImmediateSpray: string;
  emergencyHelpline: string;
}
