-- ==============================================================================
-- SKILLNOVA PLATFORM: AUTHORITATIVE DATABASE SCHEMA & SECURITY ARCHITECTURE
-- Single Source of Truth for PostgreSQL & Supabase Database Infrastructure
-- Role-Based Access Control (Admin, Sub-Admin, Student) & Row Level Security (RLS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & APPLICATION TYPES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'sub_admin', 'student');
    END IF;
END$$;

-- ------------------------------------------------------------------------------
-- 2. CORE IDENTITY & ROLE-BASED ACCESS CONTROL (RBAC)
-- ------------------------------------------------------------------------------

-- 2.1 PROFILES (1-to-1 extension of auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 USER ROLES (Single authoritative primary role per user)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'student',
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 2.3 STUDENTS (Academic & cohort details)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college TEXT NOT NULL,
    branch TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    batch_year INT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- 2.4 SUB-ADMINS (Delegated academic scope & administrative capabilities)
CREATE TABLE IF NOT EXISTS public.sub_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_courses UUID[] DEFAULT '{}',
    can_manage_courses BOOLEAN DEFAULT true,
    can_upload_resources BOOLEAN DEFAULT true,
    can_generate_ai BOOLEAN DEFAULT true,
    can_publish_opportunities BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_admins_user_id ON public.sub_admins(user_id);

-- 2.5 BATCHES (Student cohorts & schedules)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    year INT NOT NULL,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. HARDENED SECURITY DEFINER HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Check if authenticated user is a Super Administrator
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$;

-- Check if authenticated user is Sub-Admin or Super Administrator
CREATE OR REPLACE FUNCTION public.is_sub_admin_or_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND role IN ('admin', 'sub_admin')
    );
END;
$$;

-- Check if authenticated user can manage a specific course (Super-admin or assigned Sub-admin)
CREATE OR REPLACE FUNCTION public.can_manage_course(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.is_admin(p_user_id) THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.sub_admins
        WHERE sub_admins.user_id = p_user_id
          AND (
            p_course_id = ANY(sub_admins.assigned_courses)
            OR sub_admins.assigned_courses IS NULL
            OR array_length(sub_admins.assigned_courses, 1) IS NULL
          )
    );
END;
$$;

-- Restrict RPC execution: only callable by authenticated users within RLS
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_sub_admin_or_admin(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_sub_admin_or_admin(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.can_manage_course(UUID, UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_course(UUID, UUID) TO authenticated;

-- Trigger to automatically assign newly created course to sub-admin
CREATE OR REPLACE FUNCTION public.handle_course_creation_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
        UPDATE public.sub_admins
        SET assigned_courses = array_append(COALESCE(assigned_courses, '{}'), NEW.id)
        WHERE user_id = auth.uid()
          AND NOT (NEW.id = ANY(COALESCE(assigned_courses, '{}')));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_course_created_assign_subadmin ON public.courses;
CREATE TRIGGER on_course_created_assign_subadmin
    AFTER INSERT ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_course_creation_assignment();

-- Automatic Auth Trigger for New User Profiles & Default Student Role Assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_val public.app_role := 'student';
    admin_count INT;
BEGIN
    -- Bootstrap safeguard: Only the very first user in the database can become initial admin
    SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    IF admin_count = 0 THEN
        user_role_val := 'admin';
    ELSE
        user_role_val := 'student';
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

    -- Upsert single authoritative role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, user_role_val)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. COURSES, MODULES, SUB-MODULES & CURRICULUM HIERARCHY
-- ------------------------------------------------------------------------------

-- 4.1 COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Technology',
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_mentor ON public.courses(mentor_id);

-- 4.2 COURSE ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);

-- 4.3 MODULES
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_order ON public.modules(course_id, order_index);

-- 4.4 SUB-MODULES
CREATE TABLE IF NOT EXISTS public.sub_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_modules_module_order ON public.sub_modules(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sub_modules_course ON public.sub_modules(course_id);

-- 4.5 TOPICS (Granular lesson schedule & release status)
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

CREATE INDEX IF NOT EXISTS idx_topics_course ON public.topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_module ON public.topics(module_id);
CREATE INDEX IF NOT EXISTS idx_topics_sub_module ON public.topics(sub_module_id);
CREATE INDEX IF NOT EXISTS idx_topics_release_status ON public.topics(release_status);

-- 4.6 LEARNING RESOURCES & RESOURCE VIEWS
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('recording', 'drive_notes', 'pdf', 'ppt', 'reference')),
    url TEXT NOT NULL,
    is_external BOOLEAN DEFAULT true,
    file_size_bytes BIGINT,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_topic ON public.learning_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_resources_course ON public.learning_resources(course_id);

CREATE TABLE IF NOT EXISTS public.resource_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_views_student ON public.resource_views(student_id);

-- ------------------------------------------------------------------------------
-- 5. PRESENTATIONS & PDF DOCUMENT ALLOCATIONS
-- ------------------------------------------------------------------------------

-- 5.1 PRESENTATIONS
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
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presentations_course ON public.presentations(course_id);
CREATE INDEX IF NOT EXISTS idx_presentations_sub_module ON public.presentations(sub_module_id);

-- 5.2 PRESENTATION SLIDE ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.presentation_slide_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
    sub_module_id UUID NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
    start_slide INT NOT NULL,
    end_slide INT NOT NULL,
    release_status TEXT NOT NULL DEFAULT 'locked' CHECK (release_status IN ('released', 'locked', 'scheduled')),
    scheduled_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slide_alloc_presentation ON public.presentation_slide_allocations(presentation_id);
CREATE INDEX IF NOT EXISTS idx_slide_alloc_sub_module ON public.presentation_slide_allocations(sub_module_id);
CREATE INDEX IF NOT EXISTS idx_slide_alloc_status ON public.presentation_slide_allocations(release_status);

-- 5.3 PDF PAGE ALLOCATIONS
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
    released_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdf_alloc_sub_module ON public.pdf_page_allocations(sub_module_id);
CREATE INDEX IF NOT EXISTS idx_pdf_alloc_status ON public.pdf_page_allocations(release_status);

-- ------------------------------------------------------------------------------
-- 6. ASSESSMENTS, SECURE QUIZZES & SERVER-SIDE GRADING
-- ------------------------------------------------------------------------------

-- 6.1 QUIZZES
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

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status_time ON public.quizzes(status, start_time, end_time);

-- 6.2 QUIZ QUESTIONS (Public options without exposed answers)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    marks NUMERIC(4,2) NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 1,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, order_index);

