import ProtectedRoute from "../ProtectedRoute";
import { MockAuthProvider } from "../../auth/students/constants/MockAuthContext";
import { Dashboard } from "../../students/dashboard";
import { useMockAuth } from "../../auth/context/MockAuthContext";
import { StudentAuth } from "../../auth/students/components/StudentAuth";

export function meta({}) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

function AppContent() {
  const { isAuthenticated } = useMockAuth();
  
  return isAuthenticated ? <StudentAuth /> : <StudentAuth />;
}


export default function Home() {
return (
    <MockAuthProvider>
      <AppContent />
    </MockAuthProvider>
  );
}