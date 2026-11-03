INSERT INTO public.quiz_attempts (
    quiz_id, student_id, student_name, course_id,
    score, total_marks, total_questions, correct_count, incorrect_count, unanswered_count,
    accuracy, percentage, time_spent_seconds, is_first_attempt, is_practice, status, completed_at
) VALUES 
(
    '681e7e45-17a8-4fbf-b81c-15679395b1ab',
    '78c670d7-c653-4b33-b5ec-18b6e179de61',
    'ss',
    'e7c5127a-9b4c-4e49-a886-40e631e7b9c8',
    15, 15, 3, 3, 0, 0,
    100.0, 100.0, 135, true, false, 'completed', NOW() - INTERVAL '3 hours'
),
(
    '681e7e45-17a8-4fbf-b81c-15679395b1ab',
    '3d77894d-863d-42ea-a2fd-f04498762815',
    'teja',
    'e7c5127a-9b4c-4e49-a886-40e631e7b9c8',
    12, 15, 3, 2, 1, 0,
    80.0, 80.0, 160, true, false, 'completed', NOW() - INTERVAL '2 hours 30 minutes'
),
(
    '681e7e45-17a8-4fbf-b81c-15679395b1ab',
    '3131e813-1af8-4d6b-a609-ccae81b9f843',
    'm',
    'e7c5127a-9b4c-4e49-a886-40e631e7b9c8',
    10, 15, 3, 2, 1, 0,
    66.67, 66.67, 190, true, false, 'completed', NOW() - INTERVAL '2 hours'
),
(
    '681e7e45-17a8-4fbf-b81c-15679395b1ab',
    '691943a4-4985-462a-a106-634d2c571b69',
    'E',
    'e7c5127a-9b4c-4e49-a886-40e631e7b9c8',
    8, 15, 3, 1, 2, 0,
    53.33, 53.33, 220, true, false, 'completed', NOW() - INTERVAL '1 hour 30 minutes'
),
(
    '681e7e45-17a8-4fbf-b81c-15679395b1ab',
    '4dd355bd-93f1-44aa-a624-8230a980da07',
    'maa',
    'e7c5127a-9b4c-4e49-a886-40e631e7b9c8',
    5, 15, 3, 1, 2, 0,
    33.33, 33.33, 260, true, false, 'completed', NOW() - INTERVAL '1 hour'
)
ON CONFLICT DO NOTHING;

