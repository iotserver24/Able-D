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