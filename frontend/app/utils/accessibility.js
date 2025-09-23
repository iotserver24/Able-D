// Utility functions for accessibility features

/**
 * Text-to-Speech functionality for visually impaired users
 */
export const speak = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  utterance.lang = options.lang || 'en-US';

  window.speechSynthesis.speak(utterance);
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Speech-to-Text functionality for voice input
 */
export class VoiceRecognition {
  constructor(options = {}) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      this.supported = false;
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || true;
    this.recognition.lang = options.lang || 'en-US';
    this.supported = true;
  }

  start(onResult, onError) {
    if (!this.supported) return;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      onResult(transcript);
    };

    this.recognition.onerror = onError || console.error;
    this.recognition.start();
  }

  stop() {
    if (!this.supported) return;
    this.recognition.stop();
  }
}

/**
 * Keyboard navigation helper
 */
export const setupKeyboardNavigation = (containerElement) => {
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  let currentIndex = 0;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % focusableElements.length;
      focusableElements[currentIndex].focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      focusableElements[currentIndex].focus();
    }
  };

  containerElement.addEventListener('keydown', handleKeyDown);

  return () => {
    containerElement.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Visual alert for hearing impaired users
 */
export const visualAlert = (message, type = 'info') => {
  const alertContainer = document.createElement('div');
  alertContainer.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-lg shadow-2xl animate-pulse`;
  
  const colorMap = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
  };

  alertContainer.className += ` ${colorMap[type]}`;
  alertContainer.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-2xl">
        ${type === 'info' ? 'ℹ️' : 
          type === 'success' ? '✅' : 
          type === 'warning' ? '⚠️' : '❌'}
      </span>
      <p class="text-lg font-semibold">${message}</p>
    </div>
  `;

  document.body.appendChild(alertContainer);

  setTimeout(() => {
    alertContainer.remove();
  }, 3000);
};

/**
 * Simplify content for slow learners
 */
export const simplifyContent = (text) => {
  // Break long sentences into shorter ones
  let simplified = text.replace(/([.!?])\s+/g, '$1\n\n');
  
  // Replace complex words with simpler alternatives (basic implementation)
  const replacements = {
    'utilize': 'use',
    'implement': 'do',
    'demonstrate': 'show',
    'accomplish': 'do',
    'establish': 'set up',
    'maintain': 'keep',
    'obtain': 'get',
    'provide': 'give',
    'require': 'need',
    'sufficient': 'enough',
  };

  Object.keys(replacements).forEach(complex => {
    const simple = replacements[complex];
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });

  return simplified;
};

/**
 * High contrast color helper
 */
export const getHighContrastColor = (baseColor) => {
  const contrastMap = {
    'blue': '#0000FF',
    'green': '#008000',
    'purple': '#800080',
    'orange': '#FF8C00',
    'red': '#FF0000',
    'gray': '#000000',
  };

  return contrastMap[baseColor] || '#000000';
};

/**
 * Font size adjuster
 */
export const adjustFontSize = (element, size) => {
  const sizeMap = {
    'normal': '16px',
    'large': '18px',
    'extra-large': '20px',
  };

  element.style.fontSize = sizeMap[size] || '16px';
};

/**
 * Create accessible announcements for screen readers
 */
export const announce = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    announcement.remove();
  }, 1000);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Get user's preferred color scheme
 */
export const getPreferredColorScheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};
