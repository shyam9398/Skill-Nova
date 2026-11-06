export type UserRole = "admin" | "sub_admin" | "student";

export interface User {
  id: string;

  email: string;

  username?: string;

  phone_number?: string;

  phone?: string;

  full_name: string;

  fullName?: string;

  role: UserRole;

  avatar_url?: string;

  avatarUrl?: string;

  college?: string;

  branch?: string;

  year_of_study?: string;

  status: "active" | "inactive";

  created_at: string;

  assigned_courses?: string[]; // for sub_admin & student

  enrolledCourseIds?: string[];

  permissions?: {
    can_manage_courses?: boolean;

    can_upload_resources?: boolean;

    can_generate_ai?: boolean;

    can_publish_opportunities?: boolean;
  };

  theme_preference?: "light" | "dark";
}

export interface Course {
  id: string;

  title: string;

  description: string;

  slug: string;

  category: string;

  mentor_name: string;

  mentor_email: string;

  duration_weeks: number;

  thumbnail: string;

  roadmap_image_url: string;

  enrolled_students_count: number;

  created_at: string;

  updated_at: string;

  is_published: boolean;

  // Aliases & enhancements

  assignedMentor?: string;

  duration?: string;

  thumbnailUrl?: string;

  thumbnail_url?: string;

  roadmapImageUrl?: string;

  progressPercentage?: number;

  curriculum_text?: string;

  course_fee?: string | number;

  fee?: string;

  timeline?: string;

  status?: "active" | "archived" | "draft";
}

export interface CourseSubModule {
  id: string;

  module_id: string;

  course_id: string;

  title: string;

  order_index: number;

  description?: string;

  created_at?: string;
}

export interface CourseModule {
  id: string;

  course_id: string;

  title: string;

  order_index: number;

  description?: string;

  sub_modules?: CourseSubModule[];

  topics?: Topic[];
}

export interface PresentationSlideAllocation {
  id: string;

  presentation_id: string;

  sub_module_id: string;

  start_slide: number;

  end_slide: number;

  release_status: "released" | "locked" | "scheduled";

  scheduled_release_at?: string;

  released_at?: string;

  released_by?: string;

  created_at?: string;

  updated_at?: string;
}

export interface Presentation {
  id: string;

  course_id: string;

  module_id: string;

  sub_module_id?: string;

  title: string;

  description?: string;

  original_file_path?: string;

  ppt_url?: string;

  total_slides: number;

  uploaded_by?: string;

  created_at?: string;

  allocations?: PresentationSlideAllocation[];
}

export interface Topic {
  id: string;

  module_id: string;

  moduleId?: string;

  sub_module_id?: string;

  course_id: string;

  title: string;

  description: string;

  class_date: string;

  order_index: number;

  recording_link?: string;

  recording_url?: string;

  drive_notes_link?: string;

  drive_notes_url?: string;

  pdf_url?: string;

  pdf_file_url?: string;

  ppt_url?: string;

  ppt_file_url?: string;

  reference_links?: { title: string; url: string }[];

  is_published: boolean;

  has_recording: boolean;

  has_notes: boolean;

  has_quiz: boolean;

  has_flashcards: boolean;

  created_at: string;

  status?: "completed" | "in_progress" | "locked" | "published";

  release_status?: "draft" | "held" | "scheduled" | "released" | "archived";

  scheduled_release_at?: string;

  released_at?: string;

  released_by?: string;

  resource_category?: string;

  // Specific Resource Types & Slide/Doc Ranges

  resource_type?:
    | "video"
    | "ppt"
    | "notes"
    | "interview"
    | "drive_video"
    | "ppt_presentation"
    | "doc_questions"
    | "flashcards"
    | "quiz"
    | string;

  drive_video_url?: string;

  total_slides?: number;

  slide_start?: number;

  slide_end?: number;

  doc_url?: string;

  doc_page_range?: string;

  curriculum_name?: string;

  timezone?: string;
}

export interface PracticalSubmission {
  id: string;

  student_id: string;

  student_name?: string;

  course_id: string;

  course_title?: string;

  practical_id: string;

  source_code: string;

  code?: string;

