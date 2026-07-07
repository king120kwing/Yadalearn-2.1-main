import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardData() {
    const { user, subjects: studentSubjects } = useAuth();
    // Use real user ID (via AuthContext)
    const userId = user?.id;
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [topTeachers, setTopTeachers] = useState<any[]>([]);
    const [unratedClasses, setUnratedClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch the student's profile to get their selected subjects if they aren't fully loaded yet
                let currentSubjects = studentSubjects || [];
                if (currentSubjects.length === 0) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('subjects')
                        .eq('id', userId)
                        .single();
                    if (profile && profile.subjects) {
                        currentSubjects = profile.subjects;
                    }
                }

                // Query teachers that teach subjects overlapping with the student's interested subjects
                let query = supabase
                    .from('profiles')
                    .select(`
                        id,
                        full_name,
                        avatar_url,
                        subjects,
                        bio,
                        teacher_profiles (
                            rating,
                            min_rate
                        )
                    `)
                    .eq('role', 'teacher')
                    .eq('onboarding_completed', true);

                if (currentSubjects.length > 0) {
                    query = query.overlaps('subjects', currentSubjects);
                }

                const { data: teachersData, error: teachersError } = await query.limit(5);

                if (teachersError) {
                    console.error('Error fetching teachers:', teachersError);
                }

                // Fallback: If no matching teachers, fetch any teachers so dashboard is not empty
                let finalTeachersData = teachersData || [];
                if (finalTeachersData.length === 0) {
                    const { data: fallbackTeachers } = await supabase
                        .from('profiles')
                        .select(`
                            id,
                            full_name,
                            avatar_url,
                            subjects,
                            bio,
                            teacher_profiles (
                                rating,
                                min_rate
                            )
                        `)
                        .eq('role', 'teacher')
                        .eq('onboarding_completed', true)
                        .limit(5);
                    finalTeachersData = fallbackTeachers || [];
                }

                const teachers = finalTeachersData.map((t: any) => {
                    const tp = t.teacher_profiles || {};
                    return {
                        id: t.id,
                        name: t.full_name || 'Unknown Teacher',
                        avatar: t.avatar_url || 'https://i.pravatar.cc/150',
                        subject: t.subjects?.join(', ') || 'General',
                        rating: tp.rating ? Number(tp.rating) : 4.8,
                        reviews: 12,
                        hourlyRate: tp.min_rate || 150,
                        bio: t.bio || 'Experienced teacher.',
                        isOnline: true
                    };
                });

                setTopTeachers(teachers);

                // Fetch confirmed bookings from database (representing classes scheduled from the calendar)
                const { data: bookings, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        subject,
                        date,
                        time,
                        rating,
                        teacher:profiles!bookings_teacher_id_fkey(id, full_name, avatar_url)
                    `)
                    .eq('student_id', userId)
                    .eq('status', 'confirmed');

                if (bookingsError) {
                    console.error('Error fetching bookings for dashboard:', bookingsError);
                }

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

                const dbBookings = bookings || [];
                const upcoming = [];
                const unratedPast = [];

                for (const b of dbBookings) {
                    const bookingTime = parseBookingDateTime(b.date, b.time);
                    if (bookingTime > now) {
                        upcoming.push({
                            id: b.id,
                            title: b.subject,
                            day: `${b.date} ${b.time}`,
                            time: b.time,
                            isQuiz: b.subject.toLowerCase().includes('quiz'),
                            teacherName: b.teacher?.full_name || 'Teacher'
                        });
                    } else if (b.rating === null) {
                        unratedPast.push({
                            id: b.id,
                            title: b.subject,
                            date: b.date,
                            time: b.time,
                            teacherId: b.teacher?.id,
                            teacherName: b.teacher?.full_name || 'Teacher',
                            teacherAvatar: b.teacher?.avatar_url || 'https://i.pravatar.cc/150'
                        });
                    }
                }

                setUpcomingClasses(upcoming);
                setUnratedClasses(unratedPast);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId, studentSubjects]);

    return { upcomingClasses, topTeachers, unratedClasses, loading };
}
