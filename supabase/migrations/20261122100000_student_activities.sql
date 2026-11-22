-- ==============================================================================
-- SKILLNOVA PLATFORM: STUDENT ACTIVITY TRACKING MIGRATION
-- Captures meaningful student learning interactions: videos, slides, docs, quizzes, lab code
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (
        activity_type IN (
            'video_view',
            'slide_view',
            'pdf_view',
            'quiz_attempt',
            'module_complete',
            'topic_complete',
            'practical_submit'
        )
    ),
    item_id TEXT NOT NULL,
    item_title TEXT,
    xp_earned INT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for high-performance dashboard analytics & streak calculations
CREATE INDEX IF NOT EXISTS idx_student_activities_student ON public.student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_created ON public.student_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_activities_type ON public.student_activities(activity_type);

-- Row Level Security (RLS)
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;

-- Students can view only their own activity history; Staff can review cohort activities
DROP POLICY IF EXISTS "Students view own activities or Staff" ON public.student_activities;
CREATE POLICY "Students view own activities or Staff" ON public.student_activities
    FOR SELECT
    USING (
        auth.uid() = student_id
        OR public.is_sub_admin_or_admin(auth.uid())
    );

-- Students can insert their own activity records
DROP POLICY IF EXISTS "Students insert own activities" ON public.student_activities;
CREATE POLICY "Students insert own activities" ON public.student_activities
    FOR INSERT
    WITH CHECK (
        auth.uid() = student_id
    );