  status: "saved" | "submitted" | "graded" | "draft";

  grade?: string;

  mentor_feedback?: string;

  version?: number;

  submitted_at?: string;

  created_at: string;

  updated_at: string;
}

export interface LearningResource {
  id: string;

  topicId: string;

  courseId: string;

  courseName: string;

  topicTitle: string;

  description: string;

  publishedAt: string;

  recordingUrl?: string;

  driveNotesUrl?: string;

  pdfUrl?: string;

  hasRecording: boolean;

  hasNotes: boolean;
}

export type SaturdaySpecialSession = SaturdaySpecial;

export interface Flashcard {
  id: string;
  topic_id?: string;
  topic_title?: string;
  course_id?: string;
  question: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
  source_ref?: string;
  is_published?: boolean;
  release_status?: 'released' | 'held' | 'hold' | 'scheduled';
  scheduled_release_at?: string;
  order_index?: number;
  set_title?: string;
  created_at?: string;
}

export interface QuizQuestionItem {
  id: string;

  quiz_id?: string;

  question: string;

  options: ({ key: string; text: string } | string)[];

  correct_answer: string;

  explanation?: string;

  marks: number;

  order_index: number;
}

export interface Quiz {
  id: string;

  course_id?: string;

  course_title?: string;

  module_id?: string;

  module_title?: string;

  sub_module_id?: string;

  title: string;

  description: string;

  total_marks: number;

  duration_minutes: number;

  start_time: string; // ISO string in UTC

  end_time: string; // ISO string in UTC

  status: "upcoming" | "active" | "closed";

  questions?: QuizQuestionItem[];

  created_at: string;

  created_by?: string;

  updated_at?: string;
}

export interface QuizQuestion {
  id: string;

  topic_id?: string;

  quiz_id?: string;

  topic_title?: string;

  question: string;

  options: string[] | { key: string; text: string }[];

  correct_index?: number;

  correct_answer?: string;

  explanation: string;

  source_ref?: string;

  marks?: number;
}

export interface QuizAttempt {
  id: string;

  student_id: string;

  student_name?: string;

  topic_id?: string;

  quiz_id?: string;

  quiz_title?: string;

  course_id?: string;

  score: number;

  total_marks?: number;

  total_questions?: number;

  correct_count?: number;

  incorrect_count?: number;

  unanswered_count?: number;

  accuracy?: number; // (correct / total) * 100

  percentage?: number;

  time_spent_seconds?: number;

  answers?: Record<string, string>;

  is_first_attempt?: boolean;

  is_practice?: boolean;

  status?: "submitted" | "timed_out" | "in_progress" | "completed";

  completed_at: string;
}

export interface QuizLeaderboardEntry {
  rank: number;

  student_id: string;

  student_name: string;

  avatar_url?: string;

  score: number;

  correct_count?: number;

  total_questions?: number;

  total_marks: number;

  accuracy: number;

  time_spent_seconds: number;

  completed_at: string;

  attempt_id?: string;

  is_first_attempt?: boolean;
}

export interface PdfPageAllocation {
  id: string;

  topic_id?: string;

  course_id?: string;

  sub_module_id?: string;

  title?: string;

  pdf_url: string;

  start_page: number;

  end_page: number;

  total_pages: number;

  release_status: "released" | "locked" | "scheduled";

  scheduled_release_at?: string;

  released_at?: string;

  released_by?: string;

  created_at?: string;

  updated_at?: string;
}

export interface StudentRoadmapProgress {
  id?: string;

  student_id: string;

  course_id: string;

  completed_sub_modules: string[];

  current_stage?: string;

  current_sub_module_id?: string;

  progress_percentage: number;

  last_activity_at?: string;

  updated_at?: string;
}

export interface InterviewQuestion {
  id: string;
  topic_id?: string;
  course_id?: string;
  role_category?: string;
  question: string;
  model_answer?: string;
  sampleAnswer?: string;
  answer?: string;
  key_talking_points?: string[];
  source_ref?: string;
  sourceCitation?: string;
  difficulty?: "easy" | "medium" | "hard";
  is_published?: boolean;
  release_status?: 'released' | 'held' | 'hold' | 'scheduled';
  scheduled_release_at?: string;
  released_at?: string;
  created_at?: string;
}

