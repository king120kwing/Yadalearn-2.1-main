-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL, -- Link to Clerk User ID
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id TEXT REFERENCES profiles(clerk_id), -- Assuming teacher_id is the clerk_id
  schedule TEXT, -- e.g., "Mon, Wed 10:00 AM"
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT REFERENCES profiles(clerk_id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id),
  student_id TEXT REFERENCES profiles(clerk_id),
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
-- Using 'true' for check allows anon client inserts for demo
CREATE POLICY "Authenticated insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert" ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert" ON submissions FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update (required for upsert)
CREATE POLICY "Authenticated update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Authenticated update" ON courses FOR UPDATE USING (true);
CREATE POLICY "Authenticated update" ON enrollments FOR UPDATE USING (true);
CREATE POLICY "Authenticated update" ON assignments FOR UPDATE USING (true);
CREATE POLICY "Authenticated update" ON submissions FOR UPDATE USING (true);
