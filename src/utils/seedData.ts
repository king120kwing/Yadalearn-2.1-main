import { supabase } from '@/lib/supabase';
import { addDays, format, subDays } from 'date-fns';

export const seedDatabase = async (userId: string, role: 'teacher' | 'student' = 'student') => {
    console.log('Seeding database for user:', userId, 'Role:', role);

    try {
        // 1. Upsert Current User Profile
        const currentUserProfile = {
            clerk_id: userId,
            full_name: role === 'teacher' ? 'Teacher User' : 'Student User',
            role: role,
            email: `${role}@example.com`,
            avatar_url: `https://i.pravatar.cc/150?u=${role}`
        };

        const { error: profileError } = await supabase.from('profiles').upsert(currentUserProfile, { onConflict: 'clerk_id' });
        if (profileError) {
            console.error('Error seeding profile:', profileError);
            alert('Error seeding profile: ' + profileError.message);
            return;
        }

        if (role === 'teacher') {
            // --- TEACHER SEEDING LOGIC ---

            // 2. Create Courses (Owned by this Teacher)
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
                // Check if exists
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

                    if (error) {
                        console.error('Error creating course:', error);
                        continue;
                    }
                    createdCourses.push(newCourse);
                }
            }

            // 3. Create Dummy Students
            const dummyStudents = [
                { clerk_id: 'student_1', full_name: 'Alice Johnson', role: 'student', email: 'alice@test.com' },
                { clerk_id: 'student_2', full_name: 'Bob Smith', role: 'student', email: 'bob@test.com' },
                { clerk_id: 'student_3', full_name: 'Charlie Brown', role: 'student', email: 'charlie@test.com' },
                { clerk_id: 'student_4', full_name: 'Diana Prince', role: 'student', email: 'diana@test.com' },
                { clerk_id: 'student_5', full_name: 'Evan Wright', role: 'student', email: 'evan@test.com' }
            ];

            await supabase.from('profiles').upsert(dummyStudents, { onConflict: 'clerk_id' });

            // 4. Enroll Dummy Students in Teacher's Courses
            const enrollmentsData: any[] = [];

            // Fetch enrolled students to avoid duplicates
            // Or just try insert and ignore error. We'll try insert.

            if (createdCourses.length > 0) {
                createdCourses.forEach(course => {
                    // Enroll 3 random students in each course
                    for (let i = 0; i < 3; i++) {
                        // Check if already enrolled (simple check skipped for speed, relying on UI or error suppression)
                        enrollmentsData.push({
                            student_id: dummyStudents[i].clerk_id,
                            course_id: course.id
                        });
                    }
                });

                // We use ignoreDuplicates: true if the table has constraint, but it has UNIQUE(student_id, course_id)
                const { error: enrollError } = await supabase.from('enrollments').insert(enrollmentsData).select();
                // Note: .insert() without onConflict/ignore might fail if duplicates. 
                // But for a simple button click that refreshes, duplicates might happen if run twice.
                // Better to upsert enrollments on conflict valid constraint.
                // enrollments has UNIQUE(student_id, course_id)
                if (enrollmentsData.length > 0) {
                    await supabase.from('enrollments').upsert(enrollmentsData, { onConflict: 'student_id,course_id' });
                }
            }

            // 5. Create Assignments/Submissions
            // ... (Skipping for brevity, can add later)

        } else {
            // --- STUDENT SEEDING LOGIC (Existing) ---

            // Create Mock Teachers
            const teachers = [
                { clerk_id: 'teacher_1', full_name: 'Mrs. Garcia', role: 'teacher', email: 'garcia@example.com' },
                { clerk_id: 'teacher_2', full_name: 'Mr. White', role: 'teacher', email: 'white@example.com' },
                { clerk_id: 'teacher_3', full_name: 'Mr. Einstein', role: 'teacher', email: 'einstein@example.com' }
            ];
            await supabase.from('profiles').upsert(teachers, { onConflict: 'clerk_id' });

            // Create Courses
            const coursesData = [
                { title: 'Spanish Conv.', teacher_id: 'teacher_1', schedule: 'Mon 10:00 AM' },
                { title: 'Chemistry', teacher_id: 'teacher_2', schedule: 'Tue 2:00 PM' },
                { title: 'Physics', teacher_id: 'teacher_3', schedule: 'Fri 10:00 AM' }
            ];

            const createdCourses: any[] = [];
            for (const course of coursesData) {
                const { data: existing } = await supabase.from('courses').select('id').eq('title', course.title).maybeSingle();
                if (existing) {
                    createdCourses.push({ ...course, id: existing.id });
                } else {
                    const { data: newCourse } = await supabase.from('courses').insert(course).select().single();
                    if (newCourse) createdCourses.push(newCourse);
                }
            }

            if (createdCourses.length > 0) {
                const enrollments = createdCourses.map(c => ({ student_id: userId, course_id: c.id }));
                await supabase.from('enrollments').upsert(enrollments, { onConflict: 'student_id,course_id' }); // Use constraint

                // Add assignments
                const assignments = [
                    { course_id: createdCourses[0].id, title: 'Essay', due_date: new Date().toISOString() },
                    { course_id: createdCourses[1].id || createdCourses[0].id, title: 'Lab', due_date: new Date().toISOString() }
                ];
                await supabase.from('assignments').insert(assignments);
            }
        }

        console.log('Database seeded successfully!');
        alert(`Database seeded for ${role}! Reloading...`);
        window.location.reload();

    } catch (err) {
        console.error('Unexpected error seeding database:', err);
        alert('Seeding failed. See console.');
    }
};
