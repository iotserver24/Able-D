import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface TTSContextType {
  isEnabled: boolean;
  isReading: boolean;
  isPaused: boolean;
  currentText: string;
  showWelcomePopup: boolean;
  autoRead: boolean;
  speed: number;
  volume: number;
  voice: string;
  
  // Control functions
  speak: (text: string) => void;
  speakElement: (element: Element) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setEnabled: (enabled: boolean) => void;
  setAutoRead: (autoRead: boolean) => void;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setVoice: (voice: string) => void;
  closeWelcomePopup: () => void;
  
  // Page reading functions
  readPageContent: () => void;
  readFocusedElement: () => void;
  readShortcuts: () => void;
  toggleTTS: () => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voice, setVoice] = useState('');

  // Initialize TTS for visually impaired students
  useEffect(() => {
    if (user?.studentType === 'visually_impaired' && !isEnabled) {
      setShowWelcomePopup(true);
      setIsEnabled(true);
    }
  }, [user, isEnabled]);

  // Speech synthesis functions
  const speak = useCallback((text: string) => {
    if (!text || !isEnabled) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.volume = volume;
    
    if (voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
      setCurrentText(text);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentText('');
    };

    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentText('');
    };

    window.speechSynthesis.speak(utterance);
  }, [isEnabled, speed, volume, voice]);

  const speakElement = useCallback((element: Element) => {
    if (!element || !isEnabled) return;
    
    // Get text content, prioritizing aria-label and alt text
    const ariaLabel = element.getAttribute('aria-label');
    const altText = element.getAttribute('alt');
    const textContent = element.textContent?.trim();
    
    const textToSpeak = ariaLabel || altText || textContent || '';
    
    if (textToSpeak) {
      speak(textToSpeak);
    }
  }, [speak, isEnabled]);

  const pause = useCallback(() => {
    if (isReading && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isReading, isPaused]);

  const resume = useCallback(() => {
    if (isReading && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isReading, isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setCurrentText('');
  }, []);

  // Page reading functions
  const readPageContent = useCallback(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      speakElement(mainContent);
    } else {
      // Fallback to body content, excluding navigation and headers
      const bodyText = document.body.textContent?.replace(/\s+/g, ' ').trim();
      if (bodyText) {
        speak(bodyText);
      }
    }
  }, [speakElement, speak]);

  const readFocusedElement = useCallback(() => {
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement !== document.body) {
      speakElement(focusedElement);
    }
  }, [speakElement]);

  const readShortcuts = useCallback(() => {
    const shortcutsText = `
      Text to Speech shortcuts: 
      Alt plus R to read page content,
      Alt plus S to stop reading,
      Alt plus P to pause or resume,
      Alt plus F to read focused element,
      Alt plus T to toggle text to speech,
      Alt plus H to hear these shortcuts again.
    `;
    speak(shortcutsText);
  }, [speak]);

  const toggleTTS = useCallback(() => {
    if (isEnabled) {
      setIsEnabled(false);
      stop();
    } else {
      setIsEnabled(true);
    }
  }, [isEnabled, stop]);

  const closeWelcomePopup = useCallback(() => {
    setShowWelcomePopup(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEnabled || !event.altKey) return;

      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          readPageContent();
          break;
        case 's':
          event.preventDefault();
          stop();
          break;
        case 'p':
          event.preventDefault();
          if (isPaused) {
            resume();
          } else {
            pause();
          }
          break;
        case 'f':
          event.preventDefault();
          readFocusedElement();
          break;
        case 'h':
          event.preventDefault();
          readShortcuts();
          break;
        case 't':
          event.preventDefault();
          toggleTTS();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, isPaused, readPageContent, stop, pause, resume, readFocusedElement, readShortcuts, toggleTTS]);

  // Auto-read page content when enabled and page changes
  useEffect(() => {
    if (isEnabled && autoRead && user?.studentType === 'visually_impaired') {
      const timer = setTimeout(() => {
        readPageContent();
      }, 1000); // Small delay to allow page to load

      return () => clearTimeout(timer);
    }
  }, [isEnabled, autoRead, user, readPageContent]);

  return (
    <TTSContext.Provider value={{
      isEnabled,
      isReading,
      isPaused,
      currentText,
      showWelcomePopup,
      autoRead,
      speed,
      volume,
      voice,
      speak,
      speakElement,
      pause,
      resume,
      stop,
      setEnabled: setIsEnabled,
      setAutoRead,
      setSpeed,
      setVolume,
      setVoice,
      closeWelcomePopup,
      readPageContent,
      readFocusedElement,
      readShortcuts,
      toggleTTS,
    }}>
      {children}
    </TTSContext.Provider>
  );
};

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (context === undefined) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};