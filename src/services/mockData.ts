import type { User, Course, CourseModule, Topic, SaturdaySpecial, Opportunity, CareerBlueprint, AIGenerationJob, Notification } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@skillnova.edu',
    full_name: 'Dr. Evelyn Reed',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: '2026-01-10T09:00:00Z',
    permissions: {
      can_manage_courses: true,
      can_upload_resources: true,
      can_generate_ai: true,
      can_publish_opportunities: true,
    },
  },
  {
    id: 'usr-mentor-1',
    email: 'mentor@skillnova.edu',
    full_name: 'Vikram Patel',
    role: 'sub_admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: '2026-01-15T10:30:00Z',
    assigned_courses: ['course-fs-101', 'course-ai-201'],
    permissions: {
      can_manage_courses: true,
      can_upload_resources: true,
      can_generate_ai: true,
      can_publish_opportunities: true,
    },
  },
  {
    id: 'usr-student-1',
    email: 'student@skillnova.edu',
    full_name: 'Aarav Sharma',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    college: 'Apex Institute of Technology',
    branch: 'Computer Science & Engineering',
    year_of_study: '3rd Year (Batch 2027)',
    status: 'active',
    created_at: '2026-02-01T11:00:00Z',
    assigned_courses: ['course-fs-101', 'course-ai-201', 'course-dsa-301'],
  },
  {
    id: 'usr-student-2',
    email: 'pooja.verma@skillnova.edu',
    full_name: 'Pooja Verma',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    college: 'National Institute of Tech',
    branch: 'Information Technology',
    year_of_study: '4th Year (Batch 2026)',
    status: 'active',
    created_at: '2026-02-05T14:20:00Z',
    assigned_courses: ['course-fs-101', 'course-devops-401'],
  },
  {
    id: 'usr-student-3',
    email: 'rohan.nair@skillnova.edu',
    full_name: 'Rohan Nair',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    college: 'Metropolitan Engineering College',
    branch: 'Data Science & AI',
    year_of_study: '2nd Year (Batch 2028)',
    status: 'active',
    created_at: '2026-02-12T08:45:00Z',
    assigned_courses: ['course-ai-201', 'course-dsa-301'],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-fs-101',
    title: 'Full Stack Web Development & Microservices',
    description: 'Master modern frontend with React/TypeScript, scalable backend APIs with Node/Postgres, and Dockerized microservices architecture.',
    slug: 'full-stack-web-development',
    category: 'Full Stack',
    mentor_name: 'Vikram Patel',
    mentor_email: 'mentor@skillnova.edu',
    duration_weeks: 16,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    roadmap_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    enrolled_students_count: 48,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-18T16:00:00Z',
    is_published: true,
  },
  {
    id: 'course-ai-201',
    title: 'Artificial Intelligence & Machine Learning Engineering',
    description: 'From statistical learning to deep neural networks, transformer models, prompt engineering, and production LLM deployment.',
    slug: 'artificial-intelligence-machine-learning',
    category: 'AI & Data Science',
    mentor_name: 'Dr. Evelyn Reed',
    mentor_email: 'admin@skillnova.edu',
    duration_weeks: 14,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
    roadmap_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    enrolled_students_count: 42,
    created_at: '2026-01-22T11:00:00Z',
    updated_at: '2026-02-20T12:00:00Z',
    is_published: true,
  },
  {
    id: 'course-dsa-301',
    title: 'Data Structures, Algorithms & System Design',
    description: 'Crack tier-1 product company interviews with rigorous algorithmic mastery, leetcode patterns, and distributed system design.',
    slug: 'data-structures-algorithms-system-design',
    category: 'Computer Science Core',
    mentor_name: 'Vikram Patel',
    mentor_email: 'mentor@skillnova.edu',
    duration_weeks: 12,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    roadmap_image_url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80',
    enrolled_students_count: 50,
    created_at: '2026-01-25T09:30:00Z',
    updated_at: '2026-02-22T14:15:00Z',
    is_published: true,
  },
  {
    id: 'course-devops-401',
    title: 'Cloud Native DevOps & Kubernetes Orchestration',
    description: 'Build robust CI/CD pipelines, automate infrastructure as code with Terraform, containerize with Docker, and orchestrate with Kubernetes.',
    slug: 'cloud-native-devops-kubernetes',
    category: 'Cloud & Infrastructure',
    mentor_name: 'Vikram Patel',
    mentor_email: 'mentor@skillnova.edu',
    duration_weeks: 10,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    roadmap_image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
    enrolled_students_count: 36,
    created_at: '2026-02-01T15:00:00Z',
    updated_at: '2026-02-24T18:00:00Z',
    is_published: true,
  },
];

