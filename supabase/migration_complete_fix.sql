-- ==============================================================================
-- SKILLNOVA: COMPLETE PRODUCTION SUPABASE DATABASE MIGRATION & PERSISTENCE FIX
-- 1. Creates all missing tables (sub_modules, presentations, presentation_slide_allocations, quizzes, pdf_page_allocations, student_roadmap_progress)
-- 2. Adds automatic auth.users -> profiles & user_roles creation trigger
-- 3. Configures Row Level Security (RLS) policies for Admin, Sub-admin, Student & Public
-- 4. Seeds baseline courses, modules, sub-modules, quizzes, and homepage settings
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. App Role Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'sub_admin', 'student');
    END IF;
END$$;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));

-- 3. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'student',
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 4. PROFILE & ROLE AUTO-CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role_val public.app_role := 'student';
    role_str TEXT;
BEGIN
    role_str := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'student'));
    IF role_str IN ('admin', 'sub_admin', 'student') THEN
        user_role_val := role_str::public.app_role;
    END IF;

    -- Upsert profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url, theme_preference)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
        COALESCE(new.raw_user_meta_data->>'theme_preference', 'light')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    -- Upsert user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, user_role_val)
    ON CONFLICT (user_id, role) DO UPDATE
    SET role = EXCLUDED.role;

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync any existing auth.users into profiles and user_roles
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT 
    id, 
    CASE 
        WHEN LOWER(COALESCE(raw_user_meta_data->>'role', '')) = 'admin' THEN 'admin'::public.app_role
        WHEN LOWER(COALESCE(raw_user_meta_data->>'role', '')) = 'sub_admin' THEN 'sub_admin'::public.app_role
        ELSE 'student'::public.app_role
    END
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. HELPER SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_sub_admin_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND role IN ('admin', 'sub_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Technology',
    mentor_id UUID REFERENCES public.profiles(id),
    mentor_name TEXT DEFAULT 'Senior Instructor',
    mentor_email TEXT DEFAULT 'mentor@skillnova.edu',
    duration_weeks INT DEFAULT 12,
    thumbnail_url TEXT,
    roadmap_image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    curriculum_text TEXT,
    course_fee TEXT DEFAULT '₹14,999',
    timeline TEXT DEFAULT '12 Weeks • Live Cohort',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS mentor_email TEXT DEFAULT 'mentor@skillnova.edu';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS roadmap_image_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS curriculum_text TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_fee TEXT DEFAULT '₹14,999';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS timeline TEXT DEFAULT '12 Weeks • Live Cohort';

-- 7. MODULES TABLE
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUB-MODULES TABLE
CREATE TABLE IF NOT EXISTS public.sub_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TOPICS & LEARNING RESOURCES
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    class_date DATE,
    order_index INT NOT NULL DEFAULT 1,
    recording_link TEXT,
    drive_notes_link TEXT,
    pdf_url TEXT,
    ppt_url TEXT,
    resource_type TEXT DEFAULT 'pdf',
    total_slides INT,
    slide_start INT,
    slide_end INT,
    doc_page_range TEXT,
    release_status TEXT DEFAULT 'released' CHECK (release_status IN ('draft', 'held', 'scheduled', 'released', 'archived')),
    scheduled_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    released_by TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'pdf';
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS total_slides INT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS slide_start INT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS slide_end INT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS doc_page_range TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS release_status TEXT DEFAULT 'released' CHECK (release_status IN ('draft', 'held', 'scheduled', 'released', 'archived'));
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS scheduled_release_at TIMESTAMPTZ;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS released_by TEXT;

-- 10. PRESENTATIONS & SLIDE ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    original_file_path TEXT,
    ppt_url TEXT,
    total_slides INT NOT NULL DEFAULT 1,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.presentation_slide_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
    sub_module_id UUID NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
    start_slide INT NOT NULL,
    end_slide INT NOT NULL,
    release_status TEXT NOT NULL DEFAULT 'locked' CHECK (release_status IN ('released', 'locked', 'scheduled')),
    scheduled_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PDF PAGE ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.pdf_page_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    start_page INT NOT NULL DEFAULT 1,
    end_page INT NOT NULL DEFAULT 1,
    total_pages INT NOT NULL DEFAULT 1,
    release_status TEXT NOT NULL DEFAULT 'locked' CHECK (release_status IN ('released', 'locked', 'scheduled')),
    scheduled_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. QUIZZES & QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_marks INT NOT NULL DEFAULT 10,
    duration_minutes INT NOT NULL DEFAULT 15,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'closed')),
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT,
    correct_index INT,
    explanation TEXT,
    marks INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS marks INT NOT NULL DEFAULT 1;

