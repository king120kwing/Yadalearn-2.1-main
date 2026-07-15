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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800 rounded-3xl py-2 px-6 shadow-lg z-50 flex justify-between items-center md:hidden">
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
                  ? isTeacherDashboard
                    ? "text-[#FF7D46] bg-[#FF7D46]/10 dark:bg-[#FF7D46]/20 shadow-sm font-bold"
                    : "text-[#5B4A9F] bg-[#5B4A9F]/10 dark:bg-[#5B4A9F]/20 shadow-sm font-bold"
                  : isTeacherDashboard
                    ? "text-gray-500 dark:text-gray-450 hover:text-[#FF7D46] hover:bg-[#FF7D46]/5 dark:hover:bg-[#FF7D46]/10"
                    : "text-gray-500 dark:text-gray-450 hover:text-[#5B4A9F] hover:bg-[#5B4A9F]/5 dark:hover:bg-[#5B4A9F]/10"
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
