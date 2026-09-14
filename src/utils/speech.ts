// Speech synthesis and studio audio playback utility for Indian regional languages
export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  lang: string;
  name: string;
}

let activeAudioElement: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

// Stop all audio playback (both HTML5 Audio and Web Speech Synthesis)
export function stopSpeech(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (_) {}
    activeAudioElement = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    activeUtterance = null;
  }
}

// Check if the browser actually has a voice installed for the given regional language code
export function hasNativeVoiceForLanguage(langCode: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return false;

  const langPrefix = langCode.toLowerCase().split('-')[0];
  return voices.some((v) => {
    const l = v.lang.toLowerCase();
    return l.startsWith(langPrefix) || (langPrefix === 'hi' && v.name.toLowerCase().includes('hindi'));
  });
}

// Locate the most authentic native voice for the given language
export function getBestVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const langPrefix = langCode.toLowerCase().split('-')[0];

  // 1. Try exact match like hi-IN, te-IN, ta-IN
  const exactMatch = voices.find(
    (v) =>
      v.lang.toLowerCase() === `${langPrefix}-in` ||
      v.lang.toLowerCase().replace('_', '-') === `${langPrefix}-in`
  );
  if (exactMatch) return exactMatch;

  // 2. Try prefix match like hi, te, ta, kn, mr, bn, gu, pa, ml
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
  if (prefixMatch) return prefixMatch;

  // 3. Match by language name in voice label (e.g. "Google हिन्दी", "Microsoft Heera")
  const nameMap: Record<string, string[]> = {
    hi: ['hindi', 'हिन्दी', 'heera', 'ravi'],
    te: ['telugu', 'తెలుగు', 'mohan'],
    ta: ['tamil', 'தமிழ்', 'valluvar'],
    kn: ['kannada', 'ಕನ್ನಡ', 'gagan'],
    mr: ['marathi', 'मराठी', 'aarohi'],
    bn: ['bengali', 'বাংলা', 'bashkar'],
    gu: ['gujarati', 'ગુજરાતી', 'niranjan'],
    pa: ['punjabi', 'ਪੰਜਾਬੀ'],
    ml: ['malayalam', 'മലയാളം', 'midhun'],
    en: ['indian', 'india', 'en-in', 'prabhat', 'neerja'],
  };

  const keywords = nameMap[langPrefix] || [];
  for (const kw of keywords) {
    const found = voices.find(
      (v) => v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw)
    );
    if (found) return found;
  }

  // 4. For Indian English
  if (langPrefix === 'en') {
    const enIn = voices.find(
      (v) => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')
    );
    if (enIn) return enIn;
  }

  return null;
}

// Calibrated medium-fast playback rate: 1.12x for crisp, energetic speech without sluggish delays
export const DEFAULT_SPEECH_RATE = 1.12;

