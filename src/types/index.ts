export type UserRole = 'admin' | 'sub_admin' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  fullName?: string;
  role: UserRole;
  avatar_url?: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  year_of_study?: string;
  status: 'active' | 'inactive';
  created_at: string;
  assigned_courses?: string[]; // for sub_admin & student
  enrolledCourseIds?: string[];
  permissions?: {
    can_manage_courses?: boolean;
    can_upload_resources?: boolean;
    can_generate_ai?: boolean;
    can_publish_opportunities?: boolean;
  };
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
  // Aliases
  assignedMentor?: string;
  duration?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  roadmapImageUrl?: string;
  progressPercentage?: number;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  description?: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  module_id: string;
  moduleId?: string;
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
  status?: 'completed' | 'in_progress' | 'locked' | 'published';
  release_status?: 'draft' | 'held' | 'scheduled' | 'released' | 'archived';
  scheduled_release_at?: string;
  released_at?: string;
  released_by?: string;
  resource_category?: string;
}

export interface PracticalSubmission {
  id: string;
  student_id: string;
  student_name?: string;
  course_id: string;
  course_title?: string;
  practical_id: string;
  source_code: string;
  status: 'saved' | 'submitted' | 'graded';
  grade?: string;
  mentor_feedback?: string;
  submitted_at: string;
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
  topic_id: string;
  topic_title?: string;
  course_id?: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source_ref: string;
}

export interface QuizQuestion {
  id: string;
  topic_id: string;
  topic_title?: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  source_ref: string;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  topic_id: string;
  course_id?: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

export interface InterviewQuestion {
  id: string;
  topic_id: string;
  role_category: string;
  question: string;
  model_answer: string;
  sampleAnswer?: string;
  key_talking_points: string[];
  source_ref: string;
  sourceCitation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AIGenerationJob {
  id: string;
  course_id: string;
  topic_id: string;
  document_name: string;
  extracted_text_preview: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'published';
  summary: string;
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
  interview_questions: InterviewQuestion[];
  important_concepts: { term: string; definition: string; source_page: string }[];
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface SaturdaySpecial {
  id: string;
  title: string;
  category:
    | 'Generative AI'
    | 'Agentic AI'
    | 'Large Language Models'
    | 'Cybersecurity'
    | 'Cloud Computing'
    | 'DevOps'
    | 'Robotics'
    | 'Data Science'
    | 'Blockchain'
    | 'IoT'
    | 'Hackathon Prep';
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
  resources_url?: string;
  resourceDocUrl?: string;
  is_upcoming: boolean;
  attendees_count: number;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  company?: string;
  category: 'internship' | 'job' | 'hackathon' | 'competition' | 'research';
  type?: string;
  description: string;
  eligibility: string;
  required_skills: string[];
  requiredSkills?: string[];
  location: string;
  is_remote: boolean;
  stipend_salary?: string;
  stipendOrPrize?: string;
  deadline: string;
  apply_url: string;
  applyUrl?: string;
  published_at: string;
  postedDate?: string;
  is_featured: boolean;
  bookmarked?: boolean;
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
  type: 'resource' | 'quiz' | 'saturday' | 'opportunity' | 'system';
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
  author_role: 'student' | 'admin' | 'sub_admin';
  author_avatar?: string;
  author_batch?: string;
  title: string;
  content: string;
  category: 'general' | 'project' | 'resources' | 'tech' | 'career';
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
  author_role: 'student' | 'admin' | 'sub_admin';
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface MentorRequestReply {
  id: string;
  request_id: string;
  author_id: string;
  author_name: string;
  author_role: 'student' | 'admin' | 'sub_admin';
  content: string;
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
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  replies: MentorRequestReply[];
}

export interface AuditLogEntry {
  id: string;
  action: 'publish' | 'release' | 'hold' | 'reschedule' | 'archive' | 'edit';
  resource_id: string;
  resource_title: string;
  course_id: string;
  performed_by: string;
  timestamp: string;
  details?: string;
}