export interface AIGenerationJob {
  id: string;

  course_id: string;

  topic_id: string;

  document_name: string;

  extracted_text_preview: string;

  status: "pending_review" | "approved" | "rejected" | "published";

  summary: string;

  flashcards: Flashcard[];

  quiz_questions: QuizQuestion[];

  interview_questions: InterviewQuestion[];

  important_concepts: {
    term: string;
    definition: string;
    source_page: string;
  }[];

  created_at: string;

  reviewed_by?: string;

  reviewed_at?: string;
}

export interface SaturdaySpecial {
  id: string;
  title: string;
  category: string;
  description: string;
  speaker: string;
  speaker_role: string;
  session_date: string;
  date?: string;
  cover_image: string;
  coverImageUrl?: string;
  recording_url?: string;
  recordingUrl?: string;
  slides_url?: string;
  ppt_url?: string;
  notes_url?: string;
  doc_url?: string;
  resources_url?: string;
  resourceDocUrl?: string;
  additional_resources_url?: string;
  is_upcoming: boolean;
  is_published?: boolean;
  release_status?: 'released' | 'held' | 'hold' | 'scheduled';
  scheduled_release_at?: string;
  attendees_count: number;
  zoom_join_url?: string;
  created_at?: string;
}

export interface Opportunity {
  id: string;

  title: string;

  organization: string;

  company?: string;

  category: "internship" | "job" | "hackathon" | "competition" | "research";

  type?: string;

  description: string;

  eligibility?: string;

  required_skills?: string[];

  requiredSkills?: string[];

  tags?: string[];

  location: string;

  is_remote?: boolean;

  is_active?: boolean;

  stipend_salary?: string;

  stipendOrPrize?: string;

  stipend_or_salary?: string;

  stipend?: string;

  deadline: string;

  apply_url?: string;

  applyUrl?: string;

  apply_link?: string;

  published_at?: string;

  postedDate?: string;

  is_featured?: boolean;

  bookmarked?: boolean;
  created_at?: string;
}

export interface CareerBlueprint {
  id: string;

  role_name: string;

  roleTitle?: string;

  slug: string;

  category: string;

  overview: string;

  summary?: string;

  mandatory_skills: string[];

  mandatorySkills?: string[];

  preferred_skills: string[];

  preferredSkills?: string[];

  recommended_languages: string[];

  recommendedLanguages?: string[];

  core_cs: string[];

  coreCs?: string[];

  frameworks_tools: string[];

  frameworksTools?: string[];

  recommended_projects: {
    title: string;

    description: string;

    tech_stack: string[];

    portfolio_highlight: string;
  }[];

  recommendedProjects?: any[];

  projectIdeas?: string[];

  github_portfolio_advice: string[];

  githubPortfolioAdvice?: string[];

  resume_structure: {
    section: string;

    description: string;

    dos: string[];

    donts: string[];
  }[];

  resumeStructure?: any;

  common_mistakes: string[];

  commonMistakes?: string[];

  frequently_asked_interview_topics: string[];

  interviewTopics?: string[];

  sample_resume_outline: string;
}

export interface Notification {
  id: string;

  user_id: string;

  title: string;

  message: string;

  type: "resource" | "quiz" | "saturday" | "opportunity" | "system";

  link: string;

  read: boolean;

  created_at: string;
}

export interface StudentProgress {
  student_id: string;

  course_id: string;

  completed_topic_ids: string[];

  total_topics: number;

  percentage: number;

  quiz_attempts: QuizAttempt[];

  mastered_flashcard_ids: string[];
}

export interface DiscussionPost {
  id: string;

  author_id: string;

  author_name: string;

  author_role: "student" | "admin" | "sub_admin";

  author_avatar?: string;

  author_batch?: string;

  course_id?: string;

  sub_module_id?: string;

  title: string;

  content: string;

  category: "general" | "project" | "resources" | "tech" | "career";

  tags: string[];

  likes_count: number;

  liked_by_user_ids: string[];

  replies_count: number;

  created_at: string;
}

export interface DiscussionReply {
  id: string;

  post_id: string;

