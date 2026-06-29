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
        upcomingClasses: 0,
        activeCourses: 0,
        completedTasks: 0,
        pendingTasks: 0,
        avgRating: 4.8
    });
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !userId) return;

        async function fetchData() {
            setLoading(true);
            try {
                // Auto-seed courses if none exist for this teacher
                const { data: courses } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('teacher_id', userId);

                if (!courses || courses.length === 0) {
                    console.log('No courses found. Seeding default courses for teacher:', userId);
                    const coursesData = [
                        {
                            title: 'Advanced Mathematics',
                            description: 'Calculus and Linear Algebra.',
                            teacher_id: userId,
                            schedule: 'Mon, Wed 09:00 AM',
                            image_url: ''
                        },
                        {
                            title: 'Physics for Beginners',
                            description: 'Newtonian Mechanics.',
                            teacher_id: userId,
                            schedule: 'Tue, Thu 11:00 AM',
                            image_url: ''
                        },
                        {
                            title: 'Computer Science 101',
                            description: 'Intro to Programming.',
                            teacher_id: userId,
                            schedule: 'Fri 01:00 PM',
                            image_url: ''
                        }
                    ];
                    await supabase.from('courses').insert(coursesData);
                }

                // Fetch real bookings for this teacher
                let { data: bookings, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*, student:profiles!bookings_student_id_fkey(*)')
                    .eq('teacher_id', userId);

                if (bookingsError) throw bookingsError;

                const dbBookings = bookings || [];
                const confirmedBookings = dbBookings.filter((b: any) => b.status === 'confirmed');
                const pendingBookingsList = dbBookings.filter((b: any) => b.status === 'pending');
                
                setPendingBookings(pendingBookingsList);

                // Format Schedule from confirmed bookings returning raw date & time
                // Filter to only display bookings initiated by the teacher
                const initiatedIds = JSON.parse(localStorage.getItem('initiated_bookings') || '[]');
                const teacherInitiated = confirmedBookings.filter((b: any) => initiatedIds.includes(b.id));

                const formattedSchedule = teacherInitiated.map((b: any) => ({
                    id: b.id,
                    title: b.subject,
                    date: b.date,
                    time: b.time,
                    status: 'confirmed'
                })).sort((a: any, b: any) => {
                    const dateCompare = a.date.localeCompare(b.date);
                    if (dateCompare !== 0) return dateCompare;
                    return a.time.localeCompare(b.time);
                });
                setTeacherSchedule(formattedSchedule);

                // Build unique students list from confirmed bookings
                const uniqueStudentsMap = new Map();
                confirmedBookings.forEach((b: any) => {
                    if (b.student) {
                        uniqueStudentsMap.set(b.student.id, {
                            id: b.student.id,
                            name: b.student.full_name || 'Unknown Student',
                            avatar: b.student.avatar_url || `https://i.pravatar.cc/150?u=${b.student.id}`,
                            country: b.student.country || 'Global',
                            learningSubjects: b.student.subjects && b.student.subjects.length > 0 ? b.student.subjects : [b.subject],
                            sessionsCompleted: 1,
                            lastActive: 'Active now',
                            status: 'active'
                        });
                    }
                });
                const students = Array.from(uniqueStudentsMap.values());
                setTopStudents(students);

                const uniqueStudentIds = new Set(
                    confirmedBookings
                        .map(b => b.student_id)
                        .filter(id => id !== null && id !== undefined)
                );

                // Fetch actual ratings from confirmed bookings (from the bookings table)
                const { data: ratedBookings, error: ratingsError } = await supabase
                    .from('bookings')
                    .select('rating')
                    .eq('teacher_id', userId)
                    .not('rating', 'is', null);

                if (ratingsError) {
                    console.error('Error fetching student ratings for teacher:', ratingsError);
                }

                let avgRating = 0;
                if (ratedBookings && ratedBookings.length > 0) {
                    const sum = ratedBookings.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0);
                    avgRating = sum / ratedBookings.length;
                }

                // Fetch actual courses count
                const { data: teacherCourses, error: coursesError } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('teacher_id', userId);

                if (coursesError) {
                    console.error('Error fetching courses count:', coursesError);
                }

                const activeCoursesCount = teacherCourses ? teacherCourses.length : 0;

                // Fetch monthly fee from teacher_profiles table
                const { data: tp } = await supabase
                    .from('teacher_profiles')
                    .select('min_rate')
                    .eq('id', userId)
                    .maybeSingle();

                const monthlyRate = tp?.min_rate ? Number(tp.min_rate) : 150; // default to $150 if not specified

                setStats({
                    earnings: uniqueStudentIds.size * monthlyRate, // Monthly subscription gap calculation
                    totalStudents: uniqueStudentIds.size,
                    upcomingClasses: teacherInitiated.length,
                    activeCourses: activeCoursesCount,
                    completedTasks: 0,
                    pendingTasks: 0,
                    avgRating: avgRating
                });

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
