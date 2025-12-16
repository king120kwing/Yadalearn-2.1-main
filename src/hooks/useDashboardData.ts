import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardData() {
    const { user } = useAuth();
    // Use real user ID from Clerk (via AuthContext)
    const userId = user?.id;
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [topTeachers, setTopTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // Fetch teachers (profiles with role='teacher')
            const { data: teachersData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'teacher')
                .limit(5);

            const teachers = teachersData?.map((t: any) => ({
                id: t.id,
                name: t.full_name || 'Unknown Teacher',
                avatar: t.avatar_url || 'https://i.pravatar.cc/150',
                subject: 'General',
                rating: 5.0,
                reviews: 0,
                hourlyRate: 0,
                bio: 'Experienced teacher.',
                isOnline: false
            })) || [];

            setTopTeachers(teachers);

            if (!user || !userId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch enrollments and related course details
                const { data: enrollments, error } = await supabase
                    .from('enrollments')
                    .select(`
            course:courses (
              id,
              title,
              schedule
            )
          `)
                    .eq('student_id', userId);

                if (error) {
                    console.error('Supabase error:', error);
                }

                const classes = enrollments?.map((e: any) => {
                    return {
                        id: e.course.id,
                        title: e.course.title,
                        day: e.course.schedule,
                        time: '',
                        isQuiz: e.course.title.toLowerCase().includes('quiz')
                    };
                }) || [];

                setUpcomingClasses(classes);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    return { upcomingClasses, topTeachers, loading };
}
