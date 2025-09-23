import { useState } from 'react';
import { api } from '../../../utils/api';

export function QASection({ sessionId, studentType }) {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const result = await api.askQuestion(sessionId, question);
      setAnswers(prev => [...prev, {
        question: question,
        answer: result.answer,
        timestamp: result.timestamp,
        audioUrl: result.audio_url
      }]);
      setQuestion('');
    } catch (err) {
      setError('Failed to get answer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Ask Questions</h2>
      
      <div className="space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
        />

        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="w-full bg-green-500 text-white p-2 rounded-lg
            disabled:bg-gray-300 hover:bg-green-600 transition-colors"
        >
          {loading ? 'Getting Answer...' : 'Ask Question'}
        </button>

        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Q&A History */}
        <div className="mt-6 space-y-4">
          {answers.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-700 mb-2">
                Q: {item.question}
              </div>
              <div className="text-gray-600">
                A: {item.answer}
              </div>
              {studentType === 'visually_impaired' && item.audioUrl && (
                <audio
                  src={item.audioUrl}
                  controls
                  className="mt-2 w-full"
                />
              )}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}