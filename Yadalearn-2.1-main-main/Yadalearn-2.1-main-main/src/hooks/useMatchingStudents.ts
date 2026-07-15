import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useMatchingStudents = () => {
  const { user } = useAuth();
  const [matchingStudents, setMatchingStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatchingStudents = async () => {
    if (!user || !user.id) return [];
    setLoading(true);
    try {
      // 1. Fetch teacher profile teaching focus subjects
      const { data: teacherProfile, error: profileErr } = await supabase
        .from('teacher_profiles')
        .select('teaching_focus')
        .eq('id', user.id)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching teacher profile:', profileErr);
        return [];
      }

      const focusSubjects = teacherProfile?.teaching_focus || [];
      if (focusSubjects.length === 0) {
        setMatchingStudents([]);
        return [];
      }

      // 2. Fetch onboarded student profiles whose learning subjects overlap with teacher's teaching focus
      const { data: students, error: studentErr } = await supabase
        .from('profiles')
        .select('*, student_profiles(*)')
        .eq('role', 'student')
        .eq('onboarding_completed', true)
        .overlaps('subjects', focusSubjects);

      if (studentErr) {
        console.error('Error fetching matching students:', studentErr);
        return [];
      }

      const formatted = (students || []).map((s: any) => ({
        id: s.id,
        name: s.full_name || 'Unknown Student',
        avatar: s.avatar_url || `https://i.pravatar.cc/150?u=${s.id}`,
        subjects: s.subjects || [],
        bio: s.bio || 'Interested in learning and growth.',
        country: s.country || 'Global',
        studyPath: s.student_profiles?.study_path || 'Languages',
        level: s.student_profiles?.current_level || 'Beginner',
        timeAvailability: s.student_profiles?.time_availability || 'Weekdays'
      }));

      setMatchingStudents(formatted);
      return formatted;
    } catch (err) {
      console.error('useMatchingStudents error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMatchingStudents();
    }
  }, [user?.id]);

  return { matchingStudents, loading, fetchMatchingStudents };
};
