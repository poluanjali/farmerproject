import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2, HelpCircle } from 'lucide-react';
import { RegionalLanguage } from '../types';
import { formatBilingual } from '../utils/translations';

interface VoiceInputBarProps {
  currentLanguage: RegionalLanguage;
  queryText: string;
  onChangeQuery: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  hasImage: boolean;
}

// Regional quick suggestions tailored to the selected language
const QUICK_SUGGESTIONS: Record<string, string[]> = {
  hi: [
    'पत्तियों पर धब्बे और पीलापन है, कौन सी दवा छिड़कें?',
    'इस मिट्टी में कौन सी फसल सबसे ज्यादा मुनाफा देगी?',
    'कीटनाशक की प्रति लीटर पानी में सही मात्रा क्या है?',
    'क्या बारिश से पहले छिड़काव करना ठीक रहेगा?',
  ],
  te: [
    'ఆకులపై మచ్చలు ఉన్నాయి, ఏ మందు పిచికారీ చేయాలి?',
    'ఈ నేలలో ఏ పంట బాగా పండుతుంది?',
    'పురుగు మందు డోసేజ్ లీటరు నీటికి ఎంత కలపాలి?',
    'వరి ఎర్ర తెగులుకు ఆర్గానిక్ నివారణ చెప్పండి',
  ],
  ta: [
    'இலைகளில் புள்ளி மற்றும் மஞ்சள் நிறம் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
    'இந்த மண்ணில் என்ன பயிர் பயிரிடலாம்?',
    'பூச்சிக்கொல்லி மருந்தின் சரியான அளவு என்ன?',
  ],
  kn: [
    'ಎಲೆಗಳ ಮೇಲೆ ಕಲೆಗಳು ಕಂಡುಬರುತ್ತಿವೆ, ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?',
    'ಈ ಮಣ್ಣಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬಹುದು?',
    'ಕೀಟನಾಶಕ ಪ್ರಮಾಣ ಲೀಟರ್ ನೀರಿಗೆ ಎಷ್ಟು?',
  ],
  mr: [
    'पानांवर पिवळे डाग आहेत, कोणते कीटकनाशक फवारावे?',
    'या मातीत कोणते पीक चांगले येईल?',
    'औषधाचे प्रति लिटर प्रमाण किती असावे?',
  ],
  bn: [
    'পাতায় দাগ ও হলুদ ভাব রয়েছে, কোন কীটনাশক ব্যবহার করব?',
    'এই মাটিতে কোন ফসল সবচেয়ে ভালো হবে?',
    'কীটনাশকের সঠিক মাত্রা কত?',
  ],
  gu: [
    'પાંદડા પર ડાઘ છે, કઈ દવા છાંટવી?',
    'આ જમીનમાં કયો પાક સારો થશે?',
    'જંતુનાશકનું પ્રતિ લીટર પ્રમાણ કેટલું રાખવું?',
  ],
  pa: [
    'ਪੱਤਿਆਂ ਤੇ ਦਾਗ ਹਨ, ਕਿਹੜੀ ਕੀੜੇਮਾਰ ਦਵਾਈ ਛਿੜਕੀਏ?',
    'ਇਸ ਮਿੱਟੀ ਵਿੱਚ ਕਿਹੜੀ ਫਸਲ ਲਗਾਈਏ?',
    'ਦਵਾਈ ਦੀ ਪ੍ਰਤੀ ਲੀਟਰ ਕਿੰਨੀ ਮਾਤਰਾ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ?',
  ],
  ml: [
    'ഇലകളിൽ പാടുകൾ കാണുന്നു, ഏത് മരുന്ന് തളിക്കണം?',
    'ഈ മണ്ണിൽ ഏത് വിളയാണ് ഏറ്റവും അനുയോജ്യം?',
    'കീടനാശിനിയുടെ ശരിയായ അളവ് എത്ര?',
  ],
  en: [
    'Leaves show spots and yellowing, what pesticide dosage to spray?',
    'What crops are best to cultivate in this soil?',
    'Is it safe to spray before rain, and what organic cure is available?',
  ],
};

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  currentLanguage,
  queryText,
  onChangeQuery,
  onSubmit,
  isLoading,
  hasImage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize Speech Recognition when language changes
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage.speechCode;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = finalTranscript || interimTranscript;
        if (combined) {
          onChangeQuery(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('कृपया माइक्रोफ़ोन अनुमति दें / Please allow microphone permission.');
        } else {
          setMicError('आवाज़ साफ़ नहीं आई, कृपया फिर से बोलें / Voice unclear, please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      recognitionRef.current = null;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [currentLanguage.speechCode, onChangeQuery]);

  // Fallback server transcription via MediaRecorder
  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Send to server
        setIsTranscribingAudio(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: 'audio/webm',
                languageName: currentLanguage.name,
              }),
            });
            const data = await res.json();
            if (data.transcript) {
              onChangeQuery(data.transcript);
            }
          };
        } catch (err) {
          console.error('Fallback transcription failed:', err);
        } finally {
          setIsTranscribingAudio(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      setMicError(null);

      // Auto-stop after 7 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 7000);
    } catch (err: any) {
      setIsListening(false);
      setMicError('माइक शुरू नहीं हो सका / Could not start microphone.');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          // If already started, stop and restart
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      } else {
        startRecordingFallback();
      }
    }
  };

  const suggestions = QUICK_SUGGESTIONS[currentLanguage.code] || QUICK_SUGGESTIONS['en'];

  return (
    <div id="voice-input-section" className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-600" />
          <span>{formatBilingual('2. Ask by Voice or Type', 'voiceTitle', currentLanguage.code)}</span>
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          {currentLanguage.nativeName} ({currentLanguage.name}) Voice
        </span>
      </div>

      {/* Big Voice & Text Input Container */}
      <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
        
        {/* Large Prominent Microphone Button for Farmers */}
        <button
          id="btn-farmer-mic"
          type="button"
          onClick={toggleListening}
          disabled={isLoading || isTranscribingAudio}
          className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm select-none shrink-0 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-red-200 ring-4 ring-red-200'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-95'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-bounce" />
              <span>{formatBilingual('Listening... Speak Now', 'listening', currentLanguage.code)}</span>
            </>
          ) : isTranscribingAudio ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{formatBilingual('Recognizing...', 'recognizing', currentLanguage.code)}</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>{formatBilingual('Tap to Speak', 'tapToSpeak', currentLanguage.code)}</span>
            </>
          )}
        </button>

        {/* Input Text Field showing recognized speech */}
        <div className="relative flex-1">
          <textarea
            id="farmer-voice-query-input"
            value={queryText}
            onChange={(e) => onChangeQuery(e.target.value)}
            rows={2}
            placeholder={isListening ? (currentLanguage.code === 'en' ? "Listening to your voice..." : "Listening / आवाज़ सुनी जा रही है...") : currentLanguage.placeholderText}
            className={`w-full h-full min-h-[56px] p-3 text-sm sm:text-base rounded-xl border transition-all resize-none focus:outline-none ${
              isListening
                ? 'border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400'
                : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
            }`}
          />
        </div>

        {/* Big Submit Button */}
        <button
          id="btn-submit-inspection"
          type="button"
          onClick={onSubmit}
          disabled={isLoading || (!hasImage && !queryText.trim())}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-emerald-950 font-black text-sm sm:text-base transition-all shadow-sm active:scale-95 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{formatBilingual('Diagnosing...', 'analyzing', currentLanguage.code)}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 stroke-[2.5]" />
              <span>{formatBilingual('Inspect & Diagnose', 'diagnoseButton', currentLanguage.code)}</span>
            </>
          )}
        </button>
      </div>

      {/* Mic Status or Error */}
      {micError && (
        <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Quick Field Suggestions */}
      <div className="pt-1">
        <div className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
          <span>{formatBilingual('Quick Question Ideas', 'quickQuestions', currentLanguage.code)}:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeQuery(sug)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 transition-colors text-left font-medium"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
