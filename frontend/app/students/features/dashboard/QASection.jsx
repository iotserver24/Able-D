import { useState, useEffect } from 'react';
import aiService from '../../../services/ai.service';
import authService from '../../../services/auth.service';
import teacherService from '../../../services/teacher.service';

export function QASection({ studentType = 'vision', className, subject, topic }) {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load notes for the current topic
  useEffect(() => {
    if (className && subject && topic) {
      loadNotesForTopic();
    }
  }, [className, subject, topic]);

  const loadNotesForTopic = async () => {
    try {
      setLoadingNotes(true);
      const school = authService.getCurrentSchool() || 'DemoSchool';
      
      // Fetch notes for the topic
      const result = await teacherService.getNotes({
        school,
        class: className,
        subject,
        topic
      });

      if (result.success && result.data.length > 0) {
        // Get the first note's content
        const note = result.data[0];
        
        // Use adapted content based on student type
        if (studentType === 'dyslexie' && note.variants?.dyslexie) {
          setNotes(note.variants.dyslexie);
        } else {
          setNotes(note.text || '');
        }
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Use the AI service to get an answer
      const result = await aiService.askQuestion(
        notes || 'General educational content', // Use loaded notes or fallback
        question,
        studentType
      );
      
      if (result.success) {
        setAnswers(prev => [...prev, {
          question: question,
          answer: result.data.answer,
          steps: result.data.steps,
          tips: result.data.tips,
          timestamp: new Date().toISOString()
        }]);
        setQuestion('');
      } else {
        setError(result.error || 'Failed to get answer');
      }
    } catch (err) {
      setError('Failed to get answer: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ask Questions</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Adapted for: {getStudentTypeLabel()}
        </span>
      </div>
      
      {loadingNotes && (
        <div className="text-sm text-gray-500 mb-2">
          Loading topic content...
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here... The AI will provide an answer adapted to your learning needs."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
          <div className="text-xs text-gray-400 mt-1">
            {notes ? `Context: ${subject} - ${topic}` : 'General context'}
          </div>
        </div>

        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="w-full bg-green-500 text-white p-3 rounded-lg font-medium
            disabled:bg-gray-300 hover:bg-green-600 transition-colors
            disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Answer...
            </span>
          ) : (
            'Ask Question'
          )}
        </button>

        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Q&A History */}
        {answers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Previous Questions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {answers.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="space-y-3">
                    {/* Question */}
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium mb-1">
                        Question
                      </span>
                      <p className="font-medium text-gray-800">{item.question}</p>
                    </div>
                    
                    {/* Answer */}
                    <div>
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium mb-1">
                        Answer
                      </span>
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                    
                    {/* Steps (if available) */}
                    {item.steps && (
                      <div>
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium mb-1">
                          Step-by-Step
                        </span>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{item.steps}</p>
                      </div>
                    )}
                    
                    {/* Tips (if available) */}
                    {item.tips && (
                      <div>
                        <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-medium mb-1">
                          Tips
                        </span>
                        <p className="text-gray-600 text-sm italic">{item.tips}</p>
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className="text-xs text-gray-400 pt-2 border-t border-blue-100">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No questions yet */}
        {answers.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No questions asked yet</p>
            <p className="text-xs mt-1">Ask anything about your lessons!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QASection;