export const INITIAL_MODULES: CourseModule[] = [
  {
    id: 'mod-fs-1',
    course_id: 'course-fs-101',
    title: 'Module 1: Advanced TypeScript & React Architecture',
    order_index: 1,
    description: 'Type systems, custom hooks, state machines, and performant component patterns.',
  },
  {
    id: 'mod-fs-2',
    course_id: 'course-fs-101',
    title: 'Module 2: Scalable Backend Services with Node.js & PostgreSQL',
    order_index: 2,
    description: 'RESTful API architecture, ACID transactions, Prisma ORM, and Redis caching.',
  },
  {
    id: 'mod-fs-3',
    course_id: 'course-fs-101',
    title: 'Module 3: Authentication, WebSockets & Realtime Systems',
    order_index: 3,
    description: 'OAuth 2.0, JWT rotation, socket.io bidirectionality, and security auditing.',
  },
  {
    id: 'mod-ai-1',
    course_id: 'course-ai-201',
    title: 'Module 1: Mathematics of Machine Learning & Feature Engineering',
    order_index: 1,
    description: 'Linear algebra, gradient descent calculus, probability, and exploratory data analysis.',
  },
  {
    id: 'mod-ai-2',
    course_id: 'course-ai-201',
    title: 'Module 2: Deep Learning Architectures & CNNs/RNNs',
    order_index: 2,
    description: 'Backpropagation, PyTorch tensors, computer vision, and sequence modeling.',
  },
  {
    id: 'mod-ai-3',
    course_id: 'course-ai-201',
    title: 'Module 3: Large Language Models & Agentic Frameworks',
    order_index: 3,
    description: 'Transformers, self-attention, RAG pipelines, vector stores, and tool calling.',
  },
];

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 'top-fs-101',
    module_id: 'mod-fs-1',
    course_id: 'course-fs-101',
    title: 'TypeScript Generics, Utility Types & Type Guards',
    description: 'Deep dive into generic constraints, infer keyword, mapped types, and runtime schema validation with Zod.',
    class_date: '2026-02-22',
    order_index: 1,
    recording_link: 'https://drive.google.com/file/d/1demo-recording-typescript-generics/view',
    drive_notes_link: 'https://drive.google.com/drive/folders/1demo-notes-ts-generics',
    pdf_url: 'https://skillnova-cdn.internal/assets/notes/typescript-advanced-generics.pdf',
    ppt_url: 'https://skillnova-cdn.internal/assets/slides/typescript-generics-deck.pptx',
    reference_links: [
      { title: 'TypeScript Official Handbook on Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' },
      { title: 'Total TypeScript Generics Tutorial', url: 'https://www.totaltypescript.com' },
    ],
    is_published: true,
    has_recording: true,
    has_notes: true,
    has_quiz: true,
    has_flashcards: true,
    created_at: '2026-02-22T17:00:00Z',
  },
  {
    id: 'top-fs-102',
    module_id: 'mod-fs-1',
    course_id: 'course-fs-101',
    title: 'React Concurrent Mode, Suspense & Server Components',
    description: 'Understanding Fiber reconciliation, startTransition, useDeferredValue, and streaming SSR.',
    class_date: '2026-02-24',
    order_index: 2,
    recording_link: 'https://drive.google.com/file/d/1demo-recording-react-concurrent/view',
    drive_notes_link: 'https://drive.google.com/drive/folders/1demo-notes-react-concurrent',
    pdf_url: 'https://skillnova-cdn.internal/assets/notes/react-19-internals.pdf',
    reference_links: [
      { title: 'React 19 Release Notes & Server Components', url: 'https://react.dev/blog/2024/04/25/react-19' },
    ],
    is_published: true,
    has_recording: true,
    has_notes: true,
    has_quiz: true,
    has_flashcards: true,
    created_at: '2026-02-24T18:00:00Z',
  },
  {
    id: 'top-fs-103',
    module_id: 'mod-fs-2',
    course_id: 'course-fs-101',
    title: 'PostgreSQL Query Optimization, Indexing & EXPLAIN ANALYZE',
    description: 'B-tree vs GIN indexes, avoiding N+1 problems, connection pooling with PgBouncer, and deadlock prevention.',
    class_date: '2026-02-26',
    order_index: 1,
    recording_link: 'https://drive.google.com/file/d/1demo-recording-postgres-indexing/view',
    drive_notes_link: 'https://drive.google.com/drive/folders/1demo-notes-postgres-indexing',
    pdf_url: 'https://skillnova-cdn.internal/assets/notes/postgres-performance-guide.pdf',
    is_published: true,
    has_recording: true,
    has_notes: true,
    has_quiz: true,
    has_flashcards: false,
    created_at: '2026-02-26T18:30:00Z',
  },
  {
    id: 'top-ai-201',
    module_id: 'mod-ai-3',
    course_id: 'course-ai-201',
    title: 'Building Production RAG Pipelines with Vector Databases & Hybrid Search',
    description: 'Chunking strategies, dense embeddings, BM25 sparse search, reciprocal rank fusion (RRF), and hallucination evaluation.',
    class_date: '2026-02-27',
    order_index: 1,
    recording_link: 'https://drive.google.com/file/d/1demo-recording-rag-pipelines/view',
    drive_notes_link: 'https://drive.google.com/drive/folders/1demo-notes-rag-embeddings',
    pdf_url: 'https://skillnova-cdn.internal/assets/notes/rag-production-handbook.pdf',
    ppt_url: 'https://skillnova-cdn.internal/assets/slides/rag-architecture-deck.pptx',
    reference_links: [
      { title: 'Pinecone Vector Search Architecture', url: 'https://www.pinecone.io/learn/' },
      { title: 'RAG Triad Evaluation by TruLens', url: 'https://www.trulens.org' },
    ],
    is_published: true,
    has_recording: true,
    has_notes: true,
    has_quiz: true,
    has_flashcards: true,
    created_at: '2026-02-27T17:15:00Z',
  },
];

