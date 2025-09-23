import React, { useState, useRef } from "react";
import teacherService from "../../services/teacher.service";
import { useAuth } from "../../contexts/AuthContext";

export default function UploadContentNew({ darkMode }) {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [uploadType, setUploadType] = useState("document"); // "document" or "audio"
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const classOptions = [
    { value: "", label: "Select Class" },
    { value: "6", label: "Class 6" },
    { value: "7", label: "Class 7" },
    { value: "8", label: "Class 8" },
    { value: "9", label: "Class 9" },
    { value: "10", label: "Class 10" },
    { value: "11", label: "Class 11" },
    { value: "12", label: "Class 12" },
  ];

  const subjectOptions = [
    { value: "", label: "Select Subject" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "English", label: "English" },
    { value: "Social Studies", label: "Social Studies" },
    { value: "Hindi", label: "Hindi" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Biology", label: "Biology" },
    { value: "History", label: "History" },
    { value: "Geography", label: "Geography" },
    { value: "Computer Science", label: "Computer Science" },
  ];

  const allowedDocExtensions = [".doc", ".docx", ".ppt", ".pptx", ".pdf"];
  const allowedAudioExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".flac"];

  function getFileExtension(name) {
    const lastDot = name.lastIndexOf(".");
    return lastDot === -1 ? "" : name.slice(lastDot).toLowerCase();
  }

  function validateBeforeSubmit() {
    if (!selectedClass) return "Please select a class.";
    if (!selectedSubject) return "Please select a subject.";
    if (!topic.trim()) return "Please enter a topic name.";
    
    if (uploadType === "document") {
      if (!selectedFile) return "Please choose a document to upload.";
      const ext = getFileExtension(selectedFile.name);
      if (!allowedDocExtensions.includes(ext)) {
        return `Invalid file type. Allowed: ${allowedDocExtensions.join(", ")}`;
      }
    } else {
      if (!selectedAudio) return "Please choose an audio file to upload.";
      const ext = getFileExtension(selectedAudio.name);
      if (!allowedAudioExtensions.includes(ext)) {
        return `Invalid audio type. Allowed: ${allowedAudioExtensions.join(", ")}`;
      }
    }
    
    return "";
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setErrorMessage("");
    setSuccessMessage("");
    setAudioUrl("");
    
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    const ext = getFileExtension(file.name);
    if (!allowedDocExtensions.includes(ext)) {
      setSelectedFile(null);
      setErrorMessage(`Invalid file type. Allowed: ${allowedDocExtensions.join(", ")}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    setSelectedFile(file);
    setSelectedAudio(null); // Clear audio if document is selected
  }

  function handleAudioChange(e) {
    const file = e.target.files && e.target.files[0];
    setErrorMessage("");
    setSuccessMessage("");
    setAudioUrl("");
    
    if (!file) {
      setSelectedAudio(null);
      return;
    }
    
    const ext = getFileExtension(file.name);
    if (!allowedAudioExtensions.includes(ext)) {
      setSelectedAudio(null);
      setErrorMessage(`Invalid audio type. Allowed: ${allowedAudioExtensions.join(", ")}`);
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }
    
    setSelectedAudio(file);
    setSelectedFile(null); // Clear document if audio is selected
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
      
      if (uploadType === "document" && allowedDocExtensions.includes(ext)) {
        setSelectedFile(file);
        setSelectedAudio(null);
        setErrorMessage("");
        setSuccessMessage("");
      } else if (uploadType === "audio" && allowedAudioExtensions.includes(ext)) {
        setSelectedAudio(file);
        setSelectedFile(null);
        setErrorMessage("");
        setSuccessMessage("");
      } else {
        const allowed = uploadType === "document" ? allowedDocExtensions : allowedAudioExtensions;
        setErrorMessage(`Invalid file type. Allowed: ${allowed.join(", ")}`);
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
      
      // Prepare upload data
      const uploadData = {
        school: user?.school || "Default School",
        className: selectedClass,
        subject: selectedSubject,
        topic: topic.trim(),
      };
      
      if (uploadType === "document") {
        uploadData.file = selectedFile;
      } else {
        uploadData.audio = selectedAudio;
        uploadData.language = "en-US"; // Default language
      }
      
      // Call the teacher service to upload
      const result = await teacherService.uploadContent(uploadData);
      
      if (result.success) {
        setSuccessMessage("Content uploaded successfully!");
        
        // If it was a document, try to generate audio
        if (uploadType === "document" && result.data?.note?.text) {
          const audioResult = await teacherService.generateAudioFromText(result.data.note.text);
          if (audioResult.success) {
            setAudioUrl(audioResult.audioUrl);
          }
        }
        
        // Reset form after successful upload
        setTimeout(() => {
          handleReset();
        }, 3000);
      } else {
        setErrorMessage(result.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Something went wrong during upload.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSelectedClass("");
    setSelectedSubject("");
    setTopic("");
    setSelectedFile(null);
    setSelectedAudio(null);
    setErrorMessage("");
    setSuccessMessage("");
    setAudioUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  }

  return (
    <div className={`w-full max-w-4xl backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden ${
      darkMode
        ? "bg-gray-900/30 border-gray-700/50"
        : "bg-white/30 border-gray-200/50"
    }`}>
      {/* Header */}
      <div className={`relative p-8 ${
        darkMode
          ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20"
          : "bg-gradient-to-r from-purple-500/10 to-indigo-500/10"
      } border-b border-gray-200/20`}>
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Content Upload
            </h2>
            <p className={`text-lg mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Upload educational materials for your students
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Upload Type Selection */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setUploadType("document")}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                uploadType === "document"
                  ? "bg-purple-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📄 Document Upload
            </button>
            <button
              type="button"
              onClick={() => setUploadType("audio")}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                uploadType === "audio"
                  ? "bg-purple-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🎤 Audio Upload
            </button>
          </div>

          {/* Class and Subject Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>
                Class Level *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              >
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              >
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}>
              Topic/Lesson Name *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic or lesson name"
              className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              required
            />
          </div>

          {/* File Upload Area */}
          {uploadType === "document" ? (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>
                Document Upload
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.ppt,.pptx,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer transition-all duration-300 rounded-2xl border-2 border-dashed p-8 text-center ${
                  isDragging
                    ? "scale-105 border-purple-400 bg-purple-500/20"
                    : darkMode
                    ? "border-gray-600 hover:border-purple-400 bg-gray-800/30 hover:bg-purple-500/10"
                    : "border-gray-300 hover:border-purple-400 bg-white/50 hover:bg-purple-50/50"
                }`}
              >
                <svg className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className={`text-lg font-medium mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  {isDragging ? "Drop your document here" : "Click or drag to upload document"}
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Supported: DOC, DOCX, PPT, PPTX, PDF
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>
                Audio Upload
              </label>
              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.flac"
                onChange={handleAudioChange}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => audioInputRef.current?.click()}
                className={`relative cursor-pointer transition-all duration-300 rounded-2xl border-2 border-dashed p-8 text-center ${
                  isDragging
                    ? "scale-105 border-purple-400 bg-purple-500/20"
                    : darkMode
                    ? "border-gray-600 hover:border-purple-400 bg-gray-800/30 hover:bg-purple-500/10"
                    : "border-gray-300 hover:border-purple-400 bg-white/50 hover:bg-purple-50/50"
                }`}
              >
                <svg className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className={`text-lg font-medium mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  {isDragging ? "Drop your audio here" : "Click or drag to upload audio"}
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Supported: MP3, WAV, M4A, OGG, FLAC
                </p>
              </div>
            </div>
          )}

          {/* Selected File Display */}
          {(selectedFile || selectedAudio) && (
            <div className={`p-4 rounded-xl transition-all ${
              darkMode
                ? "bg-green-900/20 border border-green-700/50"
                : "bg-green-50 border border-green-200"
            }`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    darkMode ? "text-green-200" : "text-green-800"
                  }`}>
                    {(selectedFile || selectedAudio)?.name}
                  </p>
                  <p className={`text-xs ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}>
                    {((selectedFile || selectedAudio)?.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedAudio(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (audioInputRef.current) audioInputRef.current.value = "";
                  }}
                  className={`${
                    darkMode ? "text-green-400 hover:text-green-200" : "text-green-600 hover:text-green-800"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className={`p-4 rounded-xl transition-all ${
              darkMode
                ? "bg-red-900/20 border border-red-700/50"
                : "bg-red-50 border border-red-200"
            }`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm font-medium ${
                  darkMode ? "text-red-200" : "text-red-800"
                }`}>
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className={`p-4 rounded-xl transition-all ${
              darkMode
                ? "bg-green-900/20 border border-green-700/50"
                : "bg-green-50 border border-green-200"
            }`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm font-medium ${
                  darkMode ? "text-green-200" : "text-green-800"
                }`}>
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Content
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Audio Preview */}
        {audioUrl && (
          <div className={`mt-8 p-6 rounded-2xl border ${
            darkMode
              ? "bg-gray-800/30 border-gray-700/50"
              : "bg-white/30 border-gray-200/50"
          }`}>
            <div className="flex items-center mb-4">
              <svg className={`w-6 h-6 mr-3 ${
                darkMode ? "text-purple-400" : "text-purple-600"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <h3 className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Generated Audio
              </h3>
            </div>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
