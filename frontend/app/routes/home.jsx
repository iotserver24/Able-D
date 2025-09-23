import { useState, useEffect } from "react";
import { useMockAuth } from "../constants/MockAuthContext";
import { StudentAuth } from "../auth/students/components/StudentAuth";
import { Dashboard } from "../students/features/dashboard/dashboard";
import { AdaptiveUIProvider } from "../contexts/AdaptiveUIContext";
import { AdaptiveLayout } from "../components/adaptive/AdaptiveLayout";
import { TTSProvider } from "../contexts/TTSContext";
import { TTSWelcomePopup } from "../components/tts/TTSWelcomePopup";

export function meta({}) {
  return [
    { title: "Adaptive Learning Platform" },
    { name: "description", content: "Accessible education for all students" },
  ];
}

export default function Home() {
  const { isAuthenticated, user } = useMockAuth();
  const [showTTSWelcome, setShowTTSWelcome] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  
  // Check if we should show TTS welcome for visually impaired students
  useEffect(() => {
    if (isAuthenticated && user?.studentType === 'visually_impaired' && !ttsEnabled) {
      // Show welcome popup after a short delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowTTSWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.studentType, ttsEnabled]);
  
  // Handle TTS welcome popup close
  const handleTTSWelcomeClose = (enabled) => {
    setShowTTSWelcome(false);
    setTtsEnabled(enabled);
  };
  
  // If not authenticated, show login
  if (!isAuthenticated) {
    return <StudentAuth />;
  }
  
  // If authenticated, show dashboard with adaptive UI and TTS support
  return (
    <AdaptiveUIProvider studentType={user?.studentType}>
      <TTSProvider 
        enabled={ttsEnabled} 
        autoStart={user?.studentType === 'visually_impaired'}
      >
        {/* TTS Welcome Popup for Visually Impaired Students */}
        {showTTSWelcome && (
          <TTSWelcomePopup onClose={handleTTSWelcomeClose} />
        )}
        
        <AdaptiveLayout>
          <Dashboard 
            sessionId={user?.id || 'default-session'} 
            studentType={user?.studentType} 
          />
        </AdaptiveLayout>
      </TTSProvider>
    </AdaptiveUIProvider>
  );
}
