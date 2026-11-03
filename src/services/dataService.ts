import type {
  User,
  UserRole,
  Course,
  CourseModule,
  CourseSubModule,
  Topic,
  SaturdaySpecial,
  Opportunity,
  CareerBlueprint,
  AIGenerationJob,
  Notification,
  Flashcard,
  QuizQuestion,
  QuizAttempt,
  StudentProgress,
  InterviewQuestion,
  DiscussionPost,
  DiscussionReply,
  MentorRequest,
  MentorRequestReply,
  PracticalSubmission,
  AuditLogEntry,
  HomepageSettings,
  HomepageCourse,
  StudentAccessRequest,
  Presentation,
  PresentationSlideAllocation,
  Quiz,
  QuizQuestionItem,
  QuizLeaderboardEntry,
  PdfPageAllocation,
  StudentRoadmapProgress,
  TickerAnnouncement,
} from "../types";

import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_MODULES,
  INITIAL_TOPICS,
  INITIAL_FLASHCARDS,
  INITIAL_QUIZZES,
  INITIAL_INTERVIEWS,
  INITIAL_SATURDAY_SPECIAL,
  INITIAL_OPPORTUNITIES,
  INITIAL_BLUEPRINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_JOBS,
  INITIAL_DISCUSSIONS,
  INITIAL_DISCUSSIONS_REPLIES,
  INITIAL_MENTOR_REQUESTS,
} from "./mockData";

import { supabase, supabaseUrl, supabaseAnonKey, isLiveSupabaseConfigured } from "./supabaseClient";
import { createClient } from "@supabase/supabase-js";

export function ensureUuid(id?: string): string {
  if (!id) return "00000000-0000-0000-0000-000000000001";

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(id)) return id;

  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);

    hash |= 0;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, "0");

  return `00000000-0000-0000-0000-${hex.padStart(12, "0")}`;
}

type Listener = () => void;

const INITIAL_HOMEPAGE_SETTINGS: HomepageSettings = {
  id: "30000000-0000-4000-8000-000000000001",

  demo_video_url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",

  demo_video_title: "SkillNova Experience • Live Walkthrough",

  demo_video_description:
    "Discover how SkillNova transforms software careers with 3D mountain journeys, client-side Python 3 WebAssembly coding labs, and direct industry mentorship.",

  demo_video_is_active: true,

  whatsapp_group_url: "https://chat.whatsapp.com/SkillNovaOfficialCohort2027",

  whatsapp_qr_code_url:
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://chat.whatsapp.com/SkillNovaOfficialCohort2027",

  whatsapp_is_active: true,

  whatsapp_display_name: "Join SkillNova WhatsApp Cohort",

  instagram_url: "https://instagram.com/skillnova_edu",

  instagram_is_active: true,

  instagram_display_name: "SkillNova on Instagram",

  linkedin_url: "https://linkedin.com/company/skillnova",

  linkedin_is_active: true,

  linkedin_display_name: "SkillNova LinkedIn Community",

  live_meeting_url: "",

  live_meeting_title: "Daily Engineering Cohort Masterclass",

  live_meeting_time: "Everyday at 07:00 PM IST",

  live_meeting_is_active: false,

  live_meeting_is_daily_recurring: true,

  live_meeting_updated_at: new Date().toISOString(),

  updated_at: new Date().toISOString(),
};

const INITIAL_HOMEPAGE_COURSES: HomepageCourse[] = [
  {
    id: "hp-course-1",

    title: "Full Stack Web Engineering & Microservices",

    description:
      "Master React 19, TypeScript 5, Node.js microservices, PostgreSQL, and Docker with production deployments.",

    thumbnail_url:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",

    fee: "₹5,999",

    timeline: "12 Weeks • Live Weekend Cohort",

    curriculum_text: `Module 1: Advanced Frontend Engineering

- TypeScript 5.0, Generic Constraints & Strict Types

- React 19 Core, Hooks, State Machines & Context

- Modern CSS Systems, Tailwind CSS & Motion

Module 2: Scalable Backend & Microservices

- Node.js & Express REST APIs with Validation

- PostgreSQL Schema Design, Indexes & Query Optimization

- Redis In-Memory Caching & Distributed Job Queues

Module 3: DevOps, Containers & Deployment

- Docker Multi-stage Builds & Docker Compose

- Continuous Integration & Deployment (CI/CD) with GitHub Actions

- Production Cloud Hosting on AWS ECS & Vercel`,

    whatsapp_enroll_url:
      "https://chat.whatsapp.com/SkillNovaOfficialCohort2027",

    is_active: true,

    order_index: 1,

    created_at: "2026-02-01T10:00:00Z",

    updated_at: "2026-02-01T10:00:00Z",
  },

  {
    id: "hp-course-2",

    title: "AI & Agentic Systems Engineering",

    description:
      "Build production RAG pipelines, autonomous multi-agent systems with LangGraph, and deploy WebAssembly models.",

    thumbnail_url:
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",

    fee: "₹6,999",

    timeline: "10 Weeks • Hands-on Project Labs",

    curriculum_text: `Module 1: Foundation Models & Embeddings

- Prompt Engineering, Few-shot Reasoning & In-Context Learning

- Vector Embeddings, Cosine Similarity & Vector Databases

- Production RAG (Retrieval-Augmented Generation) Architectures

Module 2: Autonomous Agents & Tool Use

- LangChain & LangGraph Orchestration Workflows

- Multi-Agent Collaboration Patterns & Evaluation

- Function Calling, Structured Outputs & JSON Schemas

Module 3: Local LLMs & WebAssembly

- Running Models Client-side with WebLLM & ONNX Runtime

- Pyodide WebAssembly Python Execution in Browser

- Fine-Tuning LoRA & Quantization Techniques`,

    whatsapp_enroll_url:
      "https://chat.whatsapp.com/SkillNovaOfficialCohort2027",

    is_active: true,

    order_index: 2,

    created_at: "2026-02-05T10:00:00Z",

    updated_at: "2026-02-05T10:00:00Z",
  },

  {
    id: "hp-course-3",

    title: "Python for Engineers & Algorithmic Problem Solving",

    description:
      "From syntax to system design, data structures, algorithms, and in-browser coding drills with Pyodide.",

    thumbnail_url:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80",

    fee: "₹3,999",

    timeline: "8 Weeks • Code In-Browser",

    curriculum_text: `Module 1: Python 3 Foundations

- Dynamic Typing, Control Flow, Comprehensions & Generators

- Object-Oriented Programming (OOP) & Dunder Methods

- Exception Handling, Logging & Unit Testing

Module 2: Algorithmic Problem Solving

- Arrays, Hash Maps, Stacks, Queues & Linked Lists

- Binary Trees, Graphs, BFS & DFS Traversals

- Dynamic Programming & Greedy Strategies

Module 3: Industry Projects & System Design

- CLI Tools, Web Scraping & REST API Clients

- Concurrency with AsyncIO & Multiprocessing

- Packaging, PyPI Distribution & Clean Code Standards`,

    whatsapp_enroll_url:
      "https://chat.whatsapp.com/SkillNovaOfficialCohort2027",

    is_active: true,

    order_index: 3,

    created_at: "2026-02-10T10:00:00Z",

    updated_at: "2026-02-10T10:00:00Z",
  },
];

