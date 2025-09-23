import { useState, useEffect } from 'react';
import { useTTSContext } from '../../contexts/TTSContext';

/**
 * Floating TTS Controller for managing text-to-speech
 */
export const TTSController = ({ position = 'bottom-right' }) => {
  const {
    isEnabled,
    isSpeaking,
    isPaused,
    rate,
    volume,
    toggleTTS,
    pause,
    resume,
    stop,
    updateSettings,
    readPageContent,
  } = useTTSContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');

  // Position classes based on prop
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  if (!isEnabled) return null;

  const handlePlayPause = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      readPageContent();
    }
  };

  const handleRateChange = (newRate) => {
    updateSettings({ rate: parseFloat(newRate) });
  };

  const handleVolumeChange = (newVolume) => {
    updateSettings({ volume: parseFloat(newVolume) });
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-40 transition-all duration-300`}
      role="region"
      aria-label="Text to Speech Controls"
    >
      {/* Expanded Controls */}
      {isExpanded && (
        <div className="mb-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 animate-slideUp">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Voice Controls</h3>
          
          {/* Speed Control */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 flex justify-between mb-1">
              <span>Speed</span>
              <span>{rate}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Speech rate"
            />
          </div>

          {/* Volume Control */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 flex justify-between mb-1">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Speech volume"
            />
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-1">Shortcuts:</p>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Alt+R: Read page</div>
              <div>Alt+S: Stop</div>
              <div>Alt+P: Pause/Resume</div>
              <div>Alt+F: Read focused</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Buttons */}
      <div className="flex items-center gap-2 p-3 bg-white rounded-full shadow-lg border border-gray-200">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          onMouseEnter={() => setShowTooltip('play')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Start reading'}
        >
          {isSpeaking ? (
            isPaused ? (
              // Resume Icon
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              // Pause Icon
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )
          ) : (
            // Play Icon
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
          {showTooltip === 'play' && (
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              {isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Start reading'}
            </span>
          )}
        </button>

        {/* Stop Button */}
        {isSpeaking && (
          <button
            onClick={stop}
            onMouseEnter={() => setShowTooltip('stop')}
            onMouseLeave={() => setShowTooltip('')}
            className="relative p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Stop reading"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            {showTooltip === 'stop' && (
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                Stop
              </span>
            )}
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setShowTooltip('settings')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative p-3 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Voice settings"
          aria-expanded={isExpanded}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          {showTooltip === 'settings' && (
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              Settings
            </span>
          )}
        </button>

        {/* Disable TTS Button */}
        <button
          onClick={toggleTTS}
          onMouseEnter={() => setShowTooltip('disable')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative p-3 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Disable voice assistance"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {showTooltip === 'disable' && (
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              Disable TTS
            </span>
          )}
        </button>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && !isPaused && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}
    </div>
  );
};

export default TTSController;
