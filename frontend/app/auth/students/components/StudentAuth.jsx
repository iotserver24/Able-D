import { useStudentAuth } from "../../../hooks/useStudentAuth";
import { StudentTypeSelector } from "./StudentTypeSelector";
import { AuthStatus } from "./AuthStatus";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoginIcon, AccessibilityIcon } from "../../../components/icons/Icons";

export function StudentAuth() {
  const {
    studentType,
    setStudentType,
    handleLogin,
    isAuthenticated,
    isLoading,
    error,
    setError
  } = useStudentAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <AuthStatus message="Signing you in..." type="loading" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        {/* Mobile-optimized header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <AccessibilityIcon className="text-blue-600" size="w-12 h-12 md:w-16 md:h-16" />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome to Adaptive Learning
          </h1>
          <p className="text-sm md:text-base text-gray-600 px-4">
            Select your accessibility needs for a personalized experience
          </p>
          
          {/* Development Mode Notice - Mobile optimized */}
          <div className="mt-4 p-2 md:p-3 bg-yellow-50 border border-yellow-200 rounded-lg mx-2 md:mx-0">
            <p className="text-xs md:text-sm text-yellow-800 flex items-center justify-center gap-2">
              <span className="text-base">🔧</span>
              <span>Development Mode: Mock Authentication</span>
            </p>
          </div>
        </div>

        {/* Student Type Selector */}
        <div className="px-2 md:px-0">
          <StudentTypeSelector
            value={studentType}
            onChange={(value) => {
              setStudentType(value);
              setError(null);
            }}
            error={error}
          />
        </div>

        {/* Action buttons - Mobile optimized */}
        <div className="mt-6 md:mt-8 space-y-3 md:space-y-4 px-2 md:px-0">
          <Button
            onClick={handleLogin}
            disabled={!studentType || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base"
          >
            <LoginIcon size="w-5 h-5" />
            <span>{isLoading ? 'Signing in...' : 'Continue to Dashboard'}</span>
          </Button>
          
          <p className="text-center text-xs md:text-sm text-gray-500 px-4">
            By signing in, you agree to our accessibility-focused learning environment
          </p>
        </div>

        {/* Mobile-friendly footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 md:hidden">
          <p className="text-xs text-center text-gray-400">
            Optimized for all devices
          </p>
        </div>
      </Card>
    </div>
  );
}
