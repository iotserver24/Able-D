import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { DocumentUpload } from '../document-upload/DocumentUpload';
import { AudioRecorder } from '../audio-input/AudioRecorder';
import { QASection } from './QASection';
import { NotesList } from '../notes/NotesList';
import { useAdaptiveUI } from '../../../contexts/AdaptiveUIContext';
import { STUDENT_TYPES } from '../../../constants/studentTypes';
import { useMockAuth } from '../../../constants/MockAuthContext';
import { useTTSContext } from '../../../contexts/TTSContext';
import { TTSController } from '../../../components/tts/TTSController';

export function Dashboard({ sessionId, studentType }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uiSettings } = useAdaptiveUI();
  const { user, logout } = useMockAuth();
  const { 
    isEnabled: ttsEnabled, 
    readPageContent, 
    announceNavigation,
    announceSuccess,
    announceError,
    speak 
  } = useTTSContext();
  
  const studentConfig = Object.values(STUDENT_TYPES).find(
    type => type.value === studentType
  );

  useEffect(() => {
    // Announce page navigation for TTS users
    if (ttsEnabled && studentType === 'visually_impaired') {
      announceNavigation('Dashboard', 'Your Adaptive Learning Dashboard');
      // Auto-read page content after a short delay
      setTimeout(() => {
        readPageContent();
      }, 1500);
    }
    
    // Simulate loading notes - in production, this would fetch from API
    setLoading(true);
    setTimeout(() => {
      setNotes([
        { id: 1, title: 'Welcome Note', content: 'Welcome to your adaptive learning dashboard!' },
      ]);
      setLoading(false);
      
      // Announce when notes are loaded
      if (ttsEnabled) {
        announceSuccess('Your notes have been loaded');
      }
    }, 1000);
  }, [sessionId, ttsEnabled, studentType]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      // Simulated API call
      setTimeout(() => {
        setNotes(prev => [...prev, { 
          id: Date.now(), 
          title: `Note ${prev.length + 1}`, 
          content: 'New note content' 
        }]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to load notes: ' + err.message);
      setLoading(false);
    }
  };

  const handleUploadComplete = (result) => {
    loadNotes();
    if (ttsEnabled) {
      announceSuccess('Document uploaded successfully');
    }
  };

  const handleRecordingComplete = (result) => {
    loadNotes();
    if (ttsEnabled) {
      announceSuccess('Audio recording saved');
    }
  };

  // Handle TTS reading for buttons
  const handleReadAloud = () => {
    if (ttsEnabled) {
      readPageContent();
    } else {
      // If TTS is not enabled through context, use browser's speech synthesis directly
      const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
      if (mainContent && window.speechSynthesis) {
        const text = mainContent.textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Render different UI based on student type
  const renderDashboardContent = () => {
    switch (studentType) {
      case 'visually_impaired':
        return renderVisuallyImpairedDashboard();
      case 'hearing_impaired':
        return renderHearingImpairedDashboard();
      case 'speech_impaired':
        return renderSpeechImpairedDashboard();
      case 'slow_learner':
        return renderSlowLearnerDashboard();
      default:
        return renderDefaultDashboard();
    }
  };

  const renderVisuallyImpairedDashboard = () => (
    <div className="space-y-8 dashboard-content" role="main" aria-label="Audio Learning Dashboard">
      {/* Large, high-contrast header */}
      <div className="bg-blue-900 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">Audio Learning Dashboard</h1>
        <p className="text-xl">Voice-enabled interface for {user?.name || 'Student'}</p>
      </div>

      {/* TTS Information Banner */}
      {ttsEnabled && (
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔊</span>
            <div>
              <p className="font-semibold text-green-800">Text-to-Speech is Active</p>
              <p className="text-sm text-green-700">Use Alt+R to read page, Alt+S to stop, Alt+P to pause/resume</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Controls Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">Voice Controls</h2>
        <div className="grid grid-cols-1 gap-6">
          <AudioRecorder 
            sessionId={sessionId} 
            onRecordingComplete={handleRecordingComplete} 
          />
          <button 
            className="p-6 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            aria-label="Start voice command"
          >
            🎤 Start Voice Command
          </button>
          <button 
            onClick={handleReadAloud}
            className="p-6 bg-green-600 text-white text-xl rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            aria-label="Read content aloud"
          >
            🔊 Read Content Aloud
          </button>
        </div>
      </div>

      {/* Simplified Notes */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-300">
        <h2 className="text-2xl font-bold mb-6">Your Audio Notes</h2>
        <NotesList notes={notes} studentType={studentType} />
      </div>

      {/* TTS Controller - floating controls */}
      {ttsEnabled && <TTSController position="bottom-right" />}
    </div>
  );

  const renderHearingImpairedDashboard = () => (
    <div className="space-y-6">
      {/* Visual header with icons */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <span className="text-4xl">👁️</span>
          <div>
            <h1 className="text-2xl font-bold">Visual Learning Dashboard</h1>
            <p className="text-lg">All content with visual descriptions</p>
          </div>
        </div>
      </div>

      {/* Visual alerts section */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">⚠️</span>
          <p className="font-medium">Visual notifications are enabled for all interactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Upload with visual feedback */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📄</span> Upload Documents
          </h2>
          <DocumentUpload 
            sessionId={sessionId} 
            onUploadComplete={handleUploadComplete} 
          />
        </div>

        {/* Visual Q&A */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💬</span> Text Communication
          </h2>
          <QASection sessionId={sessionId} />
        </div>
      </div>

      {/* Structured Notes with visual indicators */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📝</span> Your Notes (Structured View)
        </h2>
        <NotesList notes={notes} studentType={studentType} />
      </div>
    </div>
  );

  const renderSpeechImpairedDashboard = () => (
    <div className="space-y-6">
      {/* Text-focused header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-2">Text Communication Dashboard</h1>
        <p className="text-lg">Keyboard-optimized interface with text input focus</p>
      </div>

      {/* Keyboard shortcuts guide */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <h3 className="font-bold mb-2">Quick Keyboard Shortcuts:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><kbd className="px-2 py-1 bg-white rounded">Tab</kbd> Navigate</div>
          <div><kbd className="px-2 py-1 bg-white rounded">Enter</kbd> Submit</div>
          <div><kbd className="px-2 py-1 bg-white rounded">Ctrl+N</kbd> New Note</div>
          <div><kbd className="px-2 py-1 bg-white rounded">Ctrl+S</kbd> Save</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced text input area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📝 Text Input Area</h2>
          <textarea 
            className="w-full h-32 p-4 border-2 border-purple-300 rounded-lg text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder="Type your thoughts here..."
          />
          <div className="mt-4 flex gap-2">
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Save Note
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Clear
            </button>
          </div>
        </div>

        {/* Document management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📁 Document Management</h2>
          <DocumentUpload 
            sessionId={sessionId} 
            onUploadComplete={handleUploadComplete} 
          />
        </div>
      </div>

      {/* Text-based Q&A */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">💬 Written Q&A</h2>
        <QASection sessionId={sessionId} />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📚 Your Notes</h2>
        <NotesList notes={notes} studentType={studentType} />
      </div>
    </div>
  );

  const renderSlowLearnerDashboard = () => (
    <div className="space-y-8">
      {/* Friendly, encouraging header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-8 rounded-2xl">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🌟</span>
          <div>
            <h1 className="text-3xl font-bold">Learning Dashboard</h1>
            <p className="text-xl mt-2">Take your time - Learn at your own pace!</p>
          </div>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
        <h2 className="text-xl font-bold mb-4 text-blue-900">📋 Today's Steps:</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-2xl">1️⃣</span>
            <span className="text-lg">Upload your study material</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-2xl">2️⃣</span>
            <span className="text-lg">Read through the simplified notes</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-2xl">3️⃣</span>
            <span className="text-lg">Ask questions if you need help</span>
          </div>
        </div>
      </div>

      {/* Simplified upload section with visual aids */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-3 border-orange-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">📤</span>
          Upload Your Files
        </h2>
        <p className="text-gray-600 mb-4 text-lg">
          Click the button below to add your study materials
        </p>
        <DocumentUpload 
          sessionId={sessionId} 
          onUploadComplete={handleUploadComplete} 
        />
      </div>

      {/* Simplified Q&A with examples */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-3 border-green-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">❓</span>
          Ask Questions
        </h2>
        <p className="text-gray-600 mb-4 text-lg">
          Example: "What does this word mean?" or "Can you explain this again?"
        </p>
        <QASection sessionId={sessionId} />
      </div>

      {/* Visual notes with icons */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">📖</span>
          Your Study Notes
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-3xl animate-bounce">⏳</div>
            <p className="text-lg mt-2">Loading your notes...</p>
          </div>
        ) : (
          <NotesList notes={notes} studentType={studentType} />
        )}
      </div>
    </div>
  );

  const renderDefaultDashboard = () => (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Add Content</h2>
            <div className="space-y-4">
              <DocumentUpload 
                sessionId={sessionId} 
                onUploadComplete={handleUploadComplete} 
              />
            </div>
          </div>
          <QASection sessionId={sessionId} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Notes</h2>
          <NotesList notes={notes} studentType={studentType} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* User info and logout */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{studentConfig?.icon === 'eye' ? '👁️' : 
                                         studentConfig?.icon === 'ear' ? '👂' :
                                         studentConfig?.icon === 'mic' ? '🎤' : '📚'}</span>
            <div>
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold">{user?.name || 'Student'} - {studentConfig?.label}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Render appropriate dashboard based on student type */}
      <div className="max-w-7xl mx-auto">
        {renderDashboardContent()}
      </div>
    </div>
  );
}
