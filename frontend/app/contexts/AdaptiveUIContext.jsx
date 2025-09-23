import { createContext, useContext, useState, useEffect } from 'react';
import { STUDENT_TYPES } from '../constants/studentTypes';

const AdaptiveUIContext = createContext();

export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (!context) {
    throw new Error('useAdaptiveUI must be used within AdaptiveUIProvider');
  }
  return context;
};

export const AdaptiveUIProvider = ({ children, studentType }) => {
  const [uiSettings, setUiSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    animations: true,
    soundEnabled: false,
    voiceEnabled: false,
    simplifiedMode: false,
    visualAids: false,
    keyboardNavigation: false,
    textToSpeech: false,
    speechToText: false,
  });

  // Apply default settings based on student type
  useEffect(() => {
    if (!studentType) return;

    const typeConfig = Object.values(STUDENT_TYPES).find(
      type => type.value === studentType
    );

    if (!typeConfig) return;

    switch (studentType) {
      case 'visually_impaired':
        setUiSettings({
          fontSize: 'large',
          contrast: 'high',
          animations: false,
          soundEnabled: true,
          voiceEnabled: true,
          simplifiedMode: false,
          visualAids: false,
          keyboardNavigation: true,
          textToSpeech: true,
          speechToText: true,
        });
        break;

      case 'hearing_impaired':
        setUiSettings({
          fontSize: 'normal',
          contrast: 'normal',
          animations: true,
          soundEnabled: false,
          voiceEnabled: false,
          simplifiedMode: false,
          visualAids: true,
          keyboardNavigation: false,
          textToSpeech: false,
          speechToText: false,
        });
        break;

      case 'speech_impaired':
        setUiSettings({
          fontSize: 'normal',
          contrast: 'normal',
          animations: true,
          soundEnabled: true,
          voiceEnabled: false,
          simplifiedMode: false,
          visualAids: false,
          keyboardNavigation: true,
          textToSpeech: true,
          speechToText: false,
        });
        break;

      case 'slow_learner':
        setUiSettings({
          fontSize: 'large',
          contrast: 'normal',
          animations: true,
          soundEnabled: true,
          voiceEnabled: false,
          simplifiedMode: true,
          visualAids: true,
          keyboardNavigation: false,
          textToSpeech: false,
          speechToText: false,
        });
        break;

      default:
        break;
    }
  }, [studentType]);

  const updateSetting = (key, value) => {
    setUiSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getThemeClasses = () => {
    const classes = [];
    
    // Font size classes
    if (uiSettings.fontSize === 'large') {
      classes.push('text-lg', 'lg:text-xl');
    } else if (uiSettings.fontSize === 'extra-large') {
      classes.push('text-xl', 'lg:text-2xl');
    }
    
    // Contrast classes
    if (uiSettings.contrast === 'high') {
      classes.push('high-contrast');
    }
    
    // Animation classes
    if (!uiSettings.animations) {
      classes.push('reduce-motion');
    }
    
    // Simplified mode
    if (uiSettings.simplifiedMode) {
      classes.push('simplified-ui');
    }
    
    return classes.join(' ');
  };

  const getStudentTypeConfig = () => {
    return Object.values(STUDENT_TYPES).find(
      type => type.value === studentType
    );
  };

  return (
    <AdaptiveUIContext.Provider 
      value={{
        uiSettings,
        updateSetting,
        getThemeClasses,
        studentType,
        getStudentTypeConfig,
      }}
    >
      {children}
    </AdaptiveUIContext.Provider>
  );
};

export default AdaptiveUIContext;
