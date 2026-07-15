import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { removeImageBackground } from "@/utils/imageProcessor";

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

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editCountry, setEditCountry] = useState(user?.country || '');
  const [isSaving, setIsSaving] = useState(false);
 
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditCountry(user.country || '');
    }
  }, [user]);

  const resizeProfileImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        const targetWidth = 250;
        const targetHeight = 300;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw image keeping proportions
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (imgRatio > targetRatio) {
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.85)); // Compact size, high quality
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        try {
          const processedResult = await resizeProfileImage(result);

          const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: processedResult })
            .eq('id', user.id);
  
          if (error) {
            console.error('Error saving image:', error);
            alert('Failed to save profile photo: ' + error.message);
          } else {
            const savedUser = JSON.parse(localStorage.getItem('yadalearn-user') || '{}');
            savedUser.imageUrl = processedResult;
            savedUser.avatar_url = processedResult;
            localStorage.setItem('yadalearn-user', JSON.stringify(savedUser));
  
            refreshUser?.();
            window.location.reload();
          }
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          bio: editBio,
          country: editCountry
        })
        .eq('id', user.id);
 
      if (error) {
        alert('Failed to save profile: ' + error.message);
      } else {
        const savedUser = JSON.parse(localStorage.getItem('yadalearn-user') || '{}');
        savedUser.name = editName;
        savedUser.bio = editBio;
        savedUser.country = editCountry;
        localStorage.setItem('yadalearn-user', JSON.stringify(savedUser));
        
        refreshUser?.();
        setIsEditingProfile(false);
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred: ' + err.message);
    } finally {
      setIsSaving(false);
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
              onClick={() => setIsEditingProfile(true)}
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

      {/* Edit Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Country / Location</label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Enter country (e.g. Myanmar)"
                />
              </div>
 
              {userRole === 'teacher' && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Short Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white resize-none"
                    placeholder="Tell your students a bit about yourself..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl bg-purple-600 hover:bg-purple-700 py-3 text-center text-sm font-bold text-white shadow-md transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
