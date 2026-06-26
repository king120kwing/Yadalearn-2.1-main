import { supabase } from '@/lib/supabase';
import { addDays, subDays } from 'date-fns';

// Helper to generate a random UUID for dummy courses/assignments without hitting DB first
const generateUUID = () => crypto.randomUUID();

export const seedDatabase = async (userId: string, role: 'teacher' | 'student' = 'student') => {
    console.log('Seeding database for user:', userId, 'Role:', role);

    try {
        if (role === 'teacher') {
            // 1. Create Courses (Owned by this Teacher)
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

            const createdCourses: any[] = [];

            for (const course of coursesData) {
                const { data: existing } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('title', course.title)
                    .eq('teacher_id', userId)
                    .maybeSingle();

                if (existing) {
                    createdCourses.push({ ...course, id: existing.id });
                } else {
                    const { data: newCourse, error } = await supabase
                        .from('courses')
                        .insert(course)
                        .select()
                        .single();

                    if (!error && newCourse) createdCourses.push(newCourse);
                }
            }

            // 2. Create Assignments
            if (createdCourses.length > 0) {
                const assignmentData = {
                    course_id: createdCourses[0].id,
                    title: 'Midterm Essay: History of Math',
                    description: 'Write a 500 word essay on the origins of calculus.',
                    due_date: addDays(new Date(), 7).toISOString()
                };

                await supabase.from('assignments').insert(assignmentData);
            }

        } else {
            // STUDENT SEEDING LOGIC
            // For students, we'll just ensure they have a profile.
            // We cannot easily seed dummy teachers and enroll without violating the auth.users foreign key.
            console.log("Student seeded (dummy courses skipped to maintain database integrity)");
        }

        console.log('Database seeded successfully!');
        alert(`Database seeded for ${role}! Reloading...`);
        window.location.reload();

    } catch (err) {
        console.error('Unexpected error seeding database:', err);
        alert('Seeding failed. See console.');
    }
};
