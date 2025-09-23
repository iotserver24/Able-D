import { useState, useRef } from 'react';
import { api } from '../../../utils/api';

export function AudioRecorder({ sessionId, onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        try {
          const result = await api.processAudio(sessionId, audioBlob);
          onRecordingComplete(result);
        } catch (err) {
          setError('Failed to process audio: ' + err.message);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full p-4 rounded-lg ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {isRecording && (
        <div className="text-center text-red-500 animate-pulse">
          Recording in progress...
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
}