-- 6.3 QUIZ ANSWER KEYS (Isolated private table - Staff only)
CREATE TABLE IF NOT EXISTS public.quiz_answer_keys (
    question_id UUID PRIMARY KEY REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL,
    explanation TEXT
);

-- 6.4 QUIZ ATTEMPTS & LEADERBOARD
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
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'completed', 'timed_out', 'in_progress')),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard ON public.quiz_attempts (quiz_id, is_first_attempt, score DESC, accuracy DESC, time_spent_seconds ASC)
WHERE is_first_attempt = true;

-- 6.5 SECURE SERVER-SIDE QUIZ SUBMISSION & GRADING RPC
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
    p_quiz_id UUID,
    p_answers JSONB,
    p_time_spent_seconds INT DEFAULT 0,
    p_is_practice BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_student_name TEXT;
    v_course_id UUID;
    v_total_marks NUMERIC(5,2) := 10;
    v_total_questions INT := 0;
    v_correct_count INT := 0;
    v_incorrect_count INT := 0;
    v_unanswered_count INT := 0;
    v_score NUMERIC(5,2) := 0;
    v_accuracy NUMERIC(5,2) := 0;
    v_percentage NUMERIC(5,2) := 0;
    v_is_first_attempt BOOLEAN := true;
    v_attempt_id UUID;
    v_q RECORD;
    v_student_ans TEXT;
    v_result JSONB;
