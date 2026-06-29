import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SessionStatus } from '@/types/enums';
import type { Student } from '@/types/schema';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { removeImageBackground } from '@/utils/imageProcessor';
import { seedDatabase } from '@/utils/seedData'; // Import seed utility
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Calendar as CalendarIcon, 
  Edit3, 
  Users, 
  Megaphone, 
  Upload, 
  MoreHorizontal, 
  ChevronRight, 
  Home, 
  Settings as SettingsIcon, 
  Bell 
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { StudentProfileModal } from '@/components/ProfileModals';
import {
  StartClassModal,
  CreateSessionModal,
  ReviewSubmissionsModal,
  StudentOverviewModal,
  QuickAnnouncementModal,
  UploadMaterialsModal
} from '@/features/teacher/quick-actions';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoaded, userRole, logout } = useAuth();
  const { teacherSchedule, topStudents, stats, pendingBookings, loading } = useTeacherDashboardData(); // Use the hook

  // Find the next upcoming/active event based on the current actual time
  const getNextUpcomingEvent = (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return null;
    const now = new Date();
    
    const parseDateTime = (dateStr: string, timeStr: string) => {
      try {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return new Date(0);
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        let hours = 0;
        let minutes = 0;
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
        return new Date(year, month, day, hours, minutes);
      } catch (e) {
        return new Date(0);
      }
    };

    const upcoming = schedule.filter((event: any) => {
      const start = parseDateTime(event.date, event.time);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      return end > now;
    });

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextEvent = getNextUpcomingEvent(teacherSchedule);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const savedUser = localStorage.getItem('yadalearn-user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const userId = user?.id || parsedUser?.id;

    if (!userId) {
      alert("User not identified. Please try logging in again.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const processedImage = await removeImageBackground(base64String);
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: processedImage })
          .eq('id', userId);

        if (error) {
          console.error('Error saving image:', error);
          alert('Failed to save image: ' + error.message);
        } else {
          // Update cached user locally to prevent reload flickering and empty placeholder
          const savedUser = JSON.parse(localStorage.getItem('yadalearn-user') || '{}');
          savedUser.imageUrl = processedImage;
          localStorage.setItem('yadalearn-user', JSON.stringify(savedUser));
          window.location.reload();
        }
      } catch (err) {
        console.error('Error uploading:', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error('Error approving booking:', err);
      alert('Failed to approve booking request.');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId);
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking request.');
    }
  };

  // Helper to generate calendar days for the current month with full date strings
  const getCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const days: { date: number; isCurrentMonth: boolean; isToday: boolean; dateStr: string }[] = [];
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, isToday: false, dateStr });
    }
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ date: i, isCurrentMonth: true, isToday: i === now.getDate(), dateStr });
    }
    const remaining = days.length % 7;
    if (remaining > 0) {
      for (let i = 1; i <= (7 - remaining); i++) {
        const m = month === 11 ? 0 : month + 1;
        const y = month === 11 ? year + 1 : year;
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({ date: i, isCurrentMonth: false, isToday: false, dateStr });
      }
    }
    return days;
  };

  // Use real stats from the database
  const studentProgress = {
    completedTasks: (stats as any).completedTasks || 0,
    pendingTasks: (stats as any).pendingTasks || 0
  };

  // ALL hooks must be called before any conditional logic
  useEffect(() => {
    if (isLoaded) {
      const savedRole = localStorage.getItem('yadalearn-user-role');
      const savedUser = localStorage.getItem('yadalearn-user');
      const isTeacher = userRole === 'teacher' || savedRole === 'teacher';
      const hasUser = user || savedUser;

      if (!hasUser || !isTeacher) {
        navigate('/role-selection');
      }
    }
  }, [user, isLoaded, userRole, navigate]);

  // Listen for custom events from BottomNav
  useEffect(() => {
    const handleOpenStudentsModal = () => setActiveModal('students');
    const handleOpenClassModal = () => setActiveModal('class');
    const handleOpenEarningsModal = () => setActiveModal('earnings');

    window.addEventListener('openStudentsModal', handleOpenStudentsModal);
    window.addEventListener('openClassModal', handleOpenClassModal);
    window.addEventListener('openEarningsModal', handleOpenEarningsModal);

    return () => {
      window.removeEventListener('openStudentsModal', handleOpenStudentsModal);
      window.removeEventListener('openClassModal', handleOpenClassModal);
      window.removeEventListener('openEarningsModal', handleOpenEarningsModal);
    };
  }, []);

  // Compute derived values after all hooks are called
  const savedRole = localStorage.getItem('yadalearn-user-role');
  const savedUser = localStorage.getItem('yadalearn-user');
  const isTeacher = userRole === 'teacher' || savedRole === 'teacher';
  const hasUser = user || savedUser;
  const currentUser = user || (savedUser ? JSON.parse(savedUser) : null);
  const isReady = isLoaded && hasUser && isTeacher;
  const shouldRedirectToLogin = isLoaded && !hasUser;
  const shouldRedirectToRoleSelection = isLoaded && hasUser && !isTeacher;

  // Handle redirects after hooks but before render
  if (shouldRedirectToLogin) {
    navigate('/login');
    return null;
  }

  if (shouldRedirectToRoleSelection) {
    navigate('/role-selection');
    return null;
  }

  // Show loading state after hooks are called
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const totalTasks = studentProgress.completedTasks + studentProgress.pendingTasks;
  const progressPercentage = Math.round((studentProgress.completedTasks / totalTasks) * 100);
  const strokeDasharray = `${progressPercentage}, 100`;

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950 font-sans text-slate-800 dark:text-slate-200 w-full relative overflow-x-hidden">

      {/* Sidebar on desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 p-8 border-r border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 sticky top-0 h-screen z-10">
        <div className="flex flex-col gap-10">
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
          
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-3.5 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl font-bold transition-all text-left w-full"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/teacher-students')}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <Users className="h-5 w-5" />
              <span>Students</span>
            </button>
            <button
              onClick={() => navigate('/teacher-calendar')}
              className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
            >
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar</span>
            </button>
          </nav>
        </div>
        
        {/* Bottom actions matching reference image */}
        <div className="flex flex-col gap-4">


          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
          >
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3.5 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-2xl font-semibold transition-all text-left w-full"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentUser?.avatarUrl || currentUser?.imageUrl} />
              <AvatarFallback className="bg-purple-600 text-white text-[10px] font-bold">
                {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'T'}
              </AvatarFallback>
            </Avatar>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto px-4 md:px-10 py-10 pb-28 md:pb-10 max-w-7xl w-full mx-auto bg-transparent overflow-x-hidden">

        {/* Hidden File Input for Portrait Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Hero Section (No Card Wrapper) */}
        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-start gap-12 mt-4 md:mt-0 mb-4 pt-4 w-full z-10">

           {/* Portrait Image Area (Interactive / Uploadable) */}
           <div className="relative shrink-0 md:-mb-[135px] z-10">
             {/* Soft, organic localized peach/apricot glow behind the portrait (circular aura, no clipping) */}
             <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[640px] md:h-[640px] bg-[radial-gradient(circle,rgba(255,125,70,0.85)_0%,rgba(255,185,130,0.45)_50%,transparent_75%)] blur-[60px] pointer-events-none z-0" />
             {currentUser?.imageUrl ? (
               <div 
                 className="w-64 h-80 md:w-72 md:h-96 rounded-[2rem] border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] flex items-center justify-center relative group cursor-pointer overflow-hidden z-10" 
                 onClick={handleImageClick}
               >
                 {/* Photograph processed with blurred background and sharp individual */}
                 <img
                   src={currentUser.imageUrl}
                   alt="Teacher Portrait"
                   className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-[1.01]"
                 />
                 
                 {/* Floating Edit Badge */}
                 <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center border border-slate-100 dark:border-zinc-700 hover:scale-105 z-20">
                   <span className="material-symbols-outlined text-sm text-slate-700 dark:text-zinc-300">edit</span>
                 </div>
               </div>
             ) : (
               <div
                 onClick={handleImageClick}
                 className="w-64 h-80 md:w-72 md:h-96 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-sm flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/60 dark:hover:bg-zinc-900/50 transition-all group shadow-sm z-10"
               >
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-115 transition-transform duration-200 shadow-sm border border-purple-100/50 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-2xl">upload</span>
                </div>
                <div className="text-center px-4">
                  <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">Upload Portrait</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">Recommended:<br/>Professional Photo</p>
                </div>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 rounded-[2rem] backdrop-blur-sm flex items-center justify-center z-30">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left pt-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">
              {currentUser?.name || 'Anya Sharma'}
            </h1>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Welcome Back,</p>
            
            {currentUser?.bio && (
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mt-2 mb-6 max-w-md italic leading-relaxed border-l-2 border-purple-500/35 pl-3 text-left">
                "{currentUser.bio}"
              </p>
            )}
            
            {/* Profile Stats List */}
            <div className="flex flex-col gap-2.5 max-w-xs mx-auto md:mx-0 mt-6">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-slate-600 dark:text-slate-350 font-semibold">Active Courses:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{stats.upcomingClasses ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-slate-600 dark:text-slate-355 font-semibold">Registered Students:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{stats.totalStudents ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-slate-600 dark:text-slate-355 font-semibold">Avg. Course Rating:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{(stats.avgRating ?? 4.8).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Booking Requests Alert Banner */}
        {pendingBookings && pendingBookings.length > 0 && (
          <div className="mb-10 space-y-4">
            {pendingBookings.map((booking: any) => (
              <div key={booking.id} className="relative overflow-hidden bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border border-purple-500/20 dark:border-purple-800/30 p-5 md:p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-5 backdrop-blur-xl shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-4 text-left w-full md:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-sm border border-purple-200/30">
                    <span className="material-symbols-outlined text-2xl font-bold animate-pulse">notifications_active</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight">New Booking & Registration Request!</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      <span className="font-bold text-slate-850 dark:text-slate-200">{booking.student?.full_name || 'A Student'}</span> wants to register and book a session for <span className="font-bold text-slate-850 dark:text-slate-200">{booking.subject}</span> on <span className="font-bold text-slate-850 dark:text-slate-200">{booking.date}</span> at <span className="font-bold text-slate-850 dark:text-slate-200">{booking.time}</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end z-10">
                  <Button
                    onClick={() => handleRejectBooking(booking.id)}
                    variant="outline"
                    className="border-red-500/30 text-red-650 hover:bg-red-50 dark:border-red-900/20 dark:text-red-400 dark:hover:bg-red-950/20 px-5 py-2.5 rounded-full font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveBooking(booking.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    Approve & Register
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Grid & Planning */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10 z-20 relative">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-3 bg-white/75 dark:bg-zinc-900/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[-12px_24px_50px_-10px_rgba(255,140,100,0.32),_0_8px_24px_rgba(0,0,0,0.02)] border-t-2 border-t-[#FFBCA0] border-l-2 border-l-[#FFC3A0]/65 border-r border-r-slate-200/40 border-b border-b-slate-200/40 z-10 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quick Actions</h2>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-full shrink-0 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div
                onClick={() => setActiveModal('start-class')}
                className="bg-white/50 hover:bg-white/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-700/20 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-center h-28"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-zinc-200">Start Class</p>
              </div>

              <div
                onClick={() => setActiveModal('create-session')}
                className="bg-white/50 hover:bg-white/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-700/20 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-center h-28"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-zinc-200">Create Session</p>
              </div>

              <div
                onClick={() => setActiveModal('review-submissions')}
                className="bg-white/50 hover:bg-white/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-700/20 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-center h-28"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-zinc-200">Review Assignments</p>
              </div>

              <div
                onClick={() => setActiveModal('student-overview')}
                className="bg-white/50 hover:bg-white/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-700/20 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-center h-28"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-zinc-200">Students</p>
              </div>

              <div
                onClick={() => setActiveModal('announcement')}
                className="bg-white/50 hover:bg-white/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-700/20 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-center h-28"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-zinc-200">Announcements</p>
              </div>

              <div
                onClick={() => setActiveModal('upload-materials')}
                className="bg-white/50 hover:bg-white/70 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-700/20 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-center h-28"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-purple-650 dark:text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-750 dark:text-zinc-200">Upload Materials</p>
              </div>
            </div>
          </div>

          {/* Calendar & Planning Panel */}
          <div className="lg:col-span-2 bg-white/75 dark:bg-zinc-900/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[-12px_24px_50px_-10px_rgba(255,140,100,0.32),_0_8px_24px_rgba(0,0,0,0.02)] border-t-2 border-t-[#FFBCA0] border-l-2 border-l-[#FFC3A0]/65 border-r border-r-slate-200/40 border-b border-b-slate-200/40 flex flex-col z-10 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Calendar & Planning</h2>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-full shrink-0 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
              {/* Calendar Widget */}
              <div className="w-full sm:w-1/2 max-w-[200px] shrink-0">
                <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase h-6 flex items-center justify-center">{day}</span>
                  ))}
                  {getCalendarDays().map((d, idx) => {
                    const isSelected = d.dateStr === selectedDateStr;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedDateStr(d.dateStr)}
                        className="flex items-center justify-center h-7 w-7 mx-auto cursor-pointer transition-all hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-full"
                      >
                        <span className={
                          isSelected
                            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                            : d.isToday
                              ? "border border-slate-400 text-slate-800 dark:border-white dark:text-white font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                              : d.isCurrentMonth
                                ? "text-slate-750 dark:text-zinc-100 font-semibold text-xs"
                                : "text-slate-350 dark:text-zinc-650 font-medium text-[10px]"
                        }>
                          {d.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule and Events */}
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Daily Schedule & Planning</p>
                  
                  {(() => {
                    const filtered = teacherSchedule.filter((session: any) => session.date === selectedDateStr);
                    if (filtered.length > 0) {
                      return filtered.slice(0, 3).map((session, idx) => {
                        const colors = [
                          { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-250 dark:border-emerald-500/30', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
                          { bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-250 dark:border-blue-500/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-400' },
                          { bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-250 dark:border-purple-500/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-400' }
                        ];
                        const style = colors[idx % colors.length];
                        return (
                          <div key={session.id} className={`flex items-center gap-3 p-2.5 ${style.bg} border-l-4 ${style.border} rounded-r-xl border border-y-slate-100 border-r-slate-100 dark:border-y-transparent dark:border-r-transparent`}>
                            <span className={`font-bold text-[10px] ${style.text} whitespace-nowrap`}>{session.time}</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200 truncate">{session.title}</span>
                          </div>
                        );
                      });
                    } else {
                      return (
                        <div className="flex flex-col items-center justify-center p-4 bg-white/30 dark:bg-zinc-800/10 border border-dashed border-slate-200 dark:border-zinc-700/20 rounded-2xl">
                          <CalendarIcon className="h-5 w-5 text-slate-400 dark:text-zinc-500 mb-1" />
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">No Scheduled Plans</p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {nextEvent && (
                  <div className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white shadow-sm border-l-4 border-purple-300">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-0.5">Upcoming Events & Deadlines</p>
                    <p className="text-xs font-bold">Session Prep: {nextEvent.title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registered Students Table */}
        <div className="bg-white/75 dark:bg-zinc-900/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[-12px_24px_50px_-10px_rgba(255,140,100,0.32),_0_8px_24px_rgba(0,0,0,0.02)] border-t-2 border-t-[#FFBCA0] border-l-2 border-l-[#FFC3A0]/65 border-r border-r-slate-200/40 border-b border-b-slate-200/40 mb-10 z-10 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Registered Students</h2>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-full shrink-0 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Enrolled Subjects</th>
                  <th className="pb-3 font-semibold">Last Activity</th>
                  <th className="pb-3 font-semibold">Registration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {topStudents.length > 0 ? (
                  topStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 flex items-center gap-3 font-bold text-slate-800 dark:text-white text-sm">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-200 text-xs font-bold">
                        {student.learningSubjects && student.learningSubjects.length > 0
                          ? student.learningSubjects[0] + ' Subjects'
                          : 'English Subjects'}
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-350 text-xs font-medium">
                        {student.lastActive || 'Active now'}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full ${
                          student.sessionsCompleted > 5
                            ? 'bg-slate-150 text-slate-600 dark:bg-white/10 dark:text-slate-350'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent'
                        }`}>
                          {student.sessionsCompleted > 5 ? 'Graduated' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-zinc-400 font-semibold text-xs">
                      No registered students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>

      <StudentProfileModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Teacher Quick Action Modals */}
      <StartClassModal
        isOpen={activeModal === 'start-class'}
        onClose={() => setActiveModal(null)}
      />
      <CreateSessionModal
        isOpen={activeModal === 'create-session'}
        onClose={() => setActiveModal(null)}
      />
      <ReviewSubmissionsModal
        isOpen={activeModal === 'review-submissions'}
        onClose={() => setActiveModal(null)}
      />
      <StudentOverviewModal
        isOpen={activeModal === 'student-overview'}
        onClose={() => setActiveModal(null)}
      />
      <QuickAnnouncementModal
        isOpen={activeModal === 'announcement'}
        onClose={() => setActiveModal(null)}
      />
      <UploadMaterialsModal
        isOpen={activeModal === 'upload-materials'}
        onClose={() => setActiveModal(null)}
      />

      {/* Legacy Modals (kept from original implementation) */}
      {activeModal === 'students' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl bg-white max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <span className="text-fluid-lg">My Students</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="p-6 space-y-4">
                {topStudents.slice(0, 8).map((student) => (
                  <div key={student.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-800 text-fluid-base">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.country} • {student.learningSubjects?.[0] || 'Mathematics'}</p>
                          <p className="text-xs text-gray-500">{student.sessionsCompleted} sessions completed</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-black hover:bg-gray-900 text-white rounded-full"
                        onClick={() => {
                          handleStudentClick(student);
                          setActiveModal(null);
                        }}
                      >
                        View Profile
                      </Button>
                    </div>

                    <div className="bg-white rounded-md p-3 mb-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-2">Current Assignments</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Mathematics Homework #5</span>
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">Due Tomorrow</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Algebra Practice Set</span>
                          <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-md p-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-2">Study Materials</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.doc,.docx,.ppt,.pptx';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                alert(`📁 "${file.name}" uploaded successfully for ${student.name}!`);
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload Material
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            alert(`📚 Recent uploads for ${student.name}:\\n• Algebra Formulas.pdf\\n• Geometry Cheat Sheet.docx\\n• Practice Problems Set 3.pdf`);
                          }}
                        >
                          View Materials
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeModal === 'class' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Start Class</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Choose Your Option</h3>
                <p className="text-sm text-gray-600">Generate class link or QR code for students to join</p>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
                  onClick={() => {
                    alert('🎥 Class Link Generated!\\n\\nLink: https://yadalearn.com/class/abc123\\n\\nStudents can join using this link.');
                    setActiveModal(null);
                  }}
                >
                  <span className="material-symbols-outlined mr-2">videocam</span>
                  Generate Class Link
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-gray-400 py-3 rounded-lg"
                  onClick={() => {
                    alert('📱 QR Code Generated!\\n\\nQR Code displayed for students to scan and join the class.');
                    setActiveModal(null);
                  }}
                >
                  <span className="material-symbols-outlined mr-2">qr_code_2</span>
                  Generate QR Code
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Students will join via WebRTC-based video hosting (like Google Meet)
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeModal === 'schedule' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Schedule Management</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Set Availability</h3>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <button
                        key={day}
                        className="p-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Time Slots</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['9:00 AM', '2:00 PM', '7:00 PM'].map((time) => (
                      <button
                        key={time}
                        className="p-3 text-sm bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-black hover:bg-gray-900 text-white"
                    onClick={() => {
                      alert('✅ Availability updated successfully!');
                      setActiveModal(null);
                    }}
                  >
                    Save Schedule
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setActiveModal(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeModal === 'earnings' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Earnings Summary</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-green-600">$2,450</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-blue-600">$15,750</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Transactions</h3>
                  <div className="space-y-3">
                    {[
                      { student: 'John Smith', amount: '$50', status: 'Completed', date: 'Today' },
                      { student: 'Sarah Johnson', amount: '$75', status: 'Completed', date: 'Yesterday' },
                      { student: 'Mike Davis', amount: '$60', status: 'Pending', date: '2 days ago' },
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{transaction.student}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{transaction.amount}</p>
                          <Badge className={
                            transaction.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      alert('💳 Payout requested successfully!');
                      setActiveModal(null);
                    }}
                  >
                    Request Payout
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setActiveModal(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
