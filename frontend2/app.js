(function () {
  const cfg = window.APP_CONFIG || { apiBaseUrl: '/api' };

  // Elements
  const sections = {
    student: document.getElementById('student-section'),
    teacher: document.getElementById('teacher-section'),
    notes: document.getElementById('notes-section'),
    learn: document.getElementById('learn-section'),
    home: document.getElementById('home-section')
  };
  const statusEls = {
    student: document.getElementById('student-status'),
    teacher: document.getElementById('teacher-status'),
    upload: document.getElementById('upload-status')
  };
  const uploadResult = document.getElementById('upload-result');

  let teacherToken = null;
  let studentToken = null;
  let currentStudentType = '';
  let currentStudent = null;

  // Navigation
  function showSection(key) {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[key].classList.remove('hidden');
    // active tab highlight
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const map = { home: 'nav-home', student: 'nav-student', teacher: 'nav-teacher', notes: 'nav-notes', learn: 'nav-learn' };
    const btnId = map[key];
    if (btnId) {
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.add('active');
    }
  }
  document.getElementById('nav-student').addEventListener('click', () => showSection('student'));
  document.getElementById('nav-teacher').addEventListener('click', () => showSection('teacher'));
  document.getElementById('nav-notes').addEventListener('click', () => showSection('notes'));
  document.getElementById('nav-learn').addEventListener('click', () => showSection('learn'));
  document.getElementById('nav-home').addEventListener('click', () => showSection('home'));

  // Home role shortcuts
  document.getElementById('home-student')?.addEventListener('click', () => showSection('student'));
  document.getElementById('home-teacher')?.addEventListener('click', () => showSection('teacher'));

  // Helpers
  async function apiJson(path, options = {}) {
    const res = await fetch(cfg.apiBaseUrl + path, options);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function setStatus(el, msg, ok = false) {
    el.textContent = msg || '';
    el.classList.remove('ok', 'err');
    if (msg) el.classList.add(ok ? 'ok' : 'err');
  }

  // Student login
  document.getElementById('student-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email');
    const password = fd.get('password');
    setStatus(statusEls.student, 'Logging in...', true);
    try {
      const data = await apiJson('/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      studentToken = data.accessToken;
      currentStudent = data.user || null;
      currentStudentType = currentStudent?.studentType || '';
      setStatus(statusEls.student, 'Logged in as student', true);
      renderStudentInfo(currentStudent);
      updateUserbar({ role: 'student', email: currentStudent?.email, type: currentStudentType });
      showSection('learn');
    } catch (err) {
      setStatus(statusEls.student, err.data?.error || err.message);
    }
  });

  // Teacher login
  document.getElementById('teacher-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email');
    const password = fd.get('password');
    setStatus(statusEls.teacher, 'Logging in...', true);
    try {
      const data = await apiJson('/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      teacherToken = data.accessToken;
      setStatus(statusEls.teacher, 'Logged in as teacher', true);
      updateUserbar({ role: 'teacher', email });
      showSection('notes');
    } catch (err) {
      setStatus(statusEls.teacher, err.data?.error || err.message);
    }
  });

  // Upload type toggle
  const docInput = document.getElementById('doc-input');
  const audioInput = document.getElementById('audio-input');
  document.querySelectorAll('input[name="sourceType"]').forEach(r => {
    r.addEventListener('change', () => {
      const isAudio = r.value === 'audio';
      if (isAudio) {
        audioInput.classList.remove('hidden');
        docInput.classList.add('hidden');
      } else {
        audioInput.classList.add('hidden');
        docInput.classList.remove('hidden');
      }
    });
  });

  // Teacher upload
  document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!teacherToken) {
      setStatus(statusEls.upload, 'Please login as teacher first');
      return;
    }
    const fd = new FormData(e.currentTarget);
    const sourceType = (fd.get('sourceType') || 'document').toString();

    // Validation: exactly one of file/audio
    if (sourceType === 'document' && !fd.get('file')) {
      setStatus(statusEls.upload, 'Please choose a document file');
      return;
    }
    if (sourceType === 'audio' && !fd.get('audio')) {
      setStatus(statusEls.upload, 'Please choose an audio file');
      return;
    }

    setStatus(statusEls.upload, 'Uploading...', true);
    try {
      const res = await fetch(cfg.apiBaseUrl + '/teacher/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
        body: fd
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      setStatus(statusEls.upload, 'Uploaded successfully', true);
      renderNote(data.note);
    } catch (err) {
      setStatus(statusEls.upload, err.message || 'Upload failed');
    }
  });

  // Teacher: Load subjects helper
  document.getElementById('btn-load-subjects').addEventListener('click', async () => {
    if (!teacherToken && !studentToken) {
      setStatus(statusEls.upload, 'Login first (student or teacher) to load subjects');
      return;
    }
    const school = document.querySelector('input[name="school"]').value || (currentStudent?.school || '');
    const className = document.querySelector('input[name="class"]').value || (currentStudent?.class || '');
    if (!school || !className) {
      setStatus(statusEls.upload, 'Enter school and class to load subjects');
      return;
    }
    try {
      const res = await fetch(`${cfg.apiBaseUrl}/subjects?school=${encodeURIComponent(school)}&class=${encodeURIComponent(className)}`, {
        headers: { 'Authorization': `Bearer ${teacherToken || studentToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load subjects');
      const list = document.getElementById('subjects-list');
      list.innerHTML = '';
      (data.items || []).forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.subjectName;
        list.appendChild(opt);
      });
      setStatus(statusEls.upload, 'Subjects loaded', true);
    } catch (err) {
      setStatus(statusEls.upload, err.message || 'Failed to load subjects');
    }
  });

  function renderNote(note) {
    if (!note) return;
    uploadResult.classList.remove('hidden');
    const tpl = document.getElementById('note-template');
    const el = tpl.content.cloneNode(true);
    el.querySelector('h3').textContent = `${note.subject} / ${note.topic}`;
    el.querySelector('.meta').textContent = `${note.school} • Class ${note.class} • ${note.sourceType}`;
    el.querySelector('.base-text').textContent = note.text || '';
    el.querySelector('.dyslexie-text').textContent = note.variants?.dyslexie || '(not available)';
    const audioWrap = el.querySelector('.audio-wrap');
    const audio = el.querySelector('audio');
    if (note.variants?.audioUrl) {
      audio.src = note.variants.audioUrl;
      audioWrap.classList.remove('hidden');
    }

    // Student primary view based on currentStudentType
    const primaryWrap = el.querySelector('.student-primary');
    const primary = el.querySelector('.primary');
    if (currentStudentType) {
      const st = currentStudentType;
      if (st === 'visually_impaired' && note.variants?.audioUrl) {
        primaryWrap.classList.remove('hidden');
        primary.innerHTML = `<audio controls src="${note.variants.audioUrl}"></audio>`;
      } else if (st === 'hearing_impaired') {
        primaryWrap.classList.remove('hidden');
        primary.textContent = note.text || '';
      } else if (st === 'speech_impaired') {
        primaryWrap.classList.remove('hidden');
        primary.textContent = note.text || '';
      } else if (st === 'slow_learner') {
        primaryWrap.classList.remove('hidden');
        primary.textContent = note.variants?.dyslexie || note.text || '';
      }
    }

    // AI adapt button
    const btnAdapt = el.querySelector('.btn-adapt');
    const aiOut = el.querySelector('.ai-adapted-text');
    btnAdapt.addEventListener('click', async () => {
      btnAdapt.disabled = true;
      btnAdapt.textContent = 'Adapting...';
      try {
        // Map backend AI types to our studentType
        const map = {
          visually_impaired: 'vision',
          hearing_impaired: 'hearing',
          speech_impaired: 'speech',
          slow_learner: 'dyslexie'
        };
        const aiType = map[currentStudentType] || 'dyslexie';
        const aiRes = await apiJson('/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ mode: 'notes', studentType: aiType, text: note.text || '' })
        });
        aiOut.textContent = aiRes.content || aiRes.answer || JSON.stringify(aiRes, null, 2);
      } catch (err) {
        aiOut.textContent = err.data?.error || err.message || 'Adaptation failed';
      } finally {
        btnAdapt.disabled = false;
        btnAdapt.textContent = 'Adapt with AI';
      }
    });

    uploadResult.prepend(el);
  }

  function renderStudentInfo(user) {
    if (!user) return;
    const box = document.getElementById('student-info');
    document.getElementById('student-email').textContent = user.email || '';
    document.getElementById('student-name').textContent = user.name || '';
    document.getElementById('student-type-label').textContent = user.studentType || '';
    box.classList.remove('hidden');
  }

  // Header userbar and logout
  const userLabel = document.getElementById('user-label');
  const btnLogout = document.getElementById('btn-logout');
  btnLogout.addEventListener('click', () => {
    teacherToken = null;
    studentToken = null;
    currentStudent = null;
    currentStudentType = '';
    userLabel.textContent = '';
    btnLogout.classList.add('hidden');
    showSection('student');
  });
  function updateUserbar(info) {
    if (!info) return;
    if (info.role === 'teacher') {
      userLabel.textContent = `Teacher: ${info.email || ''}`;
    } else if (info.role === 'student') {
      userLabel.textContent = `Student: ${info.email || ''} • ${info.type || ''}`;
    }
    btnLogout.classList.remove('hidden');
  }

  // Learn page AI adapt
  const learnForm = document.getElementById('learn-ai-form');
  const learnResult = document.getElementById('learn-result');
  const learnOutput = document.getElementById('learn-output');
  learnForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(learnForm);
    const text = (fd.get('text') || '').toString();
    if (!text.trim()) return;
    learnOutput.textContent = 'Adapting...';
    learnResult.classList.remove('hidden');
    try {
      const map = {
        visually_impaired: 'vision',
        hearing_impaired: 'hearing',
        speech_impaired: 'speech',
        slow_learner: 'dyslexie'
      };
      const aiType = map[currentStudentType] || 'dyslexie';
      const aiRes = await apiJson('/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'notes', studentType: aiType, text })
      });
      learnOutput.textContent = aiRes.content || aiRes.answer || JSON.stringify(aiRes, null, 2);
    } catch (err) {
      learnOutput.textContent = err.data?.error || err.message || 'Adaptation failed';
    }
  });

  // Default view
  showSection('home');
})();