// Sanitize text for clear, natural, medium-fast speech without brackets, slashes, or chemical abbreviations
export function cleanSpeechForFarmer(text: string, langCode: string = 'hi'): string {
  if (!text) return '';
  let clean = text.trim();

  // If text contains multiline or multi-item "English / Regional" format, extract target language clause per line
  const langPrefix = langCode.toLowerCase().split('-')[0];
  const lines = clean.split('\n').map((l) => {
    let line = l.trim();
    if (line.includes(' / ')) {
      const parts = line.split(' / ');
      line = (langPrefix !== 'en' ? parts[parts.length - 1] : parts[0]) || line;
    }
    return line;
  });
  clean = lines.join('. ');

  // Strip markdown styling (bold, italic, code, quotes)
  clean = clean.replace(/[*_#~`"']/g, '');

  // Strip bullet markers and list symbols
  clean = clean.replace(/^[•\-\*✓✕]\s*/gm, '');

  // Strip parenthetical text or convert to smooth spoken pause
  clean = clean.replace(/\(([^)]+)\)/g, ', $1, ');

  // Replace percentage with regional spoken word
  const percentMap: Record<string, string> = {
    hi: ' प्रतिशत ',
    te: ' శాతం ',
    ta: ' சதவீதம் ',
    kn: ' ಶೇಕಡಾ ',
    mr: ' टक्के ',
    bn: ' শতাংশ ',
    gu: ' ટકા ',
    pa: ' ਪ੍ਰਤੀਸ਼ਤ ',
    ml: ' ശതമാനം ',
    en: ' percent ',
  };
  const pWord = percentMap[langPrefix] || ' percent ';
  clean = clean.replace(/%/g, pWord);

  // Replace rupee symbols with spoken regional words
  const rupeeMap: Record<string, string> = {
    hi: ' रुपये ',
    te: ' రూపాయలు ',
    ta: ' ரூபாய் ',
    kn: ' ರೂಪಾಯಿಗಳು ',
    mr: ' रुपये ',
    bn: ' টাকা ',
    gu: ' રૂપિયા ',
    pa: ' ਰੁਪਏ ',
    ml: ' രൂപ ',
    en: ' Rupees ',
  };
  const rWord = rupeeMap[langPrefix] || ' Rupees ';
  clean = clean.replace(/(?:₹|Rs\.?|INR)/gi, rWord);

  // Replace remaining slashes with natural comma pause
  clean = clean.replace(/\s*\/\s*/g, ', ');

  // Clarify common technical abbreviations into natural spoken regional farmer terminology
  if (langPrefix === 'te') {
    clean = clean.replace(/\bWP\b/gi, 'పౌడర్ మందు');
    clean = clean.replace(/\bEC\b/gi, 'ద్రవ మందు');
    clean = clean.replace(/\bml\/L\b/gi, 'మిల్లీ లీటర్లు ప్రతి లీటరు నీటికి');
    clean = clean.replace(/\bg\/L\b/gi, 'గ్రాములు ప్రతి లీటరు నీటికి');
    clean = clean.replace(/\bkg\/acre\b/gi, 'కిలోలు ప్రతి ఎకరాకు');
    clean = clean.replace(/\bha\b/gi, 'హెక్టారు');
  } else if (langPrefix === 'ta') {
    clean = clean.replace(/\bWP\b/gi, 'தூள் மருந்து');
    clean = clean.replace(/\bEC\b/gi, 'திரவ மருந்து');
    clean = clean.replace(/\bml\/L\b/gi, 'மில்லிலிட்டர் ஒரு லிட்டர் தண்ணீருக்கு');
    clean = clean.replace(/\bg\/L\b/gi, 'கிராம் ஒரு லிட்டர் தண்ணீருக்கு');
    clean = clean.replace(/\bkg\/acre\b/gi, 'கிலோ ஒரு ஏக்கருக்கு');
  } else if (langPrefix === 'en') {
    clean = clean.replace(/\bWP\b/gi, 'wettable powder');
    clean = clean.replace(/\bEC\b/gi, 'liquid formulation');
    clean = clean.replace(/\bml\/L\b/gi, 'milliliters per liter of water');
    clean = clean.replace(/\bg\/L\b/gi, 'grams per liter of water');
    clean = clean.replace(/\bkg\/acre\b/gi, 'kilograms per acre');
  } else {
    clean = clean.replace(/\bWP\b/gi, 'घुलनशील पाउडर');
    clean = clean.replace(/\bEC\b/gi, 'तरल दवा');
    clean = clean.replace(/\bml\/L\b/gi, 'मिलीलीटर प्रति लीटर पानी में');
    clean = clean.replace(/\bg\/L\b/gi, 'ग्राम प्रति लीटर पानी में');
    clean = clean.replace(/\bkg\/acre\b/gi, 'किलो प्रति एकड़');
  }

  // Normalize pauses and ensure crisp delivery
  clean = clean.replace(/[|।]/g, '.');
  clean = clean.replace(/,+/g, ',');
  clean = clean.replace(/\.+/g, '. ');
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

// Play pre-synthesized WAV Audio (from Gemini Studio Voice) at calibrated medium-fast speed
export function playWavAudio(
  audioDataUri: string,
  rate: number = DEFAULT_SPEECH_RATE,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): HTMLAudioElement {
  stopSpeech();

  const audio = new Audio(audioDataUri);
  // Medium-fast tempo: 1.12x makes delivery energetic, fluent, and avoids dragging
  audio.playbackRate = Math.max(0.8, Math.min(1.6, rate || DEFAULT_SPEECH_RATE));

  audio.onplay = () => {
    if (onStart) onStart();
  };

  audio.onended = () => {
    activeAudioElement = null;
    if (onEnd) onEnd();
  };

  audio.onerror = (e) => {
    activeAudioElement = null;
    if (onError) onError(e);
  };

  activeAudioElement = audio;
  audio.play().catch((err) => {
    if (onError) onError(err);
  });

  return audio;
}

// Speak regional text via SpeechSynthesis with calibrated medium-fast clarity
export function speakRegionalText(
  text: string,
  langCode: string,
  rate = DEFAULT_SPEECH_RATE,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): SpeechSynthesisUtterance | null {
  stopSpeech();

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError(new Error('Speech synthesis not supported on this device.'));
    return null;
  }

  if (!text || text.trim() === '') return null;

  const cleaned = cleanSpeechForFarmer(text, langCode);
  const utterance = new SpeechSynthesisUtterance(cleaned);

  const formattedLang = langCode.includes('-') ? langCode : `${langCode}-IN`;
  utterance.lang = formattedLang;
  // Calibrated medium-fast rate (1.12) for farmer accessibility: brisk, distinct, and clear
  utterance.rate = rate || DEFAULT_SPEECH_RATE;
  utterance.pitch = 1.02;

  const matchedVoice = getBestVoiceForLanguage(langCode);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    if (onError) onError(e);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return utterance;
}
