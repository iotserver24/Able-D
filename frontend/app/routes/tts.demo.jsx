import { useState, useEffect } from "react";
import { TTSProvider } from "../contexts/TTSContext";
import { TTSWelcomePopup } from "../components/tts/TTSWelcomePopup";
import { TTSController } from "../components/tts/TTSController";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function meta() {
  return [
    { title: "TTS Demo - Adaptive Learning Platform" },
    { name: "description", content: "Text-to-Speech demonstration for visually impaired students" },
  ];
}

export default function TTSDemo() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);

  // Auto-show welcome popup when demo starts
  useEffect(() => {
    if (demoStarted && !ttsEnabled) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [demoStarted, ttsEnabled]);

  const handleWelcomeClose = (enabled) => {
    setShowWelcome(false);
    setTtsEnabled(enabled);
  };

  const startDemo = () => {
    setDemoStarted(true);
  };

  if (!demoStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex p-4 bg-blue-100 rounded-full">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Text-to-Speech Demo
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Experience our accessibility features designed for visually impaired students.
              This demo will show you how our TTS system works.
            </p>

            <Button 
              onClick={startDemo}
              className="px-8 py-4 text-lg"
            >
              Start TTS Demo for Visually Impaired Students
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <TTSProvider enabled={ttsEnabled} autoStart={true}>
      {/* TTS Welcome Popup */}
      {showWelcome && (
        <TTSWelcomePopup onClose={handleWelcomeClose} />
      )}

      {/* TTS Controller */}
      {ttsEnabled && <TTSController position="bottom-right" />}

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Adaptive Learning Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome, Visually Impaired Student
            </p>
          </header>

          {/* Learning Content */}
          <main role="main" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Today's Lesson: Introduction to Mathematics
              </h2>
              <p className="text-gray-700 mb-4">
                Welcome to your mathematics lesson. Today we will learn about basic arithmetic operations.
                Let's start with addition and subtraction.
              </p>
              <p className="text-gray-700 mb-4">
                Addition is the process of combining two or more numbers to get their total.
                For example, 2 plus 3 equals 5.
              </p>
              <p className="text-gray-700">
                Subtraction is the process of taking away one number from another.
                For example, 5 minus 2 equals 3.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Interactive Exercise
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="block text-gray-700 font-medium mb-2">
                    Question 1: What is 4 + 3?
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter your answer"
                    aria-label="Answer for 4 plus 3"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="block text-gray-700 font-medium mb-2">
                    Question 2: What is 10 - 6?
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter your answer"
                    aria-label="Answer for 10 minus 6"
                  />
                </div>
                <Button className="w-full">
                  Submit Answers
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                TTS Controls Information
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>• Use Alt+R to read the entire page</p>
                <p>• Use Alt+S to stop reading</p>
                <p>• Use Alt+P to pause or resume reading</p>
                <p>• Use Alt+F to read the focused element</p>
                <p>• Click the floating controls at the bottom right to adjust settings</p>
              </div>
            </Card>
          </main>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-600">
            <p>This is a demonstration of TTS features for visually impaired students</p>
          </footer>
        </div>
      </div>
    </TTSProvider>
  );
}
