import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, User, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RegionalLanguage } from '../types';
import {
  playWavAudio,
  speakRegionalText,
  stopSpeech,
  hasNativeVoiceForLanguage,
  cleanSpeechForFarmer,
} from '../utils/speech';

interface AudioPlayerWidgetProps {
  currentLanguage: RegionalLanguage;
  scriptText: string;
  englishSummary: string;
  autoPlay: boolean;
  audioData?: string;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  currentLanguage,
  scriptText,
  englishSummary,
  autoPlay,
  audioData: initialAudioData,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.12); // Medium-fast (1.12x), clear and non-sluggish for farmers
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [showEnglish, setShowEnglish] = useState(false);
  const [activeAudioData, setActiveAudioData] = useState<string | undefined>(initialAudioData);
  const [audioSource, setAudioSource] = useState<'studio' | 'device' | 'none'>('none');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Sync initialAudioData when prop updates
  useEffect(() => {
    if (initialAudioData) {
      setActiveAudioData(initialAudioData);
      setAudioSource('studio');
      setVoiceNotice('Crystal-clear Studio AI Voice ready');
    } else {
      setActiveAudioData(undefined);
      setAudioSource('none');
    }
  }, [initialAudioData, scriptText]);

  // Handle autoPlay
  useEffect(() => {
    if (autoPlay && scriptText) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 600);
      return () => clearTimeout(timer);
    }
    return () => {
      stopSpeech();
      setIsPlaying(false);
    };
  }, [scriptText, autoPlay, currentLanguage.code]);

  const fetchStudioAudio = async (preferredVoice: string): Promise<string | null> => {
    try {
      setIsSynthesizing(true);
      const res = await fetch('/api/synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          languageCode: currentLanguage.code,
          voiceName: preferredVoice === 'male' ? 'Puck' : 'Kore',
        }),
      });

      const data = await res.json();
      if (data.success && data.audioData) {
        setActiveAudioData(data.audioData);
        setAudioSource('studio');
        setVoiceNotice('Crystal-clear Studio AI Voice ready');
        return data.audioData;
      }
    } catch (err) {
      console.warn('Could not fetch studio audio:', err);
    } finally {
      setIsSynthesizing(false);
    }
    return null;
  };

  const handlePlay = async () => {
    if (!scriptText) return;

    stopSpeech();
    setVoiceNotice(null);

    // 1. Try playing pre-synthesized Studio WAV audio
    let wavData = activeAudioData;
    if (!wavData && !isSynthesizing) {
      wavData = await fetchStudioAudio(voiceGender);
    }

    if (wavData) {
      try {
        setAudioSource('studio');
        const audio = playWavAudio(
          wavData,
          speechRate,
          () => setIsPlaying(true),
          () => setIsPlaying(false),
          (err) => {
            console.warn('WAV audio play failed, falling back to device voice:', err);
            playDeviceFallback();
          }
        );
        audioElementRef.current = audio;
        return;
      } catch (playErr) {
        console.warn('Error starting studio audio:', playErr);
      }
    }

    // 2. Fallback: play on device
    playDeviceFallback();
  };

  const playDeviceFallback = () => {
    const hasVoice = hasNativeVoiceForLanguage(currentLanguage.speechCode);
    setAudioSource('device');

    if (hasVoice) {
      setVoiceNotice(`Playing with ${currentLanguage.name} device synthesizer`);
      speakRegionalText(
        scriptText,
        currentLanguage.speechCode,
        speechRate,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        (err) => {
          console.warn('Device speech synthesis failed:', err);
          setIsPlaying(false);
        }
      );
    } else {
      // Avoid unintelligible garble on systems without this Indian language pack
      setVoiceNotice(
        `Note: Your browser lacks ${currentLanguage.name} voice pack. Speaking clear English audio summary.`
      );
      const spokenFallback = englishSummary || cleanSpeechForFarmer(scriptText, 'en');
      speakRegionalText(
        spokenFallback,
        'en-IN',
        speechRate,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  const handlePauseOrStop = () => {
    stopSpeech();
    setIsPlaying(false);
  };

  const handleToggleRate = () => {
    // Cycle between 1.12x (Medium-Fast), 1.25x (Fast), 1.0x (Normal)
    const nextRate = speechRate === 1.12 ? 1.25 : speechRate === 1.25 ? 1.0 : 1.12;
    setSpeechRate(nextRate);
    if (isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.playbackRate = nextRate;
      } else {
        stopSpeech();
        setTimeout(() => {
          handlePlay();
        }, 150);
      }
    }
  };

  const handleVoiceToggle = async () => {
    const newGender = voiceGender === 'female' ? 'male' : 'female';
    setVoiceGender(newGender);
    stopSpeech();
    setIsPlaying(false);
    setActiveAudioData(undefined);
    // Fetch new voice
    const voiceName = newGender === 'male' ? 'Puck' : 'Kore';
    const newAudio = await fetchStudioAudio(voiceName);
    if (newAudio) {
      playWavAudio(
        newAudio,
        speechRate,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  return (
    <div id="audio-advisory-player" className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-teal-950 text-white rounded-2xl p-5 shadow-lg border-2 border-emerald-600/60">
      
      {/* Top Banner: Voice Alert & Quality Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-emerald-700/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                Kisan Mitra Voice Advisory
              </h3>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 shadow-xs">
                {currentLanguage.nativeName} ({currentLanguage.name})
              </span>
              {audioSource === 'studio' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Studio AI Voice
                </span>
              ) : null}
            </div>
            <p className="text-xs text-emerald-200 font-medium mt-0.5">
              {isPlaying
                ? 'Speaking diagnosis and medicine dosage aloud...'
                : 'Clear, human-like voice guidance in your regional language'}
            </p>
          </div>
        </div>

        {/* Playback Controls & Voice Switchers */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          
          {/* Play/Pause Button */}
          {isPlaying ? (
            <button
              id="btn-pause-audio"
              type="button"
              onClick={handlePauseOrStop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm shadow active:scale-95 transition-all"
            >
              <Pause className="w-4 h-4 fill-emerald-950" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              id="btn-play-audio"
              type="button"
              onClick={handlePlay}
              disabled={isSynthesizing}
              className="flex items-center gap-2 px-4.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-75"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-950" />
                  <span>Preparing Voice...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-emerald-950" />
                  <span>Play Clear Voice</span>
                </>
              )}
            </button>
          )}

          {/* Replay */}
          <button
            id="btn-replay-audio"
            type="button"
            onClick={handlePlay}
            title="Replay from start"
            className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors border border-emerald-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Toggle (1.1x Medium-Fast / 1.25x Fast / 1.0x Normal) */}
          <button
            id="btn-audio-speed"
            type="button"
            onClick={handleToggleRate}
            title="Speed: 1.1x Medium-Fast is tuned for farmer clarity"
            className="px-2.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-xs font-bold transition-colors border border-emerald-700"
          >
            {speechRate === 1.12 ? '1.1x (Medium-Fast)' : `${speechRate}x`}
          </button>

          {/* Voice Gender Switcher (Female Kore / Male Puck) */}
          <button
            id="btn-voice-gender"
            type="button"
            onClick={handleVoiceToggle}
            title={`Switch to ${voiceGender === 'female' ? 'Male' : 'Female'} voice`}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold transition-colors border border-emerald-700"
          >
            <User className="w-3.5 h-3.5 text-amber-300" />
            <span>{voiceGender === 'female' ? 'Female' : 'Male'}</span>
          </button>
        </div>
      </div>

      {/* Spoken Text Presentation with Authentic Script */}
      <div className="mt-3.5 space-y-2.5">
        <div className="bg-emerald-950/70 rounded-xl p-4 border border-emerald-700/60">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Spoken in {currentLanguage.nativeName} ({currentLanguage.name}):
            </span>
            <button
              type="button"
              onClick={() => setShowEnglish(!showEnglish)}
              className="text-[11px] font-semibold text-emerald-300 hover:text-white underline underline-offset-2"
            >
              {showEnglish ? 'Hide English Summary' : 'Show English Summary'}
            </button>
          </div>

          <p className="text-base sm:text-lg font-medium text-white leading-relaxed font-sans select-text">
            "{scriptText}"
          </p>

          {showEnglish && (
            <div className="mt-2.5 pt-2.5 border-t border-emerald-800 text-xs sm:text-sm text-emerald-200 italic">
              "{englishSummary}"
            </div>
          )}
        </div>

        {/* Informative Status / Notice */}
        {voiceNotice && (
          <div className="flex items-center gap-2 text-xs text-emerald-300/90 font-medium px-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{voiceNotice}</span>
          </div>
        )}

        {/* Visual equalizer / waveform when playing */}
        {isPlaying && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-950/40 rounded-lg">
            <span className="w-1.5 h-3.5 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="w-1.5 h-7 bg-amber-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-4.5 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-3 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-amber-300 ml-2">Voice Playing Aloud</span>
          </div>
        )}
      </div>
    </div>
  );
};
