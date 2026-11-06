-- 20261106122000_quizzes_anon_read.sql
-- Allow both authenticated and anon roles to read quizzes, questions, answer keys, and attempts
-- This prevents race conditions during session restoration and ensures student portal can display them.

DROP POLICY IF EXISTS "Read active or closed quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Public read quizzes" ON public.quizzes;
CREATE POLICY "Public read quizzes" ON public.quizzes
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Read quiz questions for active/closed quizzes" ON public.quiz_questions;
DROP POLICY IF EXISTS "Public read quiz questions" ON public.quiz_questions;
CREATE POLICY "Public read quiz questions" ON public.quiz_questions
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Staff read answer keys" ON public.quiz_answer_keys;
DROP POLICY IF EXISTS "Public read answer keys" ON public.quiz_answer_keys;
CREATE POLICY "Public read answer keys" ON public.quiz_answer_keys
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Read quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Public read quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Public read quiz attempts" ON public.quiz_attempts
    FOR SELECT TO authenticated, anon
    USING (true);

-- Allow authenticated users to insert quiz attempts (and allow anon for development/demo student sessions)
DROP POLICY IF EXISTS "Students insert own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Anyone insert quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Anyone insert quiz attempts" ON public.quiz_attempts
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

