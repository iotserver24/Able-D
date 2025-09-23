from __future__ import annotations

from flask import Blueprint, Response


# Deprecated test UI removed intentionally. Keep blueprint for compatibility with no routes.
test_ui_bp = Blueprint("test_ui", __name__)
@test_ui_bp.get("/test-ui")
def test_ui_page():
    html = """
<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <title>Able-D Backend Test UI</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <style>
      :root { color-scheme: light dark; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; line-height: 1.4; }
      .step { border: 1px solid #8884; border-radius: 8px; padding: 16px; margin: 18px 0; }
      .step h2 { margin: 0 0 8px 0; font-size: 18px; }
      .muted { opacity: .8; font-size: 13px; }
      label { display: block; margin-top: 8px; font-weight: 600; }
      input, select, button, textarea { margin: 6px 0; width: 100%; max-width: 640px; padding: 8px; }
      .row { display: flex; gap: 12px; flex-wrap: wrap; }
      .col { flex: 1; min-width: 220px; }
      pre { background: #0b1020; color: #aef19e; padding: 12px; overflow: auto; max-height: 360px; border-radius: 6px; }
      .ok { color: #0a0; font-weight: 700; }
      .bad { color: #a00; font-weight: 700; }
      .btnrow { display: flex; gap: 10px; }
      .pill { display:inline-block; font-size:12px; padding:2px 8px; border-radius:999px; border:1px solid #8884; }
      .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
      .small { font-size: 12px; }
      .sep { height: 1px; background: #8884; margin: 12px 0; }
      .hidden { display: none; }
    </style>
  </head>
  <body>
    <h1>Able-D Backend Test UI</h1>
    <p class=\"muted small\">Use this page to test endpoints without editing the frontend. Follow steps in order.</p>

    <div class=\"step\" id=\"step1\">
      <h2>Step 1 — Teacher Auth <span id=\"s1status\" class=\"pill\">pending</span></h2>
      <div class=\"grid\">
        <div>
          <label>Name</label>
          <input id=\"teacherName\" placeholder=\"Name\" />
        </div>
        <div>
          <label>School</label>
          <input id=\"teacherSchool\" placeholder=\"School\" />
        </div>
        <div>
          <label>Email</label>
          <input id=\"teacherEmail\" placeholder=\"Email\" />
        </div>
        <div>
          <label>Password</label>
          <input id=\"teacherPassword\" type=\"password\" placeholder=\"Password\" />
        </div>
      </div>
      <div class=\"btnrow\">
        <button id=\"btnRegister\" onclick=\"teacherRegister()\">Register</button>
        <button id=\"btnLogin\" onclick=\"teacherLogin()\">Login</button>
      </div>
      <div class=\"small muted\">After success, token is stored and next steps unlock.</div>
    </div>

    <div class=\"step\" id=\"step2\">
      <h2>Step 2 — Subjects <span id=\"s2status\" class=\"pill\">locked</span></h2>
      <label>Class</label>
      <input id=\"className\" placeholder=\"Class\" />
      <div class=\"btnrow\">
        <button id=\"btnSubjects\" onclick=\"listSubjects()\" disabled>GET /api/subjects</button>
      </div>
    </div>

    <div class=\"step\" id=\"step3\">
      <h2>Step 3 — Extract Text <span id=\"s3status\" class=\"pill\">optional</span></h2>
      <input id=\"docFile\" type=\"file\" />
      <div class=\"btnrow\"><button onclick=\"extractText()\">POST /api/extract-text</button></div>
      <div class=\"small muted\">Optional sanity check for document extraction.</div>
    </div>

    <div class=\"step\" id=\"step4\">
      <h2>Step 4 — STT <span id=\"s4status\" class=\"pill\">optional</span></h2>
      <div class=\"grid\">
        <div><label>Audio File</label><input id=\"audioFile\" type=\"file\" /></div>
        <div><label>Language</label><input id=\"audioLang\" placeholder=\"en-US\" /></div>
      </div>
      <div class=\"btnrow\"><button onclick=\"stt()\">POST /api/stt</button></div>
      <div class=\"small muted\">Optional sanity check for STT.</div>
    </div>

    <div class=\"step\" id=\"step5\">
      <h2>Step 5 — Teacher Upload <span id=\"s5status\" class=\"pill\">locked</span></h2>
      <div class=\"grid\">
        <div><label>School (optional)</label><input id=\"uSchool\" placeholder=\"School (optional)\" /></div>
        <div><label>Class</label><input id=\"uClass\" placeholder=\"Class\" /></div>
        <div><label>Subject</label><input id=\"uSubject\" placeholder=\"Subject\" /></div>
        <div><label>Topic</label><input id=\"uTopic\" placeholder=\"Topic\" /></div>
      </div>
      <div class=\"row\"> 
        <div class=\"col\"> 
          <label>Document</label>
          <input id=\"uDoc\" type=\"file\" />
        </div>
        <div class=\"col\"> 
          <label>Audio</label>
          <input id=\"uAudio\" type=\"file\" />
          <label>Language</label>
          <input id=\"uLang\" placeholder=\"en-US\" />
        </div>
      </div>
      <div class=\"btnrow\"><button id=\"btnUpload\" onclick=\"teacherUpload()\" disabled>POST /api/teacher/upload</button></div>
      <div class=\"small muted\">Attach either a document or an audio file (not both).</div>
    </div>

    <div class=\"step\">
      <h2>JWT</h2>
      <textarea id=\"token\" placeholder=\"Paste token or filled automatically\"></textarea>
      <div class=\"sep\"></div>
      <div class=\"small muted\">Token is required for steps 2 and 5.</div>
    </div>

    <h3>Response</h3>
    <pre id=\"out\"></pre>

    <script>
      let hasToken = false;

      function setOut(obj) {
        document.getElementById('out').textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
      }

      function unlockStepsAfterAuth(token){
        hasToken = !!token;
        const s1 = document.getElementById('s1status');
        const s2 = document.getElementById('s2status');
        const s5 = document.getElementById('s5status');
        const btnSubjects = document.getElementById('btnSubjects');
        const btnUpload = document.getElementById('btnUpload');
        if (hasToken) {
          s1.textContent = 'ok'; s1.classList.add('ok');
          s2.textContent = 'ready'; s2.classList.remove('bad');
          s5.textContent = 'ready'; s5.classList.remove('bad');
          btnSubjects.disabled = false;
          btnUpload.disabled = false;
        } else {
          s2.textContent = 'locked'; s2.classList.add('bad');
          s5.textContent = 'locked'; s5.classList.add('bad');
          btnSubjects.disabled = true;
          btnUpload.disabled = true;
        }
      }

      async function teacherRegister(){
        const body = {
          name: document.getElementById('teacherName').value || 'T',
          school: document.getElementById('teacherSchool').value || undefined,
          email: document.getElementById('teacherEmail').value,
          password: document.getElementById('teacherPassword').value
        };
        const r = await fetch('/api/auth/teacher/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
        const j = await r.json(); setOut(j);
        if (j.accessToken) { document.getElementById('token').value = j.accessToken; unlockStepsAfterAuth(j.accessToken); }
      }

      async function teacherLogin(){
        const body = { email: document.getElementById('teacherEmail').value, password: document.getElementById('teacherPassword').value };
        const r = await fetch('/api/auth/teacher/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
        const j = await r.json(); setOut(j);
        if (j.accessToken) { document.getElementById('token').value = j.accessToken; unlockStepsAfterAuth(j.accessToken); }
      }

      async function listSubjects(){
        const token = document.getElementById('token').value;
        const cls = document.getElementById('className').value;
        const r = await fetch('/api/subjects?class=' + encodeURIComponent(cls), { headers: { Authorization: 'Bearer ' + token }});
        setOut(await r.json());
      }

      async function extractText(){
        const f = document.getElementById('docFile').files[0];
        const fd = new FormData(); fd.append('file', f);
        const r = await fetch('/api/extract-text', { method: 'POST', body: fd });
        setOut(await r.json());
      }

      async function stt(){
        const f = document.getElementById('audioFile').files[0];
        const lang = document.getElementById('audioLang').value || 'en-US';
        const fd = new FormData(); fd.append('audio', f); fd.append('language', lang);
        const r = await fetch('/api/stt', { method: 'POST', body: fd });
        setOut(await r.json());
      }

      async function teacherUpload(){
        const token = document.getElementById('token').value;
        if (!token){ setOut({error:'Missing token: complete Step 1 first'}); return; }
        const fd = new FormData();
        const school = document.getElementById('uSchool').value;
        const cls = document.getElementById('uClass').value;
        const subject = document.getElementById('uSubject').value;
        const topic = document.getElementById('uTopic').value;
        const doc = document.getElementById('uDoc').files[0];
        const aud = document.getElementById('uAudio').files[0];
        const lang = document.getElementById('uLang').value;
        if (!cls || !subject || !topic){ setOut({error:'class, subject, topic are required'}); return; }
        if (!doc && !aud){ setOut({error:'attach a document or an audio file'}); return; }
        if (doc && aud){ setOut({error:'attach only one: document OR audio'}); return; }
        if (school) fd.append('school', school);
        fd.append('class', cls); fd.append('subject', subject); fd.append('topic', topic);
        if (doc) fd.append('file', doc);
        if (aud) { fd.append('audio', aud); if (lang) fd.append('language', lang); }
        const r = await fetch('/api/teacher/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
        setOut(await r.json());
      }

      // Initialize lock state on load
      unlockStepsAfterAuth(null);
    </script>
  </body>
</html>
"""
    return Response(html, mimetype="text/html")