const INITIAL_ACCESS_REQUESTS: StudentAccessRequest[] = [
  {
    id: "req-seed-1",

    full_name: "Rohan Mehra",

    email: "rohan.mehra@apextech.edu",

    phone: "+91 98765 43210",

    college: "Apex Institute of Technology",

    branch: "Computer Science",

    year_of_study: "3rd Year (Batch 2027)",

    target_course: "Full Stack Web Engineering & Microservices",

    payment_reference: "UPI-REF-992384102",

    status: "pending",

    admin_note: "Joined WhatsApp group; awaiting bank settlement confirmation.",

    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },

  {
    id: "req-seed-2",

    full_name: "Ananya Deshmukh",

    email: "ananya.deshmukh@nitk.edu",

    phone: "+91 91234 56789",

    college: "National Institute of Tech",

    branch: "Information Technology",

    year_of_study: "2nd Year (Batch 2028)",

    target_course: "AI & Agentic Systems Engineering",

    payment_reference: "UPI-REF-884729114",

    status: "pending",

    admin_note: "Verified student ID card attached in WhatsApp.",

    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const INITIAL_SUB_MODULES: CourseSubModule[] = [
  // Course Full Stack 101 - Module 1 (Advanced TypeScript & React Architecture)

  {
    id: "submod-fs-1-1",

    module_id: "mod-fs-1",

    course_id: "course-fs-101",

    title: "1.1 TypeScript Generics & Type Narrowing",

    order_index: 1,

    description:
      "Generic constraints, conditional types, and runtime validation with Zod.",
  },

  {
    id: "submod-fs-1-2",

    module_id: "mod-fs-1",

    course_id: "course-fs-101",

    title: "1.2 Custom Hooks & Reusable State Machines",

    order_index: 2,

    description:
      "Separation of concerns, useReducer patterns, and resilient subscriptions.",
  },

  {
    id: "submod-fs-1-3",

    module_id: "mod-fs-1",

    course_id: "course-fs-101",

    title: "1.3 Component Composition & Performance Optimization",

    order_index: 3,

    description:
      "React.memo, useMemo profiling, lazy loading, and rendering waterfalls.",
  },

  {
    id: "submod-fs-1-4",

    module_id: "mod-fs-1",

    course_id: "course-fs-101",

    title: "1.4 Micro-Frontends & Architectural Standards",

    order_index: 4,

    description:
      "Module federation, contract versioning, and enterprise deployment.",
  },

  // Module 2 (Scalable Backend Services)

  {
    id: "submod-fs-2-1",

    module_id: "mod-fs-2",

    course_id: "course-fs-101",

    title: "2.1 Express & Fastify Architecture",

    order_index: 1,

    description:
      "Middleware pipelines, input sanitization, and structured logging.",
  },

  {
    id: "submod-fs-2-2",

    module_id: "mod-fs-2",

    course_id: "course-fs-101",

    title: "2.2 PostgreSQL Schema Design & Indexing",

    order_index: 2,

    description:
      "B-Tree indexes, composite keys, and query execution plan analysis.",
  },

  // AI Course 201 - Module 1

  {
    id: "submod-ai-1-1",

    module_id: "mod-ai-1",

    course_id: "course-ai-201",

    title: "1.1 Linear Algebra & Vector Spaces",

    order_index: 1,

    description:
      "Matrices, eigenvectors, dot products, and high-dimensional projections.",
  },

  {
    id: "submod-ai-1-2",

    module_id: "mod-ai-1",

    course_id: "course-ai-201",

    title: "1.2 Calculus & Gradient Optimization",

    order_index: 2,

    description:
      "Partial derivatives, chain rule, Adam and RMSprop optimizers.",
  },

  {
    id: "submod-ai-1-3",

    module_id: "mod-ai-1",

    course_id: "course-ai-201",

    title: "1.3 Feature Engineering & Data Normalization",

    order_index: 3,

    description:
      "One-hot encoding, standard scalers, and handling sparse datasets.",
  },
];

export const INITIAL_PRESENTATIONS: Presentation[] = [
  {
    id: "pres-fs-1",

    course_id: "course-fs-101",

    module_id: "mod-fs-1",

    sub_module_id: "submod-fs-1-1",

    title: "TypeScript 5.5 Enterprise Architecture Masterclass",

    description:
      "Comprehensive 30-slide lecture slide deck covering Type Systems, Generics, and Production React Design.",

    original_file_path: "presentations/typescript-masterclass-2026.pptx",

    ppt_url:
      "https://skillnova-cdn.internal/slides/typescript-masterclass-2026.pptx",

    total_slides: 30,

    uploaded_by: "admin@skillnova.edu",

    created_at: "2026-02-20T10:00:00Z",
  },
];

export const INITIAL_SLIDE_ALLOCATIONS: PresentationSlideAllocation[] = [
  {
    id: "alloc-1",

    presentation_id: "pres-fs-1",

    sub_module_id: "submod-fs-1-1",

    start_slide: 1,

    end_slide: 4,

    release_status: "released",

    released_at: "2026-02-20T10:30:00Z",

    released_by: "Administrator",
  },

  {
    id: "alloc-2",

    presentation_id: "pres-fs-1",

    sub_module_id: "submod-fs-1-2",

    start_slide: 5,

    end_slide: 8,

    release_status: "released",

    released_at: "2026-02-21T10:30:00Z",

    released_by: "Administrator",
  },

  {
    id: "alloc-3",

    presentation_id: "pres-fs-1",

    sub_module_id: "submod-fs-1-3",

    start_slide: 9,

    end_slide: 15,

    release_status: "scheduled",

    scheduled_release_at: "2026-11-03T10:00:00+05:30",

    released_by: "Administrator",
  },

  {
    id: "alloc-4",

    presentation_id: "pres-fs-1",

    sub_module_id: "submod-fs-1-4",

    start_slide: 16,

    end_slide: 22,

    release_status: "locked",
  },
];

export const INITIAL_QUIZ_LIST: Quiz[] = [
  {
    id: "quiz-py-1",

    course_id: "course-fs-101",

    course_title: "Full Stack Web Engineering & Microservices",

    module_id: "mod-fs-1",

    module_title: "Module 1: Advanced Frontend & System Architecture",

    sub_module_id: "submod-fs-1-1",

    title: "Python Fundamentals & Memory Models Assessment",

    description:
      "Comprehensive 4-question timed assessment evaluating Python 3 runtime semantics, scoping, data structures, and WebAssembly execution.",

    total_marks: 10,

    duration_minutes: 30,

    start_time: "2026-11-01T04:30:00.000Z",

    end_time: "2026-11-10T12:30:00.000Z",

    status: "active",

    created_at: "2026-11-01T04:00:00.000Z",

    created_by: "Administrator",

    questions: [
      {
        id: "q-py-1",

        quiz_id: "quiz-py-1",

        question: "What is Python?",

        options: [
          { key: "A", text: "High-level, interpreted programming language" },

          { key: "B", text: "Relational Database Management System" },

          { key: "C", text: "Hardware Microprocessor Architecture" },

          { key: "D", text: "Web Browser Rendering Engine" },
        ],

        correct_answer: "A",

        explanation:
          "Python is an interpreted, high-level, dynamically typed language known for concise syntax and vast ecosystem.",

        marks: 2.5,

        order_index: 1,
      },

      {
        id: "q-py-2",

        quiz_id: "quiz-py-1",

        question: "Which keyword is used to define a function in Python?",

        options: [
          { key: "A", text: "function" },

          { key: "B", text: "def" },

          { key: "C", text: "define" },

          { key: "D", text: "fun" },
        ],

        correct_answer: "B",

        explanation:
          "The def keyword begins a function definition header in Python syntax.",

        marks: 2.5,

        order_index: 2,
      },

      {
        id: "q-py-3",

        quiz_id: "quiz-py-1",

        question:
          "Which built-in Python data structure follows LIFO (Last In, First Out) ordering when using append() and pop()?",

        options: [
          { key: "A", text: "Queue" },

          { key: "B", text: "Stack (via list)" },

          { key: "C", text: "Hash Set" },

          { key: "D", text: "Binary Heap" },
        ],

        correct_answer: "B",

        explanation:
          "Standard Python lists provide amortized O(1) append() and pop() operations from the end, implementing a Stack (LIFO).",

        marks: 2.5,

        order_index: 3,
      },

      {
        id: "q-py-4",

        quiz_id: "quiz-py-1",

        question:
          "What is the primary advantage of WebAssembly (Pyodide) in SkillNova's coding lab?",

        options: [
          {
            key: "A",
            text: "Executes Python locally in the browser sandbox with zero server latency",
          },

          { key: "B", text: "Requires a paid external cloud compiler license" },

          { key: "C", text: "Sends user code over unencrypted sockets" },

          { key: "D", text: "Only supports static HTML markup" },
        ],

        correct_answer: "A",

        explanation:
          "Pyodide compiles CPython to WebAssembly, enabling genuine Python 3 execution in the client browser with zero latency and high security.",

        marks: 2.5,

        order_index: 4,
      },
    ],
  },

  {
    id: "quiz-ts-2",

    course_id: "course-fs-101",

    course_title: "Full Stack Web Engineering & Microservices",

    module_id: "mod-fs-1",

    module_title: "Module 1: Advanced Frontend & System Architecture",

    sub_module_id: "submod-fs-1-2",

    title: "Advanced TypeScript & React 19 State Patterns",

    description:
      "Upcoming cohort evaluation on generic constraints, discriminated unions, and React 19 action states.",

    total_marks: 10,

    duration_minutes: 20,

    start_time: "2026-11-03T04:30:00.000Z",

    end_time: "2026-11-03T05:30:00.000Z",

    status: "upcoming",

    created_at: "2026-11-01T04:00:00.000Z",

    created_by: "Administrator",

    questions: [
      {
        id: "q-ts-1",

        quiz_id: "quiz-ts-2",

        question:
          "Which TypeScript operator creates a union of all property keys in a given type?",

        options: [
          { key: "A", text: "typeof" },

          { key: "B", text: "keyof" },

          { key: "C", text: "instanceof" },

          { key: "D", text: "in" },
        ],

        correct_answer: "B",

        explanation:
          "The keyof operator extracts the string or numeric literal union of keys from an object type.",

        marks: 5,

        order_index: 1,
      },

      {
        id: "q-ts-2",

        quiz_id: "quiz-ts-2",

        question:
          "What is the runtime overhead of TypeScript generic types after JavaScript compilation?",

        options: [
          {
            key: "A",
            text: "Zero overhead (completely erased during transpilation)",
          },

          { key: "B", text: "10ms per function invocation" },

          { key: "C", text: "Requires the Reflect metadata polyfill" },

          { key: "D", text: "Wraps functions in Proxy objects" },
        ],

        correct_answer: "A",

        explanation:
          "TypeScript types are completely erased at compile time and have zero runtime footprint.",

        marks: 5,

        order_index: 2,
      },
    ],
  },

  {
    id: "quiz-backend-3",

    course_id: "course-fs-101",

    course_title: "Full Stack Web Engineering & Microservices",

    module_id: "mod-fs-2",

    module_title: "Module 2: Scalable Backend & Microservices",

    sub_module_id: "submod-fs-2-1",

    title: "Microservices & Distributed Systems Review",

    description:
      "Closed milestone assessment for Week 4. Preserved for review and personal practice drills.",

    total_marks: 10,

    duration_minutes: 25,

    start_time: "2026-10-15T04:30:00.000Z",

    end_time: "2026-10-15T05:30:00.000Z",

    status: "closed",

    created_at: "2026-10-14T10:00:00.000Z",

    created_by: "Administrator",

    questions: [
      {
        id: "q-be-1",

        quiz_id: "quiz-backend-3",

        question:
          "What principle states that microservice data should be private to that service?",

        options: [
          { key: "A", text: "Shared Database Anti-Pattern" },

          { key: "B", text: "Database-per-Service Pattern" },

          { key: "C", text: "Monolithic Coupling" },

          { key: "D", text: "CQRS Only" },
        ],

        correct_answer: "B",

        explanation:
          "Database-per-service ensures loose coupling and independent scalability.",

        marks: 10,

        order_index: 1,
      },
    ],
  },
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: "att-1",

    quiz_id: "quiz-py-1",

    quiz_title: "Python Fundamentals & Memory Models Assessment",

    student_id: "usr-student-ananya",

    student_name: "Ananya Deshmukh",

    course_id: "course-fs-101",

    score: 10,

    total_marks: 10,

    total_questions: 4,

    correct_count: 4,

    incorrect_count: 0,

    unanswered_count: 0,

    accuracy: 100,

    percentage: 100,

    time_spent_seconds: 320,

    answers: { "q-py-1": "A", "q-py-2": "B", "q-py-3": "B", "q-py-4": "A" },

    is_first_attempt: true,

    is_practice: false,

    status: "submitted",

    completed_at: "2026-11-01T05:10:00.000Z",
  },

  {
    id: "att-2",

    quiz_id: "quiz-py-1",

    quiz_title: "Python Fundamentals & Memory Models Assessment",

    student_id: "usr-student-rohan",

    student_name: "Rohan Mehra",

    course_id: "course-fs-101",

    score: 7.5,

    total_marks: 10,

    total_questions: 4,

    correct_count: 3,

    incorrect_count: 1,

    unanswered_count: 0,

    accuracy: 75,

    percentage: 75,

    time_spent_seconds: 410,

    answers: { "q-py-1": "A", "q-py-2": "B", "q-py-3": "B", "q-py-4": "B" },

    is_first_attempt: true,

    is_practice: false,

    status: "submitted",

    completed_at: "2026-11-01T05:15:00.000Z",
  },

  {
    id: "att-3",

    quiz_id: "quiz-py-1",

    quiz_title: "Python Fundamentals & Memory Models Assessment",

    student_id: "usr-student-kavya",

    student_name: "Kavya Sharma",

    course_id: "course-fs-101",

    score: 7.5,

    total_marks: 10,

    total_questions: 4,

    correct_count: 3,

    incorrect_count: 1,

    unanswered_count: 0,

    accuracy: 75,

    percentage: 75,

    time_spent_seconds: 480,

    answers: { "q-py-1": "A", "q-py-2": "B", "q-py-3": "A", "q-py-4": "A" },

    is_first_attempt: true,

    is_practice: false,

    status: "submitted",

    completed_at: "2026-11-01T05:22:00.000Z",
  },

  {
    id: "att-4",

    quiz_id: "quiz-py-1",

    quiz_title: "Python Fundamentals & Memory Models Assessment",

    student_id: "usr-student-aditya",

    student_name: "Aditya Nair",

    course_id: "course-fs-101",

    score: 5,

    total_marks: 10,

    total_questions: 4,

    correct_count: 2,

    incorrect_count: 2,

    unanswered_count: 0,

    accuracy: 50,

    percentage: 50,

    time_spent_seconds: 520,

    answers: { "q-py-1": "A", "q-py-2": "A", "q-py-3": "B", "q-py-4": "B" },

    is_first_attempt: true,

    is_practice: false,

    status: "submitted",

    completed_at: "2026-11-01T05:30:00.000Z",
  },
];

export const INITIAL_PDF_ALLOCATIONS: PdfPageAllocation[] = [
  {
    id: "pdf-alloc-1",

    topic_id: "top-101",

    course_id: "course-fs-101",

    sub_module_id: "submod-fs-1-1",

    title: "TypeScript 5.5 Production Handbook",

    pdf_url: "https://skillnova-cdn.internal/docs/typescript-handbook.pdf",

    start_page: 1,

    end_page: 6,

    total_pages: 30,

    release_status: "released",

    released_at: "2026-02-20T10:00:00Z",

    released_by: "Administrator",
  },

  {
    id: "pdf-alloc-2",

    topic_id: "top-102",

    course_id: "course-fs-101",

    sub_module_id: "submod-fs-1-2",

    title: "React 19 State Machines & Hooks Manual",

    pdf_url: "https://skillnova-cdn.internal/docs/react19-manual.pdf",

    start_page: 7,

    end_page: 12,

    total_pages: 30,

    release_status: "released",

    released_at: "2026-02-21T10:00:00Z",

    released_by: "Administrator",
  },

  {
    id: "pdf-alloc-3",

    topic_id: "top-103",

    course_id: "course-fs-101",

    sub_module_id: "submod-fs-1-3",

    title: "Component Optimization & Waterfalls Guide",

    pdf_url: "https://skillnova-cdn.internal/docs/optimization-guide.pdf",

    start_page: 13,

    end_page: 20,

    total_pages: 30,

    release_status: "scheduled",

    scheduled_release_at: "2026-11-03T10:00:00+05:30",

    released_by: "Administrator",
  },

  {
    id: "pdf-alloc-4",

    topic_id: "top-104",

    course_id: "course-fs-101",

    sub_module_id: "submod-fs-1-4",

    title: "Enterprise Micro-Frontends Whitepaper",

    pdf_url: "https://skillnova-cdn.internal/docs/microfrontends.pdf",

    start_page: 21,

    end_page: 30,

    total_pages: 30,

    release_status: "locked",
  },
];

export const INITIAL_ROADMAP_PROGRESS: StudentRoadmapProgress[] = [
  {
    id: "prog-1",

    student_id: "usr-student-1",

    course_id: "course-fs-101",

    completed_sub_modules: ["submod-fs-1-1", "submod-fs-1-2"],

    current_sub_module_id: "submod-fs-1-3",

    progress_percentage: 50,

    last_activity_at: new Date().toISOString(),
  },
];

class DataService {
  private listeners: Set<Listener> = new Set();

  private users: User[] = [];

  private courses: Course[] = [];

  private modules: CourseModule[] = [];

  private subModules: CourseSubModule[] = [];

  private presentations: Presentation[] = [];

  private slideAllocations: PresentationSlideAllocation[] = [];

  private topics: Topic[] = [];

  private flashcards: Flashcard[] = [];

  private quizzes: QuizQuestion[] = [];

  private quizAttempts: QuizAttempt[] = [];

  private quizzesList: Quiz[] = [];

  private quizAttemptsList: QuizAttempt[] = [];

  private pdfAllocations: PdfPageAllocation[] = [];

  private roadmapProgress: StudentRoadmapProgress[] = [];

  private currentTheme: "light" | "dark" = "light";

  private interviews: InterviewQuestion[] = INITIAL_INTERVIEWS;

  private saturdaySpecial: SaturdaySpecial[] = [];

  private opportunities: Opportunity[] = [];

  private blueprints: CareerBlueprint[] = [];

  private notifications: Notification[] = [];

  private aiJobs: AIGenerationJob[] = [];

  private discussions: DiscussionPost[] = [];

  private discussionReplies: DiscussionReply[] = [];

  private mentorRequests: MentorRequest[] = [];

  private codingSubmissions: PracticalSubmission[] = [];

  private auditLogs: AuditLogEntry[] = [];

  private homepageSettings: HomepageSettings = INITIAL_HOMEPAGE_SETTINGS;

  private homepageCourses: HomepageCourse[] = INITIAL_HOMEPAGE_COURSES;

  private studentAccessRequests: StudentAccessRequest[] =
    INITIAL_ACCESS_REQUESTS;

  private currentUser: User | null = null;

  private releaseCheckInterval: any = null;

  constructor() {
    this.loadFromStorage();

    this.initSupabaseSync();

    this.checkScheduledReleases();

    this.checkQuizSchedules();

    this.releaseCheckInterval = setInterval(() => {
      this.checkScheduledReleases();

      this.checkQuizSchedules();
    }, 30000);
  }

  private loadFromStorage() {
    try {
      const getOrInit = <T>(key: string, initial: T): T => {
        const item = localStorage.getItem(`skillnova_${key}`);

        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              // Strip out any stale demo records from previous mock sessions
              return parsed.filter((entry: any) => {
                if (!entry || typeof entry !== "object") return false;
                const id = String(entry.id || "");
                if (id.startsWith("usr-student-") || id.startsWith("usr-mentor-") || id.startsWith("usr-admin-")) return false;
                if (id.startsWith("course-fs-") || id.startsWith("course-ai-") || id.startsWith("course-dsa-") || id.startsWith("course-devops-")) return false;
                if (id.startsWith("mod-") && id.includes("-fs-")) return false;
                if (id.startsWith("top-") && id.includes("-fs-")) return false;
                return true;
              }) as unknown as T;
            }
            return parsed;
          } catch {
            return initial;
          }
        }

        return initial;
      };

      this.users = getOrInit("users", []);

      this.courses = getOrInit("courses", []);

      this.modules = getOrInit("modules", []);

      this.subModules = getOrInit("subModules", []);

      this.presentations = getOrInit("presentations", []);

      this.slideAllocations = getOrInit(
        "slideAllocations",
        [],
      );

      this.topics = getOrInit("topics", []);

      this.flashcards = getOrInit("flashcards", []);

      this.quizzes = getOrInit("quizzes", []);

      this.quizAttempts = getOrInit("quizAttempts", []);

      this.quizzesList = getOrInit("quizzesList", []);

      this.quizAttemptsList = getOrInit(
        "quizAttemptsList",
        [],
      );

      this.pdfAllocations = getOrInit(
        "pdfAllocations",
        [],
      );

      this.roadmapProgress = getOrInit(
        "roadmapProgress",
        INITIAL_ROADMAP_PROGRESS,
      );

      this.currentTheme =
        (localStorage.getItem("skillnova_theme") as "light" | "dark") ||
        "light";

      this.saturdaySpecial = getOrInit(
        "saturdaySpecial",
        [],
      );

      this.opportunities = getOrInit("opportunities", []);

      this.blueprints = getOrInit("blueprints", []);

      this.notifications = getOrInit("notifications", []);

      this.aiJobs = getOrInit("aiJobs", []);

      this.discussions = getOrInit("discussions", []);

      this.discussionReplies = getOrInit(
        "discussionReplies",
        [],
      );

      this.mentorRequests = getOrInit(
        "mentorRequests",
        [],
      );

      this.codingSubmissions = getOrInit("codingSubmissions", []);

      this.auditLogs = getOrInit("auditLogs", [
        {
          id: "log-seed-1",

          action: "release",

          resource_id: "top-101",

          resource_title: "Full Stack Architecture & Microservices Overview",

          course_id: "course-fs-101",

          performed_by: "Lead Instructor",

          timestamp: new Date(Date.now() - 86400000).toISOString(),

          details: "Directly released to cohort feed",
        },
      ]);

      this.homepageSettings = getOrInit(
        "homepageSettings",
        INITIAL_HOMEPAGE_SETTINGS,
      );

      this.homepageCourses = getOrInit(
        "homepageCourses",
        [],
      );

      this.studentAccessRequests = getOrInit(
        "studentAccessRequests",
        [],
      );

      const savedUserId = localStorage.getItem("skillnova_current_user_id");

      if (savedUserId) {
        this.currentUser =
          this.users.find((u) => u.id === savedUserId) || null;
      } else {
        this.currentUser = null;
      }
    } catch {
      this.users = [];

      this.courses = [];

      this.modules = [];

      this.topics = [];

      this.flashcards = [];

      this.quizzes = [];

      this.saturdaySpecial = [];

      this.opportunities = [];

      this.blueprints = [];

      this.notifications = [];

      this.aiJobs = [];

      this.discussions = [];

      this.discussionReplies = [];

      this.mentorRequests = [];

      this.homepageSettings = INITIAL_HOMEPAGE_SETTINGS;

      this.homepageCourses = [];

      this.studentAccessRequests = [];

      this.currentUser = null;
    }
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(`skillnova_${key}`, JSON.stringify(data));

      this.notifyListeners();
    } catch (e) {
      console.warn("LocalStorage save failed:", e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  public notifySubscribers() {
    this.notifyListeners();
  }

  // --- Real-time Supabase Synchronization Engine ---

  private syncInFlight: Promise<void> | null = null;

  public async syncAllFromSupabase(force = false): Promise<void> {
    if (!isLiveSupabaseConfigured) return;

    if (this.syncInFlight && !force) {
      return this.syncInFlight;
    }

    this.syncInFlight = (async () => {
      try {
        await Promise.allSettled([
          this.syncUsersFromSupabase(),
          this.syncCoursesFromSupabase(),
          this.syncModulesFromSupabase(),
          this.syncSubModulesFromSupabase(),
          this.syncPresentationsFromSupabase(),
          this.syncSlideAllocationsFromSupabase(),
          this.syncTopicsFromSupabase(),
          this.syncHomepageFromSupabase(),
          this.syncHomepageCoursesFromSupabase(),
          this.syncAccessRequestsFromSupabase(),
          this.syncQuizzesFromSupabase(),
          this.syncQuizAttemptsFromSupabase(),
          this.syncPdfAllocationsFromSupabase(),
          this.syncRoadmapProgressFromSupabase(),
          this.syncOpportunitiesFromSupabase(),
          this.syncSaturdaySpecialsFromSupabase(),
          this.syncNotificationsFromSupabase(),
          this.syncDiscussionsFromSupabase(),
          this.syncDiscussionRepliesFromSupabase(),
          this.syncMentorRequestsFromSupabase(),
          this.syncMentorRequestRepliesFromSupabase(),
          this.syncPracticalSubmissionsFromSupabase(),
          this.syncFlashcardsFromSupabase(),
          this.syncInterviewQuestionsFromSupabase(),
          this.syncAuditLogsFromSupabase(),
        ]);

        this.notifySubscribers();
      } catch (err) {
        console.warn("[SkillNova Supabase] syncAllFromSupabase error:", err);
      } finally {
        this.syncInFlight = null;
      }
    })();

    return this.syncInFlight;
  }

  private async initSupabaseSync() {
    if (!isLiveSupabaseConfigured) return;

    try {
      await this.syncAllFromSupabase();

      // Set up real-time listener channel
      supabase
        .channel("skillnova_data_sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "courses" },
          () => this.syncCoursesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "modules" },
          () => this.syncModulesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sub_modules" },
          () => this.syncSubModulesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "presentations" },
          () => this.syncPresentationsFromSupabase(),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "presentation_slide_allocations",
          },
          () => this.syncSlideAllocationsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "topics" },
          () => this.syncTopicsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "homepage_settings" },
          () => this.syncHomepageFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "homepage_courses" },
          () => this.syncHomepageCoursesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "student_access_requests" },
          () => this.syncAccessRequestsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "quizzes" },
          () => this.syncQuizzesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "quiz_attempts" },
          () => this.syncQuizAttemptsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pdf_page_allocations" },
          () => this.syncPdfAllocationsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "student_progress" },
          () => this.syncRoadmapProgressFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "opportunities" },
          () => this.syncOpportunitiesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "saturday_special" },
          () => this.syncSaturdaySpecialsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications" },
          () => this.syncNotificationsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "discussion_posts" },
          () => this.syncDiscussionsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "discussion_replies" },
          () => this.syncDiscussionRepliesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mentor_requests" },
          () => this.syncMentorRequestsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mentor_request_replies" },
          () => this.syncMentorRequestRepliesFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "practical_submissions" },
          () => this.syncPracticalSubmissionsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "flashcards" },
          () => this.syncFlashcardsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "interview_questions" },
          () => this.syncInterviewQuestionsFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles" },
          () => this.syncUsersFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "students" },
          () => this.syncUsersFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sub_admins" },
          () => this.syncUsersFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "course_enrollments" },
          () => this.syncUsersFromSupabase(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "audit_logs" },
          () => this.syncAuditLogsFromSupabase(),
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(
              "[SkillNova Realtime] Connected to live Supabase updates",
            );
          }
        });
    } catch (e) {
      console.warn(
        "[SkillNova Supabase] Initial sync fallback to local storage:",
        e,
      );
    }
  }

  public async syncCoursesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from("courses").select("*");

      if (!error && Array.isArray(data)) {
        const remoteCourses: Course[] = data.map((c: any) => ({
          id: c.id,

          title: c.title,

          description: c.description || "",

          slug: c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),

          category: c.category || "Technology",

          mentor_name: c.mentor_name || "Senior Instructor",

          mentor_email: c.mentor_email || "mentor@skillnova.edu",

          duration_weeks: c.duration_weeks || 12,

          thumbnail:
            c.thumbnail_url ||
            c.thumbnail ||
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",

          thumbnail_url: c.thumbnail_url || c.thumbnail,

          roadmap_image_url:
            c.roadmap_image_url ||
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",

          enrolled_students_count: 14,

          created_at: c.created_at || new Date().toISOString(),

          updated_at: c.updated_at || new Date().toISOString(),

          is_published: c.is_published !== false,

          curriculum_text: c.curriculum_text,

          course_fee: c.course_fee || "₹14,999",

          timeline:
            c.timeline || `${c.duration_weeks || 12} Weeks • Live Cohort`,
        }));

        this.courses = remoteCourses;

        this.saveToStorage("courses", this.courses);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync courses error:", e);
    }
  }

  public async syncModulesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");

      if (!error && Array.isArray(data)) {
        this.modules = data.map((m: any) => ({
          id: m.id,

          course_id: m.course_id,

          title: m.title,

          description: m.description || "",

          order_index: m.order_index || 1,
        }));

        this.saveToStorage("modules", this.modules);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync modules error:", e);
    }
  }

  public async syncSubModulesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("sub_modules")
        .select("*")
        .order("order_index");

      if (!error && Array.isArray(data)) {
        this.subModules = data.map((sm: any) => ({
          id: sm.id,

          module_id: sm.module_id,

          course_id: sm.course_id,

          title: sm.title,

          description: sm.description || "",

          order_index: sm.order_index || 1,

          created_at: sm.created_at || new Date().toISOString(),
        }));

        this.saveToStorage("subModules", this.subModules);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync sub_modules error:", e);
    }
  }

  public async syncPresentationsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from("presentations").select("*");

      if (!error && Array.isArray(data)) {
        const remotePres: Presentation[] = data.map((p: any) => ({
          id: p.id,

          course_id: p.course_id,

          module_id: p.module_id,

          sub_module_id: p.sub_module_id,

          title: p.title,

          description: p.description || "",

          original_file_path: p.original_file_path,

          ppt_url: p.ppt_url,

          total_slides: p.total_slides || 1,

          uploaded_by: p.uploaded_by,

          created_at: p.created_at || new Date().toISOString(),
        }));

        this.presentations = remotePres;

        this.saveToStorage("presentations", this.presentations);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync presentations error:", e);
    }
  }

  public async syncSlideAllocationsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("presentation_slide_allocations")
        .select("*");

      if (!error && Array.isArray(data)) {
        const remoteAllocs: PresentationSlideAllocation[] = data.map(
          (a: any) => ({
            id: a.id,

            presentation_id: a.presentation_id,

            sub_module_id: a.sub_module_id,

            start_slide: a.start_slide,

            end_slide: a.end_slide,

            release_status: a.release_status || "locked",

            scheduled_release_at: a.scheduled_release_at,

            released_at: a.released_at,

            released_by: a.released_by,

            created_at: a.created_at || new Date().toISOString(),

            updated_at: a.updated_at || new Date().toISOString(),
          }),
        );

        this.slideAllocations = remoteAllocs;

        this.saveToStorage("slideAllocations", this.slideAllocations);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync slide allocations error:", e);
    }
  }

  public async syncTopicsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from("topics").select("*");

      if (!error && Array.isArray(data)) {
        const remoteTopics: Topic[] = data.map((t: any) => ({
          id: t.id,

          module_id: t.module_id,

          sub_module_id: t.sub_module_id,

          course_id: t.course_id,

          title: t.title,

          description: t.description || "",

          class_date: t.class_date || new Date().toISOString().split("T")[0],

          order_index: t.order_index || 1,

          recording_link: t.recording_link,

          recording_url: t.recording_link,

          drive_notes_link: t.drive_notes_link,

          drive_notes_url: t.drive_notes_link,

          pdf_url: t.pdf_url,

          ppt_url: t.ppt_url,

          is_published: t.is_published !== false,

          release_status: t.release_status || "released",

          scheduled_release_at: t.scheduled_release_at,

          released_at: t.released_at,

          released_by: t.released_by || "Administrator",

          has_recording: Boolean(t.recording_link),

          has_notes: Boolean(t.drive_notes_link || t.pdf_url),

          has_quiz: false,

          has_flashcards: false,

          created_at: t.created_at || new Date().toISOString(),
        }));

        this.topics = remoteTopics;

        this.saveToStorage("topics", this.topics);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync topics error:", e);
    }
  }

  public async syncHomepageFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("homepage_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        this.homepageSettings = {
          ...this.homepageSettings,

          ...data,
        };

        this.saveToStorage("homepageSettings", this.homepageSettings);
      }
    } catch (e) {
      console.warn("Sync homepage error:", e);
    }
  }

  public async syncHomepageCoursesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("homepage_courses")
        .select("*")
        .order("order_index");

      if (!error && Array.isArray(data)) {
        this.homepageCourses = data;

        this.saveToStorage("homepageCourses", this.homepageCourses);
      }
    } catch (e) {
      console.warn("Sync homepage courses error:", e);
    }
  }

  public async syncAccessRequestsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("student_access_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        this.studentAccessRequests = data;

        this.saveToStorage("studentAccessRequests", this.studentAccessRequests);
      }
    } catch (e) {
      console.warn("Sync access requests error:", e);
    }
  }

  public async syncQuizzesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data: qData, error: qErr } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!qErr && Array.isArray(qData)) {
        const { data: questionsData } = await supabase
          .from("quiz_questions")
          .select("*")
          .order("order_index", { ascending: true });

        const { data: answerKeysData } = await supabase
          .from("quiz_answer_keys")
          .select("*");

        const answerKeyMap = new Map(
          (answerKeysData || []).map((ak: any) => [ak.question_id, ak]),
        );

        const remoteQuizzes: Quiz[] = qData.map((q: any) => {
          const questions = (questionsData || [])

            .filter((qq: any) => qq.quiz_id === q.id)

            .map((qq: any) => {
              const ak = answerKeyMap.get(qq.id) as any;

              return {
                id: qq.id,

                quiz_id: qq.quiz_id,

                question: qq.question,

                options: Array.isArray(qq.options)
                  ? qq.options
                  : typeof qq.options === "string"
                    ? JSON.parse(qq.options)
                    : [],

                correct_answer: ak?.correct_answer || qq.correct_answer || "",

                explanation: ak?.explanation || qq.explanation || "",

                marks: qq.marks || 1,

                order_index: qq.order_index || 1,
              };
            });

          return {
            id: q.id,

            title: q.title,

            description: q.description || "",

            course_id: q.course_id,

            module_id: q.module_id,

            sub_module_id: q.sub_module_id,

            total_marks: q.total_marks || questions.length * 5 || 20,

            duration_minutes: q.duration_minutes || 30,

            start_time: q.start_time,

            end_time: q.end_time,

            status: q.status || "upcoming",

            questions: questions,

            created_by: q.created_by || "Administrator",

            created_at: q.created_at || new Date().toISOString(),
          };
        });

        this.quizzesList = remoteQuizzes;

        this.saveToStorage("quizzesList", this.quizzesList);

        this.checkQuizSchedules();

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync quizzes error:", e);
    }
  }

  public async syncQuizAttemptsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .order("completed_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const remoteAttempts: QuizAttempt[] = data.map((a: any) => ({
          id: a.id,

          quiz_id: a.quiz_id,

          student_id: a.student_id,

          student_name: a.student_name || "Student",

          score: Number(a.score) || 0,

          total_marks: Number(a.total_marks) || 100,

          total_questions: Number(a.total_questions) || (a.answers ? Object.keys(typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers).length : 0),

          correct_count: Number(a.correct_count) || 0,

          accuracy: Number(a.accuracy) || 0,

          answers:
            typeof a.answers === "string"
              ? JSON.parse(a.answers)
              : a.answers || {},

          is_first_attempt: a.is_first_attempt !== false,

          is_practice: Boolean(a.is_practice),

          status: a.status || "completed",

          time_spent_seconds: a.time_spent_seconds || 0,

          completed_at: a.completed_at || new Date().toISOString(),
        }));

        this.quizAttemptsList = remoteAttempts;

        this.saveToStorage("quizAttemptsList", this.quizAttemptsList);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync quiz attempts error:", e);
    }
  }

  public async syncPdfAllocationsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("pdf_page_allocations")
        .select("*");

      if (!error && Array.isArray(data)) {
        const remotePdfAllocs: PdfPageAllocation[] = data.map((pa: any) => ({
          id: pa.id,

          topic_id: pa.topic_id,

          course_id: pa.course_id,

          sub_module_id: pa.sub_module_id,

          pdf_url: pa.pdf_url,

          start_page: pa.start_page,

          end_page: pa.end_page,

          total_pages: pa.total_pages || 10,

          release_status: pa.release_status || "locked",

          scheduled_release_at: pa.scheduled_release_at,

          released_at: pa.released_at,

          released_by: pa.released_by,

          created_at: pa.created_at || new Date().toISOString(),

          updated_at: pa.updated_at || new Date().toISOString(),
        }));

        this.pdfAllocations = remotePdfAllocs;

        this.saveToStorage("pdfAllocations", this.pdfAllocations);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync pdf allocations error:", e);
    }
  }

  public async syncRoadmapProgressFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("student_progress")
        .select("*");

      if (!error && Array.isArray(data)) {
        const remoteProgress: StudentRoadmapProgress[] = data.map(
          (rp: any) => ({
            id: rp.id,

            student_id: rp.student_id,

            course_id: rp.course_id,

            completed_sub_modules: Array.isArray(rp.completed_sub_modules)
              ? rp.completed_sub_modules
              : typeof rp.completed_sub_modules === "string"
                ? JSON.parse(rp.completed_sub_modules)
                : [],

            current_stage: rp.current_stage || "",

            progress_percentage: Number(rp.progress_percentage) || 0,

            updated_at: rp.updated_at || new Date().toISOString(),
          }),
        );

        this.roadmapProgress = remoteProgress;

        this.saveToStorage("roadmapProgress", this.roadmapProgress);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync roadmap progress error:", e);
    }
  }

  public async syncOpportunitiesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        this.opportunities = data.map((o: any) => ({
          id: o.id,

          title: o.title,

          organization: o.organization,

          company: o.organization,

          category: o.category,

          type: o.category,

          description: o.description || "",

          eligibility: o.eligibility || "Open to all students",

          required_skills: Array.isArray(o.required_skills)
            ? o.required_skills
            : typeof o.required_skills === "string"
              ? JSON.parse(o.required_skills)
              : [],

          requiredSkills: Array.isArray(o.required_skills)
            ? o.required_skills
            : typeof o.required_skills === "string"
              ? JSON.parse(o.required_skills)
              : [],

          location: o.location || "Remote",

          is_remote: o.is_remote ?? false,

          stipend_salary: o.stipend_salary || "",

          stipendOrPrize: o.stipend_salary || "",

          deadline: o.deadline || "",

          apply_url: o.apply_url || "",

          applyUrl: o.apply_url || "",

          is_featured: o.is_featured ?? false,

          bookmarked: false,

          created_at: o.created_at || new Date().toISOString(),
        }));

        this.saveToStorage("opportunities", this.opportunities);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync opportunities error:", e);
    }
  }

  public async syncSaturdaySpecialsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("saturday_special")
        .select("*")
        .order("session_date", { ascending: true });

      if (!error && Array.isArray(data)) {
        this.saturdaySpecial = data.map((s: any) => ({
          id: s.id,

          title: s.title,

          category: s.category || "Generative AI",

          description: s.description || "",

          speaker: s.speaker || "Industry Specialist",

          speaker_role: s.speaker_role || "Staff Engineer",

          session_date: s.session_date
            ? new Date(s.session_date).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
            : "Saturday",

          cover_image:
            s.cover_image ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",

          recording_url: s.recording_url || "",

          slides_url: s.slides_url || "",

          resources_url: s.resources_url || "",

          zoom_join_url: s.recording_url || "",

          is_upcoming: s.is_upcoming ?? true,

          attendees_count: 150,
        }));

        this.saveToStorage("saturdaySpecial", this.saturdaySpecial);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync saturday specials error:", e);
    }
  }

  public async syncNotificationsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        this.notifications = data.map((n: any) => ({
          id: n.id,

          user_id: n.user_id,

          title: n.title,

          message: n.message,

          type: n.type || "system",

          link: n.link || "",

          read: n.read ?? false,
          is_read: n.read ?? false,

          created_at: n.created_at || new Date().toISOString(),
        }));

        this.saveToStorage("notifications", this.notifications);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync notifications error:", e);
    }
  }

  public async syncDiscussionsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("discussion_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        this.discussions = data.map((d: any) => ({
          id: d.id,

          author_id: d.author_id,

          author_name: d.author_name || "Community Member",

          author_role: d.author_role || "student",

          author_avatar: d.author_avatar,

          author_batch: d.author_batch || "Batch 2027",

          course_id: d.course_id,

          sub_module_id: d.sub_module_id,

          title: d.title,

          content: d.content,

          category: d.category || "general",

          tags: Array.isArray(d.tags) ? d.tags : [],

          likes_count: Number(d.likes_count) || 0,

          liked_by_user_ids: Array.isArray(d.liked_by_user_ids)
            ? d.liked_by_user_ids
            : [],

          replies_count: Number(d.replies_count) || 0,

          created_at: d.created_at || new Date().toISOString(),
        }));

        this.saveToStorage("discussions", this.discussions);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync discussions error:", e);
    }
  }

  public async syncDiscussionRepliesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("discussion_replies")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data)) {
        this.discussionReplies = data.map((r: any) => ({
          id: r.id,

          post_id: r.post_id,

          author_id: r.author_id,

          author_name: r.author_name || "Member",

          author_role: r.author_role || "student",

          author_avatar: r.author_avatar,

          content: r.content,

          likes_count: Number(r.likes_count) || 0,

          liked_by_user_ids: Array.isArray(r.liked_by_user_ids)
            ? r.liked_by_user_ids
            : [],

          created_at: r.created_at || new Date().toISOString(),
        }));

        this.saveToStorage("discussionReplies", this.discussionReplies);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync discussion replies error:", e);
    }
  }

  public async syncMentorRequestsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("mentor_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        this.mentorRequests = data.map((m: any) => ({
          id: m.id,

          student_id: m.student_id,

          student_name: m.student_name || "Student",

          student_email: m.student_email || "",

          course_id: m.course_id,

          course_title: m.course_title || "Course Doubt",

          topic_title: m.topic_title || "Technical Inquiry",

          assigned_mentor_name: m.assigned_mentor_name || "Lead Instructor",

          doubt_title: m.doubt_title,

          doubt_description: m.doubt_description,

          code_snippet: m.code_snippet,

          status: m.status || "pending",

          priority: m.priority || "medium",

          created_at: m.created_at || new Date().toISOString(),

          updated_at: m.updated_at || new Date().toISOString(),

          replies: [],
        }));

        this.saveToStorage("mentorRequests", this.mentorRequests);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync mentor requests error:", e);
    }
  }

  public async syncMentorRequestRepliesFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("mentor_request_replies")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data)) {
        const replyMap = new Map<string, any[]>();

        data.forEach((r: any) => {
          const list = replyMap.get(r.request_id) || [];

          list.push({
            id: r.id,

            request_id: r.request_id,

            author_id: r.author_id,

            author_name: r.author_name || "Mentor",

            author_role: r.author_role || "mentor",

            author_avatar: r.author_avatar,

            message: r.message,

            code_snippet: r.code_snippet,

            created_at: r.created_at,
          });

          replyMap.set(r.request_id, list);
        });

        this.mentorRequests = this.mentorRequests.map((m) => ({
          ...m,

          replies: replyMap.get(m.id) || m.replies || [],
        }));

        this.saveToStorage("mentorRequests", this.mentorRequests);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync mentor replies error:", e);
    }
  }

  public async syncPracticalSubmissionsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("practical_submissions")
        .select("*");

      if (!error && Array.isArray(data)) {
        this.codingSubmissions = data.map((ps: any) => ({
          id: ps.id,

          student_id: ps.student_id,

          course_id: ps.course_id,

          practical_id: ps.practical_id,

          code: ps.code,

          status: ps.status,

          source_code: ps.code,

          version: Number(ps.version) || 1,

          created_at: ps.created_at || new Date().toISOString(),

          updated_at: ps.updated_at || new Date().toISOString(),
        }));

        this.saveToStorage("codingSubmissions", this.codingSubmissions);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync practical submissions error:", e);
    }
  }

  public async syncFlashcardsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from("flashcards").select("*");

      if (!error && Array.isArray(data)) {
        this.flashcards = data.map((fc: any) => ({
          id: fc.id,

          topic_id: fc.topic_id,

          question: fc.question,

          answer: fc.answer,

          difficulty: fc.difficulty || "medium",

          source_ref: fc.source_ref || "",

          is_published: fc.is_published ?? true,

          created_at: fc.created_at || new Date().toISOString(),
        }));

        this.saveToStorage("flashcards", this.flashcards);

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync flashcards error:", e);
    }
  }

  public async syncInterviewQuestionsFromSupabase() {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("interview_questions")
        .select("*");

      if (!error && Array.isArray(data)) {
        this.interviews = data.map((iq: any) => ({
          id: iq.id,

          topic_id: iq.topic_id,

          role_category: iq.role_category || "Full Stack Engineer",

          question: iq.question,

          model_answer: iq.model_answer,

          key_talking_points: Array.isArray(iq.key_talking_points)
            ? iq.key_talking_points
            : [],

          source_ref: iq.source_ref || "",

          is_published: iq.is_published ?? true,

          created_at: iq.created_at || new Date().toISOString(),
        }));

        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("Sync interview questions error:", e);
    }
  }

  public async syncUsersFromSupabase(): Promise<void> {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("*");

      if (pErr) {
        console.warn("[SkillNova Supabase] syncUsers profiles warning:", pErr.message);
        return;
      }

      if (!profiles || profiles.length === 0) return;

      const { data: roles } = await supabase.from("user_roles").select("*");
      const { data: students } = await supabase.from("students").select("*");
      const { data: subAdmins } = await supabase.from("sub_admins").select("*");
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("*");

      const userMap = new Map<string, User>();

      for (const p of profiles) {
        const roleRow = roles?.find((r: any) => r.user_id === p.id);
        const studentRow = students?.find((s: any) => s.user_id === p.id);
        const subAdminRow = subAdmins?.find((sa: any) => sa.user_id === p.id);
        const userEnrollments =
          enrollments?.filter((e: any) => e.student_id === p.id) || [];

        const assignedCourses =
          subAdminRow?.assigned_courses ||
          userEnrollments.map((e: any) => e.course_id);

        const mappedUser: User = {
          id: p.id,
          email: p.email,
          username:
            (p as any).username || (p.email ? p.email.split("@")[0] : ""),
          full_name:
            p.full_name || (p.email ? p.email.split("@")[0] : "User"),
          phone_number: (p as any).phone_number || undefined,
          phone: (p as any).phone_number || undefined,
          role: (roleRow?.role as UserRole) || "student",
          avatar_url:
            p.avatar_url ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          college: studentRow?.college || undefined,
          branch: studentRow?.branch || undefined,
          year_of_study: studentRow?.year_of_study || undefined,
          status: (studentRow?.status as any) || "active",
          created_at: p.created_at || new Date().toISOString(),
          assigned_courses: assignedCourses,
          permissions: subAdminRow
            ? {
                can_manage_courses: subAdminRow.can_manage_courses !== false,
                can_upload_resources:
                  subAdminRow.can_upload_resources !== false,
                can_generate_ai: subAdminRow.can_generate_ai !== false,
                can_publish_opportunities:
                  subAdminRow.can_publish_opportunities !== false,
              }
            : undefined,
        };

        userMap.set(p.id, mappedUser);
      }

      this.users = Array.from(userMap.values());
      this.saveToStorage("users", this.users);
      this.notifySubscribers();
    } catch (e) {
      console.warn("[SkillNova Supabase] syncUsers error:", e);
    }
  }

  public async syncAuditLogsFromSupabase(): Promise<void> {
    if (!isLiveSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        this.auditLogs = data.map((l: any) => ({
          id: l.id,
          action: l.action,
          resource_id: l.entity_id || l.course_id || "",
          resource_title: l.details || l.action,
          course_id: l.course_id || undefined,
          performed_by: l.actor_email || "System",
          timestamp: l.created_at || new Date().toISOString(),
          details: l.details || "",
        }));

        this.saveToStorage("auditLogs", this.auditLogs);
        this.notifySubscribers();
      }
    } catch (e) {
      console.warn("[SkillNova Supabase] syncAuditLogs error:", e);
    }
  }

  // --- Sub-Admin Scoped Course Access Filter ---

  public getCoursesForCurrentUser(): Course[] {
    if (!this.currentUser) return this.getCourses();

    if (this.currentUser.role === "admin") {
      return this.getCourses();
    }

    if (this.currentUser.role === "sub_admin") {
      const assigned = this.currentUser.assigned_courses || [];

      if (assigned.length === 0) return this.getCourses();

      return this.courses.filter((c) => assigned.includes(c.id));
    }

    // Student

    return this.courses.filter((c) => c.is_published);
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;

    localStorage.setItem("skillnova_current_user_id", user.id);

    this.notifyListeners();

    if (isLiveSupabaseConfigured) {
      void this.syncAllFromSupabase();
    }
  }

  public switchRole(role: "admin" | "sub_admin" | "student") {
    const target = this.users.find((u) => u.role === role);

    if (target) {
      this.setCurrentUser(target);
    }
  }

  public login(
    emailOrUsername: string,
    role?: UserRole,
  ): { success: boolean; user?: User; error?: string } {
    const user = this.getUserByEmail(emailOrUsername);

    if (!user) {
      return {
        success: false,
        error:
          "Account not found. Student and Administrative accounts must be provisioned by an Administrator.",
      };
    }

    if (user.status === "inactive") {
      return {
        success: false,
        error:
          "Your account has been deactivated. Please contact the administrator.",
      };
    }

    if (role === "admin" && user.role === "student") {
      return {
        success: false,
        error:
          "Unauthorized: Student credentials cannot access the Administrative Portal.",
      };
    }

    if (role === "student" && user.role !== "student") {
      // Admins can view student preview or switch

      this.setCurrentUser(user);

      return { success: true, user };
    }

    this.setCurrentUser(user);

    return { success: true, user };
  }

  public logout() {
    this.currentUser = null;

    localStorage.removeItem("skillnova_current_user_id");

    this.notifyListeners();
  }

  // --- Users & Students Management ---

  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    const clean = email.trim().toLowerCase();

    return this.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.username && u.username.toLowerCase() === clean) ||
        u.email.split("@")[0].toLowerCase() === clean ||
        (u.phone_number && u.phone_number.trim() === clean),
    );
  }

  public async updateUserProfile(
    userId: string,
    updates: { full_name?: string; avatar_url?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (isLiveSupabaseConfigured) {
        const payload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.full_name !== undefined) payload.full_name = updates.full_name.trim();
        if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url.trim();

        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", userId);

        if (error) {
          console.error("[SkillNova Supabase] updateUserProfile error:", error);
          return { success: false, error: error.message };
        }
      }

      // Update in memory users list
      const userIdx = this.users.findIndex((u) => u.id === userId);
      if (userIdx !== -1) {
        this.users[userIdx] = {
          ...this.users[userIdx],
          ...(updates.full_name ? { full_name: updates.full_name.trim() } : {}),
          ...(updates.avatar_url ? { avatar_url: updates.avatar_url.trim() } : {}),
        };
        this.saveToStorage("users", this.users);
      }

      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = {
          ...this.currentUser,
          ...(updates.full_name ? { full_name: updates.full_name.trim() } : {}),
          ...(updates.avatar_url ? { avatar_url: updates.avatar_url.trim() } : {}),
        };
        localStorage.setItem(
          "skillnova_auth_user",
          JSON.stringify(this.currentUser)
        );
      }

      this.notifySubscribers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update profile." };
    }
  }

  public getEnrolledCoursesForStudent(studentId: string): Course[] {
    const student =
      this.getUserById(studentId) ||
      (this.currentUser?.id === studentId ? this.currentUser : undefined);

    if (!student) return [];

    const assignedIds =
      student.assigned_courses || student.enrolledCourseIds || [];

    if (assignedIds.length === 0) return [];

    return this.courses.filter((c) => assignedIds.includes(c.id));
  }

  public getStudents(): User[] {
    return this.users.filter((u) => u.role === "student");
  }

  public getSubAdmins(): User[] {
    return this.users.filter((u) => u.role === "sub_admin");
  }

  public async addStudent(studentData: {
    username?: string;
    password?: string;
    full_name?: string;
    phone_number?: string;
    assigned_courses?: string[];
    email?: string;
    college?: string;
    branch?: string;
    year_of_study?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {

    try {
      // 1. Prepare username
      const rawUsername =
        studentData.username ||
        (studentData.email ? studentData.email.split("@")[0] : "");

      const cleanUsername = rawUsername
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "");

      if (!cleanUsername) {
        return { success: false, error: "Valid username is required." };
      }

      if (!studentData.password || studentData.password.length < 8) {
        return {
          success: false,
          error: "Password must contain at least 8 characters.",
        };
      }

      if (
        this.users.some(
          (u) =>
            (u.username && u.username.toLowerCase() === cleanUsername) ||
            u.email.split("@")[0].toLowerCase() === cleanUsername,
        )
      ) {
        return {
          success: false,
          error: `Username "${cleanUsername}" is already taken.`,
        };
      }

      // 2. Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "create-student",
        {
          body: {
            username: cleanUsername,
            password: studentData.password,
            full_name: studentData.full_name || cleanUsername,
            phone_number: studentData.phone_number || "",
            college: studentData.college?.trim() || null,
            branch: studentData.branch?.trim() || null,
            year_of_study: studentData.year_of_study?.trim() || null,
            course_ids: studentData.assigned_courses || [],
          },
        },
      );

      if (error) {
        console.error("[SkillNova] Create student error:", error);
        return {
          success: false,
          error: error.message || "Unable to create student account.",
        };
      }

      if (!data?.success || !data?.user?.id) {
        return {
          success: false,
          error: data?.message || "Student creation failed.",
        };
      }

      // 3. Build frontend User object using actual Supabase ID
      const newStudent: User = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        full_name: data.user.full_name,
        phone_number: data.user.phone_number || "",
        phone: data.user.phone_number || "",
        role: "student",
        avatar_url:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        status: "active",
        created_at: new Date().toISOString(),
        assigned_courses: studentData.assigned_courses || [],
      };

      // 4. Update local application state/storage
      // 4. Update local application state/storage
      this.users.unshift(newStudent);
      this.saveToStorage("users", this.users);

      return {
        success: true,
        user: newStudent,
      };

    } catch (err) {
      console.error("[SkillNova] addStudent exception:", err);

      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error while creating student.",
      };
    }
  }


  public async addSubAdmin(data: {
    username: string;
    password?: string;
    full_name?: string;
    assigned_courses?: string[];
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanUsername = (data.username || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "");

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: "Username must be at least 3 characters." };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    if (
      this.users.some(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanUsername) ||
          u.email.split("@")[0].toLowerCase() === cleanUsername,
      )
    ) {
      return {
        success: false,
        error: `Username "${cleanUsername}" is already taken.`,
      };
    }

    const email = `${cleanUsername}@skillnova.edu`;
    let subAdminUid = `usr-subadmin-${Date.now()}`;

    if (isLiveSupabaseConfigured) {
      try {
        const courseUuids = (data.assigned_courses || []).map((cId) => ensureUuid(cId));

        // Call the dedicated Supabase Edge Function create-subadmin:
        // Uses supabase.auth.admin.createUser with email_confirm: true
        // NEVER sends email, NEVER triggers email rate limit errors, and provisions sub-admin with username & password only!
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
          "create-subadmin",
          {
            body: {
              username: cleanUsername,
              password: data.password,
              full_name: data.full_name || `Sub-Admin ${cleanUsername.toUpperCase()}`,
              assigned_courses: courseUuids,
            },
          },
        );

        if (edgeErr || !edgeData?.success) {
          const errMsg = edgeData?.message || edgeErr?.message;
          console.warn("[SkillNova Supabase] create-subadmin edge invocation note:", errMsg);

          if (errMsg && !errMsg.includes("FunctionsHttpError") && !errMsg.includes("Edge Function")) {
            return {
              success: false,
              error: errMsg,
            };
          }

          // Resilient fallback provisioning if edge function network is unreachable
          const fallbackUid = ensureUuid(`usr-sub-${cleanUsername}-${Date.now().toString().slice(-4)}`);
          await supabase.from("profiles").upsert({
            id: fallbackUid,
            email,
            full_name: data.full_name || `Sub-Admin ${cleanUsername.toUpperCase()}`,
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            theme_preference: "dark",
          });

          await supabase.from("user_roles").upsert({
            user_id: fallbackUid,
            role: "sub_admin",
            assigned_by: this.currentUser?.id || null,
          });

          await supabase.from("sub_admins").upsert({
            user_id: fallbackUid,
            assigned_courses: courseUuids,
            can_manage_courses: true,
            can_upload_resources: true,
            can_generate_ai: true,
            can_publish_opportunities: true,
          });

          subAdminUid = fallbackUid;
        } else {
          subAdminUid = edgeData.user?.id || edgeData.user_id || subAdminUid;
        }

        // Synchronize all users from Supabase immediately
        await this.syncUsersFromSupabase();
      } catch (err: any) {
        console.error("[SkillNova Supabase] Critical addSubAdmin exception:", err);
        return {
          success: false,
          error: err?.message || "Unexpected error provisioning sub-admin in Supabase.",
        };
      }
    }

    const newSubAdmin: User = {
      id: subAdminUid,
      username: cleanUsername,
      email,
      full_name: data.full_name || `Sub-Admin ${cleanUsername.toUpperCase()}`,
      role: "sub_admin",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "active",
      created_at: new Date().toISOString(),
      assigned_courses: data.assigned_courses || this.courses.map((c) => c.id),
      permissions: {
        can_manage_courses: true,
        can_upload_resources: true,
        can_generate_ai: true,
        can_publish_opportunities: true,
      },
    };

    if (!this.users.some(u => u.id === subAdminUid)) {
      this.users.unshift(newSubAdmin);
      this.saveToStorage("users", this.users);
    }

    this.addAuditLogEntry({
      action: "create_sub_admin",
      resource_id: newSubAdmin.id,
      resource_title: newSubAdmin.full_name,
      performed_by: this.currentUser?.full_name || "Super Administrator",
      details: `Sub-admin account created with full operational permissions: ${cleanUsername}`,
    });

    this.notifyListeners();
    return { success: true, user: newSubAdmin };
  }

  public resetUserPassword(
    userId: string,
    newPassword?: string,
  ): { success: boolean; token: string } {
    const token = `SKILLNOVA-REC-${Math.floor(100000 + Math.random() * 900000)}`;

    const user = this.getUserById(userId);

    this.addAuditLogEntry({
      action: "reset_password",

      resource_id: userId,

      resource_title: user?.full_name || userId,

      performed_by: this.currentUser?.full_name || "Administrator",

      details: `Password recovery token issued: ${token}`,
    });

    return { success: true, token };
  }

  public importStudentsCSV(
    parsedRows: Array<{
      name: string;
      email: string;
      college: string;
      branch: string;
      year: string;
      courseId?: string;
    }>,
  ): number {
    let count = 0;

    parsedRows.forEach((row) => {
      if (
        row.email &&
        !this.users.some(
          (u) => u.email.toLowerCase() === row.email.toLowerCase(),
        )
      ) {
        const student: User = {
          id: `usr-csv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

          email: row.email.trim(),

          full_name: row.name.trim() || "Imported Student",

          role: "student",

          college: row.college?.trim() || "Partner University",

          branch: row.branch?.trim() || "Computer Science",

          year_of_study: row.year?.trim() || "3rd Year",

          status: "active",

          created_at: new Date().toISOString(),

          assigned_courses: row.courseId ? [row.courseId] : ["course-fs-101"],
        };

        this.users.push(student);

        count++;
      }
    });

    this.saveToStorage("users", this.users);

    return count;
  }

  public toggleUserStatus(userId: string) {
    let nextStatus: "active" | "inactive" = "active";
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        nextStatus = u.status === "active" ? "inactive" : "active";
        return { ...u, status: nextStatus };
      }

      return u;
    });

    this.saveToStorage("users", this.users);

    if (isLiveSupabaseConfigured) {
      const userUid = ensureUuid(userId);
      supabase
        .from("students")
        .update({ status: nextStatus })
        .eq("user_id", userUid)
        .then(null, (err) =>
          console.warn("[SkillNova Supabase] toggleUserStatus student note:", err),
        );
    }

    this.notifySubscribers();
  }

  public async assignStudentCourses(
    userId: string,
    courseIds: string[],
  ): Promise<void> {
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        return { ...u, assigned_courses: courseIds };
      }

      return u;
    });

    this.saveToStorage("users", this.users);

    if (isLiveSupabaseConfigured) {
      try {
        const studentUid = ensureUuid(userId);

        await supabase
          .from("course_enrollments")
          .delete()
          .eq("student_id", studentUid);

        if (courseIds.length > 0) {
          const inserts = courseIds.map((cId) => ({
            student_id: studentUid,

            course_id: ensureUuid(cId),

            status: "enrolled",
          }));

          const { error } = await supabase
            .from("course_enrollments")
            .insert(inserts);

          if (error) {
            console.error(
              "[SkillNova Supabase] assignStudentCourses error:",
              error,
            );

            throw new Error(error.message);
          }
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] assignStudentCourses error:", e);

        throw e;
      }
    }

    this.notifySubscribers();
  }

  public async assignSubAdminCourses(
    userId: string,
    courseIds: string[],
  ): Promise<void> {
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        return { ...u, assigned_courses: courseIds };
      }

      return u;
    });

    this.saveToStorage("users", this.users);

    if (isLiveSupabaseConfigured) {
      try {
        const userUid = ensureUuid(userId);

        const uuidCourses = courseIds.map((cId) => ensureUuid(cId));

        const { error } = await supabase.from("sub_admins").upsert(
          {
            user_id: userUid,

            assigned_courses: uuidCourses,

            can_manage_courses: true,

            can_upload_resources: true,

            can_generate_ai: true,

            can_publish_opportunities: true,
          },
          { onConflict: "user_id" },
        );

        if (error) {
          console.error(
            "[SkillNova Supabase] assignSubAdminCourses error:",
            error,
          );

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] assignSubAdminCourses error:", e);

        throw e;
      }
    }

    this.notifySubscribers();
  }

  // --- Courses & Roadmaps ---

  public getCourses(): Course[] {
    return [...this.courses];
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id || c.slug === id);
  }

  public async addCourse(courseData: Partial<Course>): Promise<Course> {
    const slug = (courseData.title || "untitled-course")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const newCoursePayload: any = {
      title: courseData.title || "Untitled Course",

      description: courseData.description || "Course description...",

      slug: `${slug}-${Date.now().toString().slice(-4)}`,

      category: courseData.category || "Technology",

      mentor_name: courseData.mentor_name || "Senior Instructor",

      mentor_email: courseData.mentor_email || "mentor@skillnova.edu",

      duration_weeks: Number(courseData.duration_weeks) || 12,

      thumbnail_url:
        courseData.thumbnail ||
        courseData.thumbnail_url ||
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",

      roadmap_image_url:
        courseData.roadmap_image_url ||
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",

      is_published: courseData.is_published !== false,

      curriculum_text: courseData.curriculum_text || "",

      course_fee: courseData.course_fee || courseData.fee || "₹14,999",

      timeline:
        courseData.timeline ||
        `${courseData.duration_weeks || 12} Weeks • Live Cohort`,
    };

    let createdCourse: Course;

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("courses")
          .insert(newCoursePayload)
          .select()
          .single();

        if (error) {
          console.error("[SkillNova Supabase] addCourse error:", error);

          throw new Error(error.message);
        }

        if (data) {
          createdCourse = {
            id: data.id,

            title: data.title,

            slug: data.slug,

            description: data.description || "",

            category: data.category,

            mentor_name: data.mentor_name,

            mentor_email: data.mentor_email,

            duration_weeks: data.duration_weeks,

            thumbnail: data.thumbnail_url,

            thumbnail_url: data.thumbnail_url,

            roadmap_image_url: data.roadmap_image_url,

            is_published: data.is_published,

            curriculum_text: data.curriculum_text,

            course_fee: data.course_fee,

            timeline: data.timeline,

            enrolled_students_count: 0,

            created_at: data.created_at || new Date().toISOString(),

            updated_at: data.updated_at || new Date().toISOString(),
          };
        } else {
          throw new Error(
            "Course creation failed: No data returned from Supabase.",
          );
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] addCourse error:", e);

        throw e;
      }
    } else {
      createdCourse = {
        id: `course-${Date.now()}`,

        ...newCoursePayload,

        thumbnail: newCoursePayload.thumbnail_url,

        enrolled_students_count: 0,

        created_at: new Date().toISOString(),

        updated_at: new Date().toISOString(),
      };
    }

    this.courses.unshift(createdCourse);

    this.saveToStorage("courses", this.courses);

    this.notifySubscribers();

    return createdCourse;
  }

  public async updateCourseRoadmap(
    courseId: string,
    roadmapUrl: string,
  ): Promise<void> {
    const nowIso = new Date().toISOString();

    this.courses = this.courses.map((c) => {
      if (c.id === courseId) {
        return { ...c, roadmap_image_url: roadmapUrl, updated_at: nowIso };
      }

      return c;
    });

    this.saveToStorage("courses", this.courses);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(courseId);

        await supabase
          .from("courses")
          .update({
            roadmap_image_url: roadmapUrl,

            updated_at: nowIso,
          })
          .eq("id", targetId);
      } catch (e) {
        console.warn("[SkillNova Supabase] roadmap sync error:", e);
      }
    }

    this.notifySubscribers();
  }

  public async updateCourse(
    courseId: string,
    updates: Partial<Course>,
  ): Promise<Course | undefined> {
    const updatedTime = new Date().toISOString();

    let updated: Course | undefined;

    this.courses = this.courses.map((c) => {
      if (c.id === courseId) {
        updated = { ...c, ...updates, updated_at: updatedTime };

        return updated;
      }

      return c;
    });

    this.saveToStorage("courses", this.courses);

    if (isLiveSupabaseConfigured && updated) {
      try {
        const payload: any = {
          title: updated.title,

          description: updated.description,

          category: updated.category,

          mentor_name: updated.mentor_name,

          duration_weeks: updated.duration_weeks,

          thumbnail_url: updated.thumbnail || updated.thumbnail_url,

          roadmap_image_url: updated.roadmap_image_url,

          is_published: updated.is_published,

          curriculum_text: updated.curriculum_text,

          course_fee: updated.course_fee,

          timeline: updated.timeline,

          updated_at: updatedTime,
        };

        const targetId = ensureUuid(courseId);

        await supabase.from("courses").update(payload).eq("id", targetId);
      } catch (e) {
        console.warn("[SkillNova Supabase] updateCourse error:", e);
      }
    }

    this.notifySubscribers();

    return updated;
  }

  public async deleteCourse(
    courseId: string,
    performedBy?: string,
  ): Promise<boolean> {
    const course = this.courses.find((c) => c.id === courseId);

    if (!course) return false;

    this.courses = this.courses.filter((c) => c.id !== courseId);

    this.saveToStorage("courses", this.courses);

    this.topics = this.topics.map((t) => {
      if (t.course_id === courseId) {
        return {
          ...t,
          is_published: false,
          release_status: "archived" as const,
        };
      }

      return t;
    });

    this.saveToStorage("topics", this.topics);

    this.users = this.users.map((u) => {
      if (u.assigned_courses?.includes(courseId)) {
        return {
          ...u,

          assigned_courses: u.assigned_courses.filter((id) => id !== courseId),

          enrolledCourseIds: u.enrolledCourseIds?.filter(
            (id) => id !== courseId,
          ),
        };
      }

      return u;
    });

    this.saveToStorage("users", this.users);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(courseId);

        const { error } = await supabase
          .from("courses")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] deleteCourse error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] deleteCourse failed:", e);

        throw e;
      }
    }

    this.addAuditLogEntry({
      action: "delete_course",

      resource_id: courseId,

      resource_title: course.title,

      performed_by:
        performedBy || this.currentUser?.full_name || "Administrator",

      details: `Course "${course.title}" deleted and archived. Student visibility revoked.`,
    });

    this.notifyListeners();

    return true;
  }

  public async deleteTopic(
    topicId: string,
    performedBy?: string,
  ): Promise<boolean> {
    const topic = this.topics.find((t) => t.id === topicId);

    if (!topic) return false;

    this.topics = this.topics.filter((t) => t.id !== topicId);

    this.saveToStorage("topics", this.topics);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(topicId);

        const { error } = await supabase
          .from("topics")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] deleteTopic error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] deleteTopic error:", e);

        throw e;
      }
    }

    this.addAuditLogEntry({
      action: "delete_resource",

      resource_id: topicId,

      resource_title: topic.title,

      course_id: topic.course_id,

      performed_by:
        performedBy || this.currentUser?.full_name || "Administrator",

      details: `Resource "${topic.title}" permanently removed`,
    });

    this.notifyListeners();

    return true;
  }

  // --- Modules & Topics ---

  public getModulesForCourse(courseId: string): CourseModule[] {
    const courseMods = this.modules

      .filter((m) => m.course_id === courseId)

      .sort((a, b) => a.order_index - b.order_index);

    return courseMods.map((m) => {
      const subMods = this.subModules

        .filter((sm) => sm.module_id === m.id)

        .sort((a, b) => a.order_index - b.order_index);

      return {
        ...m,

        sub_modules: subMods,

        topics: this.topics

          .filter((t) => t.module_id === m.id)

          .sort((a, b) => a.order_index - b.order_index),
      };
    });
  }

  public async addModule(
    courseId: string,
    title: string,
    description?: string,
    orderIndex?: number,
  ): Promise<CourseModule> {
    const currentMods = this.modules.filter((m) => m.course_id === courseId);

    const order =
      orderIndex !== undefined ? orderIndex : currentMods.length + 1;

    let newMod: CourseModule = {
      id: `mod-${Date.now()}`,

      course_id: courseId,

      title: title.trim(),

      description: description || "",

      order_index: order,
    };

    if (isLiveSupabaseConfigured) {
      try {
        const courseUid = ensureUuid(courseId);

        const { data, error } = await supabase
          .from("modules")
          .insert({
            course_id: courseUid,

            title: title.trim(),

            description: description || "",

            order_index: order,
          })
          .select()
          .single();

        if (error) {
          console.error("[SkillNova Supabase] addModule error:", error);

          throw new Error(error.message);
        }

        if (data) {
          newMod.id = data.id;
        }
      } catch (e) {
        console.error("[SkillNova Supabase] addModule error:", e);

        throw e;
      }
    }

    this.modules.push(newMod);

    this.saveToStorage("modules", this.modules);

    this.addAuditLogEntry({
      action: "create_module",

      resource_id: newMod.id,

      resource_title: newMod.title,

      course_id: courseId,

      performed_by: "Administrator",

      details: `Created new course module: "${title}"`,
    });

    this.notifySubscribers();

    return newMod;
  }

  public async updateModule(
    moduleId: string,
    updates: Partial<CourseModule>,
  ): Promise<CourseModule | null> {
    const mod = this.modules.find((m) => m.id === moduleId);

    if (!mod) return null;

    if (updates.title) mod.title = updates.title;

    if (updates.description !== undefined)
      mod.description = updates.description;

    if (updates.order_index !== undefined)
      mod.order_index = updates.order_index;

    this.saveToStorage("modules", this.modules);

    if (isLiveSupabaseConfigured) {
      try {
        const modUid = ensureUuid(moduleId);

        await supabase
          .from("modules")
          .update({
            title: mod.title,

            description: mod.description,

            order_index: mod.order_index,
          })
          .eq("id", modUid);
      } catch (e) {
        console.warn("[SkillNova Supabase] updateModule note:", e);
      }
    }

    this.addAuditLogEntry({
      action: "edit_module",

      resource_id: mod.id,

      resource_title: mod.title,

      course_id: mod.course_id,

      performed_by: "Administrator",

      details: `Updated module details: "${mod.title}"`,
    });

    this.notifySubscribers();

    return mod;
  }

  public async deleteModule(moduleId: string): Promise<boolean> {
    const mod = this.modules.find((m) => m.id === moduleId);

    if (!mod) return false;

    this.modules = this.modules.filter((m) => m.id !== moduleId);

    this.saveToStorage("modules", this.modules);

    if (isLiveSupabaseConfigured) {
      try {
        const modUid = ensureUuid(moduleId);

        const { error } = await supabase
          .from("modules")
          .delete()
          .eq("id", modUid);

        if (error) {
          console.error("[SkillNova Supabase] deleteModule error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] deleteModule error:", e);

        throw e;
      }
    }

    this.addAuditLogEntry({
      action: "delete_module",

      resource_id: moduleId,

      resource_title: mod.title,

      course_id: mod.course_id,

      performed_by: "Administrator",

      details: `Deleted module: "${mod.title}"`,
    });

    this.notifySubscribers();

    return true;
  }

  public async addTopic(topicData: Partial<Topic>): Promise<Topic> {
    const courseId =
      topicData.course_id ||
      this.courses[0]?.id ||
      "c0000000-0000-0000-0000-000000000101";

    let moduleId = topicData.module_id;

    // Auto-create module if none exists for this course

    if (!moduleId) {
      const existingMods = this.modules.filter((m) => m.course_id === courseId);

      if (existingMods.length > 0) {
        moduleId = existingMods[0].id;
      } else {
        const createdMod = await this.addModule(
          courseId,
          "Module 1: Core Curriculum & Practicals",
        );

        moduleId = createdMod.id;
      }
    }

    const releaseStatus = topicData.release_status || "released";

    const isReleased = releaseStatus === "released";

    let newTopic: Topic = {
      id: `top-${Date.now()}`,

      module_id: moduleId,

      sub_module_id: topicData.sub_module_id,

      course_id: courseId,

      title: topicData.title || "New Topic",

      description: topicData.description || "",

      class_date:
        topicData.class_date || new Date().toISOString().split("T")[0],

      order_index:
        this.topics.filter((t) => t.module_id === moduleId).length + 1,

      recording_link: topicData.recording_link,

      recording_url: topicData.recording_link || topicData.recording_url,

      drive_notes_link: topicData.drive_notes_link,

      drive_notes_url: topicData.drive_notes_link || topicData.drive_notes_url,

      pdf_url: topicData.pdf_url,

      pdf_file_url: topicData.pdf_file_url || topicData.pdf_url,

      ppt_url: topicData.ppt_url,

      ppt_file_url: topicData.ppt_file_url || topicData.ppt_url,

      reference_links: topicData.reference_links || [],

      is_published: isReleased,

      release_status: releaseStatus,

      scheduled_release_at: topicData.scheduled_release_at,

      released_at: isReleased ? new Date().toISOString() : undefined,

      released_by: topicData.released_by || "Administrator",

      resource_category: topicData.resource_category || "pdf",

      has_recording: Boolean(
        topicData.recording_link || topicData.recording_url,
      ),

      has_notes: Boolean(topicData.drive_notes_link || topicData.pdf_url),

      has_quiz: false,

      has_flashcards: false,

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("topics")
          .insert({
            course_id: ensureUuid(courseId),

            module_id: ensureUuid(moduleId),

            sub_module_id: topicData.sub_module_id
              ? ensureUuid(topicData.sub_module_id)
              : null,

            title: newTopic.title,

            description: newTopic.description,

            class_date: newTopic.class_date,

            order_index: newTopic.order_index,

            recording_link: newTopic.recording_link,

            drive_notes_link: newTopic.drive_notes_link,

            pdf_url: newTopic.pdf_url,

            ppt_url: newTopic.ppt_url,

            is_published: newTopic.is_published,

            release_status: newTopic.release_status,

            scheduled_release_at: newTopic.scheduled_release_at,

            released_at: newTopic.released_at,

            released_by: newTopic.released_by,
          })
          .select()
          .single();

        if (!error && data) {
          newTopic.id = data.id;
        } else {
          console.warn("[SkillNova Supabase] addTopic note:", error?.message);
        }
      } catch (e) {
        console.warn("[SkillNova Supabase] addTopic error:", e);
      }
    }

    this.topics.unshift(newTopic);

    this.saveToStorage("topics", this.topics);

    this.addAuditLogEntry({
      action: isReleased
        ? "release"
        : releaseStatus === "scheduled"
          ? "reschedule"
          : "publish",

      resource_id: newTopic.id,

      resource_title: newTopic.title,

      course_id: newTopic.course_id,

      performed_by: newTopic.released_by || "Administrator",

      details: `Resource created with initial status: ${releaseStatus}`,
    });

    if (isReleased) {
      this.notifyEnrolledStudents(newTopic);
    }

    this.notifySubscribers();

    return newTopic;
  }

  public addAuditLogEntry(
    entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ): AuditLogEntry {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

      timestamp: new Date().toISOString(),

      ...entry,
    };

    this.auditLogs.unshift(newLog);

    this.saveToStorage("auditLogs", this.auditLogs);

    if (isLiveSupabaseConfigured) {
      supabase
        .from("audit_logs")
        .insert({
          action: newLog.action,
          entity_type: "resource",
          entity_id: newLog.resource_id,
          course_id: newLog.course_id ? ensureUuid(newLog.course_id) : null,
          details: newLog.details || newLog.resource_title,
          actor_email: this.currentUser?.email || "admin@skillnova.edu",
        })
        .then(null, (err) =>
          console.warn("[SkillNova Supabase] audit_logs insert note:", err),
        );
    }

    return newLog;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  private notifyEnrolledStudents(topic: Topic) {
    this.getStudents().forEach((student) => {
      const assigned =
        student.assigned_courses || student.enrolledCourseIds || [];

      if (assigned.includes(topic.course_id)) {
        this.createNotification({
          user_id: student.id,

          title: `Resource Released: ${topic.title}`,

          message: `New curriculum material is now available in your enrolled course.`,

          type: "resource",

          link: `/student/courses/${topic.course_id}`,
        });
      }
    });
  }

  public async releaseTopic(
    topicId: string,
    releasedBy = "Administrator",
  ): Promise<Topic | undefined> {
    const topic = this.topics.find((t) => t.id === topicId);

    if (!topic) return undefined;

    topic.release_status = "released";

    topic.is_published = true;

    topic.released_at = new Date().toISOString();

    topic.released_by = releasedBy;

    this.saveToStorage("topics", this.topics);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(topicId);

        const { error } = await supabase
          .from("topics")
          .update({
            release_status: "released",

            is_published: true,

            released_at: topic.released_at,

            released_by: releasedBy,

            updated_at: new Date().toISOString(),
          })
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] releaseTopic error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] releaseTopic failed:", e);

        throw e;
      }
    }

    this.addAuditLogEntry({
      action: "release",

      resource_id: topic.id,

      resource_title: topic.title,

      course_id: topic.course_id,

      performed_by: releasedBy,

      details: "Immediately released to student cohort feed",
    });

    this.notifyEnrolledStudents(topic);

    this.notifySubscribers();

    return topic;
  }

  public async holdTopic(
    topicId: string,
    scheduledIsoDate?: string,
    heldBy = "Administrator",
  ): Promise<Topic | undefined> {
    const topic = this.topics.find((t) => t.id === topicId);

    if (!topic) return undefined;

    const isScheduled = Boolean(scheduledIsoDate);

    topic.release_status = isScheduled ? "scheduled" : "held";

    topic.is_published = false;

    topic.scheduled_release_at = scheduledIsoDate;

    this.saveToStorage("topics", this.topics);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(topicId);

        const { error } = await supabase
          .from("topics")
          .update({
            release_status: topic.release_status,

            is_published: false,

            scheduled_release_at: scheduledIsoDate,

            updated_at: new Date().toISOString(),
          })
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] holdTopic error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] holdTopic failed:", e);

        throw e;
      }
    }

    this.addAuditLogEntry({
      action: isScheduled ? "reschedule" : "hold",

      resource_id: topic.id,

      resource_title: topic.title,

      course_id: topic.course_id,

      performed_by: heldBy,

      details: isScheduled
        ? `Scheduled for automatic release at ${new Date(scheduledIsoDate!).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} (IST)`
        : "Placed on indefinite hold; hidden from student workspace",
    });

    this.notifySubscribers();

    return topic;
  }

  public archiveTopic(
    topicId: string,
    archivedBy = "Administrator",
  ): Topic | undefined {
    const topic = this.topics.find((t) => t.id === topicId);

    if (!topic) return undefined;

    topic.release_status = "archived";

    topic.is_published = false;

    this.saveToStorage("topics", this.topics);

    this.addAuditLogEntry({
      action: "archive",

      resource_id: topic.id,

      resource_title: topic.title,

      course_id: topic.course_id,

      performed_by: archivedBy,

      details: "Resource archived from active student curriculum",
    });

    return topic;
  }

  public updateTopic(
    topicId: string,
    updates: Partial<Topic>,
    editor = "Administrator",
  ): Topic | undefined {
    const topic = this.topics.find((t) => t.id === topicId);

    if (!topic) return undefined;

    Object.assign(topic, updates);

    this.saveToStorage("topics", this.topics);

    this.addAuditLogEntry({
      action: "edit",

      resource_id: topic.id,

      resource_title: topic.title,

      course_id: topic.course_id,

      performed_by: editor,

      details: "Resource metadata and URLs updated",
    });

    return topic;
  }

  public getReleasedTopics(courseId?: string): Topic[] {
    const now = new Date().getTime();

    let updatedAny = false;

    this.topics.forEach((t) => {
      if (t.release_status === "scheduled" && t.scheduled_release_at) {
        if (new Date(t.scheduled_release_at).getTime() <= now) {
          t.release_status = "released";

          t.is_published = true;

          t.released_at = new Date().toISOString();

          updatedAny = true;

          if (isLiveSupabaseConfigured) {
            supabase
              .from("topics")
              .update({
                release_status: "released",
                is_published: true,
                released_at: t.released_at,
              })
              .eq("id", t.id)
              .then(null, (err) => console.warn("Topic auto-release update error:", err));
          }

          this.notifyEnrolledStudents(t);
        }
      }
    });

    if (updatedAny) {
      this.saveToStorage("topics", this.topics);
    }

    let list = this.topics.filter(
      (t) =>
        t.release_status === "released" ||
        (!t.release_status && t.is_published),
    );

    if (courseId) {
      list = list.filter((t) => t.course_id === courseId);
    }

    return list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public getAllAdminTopics(courseId?: string): Topic[] {
    let list = this.topics;

    if (courseId) {
      list = list.filter((t) => t.course_id === courseId);
    }

    return [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public getAllPublishedTopics(): Topic[] {
    return this.getReleasedTopics();
  }

  // --- Sub-Modules Management ---

  public getSubModules(
    moduleId?: string,
    courseId?: string,
  ): CourseSubModule[] {
    let list = this.subModules;

    if (moduleId) {
      list = list.filter((sm) => sm.module_id === moduleId);
    }

    if (courseId) {
      list = list.filter((sm) => sm.course_id === courseId);
    }

    return [...list].sort((a, b) => a.order_index - b.order_index);
  }

  public async addSubModule(
    moduleId: string,
    courseId: string,
    title: string,
    description?: string,
    orderIndex?: number,
  ): Promise<CourseSubModule> {
    const existing = this.subModules.filter((sm) => sm.module_id === moduleId);

    const order = orderIndex !== undefined ? orderIndex : existing.length + 1;

    let newSubMod: CourseSubModule = {
      id: `submod-${Date.now()}`,

      module_id: moduleId,

      course_id: courseId,

      title: title.trim(),

      description: description || "",

      order_index: order,

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const modUid = ensureUuid(moduleId);

        const courseUid = ensureUuid(courseId);

        const { data, error } = await supabase
          .from("sub_modules")
          .insert({
            module_id: modUid,

            course_id: courseUid,

            title: title.trim(),

            description: description || "",

            order_index: order,
          })
          .select()
          .single();

        if (!error && data) {
          newSubMod.id = data.id;
        } else {
          console.warn(
            "[SkillNova Supabase] addSubModule note:",
            error?.message,
          );
        }
      } catch (e) {
        console.warn("[SkillNova Supabase] addSubModule error:", e);
      }
    }

    this.subModules.push(newSubMod);

    this.saveToStorage("subModules", this.subModules);

    this.addAuditLogEntry({
      action: "create_module",

      resource_id: newSubMod.id,

      resource_title: newSubMod.title,

      course_id: courseId,

      performed_by: this.currentUser?.full_name || "Administrator",

      details: `Created sub-module "${title}" in module ${moduleId}`,
    });

    this.notifySubscribers();

    return newSubMod;
  }

  public async updateSubModule(
    subModuleId: string,
    updates: Partial<CourseSubModule>,
  ): Promise<CourseSubModule | null> {
    const sm = this.subModules.find((s) => s.id === subModuleId);

    if (!sm) return null;

    if (updates.title) sm.title = updates.title;

    if (updates.description !== undefined) sm.description = updates.description;

    if (updates.order_index !== undefined) sm.order_index = updates.order_index;

    this.saveToStorage("subModules", this.subModules);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(subModuleId);

        await supabase
          .from("sub_modules")
          .update({
            title: sm.title,

            description: sm.description,

            order_index: sm.order_index,
          })
          .eq("id", targetId);
      } catch (e) {
        console.warn("[SkillNova Supabase] updateSubModule error:", e);
      }
    }

    this.notifySubscribers();

    return sm;
  }

  public async deleteSubModule(subModuleId: string): Promise<boolean> {
    const sm = this.subModules.find((s) => s.id === subModuleId);

    if (!sm) return false;

    this.subModules = this.subModules.filter((s) => s.id !== subModuleId);

    this.saveToStorage("subModules", this.subModules);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(subModuleId);

        const { error } = await supabase
          .from("sub_modules")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] deleteSubModule error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("[SkillNova Supabase] deleteSubModule error:", e);

        throw e;
      }
    }

    this.notifySubscribers();

    return true;
  }

  // --- Presentations & Slide Allocations ---

  public getPresentations(
    courseId?: string,
    moduleId?: string,
    subModuleId?: string,
  ): Presentation[] {
    let list = this.presentations;

    if (courseId) {
      list = list.filter((p) => p.course_id === courseId);
    }

    if (moduleId) {
      list = list.filter((p) => p.module_id === moduleId);
    }

    if (subModuleId) {
      const presIdsWithAlloc = this.slideAllocations

        .filter((a) => a.sub_module_id === subModuleId)

        .map((a) => a.presentation_id);

      list = list.filter(
        (p) =>
          p.sub_module_id === subModuleId || presIdsWithAlloc.includes(p.id),
      );
    }

    return list.map((p) => ({
      ...p,

      allocations: this.slideAllocations.filter(
        (a) => a.presentation_id === p.id,
      ),
    }));
  }

  public getPresentationById(id: string): Presentation | undefined {
    const p = this.presentations.find((pres) => pres.id === id);

    if (!p) return undefined;

    return {
      ...p,

      allocations: this.slideAllocations.filter(
        (a) => a.presentation_id === p.id,
      ),
    };
  }

  public async addPresentation(
    presData: Partial<Presentation>,
  ): Promise<Presentation> {
    const courseId =
      presData.course_id ||
      this.courses[0]?.id ||
      "c0000000-0000-0000-0000-000000000101";

    const moduleId =
      presData.module_id ||
      this.modules[0]?.id ||
      "m0000000-0000-0000-0000-000000000101";

    let newPres: Presentation = {
      id: `pres-${Date.now()}`,

      course_id: courseId,

      module_id: moduleId,

      sub_module_id: presData.sub_module_id,

      title: presData.title || "Untitled Presentation",

      description: presData.description || "",

      original_file_path: presData.original_file_path || "",

      ppt_url: presData.ppt_url || "",

      total_slides: Number(presData.total_slides) || 10,

      uploaded_by:
        presData.uploaded_by ||
        this.currentUser?.email ||
        "admin@skillnova.edu",

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("presentations")
          .insert({
            course_id: ensureUuid(courseId),

            module_id: ensureUuid(moduleId),

            sub_module_id: presData.sub_module_id
              ? ensureUuid(presData.sub_module_id)
              : null,

            title: newPres.title,

            description: newPres.description,

            original_file_path: newPres.original_file_path,

            ppt_url: newPres.ppt_url,

            total_slides: newPres.total_slides,

            uploaded_by: ensureUuid(this.currentUser?.id),
          })
          .select()
          .single();

        if (!error && data) {
          newPres.id = data.id;
        } else {
          console.warn(
            "[SkillNova Supabase] addPresentation note:",
            error?.message,
          );
        }
      } catch (e) {
        console.warn("[SkillNova Supabase] addPresentation error:", e);
      }
    }

    this.presentations.unshift(newPres);

    this.saveToStorage("presentations", this.presentations);

    this.addAuditLogEntry({
      action: "publish",

      resource_id: newPres.id,

      resource_title: newPres.title,

      course_id: newPres.course_id,

      performed_by: this.currentUser?.full_name || "Administrator",

      details: `Uploaded PPT presentation "${newPres.title}" with ${newPres.total_slides} slides`,
    });

    this.notifySubscribers();

    return newPres;
  }

  public async updatePresentation(
    id: string,
    updates: Partial<Presentation>,
  ): Promise<Presentation | undefined> {
    let updated: Presentation | undefined;

    this.presentations = this.presentations.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates };

        return updated;
      }

      return p;
    });

    this.saveToStorage("presentations", this.presentations);

    if (isLiveSupabaseConfigured && updated) {
      try {
        const targetId = ensureUuid(id);

        await supabase
          .from("presentations")
          .update({
            title: updated.title,

            description: updated.description,

            sub_module_id: updated.sub_module_id
              ? ensureUuid(updated.sub_module_id)
              : null,

            ppt_url: updated.ppt_url,

            total_slides: updated.total_slides,
          })
          .eq("id", targetId);
      } catch (e) {
        console.warn("[SkillNova Supabase] updatePresentation error:", e);
      }
    }

    this.notifySubscribers();

    return updated;
  }

  public async deletePresentation(id: string): Promise<boolean> {
    const pres = this.presentations.find((p) => p.id === id);

    if (!pres) return false;

    this.presentations = this.presentations.filter((p) => p.id !== id);

    this.slideAllocations = this.slideAllocations.filter(
      (a) => a.presentation_id !== id,
    );

    this.saveToStorage("presentations", this.presentations);

    this.saveToStorage("slideAllocations", this.slideAllocations);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        await supabase.from("presentations").delete().eq("id", targetId);

        await supabase
          .from("presentation_slide_allocations")
          .delete()
          .eq("presentation_id", targetId);
      } catch (e) {
        console.warn("[SkillNova Supabase] deletePresentation error:", e);
      }
    }

    this.addAuditLogEntry({
      action: "delete_resource",

      resource_id: id,

      resource_title: pres.title,

      course_id: pres.course_id,

      performed_by: this.currentUser?.full_name || "Administrator",

      details: `Deleted presentation "${pres.title}" and its slide allocations`,
    });

    this.notifySubscribers();

    return true;
  }

  public getSlideAllocations(
    presentationId?: string,
    subModuleId?: string,
  ): PresentationSlideAllocation[] {
    let list = this.slideAllocations;

    if (presentationId) {
      list = list.filter((a) => a.presentation_id === presentationId);
    }

    if (subModuleId) {
      list = list.filter((a) => a.sub_module_id === subModuleId);
    }

    return [...list].sort((a, b) => a.start_slide - b.start_slide);
  }

  public async addSlideAllocation(
    allocData: Partial<PresentationSlideAllocation>,
  ): Promise<PresentationSlideAllocation> {
    let newAlloc: PresentationSlideAllocation = {
      id: `alloc-${Date.now()}`,

      presentation_id: allocData.presentation_id || "",

      sub_module_id: allocData.sub_module_id || "",

      start_slide: Number(allocData.start_slide) || 1,

      end_slide: Number(allocData.end_slide) || 1,

      release_status: allocData.release_status || "locked",

      scheduled_release_at: allocData.scheduled_release_at,

      released_at:
        allocData.release_status === "released"
          ? new Date().toISOString()
          : undefined,

      released_by:
        allocData.release_status === "released"
          ? this.currentUser?.full_name || "Administrator"
          : undefined,

      created_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("presentation_slide_allocations")
          .insert({
            presentation_id: ensureUuid(newAlloc.presentation_id),

            sub_module_id: ensureUuid(newAlloc.sub_module_id),

            start_slide: newAlloc.start_slide,

            end_slide: newAlloc.end_slide,

            release_status: newAlloc.release_status,

            scheduled_release_at: newAlloc.scheduled_release_at,

            released_at: newAlloc.released_at,

            released_by: ensureUuid(this.currentUser?.id),
          })
          .select()
          .single();

        if (!error && data) {
          newAlloc.id = data.id;
        } else {
          console.warn(
            "[SkillNova Supabase] addSlideAllocation note:",
            error?.message,
          );
        }
      } catch (e) {
        console.warn("[SkillNova Supabase] addSlideAllocation error:", e);
      }
    }

    this.slideAllocations.push(newAlloc);

    this.saveToStorage("slideAllocations", this.slideAllocations);

    this.notifySubscribers();

    return newAlloc;
  }

  public async updateSlideAllocation(
    id: string,
    updates: Partial<PresentationSlideAllocation>,
  ): Promise<PresentationSlideAllocation | undefined> {
    let updated: PresentationSlideAllocation | undefined;

    this.slideAllocations = this.slideAllocations.map((a) => {
      if (a.id === id) {
        updated = {
          ...a,

          ...updates,

          updated_at: new Date().toISOString(),
        };

        if (updates.release_status === "released" && !updated.released_at) {
          updated.released_at = new Date().toISOString();

          updated.released_by = this.currentUser?.full_name || "Administrator";
        }

        return updated;
      }

      return a;
    });

    this.saveToStorage("slideAllocations", this.slideAllocations);

    if (isLiveSupabaseConfigured && updated) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("presentation_slide_allocations")
          .update({
            start_slide: updated.start_slide,

            end_slide: updated.end_slide,

            release_status: updated.release_status,

            scheduled_release_at: updated.scheduled_release_at,

            released_at: updated.released_at,

            released_by: updated.released_by,

            updated_at: updated.updated_at,
          })
          .eq("id", targetId);

        if (error) {
          console.warn(
            "[SkillNova Supabase] updateSlideAllocation note:",
            error.message,
          );
        }
      } catch (err) {
        console.warn("[SkillNova Supabase] updateSlideAllocation error:", err);
      }
    }

    this.notifySubscribers();

    return updated;
  }

  public async deleteSlideAllocation(id: string): Promise<boolean> {
    const exists = this.slideAllocations.some((a) => a.id === id);

    if (!exists) return false;

    this.slideAllocations = this.slideAllocations.filter((a) => a.id !== id);

    this.saveToStorage("slideAllocations", this.slideAllocations);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("presentation_slide_allocations")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.warn(
            "[SkillNova Supabase] deleteSlideAllocation note:",
            error.message,
          );
        }
      } catch (err) {
        console.warn("[SkillNova Supabase] deleteSlideAllocation error:", err);
      }
    }

    this.notifySubscribers();

    return true;
  }

  public getAuthorizedSlidesForSubModule(
    presentationId: string,
    subModuleId: string,
  ): {
    isAccessible: boolean;

    isScheduled?: boolean;

    isLocked?: boolean;

    scheduledReleaseAt?: string;

    startSlide?: number;

    endSlide?: number;

    totalSlides?: number;

    allocation?: PresentationSlideAllocation;
  } {
    const pres = this.presentations.find((p) => p.id === presentationId);

    const alloc = this.slideAllocations.find(
      (a) =>
        a.presentation_id === presentationId && a.sub_module_id === subModuleId,
    );

    if (!alloc) {
      // If no granular slide allocation was configured, presentation is accessible immediately
      // unless a future release schedule was specifically configured on the presentation
      const presScheduled = (pres as any)?.scheduled_release_at;
      if (presScheduled) {
        const isPast = new Date(presScheduled).getTime() <= Date.now();
        return {
          isAccessible: isPast,
          isScheduled: !isPast,
          isLocked: !isPast,
          scheduledReleaseAt: presScheduled,
          startSlide: 1,
          endSlide: pres?.total_slides || 10,
          totalSlides: pres?.total_slides || 10,
        };
      }
      return {
        isAccessible: true,
        isScheduled: false,
        isLocked: false,
        startSlide: 1,
        endSlide: pres?.total_slides || 10,
        totalSlides: pres?.total_slides || 10,
      };
    }

    if (alloc.release_status === "scheduled" && alloc.scheduled_release_at) {
      const isPast = new Date(alloc.scheduled_release_at).getTime() <= Date.now();
      if (isPast) {
        alloc.release_status = "released";
        return {
          isAccessible: true,
          isScheduled: false,
          isLocked: false,
          startSlide: alloc.start_slide,
          endSlide: alloc.end_slide,
          totalSlides: pres?.total_slides || alloc.end_slide,
          allocation: alloc,
        };
      }
      return {
        isAccessible: false,
        isScheduled: true,
        isLocked: true,
        scheduledReleaseAt: alloc.scheduled_release_at,
        startSlide: alloc.start_slide,
        endSlide: alloc.end_slide,
        totalSlides: pres?.total_slides || alloc.end_slide,
        allocation: alloc,
      };
    }

    // Released or without a future schedule
    return {
      isAccessible: true,
      isScheduled: false,
      isLocked: false,
      startSlide: alloc.start_slide,
      endSlide: alloc.end_slide,
      totalSlides: pres?.total_slides || alloc.end_slide,
      allocation: alloc,
    };
  }

  // --- Automatic Release Checker ---

  public checkScheduledReleases() {
    const now = new Date();

    let hasChanges = false;

    // Check slide allocations

    this.slideAllocations.forEach((alloc) => {
      if (alloc.release_status === "scheduled" && alloc.scheduled_release_at) {
        const releaseTime = new Date(alloc.scheduled_release_at);

        if (releaseTime <= now) {
          alloc.release_status = "released";

          alloc.released_at = now.toISOString();

          alloc.released_by = alloc.released_by || "Auto Scheduler";

          hasChanges = true;

          if (isLiveSupabaseConfigured) {
            supabase
              .from("presentation_slide_allocations")
              .update({
                release_status: "released",

                released_at: alloc.released_at,

                released_by: alloc.released_by,

                updated_at: now.toISOString(),
              })
              .eq("id", alloc.id)
              .then(null, (err) =>
                console.warn("Scheduled release update error:", err),
              );
          }

          this.addAuditLogEntry({
            action: "release",

            resource_id: alloc.id,

            resource_title: `Slides ${alloc.start_slide}-${alloc.end_slide}`,

            performed_by: "Auto Scheduler",

            details: `Scheduled slide range ${alloc.start_slide} to ${alloc.end_slide} automatically released at ${now.toISOString()}`,
          });
        }
      }
    });

    // Check topics

    this.topics.forEach((topic) => {
      if (topic.release_status === "scheduled" && topic.scheduled_release_at) {
        const releaseTime = new Date(topic.scheduled_release_at);

        if (releaseTime <= now) {
          topic.release_status = "released";

          topic.is_published = true;

          topic.released_at = now.toISOString();

          topic.released_by = topic.released_by || "Auto Scheduler";

          hasChanges = true;

          if (isLiveSupabaseConfigured) {
            supabase
              .from("topics")
              .update({
                release_status: "released",

                is_published: true,

                released_at: topic.released_at,

                released_by: topic.released_by,

                updated_at: now.toISOString(),
              })
              .eq("id", topic.id)
              .then(null, (err) =>
                console.warn("Scheduled topic release update error:", err),
              );
          }

          this.addAuditLogEntry({
            action: "release",

            resource_id: topic.id,

            resource_title: topic.title,

            course_id: topic.course_id,

            performed_by: "Auto Scheduler",

            details: `Scheduled topic "${topic.title}" automatically released to students`,
          });

          this.notifyEnrolledStudents(topic);
        }
      }
    });

    if (hasChanges) {
      this.saveToStorage("slideAllocations", this.slideAllocations);

      this.saveToStorage("topics", this.topics);

      this.notifySubscribers();
    }

    this.checkScheduledPdfReleases();

    this.checkQuizSchedules();
  }

  // --- Google Drive Link Access Validation Helper ---

  public validateDriveLink(url: string): {
    isValid: boolean;
    isPublic: boolean;
    advice: string;
  } {
    if (!url || !url.trim()) {
      return {
        isValid: false,
        isPublic: false,
        advice: "Please enter a valid URL.",
      };
    }

    const isDrive =
      url.includes("drive.google.com") || url.includes("docs.google.com");

    if (!isDrive) {
      return {
        isValid: true,
        isPublic: true,
        advice: "External link verified.",
      };
    }

    const hasViewPermission =
      url.includes("/view") || url.includes("/sharing") || url.includes("id=");

    return {
      isValid: true,

      isPublic: hasViewPermission,

      advice: hasViewPermission
        ? 'Google Drive reference link recognized. Ensure file access is set to "Anyone with the link can view".'
        : 'Note: Ensure link permissions in Google Drive are set to "Anyone with the link can view" to allow student access.',
    };
  }

  // --- AI Content Generation Studio ---

  public generateAIContentFromDocument(
    courseId: string,

    topicId: string,

    documentName: string,

    rawText: string,
  ): AIGenerationJob {
    const course = this.getCourseById(courseId);

    const topic = this.topics.find((t) => t.id === topicId);

    const topicTitle = topic ? topic.title : "Selected Topic";

    // Grounded mock extraction simulation (mimicking Gemini 2.0 Flash structured outputs)

    const summary = `Systematic summary of "${documentName}" for topic "${topicTitle}". The document covers fundamental principles, architectural boundaries, edge cases, and industry implementation patterns grounded in source text.`;

    const generatedFlashcards: Flashcard[] = [
      {
        id: `fc-gen-${Date.now()}-1`,

        topic_id: topicId,

        topic_title: topicTitle,

        question: `According to ${documentName}, what is the primary architecture rationale for this approach?`,

        answer: `It isolates state mutations, guarantees referential transparency, and reduces runtime bottlenecks under high concurrency.`,

        difficulty: "medium",

        source_ref: `${documentName}, Section 2.1 (Grounded in uploaded PDF)`,
      },

      {
        id: `fc-gen-${Date.now()}-2`,

        topic_id: topicId,

        topic_title: topicTitle,

        question: `Which tradeoff is explicitly highlighted in ${documentName}?`,

        answer: `Increased initial memory overhead in exchange for sub-millisecond retrieval latency.`,

        difficulty: "hard",

        source_ref: `${documentName}, Section 4.3 (Tradeoff Matrix)`,
      },
    ];

    const generatedQuizzes: QuizQuestion[] = [
      {
        id: `quiz-gen-${Date.now()}-1`,

        topic_id: topicId,

        topic_title: topicTitle,

        question: `Based directly on "${documentName}", what is the primary invariant maintained by the system?`,

        options: [
          "Strict transactional serializability without locking overhead",

          "Eventual consistency with asynchronous gossip protocol",

          "Unbounded in-memory queueing",

          "Manual memory deallocation",
        ],

        correct_index: 0,

        explanation: `As detailed in Section 3 of ${documentName}, the architecture enforces strict serializability using optimistic concurrency checks.`,

        source_ref: `${documentName}, Page 12, Theorem 1`,
      },

      {
        id: `quiz-gen-${Date.now()}-2`,

        topic_id: topicId,

        topic_title: topicTitle,

        question: `In the context of ${topicTitle}, what failure mode does the document advise engineering teams to protect against?`,

        options: [
          "Silent cascade degradation during downstream network partitions",

          "Uncontrolled CPU overclocking",

          "Browser cache overfill",

          "Compiler syntax ambiguity",
        ],

        correct_index: 0,

        explanation: `Section 5 highlights defensive circuit breaking to avoid cascading failures across downstream services.`,

        source_ref: `${documentName}, Page 27, Operational Resilience`,
      },
    ];

    const generatedInterviews = [
      {
        id: `iq-gen-${Date.now()}-1`,

        topic_id: topicId,

        role_category: course?.category || "Engineering",

        question: `How would you explain the core concepts of "${topicTitle}" as presented in ${documentName} in a senior technical interview?`,

        model_answer: `Begin by articulating the core engineering problem: scale and maintainability. Reference the specific invariants outlined in ${documentName}, discuss why traditional alternatives fail under load, and outline defensive monitoring metrics.`,

        key_talking_points: [
          "State boundaries and isolation",

          "Quantitative throughput tradeoffs",

          "Defensive error recovery and fallback strategies",
        ],

        source_ref: `${documentName}, Executive Summary & System Design Chapter`,
      },
    ];

    const importantConcepts = [
      {
        term: "Grounded Execution Invariant",

        definition:
          "System state condition that remains true across all concurrent executions without drift.",

        source_page: `${documentName}, Page 5`,
      },

      {
        term: "Optimistic Verification",

        definition:
          "Method of validating operations at commit time rather than locking resources proactively.",

        source_page: `${documentName}, Page 18`,
      },
    ];

    const newJob: AIGenerationJob = {
      id: `job-${Date.now()}`,

      course_id: courseId,

      topic_id: topicId,

      document_name: documentName,

      extracted_text_preview:
        rawText.slice(0, 320) + (rawText.length > 320 ? "..." : ""),

      status: "pending_review",

      summary,

      flashcards: generatedFlashcards,

      quiz_questions: generatedQuizzes,

      interview_questions: generatedInterviews,

      important_concepts: importantConcepts,

      created_at: new Date().toISOString(),
    };

    this.aiJobs.unshift(newJob);

    this.saveToStorage("aiJobs", this.aiJobs);

    return newJob;
  }

  public getAIJobs(): AIGenerationJob[] {
    return [...this.aiJobs];
  }

  public updateAIJob(jobId: string, updates: Partial<AIGenerationJob>) {
    this.aiJobs = this.aiJobs.map((j) => {
      if (j.id === jobId) {
        return { ...j, ...updates, reviewed_at: new Date().toISOString() };
      }

      return j;
    });

    this.saveToStorage("aiJobs", this.aiJobs);
  }

  public approveAndPublishAIJob(jobId: string, reviewerName: string) {
    const job = this.aiJobs.find((j) => j.id === jobId);

    if (!job) return;

    job.status = "published";

    job.reviewed_by = reviewerName;

    job.reviewed_at = new Date().toISOString();

    // Publish flashcards to main collection

    if (job.flashcards && job.flashcards.length > 0) {
      this.flashcards.push(...job.flashcards);

      this.saveToStorage("flashcards", this.flashcards);
    }

    // Publish quizzes to main collection

    if (job.quiz_questions && job.quiz_questions.length > 0) {
      this.quizzes.push(...job.quiz_questions);

      this.saveToStorage("quizzes", this.quizzes);
    }

    // Mark topic flags

    this.topics = this.topics.map((t) => {
      if (t.id === job.topic_id) {
        return {
          ...t,

          has_quiz: true,

          has_flashcards: true,
        };
      }

      return t;
    });

    this.saveToStorage("topics", this.topics);

    this.saveToStorage("aiJobs", this.aiJobs);

    // Notify enrolled students

    this.getStudents().forEach((student) => {
      if (student.assigned_courses?.includes(job.course_id)) {
        this.createNotification({
          user_id: student.id,

          title: `New AI Assessments Published`,

          message: `AI-grounded flashcards and quizzes for ${job.document_name} have been approved and published.`,

          type: "quiz",

          link: `/student/practice/quiz/${job.quiz_questions[0]?.id || ""}`,
        });
      }
    });
  }

  public async addFlashcard(
    topicIdOrData: string | {
      topic_id?: string;
      course_id?: string;
      question: string;
      answer: string;
      difficulty?: string;
      is_published?: boolean;
    },
    questionArg?: string,
    answerArg?: string,
    difficultyArg = "medium",
  ): Promise<Flashcard> {
    const isObj = typeof topicIdOrData === 'object' && topicIdOrData !== null;
    const topicId = isObj ? (topicIdOrData.topic_id || '') : topicIdOrData;
    const courseId = isObj ? topicIdOrData.course_id : undefined;
    const question = isObj ? topicIdOrData.question : (questionArg || '');
    const answer = isObj ? topicIdOrData.answer : (answerArg || '');
    const difficulty = isObj ? (topicIdOrData.difficulty || 'medium') : (difficultyArg || 'medium');
    const isPublished = isObj ? (topicIdOrData.is_published !== false) : true;

    const newFc: Flashcard = {
      id: `fc-${Date.now()}`,
      topic_id: topicId,
      course_id: courseId,
      question,
      answer,
      difficulty: difficulty as any,
      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const insertPayload: any = {
          question,
          answer,
          difficulty,
          is_published: isPublished,
        };
        if (topicId) {
          insertPayload.topic_id = ensureUuid(topicId);
        }
        const { data, error } = await supabase
          .from("flashcards")
          .insert(insertPayload)
          .select()
          .single();

        if (!error && data) {
          newFc.id = data.id;
        } else if (error) {
          console.error("[SkillNova Supabase] addFlashcard error:", error);
        }
      } catch (e) {
        console.error("addFlashcard failed:", e);
      }
    }

    this.flashcards.push(newFc);
    this.saveToStorage("flashcards", this.flashcards);
    this.notifyListeners();
    return newFc;
  }

  public getFlashcardsForModule(moduleId: string, courseId?: string): Flashcard[] {
    const topicIds = this.topics.filter(t => t.module_id === moduleId).map(t => t.id);
    return this.flashcards.filter(f =>
      (f.topic_id && topicIds.includes(f.topic_id)) ||
      (f.topic_id === moduleId) ||
      (courseId && f.course_id === courseId)
    );
  }

  public async deleteFlashcard(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("flashcards")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] deleteFlashcard error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("deleteFlashcard failed:", e);

        throw e;
      }
    }

    this.flashcards = this.flashcards.filter((f) => f.id !== id);

    this.saveToStorage("flashcards", this.flashcards);

    this.notifySubscribers();

    return true;
  }

  public async addInterviewQuestion(
    topicId: string,
    question: string,
    modelAnswer: string,
    roleCategory = "Full Stack Engineer",
    keyPoints: string[] = [],
  ): Promise<InterviewQuestion> {
    const newIq: InterviewQuestion = {
      id: `iq-${Date.now()}`,

      topic_id: topicId,

      role_category: roleCategory,

      question,

      model_answer: modelAnswer,

      key_talking_points: keyPoints,

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .insert({
            topic_id: ensureUuid(topicId),

            role_category: roleCategory,

            question,

            model_answer: modelAnswer,

            key_talking_points: keyPoints,

            is_published: true,
          })
          .select()
          .single();

        if (error) {
          console.error(
            "[SkillNova Supabase] addInterviewQuestion error:",
            error,
          );

          throw new Error(error.message);
        }

        if (data) {
          newIq.id = data.id;
        }
      } catch (e: any) {
        console.error("addInterviewQuestion failed:", e);

        throw e;
      }
    }

    this.interviews.push(newIq);

    this.notifySubscribers();

    return newIq;
  }

  public async deleteInterviewQuestion(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("interview_questions")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error(
            "[SkillNova Supabase] deleteInterviewQuestion error:",
            error,
          );

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("deleteInterviewQuestion failed:", e);

        throw e;
      }
    }

    this.interviews = this.interviews.filter((iq) => iq.id !== id);

    this.notifySubscribers();

    return true;
  }

  // --- Flashcards & Practice ---

  public getFlashcards(
    courseIdOrTopicId?: string,
    topicId?: string,
  ): Flashcard[] {
    const tid =
      topicId ||
      (courseIdOrTopicId?.startsWith("top-") ? courseIdOrTopicId : undefined);

    const cid = topicId
      ? courseIdOrTopicId
      : !courseIdOrTopicId?.startsWith("top-")
        ? courseIdOrTopicId
        : undefined;

    let list = this.flashcards;

    if (tid) {
      list = list.filter((f) => f.topic_id === tid);
    }

    if (cid && !tid) {
      list = list.filter((f) => f.course_id === cid);
    }

    return [...list];
  }

  // --- Quizzes & Scoring ---

  public getQuizzes(topicId?: string): QuizQuestion[] {
    if (topicId) {
      return this.quizzes.filter((q) => q.topic_id === topicId);
    }

    return [...this.quizzes];
  }

  public submitQuizAttempt(
    attempt: Omit<QuizAttempt, "id" | "completed_at">,
  ): QuizAttempt {
    const newAttempt: QuizAttempt = {
      ...attempt,

      id: `attempt-${Date.now()}`,

      completed_at: new Date().toISOString(),
    };

    this.quizAttempts.unshift(newAttempt);

    this.saveToStorage("quizAttempts", this.quizAttempts);

    return newAttempt;
  }

  public getQuizAttempts(studentId?: string): QuizAttempt[] {
    if (studentId) {
      return this.quizAttempts.filter((a) => a.student_id === studentId);
    }

    return [...this.quizAttempts];
  }

  // --- Saturday Special ---

  public getSaturdaySpecials(): SaturdaySpecial[] {
    return [...this.saturdaySpecial].sort(
      (a, b) =>
        new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
    );
  }

  public async addSaturdaySpecial(
    session: Partial<SaturdaySpecial>,
  ): Promise<SaturdaySpecial> {
    const sessionDateIso =
      session.session_date &&
        (session.session_date.includes("T") || session.session_date.includes("-"))
        ? session.session_date
        : new Date(Date.now() + 7 * 86400000).toISOString();

    const payload: any = {
      title: session.title || "Emerging Tech Session",

      category: session.category || "Generative AI",

      description: session.description || "",

      speaker: session.speaker || "Guest Specialist",

      speaker_role: session.speaker_role || "Industry Expert",

      session_date: sessionDateIso,

      cover_image:
        session.cover_image ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",

      recording_url: session.recording_url || "",

      slides_url: session.slides_url || "",

      resources_url: session.resources_url || session.slides_url || "",

      is_upcoming: session.is_upcoming ?? true,
    };

    let newSession: SaturdaySpecial;

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("saturday_special")
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error(
            "[SkillNova Supabase] addSaturdaySpecial error:",
            error,
          );

          throw new Error(error.message);
        }

        if (data) {
          newSession = {
            id: data.id,

            title: data.title,

            category: data.category,

            description: data.description || "",

            speaker: data.speaker,

            speaker_role: data.speaker_role,

            session_date: new Date(data.session_date).toLocaleString("en-IN", {
              dateStyle: "full",
              timeStyle: "short",
            }),

            cover_image: data.cover_image,

            recording_url: data.recording_url,

            slides_url: data.slides_url,

            resources_url: data.resources_url,

            zoom_join_url: data.recording_url,

            is_upcoming: data.is_upcoming,

            attendees_count: 0,
          };

          this.saturdaySpecial.unshift(newSession);

          this.saveToStorage("saturdaySpecial", this.saturdaySpecial);

          this.notifySubscribers();

          return newSession;
        }
      } catch (err: any) {
        console.error("addSaturdaySpecial failed:", err);

        throw err;
      }
    }

    newSession = {
      id: `sat-${Date.now()}`,

      ...payload,

      attendees_count: 0,
    };

    this.saturdaySpecial.unshift(newSession);

    this.saveToStorage("saturdaySpecial", this.saturdaySpecial);

    this.notifySubscribers();

    return newSession;
  }

  // --- Opportunities & Career ---

  public getOpportunities(): Opportunity[] {
    return [...this.opportunities];
  }

  public async addOpportunity(opp: Partial<Opportunity>): Promise<Opportunity> {
    const cat = (
      opp.category ||
      (opp as any).type ||
      "internship"
    ).toLowerCase();

    const payload: any = {
      title: opp.title || "New Opportunity",

      organization:
        opp.organization || (opp as any).company || "Hiring Organization",

      category: [
        "internship",
        "job",
        "hackathon",
        "competition",
        "research",
      ].includes(cat)
        ? cat
        : "internship",

      description: opp.description || "",

      eligibility: opp.eligibility || "Open to all students",

      required_skills: opp.required_skills ||
        (opp as any).requiredSkills || ["Programming", "Problem Solving"],

      location: opp.location || "Remote",

      is_remote:
        opp.is_remote ??
        (opp.location?.toLowerCase().includes("remote") || false),

      stipend_salary:
        opp.stipend_salary || (opp as any).stipendOrPrize || "Competitive",

      deadline:
        opp.deadline ||
        new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],

      apply_url:
        opp.apply_url ||
        (opp as any).applyUrl ||
        "https://skillnova.edu/careers",

      is_featured: opp.is_featured ?? true,
    };

    let newOpp: Opportunity;

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error("[SkillNova Supabase] addOpportunity error:", error);

          throw new Error(error.message);
        }

        if (data) {
          newOpp = {
            id: data.id,

            title: data.title,

            organization: data.organization,

            company: data.organization,

            category: data.category,

            type: data.category,

            description: data.description || "",

            eligibility: data.eligibility || "",

            required_skills: Array.isArray(data.required_skills)
              ? data.required_skills
              : [],

            requiredSkills: Array.isArray(data.required_skills)
              ? data.required_skills
              : [],

            location: data.location || "",

            is_remote: data.is_remote,

            stipend_salary: data.stipend_salary || "",

            stipendOrPrize: data.stipend_salary || "",

            deadline: data.deadline,

            apply_url: data.apply_url,

            applyUrl: data.apply_url,

            is_featured: data.is_featured,

            published_at: data.created_at,

            created_at: data.created_at,

            bookmarked: false,
          };

          this.opportunities.unshift(newOpp);

          this.saveToStorage("opportunities", this.opportunities);

          this.notifySubscribers();

          return newOpp;
        }
      } catch (err: any) {
        console.error("addOpportunity failed:", err);

        throw err;
      }
    }

    newOpp = {
      id: `opp-${Date.now()}`,

      ...payload,

      company: payload.organization,

      type: payload.category,

      stipendOrPrize: payload.stipend_salary,

      applyUrl: payload.apply_url,

      requiredSkills: payload.required_skills,

      bookmarked: false,
    };

    this.opportunities.unshift(newOpp);

    this.saveToStorage("opportunities", this.opportunities);

    this.notifySubscribers();

    return newOpp;
  }

  public async deleteOpportunity(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("opportunities")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error("[SkillNova Supabase] deleteOpportunity error:", error);

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("deleteOpportunity failed:", e);

        throw e;
      }
    }

    this.opportunities = this.opportunities.filter((o) => o.id !== id);

    this.saveToStorage("opportunities", this.opportunities);

    this.notifySubscribers();

    return true;
  }

  public async deleteSaturdaySpecial(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("saturday_special")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error(
            "[SkillNova Supabase] deleteSaturdaySpecial error:",
            error,
          );

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("deleteSaturdaySpecial failed:", e);

        throw e;
      }
    }

    this.saturdaySpecial = this.saturdaySpecial.filter((s) => s.id !== id);

    this.saveToStorage("saturdaySpecial", this.saturdaySpecial);

    this.notifySubscribers();

    return true;
  }

  public async deleteDiscussionPost(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("discussion_posts")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error(
            "[SkillNova Supabase] deleteDiscussionPost error:",
            error,
          );

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("deleteDiscussionPost failed:", e);

        throw e;
      }
    }

    this.discussions = this.discussions.filter((d) => d.id !== id);

    this.discussionReplies = this.discussionReplies.filter(
      (r) => r.post_id !== id,
    );

    this.saveToStorage("discussions", this.discussions);

    this.saveToStorage("discussionReplies", this.discussionReplies);

    this.notifySubscribers();

    return true;
  }

  public async deleteDiscussionReply(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error } = await supabase
          .from("discussion_replies")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error(
            "[SkillNova Supabase] deleteDiscussionReply error:",
            error,
          );

          throw new Error(error.message);
        }
      } catch (e: any) {
        console.error("deleteDiscussionReply failed:", e);

        throw e;
      }
    }

    this.discussionReplies = this.discussionReplies.filter((r) => r.id !== id);

    this.saveToStorage("discussionReplies", this.discussionReplies);

    this.notifySubscribers();

    return true;
  }

  public toggleBookmarkOpportunity(id: string) {
    this.opportunities = this.opportunities.map((o) => {
      if (o.id === id) {
        return { ...o, bookmarked: !o.bookmarked };
      }

      return o;
    });

    this.saveToStorage("opportunities", this.opportunities);
  }

  // --- Career Blueprints ---

  public getCareerBlueprints(): CareerBlueprint[] {
    return [...this.blueprints];
  }

  public getBlueprintBySlug(slug: string): CareerBlueprint | undefined {
    return this.blueprints.find((b) => b.slug === slug || b.id === slug);
  }

  public addCareerBlueprint(bp: CareerBlueprint) {
    this.blueprints.push(bp);

    this.saveToStorage("blueprints", this.blueprints);
  }

  // --- Notifications & Scrolling Ticker Announcements ---

  public getStudentTickerAnnouncements(studentId: string): TickerAnnouncement[] {
    const announcementsMap = new Map<string, TickerAnnouncement>();
    const now = new Date();

    const formatISTDateTime = (isoString?: string): string => {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(d);
      } catch {
        return isoString;
      }
    };

    // 1. Live Daily Meeting / Live Class Session (if configured & active)
    const settings = this.getHomepageSettings();
    if (settings.live_meeting_is_active && settings.live_meeting_url && settings.live_meeting_url.trim()) {
      const isDaily = settings.live_meeting_is_daily_recurring !== false;
      const timeStr = settings.live_meeting_time || 'Everyday at 07:00 PM IST';
      announcementsMap.set('live-meeting-daily', {
        id: 'live-meeting-daily',
        type: 'live_meeting',
        title: `🔴 Live Session: ${settings.live_meeting_title || 'Daily Engineering Cohort Masterclass'} • Time: ${timeStr} ${isDaily ? '(Daily Recurring Class — Resume Everyday)' : ''} — Click to Join Live Room`,
        link: settings.live_meeting_url,
        is_external_link: true,
        published_at: settings.live_meeting_updated_at || new Date().toISOString(),
        priority: 1
      });
    }

    // 2. Identify Student Enrolled Courses
    const enrolledCourses = this.getEnrolledCoursesForStudent(studentId);
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return Array.from(announcementsMap.values());
    }

    const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id));
    const courseTitleMap = new Map<string, string>();
    enrolledCourses.forEach((c) => courseTitleMap.set(c.id, c.title));

    // Module title map
    const moduleTitleMap = new Map<string, string>();
    this.modules.forEach((m) => {
      if (enrolledCourseIds.has(m.course_id)) {
        moduleTitleMap.set(m.id, m.title);
      }
    });

    // 3. Quizzes for enrolled courses
    this.checkQuizSchedules();
    enrolledCourses.forEach((course) => {
      const courseQuizzes = this.getQuizzesList(course.id);
      courseQuizzes.forEach((quiz) => {
        const start = quiz.start_time ? new Date(quiz.start_time) : null;
        const end = quiz.end_time ? new Date(quiz.end_time) : null;

        // Respect release window: only if active or start_time is reached
        const isLiveOrUpcomingActive = quiz.status === 'active' ||
          (start && start <= now && (!end || end >= now));

        if (isLiveOrUpcomingActive) {
          const startFormatted = formatISTDateTime(quiz.start_time);
          const endFormatted = formatISTDateTime(quiz.end_time);
          const timeRange = startFormatted && endFormatted
            ? `available from ${startFormatted} to ${endFormatted} (IST)`
            : 'is now available for evaluation';

          const quizKey = `quiz-${quiz.id}`;
          announcementsMap.set(quizKey, {
            id: quizKey,
            type: 'quiz',
            title: `📝 ${quiz.title} (${course.title}) is ${timeRange}.`,
            course_id: course.id,
            course_title: course.title,
            module_id: quiz.module_id,
            sub_module_id: quiz.sub_module_id,
            resource_id: quiz.id,
            published_at: quiz.start_time || quiz.created_at,
            link: '/student/quizzes',
            priority: 2
          });
        }
      });
    });

    // 4. Released Topics & Learning Resources for Enrolled Courses
    this.topics.forEach((topic) => {
      if (!enrolledCourseIds.has(topic.course_id)) return;

      const isExplicitlyReleased = topic.is_published === true;
      const isScheduledAndDue = topic.release_status === 'scheduled' &&
        topic.scheduled_release_at &&
        new Date(topic.scheduled_release_at) <= now;

      if (!isExplicitlyReleased && !isScheduledAndDue) return;

      const modTitle = topic.module_id ? moduleTitleMap.get(topic.module_id) : '';
      const prefix = modTitle ? `${modTitle} – ` : '';
      const courseTitle = courseTitleMap.get(topic.course_id) || '';

      // A. Videos
      if (topic.has_recording || topic.recording_url || topic.drive_video_url || topic.resource_type === 'video' || topic.resource_type === 'drive_video') {
        const key = `video-${topic.id}`;
        if (!announcementsMap.has(key)) {
          announcementsMap.set(key, {
            id: key,
            type: 'video',
            title: `🎬 ${prefix}${topic.title} Video has been released.`,
            course_id: topic.course_id,
            course_title: courseTitle,
            module_id: topic.module_id,
            sub_module_id: topic.sub_module_id,
            resource_id: topic.id,
            published_at: topic.released_at || topic.scheduled_release_at || topic.created_at,
            link: `/student/courses/${topic.course_id}?module=${topic.module_id || ''}&subModule=${topic.sub_module_id || ''}&type=video`,
            priority: 3
          });
        }
      }

      // B. PPT Presentations
      if (topic.ppt_url || topic.ppt_file_url || topic.resource_type === 'ppt' || topic.resource_type === 'ppt_presentation') {
        const key = `ppt-${topic.id}`;
        if (!announcementsMap.has(key)) {
          announcementsMap.set(key, {
            id: key,
            type: 'ppt',
            title: `📊 ${prefix}${topic.title} PPT has been released.`,
            course_id: topic.course_id,
            course_title: courseTitle,
            module_id: topic.module_id,
            sub_module_id: topic.sub_module_id,
            resource_id: topic.id,
            published_at: topic.released_at || topic.scheduled_release_at || topic.created_at,
            link: `/student/courses/${topic.course_id}?module=${topic.module_id || ''}&subModule=${topic.sub_module_id || ''}&type=ppt`,
            priority: 3
          });
        }
      }

      // C. Notes & Documents
      if (topic.doc_url || topic.drive_notes_url || topic.pdf_url || topic.resource_type === 'notes' || topic.resource_type === 'drive_notes') {
        const key = `notes-${topic.id}`;
        if (!announcementsMap.has(key)) {
          announcementsMap.set(key, {
            id: key,
            type: 'notes',
            title: `📄 ${prefix}${topic.title} Notes & Documents are now available.`,
            course_id: topic.course_id,
            course_title: courseTitle,
            module_id: topic.module_id,
            sub_module_id: topic.sub_module_id,
            resource_id: topic.id,
            published_at: topic.released_at || topic.scheduled_release_at || topic.created_at,
            link: `/student/courses/${topic.course_id}?module=${topic.module_id || ''}&subModule=${topic.sub_module_id || ''}&type=notes`,
            priority: 3
          });
        }
      }
    });

    // 5. Presentation Slide Allocations
    this.presentations.forEach((pres) => {
      if (!enrolledCourseIds.has(pres.course_id)) return;
      const modTitle = pres.module_id ? moduleTitleMap.get(pres.module_id) : '';
      const prefix = modTitle ? `${modTitle} – ` : '';

      (pres.allocations || []).forEach((alloc) => {
        const isReleased = alloc.release_status === 'released' ||
          (alloc.release_status === 'scheduled' && alloc.scheduled_release_at && new Date(alloc.scheduled_release_at) <= now);

        if (isReleased) {
          const key = `slide-alloc-${alloc.id}`;
          if (!announcementsMap.has(key)) {
            announcementsMap.set(key, {
              id: key,
              type: 'ppt',
              title: `📊 ${prefix}${pres.title} PPT (Slides ${alloc.start_slide}–${alloc.end_slide}) has been released.`,
              course_id: pres.course_id,
              course_title: courseTitleMap.get(pres.course_id),
              module_id: pres.module_id,
              sub_module_id: alloc.sub_module_id,
              resource_id: pres.id,
              published_at: alloc.released_at || alloc.scheduled_release_at || alloc.created_at,
              link: `/student/courses/${pres.course_id}?module=${pres.module_id || ''}&subModule=${alloc.sub_module_id || ''}&type=ppt`,
              priority: 3
            });
          }
        }
      });
    });

    // 6. Interview Questions
    this.getInterviewQuestions().forEach((iq: InterviewQuestion) => {
      if (iq.is_published === false) return;
      const parentTopic = this.topics.find((t) => t.id === iq.topic_id);
      if (!parentTopic || !enrolledCourseIds.has(parentTopic.course_id)) return;

      const modTitle = parentTopic.module_id ? moduleTitleMap.get(parentTopic.module_id) : '';
      const prefix = modTitle ? `${modTitle} – ` : '';
      const key = `interview-${parentTopic.id}`;
      if (!announcementsMap.has(key)) {
        announcementsMap.set(key, {
          id: key,
          type: 'interview',
          title: `💡 ${prefix}${parentTopic.title} Interview Questions have been published.`,
          course_id: parentTopic.course_id,
          course_title: courseTitleMap.get(parentTopic.course_id),
          module_id: parentTopic.module_id,
          sub_module_id: parentTopic.sub_module_id,
          resource_id: parentTopic.id,
          published_at: iq.created_at || parentTopic.created_at,
          link: `/student/courses/${parentTopic.course_id}?module=${parentTopic.module_id || ''}&subModule=${parentTopic.sub_module_id || ''}&type=interview`,
          priority: 3
        });
      }
    });

    // 7. General Notifications & System Announcements
    this.getNotifications(studentId).forEach((ann: Notification) => {
      const key = `notif-${ann.id}`;
      if (!announcementsMap.has(key)) {
        announcementsMap.set(key, {
          id: key,
          type: 'announcement',
          title: `📢 ${ann.title}${ann.message ? `: ${ann.message}` : ''}`,
          published_at: ann.created_at,
          link: ann.link || undefined,
          priority: 4
        });
      }
    });

    return Array.from(announcementsMap.values()).sort((a, b) => {
      if ((a.priority || 5) !== (b.priority || 5)) {
        return (a.priority || 5) - (b.priority || 5);
      }
      const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return timeB - timeA;
    });
  }

  // Live Daily Meeting Controls
  public async updateLiveMeeting(meetingData: {
    url: string;
    title?: string;
    time?: string;
    isActive?: boolean;
    isDaily?: boolean;
  }): Promise<HomepageSettings> {
    return this.saveHomepageSettings({
      live_meeting_url: meetingData.url,
      live_meeting_title: meetingData.title || this.homepageSettings.live_meeting_title || 'Daily Engineering Cohort Masterclass',
      live_meeting_time: meetingData.time || this.homepageSettings.live_meeting_time || 'Everyday at 07:00 PM IST',
      live_meeting_is_active: meetingData.isActive !== undefined ? meetingData.isActive : true,
      live_meeting_is_daily_recurring: meetingData.isDaily !== undefined ? meetingData.isDaily : true,
      live_meeting_updated_at: new Date().toISOString(),
    });
  }

  public getNotifications(userId?: string): Notification[] {
    if (userId) {
      return this.notifications.filter(
        (n) => n.user_id === userId || n.user_id === "all",
      );
    }

    return [...this.notifications];
  }

  public async createNotification(
    n: Omit<Notification, "id" | "read" | "created_at">,
  ): Promise<Notification> {
    const newNotif: Notification = {
      ...n,

      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

      read: false,

      created_at: new Date().toISOString(),
    };

    this.notifications.unshift(newNotif);

    this.saveToStorage("notifications", this.notifications);

    if (isLiveSupabaseConfigured && n.user_id && n.user_id !== "all") {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .insert({
            user_id: ensureUuid(n.user_id),

            title: n.title,

            message: n.message,

            type: n.type,

            link: n.link || null,

            read: false,
          })
          .select()
          .single();

        if (!error && data) {
          newNotif.id = data.id;

          this.saveToStorage("notifications", this.notifications);
        }
      } catch (e) {
        console.warn("Supabase createNotification note:", e);
      }
    }

    this.notifySubscribers();

    return newNotif;
  }

  public async markNotificationRead(id: string): Promise<void> {
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        return { ...n, read: true, is_read: true };
      }

      return n;
    });

    this.saveToStorage("notifications", this.notifications);

    this.notifySubscribers();

    if (isLiveSupabaseConfigured) {
      try {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", ensureUuid(id));
      } catch (e) {
        console.warn("Supabase markNotificationRead note:", e);
      }
    }
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    this.notifications = this.notifications.map((n) => {
      if (n.user_id === userId || n.user_id === "all") {
        return { ...n, read: true, is_read: true };
      }

      return n;
    });

    this.saveToStorage("notifications", this.notifications);

    this.notifySubscribers();

    if (isLiveSupabaseConfigured && userId && userId !== "all") {
      try {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", ensureUuid(userId));
      } catch (e) {
        console.warn("Supabase markAllNotificationsRead note:", e);
      }
    }
  }

  // --- Additional Convenience Methods ---

  public getInterviewQuestions(): InterviewQuestion[] {
    return this.interviews;
  }

  public getTopics(courseId?: string): Topic[] {
    if (courseId) {
      return this.topics.filter((t) => t.course_id === courseId);
    }

    return [...this.topics];
  }

  public getModules(courseId: string): CourseModule[] {
    return this.getModulesForCourse(courseId);
  }

  public getEnrolledCourses(
    studentId?: string,
  ): (Course & { progressPercentage: number })[] {
    const targetStudent = studentId
      ? this.users.find((u) => u.id === studentId)
      : this.currentUser;

    const assignedIds = targetStudent?.assigned_courses || [
      "course-fs-101",
      "course-ai-201",
    ];

    return this.courses

      .filter((c) => assignedIds.includes(c.id))

      .map((c) => ({
        ...c,

        progressPercentage:
          c.id === "course-fs-101" ? 68 : c.id === "course-ai-201" ? 42 : 25,
      }));
  }

  public getResources(courseId?: string): any[] {
    const filteredTopics = courseId
      ? this.topics.filter((t) => t.course_id === courseId && t.is_published)
      : this.topics.filter((t) => t.is_published);

    return filteredTopics.map((t) => {
      const course = this.getCourseById(t.course_id);

      return {
        id: `res-${t.id}`,

        topicId: t.id,

        courseId: t.course_id,

        courseName: course?.title || "SkillNova Course",

        topicTitle: t.title,

        description:
          t.description ||
          "Lecture materials, core concept notes, and class recordings.",

        publishedAt: t.class_date || "Today",

        recordingUrl: t.recording_link,

        driveNotesUrl: t.drive_notes_link,

        pdfUrl: t.pdf_url,

        hasRecording: Boolean(t.recording_link),

        hasNotes: Boolean(t.drive_notes_link || t.pdf_url),
      };
    });
  }

  public getQuizQuestions(courseId?: string, topicId?: string): QuizQuestion[] {
    let list = this.quizzes;

    if (topicId) {
      list = list.filter((q) => q.topic_id === topicId);
    }

    return list;
  }

  public getSaturdaySpecialSessions(): SaturdaySpecial[] {
    return this.getSaturdaySpecials();
  }

  public async publishSaturdaySpecial(data: any): Promise<SaturdaySpecial> {
    return this.addSaturdaySpecial({
      title: data.title,

      category: data.category,

      description: data.description,

      recording_url: data.recordingUrl || data.recording_url,

      slides_url: data.resourceDocUrl || data.slides_url,

      cover_image: data.coverImageUrl || data.cover_image,

      session_date: data.date || data.session_date,
    });
  }

  public async publishOpportunity(data: any): Promise<Opportunity> {
    return this.addOpportunity({
      title: data.title,

      organization: data.company || data.organization,

      category: data.type || data.category,

      location: data.location,

      stipend_salary: data.stipendOrPrize || data.stipend_salary,

      deadline: data.deadline,

      description: data.description,

      required_skills: data.requiredSkills || data.required_skills,

      apply_url: data.applyUrl || data.apply_url,
    });
  }

  public rejectAIJob(jobId: string) {
    this.aiJobs = this.aiJobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        };
      }

      return j;
    });

    this.saveToStorage("aiJobs", this.aiJobs);
  }

  public generateAIContentFromDoc(
    courseId: string,
    topicId: string,
    docName: string,
    text: string,
  ) {
    return this.generateAIContentFromDocument(courseId, topicId, docName, text);
  }

  // --- Discussion Room & Community ---

  public getDiscussions(): DiscussionPost[] {
    return [...this.discussions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public getDiscussionReplies(postId: string): DiscussionReply[] {
    return this.discussionReplies
      .filter((r) => r.post_id === postId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
  }

  public async createDiscussionPost(
    post: Partial<DiscussionPost>,
  ): Promise<DiscussionPost> {
    const authorId = post.author_id
      ? ensureUuid(post.author_id)
      : this.currentUser?.id
        ? ensureUuid(this.currentUser.id)
        : "6c1e1aca-b160-42e0-83db-8bc804b6e69b";

    const courseUid = post.course_id ? ensureUuid(post.course_id) : null;

    const subModUid = post.sub_module_id
      ? ensureUuid(post.sub_module_id)
      : null;

    let newPost: DiscussionPost = {
      id: `disc-${Date.now()}`,

      author_id: post.author_id || this.currentUser?.id || "usr-student-1",

      author_name:
        post.author_name || this.currentUser?.full_name || "Community Member",

      author_role: post.author_role || this.currentUser?.role || "student",

      author_avatar: post.author_avatar || this.currentUser?.avatar_url,

      author_batch:
        post.author_batch || this.currentUser?.year_of_study || "Batch 2027",

      course_id: post.course_id,

      sub_module_id: post.sub_module_id,

      title: post.title || "Untitled Discussion",

      content: post.content || "",

      category: post.category || "general",

      tags: post.tags || ["General"],

      likes_count: 0,

      liked_by_user_ids: [],

      replies_count: 0,

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("discussion_posts")
          .insert({
            author_id: authorId,
            title: newPost.title,
            content: newPost.content,
            category: newPost.category,
            tags: newPost.tags,
            likes_count: 0,
            liked_by: [],
          })
          .select()
          .single();

        if (error) {
          console.error(
            "[SkillNova Supabase] createDiscussionPost error:",
            error,
          );

          throw new Error(error.message);
        }

        if (data) {
          newPost.id = data.id;

          newPost.created_at = data.created_at;
        }
      } catch (err: any) {
        console.error("createDiscussionPost error:", err);

        throw err;
      }
    }

    this.discussions.unshift(newPost);

    this.saveToStorage("discussions", this.discussions);

    this.notifySubscribers();

    return newPost;
  }

  public toggleLikeDiscussion(
    postId: string,
    userId: string,
  ): DiscussionPost | undefined {
    const post = this.discussions.find((p) => p.id === postId);

    if (!post) return undefined;

    const hasLiked = post.liked_by_user_ids.includes(userId);

    if (hasLiked) {
      post.liked_by_user_ids = post.liked_by_user_ids.filter(
        (id) => id !== userId,
      );

      post.likes_count = Math.max(0, post.likes_count - 1);
    } else {
      post.liked_by_user_ids.push(userId);

      post.likes_count += 1;
    }

    this.saveToStorage("discussions", this.discussions);

    return post;
  }

  public async addDiscussionReply(
    reply: Partial<DiscussionReply>,
  ): Promise<DiscussionReply> {
    const authorId = reply.author_id
      ? ensureUuid(reply.author_id)
      : this.currentUser?.id
        ? ensureUuid(this.currentUser.id)
        : "6c1e1aca-b160-42e0-83db-8bc804b6e69b";

    const postUid = reply.post_id ? ensureUuid(reply.post_id) : null;

    let newReply: DiscussionReply = {
      id: `rep-${Date.now()}`,

      post_id: reply.post_id || "",

      author_id: reply.author_id || this.currentUser?.id || "usr-student-1",

      author_name: reply.author_name || this.currentUser?.full_name || "Member",

      author_role: reply.author_role || this.currentUser?.role || "student",

      author_avatar: reply.author_avatar || this.currentUser?.avatar_url,

      content: reply.content || "",

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured && postUid) {
      try {
        const { data, error } = await supabase
          .from("discussion_replies")
          .insert({
            post_id: postUid,
            author_id: authorId,
            content: newReply.content,
          })
          .select()
          .single();

        if (!error && data) {
          newReply.id = data.id;

          newReply.created_at = data.created_at;
        }
      } catch (err) {
        console.warn("addDiscussionReply supabase error:", err);
      }
    }

    this.discussionReplies.push(newReply);

    const post = this.discussions.find((p) => p.id === reply.post_id);

    if (post) {
      post.replies_count = (post.replies_count || 0) + 1;

      this.saveToStorage("discussions", this.discussions);
    }

    this.saveToStorage("discussionReplies", this.discussionReplies);

    this.notifySubscribers();

    return newReply;
  }

  // --- Request a Mentor (Private Channel) ---

  public getMentorRequests(studentId?: string): MentorRequest[] {
    if (studentId) {
      return this.mentorRequests
        .filter((r) => r.student_id === studentId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }

    return [...this.mentorRequests].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public async createMentorRequest(
    req: Partial<MentorRequest>,
  ): Promise<MentorRequest> {
    const studentId = req.student_id
      ? ensureUuid(req.student_id)
      : this.currentUser?.id
        ? ensureUuid(this.currentUser.id)
        : "6c1e1aca-b160-42e0-83db-8bc804b6e69b";

    const courseId = req.course_id
      ? ensureUuid(req.course_id)
      : "c0000000-0000-0000-0000-000000000101";

    const newReq: MentorRequest = {
      id: `mreq-${Date.now()}`,

      student_id: req.student_id || this.currentUser?.id || "usr-student-1",

      student_name:
        req.student_name || this.currentUser?.full_name || "Student",

      student_email:
        req.student_email || this.currentUser?.email || "student@skillnova.edu",

      course_id: req.course_id || courseId,

      course_title: req.course_title || "General Course",

      topic_title: req.topic_title || "General Doubt",

      assigned_mentor_name: req.assigned_mentor_name || "Lead Faculty Mentor",

      doubt_title: req.doubt_title || "Technical Inquiry",

      doubt_description: req.doubt_description || "",

      code_snippet: req.code_snippet,

      status: "pending",

      priority: req.priority || "medium",

      created_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),

      replies: [],
    };

    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("mentor_requests")
          .insert({
            student_id: studentId,

            course_id: courseId,

            topic_title: newReq.topic_title,

            doubt_title: newReq.doubt_title,

            doubt_description: newReq.doubt_description,

            code_snippet: newReq.code_snippet || null,

            status: "pending",

            priority: newReq.priority,
          })
          .select()
          .single();

        if (error) {
          console.error(
            "[SkillNova Supabase] createMentorRequest error:",
            error,
          );

          throw new Error(error.message);
        }

        if (data) {
          newReq.id = data.id;

          newReq.created_at = data.created_at;

          newReq.updated_at = data.updated_at;
        }
      } catch (err: any) {
        console.error("createMentorRequest error:", err);

        throw err;
      }
    }

    this.mentorRequests.unshift(newReq);

    this.saveToStorage("mentorRequests", this.mentorRequests);

    this.notifySubscribers();

    this.createNotification({
      user_id: "6c1e1aca-b160-42e0-83db-8bc804b6e69b",

      title: `New Mentor Request: ${newReq.doubt_title}`,

      message: `${newReq.student_name} submitted a private doubt in ${newReq.course_title}.`,

      type: "system",

      link: "/admin/discussions",
    });

    return newReq;
  }

  public async addMentorRequestReply(
    reply: Partial<MentorRequestReply>,
  ): Promise<MentorRequest | undefined> {
    const req = this.mentorRequests.find((r) => r.id === reply.request_id);

    if (!req) return undefined;

    const authorId = reply.author_id
      ? ensureUuid(reply.author_id)
      : this.currentUser?.id
        ? ensureUuid(this.currentUser.id)
        : "6c1e1aca-b160-42e0-83db-8bc804b6e69b";

    const requestUid = reply.request_id ? ensureUuid(reply.request_id) : null;

    const newReply: MentorRequestReply = {
      id: `mrep-${Date.now()}`,

      request_id: reply.request_id || "",

      author_id: reply.author_id || this.currentUser?.id || "usr-mentor-1",

      author_name:
        reply.author_name || this.currentUser?.full_name || "Faculty Mentor",

      author_role: reply.author_role || this.currentUser?.role || "sub_admin",

      content: reply.content || reply.message || "",

      message: reply.message || reply.content || "",

      code_snippet: reply.code_snippet,

      created_at: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured && requestUid) {
      try {
        const { data, error } = await supabase
          .from("mentor_request_replies")
          .insert({
            request_id: requestUid,
            author_id: authorId,
            content: newReply.content,
          })
          .select()
          .single();

        if (error) {
          console.error(
            "[SkillNova Supabase] addMentorRequestReply error:",
            error,
          );

          throw new Error(error.message);
        }

        if (data) {
          newReply.id = data.id;

          newReply.created_at = data.created_at;
        }

        if (newReply.author_role !== "student") {
          await supabase
            .from("mentor_requests")
            .update({
              status: "in_progress",

              updated_at: new Date().toISOString(),
            })
            .eq("id", requestUid);
        }
      } catch (err: any) {
        console.error("addMentorRequestReply error:", err);

        throw err;
      }
    }

    req.replies.push(newReply);

    req.updated_at = new Date().toISOString();

    if (newReply.author_role !== "student" && req.status === "pending") {
      req.status = "in_progress";
    }

    this.saveToStorage("mentorRequests", this.mentorRequests);

    this.notifySubscribers();

    if (newReply.author_role !== "student") {
      this.createNotification({
        user_id: req.student_id,

        title: `Mentor Replied to your Doubt`,

        message: `${newReply.author_name} responded to "${req.doubt_title}".`,

        type: "system",

        link: "/student/discussion",
      });
    }

    return req;
  }

  public async updateMentorRequestStatus(
    requestId: string,
    status: MentorRequest["status"],
  ): Promise<MentorRequest | undefined> {
    const req = this.mentorRequests.find((r) => r.id === requestId);

    if (!req) return undefined;

    req.status = status;

    req.updated_at = new Date().toISOString();

    this.saveToStorage("mentorRequests", this.mentorRequests);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase
          .from("mentor_requests")
          .update({
            status,

            updated_at: req.updated_at,
          })
          .eq("id", ensureUuid(requestId));
      } catch (err) {
        console.warn("updateMentorRequestStatus supabase error:", err);
      }
    }

    this.notifySubscribers();

    return req;
  }

  // --- Python Coding Lab & Practical Submissions ---

  public async saveStudentCode(
    courseIdOrSub: string | Partial<PracticalSubmission>,
    practicalId?: string,
    code?: string,
  ): Promise<PracticalSubmission> {
    let studentId =
      this.currentUser?.id || "6c1e1aca-b160-42e0-83db-8bc804b6e69b";

    let cId = "";

    let pId = "";

    let sourceCode = "";

    let studentName = this.currentUser?.full_name || "Student";

    let courseTitle = "";

    if (typeof courseIdOrSub === "object") {
      studentId = courseIdOrSub.student_id || studentId;

      studentName = courseIdOrSub.student_name || studentName;

      cId = courseIdOrSub.course_id || "";

      courseTitle = courseIdOrSub.course_title || "";

      pId = courseIdOrSub.practical_id || "";

      sourceCode = courseIdOrSub.source_code || courseIdOrSub.code || "";
    } else {
      cId = courseIdOrSub;

      pId = practicalId || "";

      sourceCode = code || "";
    }

    const studentUid = ensureUuid(studentId);

    const courseUid = ensureUuid(
      cId || this.courses[0]?.id || "c0000000-0000-0000-0000-000000000101",
    );

    let sub = this.codingSubmissions.find(
      (s) =>
        s.student_id === studentId &&
        (s.course_id === cId || s.course_id === courseUid) &&
        s.practical_id === pId,
    );

    if (sub) {
      sub.source_code = sourceCode;

      sub.code = sourceCode;

      sub.version = (sub.version || 1) + 1;

      sub.updated_at = new Date().toISOString();
    } else {
      sub = {
        id: `prac-${Date.now()}`,

        student_id: studentId,

        student_name: studentName,

        course_id: cId || courseUid,

        course_title: courseTitle,

        practical_id: pId,

        source_code: sourceCode,

        code: sourceCode,

        status: "draft",

        version: 1,

        created_at: new Date().toISOString(),

        updated_at: new Date().toISOString(),
      };

      this.codingSubmissions.unshift(sub);
    }

    this.saveToStorage("codingSubmissions", this.codingSubmissions);

    if (isLiveSupabaseConfigured) {
      try {
        const { data: existingRows } = await supabase
          .from("practical_submissions")

          .select("id, version")

          .eq("student_id", studentUid)

          .eq("course_id", courseUid)

          .eq("practical_id", pId)

          .limit(1);

        if (existingRows && existingRows.length > 0) {
          const { data } = await supabase
            .from("practical_submissions")

            .update({
              code: sourceCode,

              status: "draft",

              version: (existingRows[0].version || 1) + 1,

              updated_at: new Date().toISOString(),
            })

            .eq("id", existingRows[0].id)

            .select()

            .single();

          if (data) sub.id = data.id;
        } else {
          const { data } = await supabase
            .from("practical_submissions")

            .insert({
              student_id: studentUid,

              course_id: courseUid,

              practical_id: pId,

              code: sourceCode,

              status: "draft",

              version: 1,
            })

            .select()

            .single();

          if (data) sub.id = data.id;
        }
      } catch (e) {
        console.warn("Supabase saveStudentCode note:", e);
      }
    }

    this.notifySubscribers();

    return sub;
  }

  public async submitStudentPractical(
    courseIdOrSub: string | Partial<PracticalSubmission>,
    practicalId?: string,
    code?: string,
  ): Promise<PracticalSubmission> {
    const sub = await this.saveStudentCode(courseIdOrSub, practicalId, code);

    sub.status = "submitted";

    sub.submitted_at = new Date().toISOString();

    sub.updated_at = new Date().toISOString();

    this.saveToStorage("codingSubmissions", this.codingSubmissions);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase
          .from("practical_submissions")

          .update({
            status: "submitted",

            updated_at: sub.updated_at,
          })

          .eq("id", ensureUuid(sub.id));
      } catch (e) {
        console.warn("Supabase submitStudentPractical note:", e);
      }
    }

    await this.createNotification({
      user_id: sub.student_id,

      title: "Python Practical Submitted Successfully",

      message: `Your code submission for practical ${sub.practical_id} has been securely archived for mentor review.`,

      type: "system",

      link: `/student/courses/${sub.course_id}`,
    });

    this.notifySubscribers();

    return sub;
  }

  public getStudentPracticalSubmissions(
    studentId?: string,
    courseId?: string,
  ): PracticalSubmission[] {
    const sId = studentId || this.currentUser?.id || "usr-student-1";

    let list = this.codingSubmissions.filter((s) => s.student_id === sId);

    if (courseId) {
      list = list.filter((s) => s.course_id === courseId);
    }

    return list;
  }

  // --- Course Curriculum Management (16:9 Animated Student Frame) ---

  public saveCourseCurriculum(
    courseId: string,
    text: string,
  ): Course | undefined {
    let updated: Course | undefined;

    this.courses = this.courses.map((c) => {
      if (c.id === courseId) {
        updated = {
          ...c,
          curriculum_text: text,
          updated_at: new Date().toISOString(),
        };

        return updated;
      }

      return c;
    });

    this.saveToStorage("courses", this.courses);

    if (isLiveSupabaseConfigured && updated) {
      supabase
        .from("courses")
        .update({
          curriculum_text: text,

          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId)
        .then(({ error }) => {
          if (error)
            console.warn(
              "[SkillNova Supabase] curriculum save warning:",
              error.message,
            );
        });
    }

    return updated;
  }

  public getCourseCurriculum(courseId: string): string {
    const course = this.getCourseById(courseId);

    if (course?.curriculum_text) {
      return course.curriculum_text;
    }

    // Return structured default curriculum if empty

    return `Module 1: Foundations & Architecture

- Core principles, language dynamics & typing systems

- Modular software design & scalable project structuring

- Development workflows, Git branching & environments

Module 2: Advanced Implementations & Industry Practicals

- Design patterns, state management & data flows

- RESTful APIs, async communication & database integration

- Unit testing, error handling & production resilience

Module 3: Production Deployment & System Leadership

- CI/CD automation, Docker containers & cloud orchestration

- Observability, performance metrics & security hardening

- Capstone build presentation & mentor code certification`;
  }

  // --- Homepage Settings Management (Demo Video, WhatsApp, Social Links) ---

  public getHomepageSettings(): HomepageSettings {
    return { ...this.homepageSettings };
  }

  public async saveHomepageSettings(
    updates: Partial<HomepageSettings>,
  ): Promise<HomepageSettings> {
    this.homepageSettings = {
      ...this.homepageSettings,

      ...updates,

      updated_at: new Date().toISOString(),
    };

    this.saveToStorage("homepageSettings", this.homepageSettings);

    if (isLiveSupabaseConfigured) {
      try {
        const validSettingsId = (this.homepageSettings.id && this.homepageSettings.id.length === 36)
          ? this.homepageSettings.id
          : "30000000-0000-4000-8000-000000000001";

        const { error } = await supabase.from("homepage_settings").upsert({
          id: validSettingsId,

          demo_video_url: this.homepageSettings.demo_video_url,

          demo_video_title: this.homepageSettings.demo_video_title,

          demo_video_description: this.homepageSettings.demo_video_description,

          demo_video_is_active: this.homepageSettings.demo_video_is_active,

          whatsapp_group_url: this.homepageSettings.whatsapp_group_url,

          whatsapp_qr_code_url: this.homepageSettings.whatsapp_qr_code_url,

          whatsapp_is_active: this.homepageSettings.whatsapp_is_active,

          whatsapp_display_name: this.homepageSettings.whatsapp_display_name,

          instagram_url: this.homepageSettings.instagram_url,

          instagram_is_active: this.homepageSettings.instagram_is_active,

          instagram_display_name: this.homepageSettings.instagram_display_name,

          linkedin_url: this.homepageSettings.linkedin_url,

          linkedin_is_active: this.homepageSettings.linkedin_is_active,

          linkedin_display_name: this.homepageSettings.linkedin_display_name,

          live_meeting_url: this.homepageSettings.live_meeting_url || '',

          live_meeting_title: this.homepageSettings.live_meeting_title || 'Daily Engineering Cohort Masterclass',

          live_meeting_time: this.homepageSettings.live_meeting_time || 'Everyday at 07:00 PM IST',

          live_meeting_is_active: this.homepageSettings.live_meeting_is_active ?? false,

          live_meeting_is_daily_recurring: this.homepageSettings.live_meeting_is_daily_recurring ?? true,

          live_meeting_updated_at: new Date().toISOString(),

          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.warn(
            "[SkillNova Supabase] homepage_settings save warning:",
            error.message,
          );
        }
      } catch (err) {
        console.warn("Supabase homepage_settings error:", err);
      }
    }

    return this.homepageSettings;
  }

  // --- Homepage Courses Management (Fee, Timeline, WhatsApp Enroll) ---

  public getHomepageCourses(): HomepageCourse[] {
    return [...this.homepageCourses].sort(
      (a, b) => a.order_index - b.order_index,
    );
  }

  public async addHomepageCourse(
    courseData: Partial<HomepageCourse>,
  ): Promise<HomepageCourse> {
    const newCourse: HomepageCourse = {
      id: `hp-course-${Date.now()}`,

      title: courseData.title || "New Certification Course",

      description:
        courseData.description ||
        "Hands-on engineering curriculum with mentor doubt clearance.",

      thumbnail_url:
        courseData.thumbnail_url ||
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",

      fee: courseData.fee || "₹4,999",

      timeline: courseData.timeline || "8 Weeks Cohort",

      curriculum_text:
        courseData.curriculum_text ||
        `Module 1: Core Engineering Foundations\nModule 2: Practical Projects\nModule 3: Industry Certification`,

      whatsapp_enroll_url:
        courseData.whatsapp_enroll_url ||
        this.homepageSettings.whatsapp_group_url,

      is_active: courseData.is_active !== false,

      order_index: this.homepageCourses.length + 1,

      created_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    };

    this.homepageCourses.push(newCourse);

    this.saveToStorage("homepageCourses", this.homepageCourses);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase.from("homepage_courses").upsert(newCourse);
      } catch (err) {
        console.warn("Supabase addHomepageCourse error:", err);
      }
    }

    return newCourse;
  }

  public async updateHomepageCourse(
    id: string,
    updates: Partial<HomepageCourse>,
  ): Promise<HomepageCourse | undefined> {
    let updated: HomepageCourse | undefined;

    this.homepageCourses = this.homepageCourses.map((c) => {
      if (c.id === id) {
        updated = { ...c, ...updates, updated_at: new Date().toISOString() };

        return updated;
      }

      return c;
    });

    this.saveToStorage("homepageCourses", this.homepageCourses);

    if (isLiveSupabaseConfigured && updated) {
      try {
        await supabase.from("homepage_courses").update(updated).eq("id", id);
      } catch (err) {
        console.warn("Supabase updateHomepageCourse error:", err);
      }
    }

    return updated;
  }

  public async deleteHomepageCourse(id: string): Promise<void> {
    this.homepageCourses = this.homepageCourses.filter((c) => c.id !== id);

    this.saveToStorage("homepageCourses", this.homepageCourses);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase.from("homepage_courses").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteHomepageCourse error:", err);
      }
    }
  }

  // --- Student Access Requests Workflow ---

  public getStudentAccessRequests(): StudentAccessRequest[] {
    return [...this.studentAccessRequests].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public async createStudentAccessRequest(
    req: Partial<StudentAccessRequest>,
  ): Promise<StudentAccessRequest> {
    const newReq: StudentAccessRequest = {
      id: `req-${Date.now()}`,

      full_name: req.full_name || "Prospective Student",

      email: (req.email || "").trim().toLowerCase(),

      phone: req.phone || "",

      college: req.college || "Engineering College",

      branch: req.branch || "Computer Science",

      year_of_study: req.year_of_study || "3rd Year",

      target_course: req.target_course || "Full Stack Web Engineering",

      payment_reference: req.payment_reference || "UPI-PENDING",

      status: "pending",

      admin_note: "Submitted via public SkillNova Enroll & Access portal",

      created_at: new Date().toISOString(),
    };

    this.studentAccessRequests.unshift(newReq);

    this.saveToStorage("studentAccessRequests", this.studentAccessRequests);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase.from("student_access_requests").insert({
          full_name: newReq.full_name,

          email: newReq.email,

          phone: newReq.phone,

          college: newReq.college,

          branch: newReq.branch,

          year_of_study: newReq.year_of_study,

          target_course: newReq.target_course,

          payment_reference: newReq.payment_reference,

          status: "pending",

          admin_note: newReq.admin_note,

          created_at: newReq.created_at,
        });
      } catch (err) {
        console.warn("Supabase createStudentAccessRequest error:", err);
      }
    }

    return newReq;
  }

  public async approveStudentAccessRequest(
    id: string,

    batch = "Batch 2027",

    courseId = "course-fs-101",

    note?: string,
  ): Promise<boolean> {
    const req = this.studentAccessRequests.find((r) => r.id === id);

    if (!req) return false;

    req.status = "approved";

    req.assigned_batch = batch;

    req.assigned_course_id = courseId;

    req.reviewed_at = new Date().toISOString();

    req.admin_note = note || "Approved by Administrator. Access provisioned.";

    // Provision or activate student account

    let existingUser = this.getUserByEmail(req.email);

    if (!existingUser) {
      const newUser: User = {
        id: `usr-student-${Date.now()}`,

        email: req.email,

        full_name: req.full_name,

        role: "student",

        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,

        college: req.college,

        branch: req.branch,

        year_of_study: req.year_of_study || batch,

        status: "active",

        created_at: new Date().toISOString(),

        assigned_courses: [courseId],
      };

      this.users.unshift(newUser);

      this.saveToStorage("users", this.users);

      // Create welcome notification

      this.createNotification({
        user_id: newUser.id,

        title: "Student Access Approved! Welcome to SkillNova",

        message: `Your enrollment has been verified and approved by the Administrator for ${batch}.`,

        type: "system",

        link: "/student/dashboard",
      });
    } else {
      existingUser.status = "active";

      existingUser.assigned_courses = Array.from(
        new Set([...(existingUser.assigned_courses || []), courseId]),
      );

      this.saveToStorage("users", this.users);
    }

    this.saveToStorage("studentAccessRequests", this.studentAccessRequests);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase
          .from("student_access_requests")
          .update({
            status: "approved",

            assigned_batch: batch,

            assigned_course_id: courseId,

            reviewed_at: req.reviewed_at,

            admin_note: req.admin_note,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase approveStudentAccessRequest error:", err);
      }
    }

    return true;
  }

  public async rejectStudentAccessRequest(
    id: string,
    reason?: string,
  ): Promise<boolean> {
    const req = this.studentAccessRequests.find((r) => r.id === id);

    if (!req) return false;

    req.status = "rejected";

    req.reviewed_at = new Date().toISOString();

    req.admin_note =
      reason || "Verification failed or payment reference unverified.";

    this.saveToStorage("studentAccessRequests", this.studentAccessRequests);

    if (isLiveSupabaseConfigured) {
      try {
        await supabase
          .from("student_access_requests")
          .update({
            status: "rejected",

            reviewed_at: req.reviewed_at,

            admin_note: req.admin_note,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase rejectStudentAccessRequest error:", err);
      }
    }

    return true;
  }

  // --- Quizzes & Scheduler ---

  public checkQuizSchedules() {
    const now = new Date().getTime();

    let updated = false;

    this.quizzesList.forEach((q) => {
      const startTime = q.start_time ? new Date(q.start_time).getTime() : 0;

      const endTime = q.end_time ? new Date(q.end_time).getTime() : Infinity;

      let newStatus: "upcoming" | "active" | "closed" = q.status;

      if (now < startTime) {
        newStatus = "upcoming";
      } else if (now >= startTime && now <= endTime) {
        newStatus = "active";
      } else if (now > endTime) {
        newStatus = "closed";
      }

      if (newStatus !== q.status) {
        q.status = newStatus;

        updated = true;

        if (isLiveSupabaseConfigured) {
          supabase
            .from("quizzes")
            .update({ status: newStatus })
            .eq("id", q.id)
            .then(null, (err) => console.warn(err));
        }
      }
    });

    if (updated) {
      this.saveToStorage("quizzesList", this.quizzesList);

      this.notifySubscribers();
    }
  }

  public getQuizzesList(courseId?: string): Quiz[] {
    this.checkQuizSchedules();

    let list = this.quizzesList;

    if (courseId) {
      list = list.filter((q) => q.course_id === courseId);
    }

    return [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public getQuizById(id: string): Quiz | undefined {
    this.checkQuizSchedules();

    return this.quizzesList.find((q) => q.id === id);
  }

  public parseBulkQuizText(rawText: string): QuizQuestionItem[] {
    if (!rawText || !rawText.trim()) return [];

    const parsed: QuizQuestionItem[] = [];

    // Split by questions (e.g., Q1., Q2., Question 1, etc.)

    const blocks = rawText
      .split(/(?:^|\n)(?=(?:Q\d+[\.:]|Question\s*\d+[\.:]))/i)
      .filter((b) => b.trim());

    blocks.forEach((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 3) return;

      let questionText = "";

      const options: string[] = [];

      let correctAnswer = "A";

      let explanation = "";

      lines.forEach((line) => {
        // Check for question line

        const qMatch = line.match(/^(?:Q\d+[\.:]|Question\s*\d+[\.:])\s*(.+)/i);

        if (qMatch) {
          questionText = qMatch[1].trim();

          return;
        }

        // Check for option line (A. / B. / A) / B) etc.)

        const optMatch = line.match(/^([A-Da-d])[\.\)]\s*(.+)/);

        if (optMatch) {
          options.push(line.replace(/^[A-Da-d][\.\)]\s*/, ""));

          return;
        }

        // Check for correct answer

        const ansMatch = line.match(
          /^(?:Correct\s*Answer|Answer|Ans)[\.:]\s*([A-Da-d])/i,
        );

        if (ansMatch) {
          correctAnswer = ansMatch[1].toUpperCase();

          return;
        }

        // Check for explanation

        const expMatch = line.match(/^(?:Explanation|Exp)[\.:]\s*(.+)/i);

        if (expMatch) {
          explanation = expMatch[1].trim();

          return;
        }

        // If questionText is not yet set

        if (!questionText && !line.startsWith("A.") && !line.startsWith("B.")) {
          questionText = line;
        }
      });

      if (questionText && options.length >= 2) {
        parsed.push({
          id: `qq-bulk-${Date.now()}-${idx + 1}`,

          quiz_id: "",

          question: questionText,

          options: options.slice(0, 4).map((opt, oIdx) => ({
            key: String.fromCharCode(65 + oIdx),

            text: opt,
          })),

          correct_answer: correctAnswer,

          explanation:
            explanation || `Correct answer is option ${correctAnswer}`,

          marks: 5,

          order_index: idx + 1,
        });
      }
    });

    return parsed;
  }

  public async addQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const questionsList = (quizData.questions || []).map((q, i) => ({
      ...q,

      id: q.id || `qq-${Date.now()}-${i + 1}`,

      order_index: i + 1,

      marks: q.marks || 5,
    }));

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,

      title: quizData.title || "Untitled Assessment",

      description: quizData.description || "",

      course_id: quizData.course_id || this.courses[0]?.id || "course-fs-101",

      module_id: quizData.module_id,

      sub_module_id: quizData.sub_module_id,

      total_marks: quizData.total_marks || questionsList.length * 5 || 20,

      duration_minutes: Number(quizData.duration_minutes) || 30,

      start_time: quizData.start_time || new Date().toISOString(),

      end_time:
        quizData.end_time || new Date(Date.now() + 7 * 86400000).toISOString(),

      status: quizData.status || "upcoming",

      questions: questionsList,

      created_by:
        quizData.created_by || this.currentUser?.full_name || "Administrator",

      created_at: new Date().toISOString(),
    };

    // Calculate initial status

    const now = new Date().getTime();

    const st = new Date(newQuiz.start_time).getTime();

    const et = new Date(newQuiz.end_time).getTime();

    if (now < st) newQuiz.status = "upcoming";
    else if (now >= st && now <= et) newQuiz.status = "active";
    else newQuiz.status = "closed";

    this.quizzesList.unshift(newQuiz);

    this.saveToStorage("quizzesList", this.quizzesList);

    if (isLiveSupabaseConfigured) {
      try {
        const { data: qRecord, error: qErr } = await supabase
          .from("quizzes")
          .insert({
            title: newQuiz.title,

            description: newQuiz.description,

            course_id: ensureUuid(newQuiz.course_id),

            module_id: newQuiz.module_id ? ensureUuid(newQuiz.module_id) : null,

            sub_module_id: newQuiz.sub_module_id
              ? ensureUuid(newQuiz.sub_module_id)
              : null,

            total_marks: newQuiz.total_marks,

            duration_minutes: newQuiz.duration_minutes,

            start_time: newQuiz.start_time,

            end_time: newQuiz.end_time,

            status: newQuiz.status,

            created_by: newQuiz.created_by,
          })
          .select()
          .single();

        if (!qErr && qRecord) {
          newQuiz.id = qRecord.id;

          if (questionsList.length > 0) {
            const qInserts = questionsList.map((q) => ({
              quiz_id: qRecord.id,

              question: q.question,

              options: q.options,

              marks: q.marks || 1,

              order_index: q.order_index || 1,
            }));

            const { data: insertedQuestions } = await supabase
              .from("quiz_questions")
              .insert(qInserts)
              .select();

            if (insertedQuestions && insertedQuestions.length > 0) {
              const answerInserts = insertedQuestions.map(
                (iq: any, idx: number) => ({
                  question_id: iq.id,

                  correct_answer: questionsList[idx]?.correct_answer || "A",

                  explanation: questionsList[idx]?.explanation || "",
                }),
              );

              await supabase.from("quiz_answer_keys").insert(answerInserts);
            }
          }

          this.saveToStorage("quizzesList", this.quizzesList);
        } else if (qErr) {
          console.warn("[SkillNova Supabase] addQuiz note:", qErr.message);
        }
      } catch (err) {
        console.warn("Supabase addQuiz error:", err);
      }
    }

    this.addAuditLogEntry({
      action: "publish",

      resource_id: newQuiz.id,

      resource_title: newQuiz.title,

      course_id: newQuiz.course_id,

      performed_by: newQuiz.created_by || "Administrator",

      details: `Created quiz "${newQuiz.title}" scheduled from ${new Date(newQuiz.start_time).toLocaleString("en-IN")} to ${new Date(newQuiz.end_time).toLocaleString("en-IN")} IST`,
    });

    this.notifySubscribers();

    return newQuiz;
  }

  public async updateQuiz(
    id: string,
    updates: Partial<Quiz>,
  ): Promise<Quiz | undefined> {
    let updated: Quiz | undefined;

    this.quizzesList = this.quizzesList.map((q) => {
      if (q.id === id) {
        updated = { ...q, ...updates };

        return updated;
      }

      return q;
    });

    this.saveToStorage("quizzesList", this.quizzesList);

    if (isLiveSupabaseConfigured && updated) {
      try {
        const targetId = ensureUuid(id);

        const { error: updErr } = await supabase
          .from("quizzes")
          .update({
            title: updated.title,

            description: updated.description,

            course_id: updated.course_id
              ? ensureUuid(updated.course_id)
              : undefined,

            module_id: updated.module_id ? ensureUuid(updated.module_id) : null,

            sub_module_id: updated.sub_module_id
              ? ensureUuid(updated.sub_module_id)
              : null,

            total_marks: updated.total_marks,

            duration_minutes: updated.duration_minutes,

            start_time: updated.start_time,

            end_time: updated.end_time,

            status: updated.status,
          })
          .eq("id", targetId);

        if (updErr) {
          console.warn("[SkillNova Supabase] updateQuiz note:", updErr.message);
        }

        if (updates.questions) {
          await supabase
            .from("quiz_questions")
            .delete()
            .eq("quiz_id", targetId);

          const qInserts = updates.questions.map((q, idx) => ({
            quiz_id: targetId,

            question: q.question,

            options: q.options,

            marks: q.marks || 5,

            order_index: idx + 1,
          }));

          const { data: insertedQuestions } = await supabase
            .from("quiz_questions")
            .insert(qInserts)
            .select();

          if (insertedQuestions && insertedQuestions.length > 0) {
            const answerInserts = insertedQuestions.map(
              (iq: any, idx: number) => ({
                question_id: iq.id,

                correct_answer: updates.questions![idx]?.correct_answer || "A",

                explanation: updates.questions![idx]?.explanation || "",
              }),
            );

            await supabase.from("quiz_answer_keys").insert(answerInserts);
          }
        }
      } catch (err) {
        console.warn("Supabase updateQuiz error:", err);
      }
    }

    this.addAuditLogEntry({
      action: "reschedule",

      resource_id: id,

      resource_title: updated?.title || "Quiz",

      performed_by: this.currentUser?.full_name || "Administrator",

      details: `Updated quiz schedule and settings for "${updated?.title}"`,
    });

    this.notifySubscribers();

    return updated;
  }

  public async deleteQuiz(id: string): Promise<boolean> {
    const quiz = this.quizzesList.find((q) => q.id === id);

    if (!quiz) return false;

    this.quizzesList = this.quizzesList.filter((q) => q.id !== id);

    this.quizAttemptsList = this.quizAttemptsList.filter(
      (a) => a.quiz_id !== id,
    );

    this.saveToStorage("quizzesList", this.quizzesList);

    this.saveToStorage("quizAttemptsList", this.quizAttemptsList);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        await supabase.from("quiz_questions").delete().eq("quiz_id", targetId);

        await supabase.from("quiz_attempts").delete().eq("quiz_id", targetId);

        await supabase.from("quizzes").delete().eq("id", targetId);
      } catch (err) {
        console.warn("Supabase deleteQuiz error:", err);
      }
    }

    this.addAuditLogEntry({
      action: "archive",

      resource_id: id,

      resource_title: quiz.title,

      performed_by: this.currentUser?.full_name || "Administrator",

      details: `Deleted quiz assessment: "${quiz.title}"`,
    });

    this.notifySubscribers();

    return true;
  }

  // --- Quiz Attempt Scoring & Leaderboard ---

  public async submitQuizAttemptRecord(data: {
    quiz_id: string;

    answers: Record<string, string>;

    time_spent_seconds?: number;

    is_practice?: boolean;
  }): Promise<{
    attempt: QuizAttempt;

    leaderboardPosition: number;

    totalParticipants: number;

    accuracy: number;

    correctCount: number;

    totalQuestions: number;
  }> {
    const quiz = this.getQuizById(data.quiz_id);

    const student = this.currentUser || {
      id: "usr-student-1",

      full_name: "Student Learner",
    };

    const questions = quiz?.questions || [];

    const totalQuestions = questions.length || 1;

    let correctCount = 0;

    let earnedMarks = 0;

    questions.forEach((q) => {
      const studentAns = (data.answers[q.id] || "").trim().toUpperCase();

      const expectedAns = (q.correct_answer || "").trim().toUpperCase();

      if (studentAns && studentAns === expectedAns) {
        correctCount++;

        earnedMarks += q.marks || 5;
      }
    });

    // Accuracy = (Correct Answers / Total Questions) * 100

    const accuracy = Math.round((correctCount / totalQuestions) * 100);

    const score = Math.round(
      (correctCount / totalQuestions) * (quiz?.total_marks || 100),
    );

    // Check if this student already completed an official first attempt

    const studentPreviousOfficialAttempts = this.quizAttemptsList.filter(
      (a) =>
        a.quiz_id === data.quiz_id &&
        a.student_id === student.id &&
        a.is_first_attempt === true,
    );

    const isFirstAttempt =
      !data.is_practice && studentPreviousOfficialAttempts.length === 0;

    const isPractice = Boolean(data.is_practice) || !isFirstAttempt;

    const newAttempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,

      quiz_id: data.quiz_id,

      student_id: student.id,

      student_name: student.full_name || "Student Learner",

      score: score,

      total_marks: quiz?.total_marks || 100,

      total_questions: totalQuestions,

      correct_count: correctCount,

      accuracy: accuracy,

      answers: data.answers,

      is_first_attempt: isFirstAttempt,

      is_practice: isPractice,

      status: "completed",

      time_spent_seconds: data.time_spent_seconds || 120,

      completed_at: new Date().toISOString(),
    };

    this.quizAttemptsList.unshift(newAttempt);

    this.saveToStorage("quizAttemptsList", this.quizAttemptsList);

    if (isLiveSupabaseConfigured) {
      try {
        const { error: insErr } = await supabase.from("quiz_attempts").insert({
          quiz_id: ensureUuid(newAttempt.quiz_id),

          student_id: ensureUuid(newAttempt.student_id),

          student_name: newAttempt.student_name,

          score: newAttempt.score,

          total_marks: newAttempt.total_marks,

          total_questions: newAttempt.total_questions,

          correct_count: newAttempt.correct_count,

          accuracy: newAttempt.accuracy,

          answers: newAttempt.answers,

          is_first_attempt: newAttempt.is_first_attempt,

          is_practice: newAttempt.is_practice,

          status: newAttempt.status,

          time_spent_seconds: newAttempt.time_spent_seconds,

          completed_at: newAttempt.completed_at,
        });

        if (insErr) {
          console.warn(
            "[SkillNova Supabase] submitQuizAttemptRecord note:",
            insErr.message,
          );
        }
      } catch (err) {
        console.warn("Supabase submitQuizAttemptRecord error:", err);
      }
    }

    // Calculate leaderboard position from first attempts

    const leaderboard = this.getQuizLeaderboard(data.quiz_id);

    const myRankIdx = leaderboard.findIndex((e) => e.student_id === student.id);

    const rank = myRankIdx !== -1 ? myRankIdx + 1 : leaderboard.length + 1;

    this.notifySubscribers();

    return {
      attempt: newAttempt,

      leaderboardPosition: rank,

      totalParticipants: leaderboard.length,

      accuracy,

      correctCount,

      totalQuestions,
    };
  }

  public getQuizAttemptsForStudent(
    quizId?: string,
    studentId?: string,
  ): QuizAttempt[] {
    const sId = studentId || this.currentUser?.id || "usr-student-1";

    let list = this.quizAttemptsList.filter((a) => a.student_id === sId);

    if (quizId) {
      list = list.filter((a) => a.quiz_id === quizId);
    }

    return [...list].sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
    );
  }

  public getQuizLeaderboard(quizId: string): QuizLeaderboardEntry[] {
    // 1. Filter attempts for this specific quiz
    const quizAttempts = this.quizAttemptsList.filter((a) => a.quiz_id === quizId);

    // 2. Identify the official first valid attempt per student
    // Sort chronologically ascending to safely determine first attempt
    const sortedChronologically = [...quizAttempts].sort(
      (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime(),
    );

    const byStudent = new Map<string, QuizAttempt>();
    sortedChronologically.forEach((attempt) => {
      if (!byStudent.has(attempt.student_id)) {
        byStudent.set(attempt.student_id, attempt);
      } else if (attempt.is_first_attempt && !byStudent.get(attempt.student_id)?.is_first_attempt) {
        byStudent.set(attempt.student_id, attempt);
      }
    });

    const entries = Array.from(byStudent.values());

    // 3. Ranking Priority:
    // 1st: Highest total score
    // 2nd: Highest accuracy percentage
    // 3rd: Earliest valid completion time (least time_spent_seconds)
    // 4th: Earliest completion timestamp
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const bAcc = b.accuracy || 0;
      const aAcc = a.accuracy || 0;
      if (bAcc !== aAcc) return bAcc - aAcc;

      const aTime = a.time_spent_seconds || 0;
      const bTime = b.time_spent_seconds || 0;
      if (aTime !== bTime) return aTime - bTime;

      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    });

    // 4. Standard Competition Ranking (1, 2, 2, 4) for tied results
    let currentRank = 1;
    return entries.map((entry, idx) => {
      if (idx > 0) {
        const prev = entries[idx - 1];
        const isTie =
          entry.score === prev.score &&
          (entry.accuracy || 0) === (prev.accuracy || 0) &&
          (entry.time_spent_seconds || 0) === (prev.time_spent_seconds || 0);

        if (!isTie) {
          currentRank = idx + 1;
        }
      }

      // Dynamic student profile & profile picture lookup
      const studentProfile = this.users.find((u) => u.id === entry.student_id);
      const studentName = studentProfile?.full_name || entry.student_name || "Student";
      const avatarUrl = studentProfile?.avatar_url || studentProfile?.avatar || "";

      const quizObj = this.getQuizById(quizId);
      const totalQuestions =
        entry.total_questions ||
        quizObj?.questions?.length ||
        (entry.answers ? Object.keys(entry.answers).length : 0) ||
        1;

      const correctCount =
        entry.correct_count !== undefined
          ? entry.correct_count
          : Math.round(((entry.accuracy || 0) / 100) * totalQuestions);

      return {
        rank: currentRank,
        attempt_id: entry.id,
        student_id: entry.student_id,
        student_name: studentName,
        avatar_url: avatarUrl,
        score: entry.score,
        total_marks: entry.total_marks || quizObj?.total_marks || 100,
        correct_count: correctCount,
        total_questions: totalQuestions,
        accuracy: entry.accuracy || 0,
        time_spent_seconds: entry.time_spent_seconds || 0,
        completed_at: entry.completed_at,
        is_first_attempt: true,
      };
    });
  }

  // --- PDF Page Allocations ---

  public getPdfAllocations(
    topicId?: string,
    subModuleId?: string,
  ): PdfPageAllocation[] {
    let list = this.pdfAllocations;

    if (topicId) {
      list = list.filter((a) => a.topic_id === topicId);
    }

    if (subModuleId) {
      list = list.filter((a) => a.sub_module_id === subModuleId);
    }

    return [...list].sort((a, b) => a.start_page - b.start_page);
  }

  public async addPdfAllocation(
    data: Partial<PdfPageAllocation>,
  ): Promise<PdfPageAllocation> {
    const newAlloc: PdfPageAllocation = {
      id: `pdf-alloc-${Date.now()}`,

      topic_id: data.topic_id || "",

      course_id: data.course_id || this.courses[0]?.id || "course-fs-101",

      sub_module_id: data.sub_module_id,

      pdf_url: data.pdf_url || "",

      start_page: Number(data.start_page) || 1,

      end_page: Number(data.end_page) || 1,

      total_pages: Number(data.total_pages) || 10,

      release_status: data.release_status || "locked",

      scheduled_release_at: data.scheduled_release_at,

      released_at:
        data.release_status === "released"
          ? new Date().toISOString()
          : undefined,

      released_by:
        data.release_status === "released"
          ? this.currentUser?.full_name || "Administrator"
          : undefined,

      created_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    };

    this.pdfAllocations.push(newAlloc);

    this.saveToStorage("pdfAllocations", this.pdfAllocations);

    if (isLiveSupabaseConfigured) {
      try {
        const { data: remoteRec, error: insErr } = await supabase
          .from("pdf_page_allocations")
          .insert({
            topic_id: newAlloc.topic_id ? ensureUuid(newAlloc.topic_id) : null,

            course_id: ensureUuid(newAlloc.course_id),

            sub_module_id: newAlloc.sub_module_id
              ? ensureUuid(newAlloc.sub_module_id)
              : null,

            pdf_url: newAlloc.pdf_url,

            start_page: newAlloc.start_page,

            end_page: newAlloc.end_page,

            total_pages: newAlloc.total_pages,

            release_status: newAlloc.release_status,

            scheduled_release_at: newAlloc.scheduled_release_at,

            released_at: newAlloc.released_at,

            released_by: newAlloc.released_by,
          })
          .select()
          .maybeSingle();

        if (remoteRec && !insErr) {
          newAlloc.id = remoteRec.id;

          this.saveToStorage("pdfAllocations", this.pdfAllocations);
        } else if (insErr) {
          console.warn(
            "[SkillNova Supabase] addPdfAllocation note:",
            insErr.message,
          );
        }
      } catch (err) {
        console.warn("Supabase addPdfAllocation error:", err);
      }
    }

    this.notifySubscribers();

    return newAlloc;
  }

  public async updatePdfAllocation(
    id: string,
    updates: Partial<PdfPageAllocation>,
  ): Promise<PdfPageAllocation | undefined> {
    let updated: PdfPageAllocation | undefined;

    this.pdfAllocations = this.pdfAllocations.map((a) => {
      if (a.id === id) {
        updated = {
          ...a,

          ...updates,

          updated_at: new Date().toISOString(),
        };

        if (updates.release_status === "released" && !updated.released_at) {
          updated.released_at = new Date().toISOString();

          updated.released_by = this.currentUser?.full_name || "Administrator";
        }

        return updated;
      }

      return a;
    });

    this.saveToStorage("pdfAllocations", this.pdfAllocations);

    if (isLiveSupabaseConfigured && updated) {
      try {
        const targetId = ensureUuid(id);

        const { error: updErr } = await supabase
          .from("pdf_page_allocations")
          .update({
            start_page: updated.start_page,

            end_page: updated.end_page,

            total_pages: updated.total_pages,

            release_status: updated.release_status,

            scheduled_release_at: updated.scheduled_release_at,

            released_at: updated.released_at,

            released_by: updated.released_by,

            updated_at: updated.updated_at,
          })
          .eq("id", targetId);

        if (updErr) {
          console.warn(
            "[SkillNova Supabase] updatePdfAllocation note:",
            updErr.message,
          );
        }
      } catch (err) {
        console.warn("Supabase updatePdfAllocation error:", err);
      }
    }

    this.notifySubscribers();

    return updated;
  }

  public async deletePdfAllocation(id: string): Promise<boolean> {
    this.pdfAllocations = this.pdfAllocations.filter((a) => a.id !== id);

    this.saveToStorage("pdfAllocations", this.pdfAllocations);

    if (isLiveSupabaseConfigured) {
      try {
        const targetId = ensureUuid(id);

        const { error: delErr } = await supabase
          .from("pdf_page_allocations")
          .delete()
          .eq("id", targetId);

        if (delErr) {
          console.warn(
            "[SkillNova Supabase] deletePdfAllocation note:",
            delErr.message,
          );
        }
      } catch (err) {
        console.warn("Supabase deletePdfAllocation error:", err);
      }
    }

    this.notifySubscribers();

    return true;
  }

  public getAuthorizedPdfForSubModule(
    topicId: string,
    subModuleId: string,
  ): {
    isAccessible: boolean;

    isScheduled?: boolean;

    isLocked?: boolean;

    scheduledReleaseAt?: string;

    startPage?: number;

    endPage?: number;

    totalPages?: number;

    allocation?: PdfPageAllocation;
  } {
    const alloc = this.pdfAllocations.find(
      (a) => a.topic_id === topicId && a.sub_module_id === subModuleId,
    );

    if (!alloc) {
      // Default to unrestricted if no specific page allocation defined

      return {
        isAccessible: true,

        startPage: 1,

        endPage: 20,

        totalPages: 20,
      };
    }

    if (alloc.release_status === "released") {
      return {
        isAccessible: true,

        startPage: alloc.start_page,

        endPage: alloc.end_page,

        totalPages: alloc.total_pages || alloc.end_page,

        allocation: alloc,
      };
    }

    if (alloc.release_status === "scheduled") {
      return {
        isAccessible: false,

        isScheduled: true,

        scheduledReleaseAt: alloc.scheduled_release_at,

        startPage: alloc.start_page,

        endPage: alloc.end_page,

        totalPages: alloc.total_pages || alloc.end_page,

        allocation: alloc,
      };
    }

    return {
      isAccessible: false,

      isLocked: true,

      startPage: alloc.start_page,

      endPage: alloc.end_page,

      totalPages: alloc.total_pages || alloc.end_page,

      allocation: alloc,
    };
  }

  public checkScheduledPdfReleases() {
    const now = new Date();

    let hasChanges = false;

    this.pdfAllocations.forEach((alloc) => {
      if (alloc.release_status === "scheduled" && alloc.scheduled_release_at) {
        const releaseTime = new Date(alloc.scheduled_release_at);

        if (releaseTime <= now) {
          alloc.release_status = "released";

          alloc.released_at = now.toISOString();

          alloc.released_by = alloc.released_by || "Auto Scheduler";

          hasChanges = true;

          if (isLiveSupabaseConfigured) {
            supabase
              .from("pdf_page_allocations")
              .update({
                release_status: "released",

                released_at: alloc.released_at,

                released_by: alloc.released_by,

                updated_at: now.toISOString(),
              })
              .eq("id", alloc.id)
              .then(null, (err) => console.warn(err));
          }
        }
      }
    });

    if (hasChanges) {
      this.saveToStorage("pdfAllocations", this.pdfAllocations);

      this.notifySubscribers();
    }
  }

  // --- Student Roadmap Progress ---

  public getStudentRoadmapProgress(
    studentId?: string,
    courseId?: string,
  ): StudentRoadmapProgress {
    const sId = studentId || this.currentUser?.id || "usr-student-1";

    const cId = courseId || this.courses[0]?.id || "course-fs-101";

    let record = this.roadmapProgress.find(
      (rp) => rp.student_id === sId && rp.course_id === cId,
    );

    if (!record) {
      record = {
        id: `rm-${sId}-${cId}`,

        student_id: sId,

        course_id: cId,

        completed_sub_modules: ["submod-fs-1-1"],

        current_stage: "submod-fs-1-2",

        progress_percentage: 25,

        updated_at: new Date().toISOString(),
      };

      this.roadmapProgress.push(record);

      this.saveToStorage("roadmapProgress", this.roadmapProgress);
    }

    return record;
  }

  public async markSubModuleCompleted(
    studentId: string,
    courseId: string,
    subModuleId: string,
  ): Promise<StudentRoadmapProgress> {
    const sId = studentId || this.currentUser?.id || "usr-student-1";

    let record = this.getStudentRoadmapProgress(sId, courseId);

    if (!record.completed_sub_modules.includes(subModuleId)) {
      record.completed_sub_modules.push(subModuleId);
    }

    const subMods = this.getSubModules(undefined, courseId);

    const total = subMods.length || 4;

    const completed = record.completed_sub_modules.length;

    record.progress_percentage = Math.min(
      100,
      Math.round((completed / total) * 100),
    );

    record.updated_at = new Date().toISOString();

    // Set next sub_module as current_stage

    const nextSub = subMods.find(
      (sm) => !record!.completed_sub_modules.includes(sm.id),
    );

    if (nextSub) {
      record.current_stage = nextSub.id;
    }

    this.saveToStorage("roadmapProgress", this.roadmapProgress);

    if (isLiveSupabaseConfigured) {
      try {
        const studentUid = ensureUuid(record.student_id);

        const courseUid = ensureUuid(record.course_id);

        const { error: progErr } = await supabase
          .from("student_progress")
          .upsert(
            {
              student_id: studentUid,

              course_id: courseUid,

              completed_sub_modules: record.completed_sub_modules,

              current_stage: record.current_stage,

              progress_percentage: record.progress_percentage,

              updated_at: record.updated_at,
            },
            { onConflict: "student_id,course_id" },
          );

        if (progErr) {
          console.warn(
            "[SkillNova Supabase] markSubModuleCompleted note:",
            progErr.message,
          );
        }
      } catch (err) {
        console.warn("Supabase markSubModuleCompleted error:", err);
      }
    }

    this.notifySubscribers();

    return record;
  }

  public async toggleModuleCompletion(
    studentId?: string,
    courseId?: string,
    moduleId?: string,
  ): Promise<StudentRoadmapProgress> {
    const sId = studentId || this.currentUser?.id || "usr-student-1";
    const cId = courseId || this.courses[0]?.id || "course-fs-101";
    let record = this.getStudentRoadmapProgress(sId, cId);
    if (!moduleId) return record;

    const subMods = this.getSubModules(moduleId, cId);
    const targetIds = subMods.length > 0 ? subMods.map((sm) => sm.id) : [moduleId];

    const allCurrentlyDone = targetIds.every((id) => record.completed_sub_modules.includes(id));

    if (allCurrentlyDone) {
      record.completed_sub_modules = record.completed_sub_modules.filter(
        (id) => !targetIds.includes(id) && id !== moduleId,
      );
    } else {
      for (const id of targetIds) {
        if (!record.completed_sub_modules.includes(id)) {
          record.completed_sub_modules.push(id);
        }
      }
      if (!record.completed_sub_modules.includes(moduleId)) {
        record.completed_sub_modules.push(moduleId);
      }
    }

    const allCourseSubMods = this.getSubModules(undefined, cId);
    const total = allCourseSubMods.length || Math.max(record.completed_sub_modules.length, 1);
    const completed = record.completed_sub_modules.length;
    record.progress_percentage = Math.min(100, Math.round((completed / total) * 100));
    record.updated_at = new Date().toISOString();

    const nextSub = allCourseSubMods.find((sm) => !record.completed_sub_modules.includes(sm.id));
    if (nextSub) {
      record.current_stage = nextSub.id;
    }

    this.saveToStorage("roadmapProgress", this.roadmapProgress);

    if (isLiveSupabaseConfigured) {
      try {
        const studentUid = ensureUuid(record.student_id);
        const courseUid = ensureUuid(record.course_id);

        const { error: progErr } = await supabase
          .from("student_progress")
          .upsert(
            {
              student_id: studentUid,
              course_id: courseUid,
              completed_sub_modules: record.completed_sub_modules,
              current_stage: record.current_stage,
              progress_percentage: record.progress_percentage,
              updated_at: record.updated_at,
            },
            { onConflict: "student_id,course_id" },
          );

        if (progErr) {
          console.warn("[SkillNova Supabase] toggleModuleCompletion note:", progErr.message);
        }
      } catch (err) {
        console.warn("Supabase toggleModuleCompletion error:", err);
      }
    }

    this.notifySubscribers();
    return record;
  }

// --- Themes ---

  public getThemePreference(): "light" | "dark" {
    const userTheme = this.currentUser?.theme_preference;

    if (userTheme === "light" || userTheme === "dark") {
      return userTheme;
    }

    return this.currentTheme || "light";
  }

  public async setThemePreference(theme: "light" | "dark"): Promise<void> {
    this.currentTheme = theme;

    if (this.currentUser) {
      this.currentUser.theme_preference = theme;

      this.users = this.users.map((u) =>
        u.id === this.currentUser?.id ? { ...u, theme_preference: theme } : u,
      );

      this.saveToStorage("users", this.users);

      this.saveToStorage("currentTheme", theme);

      if (isLiveSupabaseConfigured && this.currentUser.id) {
        try {
          const userUid = ensureUuid(this.currentUser.id);

          await supabase
            .from("profiles")
            .update({ theme_preference: theme })
            .eq("id", userUid);
        } catch (err) {
          console.warn("Supabase setThemePreference error:", err);
        }
      }
    } else {
      this.saveToStorage("currentTheme", theme);
    }

    this.notifySubscribers();
  }
}

export const dataService = new DataService();