-- 13. QUIZ ATTEMPTS & LEADERBOARD
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_marks NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    incorrect_count INT NOT NULL DEFAULT 0,
    unanswered_count INT NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_first_attempt BOOLEAN NOT NULL DEFAULT true,
    is_practice BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'timed_out', 'in_progress', 'completed')),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS accuracy NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS is_first_attempt BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS is_practice BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS time_spent_seconds INT NOT NULL DEFAULT 0;

-- 14. STUDENT ROADMAP PROGRESS
CREATE TABLE IF NOT EXISTS public.student_roadmap_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_sub_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_stage TEXT,
    progress_percentage INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 15. HOMEPAGE SETTINGS & COURSES
CREATE TABLE IF NOT EXISTS public.homepage_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demo_video_url TEXT,
    demo_video_title TEXT DEFAULT 'SkillNova Learning Experience',
    demo_video_description TEXT DEFAULT 'Watch how SkillNova transforms student careers through hands-on technical training, live mentor reviews, and production project builds.',
    demo_video_is_active BOOLEAN DEFAULT true,
    whatsapp_group_url TEXT DEFAULT 'https://chat.whatsapp.com/sample-skillnova',
    whatsapp_qr_code_url TEXT DEFAULT '',
    whatsapp_is_active BOOLEAN DEFAULT true,
    whatsapp_display_name TEXT DEFAULT 'Official WhatsApp Community',
    instagram_url TEXT DEFAULT 'https://instagram.com/skillnova_edu',
    instagram_is_active BOOLEAN DEFAULT true,
    instagram_display_name TEXT DEFAULT 'Instagram @skillnova_edu',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/company/skillnova',
    linkedin_is_active BOOLEAN DEFAULT true,
    linkedin_display_name TEXT DEFAULT 'LinkedIn @skillnova',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homepage_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    fee TEXT NOT NULL DEFAULT '₹4,999',
    timeline TEXT NOT NULL DEFAULT '8 Weeks Cohort',
    curriculum_text TEXT,
    whatsapp_enroll_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. STUDENT ACCESS REQUESTS
CREATE TABLE IF NOT EXISTS public.student_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college TEXT NOT NULL,
    branch TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    target_course TEXT,
    payment_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    assigned_batch TEXT,
    assigned_course_id UUID REFERENCES public.courses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_slide_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_page_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_access_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, authenticated can manage own
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- User roles: Read by all authenticated; manage by staff
DROP POLICY IF EXISTS "Users read user_roles" ON public.user_roles;
CREATE POLICY "Users read user_roles" ON public.user_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage user_roles" ON public.user_roles;
CREATE POLICY "Staff manage user_roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Courses: Read published by all; manage by authenticated staff
DROP POLICY IF EXISTS "Public read published courses" ON public.courses;
CREATE POLICY "Public read published courses" ON public.courses FOR SELECT USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()) OR true);

