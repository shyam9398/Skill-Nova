-- 20261106_quiz_rls_and_seed.sql
-- Ensure authenticated students can read all scheduled, active, and upcoming quizzes
DROP POLICY IF EXISTS "Read active or closed quizzes" ON public.quizzes;
CREATE POLICY "Read active or closed quizzes" ON public.quizzes
    FOR SELECT TO authenticated
    USING (true);

-- Ensure staff can manage all quizzes
DROP POLICY IF EXISTS "Staff manage quizzes" ON public.quizzes;
CREATE POLICY "Staff manage quizzes" ON public.quizzes
    FOR ALL TO authenticated
    USING (public.is_sub_admin_or_admin(auth.uid()) OR public.can_manage_course(auth.uid(), course_id))
    WITH CHECK (public.is_sub_admin_or_admin(auth.uid()) OR public.can_manage_course(auth.uid(), course_id));

-- Ensure quiz questions are visible to authenticated students
DROP POLICY IF EXISTS "Read quiz questions for active/closed quizzes" ON public.quiz_questions;
CREATE POLICY "Read quiz questions for active/closed quizzes" ON public.quiz_questions
    FOR SELECT TO authenticated
    USING (true);

-- Ensure quiz attempts can be submitted and read for leaderboard rankings
DROP POLICY IF EXISTS "Students insert own attempts" ON public.quiz_attempts;
CREATE POLICY "Students insert own attempts" ON public.quiz_attempts
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Read quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Read quiz attempts" ON public.quiz_attempts
    FOR SELECT TO authenticated
    USING (true);

-- Seed an official baseline active quiz if none exists yet
DO $$
DECLARE
    v_course_id UUID;
    v_quiz_id UUID := '681e7e45-17a8-4fbf-b81c-15679395b1ab';
    v_q1_id UUID := '11111111-1111-4000-8000-000000000001';
    v_q2_id UUID := '11111111-1111-4000-8000-000000000002';
    v_q3_id UUID := '11111111-1111-4000-8000-000000000003';
BEGIN
    SELECT id INTO v_course_id FROM public.courses LIMIT 1;
    IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.quizzes WHERE id = v_quiz_id) THEN
        INSERT INTO public.quizzes (
            id, course_id, title, description, total_marks, duration_minutes,
            start_time, end_time, status, created_by
        ) VALUES (
            v_quiz_id,
            v_course_id,
            'Full Stack Architecture & Systems Assessment',
            'Official cohort assessment covering React state machines, asynchronous queues, REST contracts, and PostgreSQL modeling.',
            15,
            30,
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '7 days',
            'active',
            'SkillNova Lead Instructor'
        );

        INSERT INTO public.quiz_questions (
            id, quiz_id, question, options, marks, order_index, is_published
        ) VALUES
        (
            v_q1_id,
            v_quiz_id,
            'Which React 19 hook is used to handle transitions without blocking UI updates?',
            '["useTransition", "useDeferredValue", "useId", "useActionState"]'::jsonb,
            5,
            1,
            true
        ),
        (
            v_q2_id,
            v_quiz_id,
            'In PostgreSQL, which index type is most optimal for full-text keyword searches?',
            '["B-Tree", "GIN", "Hash", "BRIN"]'::jsonb,
            5,
            2,
            true
        ),
        (
            v_q3_id,
            v_quiz_id,
            'Which HTTP status code signifies that a request has been accepted for background asynchronous processing?',
            '["200 OK", "201 Created", "202 Accepted", "204 No Content"]'::jsonb,
            5,
            3,
            true
        );

        INSERT INTO public.quiz_answer_keys (
            question_id, correct_answer, explanation
        ) VALUES
        (
            v_q1_id,
            'useTransition',
            'useTransition allows marking state updates as non-blocking transitions.'
        ),
        (
            v_q2_id,
            'GIN',
            'GIN (Generalized Inverted Index) is designed for composite and full-text documents.'
        ),
        (
            v_q3_id,
            '202 Accepted',
            'HTTP 202 Accepted indicates the request is accepted for processing, but processing has not completed.'
        );
    END IF;
END $$;
