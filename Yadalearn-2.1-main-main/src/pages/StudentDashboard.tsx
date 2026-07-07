import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Search, Calendar, User, Settings, LogOut, Menu } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TeacherProfileModal } from '@/components/ProfileModals';
import type { Teacher } from '@/types/schema';
import { JoinClassModal } from '@/features/student/quick-actions/JoinClassModal';
import { BookClassModal } from '@/features/student/quick-actions/BookClassModal';
import { AIStudyBuddyModal } from '@/features/student/quick-actions/AIStudyBuddyModal';
import { AssignmentsModal } from '@/features/student/quick-actions/AssignmentsModal';
import { ProgressModal } from '@/features/student/quick-actions/ProgressModal';
import { MessageTeacherModal } from '@/features/student/quick-actions/MessageTeacherModal';
import { useDashboardData } from '@/hooks/useDashboardData';
import { supabase } from '@/lib/supabase';

import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // use custom AuthContext hook
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { topTeachers, upcomingClasses, unratedClasses, loading } = useDashboardData();

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        // Resize and compress raw upload to prevent net::ERR_CONNECTION_CLOSED
        const processedImage = await resizeProfileImage(base64Data);

        // 1. Update profiles table in database directly
        const { error: dbError } = await supabase
          .from('profiles')
          .update({ avatar_url: processedImage })
          .eq('id', user?.id);
        if (dbError) throw dbError;
        
        // 3. Update localStorage user cache immediately
        const savedUserStr = localStorage.getItem('yadalearn-user');
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          parsed.imageUrl = processedImage;
          parsed.avatar_url = processedImage;
          localStorage.setItem('yadalearn-user', JSON.stringify(parsed));
        }

        alert("Profile picture updated successfully!");
        window.location.reload();
      } catch (error: any) {
        console.error("Error updating profile photo:", error);
        alert("Failed to update profile photo: " + error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBookingToRate, setSelectedBookingToRate] = useState<any | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingHoverValue, setRatingHoverValue] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const userId = user?.id;
  const userName = user?.name || user?.firstName || 'Student';

  // Dynamic Join CTA based on authentic calendar bookings starting soon (within 30 minutes)
  const now = new Date();
  const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : null;
  
  let showJoinCTA = false;
  let timeRemainingStr = "";
  if (nextClass && nextClass.day) {
    try {
      const classTime = new Date(nextClass.day);
      const diffMs = classTime.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins >= -10 && diffMins <= 30) {
        showJoinCTA = true;
        timeRemainingStr = diffMins > 0 ? `Starts in ${diffMins} mins` : "Active Now";
      }
    } catch (e) {
      console.error("Error parsing class time:", e);
    }
  }


  const handleTeacherClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };



  return (
    <div className="flex min-h-screen bg-[#FCFAF5] dark:bg-zinc-950 font-sans text-[#1C1B19] dark:text-slate-200 w-full relative overflow-x-hidden">
      
      {/* Frosted Glass Navigation Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)} 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200" 
        />
      )}

      {/* Frosted Glass Drawer Side Menu */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-80 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-2xl border-r border-white/20 shadow-2xl p-8 flex flex-col justify-between z-50 transition-all duration-300 transform",
        isDrawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-zinc-700 shadow-sm relative">
                <img 
                  src="/logo (2).png" 
                  alt="YadaLearn Logo" 
                  className="absolute w-[185%] h-[185%] max-w-none object-contain top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                />
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">YadaLearn</span>
            </div>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/60 dark:bg-zinc-800/60 border border-slate-200/20 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-zinc-400"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { label: 'Home', path: '/student-dashboard', icon: Home },
              { label: 'Search', path: '/student-search', icon: Search },
              { label: 'Calendar', path: '/student-calendar', icon: Calendar },
              { label: 'Profile', path: '/settings', icon: User }
            ].map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsDrawerOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-left w-full",
                    isActive
                      ? "bg-[#5B4A9F]/10 text-[#5B4A9F] dark:text-purple-400 border border-[#5B4A9F]/10"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-zinc-800/30"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 px-4 py-2 border-t border-slate-200/20 dark:border-zinc-800/20 pt-4">
            <div className="relative w-10 h-10 select-none shrink-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={userName}
                  className="w-full h-full object-cover object-center rounded-full border border-white/20 shadow-sm"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="material-symbols-outlined text-sm text-slate-500">person</span>
                </div>
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-[#1C1B19] dark:text-white tracking-tight leading-tight truncate">{userName}</span>
              <span className="text-[10px] text-slate-500 font-medium">Student</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => { navigate('/settings'); setIsDrawerOpen(false); }}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-zinc-800/30 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => { navigate('/logout'); setIsDrawerOpen(false); }}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-[#F43F5E] hover:bg-white/40 dark:hover:bg-zinc-800/30 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-y-auto px-4 md:px-10 py-10 pb-28 lg:pb-10 max-w-7xl w-full mx-auto bg-transparent">
        
        {/* Header with Menu Drawer Trigger */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDrawerOpen(true)} 
              className="p-2 rounded-xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-slate-200/40 dark:border-zinc-700/40 text-slate-700 dark:text-zinc-200 shadow-sm hover:scale-105 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <p className="text-xs font-semibold text-[#8F81D6] mb-0.5">{userName.split(' ')[0]}, welcome back.</p>
              <h1 className="text-3xl font-extrabold text-[#1C1B19] dark:text-white font-serif leading-tight">
                {userName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/settings')}>
            <div className="relative w-12 h-12 select-none">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={userName}
                  className="w-full h-full object-cover object-center pointer-events-none"
                  style={{
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 72%)'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="material-symbols-outlined text-xl text-slate-500">person</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Welcome Banner Card with Circular Profile Image Well */}
        <section className="mb-12 mt-8 z-10 relative">
          <div className="relative bg-gradient-to-r from-[#F2EBE0]/60 to-[#E5ECE5]/60 dark:from-zinc-900/40 dark:to-zinc-800/20 backdrop-blur-md border border-white/20 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-12 min-h-[260px] flex items-center justify-center shadow-sm overflow-visible">
            <div className="relative flex justify-center items-center overflow-visible z-20">
              {/* Synchronized soft lavender/apricot gradient glow in the background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[440px] md:h-[440px] bg-[radial-gradient(circle,rgba(91,74,159,0.14)_0%,rgba(143,129,214,0.06)_50%,transparent_75%)] blur-[45px] pointer-events-none z-0" />
              
              <div 
                onClick={handleImageClick}
                className="relative w-60 h-60 md:w-68 md:h-68 rounded-full bg-white/10 dark:bg-zinc-950/15 backdrop-blur-md border border-white/20 dark:border-zinc-800/40 shadow-lg flex items-center justify-center cursor-pointer overflow-hidden group z-10 hover:scale-[1.02] transition-transform duration-300"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={userName}
                    className="w-full h-full object-cover object-center rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-zinc-650">
                      face
                    </span>
                    <span className="text-xs font-semibold text-[#8F81D6]">Click to upload</span>
                  </div>
                )}

                {/* Camera Hover Overlay */}
                <div className="absolute inset-0 bg-[#5B4A9F]/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-white/95 text-[#5B4A9F] flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-2xl font-bold">photo_camera</span>
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Action Card */}
        <section className="mb-12">
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-white/20 dark:border-zinc-800/80 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#1C1B19] dark:text-white mb-6 tracking-tight">Quick Action</h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 justify-items-center">
              <div 
                onClick={() => setActiveModal('progress')}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#E5F6FD] dark:bg-sky-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[#00A3FF] text-2xl">monitoring</span>
                </div>
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-350 tracking-tight text-center">Progress</span>
              </div>

              <div 
                onClick={() => setActiveModal('book-class')}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF9E6] dark:bg-amber-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[#FFC700] text-2xl">event</span>
                </div>
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-350 tracking-tight text-center">Book Class</span>
              </div>

              <div 
                onClick={() => setActiveModal('assignments')}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#ECFDF3] dark:bg-emerald-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[#12B76A] text-2xl">assignment</span>
                </div>
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-350 tracking-tight text-center">Assignments</span>
              </div>

              <div 
                onClick={() => setActiveModal('message')}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#FDF2F8] dark:bg-rose-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[#F43F5E] text-2xl">mail</span>
                </div>
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-350 tracking-tight text-center">Messages</span>
              </div>

              <div 
                onClick={() => setActiveModal('join-class')}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#F3E8FF] dark:bg-purple-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[#A855F7] text-2xl">videocam</span>
                </div>
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-350 tracking-tight text-center">Join Class</span>
              </div>

              <div 
                onClick={() => setActiveModal('ai-buddy')}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <span className="material-symbols-outlined text-[#F97316] text-2xl">psychology</span>
                </div>
                <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-350 tracking-tight text-center">AI Buddy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Classes */}
        {upcomingClasses && upcomingClasses.length > 0 && (
          <section className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Upcoming Classes</h2>
              <a className="text-sm font-medium text-indigo-500 dark:text-indigo-400" href="#">View All</a>
            </div>
            <div className="space-y-4">
              {upcomingClasses.slice(0, 2).map((classItem) => (
                <div key={classItem.id} className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-white/20 dark:border-zinc-800/80 rounded-[2rem] px-5 py-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-indigo-500 dark:text-indigo-400">
                          edit_document
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-400 rounded-full border-2 border-white dark:border-zinc-800 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'wght' 700" }}>
                          hourglass_top
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-base text-text-light dark:text-text-dark">
                        {classItem.title}
                      </p>
                      <p className="text-sm text-subtext-light dark:text-subtext-dark">
                        {classItem.day ? `Schedule: ${classItem.day}` : 'Scheduled'}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-subtext-light dark:text-subtext-dark cursor-pointer">more_vert</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
      <TeacherProfileModal
        teacher={selectedTeacher}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <JoinClassModal 
        isOpen={activeModal === 'join-class'} 
        onClose={() => setActiveModal(null)} 
        className={nextClass ? nextClass.title : 'Spanish Conversation'} 
        teacherName={nextClass?.teacherName} 
      />
      <BookClassModal isOpen={activeModal === 'book-class'} onClose={() => setActiveModal(null)} />
      <AIStudyBuddyModal isOpen={activeModal === 'ai-buddy'} onClose={() => setActiveModal(null)} />
      <AssignmentsModal isOpen={activeModal === 'assignments'} onClose={() => setActiveModal(null)} />
      <ProgressModal isOpen={activeModal === 'progress'} onClose={() => setActiveModal(null)} />
      <MessageTeacherModal isOpen={activeModal === 'message'} onClose={() => setActiveModal(null)} />

      {/* Rate Session Modal */}
      {isRatingModalOpen && selectedBookingToRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 max-w-sm w-full border border-gray-150 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            
            <div className="flex flex-col items-center text-center mt-2">
              <Avatar className="w-16 h-16 border-2 border-indigo-500 shadow-md mb-3">
                <AvatarImage src={selectedBookingToRate.teacherAvatar} />
                <AvatarFallback className="bg-indigo-100 text-indigo-800 font-bold">{selectedBookingToRate.teacherName[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Rate your session</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 px-4 leading-relaxed">
                Please rate your <strong>{selectedBookingToRate.title}</strong> class with <strong>{selectedBookingToRate.teacherName}</strong>.
              </p>
              
              {/* Star Rating Selectors */}
              <div className="flex items-center gap-2 my-6">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isHoveredOrSelected = star <= (ratingHoverValue || ratingValue);
                  return (
                    <button
                      key={star}
                      onMouseEnter={() => setRatingHoverValue(star)}
                      onMouseLeave={() => setRatingHoverValue(0)}
                      onClick={() => setRatingValue(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    >
                      <span className={`material-symbols-outlined ${
                        isHoveredOrSelected ? 'text-amber-500 font-bold fill-current' : 'text-slate-350 dark:text-zinc-650'
                      }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <Button
                onClick={async () => {
                  if (ratingValue === 0) {
                    alert("Please select a rating before submitting!");
                    return;
                  }
                  setIsSubmittingRating(true);
                  try {
                    const { error } = await supabase
                      .from('bookings')
                      .update({ rating: ratingValue })
                      .eq('id', selectedBookingToRate.id);

                    if (error) throw error;

                    alert(`Thank you! Your rating of ${ratingValue} stars has been recorded.`);
                    setIsRatingModalOpen(false);
                    // Refresh page to load updated database state
                    window.location.reload();
                  } catch (e: any) {
                    console.error("Error submitting rating:", e);
                    alert("Failed to submit rating: " + e.message);
                  } finally {
                    setIsSubmittingRating(false);
                  }
                }}
                disabled={isSubmittingRating || ratingValue === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingRating ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
