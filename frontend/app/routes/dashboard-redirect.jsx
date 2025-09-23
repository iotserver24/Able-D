import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function meta() {
  return [
    { title: "Redirecting to Dashboard - Able-D" },
    { name: "description", content: "Redirecting to appropriate dashboard" },
  ];
}

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      // Not logged in, redirect to home
      navigate('/');
      return;
    }

    // Redirect based on user role
    if (user?.role === 'student') {
      navigate('/student/dashboard');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      // Unknown role, redirect to home
      navigate('/');
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Dashboard</h2>
        <p className="text-gray-600">Please wait while we redirect you...</p>
      </div>
    </div>
  );
}
