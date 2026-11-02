-- ==============================================================================
-- SKILLNOVA: 3D-ENHANCED LEARNING & CAREER DEVELOPMENT PLATFORM
-- Production PostgreSQL Database Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES (Super Admin, Sub-Admin, Student)
CREATE TYPE public.app_role AS ENUM ('admin', 'sub_admin', 'student');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'student',
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. STUDENTS (Academic Profile)
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

-- 4. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    mentor_id UUID REFERENCES public.profiles(id),
    mentor_name TEXT,
    duration_weeks INT DEFAULT 12,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSE ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    UNIQUE(course_id, student_id)
);

-- 6. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    class_date DATE,
    order_index INT NOT NULL DEFAULT 1,
    recording_link TEXT,
    drive_notes_link TEXT,
    pdf_url TEXT,
    ppt_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LEARNING RESOURCES
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

-- 9. RESOURCE VIEWS
CREATE TABLE IF NOT EXISTS public.resource_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. COURSE ROADMAPS
CREATE TABLE IF NOT EXISTS public.course_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID UNIQUE NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    roadmap_image_url TEXT NOT NULL,
    file_format TEXT NOT NULL DEFAULT 'webp',
    version INT DEFAULT 1,
    uploaded_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI GENERATION JOBS
CREATE TABLE IF NOT EXISTS public.ai_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published')),
    raw_extracted_text TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 12. GENERATED SUMMARIES
CREATE TABLE IF NOT EXISTS public.generated_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.ai_generation_jobs(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FLASHCARDS
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.ai_generation_jobs(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    source_ref TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.ai_generation_jobs(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INT NOT NULL,
    explanation TEXT,
    source_ref TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    answers_record JSONB,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. INTERVIEW QUESTIONS
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.ai_generation_jobs(id) ON DELETE SET NULL,
    role_category TEXT NOT NULL,
    question TEXT NOT NULL,
    model_answer TEXT NOT NULL,
    key_talking_points JSONB,
    source_ref TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SATURDAY SPECIAL (Beyond the Classroom)
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

-- 18. OPPORTUNITIES (Internships, Jobs, Hackathons)
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

-- 19. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    target_role public.app_role,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. NOTIFICATIONS
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

-- 21. STUDENT PROGRESS
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_topics JSONB DEFAULT '[]'::JSONB,
    percentage INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 22. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saturday_special ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper Functions
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

-- RLS: Courses (Everyone can read published courses; Staff can insert/update)
CREATE POLICY "Public read published courses" ON public.courses
    FOR SELECT USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()));

CREATE POLICY "Admin & Sub-admin course modification" ON public.courses
    FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()));

-- RLS: Topics (Students read published; Admins/Sub-admins manage)
CREATE POLICY "Student read published topics" ON public.topics
    FOR SELECT USING (is_published = true OR public.is_sub_admin_or_admin(auth.uid()));

CREATE POLICY "Staff manage topics" ON public.topics
    FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()));

-- RLS: AI Generation Jobs (Admins/Sub-admins only)
CREATE POLICY "Staff manage AI jobs" ON public.ai_generation_jobs
    FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()));