export const INITIAL_FLASHCARDS = [
  {
    id: 'fc-1',
    topic_id: 'top-fs-101',
    topic_title: 'TypeScript Generics, Utility Types & Type Guards',
    question: 'What is the purpose of the "infer" keyword in TypeScript conditional types?',
    answer: 'The "infer" keyword introduces a type variable within the conditional check that TypeScript deduces dynamically, commonly used to extract return types (ReturnType<T>) or element types.',
    difficulty: 'medium' as const,
    source_ref: 'Page 14, TypeScript Advanced Type Mechanics (SkillNova PDF)',
  },
  {
    id: 'fc-2',
    topic_id: 'top-fs-101',
    topic_title: 'TypeScript Generics, Utility Types & Type Guards',
    question: 'Difference between "unknown" and "any" in TypeScript?',
    answer: '"any" disables all type-checking completely, whereas "unknown" is the type-safe counterpart where no operations can be performed on the variable until it is narrowed via type guards.',
    difficulty: 'easy' as const,
    source_ref: 'Page 6, Section 2.1: Safety Primitives',
  },
  {
    id: 'fc-3',
    topic_id: 'top-fs-101',
    topic_title: 'TypeScript Generics, Utility Types & Type Guards',
    question: 'What is a Discriminated Union in TypeScript?',
    answer: 'A pattern where multiple object types share a common literal property (e.g. { type: "success" } vs { type: "error" }), allowing the compiler to narrow types automatically in switch/if blocks.',
    difficulty: 'easy' as const,
    source_ref: 'Page 22, Pattern Guide: Discriminated Unions',
  },
  {
    id: 'fc-4',
    topic_id: 'top-ai-201',
    topic_title: 'Building Production RAG Pipelines',
    question: 'What is Reciprocal Rank Fusion (RRF)?',
    answer: 'RRF is an algorithm that combines rankings from multiple information retrieval systems (e.g. dense vector cosine similarity and sparse BM25 keyword search) by summing reciprocal ranks with a smoothing constant.',
    difficulty: 'hard' as const,
    source_ref: 'Page 31, Hybrid Search Integration & Re-ranking',
  },
  {
    id: 'fc-5',
    topic_id: 'top-ai-201',
    topic_title: 'Building Production RAG Pipelines',
    question: 'Why is naive chunking problematic in RAG systems?',
    answer: 'Naive fixed-size chunking can split sentences or paragraphs midway, breaking semantic context, separating coreference pronouns from their antecedents, and degrading retrieval precision.',
    difficulty: 'medium' as const,
    source_ref: 'Page 18, Semantic vs Fixed Chunking Tradeoffs',
  },
];

export const INITIAL_QUIZZES = [
  {
    id: 'quiz-1',
    topic_id: 'top-fs-101',
    topic_title: 'TypeScript Generics, Utility Types & Type Guards',
    question: 'Given type ReturnPromise<T> = T extends (...args: any[]) => Promise<infer R> ? R : never; What is ReturnPromise<() => Promise<number>>?',
    options: ['Promise<number>', 'number', 'never', 'any'],
    correct_index: 1,
    explanation: 'The conditional type unrolls the Promise return type through "infer R", resolving directly to "number".',
    source_ref: 'Lecture 4, Slide 28 & Syllabus PDF Page 16',
  },
  {
    id: 'quiz-2',
    topic_id: 'top-fs-101',
    topic_title: 'TypeScript Generics, Utility Types & Type Guards',
    question: 'Which of the following built-in utility types makes all properties of an object required and non-nullable?',
    options: ['Partial<T>', 'Readonly<T>', 'Required<T>', 'Omit<T, K>'],
    correct_index: 2,
    explanation: 'Required<T> removes the optional modifier (?) from all fields in type T.',
    source_ref: 'Syllabus PDF Page 9, Standard Utility Types',
  },
  {
    id: 'quiz-3',
    topic_id: 'top-ai-201',
    topic_title: 'Building Production RAG Pipelines',
    question: 'When evaluating a RAG pipeline, the "Faithfulness" metric measures:',
    options: [
      'Whether the retrieved documents contain user keywords',
      'Whether the generated response is grounded exclusively in the retrieved context',
      'The milliseconds taken to generate embeddings',
      'The number of tokens consumed by the context window',
    ],
    correct_index: 1,
    explanation: 'Faithfulness verifies that the generated claim can be inferred directly from the retrieved context without hallucinations.',
    source_ref: 'RAG Triad Handbook, Section 4.2',
  },
];

export const INITIAL_INTERVIEWS = [
  {
    id: 'iq-1',
    topic_id: 'top-fs-101',
    role_category: 'Frontend & Full Stack Engineer',
    question: 'How do you design a custom type-safe Event Emitter in TypeScript with generic payloads?',
    model_answer: 'Define an interface mapping event names to their payload types, e.g. Record<string, any>. The EventEmitter class is parameterized by this interface T. The .on<K extends keyof T>(event: K, listener: (payload: T[K]) => void) enforces compile-time verification so passing the wrong payload throws a TypeScript error.',
    key_talking_points: [
      'Generics with keyof constraint',
      'Mapped types for event lookup',
      'Memory leak prevention via listener unsubscribe callbacks',
    ],
    source_ref: 'Module 1 Architecture Guide: Type-safe Event Busses',
  },
  {
    id: 'iq-2',
    topic_id: 'top-ai-201',
    role_category: 'AI/ML & LLM Engineer',
    question: 'How do you mitigate "Lost in the Middle" phenomenon in long context LLMs?',
    model_answer: 'Research shows LLMs attend better to information placed at the absolute start or end of the prompt context. Mitigation strategies include placing the most critical retrieved chunks or system instructions at the very beginning and immediate end of the prompt, using re-ranking models (like Cohere Rerank), and chunk summarization before synthesis.',
    key_talking_points: [
      'Positional bias in transformer self-attention weights',
      'Re-ranking algorithms prioritizing relevant documents at boundaries',
      'Lost-in-the-middle paper findings (Liu et al., 2023)',
    ],
    source_ref: 'Advanced RAG Engineering, Page 44',
  },
];

