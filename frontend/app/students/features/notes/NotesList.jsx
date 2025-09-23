import { useState, useEffect } from 'react';
import teacherService from '../../../services/teacher.service';
import authService from '../../../services/auth.service';
import aiService from '../../../services/ai.service';

export function NotesList({ studentType = 'vision', className, subject }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingTips, setGeneratingTips] = useState(false);
  const [studyTips, setStudyTips] = useState(null);

  // Load notes when component mounts or filters change
  useEffect(() => {
    if (className && subject) {
      loadNotes();
    }
  }, [className, subject]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const school = authService.getCurrentSchool() || 'DemoSchool';
      
      // Fetch notes from backend
      const result = await teacherService.getNotes({
        school,
        class: className,
        subject
      });

      if (result.success) {
        setNotes(result.data || []);
      } else {
        setError(result.error || 'Failed to load notes');
      }
    } catch (err) {
      setError('Failed to load notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStudyTips = async () => {
    try {
      setGeneratingTips(true);
      const result = await aiService.getStudyTips(studentType, subject);
      
      if (result.success) {
        setStudyTips(result.data);
      }
    } catch (err) {
      console.error('Failed to get study tips:', err);
    } finally {
      setGeneratingTips(false);
    }
  };

  const getAdaptedContent = (note) => {
    // Return content based on student type
    if (studentType === 'dyslexie' && note.variants?.dyslexie) {
      return note.variants.dyslexie;
    }
    return note.text || '';
  };

  const getStudentTypeLabel = () => {
    const labels = {
      'vision': 'Visual Impairment',
      'hearing': 'Hearing Impairment',
      'dyslexie': 'Dyslexia',
      'adhd': 'ADHD',
      'autism': 'Autism Spectrum'
    };
    return labels[studentType] || 'General';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
        <button
          onClick={loadNotes}
          className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with student type indicator */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Study Notes</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Adapted for: {getStudentTypeLabel()}
          </span>
          {!studyTips && (
            <button
              onClick={getStudyTips}
              disabled={generatingTips}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {generatingTips ? 'Getting tips...' : 'Get Study Tips'}
            </button>
          )}
        </div>
      </div>

      {/* Study Tips */}
      {studyTips && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                📚 Study Tips for {getStudentTypeLabel()}
              </h3>
              <div className="text-sm text-blue-800">
                {typeof studyTips === 'object' && studyTips.study_tips ? (
                  <ul className="list-disc list-inside space-y-1">
                    {studyTips.study_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{studyTips}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setStudyTips(null)}
              className="text-blue-500 hover:text-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-1">No notes available</p>
          <p className="text-sm">Notes will appear here when teachers upload content</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note._id || note.id}
              className={`border rounded-lg transition-all duration-200 ${
                selectedNote === note._id 
                  ? 'border-blue-400 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
            >
              {/* Note Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setSelectedNote(selectedNote === note._id ? null : note._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {note.topic || note.name || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {note.subject}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(note.createdAt || note.timestamp)}
                      </span>
                      {note.sourceType && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.sourceType === 'audio' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {note.sourceType === 'audio' ? '🎤 Audio' : '📄 Document'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 ml-4">
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${
                        selectedNote === note._id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {selectedNote === note._id && (
                <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                  {/* Main Content */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-700">Content</h4>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {getAdaptedContent(note)}
                    </div>
                  </div>

                  {/* Dyslexie Tips (if available) */}
                  {note.variants?.meta?.dyslexieTips && studentType === 'dyslexie' && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium mb-2 text-yellow-800">
                        💡 Reading Tips
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {note.variants.meta.dyslexieTips}
                      </p>
                    </div>
                  )}

                  {/* Audio Player (if available) */}
                  {note.variants?.audioUrl && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-medium mb-2 text-purple-800">
                        🔊 Audio Version
                      </h4>
                      <audio
                        src={note.variants.audioUrl}
                        controls
                        className="w-full"
                      />
                      <p className="text-xs text-purple-600 mt-2">
                        Listen to this content read aloud
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>Uploaded by: {note.uploadedBy || 'Teacher'}</span>
                      {note.originalFilename && (
                        <span>Source: {note.originalFilename}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotesList;