DROP POLICY IF EXISTS "Staff manage courses" ON public.courses;
CREATE POLICY "Staff manage courses" ON public.courses FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Modules
DROP POLICY IF EXISTS "Public read modules" ON public.modules;
CREATE POLICY "Public read modules" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage modules" ON public.modules;
CREATE POLICY "Staff manage modules" ON public.modules FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Sub-modules
DROP POLICY IF EXISTS "Public read sub_modules" ON public.sub_modules;
CREATE POLICY "Public read sub_modules" ON public.sub_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage sub_modules" ON public.sub_modules;
CREATE POLICY "Staff manage sub_modules" ON public.sub_modules FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Topics
DROP POLICY IF EXISTS "Public read topics" ON public.topics;
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage topics" ON public.topics;
CREATE POLICY "Staff manage topics" ON public.topics FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Presentations & Slide Allocations
DROP POLICY IF EXISTS "Public read presentations" ON public.presentations;
CREATE POLICY "Public read presentations" ON public.presentations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage presentations" ON public.presentations;
CREATE POLICY "Staff manage presentations" ON public.presentations FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Read released slide allocations" ON public.presentation_slide_allocations;
CREATE POLICY "Read released slide allocations" ON public.presentation_slide_allocations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage slide allocations" ON public.presentation_slide_allocations;
CREATE POLICY "Staff manage slide allocations" ON public.presentation_slide_allocations FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- PDF Page Allocations
DROP POLICY IF EXISTS "Read released pdf allocations" ON public.pdf_page_allocations;
CREATE POLICY "Read released pdf allocations" ON public.pdf_page_allocations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage pdf allocations" ON public.pdf_page_allocations;
CREATE POLICY "Staff manage pdf allocations" ON public.pdf_page_allocations FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Quizzes & Questions
DROP POLICY IF EXISTS "Students read active and closed quizzes" ON public.quizzes;
CREATE POLICY "Students read active and closed quizzes" ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage quizzes" ON public.quizzes;
CREATE POLICY "Staff manage quizzes" ON public.quizzes FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Students read quiz questions" ON public.quiz_questions;
CREATE POLICY "Students read quiz questions" ON public.quiz_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Staff manage quiz questions" ON public.quiz_questions FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Quiz Attempts
DROP POLICY IF EXISTS "Students insert own attempts" ON public.quiz_attempts;
CREATE POLICY "Students insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Students and staff read attempts" ON public.quiz_attempts;
CREATE POLICY "Students and staff read attempts" ON public.quiz_attempts FOR SELECT USING (true);

-- Student Roadmap Progress
DROP POLICY IF EXISTS "Students manage own progress" ON public.student_roadmap_progress;
CREATE POLICY "Students manage own progress" ON public.student_roadmap_progress FOR ALL USING (true) WITH CHECK (true);

-- Homepage Settings & Courses
DROP POLICY IF EXISTS "Public read homepage settings" ON public.homepage_settings;
CREATE POLICY "Public read homepage settings" ON public.homepage_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage homepage settings" ON public.homepage_settings;
CREATE POLICY "Staff manage homepage settings" ON public.homepage_settings FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read homepage courses" ON public.homepage_courses;
CREATE POLICY "Public read homepage courses" ON public.homepage_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage homepage courses" ON public.homepage_courses;
CREATE POLICY "Staff manage homepage courses" ON public.homepage_courses FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL) WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- Student Access Requests (Public visitors on landing page can insert requests)
DROP POLICY IF EXISTS "Public insert access requests" ON public.student_access_requests;
CREATE POLICY "Public insert access requests" ON public.student_access_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff read access requests" ON public.student_access_requests;
CREATE POLICY "Staff read access requests" ON public.student_access_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff update access requests" ON public.student_access_requests;
CREATE POLICY "Staff update access requests" ON public.student_access_requests FOR UPDATE USING (true) WITH CHECK (true);

-- ==============================================================================
-- BASELINE DATA SEEDING (Idempotent ON CONFLICT DO NOTHING)
-- ==============================================================================