export const INITIAL_SATURDAY_SPECIAL: SaturdaySpecial[] = [
  {
    id: 'sat-1',
    title: 'Building Autonomous Multi-Agent AI Systems with LangGraph & Google Gemini 2.0',
    category: 'Agentic AI',
    description: 'Explore agent topologies, cyclic state graphs, deterministic tool verification, human-in-the-loop breakpoints, and multi-agent coordination patterns for production workloads.',
    speaker: 'Dr. Evelyn Reed',
    speaker_role: 'Antigravity AI Fellow & SkillNova Lead',
    session_date: 'Saturday, Nov 07, 2026 • 10:00 AM IST',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    recording_url: 'https://drive.google.com/file/d/1sat-agentic-ai-recording/view',
    slides_url: 'https://skillnova-cdn.internal/slides/agentic-ai-langgraph.pdf',
    resources_url: 'https://github.com/skillnova-academy/langgraph-agentic-starter',
    is_upcoming: false,
    attendees_count: 84,
  },
  {
    id: 'sat-2',
    title: 'Zero-Trust Architecture & Cloud Security Operations for High-Scale Fintech',
    category: 'Cybersecurity',
    description: 'Hands-on breakdown of eBPF kernel tracing, mutual TLS with Istio service mesh, automated secret rotation with Vault, and threat detection pipelines.',
    speaker: 'Vikram Patel',
    speaker_role: 'Principal Cloud Architect',
    session_date: 'Saturday, Nov 14, 2026 • 11:30 AM IST',
    cover_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    recording_url: 'https://drive.google.com/file/d/1sat-security-recording/view',
    slides_url: 'https://skillnova-cdn.internal/slides/zero-trust-cloud.pdf',
    is_upcoming: false,
    attendees_count: 76,
  },
  {
    id: 'sat-3',
    title: 'Next-Gen Robotics & Spatial AI: SLAM, Gaussian Splatting & Embodied Models',
    category: 'Robotics',
    description: 'Discover how 3D Gaussian Splatting and spatial foundation models are transforming autonomous navigation, robotic grasping, and sim-to-real transfer.',
    speaker: 'Arunav Sengupta',
    speaker_role: 'Robotics Research Scientist',
    session_date: 'Saturday, Nov 21, 2026 • 04:00 PM IST',
    cover_image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    is_upcoming: true,
    attendees_count: 112,
  },
  {
    id: 'sat-4',
    title: 'Large Language Models Under the Hood: Implementing Attention from Scratch',
    category: 'Large Language Models',
    description: 'Live coding multi-head self-attention, rotary positional embeddings (RoPE), KV cache optimization, and flash attention concepts in pure PyTorch.',
    speaker: 'Sneha Kapoor',
    speaker_role: 'Staff ML Researcher',
    session_date: 'Saturday, Nov 28, 2026 • 02:00 PM IST',
    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    is_upcoming: true,
    attendees_count: 145,
  },
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Software Development Engineer Intern (Backend & Cloud)',
    organization: 'Atlassian Engineering',
    category: 'internship',
    description: 'Work with the Jira Cloud Core Infrastructure team designing high-throughput reactive microservices, distributed caching, and zero-downtime deployment pipelines.',
    eligibility: 'Pre-final and Final year B.Tech/M.Tech (CS/IT/ECE) students with strong algorithmic foundation.',
    required_skills: ['Java / Go', 'Distributed Systems', 'PostgreSQL', 'Docker', 'REST / gRPC'],
    location: 'Bengaluru / Hybrid',
    is_remote: false,
    stipend_salary: '₹85,000 / month',
    deadline: '2026-11-20',
    apply_url: 'https://www.atlassian.com/company/careers',
    published_at: '2026-10-28T09:00:00Z',
    is_featured: true,
  },
  {
    id: 'opp-2',
    title: 'AI/ML Research Fellow & LLM Engineer Intern',
    organization: 'Google DeepMind Research',
    category: 'internship',
    description: 'Collaborate with researchers on reasoning benchmarks, reinforcement learning from AI feedback (RLAIF), and high-efficiency model pruning for edge devices.',
    eligibility: 'Graduating 2026 or 2027. Demonstrated proficiency with PyTorch, Transformer architectures, and research publications or high-caliber open-source contributions.',
    required_skills: ['PyTorch', 'Python', 'Transformer Models', 'Linear Algebra', 'CUDA'],
    location: 'Remote / Global',
    is_remote: true,
    stipend_salary: '₹1,20,000 / month',
    deadline: '2026-11-25',
    apply_url: 'https://careers.google.com/jobs/results/',
    published_at: '2026-10-30T11:00:00Z',
    is_featured: true,
  },
  {
    id: 'opp-3',
    title: 'Smart India Global Hackathon 2026 (Innovation Challenge)',
    organization: 'Ministry of Education & Innovation Cell',
    category: 'hackathon',
    description: 'Nationwide innovation hackathon solving real-world challenges in Smart Healthcare, Clean Energy, Autonomous Logistics, and AI in Governance with ₹10,00,000+ prize pool.',
    eligibility: 'Undergraduate and postgraduate teams of 4–6 students with at least one female teammate.',
    required_skills: ['Problem Solving', 'Full Stack Development', 'IoT / AI Integration', 'Prototyping'],
    location: 'New Delhi / Onsite Grand Finale',
    is_remote: false,
    stipend_salary: '₹10,00,000 Grand Prize Pool',
    deadline: '2026-12-05',
    apply_url: 'https://www.sih.gov.in',
    published_at: '2026-10-25T14:00:00Z',
    is_featured: true,
  },
  {
    id: 'opp-4',
    title: 'Junior Cloud Infrastructure & Site Reliability Engineer',
    organization: 'Razorpay Financial Technologies',
    category: 'job',
    description: 'Ensure 99.999% availability for payment gateway processing billions of transactions. Write automated Terraform plans, maintain Kubernetes clusters, and troubleshoot latency spikes.',
    eligibility: 'Graduating Batch 2026 with hands-on Linux, networking, and scripting experience.',
    required_skills: ['Kubernetes', 'AWS', 'Linux Internals', 'Terraform', 'Prometheus & Grafana'],
    location: 'Bengaluru / Remote friendly',
    is_remote: true,
    stipend_salary: '₹18,00,000 – ₹24,00,000 CTC',
    deadline: '2026-12-15',
    apply_url: 'https://razorpay.com/jobs/',
    published_at: '2026-11-01T10:00:00Z',
    is_featured: false,
  },
];

