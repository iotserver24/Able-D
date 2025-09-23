import { useState, useEffect } from 'react';
import { useTTSContext } from '../../contexts/TTSContext';

export function TTSController() {
  const { 
    tts, 
    isEnabled, 
    toggleTTS,
    readPageContent,
    currentlyReading 
  } = useTTSContext();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Don't render if TTS is not enabled
  if (!isEnabled) return null;

  const handlePlayPause = () => {
    if (tts.isSpeaking) {
      if (tts.isPaused) {
        tts.resume();
      } else {
        tts.pause();
      }
    } else {
      readPageContent();
    }
  };

  const handleStop = () => {
    tts.stop();
  };

  const handleSpeedChange = (e) => {
    const newRate = parseFloat(e.target.value);
    tts.updateSettings({ rate: newRate });
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    tts.updateSettings({ volume: newVolume });
  };

  const handleVoiceChange = (e) => {
    const selectedVoice = tts.voices.find(v => v.name === e.target.value);
    if (selectedVoice) {
      tts.updateSettings({ voice: selectedVoice });
    }
  };

  return (
    <>
      {/* Floating Controller */}
      <div 
        className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
          isMinimized ? 'w-14' : 'w-64'
        }`}
        role="region"
        aria-label="Text-to-Speech Controls"
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <svg 
                className="h-5 w-5 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                />
              </svg>
              {!isMinimized && (
                <span className="text-sm font-medium text-gray-700">Voice Control</span>
              )}
            </div>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isMinimized ? "Expand controls" : "Minimize controls"}
            >
              <svg 
                className="h-4 w-4 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMinimized ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
                />
              </svg>
            </button>
          </div>

          {/* Controls */}
          {!isMinimized && (
            <div className="p-3 space-y-3">
              {/* Play Controls */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={tts.isSpeaking && !tts.isPaused ? "Pause" : "Play"}
                >
                  {tts.isSpeaking && !tts.isPaused ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={handleStop}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Stop"
                  disabled={!tts.isSpeaking}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Settings"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Status */}
              {tts.isSpeaking && (
                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    {tts.isPaused ? 'Paused' : 'Speaking...'}
                  </p>
                </div>
              )}

              {/* Settings Panel */}
              {showSettings && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  {/* Speed Control */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Speed: {tts.rate}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={tts.rate}
                      onChange={handleSpeedChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Speech rate"
                    />
                  </div>

                  {/* Volume Control */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Volume: {Math.round(tts.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={tts.volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Speech volume"
                    />
                  </div>

                  {/* Voice Selection */}
                  {tts.voices.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Voice
                      </label>
                      <select
                        value={tts.selectedVoice?.name || ''}
                        onChange={handleVoiceChange}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label="Voice selection"
                      >
                        {tts.voices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Disable TTS */}
                  <button
                    onClick={toggleTTS}
                    className="w-full px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Disable Voice Assistance
                  </button>
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              <div className="text-center pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Press Alt+H for shortcuts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minimized Indicator */}
      {isMinimized && tts.isSpeaking && (
        <div className="fixed bottom-20 right-6 z-40">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs animate-pulse">
            Speaking...
          </div>
        </div>
      )}
    </>
  );
}

export default TTSController;
