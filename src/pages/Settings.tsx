import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { user, isLoaded, refreshUser, logout } = useAuth();
  const userRole = localStorage.getItem('yadalearn-user-role');

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Debugging log
  console.log('Settings Render - User:', user, 'IsLoaded:', isLoaded);

  if (!user) {
    // Should be handled by ProtectedRoute, but double safety
    return <div className="flex h-screen items-center justify-center">Redirecting...</div>;
  }

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
  });
  const [uploadedCV, setUploadedCV] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;

        // Update localStorage
        const savedUser = JSON.parse(localStorage.getItem('yadalearn-user') || '{}');
        savedUser.imageUrl = result;
        localStorage.setItem('yadalearn-user', JSON.stringify(savedUser));

        // Refresh context
        refreshUser?.();
      };
      reader.readAsDataURL(file);
    }
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return 'User';
  };

  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      return names[0][0].toUpperCase();
    }
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    return 'U';
  };

  const handleLogout = () => {
    localStorage.removeItem('yadalearn-user');
    localStorage.removeItem('yadalearn-user-role');
    logout();
    navigate("/login");
  };

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedCV(file.name);
      alert(`CV "${file.name}" uploaded successfully!`);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-gray-200/50 bg-background-light/80 px-4 backdrop-blur-lg dark:border-gray-800/50 dark:bg-background-dark/80">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-text-light dark:text-text-dark">
          {userRole === 'teacher' ? 'Teacher Settings' : 'Student Settings'}
        </h1>
        <div className="h-10 w-10"></div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-5 pb-24 safe-bottom">
        {/* Profile Card */}
        <section className="flex items-center gap-4 rounded-4xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-soft dark:from-indigo-900/40 dark:to-purple-900/40">
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileUpload}
            className="hidden"
          />
          <div
            className="relative cursor-pointer group"
            onClick={() => profileInputRef.current?.click()}
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="User Avatar"
                className="h-16 w-16 rounded-full border-4 border-white/50 object-cover group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <Avatar className="h-16 w-16 border-4 border-white/50 group-hover:opacity-80 transition-opacity">
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white drop-shadow-md">edit</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {getDisplayName()}
            </h2>
            <p className="text-xs text-purple-600 font-medium cursor-pointer" onClick={() => profileInputRef.current?.click()}>
              Change Profile Photo
            </p>
          </div>
        </section>

        {/* Account Settings */}
        <section className="rounded-4xl bg-white p-5 shadow-soft dark:bg-gray-800/40">
          <h2 className="px-1 pb-4 text-lg font-bold text-gray-800 dark:text-gray-100">Account Settings</h2>
          <div className="space-y-1">
            <div
              className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
              onClick={() => alert('Edit Profile - Profile information is managed by your authentication provider')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/50 dark:text-blue-300">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Edit Profile</p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
              </div>
            </div>

            <div
              className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
              onClick={() => alert('Change Password - Managed by authentication provider')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900/50 dark:text-green-300">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Change Password</p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
              </div>
            </div>

            <div
              className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
              onClick={() => alert('Privacy Settings - Coming soon!')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-900/50 dark:text-purple-300">
                  <span className="material-symbols-outlined">shield_person</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Privacy Settings</p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
              </div>
            </div>

            {/* CV Upload - Teachers Only */}
            {userRole === 'teacher' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                <div
                  className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-300">
                      <span className="material-symbols-outlined">upload_file</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-text-light dark:text-text-dark">Upload CV</p>
                      {uploadedCV && (
                        <p className="text-xs text-green-600 dark:text-green-400">✓ {uploadedCV}</p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-4xl bg-white p-5 shadow-soft dark:bg-gray-800/40">
          <h2 className="px-1 pb-4 text-lg font-bold text-gray-800 dark:text-gray-100">Notifications</h2>
          <div className="space-y-1">
            <div className="flex min-h-[3.75rem] items-center justify-between gap-4 px-1 py-2">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/50 dark:text-red-300">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Push Notifications</p>
              </div>
              <div className="shrink-0">
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
            </div>

            <div className="flex min-h-[3.75rem] items-center justify-between gap-4 px-1 py-2">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Email Alerts</p>
              </div>
              <div className="shrink-0">
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <section className="rounded-4xl bg-white p-5 shadow-soft dark:bg-gray-800/40">
          <h2 className="px-1 pb-4 text-lg font-bold text-gray-800 dark:text-gray-100">App Settings</h2>
          <div className="space-y-1">
            <div
              className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
              onClick={() => alert('Language settings - Coming soon!')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Language</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">English</span>
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
              </div>
            </div>

            <div
              className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
              onClick={() => alert('Appearance settings - Coming soon!')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  <span className="material-symbols-outlined">dark_mode</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Appearance</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Light</span>
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
              </div>
            </div>

            <div
              className="flex min-h-[3.75rem] items-center justify-between gap-4 rounded-2xl px-1 py-2 active:bg-gray-100 dark:active:bg-gray-700/50 cursor-pointer"
              onClick={() => alert('Cache cleared successfully!')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/50 dark:text-orange-300">
                  <span className="material-symbols-outlined">cleaning_services</span>
                </div>
                <p className="flex-1 truncate text-base font-medium text-text-light dark:text-text-dark">Clear Cache</p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">chevron_right</span>
              </div>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-4xl bg-gradient-to-br from-red-50 to-orange-50 p-5 text-center text-lg font-bold text-red-500 shadow-soft dark:from-red-900/40 dark:to-orange-900/40 dark:text-red-400 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