export const INITIAL_BLUEPRINTS: CareerBlueprint[] = [
  {
    id: 'bp-sde',
    role_name: 'Software Development Engineer (SDE-1)',
    slug: 'software-development-engineer',
    category: 'Software Engineering',
    overview: 'An entry-level Software Development Engineer is expected to write clean, maintainable, production-ready code, demonstrate deep algorithmic problem-solving, and understand distributed system fundamentals.',
    mandatory_skills: [
      'Data Structures & Algorithms (Arrays, Graphs, Trees, Dynamic Programming)',
      'Object-Oriented Programming & Clean Architecture (SOLID Principles)',
      'One statically typed language (Java, C++, or TypeScript) with deep standard library knowledge',
      'Relational Database Design (ACID, Normalization, SQL Joins, Indexing)',
      'RESTful API Development & HTTP semantics (Status codes, headers, idempotency)',
      'Git version control, branching strategies, and CI/CD basics',
    ],
    preferred_skills: [
      'Microservices architecture and inter-service communication (gRPC, message queues like Kafka/RabbitMQ)',
      'NoSQL and In-memory caching (Redis data types, eviction policies)',
      'Basic system design: Load balancing, Horizontal vs Vertical scaling, CAP theorem',
      'Unit and integration testing (Jest, JUnit, Mockito) with >80% coverage discipline',
    ],
    recommended_languages: ['Java 17+', 'C++ 20', 'TypeScript', 'Python 3.11+', 'Go'],
    core_cs: [
      'Operating Systems (Processes vs Threads, Concurrency, Virtual Memory, Deadlocks)',
      'Computer Networks (TCP/IP handshake, DNS resolution, TLS termination, WebSockets)',
      'DBMS (Transactions, Isolation Levels, B-Trees, Write-Ahead Logging)',
    ],
    frameworks_tools: ['Spring Boot / NestJS / Express', 'PostgreSQL', 'Docker', 'Git', 'Linux / Bash', 'Postman'],
    recommended_projects: [
      {
        title: 'Distributed Rate Limiter & API Gateway',
        description: 'Implemented sliding window log algorithm with Redis and token bucket in Go/Java. Handled 10,000 req/sec with sub-millisecond response latency and graceful throttling.',
        tech_stack: ['Go', 'Redis', 'Docker', 'Prometheus'],
        portfolio_highlight: 'Demonstrates distributed synchronization, concurrency primitives, and microsecond performance tuning.',
      },
      {
        title: 'Real-Time Collaborative Code & Markdown Editor',
        description: 'Built a full-stack collaborative workspace using Operational Transformation (OT) or CRDTs over WebSockets with presence indicators and snapshot rollbacks.',
        tech_stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Socket.io'],
        portfolio_highlight: 'Proves mastery of event-driven frontend state and asynchronous networking conflicts.',
      },
    ],
    github_portfolio_advice: [
      'Have at least 2 complete full-stack or systems projects with live working deployment links, not just tutorial clones.',
      'Write exhaustive READMEs containing Architecture Diagrams, API documentation, local setup steps, and benchmark results.',
      'Demonstrate meaningful commit history with clear conventional commit messages (feat:, fix:, chore:, docs:).',
    ],
    resume_structure: [
      {
        section: 'Header & Contact',
        description: 'Full Name, Professional Email, Phone, LinkedIn, GitHub, and Portfolio Link.',
        dos: ['Make GitHub and LinkedIn links clickable', 'Use standard clean font'],
        donts: ['Do not include complete home postal address or photo (unless applying in jurisdictions where required)'],
      },
      {
        section: 'Technical Skills Matrix',
        description: 'Group skills cleanly by category: Languages, Frameworks, Databases, Tools & Platforms.',
        dos: ['List only skills you can defend in a technical deep-dive', 'Differentiate expert vs familiar'],
        donts: ['Avoid progress bars or percentages like "Java: 90%" (meaningless to engineering interviewers)'],
      },
      {
        section: 'Experience / Internships',
        description: 'Reverse chronological order with quantifiable metrics using Google X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z].',
        dos: ['Use action verbs: Architected, Reduced, Accelerated, Optimized', 'Include numbers (% speedup, requests/sec, user base)'],
        donts: ['Do not write generic job descriptions like "was responsible for maintaining code"'],
      },
    ],
    common_mistakes: [
      'Over-indexing on too many superficial frameworks while failing basic Big-O analysis in coding rounds.',
      'Listing 15 programming languages with only 1 week of surface knowledge in each.',
      'Having broken links or private GitHub repositories linked in the resume PDF.',
      'Failing to explain "Why" a specific database or architecture choice was selected in projects.',
    ],
    frequently_asked_interview_topics: [
      'Two-pointer & Sliding Window array problems',
      'Binary Tree traversals (BFS/DFS) and Lowest Common Ancestor (LCA)',
      'Graph algorithms: Dijkstra, Topological Sort, Connected Components',
      'LRU Cache implementation (Doubly Linked List + Hash Map)',
      'Designing URL Shortener (TinyURL) or Pastebin with hash collisions',
      'Database Sharding strategies and Consistent Hashing',
    ],
    sample_resume_outline: `[AARAV SHARMA]
Bengaluru, Karnataka | +91 98765 43210 | aarav.sharma@skillnova.edu
linkedin.com/in/aaravsharma-dev | github.com/aaravsharma-eng | portfolio.aarav.dev

EDUCATION
Apex Institute of Technology, Bengaluru
Bachelor of Technology in Computer Science & Engineering | CGPA: 8.92 / 10.0
Expected Graduation: May 2027

TECHNICAL SKILLS
- Languages: Java, TypeScript, C++, Python, SQL
- Frameworks & Libraries: Spring Boot, React.js, Node.js, Express, Tailwind CSS
- Databases & Caching: PostgreSQL, MongoDB, Redis
- Tools & Cloud: Docker, Git, Linux/Unix, AWS (EC2, S3), Postman, Jest

EXPERIENCE & INTERNSHIPS
Software Engineering Intern | NovaTech Solutions
June 2025 – August 2025
- Architected RESTful microservice in Java/Spring Boot handling 4,500 daily active user registrations.
- Reduced PostgreSQL query latency by 38% through optimized B-tree indexing and query plan refactoring.
- Integrated automated GitHub Actions CI pipeline executing 120+ unit tests with 84% test coverage.

FEATURED PROJECTS
Distributed Rate Limiter & Token Bucket Gateway | Go, Redis, Docker
- Built an edge rate limiter enforcing tier-based API throttling supporting 12,000 req/min.
- Benchmarked response latency under 1.2ms using Locust stress testing suite.

Real-Time Collaborative Canvas | TypeScript, React, Socket.io, Postgres
- Implemented Conflict-free Replicated Data Types (CRDTs) for multi-user real-time drawing.
- Deployed on AWS ECS with auto-scaling container tasks and custom Nginx reverse proxy.`,
  },
  {
    id: 'bp-aiml',
    role_name: 'AI/ML & LLM Solutions Engineer',
    slug: 'ai-ml-solutions-engineer',
    category: 'Artificial Intelligence',
    overview: 'Specializes in bridging theoretical machine learning models with production software engineering, including Retrieval-Augmented Generation (RAG), fine-tuning, prompt orchestration, and model evaluation.',
    mandatory_skills: [
      'Python programming (NumPy, Pandas, Vectorized computing)',
      'Deep Learning frameworks (PyTorch or TensorFlow)',
      'Understanding of Transformer architecture (Multi-head attention, positional encoding, tokens)',
      'Vector databases (Pinecone, Qdrant, Milvus, pgvector) and distance metrics (Cosine, Euclidean, Dot Product)',
      'RAG system design: Chunking strategies, hybrid search (dense + BM25), re-ranking',
      'API development for ML (FastAPI, async endpoints, streaming SSE responses)',
    ],
    preferred_skills: [
      'Model Fine-Tuning: LoRA, QLoRA, PEFT on open-weight models (Llama, Mistral)',
      'Agentic frameworks: LangGraph, AutoGen, CrewAI with stateful graphs and tool calling',
      'MLOps: MLflow, Weights & Biases, Docker for GPU inference, vLLM or Ollama deployment',
      'Evaluation frameworks: Ragas, TruLens, DeepEval for faithfulness and answer relevance',
    ],
    recommended_languages: ['Python 3.10+', 'C++ (for CUDA kernels / ONNX runtime)', 'SQL'],
    core_cs: [
      'Linear Algebra (Eigenvalues, Singular Value Decomposition, Matrix multiplication complexity)',
      'Multivariable Calculus & Optimization (SGD, AdamW, loss surfaces)',
      'Probability & Statistics (Bayesian inference, Hypothesis testing, distributions)',
    ],
    frameworks_tools: ['PyTorch', 'Hugging Face Transformers', 'FastAPI', 'LangChain / LangGraph', 'pgvector', 'vLLM'],
    recommended_projects: [
      {
        title: 'Enterprise Multimodal RAG with Document Grounding',
        description: 'Engineered an end-to-end RAG system for 100+ page financial PDFs utilizing table extraction, hybrid dense-sparse retrieval, and Cohere re-ranking with 94% source faithfulness score.',
        tech_stack: ['Python', 'FastAPI', 'pgvector', 'LangChain', 'Gemini / Claude API'],
        portfolio_highlight: 'Shows production grounding, zero hallucination guardrails, and realistic corporate evaluation.',
      },
      {
        title: 'Autonomous Coding & Debugging Multi-Agent Orchestrator',
        description: 'Implemented multi-agent cycle in LangGraph where a Planner breaks requirements into specs, a Coder generates test suites and code, and an Evaluator executes sandbox tests in isolated Docker containers.',
        tech_stack: ['LangGraph', 'Python', 'Docker API', 'Ollama / Local LLM'],
        portfolio_highlight: 'Proves mastery of stateful agent loops, self-correction, and tool invocation.',
      },
    ],
    github_portfolio_advice: [
      'Include clear quantitative evaluation metrics in your project READMEs (Accuracy, F1, ROUGE, Latency, Cost per 1K tokens).',
      'Showcase deployment: A working Hugging Face Space, Streamlit demo, or hosted web interface.',
      'Document data preprocessing pipelines cleanly rather than hiding spaghetti Jupyter notebooks.',
    ],
    resume_structure: [
      {
        section: 'Technical Skills',
        description: 'Highlight ML Frameworks, LLM Stack, Vector DBs, and Production Tooling.',
        dos: ['Specify concrete model families worked with (e.g., Llama 3, Mistral, Whisper)'],
        donts: ['Do not list vague phrases like "AI Enthusiast" or "Machine Learning expert"'],
      },
      {
        section: 'Projects with Metrics',
        description: 'Focus on measured improvements: reduced hallucination by X%, decreased inference latency from 1.4s to 320ms.',
        dos: ['Highlight production deployment (vLLM, FastAPI, Docker)'],
        donts: ['Avoid standard Iris/Titanic dataset projects from introductory Kaggle tutorials'],
      },
    ],
    common_mistakes: [
      'Failing to understand the software engineering required to serve models (concurrency, memory leaks, GPU OOM).',
      'Relying solely on black-box commercial APIs without understanding underlying tokenization, context windows, and embeddings.',
      'Not knowing how to evaluate whether an AI output is actually correct in automated CI pipelines.',
    ],
    frequently_asked_interview_topics: [
      'Explain Transformer Self-Attention mathematical formulation ($QK^T / \sqrt{d_k}$)',
      'Dense vs Sparse embeddings and how to merge them with Reciprocal Rank Fusion',
      'What is KV-Cache in transformer decoder inference and how does it optimize generation?',
      'How does Low-Rank Adaptation (LoRA) reduce trainable parameter count?',
      'Designing a Real-Time Semantic Search Engine for 10 Million items',
    ],
    sample_resume_outline: `[AARAV SHARMA]
Bengaluru, India | aarav.sharma@skillnova.edu | github.com/aaravsharma-ai

SUMMARY
AI/ML Engineer with strong software foundations in PyTorch, Transformer architectures, and production RAG systems. Experienced in building grounded LLM pipelines with vector search and automated evaluation.

TECHNICAL SKILLS
- AI & LLM: PyTorch, Hugging Face, LangGraph, vLLM, LoRA/PEFT, Ragas
- Data & Vector: NumPy, Pandas, Pinecone, Qdrant, pgvector, FAISS
- Engineering: Python, FastAPI, Docker, PostgreSQL, Git, Linux

EXPERIENCE
AI Engineering Fellow | SkillNova AI Labs
Oct 2025 – Present
- Implemented grounded PDF question generation pipeline using Gemini 2.0 Flash API with page citation extraction.
- Decreased question generation latency by 42% through parallel chunk processing and structured schema outputs.

PROJECTS
Enterprise Grounded RAG Platform | FastAPI, pgvector, LangChain
- Developed hybrid search retrieval engine combining BM25 keyword matching with OpenAI text-embedding-3.
- Evaluated on 500 ground-truth questions achieving 91.4% Faithfulness and 88.2% Answer Relevance.`,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-student-1',
    title: 'New Class Recording Available',
    message: 'Vikram Patel published the recording and notes for "TypeScript Generics & Utility Types".',
    type: 'resource',
    link: '/student/courses/course-fs-101',
    read: false,
    created_at: '2026-02-22T19:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'usr-student-1',
    title: 'AI Practice Questions Published',
    message: 'New multiple-choice quiz and flashcards are now available for "Building Production RAG Pipelines".',
    type: 'quiz',
    link: '/student/practice/quiz/quiz-3',
    read: false,
    created_at: '2026-02-27T18:00:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'usr-student-1',
    title: 'Saturday Special Session Reminder',
    message: 'Join us this Saturday for "Next-Gen Robotics & Spatial AI" with Arunav Sengupta.',
    type: 'saturday',
    link: '/student/saturday-special',
    read: true,
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'notif-4',
    user_id: 'usr-student-1',
    title: 'New Internship Opportunity Closing Soon',
    message: 'Google DeepMind Research Fellowship application closes on Nov 25. Check eligibility & apply.',
    type: 'opportunity',
    link: '/student/opportunities',
    read: false,
    created_at: '2026-10-30T12:00:00Z',
  },
];

