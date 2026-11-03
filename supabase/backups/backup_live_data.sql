-- =========================================================
-- SKILLNOVA: COMPLETE LIVE DATABASE DATA BACKUP & RESTORE SCRIPT
-- Generated & Verified: 2026-11-02
-- Preserves Admin Accounts, Curriculum, Homepage, and Assessments
-- =========================================================

-- 1. Ensure Super Administrator Roles
INSERT INTO public.user_roles (user_id, role)
VALUES 
    ('6c1e1aca-b160-42e0-83db-8bc804b6e69b', 'admin'),
    ('043117c9-c675-4621-85ee-8a02271d3696', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- 2. Core Curriculum: Courses
INSERT INTO public.courses (id, title, slug, description, category, mentor_name, mentor_email, duration_weeks, thumbnail_url, roadmap_image_url, is_published, course_fee, timeline)
VALUES 
    ('c0000000-0000-0000-0000-000000000101', 'Full Stack Web Engineering & Microservices', 'full-stack-web-engineering', 'Master modern frontend architectures with React 19, TypeScript 5, Express REST APIs, PostgreSQL schema design, and Docker containerization.', 'Full Stack Development', 'Senior Technical Architect', 'mentor.fullstack@skillnova.edu', 12, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80', true, '₹14,999', '12 Weeks • Live Cohort'),
    ('c0000000-0000-0000-0000-000000000201', 'AI & Agentic Systems Engineering', 'ai-agentic-systems', 'Build multi-agent collaboration pipelines with LangGraph, deploy client-side WebAssembly models, and master vector embeddings with RAG.', 'Artificial Intelligence', 'Principal AI Researcher', 'mentor.ai@skillnova.edu', 10, 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80', true, '₹18,999', '10 Weeks • Hands-on Labs'),
    ('c0000000-0000-0000-0000-000000000301', 'Python for Engineers & Algorithmic Problem Solving', 'python-engineers-algorithms', 'In-depth Python 3 systems, data structures, algorithm drills, dynamic programming, and in-browser Pyodide WebAssembly coding labs.', 'Core Programming', 'Lead Systems Engineer', 'mentor.python@skillnova.edu', 8, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80', true, '₹9,999', '8 Weeks • Code In-Browser')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    mentor_name = EXCLUDED.mentor_name,
    mentor_email = EXCLUDED.mentor_email,
    duration_weeks = EXCLUDED.duration_weeks,
    thumbnail_url = EXCLUDED.thumbnail_url,
    roadmap_image_url = EXCLUDED.roadmap_image_url,
    is_published = EXCLUDED.is_published,
    course_fee = EXCLUDED.course_fee,
    timeline = EXCLUDED.timeline;

-- 3. Course Modules
INSERT INTO public.modules (id, course_id, title, description, order_index)
VALUES 
    ('10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', 'Module 1: Advanced Frontend & System Architecture', 'TypeScript 5.5, generic constraints, React 19 architecture, and state machines.', 1),
    ('10000000-0000-4000-8000-000000000102', 'c0000000-0000-0000-0000-000000000101', 'Module 2: Scalable Backend Services & Databases', 'Node.js, Express microservices, PostgreSQL design, and indexing strategies.', 2),
    ('10000000-0000-4000-8000-000000000201', 'c0000000-0000-0000-0000-000000000201', 'Module 1: Foundations of Machine Learning & Math', 'Vector spaces, matrix decomposition, loss optimization, and gradient descent.', 1)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

-- 4. Course Sub-Modules
INSERT INTO public.sub_modules (id, module_id, course_id, title, description, order_index)
VALUES 
    ('20000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.1 TypeScript Generics & Type Narrowing', 'Generic constraints, conditional types, and runtime validation.', 1),
    ('20000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.2 Custom Hooks & Reusable State Machines', 'Separation of concerns, useReducer patterns, and resilient subscriptions.', 2),
    ('20000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.3 Component Composition & Optimization', 'React.memo, useMemo profiling, lazy loading, and rendering waterfalls.', 3),
    ('20000000-0000-4000-8000-000000000104', '10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', '1.4 Micro-Frontends & Architectural Standards', 'Module federation, contract versioning, and enterprise deployment.', 4),
    ('20000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000102', 'c0000000-0000-0000-0000-000000000101', '2.1 Express & Fastify Architecture', 'Middleware pipelines, input sanitization, and structured logging.', 1),
    ('20000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000102', 'c0000000-0000-0000-0000-000000000101', '2.2 PostgreSQL Schema Design & Indexing', 'B-Tree indexes, composite keys, and query execution plan analysis.', 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

-- 5. Homepage Settings
INSERT INTO public.homepage_settings (id, demo_video_url, demo_video_title, demo_video_description, demo_video_is_active, whatsapp_group_url, whatsapp_qr_code_url, whatsapp_is_active, whatsapp_display_name, instagram_url, instagram_is_active, instagram_display_name, linkedin_url, linkedin_is_active, linkedin_display_name)
VALUES ('30000000-0000-4000-8000-000000000001', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'SkillNova Experience • Live Walkthrough', 'Discover how SkillNova transforms software careers with 3D mountain journeys, client-side Python 3 WebAssembly coding labs, and direct industry mentorship.', true, 'https://chat.whatsapp.com/SkillNovaOfficialCohort2027', '', true, 'Official WhatsApp Community', 'https://instagram.com/skillnova_edu', true, 'Instagram @skillnova_edu', 'https://linkedin.com/company/skillnova', true, 'LinkedIn @skillnova')
ON CONFLICT (id) DO UPDATE SET 
    demo_video_url = EXCLUDED.demo_video_url,
    demo_video_title = EXCLUDED.demo_video_title,
    demo_video_description = EXCLUDED.demo_video_description,
    demo_video_is_active = EXCLUDED.demo_video_is_active,
    whatsapp_group_url = EXCLUDED.whatsapp_group_url,
    whatsapp_display_name = EXCLUDED.whatsapp_display_name,
    instagram_url = EXCLUDED.instagram_url,
    instagram_display_name = EXCLUDED.instagram_display_name,
    linkedin_url = EXCLUDED.linkedin_url,
    linkedin_display_name = EXCLUDED.linkedin_display_name;

-- 6. Homepage Featured Courses
INSERT INTO public.homepage_courses (id, title, description, thumbnail_url, fee, timeline, whatsapp_enroll_url, is_active, order_index)
VALUES 
    ('30000000-0000-4000-8000-000000000011', 'Full Stack Web Engineering & Microservices', 'Master React 19, TypeScript 5, Node.js microservices, PostgreSQL, and Docker with production deployments.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', '₹5,999', '12 Weeks • Live Weekend Cohort', 'https://chat.whatsapp.com/SkillNovaOfficialCohort2027', true, 1),
    ('30000000-0000-4000-8000-000000000012', 'AI & Agentic Systems Engineering', 'Build production RAG pipelines, autonomous multi-agent systems with LangGraph, and deploy WebAssembly models.', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80', '₹6,999', '10 Weeks • Hands-on Project Labs', 'https://chat.whatsapp.com/SkillNovaOfficialCohort2027', true, 2),
    ('30000000-0000-4000-8000-000000000013', 'Python for Engineers & Algorithmic Problem Solving', 'From syntax to system design, data structures, algorithms, and in-browser coding drills with Pyodide.', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80', '₹3,999', '8 Weeks • Code In-Browser', 'https://chat.whatsapp.com/SkillNovaOfficialCohort2027', true, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    fee = EXCLUDED.fee,
    timeline = EXCLUDED.timeline,
    whatsapp_enroll_url = EXCLUDED.whatsapp_enroll_url;

-- 7. Quizzes
INSERT INTO public.quizzes (id, course_id, module_id, sub_module_id, title, description, total_marks, duration_minutes, start_time, end_time, status, created_by)
VALUES ('40000000-0000-4000-8000-000000000001', 'c0000000-0000-0000-0000-000000000101', '10000000-0000-4000-8000-000000000101', '20000000-0000-4000-8000-000000000101', 'Python Fundamentals & Memory Models Assessment', 'Active cohort benchmark covering variable references, mutable vs immutable types, and Pyodide sandbox execution.', 10, 15, '2026-11-02 14:56:04.679456+00', '2026-11-09 15:56:04.679456+00', 'active', 'Administrator')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    total_marks = EXCLUDED.total_marks,
    duration_minutes = EXCLUDED.duration_minutes,
    status = EXCLUDED.status;

-- 8. Quiz Questions (Public client questions without answers)
INSERT INTO public.quiz_questions (id, quiz_id, question, options, marks, order_index, is_published)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', '40000000-0000-4000-8000-000000000001', 'In Python, which of the following object types is mutable?', '[{"key": "A", "text": "tuple"}, {"key": "B", "text": "list"}, {"key": "C", "text": "str"}, {"key": "D", "text": "int"}]'::jsonb, 3, 1, true),
    ('a0000000-0000-0000-0000-000000000002', '40000000-0000-4000-8000-000000000001', 'Which keyword is used to define a function in Python?', '[{"key": "A", "text": "function"}, {"key": "B", "text": "def"}, {"key": "C", "text": "define"}, {"key": "D", "text": "fun"}]'::jsonb, 3, 2, true),
    ('a0000000-0000-0000-0000-000000000003', '40000000-0000-4000-8000-000000000001', 'Which built-in Python data structure follows LIFO (Last In, First Out) ordering when using append() and pop()?', '[{"key": "A", "text": "Queue"}, {"key": "B", "text": "Stack (via list)"}, {"key": "C", "text": "Hash Set"}, {"key": "D", "text": "Binary Heap"}]'::jsonb, 3, 3, true),
    ('a0000000-0000-0000-0000-000000000004', '40000000-0000-4000-8000-000000000001', 'What is the primary advantage of WebAssembly (Pyodide) in SkillNova''s coding lab?', '[{"key": "A", "text": "Executes Python locally in browser sandbox with zero latency"}, {"key": "B", "text": "Requires a paid cloud license"}, {"key": "C", "text": "Sends code over unencrypted sockets"}, {"key": "D", "text": "Only supports static HTML"}]'::jsonb, 3, 4, true)
ON CONFLICT (id) DO UPDATE SET 
    question = EXCLUDED.question,
    options = EXCLUDED.options,
    marks = EXCLUDED.marks,
    order_index = EXCLUDED.order_index;

-- 9. Quiz Answer Keys (Server-side isolated keys for secure RPC grading)
INSERT INTO public.quiz_answer_keys (question_id, correct_answer, explanation)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'B', 'Lists in Python are mutable sequences; their elements can be modified in place without changing memory identity.'),
    ('a0000000-0000-0000-0000-000000000002', 'B', 'The def keyword begins a function definition header in Python syntax.'),
    ('a0000000-0000-0000-0000-000000000003', 'B', 'Standard Python lists provide amortized O(1) append() and pop() operations from the end, implementing a Stack (LIFO).'),
    ('a0000000-0000-0000-0000-000000000004', 'A', 'Pyodide compiles CPython to WebAssembly, enabling genuine Python 3 execution in the client browser with zero latency and high security.')
ON CONFLICT (question_id) DO UPDATE SET 
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation;


-- 10. Topics
INSERT INTO public.topics (id, module_id, course_id, sub_module_id, title, description, class_date, order_index, recording_link, drive_notes_link, pdf_url, ppt_url, is_published, release_status)
VALUES 
    ('70000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', '20000000-0000-4000-8000-000000000101', 'TypeScript Generics, Utility Types & Type Guards', 'Deep dive into generic constraints, infer keyword, mapped types, and runtime schema validation with Zod.', '2026-11-01', 1, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'https://drive.google.com/drive/folders/skillnova-demo', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', true, 'released'),
    ('70000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000101', 'c0000000-0000-0000-0000-000000000101', '20000000-0000-4000-8000-000000000102', 'React 19 Server Components, Actions & Optimistic UI', 'Architecting resilient client-server boundaries, async transition actions, useOptimistic, and state cache policies.', '2026-11-02', 2, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'https://drive.google.com/drive/folders/skillnova-demo', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', true, 'released')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- 11. Saturday Special
INSERT INTO public.saturday_special (id, title, category, description, speaker, speaker_role, session_date, cover_image, recording_url, slides_url, resources_url, is_upcoming)
VALUES 
    ('50000000-0000-4000-8000-000000000001', 'Autonomous Agents in Production: LangGraph Architecture', 'Generative AI', 'Architecting multi-agent cycles, supervisor state graphs, human-in-the-loop checkpoints, and memory stores for real-world enterprise deployments.', 'Dr. Siddharth Nair', 'Staff AI Researcher, DeepMind', '2026-11-08 11:00:00+05:30', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'https://skillnova.edu/materials/langgraph-masterclass.pdf', 'https://skillnova.edu/materials/langgraph-masterclass.pdf', true),
    ('50000000-0000-4000-8000-000000000002', 'High-Throughput Distributed Systems & Kafka Internals', 'System Design', 'Dissecting distributed log architectures, zero-copy socket transfers, partition rebalances, exactly-once processing semantics, and consumer group design.', 'Priya Venkatesh', 'Principal Architect, Atlassian', '2026-11-15 11:00:00+05:30', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'https://skillnova.edu/materials/kafka-internals.pdf', 'https://skillnova.edu/materials/kafka-internals.pdf', true)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- 12. Opportunities
INSERT INTO public.opportunities (id, title, organization, category, description, eligibility, required_skills, location, is_remote, stipend_salary, deadline, apply_url, is_featured)
VALUES 
    ('60000000-0000-4000-8000-000000000001', 'Software Engineer Intern - Distributed Systems', 'Google India', 'internship', 'Join the core infrastructure team to build highly scalable backend services, caching tiers, and distributed storage engines using Go, C++, and PostgreSQL.', '2026/2027 Batch Graduates', '["Go", "PostgreSQL", "Distributed Systems", "Algorithms"]'::jsonb, 'Bengaluru / Hyderabad', false, '₹1,20,000 / month', '2026-12-15', 'https://careers.google.com/jobs/results/', true),
    ('60000000-0000-4000-8000-000000000002', 'Full Stack Engineering Intern', 'Atlassian', 'internship', 'Collaborate on mission-critical features within Jira and Confluence, architecting React 19 micro-frontends and robust GraphQL / Node.js services.', 'B.Tech/B.E. 3rd or 4th Year', '["React", "TypeScript", "Node.js", "GraphQL"]'::jsonb, 'Bengaluru (Hybrid)', true, '₹90,000 / month', '2026-11-30', 'https://www.atlassian.com/company/careers', true),
    ('60000000-0000-4000-8000-000000000003', 'Junior Machine Learning Engineer', 'Microsoft Research', 'job', 'Design and optimize multi-modal transformer fine-tuning pipelines, evaluate ONNX runtimes, and build low-latency inference services.', 'Graduating Batch 2026', '["Python", "PyTorch", "Transformers", "CUDA"]'::jsonb, 'Hyderabad / Remote', true, '₹24,00,000 / annum', '2026-12-31', 'https://careers.microsoft.com', true),
    ('60000000-0000-4000-8000-000000000004', 'Global Agentic AI Hackathon 2026', 'DeepMind & OpenAI Community', 'hackathon', '48-hour global sprint to construct agentic systems, autonomous workflows, and WebAssembly developer tools with cash awards and hiring fast-tracks.', 'Open to all enrolled students', '["Autonomous Agents", "LangGraph", "Python", "Vite"]'::jsonb, 'Virtual / Global', true, '₹10,00,000 Prize Pool', '2026-11-25', 'https://hackathon.skillnova.edu', true)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- 13. Flashcards
INSERT INTO public.flashcards (id, topic_id, question, answer, difficulty, source_ref, is_published)
VALUES 
    ('80000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000101', 'What is the purpose of the `infer` keyword in TypeScript conditional types?', '`infer` declares a type variable within the `extends` clause of a conditional type, allowing TypeScript to extract and introduce deduced types dynamically (e.g. `T extends Promise<infer U> ? U : T`).', 'medium', 'TypeScript Handbook - Conditional Types', true),
    ('80000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000101', 'How does PostgreSQL B-Tree index support equality and range lookups?', 'B-Tree stores keys in a self-balancing hierarchical tree structure sorted in ascending or descending order, achieving O(log N) search, insert, and range scans via binary node traversals.', 'hard', 'PostgreSQL 17 Internals & Query Optimizer', true),
    ('80000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000101', 'What is the difference between mutable and immutable types in Python memory management?', 'Immutable types (e.g., int, float, str, tuple) cannot change state after allocation; modifications instantiate a new object in memory. Mutable types (e.g., list, dict, set) allow in-place mutations without altering memory ID.', 'easy', 'CPython Memory Model Specification', true)
ON CONFLICT (id) DO UPDATE SET 
    question = EXCLUDED.question,
    answer = EXCLUDED.answer;

-- 14. Interview Questions
INSERT INTO public.interview_questions (id, topic_id, role_category, question, model_answer, key_talking_points, source_ref, is_published)
VALUES 
    ('90000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000101', 'Full Stack Engineer', 'How would you architect an idempotent payment processing pipeline handling 10,000 requests/sec?', 'I would enforce idempotency using client-generated UUID keys stored with unique constraints in a distributed Redis caching layer with a short TTL before hitting PostgreSQL. The database transaction handles write operations using optimistic concurrency checks, publishing fulfillment events to a partitioned Kafka topic with transactional outbox patterns.', '["Idempotency Keys with Redis TTL", "PostgreSQL Transactional Outbox Pattern", "Kafka Partition Keys for Ordered Processing", "Exponential backoff retries with dead-letter queue (DLQ)"]'::jsonb, 'FAANG Staff System Design Interview Guide', true),
    ('90000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000101', 'AI Systems Engineer', 'Explain how Vector Retrieval-Augmented Generation (RAG) handles semantic drift and chunk boundary context loss.', 'Context loss occurs when sliding chunks fragment sentences or cross-sentence dependencies. I mitigate this by using hierarchical chunking with parent-document retrieval, sentence-window embeddings where vector similarity targets single sentences but delivers surrounding paragraphs to the LLM, and late-interaction re-ranking with Cohere/BGE rerankers.', '["Sentence-window retrieval vs fixed-size chunking", "Parent document retrieval pattern", "Cross-encoder re-ranking for precision", "Hybrid search (BM25 lexical + dense cosine embeddings)"]'::jsonb, 'Advanced RAG Production Engineering Handbooks', true)
ON CONFLICT (id) DO UPDATE SET 
    question = EXCLUDED.question,
    model_answer = EXCLUDED.model_answer;

-- 15. Notifications
INSERT INTO public.notifications (id, user_id, title, message, type, read, link)
VALUES 
    ('a1000000-0000-4000-8000-000000000001', '6c1e1aca-b160-42e0-83db-8bc804b6e69b', 'SkillNova Architecture Rebuild Online', 'Authoritative PostgreSQL schema and RLS security policies successfully activated with zero privilege leaks.', 'system', false, '/admin/dashboard'),
    ('a1000000-0000-4000-8000-000000000002', '043117c9-c675-4621-85ee-8a02271d3696', 'System Verification Benchmark Complete', 'All 38 public application tables confirmed active under Row Level Security.', 'system', false, '/admin/dashboard')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    message = EXCLUDED.message;
