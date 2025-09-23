import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Text-to-Speech functionality using Web Speech API
 * Provides comprehensive TTS controls for visually impaired users
 */
export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);

  // Check if Web Speech API is supported
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Select default voice (prefer Google voices if available)
        if (availableVoices.length > 0 && !selectedVoice) {
          const googleVoice = availableVoices.find(voice => 
            voice.name.includes('Google') && voice.lang.startsWith('en')
          );
          setSelectedVoice(googleVoice || availableVoices[0]);
        }
      };

      loadVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoice]);

  /**
   * Speak text with current settings
   * @param {string} text - Text to speak
   * @param {Object} options - Optional settings override
   */
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.voice = options.voice || selectedVoice;
    utterance.rate = options.rate || rate;
    utterance.pitch = options.pitch || pitch;
    utterance.volume = options.volume || volume;
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      
      // Process queue if there are more items
      if (queueRef.current.length > 0) {
        const nextText = queueRef.current.shift();
        speak(nextText);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('TTS Error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, rate, pitch, volume]);

  /**
   * Add text to speech queue
   * @param {string} text - Text to add to queue
   */
  const queueSpeak = useCallback((text) => {
    if (!text) return;
    
    if (isSpeaking) {
      queueRef.current.push(text);
    } else {
      speak(text);
    }
  }, [isSpeaking, speak]);

  /**
   * Speak all text content from an element
   * @param {HTMLElement|string} element - DOM element or selector
   */
  const speakElement = useCallback((element) => {
    let targetElement = element;
    
    if (typeof element === 'string') {
      targetElement = document.querySelector(element);
    }
    
    if (!targetElement) return;
    
    // Extract text content intelligently
    const textContent = extractTextFromElement(targetElement);
    speak(textContent);
  }, [speak]);

  /**
   * Pause current speech
   */
  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking]);

  /**
   * Resume paused speech
   */
  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isPaused]);

  /**
   * Stop all speech and clear queue
   */
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  /**
   * Update speech settings
   */
  const updateSettings = useCallback((settings) => {
    if (settings.voice !== undefined) setSelectedVoice(settings.voice);
    if (settings.rate !== undefined) setRate(Math.max(0.1, Math.min(10, settings.rate)));
    if (settings.pitch !== undefined) setPitch(Math.max(0, Math.min(2, settings.pitch)));
    if (settings.volume !== undefined) setVolume(Math.max(0, Math.min(1, settings.volume)));
  }, []);

  return {
    // State
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    
    // Actions
    speak,
    queueSpeak,
    speakElement,
    pause,
    resume,
    stop,
    updateSettings,
  };
};

/**
 * Extract text from DOM element intelligently
 * @param {HTMLElement} element - DOM element to extract text from
 * @returns {string} - Extracted and formatted text
 */
function extractTextFromElement(element) {
  const texts = [];
  
  // Priority order for reading
  const selectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  // Headings
    'p',                                   // Paragraphs
    'li',                                  // List items
    'button',                              // Buttons
    'a',                                   // Links
    'label',                               // Labels
    'span',                                // Spans
    'div'                                  // Divs
  ];
  
  // Extract text based on priority
  selectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => {
      // Skip if element is hidden
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return;
      }
      
      // Get direct text content (not from children)
      const directText = Array.from(el.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join(' ')
        .trim();
      
      if (directText) {
        // Add context for certain elements
        if (el.tagName === 'BUTTON') {
          texts.push(`Button: ${directText}`);
        } else if (el.tagName === 'A') {
          texts.push(`Link: ${directText}`);
        } else if (el.tagName.startsWith('H')) {
          texts.push(`Heading: ${directText}`);
        } else {
          texts.push(directText);
        }
      }
    });
  });
  
  // Remove duplicates and join
  const uniqueTexts = [...new Set(texts)];
  return uniqueTexts.join('. ');
}

export default useTTS;