export const INITIAL_AI_JOBS: AIGenerationJob[] = [
  {
    id: 'job-1',
    course_id: 'course-fs-101',
    topic_id: 'top-fs-101',
    document_name: 'typescript-advanced-generics.pdf',
    extracted_text_preview: 'TypeScript Generics allow writing reusable, flexible components that work with a variety of types rather than a single one. Using type variables, constraints with "extends", and the "infer" keyword allows building powerful utility types like ReturnType, Parameters, and deep immutable records...',
    status: 'approved',
    summary: 'Comprehensive analysis of TypeScript type machinery. Highlights generic constraints, recursive types, the infer keyword, mapped types, and standard library utilities.',
    flashcards: INITIAL_FLASHCARDS.slice(0, 3),
    quiz_questions: INITIAL_QUIZZES.slice(0, 2),
    interview_questions: [INITIAL_INTERVIEWS[0]],
    important_concepts: [
      { term: 'Infer Keyword', definition: 'Introduces a type variable inside conditional types deduced dynamically by the compiler.', source_page: 'Page 14' },
      { term: 'Type Narrowing', definition: 'The process of refining an uncertain type to a more specific type using control flow analysis.', source_page: 'Page 8' },
      { term: 'Discriminated Union', definition: 'A union of object types sharing a common literal property used for type discrimination.', source_page: 'Page 22' },
    ],
    created_at: '2026-02-22T15:30:00Z',
    reviewed_by: 'Dr. Evelyn Reed',
    reviewed_at: '2026-02-22T16:15:00Z',
  },
  {
    id: 'job-2',
    course_id: 'course-ai-201',
    topic_id: 'top-ai-201',
    document_name: 'rag-production-handbook.pdf',
    extracted_text_preview: 'Retrieval-Augmented Generation bridges proprietary document knowledge with generative intelligence. Critical components include hybrid semantic-keyword indexing, Reciprocal Rank Fusion, document chunking boundary preservation, and hallucination guardrail evaluation...',
    status: 'pending_review',
    summary: 'Architecture guide for high-accuracy RAG systems. Focuses on dense vs sparse search, re-ranking models, context window optimization, and source citation enforcement.',
    flashcards: INITIAL_FLASHCARDS.slice(3, 5),
    quiz_questions: [INITIAL_QUIZZES[2]],
    interview_questions: [INITIAL_INTERVIEWS[1]],
    important_concepts: [
      { term: 'Reciprocal Rank Fusion (RRF)', definition: 'Rank aggregation algorithm that scores documents by combining rank positions across diverse search models.', source_page: 'Page 31' },
      { term: 'Faithfulness', definition: 'Evaluation metric verifying that generated answers are strictly grounded in retrieved passages.', source_page: 'Page 12' },
    ],
    created_at: '2026-02-27T14:00:00Z',
  },
];

