import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isLoaded, user, userRole, onboardingCompleted } = useAuth();
    const location = useLocation();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to welcome but save the attempted location
        return <Navigate to="/welcome" state={{ from: location }} replace />;
    }

    // If they have a role but haven't completed onboarding, and aren't on onboarding, force them there
    if (userRole && !onboardingCompleted && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" state={{ role: userRole }} replace />;
    }

    // If they have no role and aren't on role-selection or onboarding, force them there
    if (!userRole && location.pathname !== '/role-selection' && location.pathname !== '/onboarding') {
        return <Navigate to="/role-selection" replace />;
    }

    // If they HAVE completed onboarding, prevent them from going to role-selection or onboarding
    if (onboardingCompleted && (location.pathname === '/role-selection' || location.pathname === '/onboarding')) {
        const targetPath = userRole === 'teacher' ? '/teacher-dashboard' : userRole === 'parent' ? '/parent-dashboard' : '/student-dashboard';
        return <Navigate to={targetPath} replace />;
    }

    return <>{children}</>;
};
