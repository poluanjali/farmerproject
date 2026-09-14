import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, MicOff, Send, Loader2, Volume2, Sparkles } from 'lucide-react';
import { RegionalLanguage, CropSoilAnalysisResult } from '../types';
import { playWavAudio, speakRegionalText, stopSpeech, hasNativeVoiceForLanguage } from '../utils/speech';

interface FollowUpChatProps {
  currentLanguage: RegionalLanguage;
  previousAnalysis: CropSoilAnalysisResult;
}

interface ChatMessage {
  id: string;
  sender: 'farmer' | 'advisor';
  text: string;
  bulletPoints?: string[];
  englishTranslation?: string;
  timestamp: string;
  audioData?: string;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({
  currentLanguage,
  previousAnalysis,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for follow-up chat
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage.speechCode;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [currentLanguage.speechCode]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (_) {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      }
    }
  };

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'farmer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ask-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          languageName: currentLanguage.name,
          languageCode: currentLanguage.code,
          previousContext: {
            detectedEntity: previousAnalysis.detectedEntity,
            healthStatus: previousAnalysis.healthStatus,
            pesticide: previousAnalysis.pesticideGuide.recommendedSpray,
            dosage: previousAnalysis.pesticideGuide.dosagePerLiter,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        const advisorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'advisor',
          text: data.spokenScript || data.englishTranslation,
          bulletPoints: data.bulletPoints || [],
          englishTranslation: data.englishTranslation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          audioData: data.audioData,
        };

        setMessages((prev) => [...prev, advisorMsg]);

        // Speak advisor's response in high quality regional voice at medium-fast pace
        if (data.audioData) {
          playWavAudio(data.audioData, 1.12);
        } else if (data.spokenScript) {
          speakRegionalText(data.spokenScript, currentLanguage.speechCode, 1.12);
        }
      }
    } catch (err) {
      console.error('Failed to send follow up:', err);
    } finally {
      setIsSending(false);
    }
  };

  const speakMessage = async (msg: ChatMessage) => {
    stopSpeech();
    if (msg.audioData) {
      playWavAudio(msg.audioData, 1.12);
      return;
    }

    try {
      const res = await fetch('/api/synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.text,
          languageCode: currentLanguage.code,
          voiceName: 'Kore',
        }),
      });
      const data = await res.json();
      if (data.success && data.audioData) {
        msg.audioData = data.audioData;
        playWavAudio(data.audioData, 1.12);
        return;
      }
    } catch (_) {}

    speakRegionalText(msg.text, currentLanguage.speechCode, 1.12);
  };

  return (
    <div id="kisan-followup-chat" className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 text-emerald-950 font-black text-base">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span>Ask Follow-up Question</span>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
          {currentLanguage.nativeName} ({currentLanguage.name})
        </span>
      </div>

      {/* Message History */}
      {messages.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto p-2 bg-gray-50/60 rounded-xl border border-gray-100">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'farmer' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm font-medium shadow-2xs ${
                  msg.sender === 'farmer'
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-white text-gray-900 border border-emerald-200 rounded-bl-xs'
                }`}
              >
                {msg.sender === 'advisor' && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-bold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Kisan Mitra Advisory:
                    </span>
                    <button
                      type="button"
                      onClick={() => speakMessage(msg)}
                      title="Listen again"
                      className="p-1 rounded-md hover:bg-emerald-50 text-emerald-700"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="leading-relaxed">{msg.text}</p>

                {msg.bulletPoints && msg.bulletPoints.length > 0 && (
                  <ul className="mt-2 space-y-1 pt-1.5 border-t border-gray-100">
                    {msg.bulletPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div
                  className={`text-[10px] mt-1 text-right ${
                    msg.sender === 'farmer' ? 'text-emerald-200' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Advisor is preparing answer...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-xs text-emerald-900">
          <p className="font-semibold mb-2 text-gray-700">Sample questions you can ask:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSendMessage('Can this spray be mixed with urea or other fertilizers?')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left font-medium transition-colors shadow-2xs"
            >
              Can this be mixed with fertilizer?
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What should I do if it rains right after spraying?')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left font-medium transition-colors shadow-2xs"
            >
              If it rains after spray?
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('How do I prepare an organic neem leaf spray?')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left font-medium transition-colors shadow-2xs"
            >
              Organic Neem preparation
            </button>
          </div>
        </div>
      )}

      {/* Input box with voice mic & send */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleVoice}
          title={isListening ? 'Stop listening' : 'Speak follow-up question'}
          className={`p-3 rounded-xl font-bold transition-all shadow-sm ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-300'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={isListening ? 'Listening... Speak now' : 'Ask a follow-up or tap mic to speak...'}
          className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isSending || !inputText.trim()}
          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold transition-all shadow-sm active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