export const INITIAL_DISCUSSIONS = [
  {
    id: 'disc-1',
    author_id: 'usr-student-1',
    author_name: 'Aarav Sharma',
    author_role: 'student' as const,
    author_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    author_batch: 'Batch 2027 (CS)',
    title: 'Comparing Server-Sent Events (SSE) vs WebSockets for Realtime Feeds',
    content: 'In our Full Stack course Module 2, we covered duplex communication. For the resource feed live updates, is SSE better than WebSockets in terms of connection overhead and HTTP/2 multiplexing?',
    category: 'tech' as const,
    tags: ['WebSockets', 'SSE', 'Realtime', 'Full Stack'],
    likes_count: 14,
    liked_by_user_ids: ['usr-student-2', 'usr-student-3'],
    replies_count: 2,
    created_at: '2026-10-28T14:20:00Z',
  },
  {
    id: 'disc-2',
    author_id: 'usr-student-2',
    author_name: 'Pooja Verma',
    author_role: 'student' as const,
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    author_batch: 'Batch 2027 (IT)',
    title: 'Recommended project architecture for the upcoming Smart India Hackathon',
    content: 'Hey everyone! Our team is preparing for the SIH 2026 AI track. We are designing a multi-agent RAG pipeline using LangGraph and Supabase pgvector. Any tips on optimizing chunk overlap?',
    category: 'project' as const,
    tags: ['Hackathons', 'AI', 'LangGraph', 'Supabase'],
    likes_count: 22,
    liked_by_user_ids: ['usr-student-1'],
    replies_count: 3,
    created_at: '2026-10-29T09:15:00Z',
  },
  {
    id: 'disc-3',
    author_id: 'usr-mentor-1',
    author_name: 'Vikram Patel',
    author_role: 'sub_admin' as const,
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    author_batch: 'Lead Faculty Mentor',
    title: 'Key takeaways from Saturday Special: Multi-Agent Systems in Production',
    content: 'Thank you all who attended the Saturday Special on Agentic AI! Remember to review the uploaded lecture slides and reference papers in the Saturday Special tab. Start testing the stateful memory architectures in your homework.',
    category: 'resources' as const,
    tags: ['Saturday Special', 'AI Agents', 'Mentorship'],
    likes_count: 39,
    liked_by_user_ids: ['usr-student-1', 'usr-student-2'],
    replies_count: 5,
    created_at: '2026-10-31T17:45:00Z',
  }
];

