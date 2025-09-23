import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useTTS from '../hooks/useTTS';

const TTSContext = createContext();

export const useTTSContext = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTSContext must be used within TTSProvider');
  }
  return context;
};

export const TTSProvider = ({ children }) => {
  const tts = useTTS();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [readingQueue, setReadingQueue] = useState([]);
  const [currentlyReading, setCurrentlyReading] = useState(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Check if user is visually impaired from localStorage (only on client)
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window === 'undefined') return;
    
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.studentType === 'visually_impaired' && !hasShownWelcome) {
          // Show welcome popup for visually impaired students
          setShowWelcomePopup(true);
          setHasShownWelcome(true);
          
          // Announce welcome message
          if (tts.isSupported) {
            setTimeout(() => {
              tts.speak(
                "Welcome to the Adaptive Learning Platform. " +
                "This platform has been optimized for screen readers and voice assistance. " +
                "Would you like to enable Text-to-Speech for better navigation? " +
                "Click anywhere on the screen or press Enter to continue."
              );
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [tts, hasShownWelcome]);

  // Enable TTS
  const enableTTS = useCallback(() => {
    setIsEnabled(true);
    setShowWelcomePopup(false);
    tts.speak("Text-to-Speech has been enabled. You can press Alt+H at any time to hear the available keyboard shortcuts.");
  }, [tts]);

  // Disable TTS
  const disableTTS = useCallback(() => {
    setIsEnabled(false);
    tts.stop();
    tts.speak("Text-to-Speech has been disabled.");
  }, [tts]);

  // Toggle TTS
  const toggleTTS = useCallback(() => {
    if (isEnabled) {
      disableTTS();
    } else {
      enableTTS();
    }
  }, [isEnabled, enableTTS, disableTTS]);

  // Read page content
  const readPageContent = useCallback(() => {
    if (!isEnabled || !tts.isSupported) return;
    
    // Find main content area
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    
    if (mainContent) {
      tts.speakElement(mainContent);
      setCurrentlyReading('page');
    }
  }, [isEnabled, tts]);

  // Read focused element
  const readFocusedElement = useCallback(() => {
    if (!isEnabled || !tts.isSupported) return;
    
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement !== document.body) {
      const text = focusedElement.getAttribute('aria-label') || 
                   focusedElement.textContent || 
                   focusedElement.value || 
                   'No content to read';
      tts.speak(text);
      setCurrentlyReading('focused');
    }
  }, [isEnabled, tts]);

  // Announce navigation
  const announceNavigation = useCallback((message) => {
    if (!isEnabled || !tts.isSupported) return;
    tts.speak(message);
  }, [isEnabled, tts]);

  // Read notification
  const readNotification = useCallback((message, priority = 'normal') => {
    if (!isEnabled || !tts.isSupported) return;
    
    if (priority === 'high') {
      tts.stop();
      tts.speak(message);
    } else {
      tts.queueSpeak(message);
    }
  }, [isEnabled, tts]);

  // Keyboard shortcuts (only on client)
  useEffect(() => {
    // Only add event listeners on the client side
    if (typeof window === 'undefined') return;
    
    const handleKeyPress = (e) => {
      if (!isEnabled) return;
      
      // Alt + R: Read page content
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        readPageContent();
      }
      
      // Alt + S: Stop reading
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        tts.stop();
        setCurrentlyReading(null);
      }
      
      // Alt + P: Pause/Resume
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        if (tts.isPaused) {
          tts.resume();
        } else if (tts.isSpeaking) {
          tts.pause();
        }
      }
      
      // Alt + F: Read focused element
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        readFocusedElement();
      }
      
      // Alt + H: Help (read shortcuts)
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        tts.speak(
          "Keyboard shortcuts: " +
          "Alt plus R to read page content. " +
          "Alt plus S to stop reading. " +
          "Alt plus P to pause or resume. " +
          "Alt plus F to read focused element. " +
          "Alt plus H to hear these shortcuts again."
        );
      }
      
      // Alt + T: Toggle TTS
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        toggleTTS();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnabled, tts, readPageContent, readFocusedElement, toggleTTS]);

  // Auto-read on navigation
  useEffect(() => {
    if (autoRead && isEnabled) {
      // Delay to allow page to render
      const timer = setTimeout(() => {
        const heading = document.querySelector('h1');
        if (heading) {
          tts.speak(`Page loaded: ${heading.textContent}`);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoRead, isEnabled, tts]);

  const value = {
    // TTS instance
    tts,
    
    // State
    isEnabled,
    showWelcomePopup,
    autoRead,
    currentlyReading,
    
    // Actions
    enableTTS,
    disableTTS,
    toggleTTS,
    setShowWelcomePopup,
    setAutoRead,
    
    // Reading functions
    readPageContent,
    readFocusedElement,
    announceNavigation,
    readNotification,
  };

  return (
    <TTSContext.Provider value={value}>
      {children}
    </TTSContext.Provider>
  );
};

export default TTSContext;