-- RLS: Notifications (User's own notifications)
CREATE POLICY "User notifications read" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User notifications update" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- 21. BATCHES
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    year INT NOT NULL,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SUB-ADMINS (Delegated Academic Permissions)
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

-- 23. DISCUSSION POSTS (Public to all authenticated students)
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

-- 24. DISCUSSION REPLIES
CREATE TABLE IF NOT EXISTS public.discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. MENTOR REQUESTS (Private 1-on-1 between Student & Assigned Mentor)
CREATE TABLE IF NOT EXISTS public.mentor_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    topic_title TEXT,
    mentor_id UUID REFERENCES public.profiles(id),
    doubt_title TEXT NOT NULL,
    doubt_description TEXT NOT NULL,
    code_snippet TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. MENTOR REQUEST REPLIES (Private Thread)
CREATE TABLE IF NOT EXISTS public.mentor_request_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.mentor_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Activations
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_request_replies ENABLE ROW LEVEL SECURITY;

-- RLS: Discussion Posts (All authenticated users can read and write)
CREATE POLICY "Authenticated users read discussions" ON public.discussion_posts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users create discussions" ON public.discussion_posts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or Staff update discussions" ON public.discussion_posts
    FOR UPDATE TO authenticated USING (auth.uid() = author_id OR public.is_sub_admin_or_admin(auth.uid()));

-- RLS: Discussion Replies
CREATE POLICY "Authenticated users read replies" ON public.discussion_replies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users create replies" ON public.discussion_replies
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- RLS: Mentor Requests (Strict Privacy: Student ONLY sees their own requests; Mentors/Admin see all)
CREATE POLICY "Student read own mentor requests" ON public.mentor_requests
    FOR SELECT TO authenticated USING (
        student_id = auth.uid() OR 
        public.is_sub_admin_or_admin(auth.uid())
    );

CREATE POLICY "Student create mentor requests" ON public.mentor_requests
    FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

CREATE POLICY "Mentors and Staff update requests" ON public.mentor_requests
    FOR UPDATE TO authenticated USING (
        student_id = auth.uid() OR 
        public.is_sub_admin_or_admin(auth.uid())
    );

-- RLS: Mentor Request Replies (Strict Privacy)
CREATE POLICY "Private read mentor request replies" ON public.mentor_request_replies
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.mentor_requests
            WHERE mentor_requests.id = mentor_request_replies.request_id
            AND (mentor_requests.student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

CREATE POLICY "Private create mentor request replies" ON public.mentor_request_replies
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.mentor_requests
            WHERE mentor_requests.id = request_id
            AND (mentor_requests.student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_course ON public.topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_module ON public.topics(module_id);
CREATE INDEX IF NOT EXISTS idx_resources_topic ON public.learning_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON public.flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_topic ON public.quiz_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_discussion_created ON public.discussion_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_student ON public.mentor_requests(student_id);

-- ==============================================================================
-- 27. TOPIC RELEASE STATUS & AUDIT LOGS
-- ==============================================================================
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS release_status TEXT DEFAULT 'released' CHECK (release_status IN ('draft', 'held', 'scheduled', 'released', 'archived'));
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS scheduled_release_at TIMESTAMPTZ;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS released_by TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS resource_category TEXT DEFAULT 'pdf';

-- RLS: Enforce that students only see 'released' topics for enrolled courses
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students read released topics" ON public.topics;
CREATE POLICY "Students read released topics" ON public.topics
    FOR SELECT TO authenticated USING (
        public.is_sub_admin_or_admin(auth.uid()) OR (
            release_status = 'released' AND 
            EXISTS (
                SELECT 1 FROM public.course_enrollments 
                WHERE course_enrollments.course_id = topics.course_id 
                AND course_enrollments.student_id = auth.uid()
            )
        )
    );

-- ==============================================================================
-- 28. PRACTICAL SUBMISSIONS (Python Coding Lab Monaco + Pyodide WASM)
-- ==============================================================================
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

ALTER TABLE public.practical_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student manage own practical submissions" ON public.practical_submissions
    FOR ALL TO authenticated USING (
        student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid())
    ) WITH CHECK (
        student_id = auth.uid() OR public.is_sub_admin_or_admin(auth.uid())
    );

-- ==============================================================================
-- 29. AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL CHECK (action IN ('publish', 'release', 'hold', 'reschedule', 'archive', 'edit')),
    resource_id TEXT NOT NULL,
    resource_title TEXT NOT NULL,
    course_id TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.is_sub_admin_or_admin(auth.uid()));

CREATE POLICY "Staff insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_practical_student ON public.practical_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_practical_course ON public.practical_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- 30. COURSE CURRICULUM TEXT
-- ==============================================================================
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS curriculum_text TEXT;

-- ==============================================================================
-- 31. HOMEPAGE SETTINGS (Demo Video, WhatsApp, Instagram, LinkedIn, QR)
-- ==============================================================================
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

ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read homepage settings" ON public.homepage_settings
    FOR SELECT USING (true);

CREATE POLICY "Staff manage homepage settings" ON public.homepage_settings
    FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- ==============================================================================
-- 32. HOMEPAGE COURSES (Fee, Timeline, WhatsApp Enroll, Floating Cards)
-- ==============================================================================
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

ALTER TABLE public.homepage_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active homepage courses" ON public.homepage_courses
    FOR SELECT USING (is_active = true OR public.is_sub_admin_or_admin(auth.uid()));

CREATE POLICY "Staff manage homepage courses" ON public.homepage_courses
    FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

-- ==============================================================================
-- 33. STUDENT ACCESS REQUESTS & WORKFLOW
-- ==============================================================================
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

CREATE TABLE IF NOT EXISTS public.student_access_request_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.student_access_requests(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.student_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_access_request_events ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an access request from public homepage
CREATE POLICY "Public insert access requests" ON public.student_access_requests
    FOR INSERT WITH CHECK (true);

-- Only admins/sub-admins and requester can read requests
CREATE POLICY "Staff read access requests" ON public.student_access_requests
    FOR SELECT USING (public.is_sub_admin_or_admin(auth.uid()) OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Staff update access requests" ON public.student_access_requests
    FOR UPDATE USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

CREATE POLICY "Staff manage request events" ON public.student_access_request_events
    FOR ALL USING (public.is_sub_admin_or_admin(auth.uid()));

-- ==============================================================================
-- 34. AUDIT LOGS FOR ADMINISTRATIVE MODIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    performed_by TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_id TEXT,
    resource_title TEXT,
    course_id TEXT,
    details TEXT,
    previous_value JSONB,
    updated_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- AUDIT LOGS: RLS POLICIES
-- =========================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Remove previous policy definitions before recreating them
DROP POLICY IF EXISTS "Staff read audit logs"
ON public.audit_logs;

DROP POLICY IF EXISTS "Staff view audit logs"
ON public.audit_logs;

DROP POLICY IF EXISTS "Staff insert audit logs"
ON public.audit_logs;

DROP POLICY IF EXISTS "Staff read audit logs"
ON public.audit_logs;

DROP POLICY IF EXISTS "Admins and sub-admins can view audit logs"
ON public.audit_logs;

-- Staff can view audit logs
CREATE POLICY "Staff read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
    public.is_sub_admin_or_admin(auth.uid())
);

-- Staff can insert audit logs
CREATE POLICY "Staff insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_sub_admin_or_admin(auth.uid())
);
-- Add course enhancements if not exists
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_fee TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS timeline TEXT;

-- Add topic slide range and resource type enhancements if not exists
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS total_slides INT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS slide_start INT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS slide_end INT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS doc_page_range TEXT;

-- Modules table RLS policies
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage modules" ON public.modules;
CREATE POLICY "Staff manage modules" ON public.modules
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read modules" ON public.modules;
CREATE POLICY "Public read modules" ON public.modules
    FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = modules.course_id
            AND (courses.is_published = true OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

-- 23. SUB-MODULES
CREATE TABLE IF NOT EXISTS public.sub_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage sub_modules" ON public.sub_modules;
CREATE POLICY "Staff manage sub_modules" ON public.sub_modules
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read sub_modules" ON public.sub_modules;
CREATE POLICY "Public read sub_modules" ON public.sub_modules
    FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = sub_modules.course_id
            AND (courses.is_published = true OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

-- 24. PRESENTATIONS
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

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage presentations" ON public.presentations;
CREATE POLICY "Staff manage presentations" ON public.presentations
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read presentations" ON public.presentations;
CREATE POLICY "Public read presentations" ON public.presentations
    FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = presentations.course_id
            AND (courses.is_published = true OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

-- 25. PRESENTATION SLIDE ALLOCATIONS
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

ALTER TABLE public.presentation_slide_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage slide allocations" ON public.presentation_slide_allocations;
CREATE POLICY "Staff manage slide allocations" ON public.presentation_slide_allocations
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Enrolled students read released slide allocations" ON public.presentation_slide_allocations;
CREATE POLICY "Enrolled students read released slide allocations" ON public.presentation_slide_allocations
    FOR SELECT
    TO authenticated
    USING (
        release_status = 'released' OR public.is_sub_admin_or_admin(auth.uid())
    );

-- Add sub_module_id to topics if not exists
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL;

-- 26. THEME PREFERENCE ON PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));

-- 27. QUIZZES
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
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage quizzes" ON public.quizzes;
CREATE POLICY "Staff manage quizzes" ON public.quizzes
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students read active and closed quizzes" ON public.quizzes;
CREATE POLICY "Students read active and closed quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated, anon
    USING (
        public.is_sub_admin_or_admin(auth.uid()) OR
        NOW() >= start_time
    );

-- 28. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    marks INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Staff manage quiz questions" ON public.quiz_questions
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students read quiz questions" ON public.quiz_questions;
CREATE POLICY "Students read quiz questions" ON public.quiz_questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE quizzes.id = quiz_questions.quiz_id
            AND (quizzes.status IN ('active', 'closed') OR public.is_sub_admin_or_admin(auth.uid()))
        )
    );

