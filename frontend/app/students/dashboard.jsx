import { useMockAuth } from '../auth/context/MockAuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { STUDENT_TYPES } from '../auth/constants/studentTypes';

export function Dashboard() {
  const { user, logout } = useMockAuth();
  
  const getStudentTypeInfo = () => {
    return Object.values(STUDENT_TYPES).find(type => type.value === user?.studentType);
  };
  
  const typeInfo = getStudentTypeInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <Button onClick={logout} variant="secondary" className="w-auto px-4 py-2">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student Type</p>
                <p className="font-medium">{typeInfo?.label}</p>
              </div>
            </div>
          </Card>

          {/* Accessibility Features */}
          <Card className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Your Accessibility Features</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{typeInfo?.label} Support</h3>
              <p className="text-blue-700">{typeInfo?.description}</p>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">Available features:</p>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  {getAccessibilityFeatures(user?.studentType).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <h3 className="font-medium mb-1">My Courses</h3>
              <p className="text-sm text-gray-600">Access your enrolled courses</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <h3 className="font-medium mb-1">Accessibility Settings</h3>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <h3 className="font-medium mb-1">Support</h3>
              <p className="text-sm text-gray-600">Get help when you need it</p>
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function getAccessibilityFeatures(studentType) {
  const features = {
    visually_impaired: [
      "Screen reader optimization",
      "High contrast mode",
      "Text-to-speech functionality",
      "Keyboard navigation support"
    ],
    hearing_impaired: [
      "Video captions and transcripts",
      "Visual alerts and notifications",
      "Sign language support",
      "Text-based communication tools"
    ],
    speech_impaired: [
      "Alternative communication methods",
      "Text-based interaction",
      "Pre-recorded response options",
      "Written assessment alternatives"
    ],
    special_needs: [
      "Customizable learning pace",
      "Simplified navigation",
      "Multi-sensory learning materials",
      "Personalized support options"
    ]
  };
  
  return features[studentType] || [];
}