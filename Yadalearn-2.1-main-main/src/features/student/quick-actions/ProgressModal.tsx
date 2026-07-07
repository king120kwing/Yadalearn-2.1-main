import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProgressModal = ({ isOpen, onClose }: ProgressModalProps) => {
    const { user } = useAuth();
    const userId = user?.id;
    const userName = user?.name || 'Student';

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        gpa: 4.0,
        attendance: 100,
        completedTasks: 0,
        totalTasks: 0
    });
    const [coursesProgress, setCoursesProgress] = useState<any[]>([]);
    const [studyFocusData, setStudyFocusData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]); // M, T, W, T, F, S, S

    useEffect(() => {
        if (isOpen && userId) {
            fetchProgressData();
        }
    }, [isOpen, userId]);

    const fetchProgressData = async () => {
        try {
            setLoading(true);

            // 1. Fetch bookings to compute attendance & study hours
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*')
                .eq('student_id', userId);

            // 2. Fetch enrollments & course assignments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select(`
                    course_id,
                    course:courses (
                        id,
                        title,
                        assignments (
                            id,
                            title,
                            due_date
                        )
                    )
                `)
                .eq('student_id', userId);

            // 3. Fetch submissions to calculate GPA and completed tasks
            const { data: submissions } = await supabase
                .from('submissions')
                .select('*')
                .eq('student_id', userId);

            // 4. Calculate GPA
            let totalGradePoints = 0;
            let gradedCount = 0;
            submissions?.forEach((s: any) => {
                if (s.grade) {
                    const gradeVal = String(s.grade).trim().toUpperCase();
                    let points = 4.0;
                    if (gradeVal.startsWith('A')) points = 4.0;
                    else if (gradeVal.startsWith('B')) points = 3.0;
                    else if (gradeVal.startsWith('C')) points = 2.0;
                    else if (gradeVal.startsWith('D')) points = 1.0;
                    else if (gradeVal.startsWith('F')) points = 0.0;
                    else {
                        const numeric = parseFloat(gradeVal);
                        if (!isNaN(numeric)) {
                            if (numeric > 4) points = (numeric / 100) * 4;
                            else points = numeric;
                        }
                    }
                    totalGradePoints += points;
                    gradedCount++;
                }
            });
            const computedGpa = gradedCount > 0 ? parseFloat((totalGradePoints / gradedCount).toFixed(2)) : 4.0;

            // 5. Calculate Tasks
            const totalTasks = enrollments?.reduce((acc: number, curr: any) => {
                return acc + (curr.course?.assignments?.length || 0);
            }, 0) || 0;
            const completedTasks = submissions?.length || 0;

            // 6. Calculate Attendance
            const pastBookings = bookings?.filter((b: any) => {
                const bookingTime = new Date(`${b.date}T${b.time.replace(/ AM| PM/g, '')}`);
                return bookingTime < new Date() && b.status === 'confirmed';
            }) || [];
            const attendedCount = pastBookings.length;
            const computedAttendance = bookings && bookings.length > 0 
                ? Math.round((attendedCount / bookings.length) * 100)
                : 100;

            setStats({
                gpa: computedGpa,
                attendance: computedAttendance,
                completedTasks,
                totalTasks
            });

            // 7. Calculate Study Focus (daily booking count or duration)
            const days = [0, 0, 0, 0, 0, 0, 0]; // M, T, W, T, F, S, S
            bookings?.forEach((b: any) => {
                const dateObj = new Date(b.date);
                let dayIndex = dateObj.getDay() - 1; // getDay: 0 = Sun, 1 = Mon ...
                if (dayIndex < 0) dayIndex = 6; // Sunday index is 6
                days[dayIndex] += 1.5; // assume 1.5 hours per class
            });
            setStudyFocusData(days);

            // 8. Calculate Courses progress
            const courseProgressList = enrollments?.map((e: any) => {
                const assignments = e.course?.assignments || [];
                const courseSubmissions = submissions?.filter((s: any) => 
                    assignments.some((a: any) => a.id === s.assignment_id)
                ) || [];
                
                let scoreSum = 0;
                let scoredCount = 0;
                courseSubmissions.forEach((s: any) => {
                    if (s.grade) {
                        const gradeVal = String(s.grade).trim().toUpperCase();
                        let pct = 100;
                        if (gradeVal === 'A' || gradeVal === 'A+') pct = 98;
                        else if (gradeVal === 'A-') pct = 92;
                        else if (gradeVal === 'B+') pct = 88;
                        else if (gradeVal === 'B') pct = 85;
                        else if (gradeVal === 'B-') pct = 80;
                        else if (gradeVal === 'C+') pct = 77;
                        else if (gradeVal === 'C') pct = 73;
                        else if (gradeVal === 'D') pct = 65;
                        else if (gradeVal === 'F') pct = 50;
                        else {
                            const numeric = parseFloat(gradeVal);
                            if (!isNaN(numeric)) {
                                if (numeric <= 4) pct = (numeric / 4) * 100;
                                else pct = numeric;
                            }
                        }
                        scoreSum += pct;
                        scoredCount++;
                    }
                });

                const averageScore = scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 100;

                return {
                    id: e.course?.id || e.course_id,
                    title: e.course?.title || 'General Course',
                    score: averageScore,
                    teacher: 'Class Instructor'
                };
            }) || [];

            setCoursesProgress(courseProgressList);
        } catch (err) {
            console.error('Error fetching progress:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-background-light dark:bg-student-bg-dark text-gray-900 dark:text-white border-0 p-0 overflow-hidden h-screen max-h-screen flex flex-col">
                <DialogTitle className="sr-only">Progress Overview</DialogTitle>
                <DialogDescription className="sr-only">View your academic health check, grades overview, and studying progress stats.</DialogDescription>
                
                {/* Top App Bar */}
                <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-student-bg-dark/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            {user?.imageUrl ? (
                                <img 
                                    src={user.imageUrl} 
                                    alt={userName} 
                                    className="rounded-full size-10 object-cover border-2 border-student-primary" 
                                />
                            ) : (
                                <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-full size-10 border-2 border-student-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm text-white">person</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 size-3 bg-student-primary rounded-full border-2 border-student-bg-dark"></div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Welcome back,</p>
                            <h2 className="text-sm font-bold leading-tight">{userName}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-700 dark:text-white">close</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="px-4 pt-6 flex-1 overflow-y-auto pb-8">
                    {/* Headline */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">Progress Check</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here is your academic health overview.</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-white dark:bg-student-surface-dark rounded-xl p-3 flex flex-col gap-1 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-student-primary text-[20px]">school</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">GPA</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold leading-none">{stats.gpa}</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-student-surface-dark rounded-xl p-3 flex flex-col gap-1 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-student-primary text-[20px]">calendar_today</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attend</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold leading-none">{stats.attendance}%</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-student-surface-dark rounded-xl p-3 flex flex-col gap-1 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-student-primary text-[20px]">assignment</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tasks</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-bold leading-none">{stats.completedTasks}<span className="text-sm text-gray-500">/{stats.totalTasks}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="mb-8">
                        <div className="relative overflow-hidden bg-gradient-to-br from-student-surface-dark to-student-bg-dark border border-student-primary/20 rounded-2xl p-5 shadow-lg">
                            <div className="absolute -right-4 -top-4 size-24 bg-student-primary/10 rounded-full blur-xl"></div>
                            <div className="relative z-10 flex gap-4">
                                <div className="shrink-0 size-10 rounded-full bg-student-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-student-primary">auto_awesome</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-student-primary font-bold text-base mb-1">AI Insight</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {stats.totalTasks - stats.completedTasks > 0 
                                            ? `You have ${stats.totalTasks - stats.completedTasks} pending assignments. Keep up the dedication and complete them to raise your GPA!`
                                            : "Excellent progress! You have completed all course assignments. Keep up the amazing work to maintain your grade."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Study Focus Chart */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-bold">Study Focus</h3>
                            <span className="text-xs font-medium text-student-primary bg-student-primary/10 px-2 py-1 rounded">
                                {studyFocusData.reduce((a, b) => a + b, 0)}h this week
                            </span>
                        </div>
                        <div className="bg-white dark:bg-student-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="grid grid-cols-7 gap-2 h-32 items-end">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                    const value = studyFocusData[idx];
                                    const maxVal = Math.max(...studyFocusData, 1);
                                    const percentage = (value / maxVal) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                                            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                                <div 
                                                    className="w-full bg-student-primary/50 group-hover:bg-student-primary transition-all duration-300" 
                                                    style={{ height: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Subjects & Skills */}
                    <div className="mb-4 flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold">Subjects & Skills</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        {coursesProgress.length > 0 ? (
                            coursesProgress.map((course: any) => (
                                <div key={course.id} className="bg-white dark:bg-student-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="size-2 rounded-full bg-indigo-400"></div>
                                                <h4 className="font-bold text-lg">{course.title}</h4>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{course.teacher}</p>
                                        </div>
                                        <div className="relative size-14 flex items-center justify-center">
                                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-gray-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                                                <path className="text-student-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${course.score}, 100`} strokeLinecap="round" strokeWidth="3.5"></path>
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-xs font-bold text-student-primary">{course.score}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-zinc-500">
                                <span className="material-symbols-outlined text-4xl mb-2">school</span>
                                <p className="text-sm">Enroll in courses to view progress tracking.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
