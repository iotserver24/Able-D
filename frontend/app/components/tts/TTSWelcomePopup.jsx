import { useEffect, useState } from 'react';
import { useTTSContext } from '../../contexts/TTSContext';

/**
 * Welcome popup for visually impaired users to enable TTS
 * Shows a transparent overlay with a message
 */
export const TTSWelcomePopup = ({ onClose }) => {
  const { enableTTS, speak, isSupported } = useTTSContext();
  const [isVisible, setIsVisible] = useState(true);
  const [hasAnnounced, setHasAnnounced] = useState(false);

  useEffect(() => {
    // Announce the popup message when it appears
    if (isSupported && !hasAnnounced) {
      const announcement = `Welcome! This platform has text-to-speech support for better accessibility. 
        Would you like to enable voice assistance? Click anywhere on the screen or press Enter to continue.
        Press Escape to skip.`;
      
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        speak(announcement);
        setHasAnnounced(true);
      }, 500);
    }
  }, [isSupported, speak, hasAnnounced]);

  useEffect(() => {
    // Keyboard event handler
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAccept();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAccept = () => {
    enableTTS();
    setIsVisible(false);
    if (onClose) onClose(true);
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onClose) onClose(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
      onClick={handleAccept}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tts-welcome-title"
      aria-describedby="tts-welcome-description"
    >
      <div 
        className="relative max-w-2xl mx-4 p-8 bg-white bg-opacity-95 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accessibility Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
              <svg 
                className="w-16 h-16 text-white"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 
          id="tts-welcome-title"
          className="text-3xl font-bold text-center text-gray-800 mb-4"
        >
          Voice Assistance Available
        </h2>

        {/* Description */}
        <div id="tts-welcome-description" className="space-y-4 text-center">
          <p className="text-lg text-gray-700">
            Welcome to the Adaptive Learning Platform!
          </p>
          <p className="text-gray-600">
            We've detected you may benefit from our text-to-speech feature.
            This will help you navigate and understand content more easily.
          </p>
          
          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Voice Assistance Features:</h3>
            <ul className="text-left text-blue-800 space-y-1 max-w-md mx-auto">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Automatic page content reading
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Navigation announcements
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Form field descriptions
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Keyboard shortcuts for control
              </li>
            </ul>
          </div>

          {/* Keyboard shortcuts info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
            <div className="flex justify-center gap-4 text-xs">
              <span>Alt+R: Read page</span>
              <span>Alt+S: Stop</span>
              <span>Alt+P: Pause/Resume</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleAccept}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105"
            aria-label="Enable voice assistance"
          >
            Enable Voice Assistance
          </button>
          <button
            onClick={handleSkip}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200"
            aria-label="Continue without voice assistance"
          >
            Continue Without
          </button>
        </div>

        {/* Click anywhere hint */}
        <p className="mt-6 text-center text-sm text-gray-500 animate-pulse">
          Click anywhere or press Enter to enable voice assistance
        </p>
      </div>
    </div>
  );
};

export default TTSWelcomePopup;