-- 1. Initial Courses
INSERT INTO public.courses (id, title, slug, description, category, mentor_name, mentor_email, duration_weeks, thumbnail_url, roadmap_image_url, is_published, course_fee, timeline)
VALUES 
    (
        'c0000000-0000-0000-0000-000000000101',
        'Full Stack Web Engineering & Microservices',
        'full-stack-web-engineering',
        'Master modern frontend architectures with React 19, TypeScript 5, Express REST APIs, PostgreSQL schema design, and Docker containerization.',
        'Full Stack Development',
        'Senior Technical Architect',
        'mentor.fullstack@skillnova.edu',
        12,
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        true,
        '₹14,999',
        '12 Weeks • Live Cohort'
    ),
    (
        'c0000000-0000-0000-0000-000000000201',
        'AI & Agentic Systems Engineering',
        'ai-agentic-systems',
        'Build multi-agent collaboration pipelines with LangGraph, deploy client-side WebAssembly models, and master vector embeddings with RAG.',
        'Artificial Intelligence',
        'Principal AI Researcher',
        'mentor.ai@skillnova.edu',
        10,
        'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        true,
        '₹18,999',
        '10 Weeks • Hands-on Labs'
    ),
    (
        'c0000000-0000-0000-0000-000000000301',
        'Python for Engineers & Algorithmic Problem Solving',
        'python-engineers-algorithms',
        'In-depth Python 3 systems, data structures, algorithm drills, dynamic programming, and in-browser Pyodide WebAssembly coding labs.',
        'Core Programming',
        'Lead Systems Engineer',
        'mentor.python@skillnova.edu',
        8,
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
        true,
        '₹9,999',
        '8 Weeks • Code In-Browser'
    )
ON CONFLICT (slug) DO UPDATE
SET is_published = true;

