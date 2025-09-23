import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function LoginModal({ 
  currentModal, 
  userType, 
  onUserTypeSelect, 
  onLoginChoice, 
  onRegisterChoice, 
  onClose 
}) {
  if (currentModal !== 'choose-type' && currentModal !== 'login-or-register') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-8 relative animate-fadeIn">
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

        {currentModal === 'choose-type' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
              <p className="text-gray-600">Please select your role to continue</p>
            </div>

            <div className="space-y-4">
              {/* Student Option */}
              <button
                onClick={() => onUserTypeSelect('student')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800">I'm a Student</h3>
                    <p className="text-sm text-gray-600">Access adaptive learning content</p>
                  </div>
                </div>
              </button>

              {/* Teacher Option */}
              <button
                onClick={() => onUserTypeSelect('teacher')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800">I'm a Teacher</h3>
                    <p className="text-sm text-gray-600">Manage courses and students</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {currentModal === 'login-or-register' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {userType === 'student' ? 'Student Access' : 'Teacher Access'}
              </h2>
              <p className="text-gray-600">Choose how you'd like to proceed</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={onLoginChoice}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700"
              >
                Login to Existing Account
              </Button>

              <Button
                onClick={onRegisterChoice}
                className="w-full py-3 bg-green-600 hover:bg-green-700"
              >
                Register New Account
              </Button>

              <button
                onClick={() => onUserTypeSelect(null)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to role selection
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
