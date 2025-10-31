import React, { createContext, useState, useCallback, ReactNode, useEffect, useContext } from 'react';

interface VoiceOptions {
  pitch: number;
  rate: number;
  volume: number;
}

interface SpeechContextType {
  speak: (text: string, options: VoiceOptions) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleEnd = useCallback(() => {
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string, options: VoiceOptions) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en-GB'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.lang = 'en-GB';
    utterance.pitch = options.pitch;
    utterance.rate = options.rate;
    utterance.volume = options.volume;
    
    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
    };
    utterance.onend = handleEnd;
    utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error", e);
        handleEnd();
    };
    
    window.speechSynthesis.cancel();
    setTimeout(() => window.speechSynthesis.speak(utterance), 100);
  }, [handleEnd]);

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  const cancel = () => {
      window.speechSynthesis.cancel();
      handleEnd();
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
    }
  }, []);

  // FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
  // This avoids JSX parsing errors because the TypeScript compiler was misinterpreting JSX syntax.
  return React.createElement(
    SpeechContext.Provider,
    { value: { speak, pause, resume, cancel, isSpeaking, isPaused } },
    children
  );
};


export const useWebSpeech = () => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useWebSpeech must be used within a SpeechProvider');
  }
  return context;
};