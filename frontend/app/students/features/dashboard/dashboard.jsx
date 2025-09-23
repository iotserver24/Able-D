import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { DocumentUpload } from '../document-upload/DocumentUpload';
import { AudioRecorder } from '../audio-input/AudioRecorder';
import { QASection } from './QASection';
import { NotesList } from '../notes/NotesList';

export function Dashboard({ sessionId, studentType }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotes();
  }, [sessionId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const result = await api.getNotes(sessionId);
      setNotes(result);
    } catch (err) {
      setError('Failed to load notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (result) => {
    loadNotes();
  };

  const handleRecordingComplete = (result) => {
    loadNotes();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Add Content</h2>
            <div className="space-y-4">
              <DocumentUpload 
                sessionId={sessionId} 
                onUploadComplete={handleUploadComplete} 
              />
              
              {studentType === 'visually_impaired' && (
                <AudioRecorder 
                  sessionId={sessionId} 
                  onRecordingComplete={handleRecordingComplete} 
                />
              )}
            </div>
          </div>

          <QASection sessionId={sessionId} />
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Notes</h2>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <NotesList notes={notes} studentType={studentType} />
          )}
        </div>
      </div>
    </div>
  );
}