-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  country TEXT DEFAULT 'Global',
  subjects TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schedule TEXT, -- e.g., "Mon, Wed 10:00 AM"
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT, -- URL or text content
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Reset Policies (Drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Public read access" ON profiles;
DROP POLICY IF EXISTS "Public read access" ON courses;
DROP POLICY IF EXISTS "Public read access" ON enrollments;
DROP POLICY IF EXISTS "Public read access" ON assignments;
DROP POLICY IF EXISTS "Public read access" ON submissions;

DROP POLICY IF EXISTS "Authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Authenticated insert" ON courses;
DROP POLICY IF EXISTS "Authenticated insert" ON enrollments;
DROP POLICY IF EXISTS "Authenticated insert" ON assignments;
DROP POLICY IF EXISTS "Authenticated insert" ON submissions;

DROP POLICY IF EXISTS "Authenticated update" ON profiles;
DROP POLICY IF EXISTS "Authenticated update" ON courses;
DROP POLICY IF EXISTS "Authenticated update" ON enrollments;
DROP POLICY IF EXISTS "Authenticated update" ON assignments;
DROP POLICY IF EXISTS "Authenticated update" ON submissions;


-- Policies (Simple for now to get started)
-- Allow read access to everyone for now (refine later based on auth)
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON assignments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON submissions FOR SELECT USING (true);

-- Allow authenticated users to insert (we rely on client logic for now)
CREATE POLICY "Authenticated insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated insert" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON enrollments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update (required for upsert)
CREATE POLICY "Authenticated update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated update" ON courses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON enrollments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON assignments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON submissions FOR UPDATE USING (auth.role() = 'authenticated');

-- Migration to add columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subjects TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Global';
ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.8;

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  study_path TEXT,
  current_level TEXT,
  learning_objective TEXT,
  class_preference TEXT,
  time_availability TEXT,
  grade_level TEXT,
  study_goal TEXT,
  study_preference TEXT,
  study_schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  teaching_focus TEXT[] DEFAULT '{}',
  language_specialization TEXT[] DEFAULT '{}',
  subject_specialization TEXT[] DEFAULT '{}',
  teaching_level TEXT[] DEFAULT '{}',
  teaching_approach TEXT,
  lesson_format TEXT,
  availability TEXT,
  min_rate INTEGER,
  max_rate INTEGER,
  grade_level_focus TEXT,
  teaching_style TEXT,
  class_type TEXT,
  schedule TEXT,
  rating NUMERIC DEFAULT 4.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Reset Policies for student_profiles
DROP POLICY IF EXISTS "Public read access" ON student_profiles;
DROP POLICY IF EXISTS "Authenticated insert" ON student_profiles;
DROP POLICY IF EXISTS "Authenticated update" ON student_profiles;

CREATE POLICY "Public read access" ON student_profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated insert" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated update" ON student_profiles FOR UPDATE USING (auth.uid() = id);

-- Reset Policies for teacher_profiles
DROP POLICY IF EXISTS "Public read access" ON teacher_profiles;
DROP POLICY IF EXISTS "Authenticated insert" ON teacher_profiles;
DROP POLICY IF EXISTS "Authenticated update" ON teacher_profiles;

CREATE POLICY "Public read access" ON teacher_profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated insert" ON teacher_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated update" ON teacher_profiles FOR UPDATE USING (auth.uid() = id);

-- Create indexes for performance and searchability
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subjects ON profiles USING gin(subjects);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_teaching_focus ON teacher_profiles USING gin(teaching_focus);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_language_spec ON teacher_profiles USING gin(language_specialization);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_subject_spec ON teacher_profiles USING gin(subject_specialization);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Reset booking policies
DROP POLICY IF EXISTS "Public read access" ON bookings;
DROP POLICY IF EXISTS "Authenticated insert" ON bookings;
DROP POLICY IF EXISTS "Authenticated update" ON bookings;
DROP POLICY IF EXISTS "Authenticated delete" ON bookings;

-- Define booking policies
CREATE POLICY "Public read access" ON bookings FOR SELECT USING (true);
CREATE POLICY "Authenticated insert" ON bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON bookings FOR DELETE USING (auth.role() = 'authenticated');



