import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useTeacherDashboardData() {
    const { user, isLoaded } = useAuth();
    const userId = user?.id;

    const [teacherSchedule, setTeacherSchedule] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('yadalearn-cached-teacher-schedule');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [topStudents, setTopStudents] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('yadalearn-cached-teacher-students');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [stats, setStats] = useState(() => {
        const defaultStats = {
            earnings: 0,
            totalStudents: 0,
            upcomingClasses: 0,
            activeCourses: 0,
            completedTasks: 0,
            pendingTasks: 0,
            avgRating: 0
        };
        try {
            const cached = localStorage.getItem('yadalearn-cached-teacher-stats');
            return cached ? JSON.parse(cached) : defaultStats;
        } catch (e) {
            return defaultStats;
        }
    });
    const [pendingBookings, setPendingBookings] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('yadalearn-cached-teacher-pending-bookings');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        if (!userId) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch the teacher's subjects from profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subjects')
                    .eq('id', userId)
                    .single();
                const teacherSubjects = profile?.subjects || [];

                // Auto-seed courses if none exist for this teacher
                const { data: courses } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('teacher_id', userId);

                if (!courses || courses.length === 0) {
                    console.log('No courses found. Seeding default courses for teacher:', userId);
                    const coursesData = teacherSubjects.map((subject: string) => ({
                        title: `Intro to ${subject}`,
                        description: `Foundational concepts in ${subject}.`,
                        teacher_id: userId,
                        schedule: 'Mon, Wed 09:00 AM',
                        image_url: ''
                    }));
                    
                    if (coursesData.length === 0) {
                        coursesData.push({
                            title: 'General Studies',
                            description: 'Foundational concepts and interactive learning.',
                            teacher_id: userId,
                            schedule: 'Mon, Wed 09:00 AM',
                            image_url: ''
                        });
                    }
                    await supabase.from('courses').insert(coursesData);
                }

                // 1. Fetch linked students
                const { data: links, error: linksError } = await supabase
                    .from('teacher_student_links')
                    .select('*, student:profiles!teacher_student_links_student_id_fkey(*)')
                    .eq('teacher_id', userId)
                    .eq('status', 'accepted');

                if (linksError) throw linksError;

                // 2. Fetch bookings for this teacher to include booking students
                const { data: teacherBookings } = await supabase
                    .from('bookings')
                    .select('student:profiles!bookings_student_id_fkey(*)')
                    .eq('teacher_id', userId);

                const studentMap = new Map<string, any>();
                
                // Add linked students
                if (links) {
                    links.forEach((link: any) => {
                        if (link.student) {
                            studentMap.set(link.student.id, link.student);
                        }
                    });
                }
                
                // Add booking students
                if (teacherBookings) {
                    teacherBookings.forEach((b: any) => {
                        if (b.student) {
                            studentMap.set(b.student.id, b.student);
                        }
                    });
                }

                const studentsList = Array.from(studentMap.values()).map((student: any) => {
                    return {
                        id: student.id,
                        name: student.full_name || 'Unknown Student',
                        avatar: student.avatar_url || `https://i.pravatar.cc/150?u=${student.id}`,
                        country: student.country || 'Global',
                        learningSubjects: student.subjects || [],
                        sessionsCompleted: 1,
                        lastActive: student.is_online ? 'Active now' : 'Offline',
                        status: 'active'
                    };
                });
                setTopStudents(studentsList);
                localStorage.setItem('yadalearn-cached-teacher-students', JSON.stringify(studentsList));

                // 2. Fetch pending bookings from student bookings table
                const { data: bookings, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*, student:profiles!bookings_student_id_fkey(*)')
                    .eq('teacher_id', userId)
                    .eq('status', 'pending');

                if (bookingsError) throw bookingsError;
                const pendingBookingsList = bookings || [];
                setPendingBookings(pendingBookingsList);
                localStorage.setItem('yadalearn-cached-teacher-pending-bookings', JSON.stringify(pendingBookingsList));

                // 3. Fetch scheduled live classes for teacher's schedule
                const { data: classes, error: classesError } = await supabase
                    .from('live_classes')
                    .select('*')
                    .eq('teacher_id', userId)
                    .order('scheduled_at', { ascending: true });

                if (classesError) throw classesError;

                const dbClasses = classes || [];
                const formattedSchedule = dbClasses.map((b: any) => {
                    const dateObj = new Date(b.scheduled_at);
                    const yyyy = dateObj.getFullYear();
                    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const dd = String(dateObj.getDate()).padStart(2, '0');
                    const dateStr = `${yyyy}-${mm}-${dd}`;

                    let hours = dateObj.getHours();
                    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

                    return {
                        id: b.id,
                        title: b.title,
                        subject: b.subject,
                        date: dateStr,
                        time: timeStr,
                        status: b.status
                    };
                });
                setTeacherSchedule(formattedSchedule);
                localStorage.setItem('yadalearn-cached-teacher-schedule', JSON.stringify(formattedSchedule));

                // 4. Session-Based Ratings with daily reset
                // Fetch all ratings for profile calculation
                const { data: allRatings, error: ratingsError } = await supabase
                    .from('session_ratings')
                    .select('rating')
                    .eq('rated_id', userId)
                    .eq('rated_as', 'teacher');

                if (ratingsError) {
                    console.error('Error fetching all ratings:', ratingsError);
                }

                let allTimeAvg = 0;
                if (allRatings && allRatings.length > 0) {
                    const sum = allRatings.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0);
                    allTimeAvg = Math.round((sum / allRatings.length) * 10) / 10;
                }

                // Update teacher_profiles with the average rating
                await supabase
                    .from('teacher_profiles')
                    .update({ rating: allTimeAvg })
                    .eq('id', userId);

                // Fetch today's ratings for the teacher dashboard daily display
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const { data: todayRatings } = await supabase
                    .from('session_ratings')
                    .select('rating')
                    .eq('rated_id', userId)
                    .eq('rated_as', 'teacher')
                    .gte('created_at', todayStart.toISOString());

                let dailyAvg = 0;
                if (todayRatings && todayRatings.length > 0) {
                    const sum = todayRatings.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0);
                    dailyAvg = Math.round((sum / todayRatings.length) * 10) / 10;
                }

                // 5. Fetch actual courses count
                const { data: teacherCourses, error: coursesError } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('teacher_id', userId);

                if (coursesError) {
                    console.error('Error fetching courses count:', coursesError);
                }
                const activeCoursesCount = teacherCourses ? teacherCourses.length : 0;

                // Query all assignments and count submissions
                let completedTasksCount = 0;
                let pendingTasksCount = 0;

                if (teacherCourses && teacherCourses.length > 0) {
                    const courseIds = teacherCourses.map(c => c.id);
                    const { data: teacherAssignments } = await supabase
                        .from('assignments')
                        .select('id')
                        .in('course_id', courseIds);

                    if (teacherAssignments && teacherAssignments.length > 0) {
                        const assignmentIds = teacherAssignments.map(a => a.id);
                        const { data: teacherSubmissions } = await supabase
                            .from('submissions')
                            .select('id, grade')
                            .in('assignment_id', assignmentIds);

                        if (teacherSubmissions) {
                            completedTasksCount = teacherSubmissions.filter(s => s.grade !== null && s.grade !== undefined && s.grade !== '').length;
                            pendingTasksCount = teacherSubmissions.filter(s => s.grade === null || s.grade === undefined || s.grade === '').length;
                        }
                    }
                }

                // Fetch min_rate from teacher_profiles
                const { data: tp } = await supabase
                    .from('teacher_profiles')
                    .select('min_rate')
                    .eq('id', userId)
                    .maybeSingle();

                const monthlyRate = tp?.min_rate ? Number(tp.min_rate) : 150;

                const statsObject = {
                    earnings: studentsList.length * monthlyRate,
                    totalStudents: studentsList.length,
                    upcomingClasses: formattedSchedule.filter(s => s.status === 'scheduled' || s.status === 'live').length,
                    activeCourses: activeCoursesCount,
                    completedTasks: completedTasksCount,
                    pendingTasks: pendingTasksCount,
                    avgRating: dailyAvg
                };
                setStats(statsObject);
                localStorage.setItem('yadalearn-cached-teacher-stats', JSON.stringify(statsObject));

            } catch (err) {
                console.error('Error fetching teacher dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [isLoaded, userId]);

    return { teacherSchedule, topStudents, stats, pendingBookings, loading };
}
