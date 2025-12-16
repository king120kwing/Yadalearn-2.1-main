import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useTeacherDashboardData() {
    const { user, isLoaded } = useAuth();
    const userId = user?.id;

    const [teacherSchedule, setTeacherSchedule] = useState<any[]>([]);
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [stats, setStats] = useState({
        earnings: 0,
        totalStudents: 0,
        upcomingClasses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !userId) return;

        async function fetchData() {
            setLoading(true);
            try {
                // 1. Fetch Courses taught by this teacher
                const { data: courses, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('teacher_id', userId);

                if (courseError) throw courseError;

                const myCourses = courses || [];

                // 2. Format Schedule (Mocking time for now as DB sched is just a string)
                const formattedSchedule = myCourses.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    time: c.schedule,
                    status: 'confirmed' // Mock status
                }));
                setTeacherSchedule(formattedSchedule);

                // 3. Fetch Enrolled Students
                // We need all enrollments for these courses
                if (myCourses.length > 0) {
                    const courseIds = myCourses.map(c => c.id);
                    const { data: enrollments, error: enrollError } = await supabase
                        .from('enrollments')
                        .select(`
                            student:profiles (*)
                        `)
                        .in('course_id', courseIds);

                    if (enrollError) throw enrollError;

                    // Extract unique students
                    const uniqueStudentsMap = new Map();
                    enrollments?.forEach((e: any) => {
                        if (e.student) {
                            uniqueStudentsMap.set(e.student.id, {
                                id: e.student.id,
                                name: e.student.full_name || 'Unknown Student',
                                avatar: e.student.avatar_url || 'https://i.pravatar.cc/150',
                                country: 'Global', // Mock
                                learningSubjects: ['General'], // Mock
                                sessionsCompleted: 10 // Mock
                            });
                        }
                    });

                    const students = Array.from(uniqueStudentsMap.values());
                    setTopStudents(students);

                    setStats({
                        earnings: myCourses.length * 1500, // Mock calculation
                        totalStudents: students.length,
                        upcomingClasses: myCourses.length
                    });
                }

            } catch (err) {
                console.error('Error fetching teacher data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [isLoaded, userId]);

    return { teacherSchedule, topStudents, stats, loading };
}
