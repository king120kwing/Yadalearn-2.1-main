import { Home, Search, Calendar, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  action?: () => void;
}

const getNavItems = (isTeacherDashboard: boolean): NavItem[] => {
  if (isTeacherDashboard) {
    return [
      {
        icon: Home,
        label: "Home",
        path: "/teacher-dashboard",
      },
      {
        icon: Search,
        label: "Students",
        path: "/teacher-students",
      },
      {
        icon: Calendar,
        label: "Calendar",
        path: "/teacher-calendar",
      },
      {
        icon: User,
        label: "Profile",
        path: "/settings"
      },
    ];
  } else {
    // Student Navigation
    return [
      { icon: Home, label: "Home", path: "/student-dashboard" },
      { icon: Search, label: "Search", path: "/student-search" },
      { icon: Calendar, label: "Calendar", path: "/student-calendar" },
      { icon: User, label: "Profile", path: "/settings" },
    ];
  }
};

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on teacher or student dashboard
  const savedRole = localStorage.getItem('yadalearn-user-role');
  const isTeacherDashboard = location.pathname.includes('/teacher') ||
    (location.pathname.includes('/settings') && savedRole === 'teacher');

  // We want the same styling for both, but maybe different active colors?
  // User said "not be of a different colour at all". So we use the same base style.
  const navItems = getNavItems(isTeacherDashboard);

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50 safe-bottom">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-around px-2 py-3 sm:px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }

                if (item.action) {
                  item.action();
                } else {
                  navigate(item.path);
                }
              }}
              className={cn(
                "flex flex-col items-center gap-1 transition-all p-2 rounded-lg min-w-[60px] active:scale-95",
                isActive
                  ? "text-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10"
              )}
            >
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
