// app/teacher/dashboard/UploadContent.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import teacherService from "../../services/teacher.service";
import authService from "../../services/auth.service";

// Inlined CSS with the text-align fix
const inlinedStyles = `
  /* --- Original Button & Element Styles --- */
  @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
  @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
  :root { --anim--hover-time: 400ms; --anim--hover-ease: cubic-bezier(0.25, 1, 0.5, 1); }
  .button-wrap { position: relative; z-index: 2; border-radius: 999vw; background: transparent; pointer-events: none; transition: all var(--anim--hover-time) var(--anim--hover-ease); }
  .button-shadow { --shadow-cuttoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cuttoff-fix)); height: calc(100% + var(--shadow-cuttoff-fix)); top: calc(0% - var(--shadow-cuttoff-fix) / 2); left: calc(0% - var(--shadow-cuttoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); -webkit-filter: blur(clamp(2px, 0.125em, 12px)); overflow: visible; pointer-events: none; }
  .button-shadow::after { content: ""; position: absolute; z-index: 0; inset: 0; border-radius: 999vw; background: linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1)); width: calc(100% - var(--shadow-cuttoff-fix) - 0.25em); height: calc(100% - var(--shadow-cuttoff-fix) - 0.25em); top: calc(var(--shadow-cuttoff-fix) - 0.5em); left: calc(var(--shadow-cuttoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim--hover-time) var(--anim--hover-ease); overflow: visible; opacity: 1; }
  .button-wrap button { --border-width: clamp(1px, 0.0625em, 4px); all: unset; cursor: pointer; position: relative; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); pointer-events: auto; z-index: 3; background: linear-gradient(-75deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05)); border-radius: 999vw; box-shadow: inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05), inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5), 0 0.25em 0.125em -0.125em rgba(0, 0, 0, 0.2), 0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2), 0 0 0 0 rgba(255, 255, 255, 1); backdrop-filter: blur(clamp(1px, 0.125em, 4px)); -webkit-backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim--hover-time) var(--anim--hover-ease); width: 100%; background-color: rgba(236, 232, 241, 0.4); }
  .dark .button-wrap button { background-color: transparent; }
  .button-wrap button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); -webkit-backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05), inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5), 0 0.15em 0.05em -0.1em rgba(0, 0, 0, 0.25), 0 0 0.05em 0.1em inset rgba(255, 255, 255, 0.5), 0 0 0 0 rgba(255, 255, 255, 1); }
  .button-wrap button span { text-align: center; /* THIS IS THE FIX */ position: relative; display: block; user-select: none; -webkit-user-select: none; font-family: inherit; letter-spacing: -0.05em; font-weight: 600; font-size: 1em; color: rgba(50, 50, 50, 1); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-shadow: 0em 0.25em 0.05em rgba(0, 0, 0, 0.1); transition: all var(--anim--hover-time) var(--anim--hover-ease); padding-inline: 1.5em; padding-block: 0.875em; }
  .dark .button-wrap button span { color: rgba(230, 230, 240, 1); text-shadow: 0em 0.25em 0.05em rgba(0, 0, 0, 0.4); }
  .button-wrap button:hover span { text-shadow: 0.025em 0.025em 0.025em rgba(0, 0, 0, 0.12); }
  .button-wrap button span::after { content: ""; display: block; position: absolute; z-index: 1; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 999vw; overflow: clip; background: linear-gradient(var(--angle-2), rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 40% 50%, rgba(255, 255, 255, 0) 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; background-repeat: no-repeat; transition: background-position calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease), --angle-2 calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease); }
  .button-wrap button:hover span::after { background-position: 25% 50%; }
  .button-wrap button:active span::after { background-position: 50% 15%; --angle-2: -15deg; }
  @media (hover: none) and (pointer: coarse) { .button-wrap button span::after, .button-wrap button:active span::after { --angle-2: -45deg; } }
  .button-wrap button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 999vw; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 5% 40%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 60% 95%, rgba(0, 0, 0, 0.5)), linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim--hover-time) var(--anim--hover-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255, 255, 255, 0.5); }
  .button-wrap button:hover::after { --angle-1: -125deg; }
  .button-wrap button:active::after { --angle-1: -75deg; }
  @media (hover: none) and (pointer: coarse) { .button-wrap button::after, .button-wrap button:hover::after, .button-wrap button:active::after { --angle-1: -75deg; } }
  .button-wrap:has(button:hover) .button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); -webkit-filter: blur(clamp(2px, 0.0625em, 6px)); transition: filter var(--anim--hover-time) var(--anim--hover-ease); }
  .button-wrap:has(button:hover) .button-shadow::after { top: calc(var(--shadow-cuttoff-fix) - 0.875em); opacity: 1; }
  .button-wrap:has(button:active) { transform: rotate3d(1, 0, 0, 25deg); }
  .button-wrap:has(button:active) button { box-shadow: inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05), inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5), 0 0.125em 0.125em -0.125em rgba(0, 0, 0, 0.2), 0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2), 0 0.225em 0.05em 0 rgba(0, 0, 0, 0.05), 0 0.25em 0 0 rgba(255, 255, 255, 0.75), inset 0 0.25em 0.05em 0 rgba(0, 0, 0, 0.15); }
  .button-wrap:has(button:active) .button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); -webkit-filter: blur(clamp(2px, 0.125em, 12px)); }
  .button-wrap:has(button:active) .button-shadow::after { top: calc(var(--shadow-cuttoff-fix) - 0.5em); opacity: 0.75; }
  .button-wrap:has(button:active) span { text-shadow: 0.025em 0.25em 0.05em rgba(0, 0, 0, 0.12); }
  select.glassmorphic-dropdown option { background-color: rgba(240, 235, 255, 0.9); color: #333; padding: 0.5rem 1rem; }
  .dark select.glassmorphic-dropdown option { background-color: rgba(40, 30, 60, 0.9); color: #e0e0e0; }
`;