export const INITIAL_DISCUSSIONS_REPLIES = [
  {
    id: 'rep-1',
    post_id: 'disc-1',
    author_id: 'usr-mentor-1',
    author_name: 'Vikram Patel',
    author_role: 'sub_admin' as const,
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'Great question Aarav! For unidirectional server-to-client updates like a learning resource feed or status notifications, SSE is significantly simpler, auto-reconnects natively over HTTP, and integrates seamlessly with CDN proxies. WebSockets shine when bidirectional interactive chat or collaborative whiteboard drawing is needed.',
    created_at: '2026-10-28T16:00:00Z'
  },
  {
    id: 'rep-2',
    post_id: 'disc-1',
    author_id: 'usr-student-2',
    author_name: 'Pooja Verma',
    author_role: 'student' as const,
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    content: 'Also remember browser limit on HTTP/1.1 SSE (6 connections per domain), but with HTTP/2 that bottleneck is completely eliminated!',
    created_at: '2026-10-28T17:30:00Z'
  }
];

export const INITIAL_MENTOR_REQUESTS = [
  {
    id: 'mreq-1',
    student_id: 'usr-student-1',
    student_name: 'Aarav Sharma',
    student_email: 'student@skillnova.edu',
    course_id: 'course-fs-101',
    course_title: 'Full Stack Development (MERN & Next.js)',
    topic_title: 'Module 2: WebSocket Reconnection Backoff Logic',
    assigned_mentor_name: 'Vikram Patel',
    doubt_title: 'Socket.IO client exponential backoff disconnect handling',
    doubt_description: 'I implemented an exponential backoff formula for reconnecting when the server restarts during deployment, but in Edge runtime environments the connection socket closes without throwing an explicit error code. How should I track network status without polling?',
    code_snippet: 'socket.on("disconnect", (reason) => {\n  if (reason === "io server disconnect") {\n    socket.connect();\n  }\n  backoffDelay = Math.min(1000 * Math.pow(2, attempts), 30000);\n});',
    status: 'in_progress' as const,
    priority: 'high' as const,
    created_at: '2026-10-30T11:20:00Z',
    updated_at: '2026-10-31T09:40:00Z',
    replies: [
      {
        id: 'mrep-1',
        request_id: 'mreq-1',
        author_id: 'usr-mentor-1',
        author_name: 'Vikram Patel (Mentor)',
        author_role: 'sub_admin' as const,
        content: 'Hi Aarav! On Edge environments (like Cloudflare Workers or Vercel Edge), long-lived TCP connections terminate if there is no keep-alive ping for 30 seconds. You need to enable heartbeat intervals in your Socket.IO client config: { pingInterval: 10000, pingTimeout: 5000 }. Let us do a quick 10-minute code review during today’s doubt slot at 4:30 PM.',
        created_at: '2026-10-31T09:40:00Z'
      }
    ]
  },
  {
    id: 'mreq-2',
    student_id: 'usr-student-2',
    student_name: 'Pooja Verma',
    student_email: 'pooja.verma@skillnova.edu',
    course_id: 'course-ai-201',
    course_title: 'Artificial Intelligence & Machine Learning',
    topic_title: 'Module 3: Semantic Document Chunking Strategies',
    assigned_mentor_name: 'Dr. Evelyn Reed',
    doubt_title: 'Query hallucination during RAG multi-hop retrieval',
    doubt_description: 'When chunking PDFs with tables and diagrams, semantic similarity models split tabular rows across different embeddings, causing the LLM to hallucinate during comparison questions.',
    status: 'resolved' as const,
    priority: 'medium' as const,
    created_at: '2026-10-25T15:00:00Z',
    updated_at: '2026-10-26T12:00:00Z',
    replies: [
      {
        id: 'mrep-2',
        request_id: 'mreq-2',
        author_id: 'usr-admin-1',
        author_name: 'Dr. Evelyn Reed (Admin/Faculty)',
        author_role: 'admin' as const,
        content: 'Hi Pooja! For tabular PDF content, standard character-count chunking will always break table semantics. Use markdown table extraction (e.g., pdfplumber or unstructured) and embed the entire table block as a single contextual chunk with surrounding section headers prepended.',
        created_at: '2026-10-26T12:00:00Z'
      }
    ]
  }
];
