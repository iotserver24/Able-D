import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Components
import { AuthProvider } from "@/contexts/AuthContext";
import { TTSProvider } from "@/contexts/TTSContext";
import { AdaptiveUIProvider } from "@/contexts/AdaptiveUIContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import RoleSelection from "@/components/auth/RoleSelection";
import StudentAuth from "@/components/auth/StudentAuth";
import TeacherAuth from "@/components/auth/TeacherAuth";
import StudentDashboard from "@/pages/StudentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import NotFound from "./pages/NotFound";

// TTS Components
import TTSWelcomePopup from "@/components/tts/TTSWelcomePopup";
import TTSController from "@/components/tts/TTSController";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdaptiveUIProvider>
            <TTSProvider>
              <Toaster />
              <Sonner />
              <TTSWelcomePopup />
              <TTSController />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RoleSelection />} />
                <Route path="/auth/student" element={<StudentAuth />} />
                <Route path="/auth/teacher" element={<TeacherAuth />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/student-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Legacy redirect */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TTSProvider>
          </AdaptiveUIProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
