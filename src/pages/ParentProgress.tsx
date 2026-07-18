import React, { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageTeacherModal } from '@/features/student/quick-actions/MessageTeacherModal';
import { ChevronLeft } from 'lucide-react';

const ParentProgress = () => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState('1');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Mock data for UI presentation
  const children = [
    { id: '1', name: 'Demo Child', grade: 'Grade 10' }
  ];

  const schedule = [
    { id: 1, subject: 'Mathematics', teacher: 'Sarah Johnson', teacherId: 't1', time: '10:00 AM', day: 'Today', progress: 75 },
    { id: 2, subject: 'Physics', teacher: 'Michael Chen', teacherId: 't2', time: '2:00 PM', day: 'Today', progress: 60 }
  ];

  const handleMessageTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setIsMessageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header section */}
      <div className="bg-white p-6 pt-12 pb-6 shadow-sm flex items-center sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate('/parent-dashboard')} className="mr-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-10 w-10">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Child's Progress</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {children.map(child => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className={`rounded-full px-6 ${selectedChild === child.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                onClick={() => setSelectedChild(child.id)}
              >
                {child.name}
              </Button>
            ))}
          </div>
        )}

        {/* Overall Progress Chart (Mock UI) */}
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Overall Academic Progress</h3>
            <div className="h-48 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-2xl border border-gray-100 flex items-end justify-between p-4 px-6 relative overflow-hidden">
              {/* Mock Bar Chart */}
              <div className="w-10 bg-blue-200 rounded-t-lg h-[40%]"></div>
              <div className="w-10 bg-blue-300 rounded-t-lg h-[60%]"></div>
              <div className="w-10 bg-blue-400 rounded-t-lg h-[50%]"></div>
              <div className="w-10 bg-blue-500 rounded-t-lg h-[80%] relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded">
                  80%
                </div>
              </div>
              <div className="w-10 bg-blue-300 rounded-t-lg h-[70%]"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-medium mt-2 px-6">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Teachers */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="material-symbols-outlined mr-2 text-indigo-500">calendar_month</span>
            Upcoming Classes
          </h2>
          <div className="space-y-4">
            {schedule.map(item => (
              <Card key={item.id} className="border-0 shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-600">
                    <span className="text-xs font-bold uppercase">{item.day.slice(0,3)}</span>
                    <span className="text-lg font-black">{item.time.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.subject}</h4>
                    <p className="text-sm text-gray-500 truncate flex items-center">
                      <span className="material-symbols-outlined text-[16px] mr-1">person</span>
                      {item.teacher}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 shrink-0"
                    onClick={() => handleMessageTeacher(item.teacherId)}
                  >
                    <span className="material-symbols-outlined">chat</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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
