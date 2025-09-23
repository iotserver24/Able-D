import { useEffect, useRef } from 'react';
import { useTTSContext } from '../../contexts/TTSContext';

export function TTSWelcomePopup() {
  const { showWelcomePopup, enableTTS, setShowWelcomePopup, tts } = useTTSContext();
  const popupRef = useRef(null);

  useEffect(() => {
    if (showWelcomePopup && popupRef.current) {
      // Focus on popup for accessibility
      popupRef.current.focus();
    }
  }, [showWelcomePopup]);

  const handleClick = () => {
    enableTTS();
  };

  const handleSkip = () => {
    setShowWelcomePopup(false);
    tts.stop();
    tts.speak("Text-to-Speech has been skipped. You can enable it later by pressing Alt plus T.");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enableTTS();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleSkip();
    }
  };

  if (!showWelcomePopup) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tts-welcome-title"
      aria-describedby="tts-welcome-description"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg 
              className="h-10 w-10 text-blue-600" 
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

          {/* Title */}
          <h2 
            id="tts-welcome-title"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Welcome to Voice Assistance
          </h2>

          {/* Description */}
          <p 
            id="tts-welcome-description"
            className="text-gray-600 mb-6"
          >
            We've detected you're using the visually impaired profile. 
            Would you like to enable Text-to-Speech for better navigation?
          </p>

          {/* Features */}
          <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-2">Features include:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic page reading</li>
              <li>• Voice navigation assistance</li>
              <li>• Keyboard shortcuts (Alt+H for help)</li>
              <li>• Adjustable speech rate and voice</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleClick}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Enable Text-to-Speech"
            >
              Enable Voice Assistance
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full px-6 py-2 text-gray-600 font-medium hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              aria-label="Skip Text-to-Speech setup"
            >
              Skip for now
            </button>
          </div>

          {/* Instruction */}
          <p className="text-xs text-gray-500 mt-4">
            Click anywhere outside or press Enter to enable
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default TTSWelcomePopup;
