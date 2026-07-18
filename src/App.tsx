import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Browse from "./pages/Browse";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import TeacherProfile from "./pages/TeacherProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Premium from "./pages/Premium";
import RoleSelection from "./pages/RoleSelection";
import StudentDashboard from "./pages/StudentDashboard";
import StudentSearch from "./pages/StudentSearch";
import StudentCalendar from "./pages/StudentCalendar";

import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherCalendar from "./pages/TeacherCalendar";
import LearningClass from "./pages/LearningClass";
import AIFeatures from "./pages/AIFeatures";
import Settings from "./pages/Settings";
import RateTeacher from './pages/RateTeacher';
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import MobileScreensShowcase from "./pages/MobileScreensShowcase";
import Meeting from "./pages/Meeting";
import LinkTeacher from "./pages/LinkTeacher";
import { StreamProvider } from "./contexts/StreamProvider";
import "@/assets/css/fonts.css";

const App = () => {
  console.log('App: Rendering...');
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <StreamProvider>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<Welcome />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/teacher/:id" element={<TeacherProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/mobile-screens" element={<MobileScreensShowcase />} />
            <Route path="/link/:teacherId" element={<LinkTeacher />} />

            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
            <Route path="/meeting/:id" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
            <Route path="/rate-teacher/:id" element={<ProtectedRoute><RateTeacher /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student-search" element={<ProtectedRoute><StudentSearch /></ProtectedRoute>} />
            <Route path="/student-calendar" element={<ProtectedRoute><StudentCalendar /></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher-students" element={<ProtectedRoute><TeacherStudents /></ProtectedRoute>} />
            <Route path="/teacher-calendar" element={<ProtectedRoute><TeacherCalendar /></ProtectedRoute>} />

            <Route path="/learning-class" element={<ProtectedRoute><LearningClass /></ProtectedRoute>} />
            <Route path="/ai-features" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StreamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