BEGIN
    v_student_id := auth.uid();
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to submit quiz';
    END IF;

    SELECT full_name INTO v_student_name FROM public.profiles WHERE id = v_student_id;
    IF v_student_name IS NULL THEN
        v_student_name := 'Student Learner';
    END IF;

    SELECT course_id, total_marks INTO v_course_id, v_total_marks FROM public.quizzes WHERE id = p_quiz_id;
    IF v_course_id IS NULL THEN
        RAISE EXCEPTION 'Quiz not found';
    END IF;

    -- Evaluate answers securely against private answer keys
    FOR v_q IN 
        SELECT q.id, q.marks, ak.correct_answer 
        FROM public.quiz_questions q
        JOIN public.quiz_answer_keys ak ON ak.question_id = q.id
        WHERE q.quiz_id = p_quiz_id
        ORDER BY q.order_index
    LOOP
        v_total_questions := v_total_questions + 1;
        v_student_ans := UPPER(TRIM(COALESCE(p_answers->>v_q.id::text, '')));
        
        IF v_student_ans = '' THEN
            v_unanswered_count := v_unanswered_count + 1;
        ELSIF v_student_ans = UPPER(TRIM(v_q.correct_answer)) THEN
            v_correct_count := v_correct_count + 1;
            v_score := v_score + COALESCE(v_q.marks, 1);
        ELSE
            v_incorrect_count := v_incorrect_count + 1;
        END IF;
    END LOOP;

    IF v_total_questions > 0 THEN
        v_accuracy := ROUND((v_correct_count::numeric / v_total_questions::numeric) * 100, 2);
        v_percentage := ROUND((v_score / v_total_marks) * 100, 2);
    END IF;

    -- Check if student already completed an official first attempt
    IF EXISTS (
        SELECT 1 FROM public.quiz_attempts 
        WHERE quiz_id = p_quiz_id AND student_id = v_student_id AND is_first_attempt = true
    ) THEN
        v_is_first_attempt := false;
    ELSE
        v_is_first_attempt := NOT p_is_practice;
    END IF;

    INSERT INTO public.quiz_attempts (
        quiz_id, student_id, student_name, course_id,
        score, total_marks, total_questions, correct_count, incorrect_count, unanswered_count,
        accuracy, percentage, time_spent_seconds, answers, is_first_attempt, is_practice, status, completed_at
    ) VALUES (
        p_quiz_id, v_student_id, v_student_name, v_course_id,
        v_score, v_total_marks, v_total_questions, v_correct_count, v_incorrect_count, v_unanswered_count,
        v_accuracy, v_percentage, p_time_spent_seconds, p_answers, v_is_first_attempt, p_is_practice, 'submitted', NOW()
    ) RETURNING id INTO v_attempt_id;

    v_result := jsonb_build_object(
        'attempt_id', v_attempt_id,
        'quiz_id', p_quiz_id,
        'student_id', v_student_id,
        'score', v_score,
        'total_marks', v_total_marks,
        'total_questions', v_total_questions,
        'correct_count', v_correct_count,
        'accuracy', v_accuracy,
        'percentage', v_percentage,
        'is_first_attempt', v_is_first_attempt,
        'completed_at', NOW()
    );

    RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_quiz_attempt(UUID, JSONB, INT, BOOLEAN) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(UUID, JSONB, INT, BOOLEAN) TO authenticated;

-- ------------------------------------------------------------------------------
-- 7. PROGRESS TRACKING & PYTHON CODING LAB
-- ------------------------------------------------------------------------------

-- 7.1 STUDENT PROGRESS (Single unified roadmap & syllabus progress table)
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_sub_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_stage TEXT,
    current_sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL,
    progress_percentage INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_course ON public.student_progress(course_id);

-- 7.2 PRACTICAL SUBMISSIONS (Python Coding Lab Monaco + Pyodide WASM)
CREATE TABLE IF NOT EXISTS public.practical_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    practical_id TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practical_student ON public.practical_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_practical_course ON public.practical_submissions(course_id);

-- ------------------------------------------------------------------------------
-- 8. COMMUNITY DISCUSSIONS & 1-ON-1 MENTORSHIP
-- ------------------------------------------------------------------------------

-- 8.1 DISCUSSION POSTS
CREATE TABLE IF NOT EXISTS public.discussion_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'project', 'resources', 'tech', 'career')),
    tags TEXT[] DEFAULT '{}',
    likes_count INT DEFAULT 0,
    liked_by UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussion_author ON public.discussion_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_created ON public.discussion_posts(created_at DESC);

-- 8.2 DISCUSSION REPLIES
CREATE TABLE IF NOT EXISTS public.discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_post ON public.discussion_replies(post_id);

-- 8.3 MENTOR REQUESTS (Private 1-on-1 between Student & Mentor)
CREATE TABLE IF NOT EXISTS public.mentor_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    topic_title TEXT,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    doubt_title TEXT NOT NULL,
    doubt_description TEXT NOT NULL,
    code_snippet TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_requests_student ON public.mentor_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentor ON public.mentor_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_course ON public.mentor_requests(course_id);

-- 8.4 MENTOR REQUEST REPLIES
CREATE TABLE IF NOT EXISTS public.mentor_request_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.mentor_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_replies_request ON public.mentor_request_replies(request_id);

-- ------------------------------------------------------------------------------
-- 9. AI CONTENT GENERATOR PIPELINE & STUDY AIDS
-- ------------------------------------------------------------------------------