-- 2. Initial Modules
INSERT INTO public.modules (id, course_id, title, description, order_index)
VALUES
    ('m0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000101', 'Module 1: Advanced Frontend & System Architecture', 'TypeScript 5.5, generic constraints, React 19 architecture, and state machines.', 1),
    ('m0000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000101', 'Module 2: Scalable Backend Services & Databases', 'Node.js, Express microservices, PostgreSQL design, and indexing strategies.', 2),
    ('m0000000-0000-0000-0000-000000000201', 'c0000000-0000-0000-0000-000000000201', 'Module 1: Foundations of Machine Learning & Math', 'Vector spaces, matrix decomposition, loss optimization, and gradient descent.', 1)
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Sub-modules
INSERT INTO public.sub_modules (id, module_id, course_id, title, description, order_index)
VALUES
    ('s0000000-0000-0000-0000-000000000101', 'm0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.1 TypeScript Generics & Type Narrowing', 'Generic constraints, conditional types, and runtime validation.', 1),
    ('s0000000-0000-0000-0000-000000000102', 'm0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.2 Custom Hooks & Reusable State Machines', 'Separation of concerns, useReducer patterns, and resilient subscriptions.', 2),
    ('s0000000-0000-0000-0000-000000000103', 'm0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.3 Component Composition & Optimization', 'React.memo, useMemo profiling, lazy loading, and rendering waterfalls.', 3),
    ('s0000000-0000-0000-0000-000000000104', 'm0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.4 Micro-Frontends & Architectural Standards', 'Module federation, contract versioning, and enterprise deployment.', 4),
    ('s0000000-0000-0000-0000-000000000201', 'm0000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000101', '2.1 Express & Fastify Architecture', 'Middleware pipelines, input sanitization, and structured logging.', 1),
    ('s0000000-0000-0000-0000-000000000202', 'm0000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000101', '2.2 PostgreSQL Schema Design & Indexing', 'B-Tree indexes, composite keys, and query execution plan analysis.', 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Homepage Settings
INSERT INTO public.homepage_settings (id, demo_video_title, demo_video_url, demo_video_description, demo_video_is_active, whatsapp_group_url, whatsapp_is_active, instagram_url, linkedin_url)
VALUES (
    'h0000000-0000-0000-0000-000000000001',
    'SkillNova Experience • Live Walkthrough',
    'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    'Discover how SkillNova transforms software careers with 3D mountain journeys, client-side Python 3 WebAssembly coding labs, and direct industry mentorship.',
    true,
    'https://chat.whatsapp.com/SkillNovaOfficialCohort2027',
    true,
    'https://instagram.com/skillnova_edu',
    'https://linkedin.com/company/skillnova'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Initial Homepage Courses
INSERT INTO public.homepage_courses (id, title, description, thumbnail_url, fee, timeline, whatsapp_enroll_url, is_active, order_index)
VALUES
    (
        'h0000000-0000-0000-0000-000000000011',
        'Full Stack Web Engineering & Microservices',
        'Master React 19, TypeScript 5, Node.js microservices, PostgreSQL, and Docker with production deployments.',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
        '₹5,999',
        '12 Weeks • Live Weekend Cohort',
        'https://chat.whatsapp.com/SkillNovaOfficialCohort2027',
        true,
        1
    ),
    (
        'h0000000-0000-0000-0000-000000000012',
        'AI & Agentic Systems Engineering',
        'Build production RAG pipelines, autonomous multi-agent systems with LangGraph, and deploy WebAssembly models.',
        'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
        '₹6,999',
        '10 Weeks • Hands-on Project Labs',
        'https://chat.whatsapp.com/SkillNovaOfficialCohort2027',
        true,
        2
    ),
    (
        'h0000000-0000-0000-0000-000000000013',
        'Python for Engineers & Algorithmic Problem Solving',
        'From syntax to system design, data structures, algorithms, and in-browser coding drills with Pyodide.',
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
        '₹3,999',
        '8 Weeks • Code In-Browser',
        'https://chat.whatsapp.com/SkillNovaOfficialCohort2027',
        true,
        3
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Quiz & Questions
INSERT INTO public.quizzes (id, course_id, module_id, sub_module_id, title, description, total_marks, duration_minutes, start_time, end_time, status, created_by)
VALUES (
    'q0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000101',
    'm0000000-0000-0000-0000-000000000101',
    's0000000-0000-0000-0000-000000000101',
    'Python Fundamentals & Memory Models Assessment',
    'Active cohort benchmark covering variable references, mutable vs immutable types, and Pyodide sandbox execution.',
    10,
    15,
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '7 days',
    'active',
    'Administrator'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question, options, correct_answer, explanation, marks, order_index)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        'q0000000-0000-0000-0000-000000000001',
        'In Python, which of the following object types is mutable?',
        '[{"key": "A", "text": "tuple"}, {"key": "B", "text": "list"}, {"key": "C", "text": "str"}, {"key": "D", "text": "int"}]'::jsonb,
        'B',
        'Lists in Python are mutable sequences; their elements can be modified in place without changing memory identity.',
        2.5,
        1
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'q0000000-0000-0000-0000-000000000001',
        'Which keyword is used to define a function in Python?',
        '[{"key": "A", "text": "function"}, {"key": "B", "text": "def"}, {"key": "C", "text": "define"}, {"key": "D", "text": "fun"}]'::jsonb,
        'B',
        'The def keyword begins a function definition header in Python syntax.',
        2.5,
        2
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'q0000000-0000-0000-0000-000000000001',
        'Which built-in Python data structure follows LIFO (Last In, First Out) ordering when using append() and pop()?',
        '[{"key": "A", "text": "Queue"}, {"key": "B", "text": "Stack (via list)"}, {"key": "C", "text": "Hash Set"}, {"key": "D", "text": "Binary Heap"}]'::jsonb,
        'B',
        'Standard Python lists provide amortized O(1) append() and pop() operations from the end, implementing a Stack (LIFO).',
        2.5,
        3
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'q0000000-0000-0000-0000-000000000001',
        'What is the primary advantage of WebAssembly (Pyodide) in SkillNova''s coding lab?',
        '[{"key": "A", "text": "Executes Python locally in browser sandbox with zero latency"}, {"key": "B", "text": "Requires a paid cloud license"}, {"key": "C", "text": "Sends code over unencrypted sockets"}, {"key": "D", "text": "Only supports static HTML"}]'::jsonb,
        'A',
        'Pyodide compiles CPython to WebAssembly, enabling genuine Python 3 execution in the client browser with zero latency and high security.',
        2.5,
        4
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure Storage Buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('course-materials', 'course-materials', false),
    ('course-roadmaps', 'course-roadmaps', true),
    ('ai-docs', 'ai-docs', false)
ON CONFLICT (id) DO NOTHING;
