import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Search, Calendar, User, Settings, LogOut } from 'lucide-react';
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
  const { user } = useAuth(); // use custom AuthContext hook
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { topTeachers, upcomingClasses, unratedClasses, loading } = useDashboardData();

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBookingToRate, setSelectedBookingToRate] = useState<any | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingHoverValue, setRatingHoverValue] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const userId = user?.id;
  const userName = user?.fullName || user?.firstName || 'Student';

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
      {/* Sidebar on desktop */}
      <aside className="hidden lg:flex flex-col justify-between w-64 p-8 border-r border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 sticky top-0 h-screen z-10">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-2.5 px-1">
            <Avatar className="h-10 w-10 border border-purple-100 shadow-sm">
              <AvatarImage src={user?.imageUrl} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-black text-xs">
                {userName.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-400 font-medium">Student</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center gap-3.5 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-650 dark:text-purple-400 rounded-2xl font-bold transition-all text-left w-full"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/student-search')}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
            <button
              onClick={() => navigate('/student-calendar')}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
          </nav>
        </div>
        
        {/* Bottom actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => navigate('/logout')}
            className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-y-auto px-4 md:px-10 py-10 pb-28 lg:pb-10 max-w-7xl w-full mx-auto bg-transparent">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#8F81D6] mb-1">Welcome back, Student</p>
          <h1 className="text-4xl font-extrabold text-[#1C1B19] dark:text-white font-serif">
            Hi, {userName.split(' ')[0]}
          </h1>
        </div>

        {/* Welcome Banner Card with Overlapping Profile Image */}
        <section className="mb-12 mt-8 z-10 relative">
          <div className="relative bg-gradient-to-r from-[#F2EBE0] to-[#E5ECE5] dark:from-zinc-900/60 dark:to-zinc-800/40 rounded-[2.5rem] p-8 md:p-12 min-h-[220px] flex items-center shadow-sm overflow-visible">
            
            {/* Welcome Text */}
            <div className="w-[55%] md:w-[60%] text-left z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-[#1C1B19] dark:text-zinc-100 font-serif leading-tight">
                Welcome back to your studies, {userName.split(' ')[0]}!
              </h2>
            </div>

            {/* Overlapping Portrait Image in the center/right */}
            <div className="absolute bottom-0 right-8 md:right-16 w-[40%] md:w-[35%] h-[135%] z-20 overflow-visible origin-bottom translate-y-[0px]">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Student Portrait"
                  className="w-full h-full object-cover object-top select-none origin-bottom scale-110 pointer-events-none"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-end justify-center">
                  <span className="material-symbols-outlined text-9xl text-slate-400 dark:text-zinc-700 opacity-60">
                    person
                  </span>
                </div>
              )}
            </div>
            
          </div>
        </section>

        {/* Quick Menu */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center gap-6 md:gap-10 mt-6 select-none">
            <div 
              onClick={() => setActiveModal('progress')}
              className="flex flex-col items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#E5F6FD] dark:bg-sky-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <span className="material-symbols-outlined text-[#00A3FF] text-2xl">monitoring</span>
              </div>
              <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-300 tracking-tight">Progress</span>
            </div>

            <div 
              onClick={() => setActiveModal('book-class')}
              className="flex flex-col items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#FFF9E6] dark:bg-amber-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <span className="material-symbols-outlined text-[#FFC700] text-2xl">event</span>
              </div>
              <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-300 tracking-tight">Book Class</span>
            </div>

            <div 
              onClick={() => setActiveModal('assignments')}
              className="flex flex-col items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#ECFDF3] dark:bg-emerald-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <span className="material-symbols-outlined text-[#12B76A] text-2xl">assignment</span>
              </div>
              <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-300 tracking-tight">Assignments</span>
            </div>

            <div 
              onClick={() => setActiveModal('message')}
              className="flex flex-col items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#FDF2F8] dark:bg-rose-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <span className="material-symbols-outlined text-[#F43F5E] text-2xl">mail</span>
              </div>
              <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-300 tracking-tight">Messages</span>
            </div>

            <div 
              onClick={() => setActiveModal('join-class')}
              className="flex flex-col items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#F3E8FF] dark:bg-purple-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <span className="material-symbols-outlined text-[#A855F7] text-2xl">videocam</span>
              </div>
              <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-300 tracking-tight">Join Class</span>
            </div>

            <div 
              onClick={() => setActiveModal('ai-buddy')}
              className="flex flex-col items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <span className="material-symbols-outlined text-[#F97316] text-2xl">psychology</span>
              </div>
              <span className="text-xs font-semibold text-[#1C1B19] dark:text-zinc-300 tracking-tight">AI Buddy</span>
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
                <div key={classItem.id} className="bg-white dark:bg-zinc-800 px-5 py-6 rounded-3xl flex items-center justify-between shadow-soft">
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

      {/* Quick Action Modals */}
      <JoinClassModal isOpen={activeModal === 'join-class'} onClose={() => setActiveModal(null)} className="Advanced Spanish Conversation" />
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
