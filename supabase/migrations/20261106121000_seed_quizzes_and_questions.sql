-- 20261106121000_seed_quizzes_and_questions.sql
-- Allow authenticated staff/admins to manage quizzes, questions, and answers smoothly
DROP POLICY IF EXISTS "Staff manage quizzes" ON public.quizzes;
CREATE POLICY "Staff manage quizzes" ON public.quizzes
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Staff manage quiz questions" ON public.quiz_questions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff read answer keys" ON public.quiz_answer_keys;
CREATE POLICY "Staff read answer keys" ON public.quiz_answer_keys
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert baseline quiz into public.quizzes
INSERT INTO public.quizzes (
    id, course_id, title, description, total_marks, duration_minutes,
    start_time, end_time, status, created_by
)
SELECT
    '681e7e45-17a8-4fbf-b81c-15679395b1ab'::uuid,
    c.id,
    'Full Stack Architecture & Systems Assessment',
    'Official cohort assessment covering React state machines, asynchronous queues, REST contracts, and PostgreSQL modeling.',
    15,
    30,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '7 days',
    'active',
    'SkillNova Lead Instructor'
FROM public.courses c
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
    status = 'active',
    start_time = NOW() - INTERVAL '1 day',
    end_time = NOW() + INTERVAL '7 days';

-- Insert questions
INSERT INTO public.quiz_questions (
    id, quiz_id, question, options, marks, order_index, is_published
) VALUES
(
    '11111111-1111-4000-8000-000000000001'::uuid,
    '681e7e45-17a8-4fbf-b81c-15679395b1ab'::uuid,
    'Which React 19 hook is used to handle transitions without blocking UI updates?',
    '["useTransition", "useDeferredValue", "useId", "useActionState"]'::jsonb,
    5,
    1,
    true
),
(
    '11111111-1111-4000-8000-000000000002'::uuid,
    '681e7e45-17a8-4fbf-b81c-15679395b1ab'::uuid,
    'In PostgreSQL, which index type is most optimal for full-text keyword searches?',
    '["B-Tree", "GIN", "Hash", "BRIN"]'::jsonb,
    5,
    2,
    true
),
(
    '11111111-1111-4000-8000-000000000003'::uuid,
    '681e7e45-17a8-4fbf-b81c-15679395b1ab'::uuid,
    'Which HTTP status code signifies that a request has been accepted for background asynchronous processing?',
    '["200 OK", "201 Created", "202 Accepted", "204 No Content"]'::jsonb,
    5,
    3,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Insert answer keys
INSERT INTO public.quiz_answer_keys (
    question_id, correct_answer, explanation
) VALUES
(
    '11111111-1111-4000-8000-000000000001'::uuid,
    'useTransition',
    'useTransition allows marking state updates as non-blocking transitions.'
),
(
    '11111111-1111-4000-8000-000000000002'::uuid,
    'GIN',
    'GIN (Generalized Inverted Index) is designed for composite and full-text documents.'
),
(
    '11111111-1111-4000-8000-000000000003'::uuid,
    '202 Accepted',
    'HTTP 202 Accepted indicates the request is accepted for processing, but processing has not completed.'
)
ON CONFLICT (question_id) DO NOTHING;

