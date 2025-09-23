import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getStudentTypeByValue } from '@/constants/studentTypes';

interface AdaptiveUISettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  animations: boolean;
  textToSpeech: boolean;
  voiceEnabled: boolean;
  visualAids: boolean;
  keyboardNavigation: boolean;
  simplifiedMode: boolean;
}

interface AdaptiveUIContextType {
  settings: AdaptiveUISettings;
  updateSettings: (newSettings: Partial<AdaptiveUISettings>) => void;
  resetToDefaults: () => void;
  getAdaptiveClasses: () => string;
}

const defaultSettings: AdaptiveUISettings = {
  fontSize: 'normal',
  contrast: 'normal',
  animations: true,
  textToSpeech: false,
  voiceEnabled: false,
  visualAids: false,
  keyboardNavigation: true,
  simplifiedMode: false,
};

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

export const AdaptiveUIProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AdaptiveUISettings>(defaultSettings);

  // Apply student type-specific defaults
  useEffect(() => {
    if (user?.studentType) {
      const studentTypeConfig = getStudentTypeByValue(user.studentType);
      if (studentTypeConfig) {
        const adaptiveSettings = { ...defaultSettings };

        switch (user.studentType) {
          case 'visually_impaired':
            adaptiveSettings.textToSpeech = true;
            adaptiveSettings.voiceEnabled = true;
            adaptiveSettings.fontSize = 'large';
            adaptiveSettings.keyboardNavigation = true;
            break;
          
          case 'hearing_impaired':
            adaptiveSettings.visualAids = true;
            adaptiveSettings.contrast = 'high';
            break;
          
          case 'speech_impaired':
            adaptiveSettings.textToSpeech = false;
            adaptiveSettings.voiceEnabled = false;
            break;
          
          case 'slow_learner':
            adaptiveSettings.simplifiedMode = true;
            adaptiveSettings.animations = false;
            adaptiveSettings.fontSize = 'large';
            adaptiveSettings.visualAids = true;
            break;
        }

        setSettings(adaptiveSettings);
      }
    }
  }, [user]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('adaptiveUISettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading adaptive UI settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('adaptiveUISettings', JSON.stringify(settings));
  }, [settings]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${settings.fontSize}`);
    
    // High contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Simplified mode
    if (settings.simplifiedMode) {
      root.classList.add('simplified-mode');
    } else {
      root.classList.remove('simplified-mode');
    }
    
    // Reduced animations
    if (!settings.animations) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      style.id = 'reduced-motion-override';
      document.head.appendChild(style);
    } else {
      const existingStyle = document.getElementById('reduced-motion-override');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AdaptiveUISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const getAdaptiveClasses = () => {
    const classes: string[] = [];
    
    if (settings.contrast === 'high') {
      classes.push('high-contrast');
    }
    
    if (settings.simplifiedMode) {
      classes.push('simplified-mode');
    }
    
    classes.push(`font-size-${settings.fontSize}`);
    
    return classes.join(' ');
  };

  return (
    <AdaptiveUIContext.Provider value={{
      settings,
      updateSettings,
      resetToDefaults,
      getAdaptiveClasses,
    }}>
      {children}
    </AdaptiveUIContext.Provider>
  );
};

export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (context === undefined) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider');
  }
  return context;
};