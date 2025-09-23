import { useMockAuth } from "../constants/MockAuthContext";
import { StudentAuth } from "../auth/students/components/StudentAuth";
import { Dashboard } from "../students/features/dashboard/dashboard";
import { AdaptiveUIProvider } from "../contexts/AdaptiveUIContext";
import { AdaptiveLayout } from "../components/adaptive/AdaptiveLayout";

export function meta({}) {
  return [
    { title: "Adaptive Learning Platform" },
    { name: "description", content: "Accessible education for all students" },
  ];
}

export default function Home() {
<<<<<<< HEAD
  const { isAuthenticated, user } = useMockAuth();
  
  // If not authenticated, show login
  if (!isAuthenticated) {
    return <StudentAuth />;
  }
  
  // If authenticated, show dashboard with adaptive UI
  return (
    <AdaptiveUIProvider studentType={user?.studentType}>
      <AdaptiveLayout>
        <Dashboard 
          sessionId={user?.id || 'default-session'} 
          studentType={user?.studentType} 
        />
      </AdaptiveLayout>
    </AdaptiveUIProvider>
  );
}
=======
  const { isAuthenticated, user } = useMockAuth();
  
  // If not authenticated, show login
  if (!isAuthenticated) {
    return <StudentAuth />;
  }
  
  // If authenticated, show dashboard with adaptive UI
  return (
    <AdaptiveUIProvider studentType={user?.studentType}>
      <AdaptiveLayout>
        <Dashboard 
          sessionId={user?.id || 'default-session'} 
          studentType={user?.studentType} 
        />
      </AdaptiveLayout>
    </AdaptiveUIProvider>
  );
}
>>>>>>> e46cc4d8f33ce387cca621fbb360463db8219edf