-- 29. QUIZ ATTEMPTS & FIRST-ATTEMPT LEADERBOARD
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
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
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'timed_out', 'in_progress')),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students insert own attempts" ON public.quiz_attempts;
CREATE POLICY "Students insert own attempts" ON public.quiz_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id OR public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Students and staff read attempts" ON public.quiz_attempts;
CREATE POLICY "Students and staff read attempts" ON public.quiz_attempts
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id OR
        is_first_attempt = true OR
        public.is_sub_admin_or_admin(auth.uid())
    );

-- Index for instant leaderboard generation: Score DESC, Accuracy DESC, Time ASC
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard ON public.quiz_attempts (quiz_id, is_first_attempt, score DESC, accuracy DESC, time_spent_seconds ASC)
WHERE is_first_attempt = true;

-- 30. PDF PAGE ALLOCATIONS
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

ALTER TABLE public.pdf_page_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage pdf allocations" ON public.pdf_page_allocations;
CREATE POLICY "Staff manage pdf allocations" ON public.pdf_page_allocations
    FOR ALL
    TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Read released pdf allocations" ON public.pdf_page_allocations;
CREATE POLICY "Read released pdf allocations" ON public.pdf_page_allocations
    FOR SELECT
    TO authenticated, anon
    USING (
        release_status = 'released' OR public.is_sub_admin_or_admin(auth.uid())
    );

-- 31. STUDENT ROADMAP PROGRESS
CREATE TABLE IF NOT EXISTS public.student_roadmap_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_sub_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_sub_module_id UUID REFERENCES public.sub_modules(id) ON DELETE SET NULL,
    progress_percentage INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students manage own progress" ON public.student_roadmap_progress;
CREATE POLICY "Students manage own progress" ON public.student_roadmap_progress
    FOR ALL
    TO authenticated
    USING (auth.uid() = student_id OR public.is_sub_admin_or_admin(auth.uid()))
    WITH CHECK (auth.uid() = student_id OR public.is_sub_admin_or_admin(auth.uid()));



