import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useTTS from '../hooks/useTTS';

const TTSContext = createContext();

export const useTTSContext = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTSContext must be used within TTSProvider');
  }
  return context;
};

/**
 * TTS Provider for managing Text-to-Speech functionality across the app
 */
export const TTSProvider = ({ children, enabled = false, autoStart = false }) => {
  const tts = useTTS();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [readingQueue, setReadingQueue] = useState([]);
  const [currentReadingElement, setCurrentReadingElement] = useState(null);

  // Auto-read on navigation for visually impaired users
  const [autoRead, setAutoRead] = useState(autoStart);

  /**
   * Enable TTS with user consent
   */
  const enableTTS = useCallback(() => {
    setIsEnabled(true);
    setHasUserConsent(true);
    setShowWelcomePopup(false);
    
    // Announce TTS is enabled
    if (tts.isSupported) {
      tts.speak('Text to speech is now enabled. I will read the page content for you.');
    }
  }, [tts]);

  /**
   * Disable TTS
   */
  const disableTTS = useCallback(() => {
    setIsEnabled(false);
    tts.stop();
    setReadingQueue([]);
    setCurrentReadingElement(null);
  }, [tts]);

  /**
   * Toggle TTS on/off
   */
  const toggleTTS = useCallback(() => {
    if (isEnabled) {
      disableTTS();
    } else {
      enableTTS();
    }
  }, [isEnabled, enableTTS, disableTTS]);

  /**
   * Read specific content
   */
  const readContent = useCallback((content, priority = 'normal') => {
    if (!isEnabled || !tts.isSupported) return;

    if (priority === 'immediate') {
      tts.stop();
      tts.speak(content);
    } else if (priority === 'high') {
      setReadingQueue(prev => [content, ...prev]);
    } else {
      setReadingQueue(prev => [...prev, content]);
    }
  }, [isEnabled, tts]);

  /**
   * Read page content automatically
   */
  const readPageContent = useCallback(() => {
    if (!isEnabled || !tts.isSupported) return;

    // Find main content area
    const mainContent = document.querySelector('main') || 
                       document.querySelector('[role="main"]') || 
                       document.querySelector('.dashboard-content') ||
                       document.body;

    if (mainContent) {
      tts.speakElement(mainContent);
      setCurrentReadingElement(mainContent);
    }
  }, [isEnabled, tts]);

  /**
   * Read focused element
   */
  const readFocusedElement = useCallback(() => {
    if (!isEnabled || !tts.isSupported) return;

    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement !== document.body) {
      const text = focusedElement.getAttribute('aria-label') || 
                  focusedElement.textContent || 
                  focusedElement.value || 
                  '';
      
      if (text) {
        tts.speak(text);
      }
    }
  }, [isEnabled, tts]);

  /**
   * Handle keyboard shortcuts for TTS control
   */
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyPress = (e) => {
      // Alt + R: Read page
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        readPageContent();
      }
      // Alt + S: Stop reading
      else if (e.altKey && e.key === 's') {
        e.preventDefault();
        tts.stop();
      }
      // Alt + P: Pause/Resume
      else if (e.altKey && e.key === 'p') {
        e.preventDefault();
        if (tts.isPaused) {
          tts.resume();
        } else if (tts.isSpeaking) {
          tts.pause();
        }
      }
      // Alt + F: Read focused element
      else if (e.altKey && e.key === 'f') {
        e.preventDefault();
        readFocusedElement();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnabled, tts, readPageContent, readFocusedElement]);

  /**
   * Process reading queue
   */
  useEffect(() => {
    if (readingQueue.length > 0 && !tts.isSpeaking) {
      const nextContent = readingQueue[0];
      setReadingQueue(prev => prev.slice(1));
      tts.speak(nextContent);
    }
  }, [readingQueue, tts]);

  /**
   * Announce navigation changes
   */
  const announceNavigation = useCallback((message) => {
    if (isEnabled && tts.isSupported) {
      readContent(message, 'high');
    }
  }, [isEnabled, tts, readContent]);

  /**
   * Read form validation errors
   */
  const announceError = useCallback((error) => {
    if (isEnabled && tts.isSupported) {
      readContent(`Error: ${error}`, 'immediate');
    }
  }, [isEnabled, tts, readContent]);

  /**
   * Read success messages
   */
  const announceSuccess = useCallback((message) => {
    if (isEnabled && tts.isSupported) {
      readContent(`Success: ${message}`, 'high');
    }
  }, [isEnabled, tts, readContent]);

  const value = {
    // TTS Hook exports
    ...tts,
    
    // Context specific state
    isEnabled,
    hasUserConsent,
    showWelcomePopup,
    autoRead,
    currentReadingElement,
    
    // Actions
    enableTTS,
    disableTTS,
    toggleTTS,
    setShowWelcomePopup,
    setAutoRead,
    
    // Reading functions
    readContent,
    readPageContent,
    readFocusedElement,
    
    // Announcements
    announceNavigation,
    announceError,
    announceSuccess,
  };

  return (
    <TTSContext.Provider value={value}>
      {children}
    </TTSContext.Provider>
  );
};

export default TTSContext;
