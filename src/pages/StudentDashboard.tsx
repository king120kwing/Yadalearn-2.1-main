import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // use custom AuthContext hook
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { topTeachers, upcomingClasses, loading } = useDashboardData();

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-24 safe-bottom">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-base text-subtext-light dark:text-subtext-dark mb-1">Welcome back, Student</p>
            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
              Hi, {userName}
            </h1>
          </div>
          <div className="flex items-center -space-x-3">
            {topTeachers.slice(0, 2).map((teacher, idx) => (
              <Avatar key={idx} className="w-10 h-10 border-2 border-background-light dark:border-background-dark">
                <AvatarImage src={teacher.avatar} alt={teacher.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                  {teacher.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {topTeachers.length > 2 && (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-background-light dark:border-background-dark">
                <span className="text-sm font-semibold text-slate-600">+{topTeachers.length - 2}</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic CTA: Join Next Class */}
        {showJoinCTA && nextClass && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-between relative overflow-hidden">
              {/* Glossy overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium animate-pulse">Starting Soon</span>
                  <span className="text-sm opacity-90">{timeRemainingStr}</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">{nextClass.title}</h2>
                <p className="text-indigo-100 flex items-center gap-2 text-sm">
                  Scheduled for {nextClass.day}
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => setActiveModal('join-class')}
                className="relative z-10 bg-white text-indigo-700 hover:bg-gray-100 font-bold shadow-md h-12 px-6 rounded-xl"
              >
                <span className="material-symbols-outlined mr-2">videocam</span>
                Join Now
              </Button>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <section className="mb-8">
          <div
            className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-3xl shadow-soft text-[#5B4A9F] relative overflow-hidden transition-transform duration-300 ease-out"
            style={{ transformStyle: 'preserve-3d' }}
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = ((y - centerY) / centerY) * -10;
              const rotateY = ((x - centerX) / centerX) * 10;
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            }}
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-4 -left-12 w-28 h-28 bg-white/10 rounded-full"></div>
            <div className="flex justify-between items-start mb-4 z-10 relative">
              <div>
                <h2 className="text-xl font-bold">Your Progress</h2>
                <p className="text-sm opacity-80">This Month</p>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-white/40 rounded-full">
                <span className="material-symbols-outlined text-lg">more_horiz</span>
              </button>
            </div>
            <div className="flex items-center justify-between z-10 relative">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <path
                    className="text-white/30"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-white"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="0, 100"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">0%</span>
                  <span className="text-xs opacity-90">Completed</span>
                </div>
              </div>
              <div className="text-right space-y-4">
                <div>
                  <p className="text-base font-medium">Completed</p>
                  <p className="text-sm opacity-80">0 tasks</p>
                </div>
                <div>
                  <p className="text-base font-medium">Pending</p>
                  <p className="text-sm opacity-80">0 tasks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 sm:gap-4">
            <div
              className="bg-white dark:bg-gray-800/40 p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => setActiveModal('progress')}
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">monitoring</span>
              </div>
              <p className="text-xs font-medium text-center text-text-light dark:text-text-dark">Progress</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800/40 p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => setActiveModal('book-class')}
            >
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">event</span>
              </div>
              <p className="text-xs font-medium text-center text-text-light dark:text-text-dark">Book Class</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800/40 p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => setActiveModal('assignments')}
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 dark:text-green-400">assignment</span>
              </div>
              <p className="text-xs font-medium text-center text-text-light dark:text-text-dark">Assignments</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800/40 p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => setActiveModal('message')}
            >
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/40 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-pink-500 dark:text-pink-400">mail</span>
              </div>
              <p className="text-xs font-medium text-center text-text-light dark:text-text-dark">Message</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800/40 p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => setActiveModal('join-class')}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-500 dark:text-purple-400">videocam</span>
              </div>
              <p className="text-xs font-medium text-center text-text-light dark:text-text-dark">Join Class</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800/40 p-4 rounded-3xl shadow-soft flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
              onClick={() => setActiveModal('ai-buddy')}
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-500 dark:text-orange-400">psychology</span>
              </div>
              <p className="text-xs font-medium text-center text-text-light dark:text-text-dark">AI Buddy</p>
            </div>
          </div>
        </section>

        {/* Upcoming Classes */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Upcoming Classes</h2>
            <a className="text-sm font-medium text-indigo-500 dark:text-indigo-400" href="#">View All</a>
          </div>
          <div className="space-y-4">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.slice(0, 2).map((classItem, idx) => (
                <div key={classItem.id} className="bg-white dark:bg-zinc-800 px-5 py-6 rounded-4xl flex items-center justify-between shadow-soft-float">
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
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm font-medium">
                No upcoming classes scheduled.
              </div>
            )}
          </div>
        </section>
      </div>

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
    </div>
  );
};

export default StudentDashboard;