  author_id: string;

  author_name: string;

  author_role: "student" | "admin" | "sub_admin";

  author_avatar?: string;

  content: string;

  message?: string;

  code_snippet?: string;

  created_at: string;
}

export interface MentorRequestReply {
  id: string;

  request_id: string;

  author_id: string;

  author_name: string;

  author_role: "student" | "admin" | "sub_admin";

  content: string;

  message?: string;

  code_snippet?: string;

  created_at: string;
}

export interface MentorRequest {
  id: string;

  student_id: string;

  student_name: string;

  student_email: string;

  course_id: string;

  course_title: string;

  topic_title?: string;

  assigned_mentor_name?: string;

  doubt_title: string;

  doubt_description: string;

  code_snippet?: string;

  status: "pending" | "assigned" | "in_progress" | "resolved";

  priority: "low" | "medium" | "high";

  created_at: string;

  updated_at: string;

  replies: MentorRequestReply[];
}

export interface AuditLogEntry {
  id: string;
  action:
    | "publish"
    | "release"
    | "hold"
    | "reschedule"
    | "archive"
    | "edit"
    | "create_student"
    | "create_sub_admin"
    | "reset_password"
    | "delete_student"
    | "deactivate_student"
    | "activate_student"
    | "delete_course"
    | "delete_resource"
    | "create_flashcard"
    | "delete_flashcard"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "LOGOUT"
    | "SESSION_EXPIRED"
    | "SYSTEM_ERROR"
    | "DB_ERROR"
    | "API_ERROR"
    | "RESOURCE_LOAD_FAILURE"
    | string;
  resource_id?: string;
  resource_title?: string;
  course_id?: string;
  performed_by: string;
  timestamp: string;
  details?: string;
  user_role?: 'admin' | 'student' | 'sub_admin' | string;
  username?: string;
  login_time?: string;
  logout_time?: string;
  session_duration?: string;
  status?: 'active' | 'logged_out' | 'session_expired' | 'failed' | string;
  entity_type?: string;
  entity_id?: string;
  actor_email?: string;
  metadata?: Record<string, any>;
}

export interface HomepageSettings {
  id: string;

  demo_video_url: string;

  demo_video_title: string;

  demo_video_description: string;

  demo_video_is_active: boolean;

  whatsapp_group_url: string;

  whatsapp_qr_code_url: string;

  whatsapp_is_active: boolean;

  whatsapp_display_name: string;

  instagram_url: string;

  instagram_is_active: boolean;

  instagram_display_name: string;

  linkedin_url: string;

  linkedin_is_active: boolean;

  linkedin_display_name: string;

  live_meeting_url?: string;

  live_meeting_title?: string;

  live_meeting_time?: string;

  live_meeting_is_active?: boolean;

  live_meeting_is_daily_recurring?: boolean;

  live_meeting_updated_at?: string;

  updated_at: string;
}

export interface HomepageCourse {
  id: string;

  title: string;

  description: string;

  thumbnail_url: string;

  fee: string;

  timeline: string;

  curriculum_text: string;

  whatsapp_enroll_url: string;

  is_active: boolean;

  order_index: number;

  created_at: string;

  updated_at: string;
}

export interface StudentAccessRequest {
  id: string;

  full_name: string;

  email: string;

  phone: string;

  college: string;

  branch: string;

  year_of_study: string;

  target_course: string;

  payment_reference: string;

  status: "pending" | "approved" | "rejected";

  admin_note?: string;

  assigned_batch?: string;

  assigned_course_id?: string;

  created_at: string;

  reviewed_at?: string;

  reviewed_by?: string;
}

export interface StudentAccessRequestEvent {
  id: string;

  request_id: string;

  event_type: string;

  details?: string;

  created_at: string;
}

export interface TickerAnnouncement {
  id: string;
  type: 'video' | 'ppt' | 'notes' | 'interview' | 'quiz' | 'live_meeting' | 'announcement';
  title: string;
  course_id?: string;
  course_title?: string;
  module_id?: string;
  sub_module_id?: string;
  resource_id?: string;
  published_at?: string;
  link?: string;
  is_external_link?: boolean;
  priority?: number;
}
