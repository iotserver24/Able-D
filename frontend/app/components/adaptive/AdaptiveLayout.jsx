import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext';
import { AccessibilityControls } from './AccessibilityControls';
import { useEffect } from 'react';

export const AdaptiveLayout = ({ children, showControls = true }) => {
  const { uiSettings, getThemeClasses, studentType, getStudentTypeConfig } = useAdaptiveUI();
  const config = getStudentTypeConfig();

  useEffect(() => {
    // Apply global accessibility settings
    const root = document.documentElement;
    
    // Font size adjustments
    if (uiSettings.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (uiSettings.fontSize === 'extra-large') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }

    // High contrast mode
    if (uiSettings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (!uiSettings.animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Simplified UI
    if (uiSettings.simplifiedMode) {
      root.classList.add('simplified');
    } else {
      root.classList.remove('simplified');
    }

    return () => {
      root.style.fontSize = '';
      root.classList.remove('high-contrast', 'reduce-motion', 'simplified');
    };
  }, [uiSettings]);

  // Voice announcement for visually impaired users
  useEffect(() => {
    if (studentType === 'visually_impaired' && uiSettings.textToSpeech) {
      const announcement = `Welcome. You are using the interface optimized for ${config?.label}. 
        Use Tab key to navigate through elements. Press Escape to access accessibility controls.`;
      
      // Create announcement element for screen readers
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      
      return () => {
        if (announcer.parentNode) {
          announcer.parentNode.removeChild(announcer);
        }
      };
    }
  }, [studentType, config, uiSettings.textToSpeech]);

  const getBackgroundStyle = () => {
    if (!config) return {};
    
    const colorMap = {
      blue: 'from-blue-50 to-blue-100',
      green: 'from-green-50 to-green-100',
      purple: 'from-purple-50 to-purple-100',
      orange: 'from-orange-50 to-orange-100',
    };

    return `bg-gradient-to-br ${colorMap[config.primaryColor] || 'from-gray-50 to-gray-100'}`;
  };

  return (
    <div className={`min-h-screen ${getBackgroundStyle()} ${getThemeClasses()}`}>
      {/* Skip to main content link for keyboard navigation */}
      {uiSettings.keyboardNavigation && (
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
      )}

      {/* Accessibility Controls */}
      {showControls && <AccessibilityControls />}

      {/* Visual indicators for hearing impaired */}
      {studentType === 'hearing_impaired' && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-green-100 border-2 border-green-500 rounded-lg px-3 py-1 text-sm font-medium text-green-800">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Visual Mode Active
          </div>
        </div>
      )}

      {/* Main content */}
      <main id="main-content" className="relative">
        {children}
      </main>

      {/* Visual aids overlay for slow learners */}
      {uiSettings.visualAids && studentType === 'slow_learner' && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Tip:</p>
                <p>Take your time to explore each section. Click on highlighted areas for more information.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice control indicator for visually impaired */}
      {studentType === 'visually_impaired' && uiSettings.voiceEnabled && (
        <div className="fixed bottom-4 right-4 z-40">
          <button 
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Voice control active"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
