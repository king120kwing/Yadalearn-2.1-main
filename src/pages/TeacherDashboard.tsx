import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockQuery, mockRootProps } from '@/data/mockData';
import { SessionStatus } from '@/types/enums';
import type { Student } from '@/types/schema';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
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
  const { user, isLoaded, userRole } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { topStudents, teacherSchedule } = mockQuery;
  const { teacherStats, studentProgress } = mockRootProps;

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
  if (!isReady) {
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

  // Calculate progress percentage
  const totalTasks = studentProgress.completedTasks + studentProgress.pendingTasks;
  const progressPercentage = Math.round((studentProgress.completedTasks / totalTasks) * 100);
  const strokeDasharray = `${progressPercentage}, 100`;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-24 safe-bottom">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-base text-subtext-light dark:text-subtext-dark mb-1">Welcome back, Teacher</p>
            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
              Hi, {currentUser?.firstName || (currentUser?.name ? currentUser.name.split(' ')[0] : 'Teacher')}
            </h1>
          </div>
          <div className="flex items-center -space-x-3">
            {topStudents.slice(0, 2).map((student, idx) => (
              <Avatar key={idx} className="w-10 h-10 border-2 border-background-light dark:border-background-dark">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-background-light dark:border-background-dark">
              <span className="text-sm font-semibold text-slate-600">+{topStudents.length - 2}</span>
            </div>
          </div>
        </header>

        {/* Progress Section */}
        <section className="mb-8">
          <div
            className="bg-gradient-to-br from-[var(--peach-start)] to-[var(--peach-end)] p-6 rounded-3xl shadow-soft text-[#A66041] relative overflow-hidden transition-transform duration-300 ease-out"
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
                <h2 className="text-xl font-bold">Progress</h2>
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
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{progressPercentage}%</span>
                  <span className="text-xs opacity-90">Completed</span>
                </div>
              </div>
              <div className="text-right space-y-4">
                <div>
                  <p className="text-base font-medium">Completed</p>
                  <p className="text-sm opacity-80">{studentProgress.completedTasks} tasks</p>
                </div>
                <div>
                  <p className="text-base font-medium">Pending</p>
                  <p className="text-sm opacity-80">{studentProgress.pendingTasks} tasks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            <div
              className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-5 rounded-3xl flex flex-col justify-between shadow-soft text-white h-32 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActiveModal('start-class')}
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>videocam</span>
              </div>
              <p className="text-base font-semibold">Start Class</p>
            </div>
            <div
              className="bg-gradient-to-br from-blue-400 to-blue-500 p-5 rounded-3xl flex flex-col justify-between shadow-soft text-white h-32 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActiveModal('create-session')}
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>calendar_add_on</span>
              </div>
              <p className="text-base font-semibold">Create Session</p>
            </div>
            <div
              className="bg-gradient-to-br from-purple-400 to-purple-500 p-5 rounded-3xl flex flex-col justify-between shadow-soft text-white h-32 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActiveModal('review-submissions')}
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>fact_check</span>
              </div>
              <p className="text-base font-semibold">Review</p>
            </div>
            <div
              className="bg-gradient-to-br from-orange-400 to-orange-500 p-5 rounded-3xl flex flex-col justify-between shadow-soft text-white h-32 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActiveModal('student-overview')}
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>groups</span>
              </div>
              <p className="text-base font-semibold">Students</p>
            </div>
            <div
              className="bg-gradient-to-br from-pink-400 to-pink-500 p-5 rounded-3xl flex flex-col justify-between shadow-soft text-white h-32 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActiveModal('announcement')}
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>campaign</span>
              </div>
              <p className="text-base font-semibold">Announce</p>
            </div>
            <div
              className="bg-gradient-to-br from-teal-400 to-teal-500 p-5 rounded-3xl flex flex-col justify-between shadow-soft text-white h-32 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActiveModal('upload-materials')}
            >
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>upload_file</span>
              </div>
              <p className="text-base font-semibold">Upload</p>
            </div>
          </div>
        </section>

        {/* Today's Schedule */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Today's Schedule</h2>
            <a className="text-sm font-medium text-indigo-500 dark:text-indigo-400" href="#">View All</a>
          </div>
          <div className="space-y-4">
            {teacherSchedule.slice(0, 2).map((session) => (
              <div key={session.id} className="bg-white dark:bg-zinc-800 p-4 rounded-3xl flex items-center justify-between shadow-soft">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`w-14 h-14 ${session.status === SessionStatus.CONFIRMED ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-blue-100 dark:bg-blue-900/40'} rounded-2xl flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-3xl ${session.status === SessionStatus.CONFIRMED ? 'text-indigo-500 dark:text-indigo-400' : 'text-blue-500 dark:text-blue-400'}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>
                        campaign
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${session.status === SessionStatus.CONFIRMED ? 'bg-green-400' : 'bg-orange-400'} rounded-full border-2 border-white dark:border-zinc-800 flex items-center justify-center shadow-sm`}>
                      <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'wght' 700" }}>
                        {session.status === SessionStatus.CONFIRMED ? 'done' : 'priority_high'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-base text-text-light dark:text-text-dark">{session.title}</p>
                    <p className="text-sm text-subtext-light dark:text-subtext-dark">{session.time}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-subtext-light dark:text-subtext-dark cursor-pointer">more_vert</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
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
