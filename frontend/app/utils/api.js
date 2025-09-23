const API_BASE_URL = 'https://back.hcknroll.megavault.pw/api';

export const api = {
  async createSession(studentType) {
    const response = await fetch(`${API_BASE_URL}/session/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_type: studentType })
    });
    return response.json();
  },

  async processDocument(sessionId, file, title) {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('file', file);
    formData.append('title', title);

    const response = await fetch(`${API_BASE_URL}/process/document`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async processAudio(sessionId, audioBlob) {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('audio', audioBlob);

    const response = await fetch(`${API_BASE_URL}/process/audio`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async askQuestion(sessionId, question) {
    const response = await fetch(`${API_BASE_URL}/qna/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, question })
    });
    return response.json();
  },

  async getSessionInfo(sessionId) {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/info`);
    return response.json();
  },

  async getNotes(sessionId) {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/notes`);
    return response.json();
  },

  async getHistory(sessionId) {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/history`);
    return response.json();
  }
};