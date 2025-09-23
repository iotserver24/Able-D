import { useState, useEffect } from "react";
import { useStudentAuth } from "../../../hooks/useStudentAuth";
import { StudentTypeSelector } from "./StudentTypeSelector";
import { AuthStatus } from "./AuthStatus";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoginIcon, AccessibilityIcon } from "../../../components/icons/Icons";
import { TTSProvider } from "../../../contexts/TTSContext";
import { TTSWelcomePopup } from "../../../components/tts/TTSWelcomePopup";
import { TTSController } from "../../../components/tts/TTSController";

export function StudentAuth() {
  const {
    studentType,
    setStudentType,
    handleLogin,
    isAuthenticated,
    isLoading,
    error,
    setError
  } = useStudentAuth();

  const [showTTSWelcome, setShowTTSWelcome] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Handle login with TTS check
  const handleLoginWithTTS = async () => {
    const success = await handleLogin();
    
    // Show TTS welcome popup for visually impaired students after successful login
    if (success && studentType === 'visually_impaired') {
      setShowTTSWelcome(true);
    }
  };

  // Handle TTS Demo
  const handleTTSDemo = () => {
    setStudentType('visually_impaired');
    setDemoMode(true);
    setShowTTSWelcome(true);
  };

  // Handle TTS welcome popup close
  const handleTTSWelcomeClose = (enabled) => {
    setShowTTSWelcome(false);
    setTtsEnabled(enabled);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <AuthStatus message="Signing you in..." type="loading" />
        </Card>
      </div>
    );
  }

  return (
    <TTSProvider enabled={ttsEnabled} autoStart={studentType === 'visually_impaired'}>
      {/* TTS Welcome Popup for Visually Impaired Students */}
      {showTTSWelcome && (
        <TTSWelcomePopup onClose={handleTTSWelcomeClose} />
      )}

      {/* TTS Controller (shows when TTS is enabled) */}
      {ttsEnabled && <TTSController position="bottom-right" />}

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-lg">
          {/* Mobile-optimized header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <AccessibilityIcon className="text-blue-600" size="w-12 h-12 md:w-16 md:h-16" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Welcome to Adaptive Learning
            </h1>
            <p className="text-sm md:text-base text-gray-600 px-4">
              Select your accessibility needs for a personalized experience
            </p>
            
            {/* Development Mode Notice - Mobile optimized */}
            <div className="mt-4 p-2 md:p-3 bg-yellow-50 border border-yellow-200 rounded-lg mx-2 md:mx-0">
              <p className="text-xs md:text-sm text-yellow-800 flex items-center justify-center gap-2">
                <span className="text-base">🔧</span>
                <span>Development Mode: Mock Authentication</span>
              </p>
            </div>
          </div>

          {/* Student Type Selector */}
          <div className="px-2 md:px-0">
            <StudentTypeSelector
              value={studentType}
              onChange={(value) => {
                setStudentType(value);
                setError(null);
              }}
              error={error}
            />
          </div>

          {/* Action buttons - Mobile optimized */}
          <div className="mt-6 md:mt-8 space-y-3 md:space-y-4 px-2 md:px-0">
            <Button
              onClick={handleLoginWithTTS}
              disabled={!studentType || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base"
            >
              <LoginIcon size="w-5 h-5" />
              <span>{isLoading ? 'Signing in...' : 'Continue to Dashboard'}</span>
            </Button>
            
            {/* TTS Demo Button */}
            <Button
              onClick={handleTTSDemo}
              className="w-full flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base bg-purple-600 hover:bg-purple-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>Try TTS Demo (Visually Impaired)</span>
            </Button>
            
            <p className="text-center text-xs md:text-sm text-gray-500 px-4">
              By signing in, you agree to our accessibility-focused learning environment
            </p>
          </div>  

          {/* Mobile-friendly footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 md:hidden">
            <p className="text-xs text-center text-gray-400">
              Optimized for all devices
            </p>
          </div>
        </Card>

        {/* Demo Content (shown when TTS is enabled in demo mode) */}
        {demoMode && ttsEnabled && (
          <div className="fixed inset-0 bg-white z-30 overflow-auto">
            <div className="max-w-4xl mx-auto p-4">
              <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  TTS Demo - Adaptive Learning Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Welcome, Visually Impaired Student (Demo Mode)
                </p>
              </header>

              <main role="main" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    How TTS Works
                  </h2>
                  <p className="text-gray-700 mb-4">
                    This Text-to-Speech system reads page content aloud for visually impaired students.
                    Use the keyboard shortcuts below to control the reading.
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p>• Press Alt+R to read the entire page</p>
                    <p>• Press Alt+S to stop reading</p>
                    <p>• Press Alt+P to pause or resume</p>
                    <p>• Press Alt+F to read the focused element</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Sample Lesson Content
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Welcome to your mathematics lesson. Today we will learn about basic arithmetic.
                    Addition is combining numbers. For example, 2 plus 3 equals 5.
                    Subtraction is taking away. For example, 5 minus 2 equals 3.
                  </p>
                </Card>

                <Button 
                  onClick={() => {
                    setDemoMode(false);
                    setTtsEnabled(false);
                    setStudentType('');
                  }}
                  className="w-full"
                >
                  Exit Demo
                </Button>
              </main>
            </div>
          </div>
        )}
      </div>
    </TTSProvider>
  );
}
