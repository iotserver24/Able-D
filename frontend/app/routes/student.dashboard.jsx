import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from '../students/features/dashboard/dashboard';
import { AdaptiveUIProvider } from '../contexts/AdaptiveUIContext';
import { AdaptiveLayout } from '../components/adaptive/AdaptiveLayout';
import { TTSProvider } from '../contexts/TTSContext';
import { TTSWelcomePopup } from '../components/tts/TTSWelcomePopup';

export function meta() {
  return [
    { title: "Student Dashboard - Able-D" },
    { name: "description", content: "Adaptive learning dashboard for students" },
  ];
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [showTTSWelcome, setShowTTSWelcome] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/student');
    }
    
    // Check if user is a student
    if (user && user.role !== 'student') {
      navigate('/');
    }
    
    // Show TTS welcome for visually impaired students
    if (user && user.studentType === 'visually_impaired' && !ttsEnabled) {
      const timer = setTimeout(() => {
        setShowTTSWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, user, navigate, ttsEnabled]);

  // Handle TTS welcome popup close
  const handleTTSWelcomeClose = (enabled) => {
    setShowTTSWelcome(false);
    setTtsEnabled(enabled);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Ensure user is authenticated and is a student
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <AdaptiveUIProvider studentType={user.studentType}>
      <TTSProvider 
        enabled={ttsEnabled} 
        autoStart={user.studentType === 'visually_impaired'}
      >
        {/* TTS Welcome Popup for Visually Impaired Students */}
        {showTTSWelcome && (
          <TTSWelcomePopup onClose={handleTTSWelcomeClose} />
        )}
        
        <AdaptiveLayout>
          <Dashboard 
            sessionId={user._id || user.id} 
            studentType={user.studentType}
            studentInfo={{
              name: user.name,
              class: user.class,
              subject: user.subject,
              school: user.school,
              email: user.email,
            }}
          />
        </AdaptiveLayout>
      </TTSProvider>
    </AdaptiveUIProvider>
  );
}
