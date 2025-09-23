import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { STUDENT_TYPES } from '../constants/studentTypes';

export function meta() {
  return [
    { title: "Student Authentication - Able-D" },
    { name: "description", content: "Student login and registration" },
  ];
}

export default function StudentAuth() {
  const navigate = useNavigate();
  const { loginStudent, registerStudent, isLoading, error, clearError } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    studentType: '',
    class: '',
    subject: '',
    school: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    clearError();
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isLoginMode && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Registration-specific validations
    if (!isLoginMode) {
      if (!formData.name) errors.name = 'Name is required';
      if (!formData.studentType) errors.studentType = 'Please select your accessibility needs';
      if (!formData.class) errors.class = 'Class is required';
      if (!formData.subject) errors.subject = 'Subject is required';
      if (!formData.school) errors.school = 'School name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let result;
    if (isLoginMode) {
      result = await loginStudent(formData.email, formData.password);
    } else {
      result = await registerStudent(formData);
    }
    
    if (result.success) {
      navigate('/student/dashboard');
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormErrors({});
    clearError();
    // Reset form but keep email if switching
    setFormData(prev => ({
      email: prev.email,
      password: '',
      name: '',
      studentType: '',
      class: '',
      subject: '',
      school: '',
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoginMode ? 'Student Login' : 'Student Registration'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLoginMode 
                ? 'Welcome back! Please login to continue.' 
                : 'Create your account to start learning.'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Fields */}
            {!isLoginMode && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Student Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accessibility Needs *
                  </label>
                  <select
                    name="studentType"
                    value={formData.studentType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.studentType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your needs</option>
                    {Object.values(STUDENT_TYPES).map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                  {formErrors.studentType && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.studentType}</p>
                  )}
                </div>

                {/* Class and Subject */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.class ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Class {i + 1}
                        </option>
                      ))}
                    </select>
                    {formErrors.class && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.class}</p>
                    )}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Mathematics"
                    />
                    {formErrors.subject && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.subject}</p>
                    )}
                  </div>
                </div>

                {/* School */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.school ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your school name"
                  />
                  {formErrors.school && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.school}</p>
                  )}
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="student@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={isLoginMode ? 'Enter your password' : 'Minimum 6 characters'}
              />
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading 
                ? 'Processing...' 
                : (isLoginMode ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLoginMode ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
