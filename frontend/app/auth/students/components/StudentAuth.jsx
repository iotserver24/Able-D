import { useStudentAuth } from "../../../hooks/useStudentAuth";
import { StudentTypeSelector } from "./StudentTypeSelector";
import { AuthStatus } from "./AuthStatus";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md">
          <AuthStatus message="Signing you in..." type="loading" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Students
          </h1>
          <p className="text-gray-600">
            Please select your accessibility needs to continue
          </p>
          
          {/* Development Mode Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              🔧 Development Mode: Using mock authentication
            </p>
          </div>
        </div>

        <StudentTypeSelector
          value={studentType}
          onChange={(value) => {
            setStudentType(value);
            setError(null);
          }}
          error={error}
        />

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleLogin}
            disabled={!studentType || isLoading}
          >
            {isLoading ? 'Signing in...' : 'Continue to Dashboard'}
          </Button>
          
          <p className="text-center text-sm text-gray-500">
            By signing in, you agree to our accessibility-focused learning environment
          </p>
        </div>
      </Card>
    </div>
  );
}