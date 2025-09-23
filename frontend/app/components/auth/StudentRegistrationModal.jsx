import { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { STUDENT_TYPES } from "../../constants/studentTypes";
import { useAuth } from "../../contexts/AuthContext";
import { TTSProvider } from "../../contexts/TTSContext";
import { TTSWelcomePopup } from "../tts/TTSWelcomePopup";
import { TTSController } from "../tts/TTSController";

export function StudentRegistrationModal({ onClose, onSuccess, onSwitchToLogin }) {
  const { registerStudent } = useAuth();
  const [step, setStep] = useState(1); // 1: Select Type, 2: Fill Details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTTSWelcome, setShowTTSWelcome] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  
  const [formData, setFormData] = useState({
    studentType: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    class: "",
    subject: "",
    school: "",
  });

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, studentType: type });
    setStep(2);
    
    // Show TTS welcome for visually impaired students
    if (type === 'visually_impaired') {
      setShowTTSWelcome(true);
    }
  };

  const handleTTSWelcomeClose = (enabled) => {
    setShowTTSWelcome(false);
    setTtsEnabled(enabled);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.class || !formData.subject || !formData.school) {
      setError("Please fill in all required fields");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Prepare registration data matching backend API requirements
      const registrationData = {
        studentType: formData.studentType,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        class: formData.class,
        subject: formData.subject,
        school: formData.school
      };
      
      // Register the student using the context function
      const response = await registerStudent(registrationData);
      
      if (response.success) {
        // Registration successful, user is already logged in by the context
        // Pass user data with role for navigation
        const userData = {
          ...response.user,
          role: 'student',
          studentType: formData.studentType
        };
        onSuccess(userData);
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const studentTypeInfo = formData.studentType ? 
    Object.values(STUDENT_TYPES).find(type => type.value === formData.studentType) : null;

  return (
    <TTSProvider enabled={ttsEnabled} autoStart={formData.studentType === 'visually_impaired'}>
      {/* TTS Welcome Popup for Visually Impaired Students */}
      {showTTSWelcome && (
        <TTSWelcomePopup onClose={handleTTSWelcomeClose} />
      )}

      {/* TTS Controller */}
      {ttsEnabled && <TTSController position="bottom-right" />}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto py-8">
        <Card className="w-full max-w-md mx-4 p-8 relative my-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Registration</h2>
            <p className="text-gray-600">
              {step === 1 ? "Select your learning profile" : "Complete your registration"}
            </p>
          </div>

          {/* Step 1: Select Student Type */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose the option that best describes your learning needs:
              </p>
              
              {Object.values(STUDENT_TYPES).map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 bg-${type.primaryColor}-100 rounded-lg`}>
                      <span className="text-2xl">
                        {type.value === 'visually_impaired' && '👁️'}
                        {type.value === 'hearing_impaired' && '👂'}
                        {type.value === 'speech_impaired' && '🗣️'}
                        {type.value === 'slow_learner' && '📚'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{type.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {type.features.map((feature, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Fill Registration Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {studentTypeInfo && (
                <div className={`p-3 bg-${studentTypeInfo.primaryColor}-50 rounded-lg mb-4`}>
                  <p className="text-sm font-medium text-gray-700">
                    Selected Profile: <span className="font-bold">{studentTypeInfo.label}</span>
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade/Class *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your class</option>
                    <option value="1">1st Standard</option>
                    <option value="2">2nd Standard</option>
                    <option value="3">3rd Standard</option>
                    <option value="4">4th Standard</option>
                    <option value="5">5th Standard</option>
                    <option value="6">6th Standard</option>
                    <option value="7">7th Standard</option>
                    <option value="8">8th Standard</option>
                    <option value="9">9th Standard</option>
                    <option value="10">10th Standard</option>
                    <option value="11">11th Standard</option>
                    <option value="12">12th Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, Science, English"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School *
                  </label>
                  <select
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your school</option>
                    <option value="NMAMIT">NMAMIT</option>
                    <option value="ksmit">ksmit</option>
                    <option value="abcmit">abcmit</option>
                  </select>
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to profile selection
                </button>

                <div className="space-x-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          )}
        </Card>
      </div>
    </TTSProvider>
  );
}
