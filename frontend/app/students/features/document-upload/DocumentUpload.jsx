import { useState } from 'react';
import { api } from '../../../utils/api';

const SUPPORTED_FORMATS = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt']
};

export function DocumentUpload({ sessionId, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (isFormatSupported(selectedFile)) {
        setFile(selectedFile);
        setTitle(selectedFile.name.split('.')[0]);
        setError(null);
      } else {
        setError('File format not supported');
        setFile(null);
      }
    }
  };

  const isFormatSupported = (file) => {
    return Object.keys(SUPPORTED_FORMATS).includes(file.type);
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    try {
      setLoading(true);
      setError(null);
      const result = await api.processDocument(sessionId, file, title);
      onUploadComplete(result);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          onChange={handleFileChange}
          accept={Object.entries(SUPPORTED_FORMATS)
            .flatMap(([_, exts]) => exts)
            .join(',')}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          Choose a file
        </label>
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {file.name}
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleUpload}
            disabled={loading || !title}
            className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
}