-- 9.1 AI GENERATION JOBS
CREATE TABLE IF NOT EXISTS public.ai_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published')),
    raw_extracted_text TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_course ON public.ai_generation_jobs(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_generation_jobs(status);

-- 9.2 GENERATED SUMMARIES
CREATE TABLE IF NOT EXISTS public.generated_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.ai_generation_jobs(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summaries_topic ON public.generated_summaries(topic_id);

-- 9.3 FLASHCARDS
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.ai_generation_jobs(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    source_ref TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON public.flashcards(topic_id);

-- 9.4 INTERVIEW QUESTIONS
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.ai_generation_jobs(id) ON DELETE SET NULL,
    role_category TEXT NOT NULL,
    question TEXT NOT NULL,
    model_answer TEXT NOT NULL,
    key_talking_points JSONB,
    source_ref TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_topic ON public.interview_questions(topic_id);

-- ------------------------------------------------------------------------------
-- 10. MARKETING, COHORTS, OPPORTUNITIES & PLATFORM GOVERNANCE
-- ------------------------------------------------------------------------------

-- 10.1 SATURDAY SPECIAL (Beyond the Classroom Guest Lectures)
CREATE TABLE IF NOT EXISTS public.saturday_special (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    speaker TEXT NOT NULL,
    speaker_role TEXT,
    session_date TIMESTAMPTZ NOT NULL,
    cover_image TEXT,
    recording_url TEXT,
    slides_url TEXT,
    resources_url TEXT,
    is_upcoming BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saturday_upcoming ON public.saturday_special(is_upcoming, session_date);

-- 10.2 OPPORTUNITIES (Jobs, Internships, Hackathons)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('internship', 'job', 'hackathon', 'competition', 'research')),
    description TEXT,
    eligibility TEXT,
    required_skills JSONB,
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    stipend_salary TEXT,
    deadline DATE,
    apply_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);

-- 10.3 ANNOUNCEMENTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_role public.app_role,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- 10.4 HOMEPAGE SETTINGS & FEATURED COURSES
CREATE TABLE IF NOT EXISTS public.homepage_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demo_video_url TEXT,
    demo_video_title TEXT DEFAULT 'SkillNova Learning Experience',
    demo_video_description TEXT DEFAULT 'Watch how SkillNova transforms student careers through hands-on technical training, live mentor reviews, and production project builds.',
    demo_video_is_active BOOLEAN DEFAULT true,
    whatsapp_group_url TEXT DEFAULT 'https://chat.whatsapp.com/SkillNovaOfficialCohort2027',
    whatsapp_qr_code_url TEXT DEFAULT '',
    whatsapp_is_active BOOLEAN DEFAULT true,
    whatsapp_display_name TEXT DEFAULT 'Official WhatsApp Community',
    instagram_url TEXT DEFAULT 'https://instagram.com/skillnova_edu',
    instagram_is_active BOOLEAN DEFAULT true,
    instagram_display_name TEXT DEFAULT 'Instagram @skillnova_edu',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/company/skillnova',
    linkedin_is_active BOOLEAN DEFAULT true,
    linkedin_display_name TEXT DEFAULT 'LinkedIn @skillnova',
    live_meeting_url TEXT DEFAULT '',
    live_meeting_title TEXT DEFAULT 'Daily Engineering Cohort Masterclass',
    live_meeting_time TEXT DEFAULT 'Everyday at 07:00 PM IST',
    live_meeting_is_active BOOLEAN DEFAULT false,
    live_meeting_is_daily_recurring BOOLEAN DEFAULT true,
    live_meeting_updated_at TIMESTAMPTZ DEFAULT NOW(),
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

CREATE INDEX IF NOT EXISTS idx_hp_courses_order ON public.homepage_courses(is_active, order_index);

-- 10.5 STUDENT ACCESS REQUESTS & WORKFLOW
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
    assigned_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.student_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.student_access_requests(email);

CREATE TABLE IF NOT EXISTS public.student_access_request_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.student_access_requests(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_events_request ON public.student_access_request_events(request_id);

-- 10.6 AUDIT LOGS (Standardized Administrative Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_course ON public.audit_logs(course_id);

-- ------------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_slide_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_page_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practical_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_request_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saturday_special ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_access_request_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 11.1 PROFILES
DROP POLICY IF EXISTS "Profiles read by authenticated" ON public.profiles;
CREATE POLICY "Profiles read by authenticated" ON public.profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile or Admin" ON public.profiles;
CREATE POLICY "Users update own profile or Admin" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- 11.2 USER ROLES (Admin management strictly isolated)
DROP POLICY IF EXISTS "Users read own role or staff read all" ON public.user_roles;
CREATE POLICY "Users read own role or staff read all" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin insert user roles" ON public.user_roles;
CREATE POLICY "Admin insert user roles" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin update user roles" ON public.user_roles;
CREATE POLICY "Admin update user roles" ON public.user_roles
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin delete user roles" ON public.user_roles;
CREATE POLICY "Admin delete user roles" ON public.user_roles
    FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));

-- 11.3 STUDENTS
DROP POLICY IF EXISTS "Students read own record or Staff" ON public.students;
CREATE POLICY "Students read own record or Staff" ON public.students
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students update own permitted fields" ON public.students;
CREATE POLICY "Students update own permitted fields" ON public.students
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (user_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff insert students" ON public.students;
CREATE POLICY "Staff insert students" ON public.students
    FOR INSERT TO authenticated
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff delete students" ON public.students;
CREATE POLICY "Staff delete students" ON public.students
    FOR DELETE TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()));

-- 11.4 SUB-ADMINS
DROP POLICY IF EXISTS "Sub-admins read own scope or Admin" ON public.sub_admins;
CREATE POLICY "Sub-admins read own scope or Admin" ON public.sub_admins
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin insert sub-admins" ON public.sub_admins;
CREATE POLICY "Admin insert sub-admins" ON public.sub_admins
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin update sub-admins" ON public.sub_admins;
CREATE POLICY "Admin update sub-admins" ON public.sub_admins
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin delete sub-admins" ON public.sub_admins;
CREATE POLICY "Admin delete sub-admins" ON public.sub_admins
    FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));

