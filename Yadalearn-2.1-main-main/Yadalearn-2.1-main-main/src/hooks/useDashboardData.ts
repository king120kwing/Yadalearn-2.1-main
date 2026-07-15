import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardData() {
    const { user, subjects: studentSubjects } = useAuth();
    const userId = user?.id;
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('yadalearn-cached-classes');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [topTeachers, setTopTeachers] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('yadalearn-cached-teachers');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
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

                // Step 1: Query bookings to get teacherIds that this student has signed up with
                const { data: studentBookings } = await supabase
                    .from('bookings')
                    .select('teacher_id')
                    .eq('student_id', userId);

                const teacherIds = studentBookings
                    ? Array.from(new Set(studentBookings.map((b: any) => b.teacher_id).filter(Boolean)))
                    : [];

                let finalTeachersData = [];

                if (teacherIds.length > 0) {
                    const { data: bookedTeachers } = await supabase
                        .from('profiles')
                        .select(`
                            id,
                            full_name,
                            avatar_url,
                            subjects,
                            bio,
                            is_online,
                            teacher_profiles (
                                rating,
                                min_rate,
                                max_rate
                            )
                        `)
                        .in('id', teacherIds)
                        .eq('role', 'teacher')
                        .eq('onboarding_completed', true);
                    
                    finalTeachersData = bookedTeachers || [];
                }

                // Step 2: Fallback to interested subjects overlap query if no bookings exist yet
                if (finalTeachersData.length === 0) {
                    let query = supabase
                        .from('profiles')
                        .select(`
                            id,
                            full_name,
                            avatar_url,
                            subjects,
                            bio,
                            is_online,
                            teacher_profiles (
                                rating,
                                min_rate,
                                max_rate
                            )
                        `)
                        .eq('role', 'teacher')
                        .eq('onboarding_completed', true);

                    if (currentSubjects.length > 0) {
                        query = query.overlaps('subjects', currentSubjects);
                    }

                    const { data: teachersData } = await query.limit(5);
                    finalTeachersData = teachersData || [];
                }

                // Fallback: If still empty, query any onboarded teachers
                if (finalTeachersData.length === 0) {
                    const { data: fallbackTeachers } = await supabase
                        .from('profiles')
                        .select(`
                            id,
                            full_name,
                            avatar_url,
                            subjects,
                            bio,
                            is_online,
                            teacher_profiles (
                                rating,
                                min_rate,
                                max_rate
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
                        subjects: t.subjects || ['General'],
                        rating: tp.rating ? Number(tp.rating) : 0,
                        reviews: 12,
                        rateMin: tp.min_rate || 40,
                        rateMax: tp.max_rate || 80,
                        yearsExperience: 8,
                        bio: t.bio || 'Experienced teacher.',
                        isOnline: !!t.is_online
                    };
                });

                setTopTeachers(teachers);
                localStorage.setItem('yadalearn-cached-teachers', JSON.stringify(teachers));

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
                localStorage.setItem('yadalearn-cached-classes', JSON.stringify(upcoming));
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
