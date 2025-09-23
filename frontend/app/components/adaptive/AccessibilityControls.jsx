import { useState } from 'react';
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext';

export const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { uiSettings, updateSetting, studentType, getStudentTypeConfig } = useAdaptiveUI();
  const config = getStudentTypeConfig();

  const togglePanel = () => setIsOpen(!isOpen);

  // Keyboard shortcut to open accessibility panel
  useState(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fontSizeOptions = [
    { value: 'normal', label: 'Normal', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'extra-large', label: 'Extra Large', size: '20px' },
  ];

  const contrastOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High Contrast' },
  ];

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={togglePanel}
        className="fixed top-4 left-4 z-50 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Accessibility Settings"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {/* Accessibility Panel */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Accessibility</h2>
            <button
              onClick={togglePanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close accessibility panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Student Type Info */}
          {config && (
            <div className={`mb-6 p-4 rounded-lg bg-${config.primaryColor}-50 border-2 border-${config.primaryColor}-200`}>
              <h3 className="font-semibold text-gray-800 mb-2">Current Profile</h3>
              <p className="text-sm text-gray-600">{config.label}</p>
              <p className="text-xs text-gray-500 mt-1">{config.description}</p>
            </div>
          )}

          {/* Font Size Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Font Size
            </label>
            <div className="space-y-2">
              {fontSizeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('fontSize', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    uiSettings.fontSize === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-gray-500 ml-2">({option.size})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Contrast
            </label>
            <div className="space-y-2">
              {contrastOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('contrast', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    uiSettings.contrast === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-4">
            {/* Animations */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Animations</label>
              <button
                onClick={() => updateSetting('animations', !uiSettings.animations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  uiSettings.animations ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  uiSettings.animations ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Text to Speech (for visually impaired) */}
            {studentType === 'visually_impaired' && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Text to Speech</label>
                <button
                  onClick={() => updateSetting('textToSpeech', !uiSettings.textToSpeech)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    uiSettings.textToSpeech ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    uiSettings.textToSpeech ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {/* Voice Control (for visually impaired) */}
            {studentType === 'visually_impaired' && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Voice Control</label>
                <button
                  onClick={() => updateSetting('voiceEnabled', !uiSettings.voiceEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    uiSettings.voiceEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    uiSettings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {/* Visual Aids (for hearing impaired and slow learners) */}
            {(studentType === 'hearing_impaired' || studentType === 'slow_learner') && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Visual Aids</label>
                <button
                  onClick={() => updateSetting('visualAids', !uiSettings.visualAids)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    uiSettings.visualAids ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    uiSettings.visualAids ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Keyboard Navigation</label>
              <button
                onClick={() => updateSetting('keyboardNavigation', !uiSettings.keyboardNavigation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  uiSettings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  uiSettings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Simplified Mode (for slow learners) */}
            {studentType === 'slow_learner' && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Simplified Mode</label>
                <button
                  onClick={() => updateSetting('simplifiedMode', !uiSettings.simplifiedMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    uiSettings.simplifiedMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    uiSettings.simplifiedMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Keyboard Shortcuts</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li><kbd className="px-2 py-1 bg-white rounded">Esc</kbd> - Toggle this panel</li>
              <li><kbd className="px-2 py-1 bg-white rounded">Tab</kbd> - Navigate elements</li>
              <li><kbd className="px-2 py-1 bg-white rounded">Enter</kbd> - Activate element</li>
              {studentType === 'visually_impaired' && (
                <li><kbd className="px-2 py-1 bg-white rounded">Space</kbd> - Start/Stop voice input</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Overlay when panel is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
    </>
  );
};