-- 11.5 BATCHES
DROP POLICY IF EXISTS "Authenticated users read batches" ON public.batches;
CREATE POLICY "Authenticated users read batches" ON public.batches
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff insert batches" ON public.batches;
CREATE POLICY "Staff insert batches" ON public.batches
    FOR INSERT TO authenticated
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff update batches" ON public.batches;
CREATE POLICY "Staff update batches" ON public.batches
    FOR UPDATE TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff delete batches" ON public.batches;
CREATE POLICY "Staff delete batches" ON public.batches
    FOR DELETE TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()));

-- 11.6 COURSES
DROP POLICY IF EXISTS "Public read published courses" ON public.courses;
CREATE POLICY "Public read published courses" ON public.courses
    FOR SELECT TO authenticated, anon
    USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff insert courses" ON public.courses;
CREATE POLICY "Staff insert courses" ON public.courses
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.sub_admins WHERE user_id = auth.uid() AND can_manage_courses = true)
    );

DROP POLICY IF EXISTS "Staff update courses" ON public.courses;
CREATE POLICY "Staff update courses" ON public.courses
    FOR UPDATE TO authenticated
    USING (public.can_manage_course(auth.uid(), id))
    WITH CHECK (public.can_manage_course(auth.uid(), id));

DROP POLICY IF EXISTS "Staff delete courses" ON public.courses;
CREATE POLICY "Staff delete courses" ON public.courses
    FOR DELETE TO authenticated
    USING (public.can_manage_course(auth.uid(), id));

-- 11.7 COURSE ENROLLMENTS
DROP POLICY IF EXISTS "Students read own enrollments or Staff" ON public.course_enrollments;
CREATE POLICY "Students read own enrollments or Staff" ON public.course_enrollments
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage course enrollments" ON public.course_enrollments;
CREATE POLICY "Staff manage course enrollments" ON public.course_enrollments
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- 11.8 MODULES
DROP POLICY IF EXISTS "Public read modules of published courses" ON public.modules;
CREATE POLICY "Public read modules of published courses" ON public.modules
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = modules.course_id 
              AND (courses.is_published = true OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Staff insert modules" ON public.modules;
CREATE POLICY "Staff insert modules" ON public.modules
    FOR INSERT TO authenticated
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Staff update modules" ON public.modules;
CREATE POLICY "Staff update modules" ON public.modules
    FOR UPDATE TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Staff delete modules" ON public.modules;
CREATE POLICY "Staff delete modules" ON public.modules
    FOR DELETE TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id));

-- 11.9 SUB-MODULES
DROP POLICY IF EXISTS "Public read sub-modules of published courses" ON public.sub_modules;
CREATE POLICY "Public read sub-modules of published courses" ON public.sub_modules
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = sub_modules.course_id 
              AND (courses.is_published = true OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Staff insert sub-modules" ON public.sub_modules;
CREATE POLICY "Staff insert sub-modules" ON public.sub_modules
    FOR INSERT TO authenticated
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Staff update sub-modules" ON public.sub_modules;
CREATE POLICY "Staff update sub-modules" ON public.sub_modules
    FOR UPDATE TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Staff delete sub-modules" ON public.sub_modules;
CREATE POLICY "Staff delete sub-modules" ON public.sub_modules
    FOR DELETE TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id));

