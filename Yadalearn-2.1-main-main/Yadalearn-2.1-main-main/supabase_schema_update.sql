-- =============================================
-- SCHEMA MIGRATIONS & ENHANCEMENTS (STEP 1)
-- =============================================

-- 1. Enhance existing profiles for languages
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_languages TEXT[] DEFAULT '{}';

-- Enhance bookings status to support completed state
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed'));

-- 2. Teacher-Student Links (core relationship)
CREATE TABLE IF NOT EXISTS teacher_student_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, student_id)
);

-- 3. Connection Requests (Teacher initiates)
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Live Classes (Teacher-initiated)
CREATE TABLE IF NOT EXISTS live_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  language TEXT,                    -- teacher's primary language
  status TEXT CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')) DEFAULT 'scheduled',
  room_id TEXT,                     -- for video provider (e.g. LiveKit)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Class Participants (only linked students)
CREATE TABLE IF NOT EXISTS class_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- 6. Session Ratings (mutual, only after completed sessions)
CREATE TABLE IF NOT EXISTS session_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  rated_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  feedback TEXT,
  rated_as TEXT CHECK (rated_as IN ('teacher', 'student')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_teacher_student_links_teacher ON teacher_student_links(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_teacher_student_links_student ON teacher_student_links(student_id, status);
CREATE INDEX IF NOT EXISTS idx_live_classes_teacher ON live_classes(teacher_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_session_ratings_class ON session_ratings(class_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE teacher_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers view their links" ON teacher_student_links;
DROP POLICY IF EXISTS "Students view their links" ON teacher_student_links;
DROP POLICY IF EXISTS "Auth users can insert links" ON teacher_student_links;
DROP POLICY IF EXISTS "Users can update own links" ON teacher_student_links;
DROP POLICY IF EXISTS "Users can delete own links" ON teacher_student_links;

DROP POLICY IF EXISTS "Teachers view their sent requests" ON connection_requests;
DROP POLICY IF EXISTS "Students view their received requests" ON connection_requests;
DROP POLICY IF EXISTS "Teachers can insert connection requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can update connection requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can delete connection requests" ON connection_requests;

DROP POLICY IF EXISTS "Teachers manage their classes" ON live_classes;
DROP POLICY IF EXISTS "Teachers view own classes" ON live_classes;
DROP POLICY IF EXISTS "Linked students view classes" ON live_classes;

DROP POLICY IF EXISTS "Participants view class bookings" ON class_participants;
DROP POLICY IF EXISTS "Teachers manage class participants" ON class_participants;
DROP POLICY IF EXISTS "Students join class" ON class_participants;

DROP POLICY IF EXISTS "Users read own ratings" ON session_ratings;
DROP POLICY IF EXISTS "Participants can rate completed sessions" ON session_ratings;

-- Define Policies

-- 1. teacher_student_links Policies
CREATE POLICY "Teachers view their links" ON teacher_student_links
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students view their links" ON teacher_student_links
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Auth users can insert links" ON teacher_student_links 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own links" ON teacher_student_links 
  FOR UPDATE USING (auth.uid() = teacher_id OR auth.uid() = student_id);

CREATE POLICY "Users can delete own links" ON teacher_student_links 
  FOR DELETE USING (auth.uid() = teacher_id OR auth.uid() = student_id);

-- 2. connection_requests Policies
CREATE POLICY "Teachers view their sent requests" ON connection_requests 
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students view their received requests" ON connection_requests 
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can insert connection requests" ON connection_requests 
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can update connection requests" ON connection_requests 
  FOR UPDATE USING (auth.uid() = teacher_id OR auth.uid() = student_id);

CREATE POLICY "Users can delete connection requests" ON connection_requests 
  FOR DELETE USING (auth.uid() = teacher_id OR auth.uid() = student_id);

-- 3. live_classes Policies
CREATE POLICY "Teachers manage their classes" ON live_classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Teachers view own classes" ON live_classes 
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Linked students view classes" ON live_classes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_student_links 
      WHERE teacher_id = live_classes.teacher_id 
      AND student_id = auth.uid() 
      AND status = 'accepted'
    )
  );

-- 4. class_participants Policies
CREATE POLICY "Participants view class bookings" ON class_participants 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM live_classes 
      WHERE id = class_id 
      AND (
        teacher_id = auth.uid() 
        OR auth.uid() = student_id 
        OR EXISTS (
          SELECT 1 FROM teacher_student_links 
          WHERE teacher_id = live_classes.teacher_id 
          AND student_id = auth.uid() 
          AND status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Teachers manage class participants" ON class_participants 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM live_classes 
      WHERE id = class_id 
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students join class" ON class_participants 
  FOR INSERT WITH CHECK (
    auth.uid() = student_id 
    AND EXISTS (
      SELECT 1 FROM live_classes 
      WHERE id = class_id 
      AND EXISTS (
        SELECT 1 FROM teacher_student_links 
        WHERE teacher_id = live_classes.teacher_id 
        AND student_id = auth.uid() 
        AND status = 'accepted'
      )
    )
  );

-- 5. session_ratings Policies
CREATE POLICY "Users read own ratings" ON session_ratings 
  FOR SELECT USING (rater_id = auth.uid() OR rated_id = auth.uid());

CREATE POLICY "Participants can rate completed sessions" ON session_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rater_id 
    AND EXISTS (
      SELECT 1 FROM class_participants cp
      JOIN live_classes lc ON cp.class_id = lc.id
      WHERE lc.id = session_ratings.class_id 
      AND lc.status = 'ended'
      AND (cp.student_id = auth.uid() OR lc.teacher_id = auth.uid())
    )
  );
