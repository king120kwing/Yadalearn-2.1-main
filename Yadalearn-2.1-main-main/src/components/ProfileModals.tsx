import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Teacher, Student } from '@/types/schema';
import { formatPriceRange, formatRating, formatPercentage } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherProfileModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherProfileModal = ({ teacher, isOpen, onClose }: TeacherProfileModalProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setShowDetails(false); } }}>
      <DialogContent className="!max-w-sm mx-auto p-0 border-0 bg-transparent shadow-none overflow-visible flex flex-col items-center justify-center">
        {/* WhatsApp-style floating square card preview container */}
        <div className="w-72 relative flex flex-col items-center bg-white/20 dark:bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300">
          
          {/* Large Teacher Image with transparent/refraction styling */}
          <div className="w-full h-72 relative bg-zinc-950 flex items-center justify-center overflow-hidden">
            {teacher.avatar ? (
              <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-5xl font-extrabold font-serif">
                {teacher.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            
            {/* Soft overlay gradient */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            
            {/* Teacher Name Overlay */}
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <h3 className="text-xl font-bold font-serif leading-tight">{teacher.name}</h3>
              <p className="text-xs text-white/70 mt-0.5">{teacher.profession || 'Educator'}</p>
            </div>
          </div>

          {/* Quick Action Bar (WhatsApp Style) */}
          <div className="w-full bg-white/90 dark:bg-zinc-900/90 py-3.5 px-6 flex justify-around items-center border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => alert(`Starting chat with ${teacher.name}`)}
              className="text-purple-600 hover:scale-110 active:scale-95 transition-transform size-10 rounded-full flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/20"
              title="Message"
            >
              <span className="material-symbols-outlined text-2xl">mail</span>
            </button>
            <button 
              onClick={() => alert(`Booking session with ${teacher.name}`)}
              className="text-purple-600 hover:scale-110 active:scale-95 transition-transform size-10 rounded-full flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/20"
              title="Book Session"
            >
              <span className="material-symbols-outlined text-2xl">calendar_today</span>
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`text-purple-600 hover:scale-110 active:scale-95 transition-transform size-10 rounded-full flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950/20 ${showDetails ? 'rotate-180 bg-purple-50 dark:bg-purple-950/20' : ''}`}
              title="Toggle Info"
            >
              <span className="material-symbols-outlined text-2xl">expand_more</span>
            </button>
          </div>
        </div>

        {/* Dropdown details card */}
        {showDetails && (
          <div className="w-72 mt-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl border border-white/20 p-5 shadow-xl space-y-4 text-left transition-all duration-300 animate-in slide-in-from-top-4 max-h-[40vh] overflow-y-auto no-scrollbar">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-zinc-500 mb-1">Teacher Bio</p>
              <p className="text-xs text-gray-600 dark:text-zinc-350 leading-relaxed font-semibold">{teacher.bio}</p>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-455 dark:text-zinc-500 mb-1">Rating & Experience</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-0.5">⭐ {formatRating(teacher.rating)}</span>
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{teacher.yearsExperience} yrs Experience</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-zinc-500 mb-1">Subjects</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(teacher.subjects || []).map((subj) => (
                  <Badge key={subj} className="bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 border-none font-bold text-[9px] hover:bg-purple-200">
                    {subj}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-455 dark:text-zinc-500 mb-1">Hourly Rate</p>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {formatPriceRange(teacher.rateMin, teacher.rateMax)}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal = ({ student, isOpen, onClose }: StudentProfileModalProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const [stats, setStats] = useState({
    sessionsCompleted: 0,
    assignmentsCompleted: 0,
    totalAssignments: 0,
    gradePercent: null as number | null,
    activeStatus: 'Active Student',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student || !isOpen) return;

    async function fetchStudentStats() {
      setLoading(true);
      try {
        // 1. Fetch bookings count
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, date, time')
          .eq('student_id', student.id)
          .eq('status', 'confirmed');

        const now = new Date();
        const parseBookingDateTime = (dateStr: string, timeStr: string) => {
          try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            let hours = 0;
            let minutes = 0;
            if (match) {
              hours = Number(match[1]);
              minutes = Number(match[2]);
              const ampm = match[3].toUpperCase();
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
            }
            return new Date(year, month - 1, day, hours, minutes);
          } catch (e) {
            return new Date(0);
          }
        };

        const completedBookings = bookings?.filter(b => {
          const classTime = parseBookingDateTime(b.date, b.time);
          return classTime < now;
        }) || [];

        // 2. Fetch course enrollments & course assignments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            course:courses (
              title,
              assignments (
                id
              )
            )
          `)
          .eq('student_id', student.id);

        let totalAssignments = 0;
        let activeStatus = 'Active Student';
        const courseTitles: string[] = [];

        enrollments?.forEach((e: any) => {
          if (e.course) {
            if (e.course.title) courseTitles.push(e.course.title);
            if (e.course.assignments) {
              totalAssignments += e.course.assignments.length;
            }
          }
        });

        if (courseTitles.length > 0) {
          activeStatus = `Active • ${courseTitles.join(', ')}`;
        } else if (student.learningSubjects && student.learningSubjects.length > 0) {
          activeStatus = `Active • ${student.learningSubjects.join(', ')}`;
        }

        // 3. Fetch submissions
        const { data: submissions } = await supabase
          .from('submissions')
          .select('grade, status')
          .eq('student_id', student.id);

        const assignmentsCompleted = submissions?.length || 0;

        const gradedSubs = submissions?.filter(s => s.status === 'graded' && s.grade !== null) || [];
        const gradePercent = gradedSubs.length > 0
          ? Math.round(gradedSubs.reduce((sum, s) => sum + Number(s.grade), 0) / gradedSubs.length)
          : null;

        setStats({
          sessionsCompleted: completedBookings.length,
          assignmentsCompleted,
          totalAssignments,
          gradePercent,
          activeStatus,
        });
      } catch (err) {
        console.error("Error loading student stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentStats();
  }, [student, isOpen]);

  if (!student) return null;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to end the contract and delete ${student.name}? All bookings will be deleted.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('student_id', student.id)
        .eq('teacher_id', userId);

      if (error) {
        console.error("Error deleting student contract:", error);
        alert("Failed to delete student contract.");
      } else {
        alert("Student contract terminated successfully.");
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Unexpected error ending contract:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setShowDetails(false); } }}>
      <DialogContent className="!max-w-sm mx-auto p-0 border-0 bg-transparent shadow-none overflow-visible flex flex-col items-center justify-center">
        {/* WhatsApp-style floating square card preview container */}
        <div className="w-72 relative flex flex-col items-center bg-white/20 dark:bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300">
          
          {/* Large Student Image with transparent/refraction styling */}
          <div className="w-full h-72 relative bg-zinc-950 flex items-center justify-center overflow-hidden">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-5xl font-extrabold font-serif">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            
            {/* Soft overlay gradient */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            
            {/* Student Name Overlay */}
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <h3 className="text-xl font-bold font-serif leading-tight">{student.name}</h3>
              <p className="text-xs text-white/70 mt-0.5">{student.country || 'Active Student'}</p>
            </div>
          </div>

          {/* Quick Action Bar (WhatsApp Style) */}
          <div className="w-full bg-white/90 dark:bg-zinc-900/90 py-3.5 px-6 flex justify-around items-center border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => alert(`Starting chat with ${student.name}`)}
              className="text-orange-500 hover:scale-110 active:scale-95 transition-transform size-10 rounded-full flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/20"
              title="Message"
            >
              <span className="material-symbols-outlined text-2xl">mail</span>
            </button>
            <button 
              onClick={() => alert(`Scheduling session with ${student.name}`)}
              className="text-orange-500 hover:scale-110 active:scale-95 transition-transform size-10 rounded-full flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/20"
              title="Schedule"
            >
              <span className="material-symbols-outlined text-2xl">calendar_today</span>
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`text-orange-500 hover:scale-110 active:scale-95 transition-transform size-10 rounded-full flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/20 ${showDetails ? 'rotate-180 bg-orange-50 dark:bg-orange-950/20' : ''}`}
              title="Toggle Info"
            >
              <span className="material-symbols-outlined text-2xl">expand_more</span>
            </button>
          </div>
        </div>

        {/* Dropdown details card */}
        {showDetails && (
          <div className="w-72 mt-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl border border-white/20 p-5 shadow-xl space-y-4 text-left transition-all duration-300 animate-in slide-in-from-top-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-zinc-500 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                  {stats.activeStatus}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-zinc-500 mb-1">Subjects & Grades</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {(student.learningSubjects || ['English Subjects']).map((subject) => (
                  <Badge key={subject} className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none font-bold text-[10px] hover:bg-orange-550/20">
                    {subject}
                  </Badge>
                ))}
                {stats.gradePercent !== null ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 ml-1">
                    Grade: {stats.gradePercent}%
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 ml-1">
                    Grade: Ungraded
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/50 dark:bg-zinc-800/40 rounded-xl p-3 text-center border border-gray-100 dark:border-zinc-800">
                <p className="text-lg font-extrabold text-gray-800 dark:text-white">
                  {stats.sessionsCompleted}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase">Completed</p>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-800/40 rounded-xl p-3 text-center border border-gray-100 dark:border-zinc-800">
                <p className="text-lg font-extrabold text-gray-800 dark:text-white">
                  {stats.assignmentsCompleted}/{stats.totalAssignments}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase">Assignments</p>
              </div>
            </div>

            {/* Remove student contract */}
            <Button 
              onClick={handleDelete}
              className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md shadow-red-200 dark:shadow-red-950/20"
            >
              End Contract (Remove Student)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};