-- 11.10 TOPICS
DROP POLICY IF EXISTS "Read released topics or Staff" ON public.topics;
CREATE POLICY "Read released topics or Staff" ON public.topics
    FOR SELECT TO authenticated
    USING (
        public.is_sub_admin_or_admin(auth.uid()) OR 
        (
            release_status = 'released' AND 
            is_published = true AND
            EXISTS (
                SELECT 1 FROM public.course_enrollments 
                WHERE course_enrollments.course_id = topics.course_id 
                  AND course_enrollments.student_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Staff insert topics" ON public.topics;
CREATE POLICY "Staff insert topics" ON public.topics
    FOR INSERT TO authenticated
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Staff update topics" ON public.topics;
CREATE POLICY "Staff update topics" ON public.topics
    FOR UPDATE TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Staff delete topics" ON public.topics;
CREATE POLICY "Staff delete topics" ON public.topics
    FOR DELETE TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id));

-- 11.11 LEARNING RESOURCES & VIEWS
DROP POLICY IF EXISTS "Students read released resources or Staff" ON public.learning_resources;
CREATE POLICY "Students read released resources or Staff" ON public.learning_resources
    FOR SELECT TO authenticated
    USING (
        public.is_sub_admin_or_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.topics 
            JOIN public.course_enrollments ON course_enrollments.course_id = topics.course_id
            WHERE topics.id = learning_resources.topic_id 
              AND topics.release_status = 'released'
              AND course_enrollments.student_id = auth.uid()
              AND course_enrollments.status = 'enrolled'
        )
    );

DROP POLICY IF EXISTS "Staff manage learning resources" ON public.learning_resources;
CREATE POLICY "Staff manage learning resources" ON public.learning_resources
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.topics
            WHERE topics.id = learning_resources.topic_id
              AND public.can_manage_course(auth.uid(), topics.course_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.topics
            WHERE topics.id = learning_resources.topic_id
              AND public.can_manage_course(auth.uid(), topics.course_id)
        )
    );

DROP POLICY IF EXISTS "Students view own resource views or Staff" ON public.resource_views;
CREATE POLICY "Students view own resource views or Staff" ON public.resource_views
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students record own resource view" ON public.resource_views;
CREATE POLICY "Students record own resource view" ON public.resource_views
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

-- 11.12 PRESENTATIONS & SLIDE ALLOCATIONS
DROP POLICY IF EXISTS "Read presentations of visible courses" ON public.presentations;
CREATE POLICY "Read presentations of visible courses" ON public.presentations
    FOR SELECT TO authenticated
    USING (
        public.is_sub_admin_or_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = presentations.course_id 
              AND courses.is_published = true
        )
    );

DROP POLICY IF EXISTS "Staff manage presentations" ON public.presentations;
CREATE POLICY "Staff manage presentations" ON public.presentations
    FOR ALL TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Read released slide allocations" ON public.presentation_slide_allocations;
CREATE POLICY "Read released slide allocations" ON public.presentation_slide_allocations
    FOR SELECT TO authenticated
    USING (
        release_status = 'released' OR 
        public.is_sub_admin_or_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Staff manage slide allocations" ON public.presentation_slide_allocations;
CREATE POLICY "Staff manage slide allocations" ON public.presentation_slide_allocations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.presentations
            WHERE presentations.id = presentation_slide_allocations.presentation_id
              AND public.can_manage_course(auth.uid(), presentations.course_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.presentations
            WHERE presentations.id = presentation_slide_allocations.presentation_id
              AND public.can_manage_course(auth.uid(), presentations.course_id)
        )
    );