export default function UploadContent({ darkMode }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([{ value: "", label: "Select Subject" }]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const fileInputRef = useRef(null);

  const classOptions = useMemo(
    () => [
      { value: "", label: "Select Class" }, 
      { value: "6", label: "Class 6" }, 
      { value: "7", label: "Class 7" }, 
      { value: "8", label: "Class 8" }, 
      { value: "9", label: "Class 9" }, 
      { value: "10", label: "Class 10" }, 
      { value: "11", label: "Class 11" }, 
      { value: "12", label: "Class 12" },
    ],
    []
  );

  const allowedExtensions = useMemo(
    () => new Set([".doc", ".docx", ".ppt", ".pptx", ".pdf", ".mp3", ".wav", ".m4a"]),
    []
  );

  // Fetch subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    } else {
      setSubjectOptions([{ value: "", label: "Select Subject" }]);
      setSelectedSubject("");
    }
  }, [selectedClass]);

  const fetchSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const school = authService.getCurrentSchool() || 'DemoSchool';
      const result = await teacherService.getSubjects(school, selectedClass);
      
      if (result.success && result.data.length > 0) {
        const options = [
          { value: "", label: "Select Subject" },
          ...result.data
        ];
        setSubjectOptions(options);
      } else {
        // Fallback to default subjects if API fails or returns empty
        setSubjectOptions([
          { value: "", label: "Select Subject" },
          { value: "math", label: "Mathematics" },
          { value: "science", label: "Science" },
          { value: "english", label: "English" },
          { value: "social", label: "Social Studies" },
          { value: "hindi", label: "Hindi" },
          { value: "other", label: "Other" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to default subjects
      setSubjectOptions([
        { value: "", label: "Select Subject" },
        { value: "math", label: "Mathematics" },
        { value: "science", label: "Science" },
        { value: "english", label: "English" },
        { value: "social", label: "Social Studies" },
        { value: "hindi", label: "Hindi" },
        { value: "other", label: "Other" },
      ]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  function getFileExtension(name) {
    const lastDot = name.lastIndexOf(".");
    return lastDot === -1 ? "" : name.slice(lastDot).toLowerCase();
  }

  function validateBeforeSubmit() {
    if (!selectedClass) return "Please select a class.";
    if (!selectedSubject) return "Please select a subject.";
    if (!selectedTopic) return "Please enter a topic.";
    if (!selectedFile) return "Please choose a file to upload.";
    const ext = getFileExtension(selectedFile.name);
    if (!allowedExtensions.has(ext))
      return "Invalid file type. Allowed: .doc, .docx, .ppt, .pptx, .pdf, .mp3, .wav, .m4a";
    return "";
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setErrorMessage("");
    setAudioUrl("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const ext = getFileExtension(file.name);
    if (!allowedExtensions.has(ext)) {
      setSelectedFile(null);
      setErrorMessage(
        "Invalid file type. Allowed: .doc, .docx, .ppt, .pptx, .pdf"
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const ext = getFileExtension(file.name);
      if (allowedExtensions.has(ext)) {
        setSelectedFile(file);
        setErrorMessage("");
        setAudioUrl("");
      } else {
        setErrorMessage("Invalid file type. Allowed: .doc, .docx, .ppt, .pptx, .pdf");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setAudioUrl("");
    
    const validation = validateBeforeSubmit();
    if (validation) {
      setErrorMessage(validation);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get school from auth service
      const school = authService.getCurrentSchool() || 'DemoSchool';
      
      // Call the real upload API
      const result = await teacherService.uploadFile(
        selectedFile,
        school,
        selectedClass,
        selectedSubject,
        selectedTopic
      );
      
      if (result.success) {
        setSuccessMessage("File uploaded successfully! Processing audio...");
        
        // If the backend returns an audio URL, use it
        if (result.data && result.data.audioUrl) {
          setAudioUrl(result.data.audioUrl);
        } else {
          // Mock audio for now if backend doesn't return audio yet
          const mockBlob = new Blob([], { type: 'audio/mpeg' });
          setAudioUrl(URL.createObjectURL(mockBlob));
        }
        
        // Clear form after successful upload
        setTimeout(() => {
          handleReset();
          setSuccessMessage("Upload complete! You can upload another file.");
        }, 3000);
      } else {
        setErrorMessage(result.error || "Failed to upload file. Please try again.");
      }
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");

  function handleReset() {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedFile(null);
    setErrorMessage("");
    setAudioUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedTopic("");
    setSelectedFile(null);
    setErrorMessage("");
    setSuccessMessage("");
    setAudioUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleReset() {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedFile(null);
    setErrorMessage("");
    setAudioUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <style>{inlinedStyles}</style>
      <div className={`w-full max-w-4xl backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden ${
        darkMode
          ? "bg-gray-900/30 border-gray-700/50"
          : "bg-white/30 border-gray-200/50"
      }`}>
        <div className={`relative p-8 ${
          darkMode
            ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20"
            : "bg-gradient-to-r from-purple-500/10 to-indigo-500/10"
        } border-b border-gray-200/20`}>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              darkMode
                ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                : "bg-gradient-to-r from-purple-500 to-indigo-500"
            }`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Document Upload
              </h2>
              <p className={`text-lg mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Transform educational materials into audio lessons
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className={`block text-sm font-semibold mb-3 transition-colors ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}>
                  Class Level
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className={`glassmorphic-dropdown appearance-none w-full pl-6 pr-12 py-4 rounded-full border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-purple-400"
                        : "bg-white/70 border-gray-300 text-gray-900 focus:border-purple-400"
                    } backdrop-blur-sm`}
                    required
                  >
                    {classOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                    <svg className={`w-3.5 h-3.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className={`block text-sm font-semibold mb-3 transition-colors ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}>
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className={`glassmorphic-dropdown appearance-none w-full pl-6 pr-12 py-4 rounded-full border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-purple-400"
                        : "bg-white/70 border-gray-300 text-gray-900 focus:border-purple-400"
                    } backdrop-blur-sm`}
                    required
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                    <svg className={`w-3.5 h-3.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <label className={`block text-sm font-semibold mb-3 transition-colors ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>
                Topic
              </label>
              <input
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="Enter the topic (e.g., Photosynthesis, World War II)"
                className={`w-full pl-6 pr-6 py-4 rounded-full border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    : "bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-400"
                } backdrop-blur-sm`}
                required
              />
            </div>

            <div className="group">
              <label className={`block text-sm font-semibold mb-3 transition-colors ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                Document Upload
              </label>
              <input ref={fileInputRef} type="file" accept=".doc,.docx,.ppt,.pptx,.pdf" onChange={handleFileChange} className="hidden" />
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer transition-all duration-300 rounded-3xl border-2 border-dashed ${isDragging ? "scale-105 border-purple-400 bg-purple-500/20" : darkMode ? "border-gray-600 hover:border-purple-400 hover:bg-purple-500/10" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"} ${darkMode ? "bg-gray-800/30" : "bg-white/50"} backdrop-blur-sm`}>
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-purple-100 dark:bg-purple-500/30 scale-110" : darkMode ? "bg-purple-500/20 group-hover:bg-purple-500/30" : "bg-purple-100 group-hover:bg-purple-200"}`}>
                    <svg className={`w-8 h-8 transition-colors ${isDragging ? "text-purple-600" : darkMode ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{isDragging ? "Drop your file here" : "Upload Document"}</h3>
                  <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{isDragging ? "Release to upload" : "Click to browse or drag and drop"}</p>
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium ${darkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    DOC, DOCX, PPT, PPTX, PDF (MAX 10MB)
                  </div>
                </div>
              </div>
            </div>

            {selectedFile && (
                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/50 transition-all duration-300 ease-in-out transform opacity-100 translate-y-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">{selectedFile.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              )}

            {errorMessage && (
              <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700/50 transition-all duration-300 ease-in-out transform opacity-100 translate-y-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{errorMessage}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <div className="button-wrap w-full sm:w-auto">
                <div className="button-shadow"></div>
                <button type="submit" disabled={isSubmitting}>
                  <span>
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        Generate Audio Lesson
                      </div>
                    )}
                  </span>
                </button>
              </div>

              <div className="button-wrap w-full sm:w-auto">
                <div className="button-shadow"></div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  <span>Clear Form</span>
                </button>
              </div>
            </div>
          </form>

          {audioUrl && (
            <div className={`mt-8 p-6 rounded-2xl border backdrop-blur-sm ${darkMode ? "bg-gray-800/30 border-gray-700/50" : "bg-white/30 border-gray-200/50"}`}>
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${darkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                  <svg className={`w-6 h-6 ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Audio Lesson Preview</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Your document has been converted</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-900/50" : "bg-white/50"} backdrop-blur-sm`}>
                <audio controls src={audioUrl} className="w-full h-12 rounded-lg"/>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}