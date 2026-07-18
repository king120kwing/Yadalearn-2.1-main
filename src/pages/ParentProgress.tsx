import React, { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageTeacherModal } from '@/features/student/quick-actions/MessageTeacherModal';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, addDays, isSameDay } from 'date-fns';

const ParentProgress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([0, 0, 0, 0, 0]);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    async function fetchChildren() {
      if (!user?.id) return;
      const { data: links } = await supabase
        .from('parent_student_links')
        .select(`
          student_id,
          student:profiles!parent_student_links_student_id_fkey(
            id, full_name, avatar_url,
            student_profiles(grade_level)
          )
        `)
        .eq('parent_id', user.id);

      if (links && links.length > 0) {
        const mapped = links.map((link: any) => ({
          id: link.student.id,
          name: link.student.full_name,
          grade: link.student.student_profiles?.[0]?.grade_level || 'General',
          avatar: link.student.avatar_url
        }));
        setChildrenData(mapped);
        setSelectedChild(mapped[0].id);
      }
    }
    fetchChildren();
  }, [user]);

  useEffect(() => {
    async function fetchChildData() {
      if (!selectedChild) return;
      
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id, subject, date, time, status, rating, teacher_id,
          teacher:profiles!bookings_teacher_id_fkey(full_name)
        `)
        .eq('student_id', selectedChild);

      if (bookings) {
        // Calculate upcoming
        const now = new Date();
        const upcoming = bookings
          .filter(b => b.status === 'confirmed')
          .map(b => {
            const [year, month, day] = b.date.split('-').map(Number);
            const match = b.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            let hours = 0; let minutes = 0;
            if (match) {
              hours = Number(match[1]);
              minutes = Number(match[2]);
              const ampm = match[3].toUpperCase();
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
            }
            const dateObj = new Date(year, month - 1, day, hours, minutes);
            return {
              ...b,
              dateObj,
              dayLabel: dateObj.toDateString() === now.toDateString() ? 'Today' : b.date,
              teacherName: b.teacher?.full_name || 'Teacher'
            };
          })
          .filter(b => b.dateObj >= now)
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
          .slice(0, 5);

        setScheduleData(upcoming);

        // Calculate progress (Mon-Fri completion rate based on past classes)
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));
        
        let completedCount = 0;
        let totalCount = 0;
        
        const dailyHeights = weekDays.map(day => {
          const dayBookings = bookings.filter(b => b.date === day.toISOString().split('T')[0]);
          if (dayBookings.length === 0) return 20; // baseline height
          
          totalCount += dayBookings.length;
          const completed = dayBookings.filter(b => b.status === 'completed' || b.rating !== null).length;
          completedCount += completed;
          
          return 20 + Math.min(80, (completed / dayBookings.length) * 80);
        });
        
        setWeeklyProgress(dailyHeights);
        setOverallPercentage(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
      }
    }
    
    fetchChildData();
  }, [selectedChild]);

  const handleMessageTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setIsMessageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-6 pt-12 pb-6 shadow-sm flex items-center sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate('/parent-dashboard')} className="mr-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-10 w-10">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Child's Progress</h1>
      </div>

      <div className="p-6 space-y-6">
        {childrenData.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {childrenData.map(child => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className={`rounded-full px-6 transition-colors ${selectedChild === child.id ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'border-gray-200'}`}
                onClick={() => setSelectedChild(child.id)}
              >
                {child.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            No children linked yet. Please scan a QR code from the dashboard.
          </div>
        )}

        {selectedChild && (
          <>
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Overall Academic Progress</h3>
                <div className="h-48 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-2xl border border-gray-100 flex items-end justify-between p-4 px-6 relative overflow-hidden">
                  {weeklyProgress.map((height, i) => (
                    <div key={i} className="w-10 bg-blue-300 rounded-t-lg transition-all duration-1000 ease-out relative" style={{ height: `${height}%` }}>
                      {i === 3 && overallPercentage > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap">
                          {overallPercentage}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium mt-2 px-6">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                </div>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="material-symbols-outlined mr-2 text-indigo-500">calendar_month</span>
                Upcoming Classes
              </h2>
              {scheduleData.length > 0 ? (
                <div className="space-y-4">
                  {scheduleData.map(item => (
                    <Card key={item.id} className="border-0 shadow-sm rounded-3xl overflow-hidden">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-600">
                          <span className="text-xs font-bold uppercase">{item.dayLabel.slice(0,3)}</span>
                          <span className="text-[10px] font-black">{item.time.split(' ')[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{item.subject}</h4>
                          <p className="text-sm text-gray-500 truncate flex items-center">
                            <span className="material-symbols-outlined text-[16px] mr-1">person</span>
                            {item.teacherName}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 shrink-0"
                          onClick={() => handleMessageTeacher(item.teacher_id)}
                        >
                          <span className="material-symbols-outlined">chat</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-3xl shadow-sm">
                  No upcoming classes scheduled.
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNav />
      {isMessageModalOpen && selectedTeacherId && (
        <MessageTeacherModal 
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setSelectedTeacherId(null);
          }}
          teacherId={selectedTeacherId}
        />
      )}
    </div>
  );
};

export default ParentProgress;