-- 11.13 PDF PAGE ALLOCATIONS
DROP POLICY IF EXISTS "Read released pdf allocations" ON public.pdf_page_allocations;
CREATE POLICY "Read released pdf allocations" ON public.pdf_page_allocations
    FOR SELECT TO authenticated
    USING (
        release_status = 'released' OR 
        public.is_sub_admin_or_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Staff manage pdf allocations" ON public.pdf_page_allocations;
CREATE POLICY "Staff manage pdf allocations" ON public.pdf_page_allocations
    FOR ALL TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

-- 11.14 QUIZZES, QUESTIONS, ANSWER KEYS & ATTEMPTS
DROP POLICY IF EXISTS "Read active or closed quizzes" ON public.quizzes;
CREATE POLICY "Read active or closed quizzes" ON public.quizzes
    FOR SELECT TO authenticated
    USING (
        public.is_sub_admin_or_admin(auth.uid()) OR
        NOW() >= start_time
    );

DROP POLICY IF EXISTS "Staff manage quizzes" ON public.quizzes;
CREATE POLICY "Staff manage quizzes" ON public.quizzes
    FOR ALL TO authenticated
    USING (public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.can_manage_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Read quiz questions for active/closed quizzes" ON public.quiz_questions;
CREATE POLICY "Read quiz questions for active/closed quizzes" ON public.quiz_questions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = quiz_questions.quiz_id 
              AND (quizzes.status IN ('active', 'closed') OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Staff manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Staff manage quiz questions" ON public.quiz_questions
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff read answer keys" ON public.quiz_answer_keys;
CREATE POLICY "Staff read answer keys" ON public.quiz_answer_keys
    FOR SELECT TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage answer keys" ON public.quiz_answer_keys;
CREATE POLICY "Staff manage answer keys" ON public.quiz_answer_keys
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students read own attempts or Leaderboard first attempts" ON public.quiz_attempts;
CREATE POLICY "Students read own attempts or Leaderboard first attempts" ON public.quiz_attempts
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() OR 
        is_first_attempt = true OR 
        public.is_sub_admin_or_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Students insert own attempts via submit function or staff" ON public.quiz_attempts;
CREATE POLICY "Students insert own attempts via submit function or staff" ON public.quiz_attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id = auth.uid() OR 
        public.is_sub_admin_or_admin(auth.uid())
    );

-- 11.15 STUDENT PROGRESS
DROP POLICY IF EXISTS "Students read own progress or Staff" ON public.student_progress;
CREATE POLICY "Students read own progress or Staff" ON public.student_progress
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students upsert own progress or Staff" ON public.student_progress;
CREATE POLICY "Students upsert own progress or Staff" ON public.student_progress
    FOR ALL TO authenticated
    USING (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

-- 11.16 PRACTICAL SUBMISSIONS
DROP POLICY IF EXISTS "Students read own submissions or Staff" ON public.practical_submissions;
CREATE POLICY "Students read own submissions or Staff" ON public.practical_submissions
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students manage own submissions or Staff" ON public.practical_submissions;
CREATE POLICY "Students manage own submissions or Staff" ON public.practical_submissions
    FOR ALL TO authenticated
    USING (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

-- 11.17 DISCUSSIONS
DROP POLICY IF EXISTS "Authenticated read discussions" ON public.discussion_posts;
CREATE POLICY "Authenticated read discussions" ON public.discussion_posts
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert discussions" ON public.discussion_posts;
CREATE POLICY "Authenticated insert discussions" ON public.discussion_posts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Author or Staff update discussions" ON public.discussion_posts;
CREATE POLICY "Author or Staff update discussions" ON public.discussion_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = author_id OR public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (auth.uid() = author_id OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Author or Staff delete discussions" ON public.discussion_posts;
CREATE POLICY "Author or Staff delete discussions" ON public.discussion_posts
    FOR DELETE TO authenticated
    USING (auth.uid() = author_id OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated read replies" ON public.discussion_replies;
CREATE POLICY "Authenticated read replies" ON public.discussion_replies
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert replies" ON public.discussion_replies;
CREATE POLICY "Authenticated insert replies" ON public.discussion_replies
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Author or Staff delete replies" ON public.discussion_replies;
CREATE POLICY "Author or Staff delete replies" ON public.discussion_replies
    FOR DELETE TO authenticated
    USING (auth.uid() = author_id OR public.is_sub_admin_or_admin(auth.uid()));

-- 11.18 MENTOR REQUESTS
DROP POLICY IF EXISTS "Student or Assigned Staff read mentor requests" ON public.mentor_requests;
CREATE POLICY "Student or Assigned Staff read mentor requests" ON public.mentor_requests
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR mentor_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Student create mentor requests" ON public.mentor_requests;
CREATE POLICY "Student create mentor requests" ON public.mentor_requests
    FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Student or Staff update mentor requests" ON public.mentor_requests;
CREATE POLICY "Student or Staff update mentor requests" ON public.mentor_requests
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid() OR mentor_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (student_id = auth.uid() OR mentor_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Private read mentor request replies" ON public.mentor_request_replies;
CREATE POLICY "Private read mentor request replies" ON public.mentor_request_replies
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.mentor_requests
            WHERE mentor_requests.id = mentor_request_replies.request_id
              AND (mentor_requests.student_id = auth.uid() OR mentor_requests.mentor_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Private create mentor request replies" ON public.mentor_request_replies;
CREATE POLICY "Private create mentor request replies" ON public.mentor_request_replies
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.mentor_requests
            WHERE mentor_requests.id = request_id
              AND (mentor_requests.student_id = auth.uid() OR mentor_requests.mentor_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

-- 11.19 HOMEPAGE SETTINGS & COURSES
DROP POLICY IF EXISTS "Public read homepage settings" ON public.homepage_settings;
CREATE POLICY "Public read homepage settings" ON public.homepage_settings
    FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff manage homepage settings" ON public.homepage_settings;
CREATE POLICY "Staff manage homepage settings" ON public.homepage_settings
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read active homepage courses" ON public.homepage_courses;
CREATE POLICY "Public read active homepage courses" ON public.homepage_courses
    FOR SELECT TO authenticated, anon
    USING (is_active = true OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage homepage courses" ON public.homepage_courses;
CREATE POLICY "Staff manage homepage courses" ON public.homepage_courses
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- 11.20 STUDENT ACCESS REQUESTS
DROP POLICY IF EXISTS "Public insert access requests" ON public.student_access_requests;
CREATE POLICY "Public insert access requests" ON public.student_access_requests
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff or Requester read access requests" ON public.student_access_requests;
CREATE POLICY "Staff or Requester read access requests" ON public.student_access_requests
    FOR SELECT TO authenticated
    USING (
        public.is_sub_admin_or_admin(auth.uid()) OR
        email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Staff update access requests" ON public.student_access_requests;
CREATE POLICY "Staff update access requests" ON public.student_access_requests
    FOR UPDATE TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage access request events" ON public.student_access_request_events;
CREATE POLICY "Staff manage access request events" ON public.student_access_request_events
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- 11.21 AUDIT LOGS
DROP POLICY IF EXISTS "Staff view audit logs" ON public.audit_logs;
CREATE POLICY "Staff view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- 11.22 AI & STUDY AIDS
DROP POLICY IF EXISTS "Staff manage AI jobs" ON public.ai_generation_jobs;
CREATE POLICY "Staff manage AI jobs" ON public.ai_generation_jobs
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Read published summaries" ON public.generated_summaries;
CREATE POLICY "Read published summaries" ON public.generated_summaries
    FOR SELECT TO authenticated
    USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage summaries" ON public.generated_summaries;
CREATE POLICY "Staff manage summaries" ON public.generated_summaries
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Read published flashcards" ON public.flashcards;
CREATE POLICY "Read published flashcards" ON public.flashcards
    FOR SELECT TO authenticated
    USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage flashcards" ON public.flashcards;
CREATE POLICY "Staff manage flashcards" ON public.flashcards
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Read published interview questions" ON public.interview_questions;
CREATE POLICY "Read published interview questions" ON public.interview_questions
    FOR SELECT TO authenticated
    USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage interview questions" ON public.interview_questions;
CREATE POLICY "Staff manage interview questions" ON public.interview_questions
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- 11.23 SATURDAY SPECIAL, OPPORTUNITIES & ANNOUNCEMENTS
DROP POLICY IF EXISTS "Public read saturday special" ON public.saturday_special;
CREATE POLICY "Public read saturday special" ON public.saturday_special
    FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff manage saturday special" ON public.saturday_special;
CREATE POLICY "Staff manage saturday special" ON public.saturday_special
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated read opportunities" ON public.opportunities;
CREATE POLICY "Authenticated read opportunities" ON public.opportunities
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff manage opportunities" ON public.opportunities;
CREATE POLICY "Staff manage opportunities" ON public.opportunities
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Read announcements" ON public.announcements;
CREATE POLICY "Read announcements" ON public.announcements
    FOR SELECT TO authenticated
    USING (
        target_role IS NULL OR 
        target_role = (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) OR
        public.is_sub_admin_or_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Staff manage announcements" ON public.announcements;
CREATE POLICY "Staff manage announcements" ON public.announcements
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- 11.24 NOTIFICATIONS
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff insert notifications" ON public.notifications;
CREATE POLICY "Staff insert notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 12. STORAGE BUCKET CONFIGURATION
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('course-materials', 'course-materials', false),
    ('course-roadmaps', 'course-roadmaps', true),
    ('ai-docs', 'ai-docs', false),
    ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 12.1 STORAGE OBJECT RLS POLICIES
DROP POLICY IF EXISTS "Public read course roadmaps" ON storage.objects;
CREATE POLICY "Public read course roadmaps" ON storage.objects
    FOR SELECT TO authenticated, anon
    USING (bucket_id = 'course-roadmaps');

DROP POLICY IF EXISTS "Staff upload course roadmaps" ON storage.objects;
CREATE POLICY "Staff upload course roadmaps" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'course-roadmaps' AND public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff update course roadmaps" ON storage.objects;
CREATE POLICY "Staff update course roadmaps" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'course-roadmaps' AND public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff delete course roadmaps" ON storage.objects;
CREATE POLICY "Staff delete course roadmaps" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'course-roadmaps' AND public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff manage course materials" ON storage.objects;
CREATE POLICY "Staff manage course materials" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'course-materials' AND public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (bucket_id = 'course-materials' AND public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Enrolled students read course materials" ON storage.objects;
CREATE POLICY "Enrolled students read course materials" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'course-materials');

DROP POLICY IF EXISTS "Staff manage ai docs" ON storage.objects;
CREATE POLICY "Staff manage ai docs" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'ai-docs' AND public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (bucket_id = 'ai-docs' AND public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated read ai docs" ON storage.objects;
CREATE POLICY "Authenticated read ai docs" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'ai-docs');

DROP POLICY IF EXISTS "Public read user avatars" ON storage.objects;
CREATE POLICY "Public read user avatars" ON storage.objects
    FOR SELECT TO public, anon, authenticated
    USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "Authenticated upload user avatars" ON storage.objects;
CREATE POLICY "Authenticated upload user avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'user-avatars');
