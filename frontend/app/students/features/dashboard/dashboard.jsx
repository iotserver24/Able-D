import { useState, useEffect, useContext } from 'react';
import { DocumentUpload } from '../document-upload/DocumentUpload';
import { AudioRecorder } from '../audio-input/AudioRecorder';
import QASection from './QASection';
import NotesList from '../notes/NotesList';
import { STUDENT_TYPES } from '../../../constants/studentTypes';
import { useAuth } from '../../../contexts/AuthContext';
import AdaptiveUIContext from '../../../contexts/AdaptiveUIContext';
import TTSContext from '../../../contexts/TTSContext';
import { TTSController } from '../../../components/tts/TTSController';
import notesService from '../../../services/notes.service';

export function Dashboard({ studentType = 'vision' }) {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSubject, setSelectedSubject] = useState('science');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use context safely with fallback
  const adaptiveContext = useContext(AdaptiveUIContext);
  const uiSettings = adaptiveContext?.uiSettings || {};
  
  // Use auth context
  const { user, logout, isAuthenticated } = useAuth();
  
  // Use TTS context safely
  const ttsContext = useContext(TTSContext);
  const ttsEnabled = ttsContext?.isEnabled || false;
  const readPageContent = ttsContext?.readPageContent || (() => {});
  const announceNavigation = ttsContext?.announceNavigation || (() => {});
  const announceSuccess = ttsContext?.announceSuccess || (() => {});
  const announceError = ttsContext?.announceError || (() => {});
  const speak = ttsContext?.speak || (() => {});
  
  const studentConfig = Object.values(STUDENT_TYPES).find(
    type => type.value === studentType
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/student');
    }
  }, [isAuthenticated, navigate]);

  // Load subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      loadSubjects();
    }
  }, [selectedClass]);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadTopics();
    }
  }, [selectedClass, selectedSubject]);

  // Announce page navigation for TTS users
  useEffect(() => {
    if (ttsEnabled && studentType === 'vision') {
      announceNavigation('Dashboard', 'Your Adaptive Learning Dashboard');
      setTimeout(() => {
        readPageContent();
      }, 1500);
    }
    
    // Fetch real notes from backend
    loadNotes();
  }, [sessionId, ttsEnabled, studentType]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch notes based on student's class and subject
      const filters = {};
      if (studentInfo?.school) filters.school = studentInfo.school;
      if (studentInfo?.class) filters.className = studentInfo.class;
      if (studentInfo?.subject) filters.subject = studentInfo.subject;
      
      const result = await notesService.getNotes(filters);
      
      if (result.success) {
        // Transform the notes data to match the expected format
        const transformedNotes = result.data.map(note => ({
          id: note._id || note.id,
          title: note.topic || note.name || 'Untitled',
          content: note.text || note.content || '',
          subject: note.subject,
          class: note.class,
          createdAt: note.createdAt,
          uploadedBy: note.uploadedBy
        }));
        
        setNotes(transformedNotes);
        
        // Announce when notes are loaded
        if (ttsEnabled) {
          announceSuccess(`Loaded ${transformedNotes.length} notes`);
        }
      } else {
        // If no notes found or error, show welcome message
        setNotes([
          { 
            id: 1, 
            title: 'Welcome to Able-D', 
            content: 'No notes available yet. Your teacher will upload content soon!' 
          }
        ]);
        
        if (ttsEnabled) {
          announceSuccess('Dashboard loaded. No notes available yet.');
        }
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError('Failed to load notes. Please try again later.');
      
      // Show default welcome note on error
      setNotes([
        { 
          id: 1, 
          title: 'Welcome to Able-D', 
          content: 'Unable to load notes at this time. Please check your connection.' 
        }
      ]);
      
      if (ttsEnabled) {
        announceError('Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const school = authService.getCurrentSchool() || 'DemoSchool';
      const result = await teacherService.getNotes({
        school,
        class: selectedClass,
        subject: selectedSubject
      });
      
      if (result.success) {
        // Extract unique topics from notes
        const uniqueTopics = [...new Set(result.data.map(note => note.topic || note.name))];
        setTopics(uniqueTopics.filter(Boolean));
        if (uniqueTopics.length > 0 && !selectedTopic) {
          setSelectedTopic(uniqueTopics[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUploadComplete = (result) => {
    if (ttsEnabled) {
      announceSuccess('Document uploaded successfully');
    }
    // Reload topics after upload
    loadTopics();
  };

  const handleRecordingComplete = (result) => {
    if (ttsEnabled) {
      announceSuccess('Audio recording saved');
    }
    // Reload topics after recording
    loadTopics();
  };

  // Handle TTS reading for buttons
  const handleReadAloud = () => {
    if (ttsEnabled) {
      readPageContent();
    } else {
      const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
      if (mainContent && window.speechSynthesis) {
        const text = mainContent.textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const getStudentTypeLabel = () => {
    const labels = {
      'vision': 'Visual Impairment',
      'hearing': 'Hearing Impairment',
      'dyslexie': 'Dyslexia',
      'adhd': 'ADHD',
      'autism': 'Autism Spectrum',
      'speech': 'Speech Impairment',
      'slow_learner': 'Slow Learner'
    };
    return labels[studentType] || 'General';
  };

  // Render different UI based on student type
  const renderDashboardContent = () => {
    switch (studentType) {
      case 'vision':
      case 'visually_impaired':
        return renderVisuallyImpairedDashboard();
      case 'hearing':
      case 'hearing_impaired':
        return renderHearingImpairedDashboard();
      case 'dyslexie':
        return renderDyslexiaDashboard();
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

      {/* Class and Subject Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-gray-300">
        <h2 className="text-2xl font-bold mb-4">Select Your Class & Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500"
            aria-label="Select class"
          >
            {[6, 7, 8, 9, 10, 11, 12].map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500"
            aria-label="Select subject"
          >
            {subjects.map(subj => (
              <option key={subj.value} value={subj.value}>{subj.label}</option>
            ))}
          </select>

          {topics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500"
              aria-label="Select topic"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Voice Controls Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">Voice Controls</h2>
        <div className="grid grid-cols-1 gap-6">
          <AudioRecorder 
            sessionId={`${selectedClass}-${selectedSubject}`} 
            onRecordingComplete={handleRecordingComplete} 
          />
          <button 
            onClick={handleReadAloud}
            className="p-6 bg-green-600 text-white text-xl rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            aria-label="Read content aloud"
          >
            🔊 Read Content Aloud
          </button>
        </div>
      </div>

      {/* Q&A Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-purple-500">
        <QASection 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
          topic={selectedTopic}
        />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-300">
        <NotesList 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
        />
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

      {/* Class and Subject Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📚 Select Your Class & Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-green-500"
          >
            {[6, 7, 8, 9, 10, 11, 12].map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-green-500"
          >
            {subjects.map(subj => (
              <option key={subj.value} value={subj.value}>{subj.label}</option>
            ))}
          </select>

          {topics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-lg focus:border-green-500"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Q&A */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💬</span> Text Communication
          </h2>
          <QASection 
            studentType={studentType}
            className={selectedClass}
            subject={selectedSubject}
            topic={selectedTopic}
          />
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📄</span> Upload Documents
          </h2>
          <DocumentUpload 
            sessionId={`${selectedClass}-${selectedSubject}`} 
            onUploadComplete={handleUploadComplete} 
          />
        </div>
      </div>

      {/* Structured Notes with visual indicators */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <NotesList 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
        />
      </div>
    </div>
  );

  const renderDyslexiaDashboard = () => (
    <div className="space-y-6">
      {/* Dyslexia-friendly header */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'OpenDyslexic, Arial, sans-serif' }}>
          Learning Dashboard
        </h1>
        <p className="text-xl">Content adapted for easier reading</p>
      </div>

      {/* Reading tips */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <h3 className="font-bold mb-2">💡 Reading Tips:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Use the ruler guide to follow lines</li>
          <li>Take breaks every 10-15 minutes</li>
          <li>Adjust text size and spacing as needed</li>
          <li>Use colored overlays if helpful</li>
        </ul>
      </div>

      {/* Class and Subject Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Select Your Learning Area</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-purple-500"
            style={{ fontFamily: 'OpenDyslexic, Arial, sans-serif' }}
          >
            {[6, 7, 8, 9, 10, 11, 12].map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-purple-500"
            style={{ fontFamily: 'OpenDyslexic, Arial, sans-serif' }}
          >
            {subjects.map(subj => (
              <option key={subj.value} value={subj.value}>{subj.label}</option>
            ))}
          </select>

          {topics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-purple-500"
              style={{ fontFamily: 'OpenDyslexic, Arial, sans-serif' }}
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Adapted Notes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'OpenDyslexic, Arial, sans-serif' }}>
          📖 Your Adapted Notes
        </h2>
        <NotesList 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
        />
      </div>

      {/* Q&A Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'OpenDyslexic, Arial, sans-serif' }}>
          ❓ Ask Questions
        </h2>
        <QASection 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
          topic={selectedTopic}
        />
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
            <span className="text-lg">Choose your class and subject</span>
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

      {/* Simple Class Selection */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-3 border-orange-200">
        <h2 className="text-2xl font-bold mb-6">📚 Choose What to Study</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-lg font-medium mb-2">Your Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-4 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500"
            >
              {[6, 7, 8, 9, 10, 11, 12].map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-lg font-medium mb-2">Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-4 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500"
            >
              {subjects.map(subj => (
                <option key={subj.value} value={subj.value}>{subj.label}</option>
              ))}
            </select>
          </div>

          {topics.length > 0 && (
            <div>
              <label className="block text-lg font-medium mb-2">Topic:</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full p-4 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Visual notes with icons */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-3xl">📖</span>
          Your Study Notes
        </h2>
        <NotesList 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
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
        <QASection 
          studentType={studentType}
          className={selectedClass}
          subject={selectedSubject}
          topic={selectedTopic}
        />
      </div>
    </div>
  );

  const renderDefaultDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold">Student Learning Dashboard</h1>
        <p className="text-lg mt-2">Welcome back, {user?.name || 'Student'}!</p>
      </div>

      {/* Class and Subject Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Select Your Class & Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[6, 7, 8, 9, 10, 11, 12].map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map(subj => (
              <option key={subj.value} value={subj.value}>{subj.label}</option>
            ))}
          </select>

          {topics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <QASection 
            studentType={studentType}
            className={selectedClass}
            subject={selectedSubject}
            topic={selectedTopic}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <NotesList 
            studentType={studentType}
            className={selectedClass}
            subject={selectedSubject}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* User info and logout */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {studentType === 'vision' ? '👁️' :
               studentType === 'hearing' ? '👂' :
               studentType === 'dyslexie' ? '📖' :
               studentType === 'slow_learner' ? '🌟' : '📚'}
            </span>
            <div>
              <p className="text-sm text-gray-600">Logged in as Student</p>
              <p className="font-semibold">{user?.name || 'Student'} - {getStudentTypeLabel()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
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

export default Dashboard;
