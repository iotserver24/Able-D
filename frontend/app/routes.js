import { index, route } from "@react-router/dev/routes";

export default [
  // Index route (home page)
  index("routes/_index.jsx"),

  // Authentication routes
  route("/auth/student", "routes/auth.student.jsx"),
  route("/auth/teacher", "routes/auth.teacher.jsx"),
  
  // Dashboard routes (protected)
  route("/student/dashboard", "routes/student.dashboard.jsx"),
  route("/teacher/dashboard", "routes/teacher.dashboard.jsx"),
  
  // Redirect /dashboard to appropriate dashboard based on user role
  route("/dashboard", "routes/dashboard-redirect.jsx"),
  
  // Legacy routes (can be removed later)
  route("/login", "routes/students/studentAuth.jsx"),
  route("/teacher", "routes/teacher.jsx"),
  route("/students", "students/students.jsx"),
];
