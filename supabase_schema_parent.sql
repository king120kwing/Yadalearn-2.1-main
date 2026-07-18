-- 1. Enhance existing profiles table with new parent attributes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- 2. Update role constraint safely by dropping and recreating it
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- 3. Create Parent-Student Links table
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- 4. Set up Row Level Security for parent_student_links
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents view their links" ON parent_student_links;
DROP POLICY IF EXISTS "Students view their parents" ON parent_student_links;
DROP POLICY IF EXISTS "Teachers view parents of their students" ON parent_student_links;
DROP POLICY IF EXISTS "Parents can insert links" ON parent_student_links;

-- Parents can see links they created
CREATE POLICY "Parents view their links" ON parent_student_links
  FOR SELECT USING (parent_id = auth.uid());

-- Students can see their parents
CREATE POLICY "Students view their parents" ON parent_student_links
  FOR SELECT USING (student_id = auth.uid());

-- Teachers can view parents of their linked students
CREATE POLICY "Teachers view parents of their students" ON parent_student_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_student_links 
      WHERE teacher_id = auth.uid() 
      AND student_id = parent_student_links.student_id 
      AND status = 'accepted'
    )
  );

-- Only authenticated users (intended to be parents) can insert links
CREATE POLICY "Parents can insert links" ON parent_student_links 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
