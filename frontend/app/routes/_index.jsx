import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoginModal } from "../components/auth/LoginModal";
import { StudentRegistrationModal } from "../components/auth/StudentRegistrationModal";
import { TeacherRegistrationModal } from "../components/auth/TeacherRegistrationModal";
import { StudentLoginModal } from "../components/auth/StudentLoginModal";
import { TeacherLoginModal } from "../components/auth/TeacherLoginModal";

export function meta() {
  return [
    { title: "Adaptive Learning Platform - Home" },
    { name: "description", content: "Accessible education platform for all students and teachers" },
  ];
}

export default function Index() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [userType, setUserType] = useState(null);

  const handleOpenLogin = () => {
    // console.log('Login button clicked');
    setShowLoginModal(true);
    setCurrentModal('choose-type');
    // console.log('Modal state:', { showLoginModal: true, currentModal: 'choose-type' });
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentModal('login-or-register');
  };

  const handleLoginChoice = () => {
    if (userType === 'student') {
      setCurrentModal('student-login');
    } else {
      setCurrentModal('teacher-login');
    }
  };

  const handleRegisterChoice = () => {
    if (userType === 'student') {
      setCurrentModal('student-register');
    } else {
      setCurrentModal('teacher-register');
    }
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setCurrentModal(null);
    setUserType(null);
  };

  const handleLoginSuccess = (userData) => {
    handleCloseModal();
    // Navigate based on user type
    if (userData.role === 'student') {
      navigate('/student/dashboard');
    } else if (userData.role === 'teacher') {
      navigate('/teacher/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="inline-flex p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Adaptive Learning Platform
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Personalized education for every student's unique needs
          </p>

          {/* Login Button */}
          <button
            onClick={() => {
              handleOpenLogin();
            }}
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg transform transition hover:scale-105"
          >
            Login / Register
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center hover:shadow-xl transition-shadow">
            <div className="mb-4 text-blue-600">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Adaptive Learning</h3>
            <p className="text-gray-600">Customized content based on individual learning needs and abilities</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-xl transition-shadow">
            <div className="mb-4 text-purple-600">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Accessibility First</h3>
            <p className="text-gray-600">Built-in support for visual, hearing, speech, and learning impairments</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-xl transition-shadow">
            <div className="mb-4 text-green-600">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">For Everyone</h3>
            <p className="text-gray-600">Supporting both students and teachers in the learning journey</p>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <>
          <LoginModal
            currentModal={currentModal}
            userType={userType}
            onUserTypeSelect={handleUserTypeSelect}
            onLoginChoice={handleLoginChoice}
            onRegisterChoice={handleRegisterChoice}
            onClose={handleCloseModal}
            onLoginSuccess={handleLoginSuccess}
          />

          {/* Student Registration Modal */}
          {currentModal === 'student-register' && (
            <StudentRegistrationModal
              onClose={handleCloseModal}
              onSuccess={handleLoginSuccess}
              onSwitchToLogin={() => setCurrentModal('student-login')}
            />
          )}

          {/* Teacher Registration Modal */}
          {currentModal === 'teacher-register' && (
            <TeacherRegistrationModal
              onClose={handleCloseModal}
              onSuccess={handleLoginSuccess}
              onSwitchToLogin={() => setCurrentModal('teacher-login')}
            />
          )}

          {/* Student Login Modal */}
          {currentModal === 'student-login' && (
            <StudentLoginModal
              onClose={handleCloseModal}
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentModal('student-register')}
            />
          )}

          {/* Teacher Login Modal */}
          {currentModal === 'teacher-login' && (
            <TeacherLoginModal
              onClose={handleCloseModal}
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentModal('teacher-register')}
            />
          )}
        </>
      )}
    </div>
  );
}
