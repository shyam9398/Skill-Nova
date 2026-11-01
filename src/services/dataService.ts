import type {
  User, UserRole, Course, CourseModule, Topic, SaturdaySpecial, Opportunity,
  CareerBlueprint, AIGenerationJob, Notification, Flashcard, QuizQuestion, QuizAttempt, StudentProgress, InterviewQuestion,
  DiscussionPost, DiscussionReply, MentorRequest, MentorRequestReply, PracticalSubmission
} from '../types';
import {
  INITIAL_USERS, INITIAL_COURSES, INITIAL_MODULES, INITIAL_TOPICS,
  INITIAL_FLASHCARDS, INITIAL_QUIZZES, INITIAL_INTERVIEWS,
  INITIAL_SATURDAY_SPECIAL, INITIAL_OPPORTUNITIES, INITIAL_BLUEPRINTS,
  INITIAL_NOTIFICATIONS, INITIAL_AI_JOBS,
  INITIAL_DISCUSSIONS, INITIAL_DISCUSSIONS_REPLIES, INITIAL_MENTOR_REQUESTS
} from './mockData';

type Listener = () => void;

class DataService {
  private listeners: Set<Listener> = new Set();

  private users: User[] = [];
  private courses: Course[] = [];
  private modules: CourseModule[] = [];
  private topics: Topic[] = [];
  private flashcards: Flashcard[] = [];
  private quizzes: QuizQuestion[] = [];
  private quizAttempts: QuizAttempt[] = [];
  private interviews = INITIAL_INTERVIEWS;
  private saturdaySpecial: SaturdaySpecial[] = [];
  private opportunities: Opportunity[] = [];
  private blueprints: CareerBlueprint[] = [];
  private notifications: Notification[] = [];
  private aiJobs: AIGenerationJob[] = [];
  private discussions: DiscussionPost[] = [];
  private discussionReplies: DiscussionReply[] = [];
  private mentorRequests: MentorRequest[] = [];
  private codingSubmissions: PracticalSubmission[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const getOrInit = <T>(key: string, initial: T): T => {
        const item = localStorage.getItem(`skillnova_${key}`);
        if (item) {
          try {
            return JSON.parse(item);
          } catch {
            return initial;
          }
        }
        return initial;
      };

      this.users = getOrInit('users', INITIAL_USERS);
      this.courses = getOrInit('courses', INITIAL_COURSES);
      this.modules = getOrInit('modules', INITIAL_MODULES);
      this.topics = getOrInit('topics', INITIAL_TOPICS);
      this.flashcards = getOrInit('flashcards', INITIAL_FLASHCARDS);
      this.quizzes = getOrInit('quizzes', INITIAL_QUIZZES);
      this.quizAttempts = getOrInit('quizAttempts', []);
      this.saturdaySpecial = getOrInit('saturdaySpecial', INITIAL_SATURDAY_SPECIAL);
      this.opportunities = getOrInit('opportunities', INITIAL_OPPORTUNITIES);
      this.blueprints = getOrInit('blueprints', INITIAL_BLUEPRINTS);
      this.notifications = getOrInit('notifications', INITIAL_NOTIFICATIONS);
      this.aiJobs = getOrInit('aiJobs', INITIAL_AI_JOBS);
      this.discussions = getOrInit('discussions', INITIAL_DISCUSSIONS);
      this.discussionReplies = getOrInit('discussionReplies', INITIAL_DISCUSSIONS_REPLIES);
      this.mentorRequests = getOrInit('mentorRequests', INITIAL_MENTOR_REQUESTS);
      this.codingSubmissions = getOrInit('codingSubmissions', []);

      // Default active user is the student Aarav Sharma for instant preview,
      // or whatever user was stored
      const savedUserId = localStorage.getItem('skillnova_current_user_id');
      if (savedUserId) {
        this.currentUser = this.users.find(u => u.id === savedUserId) || this.users[0];
      } else {
        this.currentUser = this.users.find(u => u.role === 'student') || this.users[0];
      }
    } catch {
      this.users = INITIAL_USERS;
      this.courses = INITIAL_COURSES;
      this.modules = INITIAL_MODULES;
      this.topics = INITIAL_TOPICS;
      this.flashcards = INITIAL_FLASHCARDS;
      this.quizzes = INITIAL_QUIZZES;
      this.saturdaySpecial = INITIAL_SATURDAY_SPECIAL;
      this.opportunities = INITIAL_OPPORTUNITIES;
      this.blueprints = INITIAL_BLUEPRINTS;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.aiJobs = INITIAL_AI_JOBS;
      this.discussions = INITIAL_DISCUSSIONS;
      this.discussionReplies = INITIAL_DISCUSSIONS_REPLIES;
      this.mentorRequests = INITIAL_MENTOR_REQUESTS;
      this.currentUser = INITIAL_USERS[2]; // Student
    }
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(`skillnova_${key}`, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  // --- Auth & User Session ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    localStorage.setItem('skillnova_current_user_id', user.id);
    this.notifyListeners();
  }

  public switchRole(role: 'admin' | 'sub_admin' | 'student') {
    const target = this.users.find(u => u.role === role);
    if (target) {
      this.setCurrentUser(target);
    }
  }

  public login(email: string, role?: UserRole): { success: boolean; user?: User; error?: string } {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'Account not found. Student and Administrative accounts must be provisioned by an Administrator.' };
    }
    if (user.status === 'inactive') {
      return { success: false, error: 'Your account has been deactivated. Please contact the administrator.' };
    }
    if (role === 'admin' && user.role === 'student') {
      return { success: false, error: 'Unauthorized: Student credentials cannot access the Administrative Portal.' };
    }
    if (role === 'student' && user.role !== 'student') {
      // Admins can view student preview or switch
      this.setCurrentUser(user);
      return { success: true, user };
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem('skillnova_current_user_id');
    this.notifyListeners();
  }

  // --- Users & Students Management ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public getEnrolledCoursesForStudent(studentId: string): Course[] {
    const student = this.getUserById(studentId);
    if (!student) return [];
    const assignedIds = student.assigned_courses || student.enrolledCourseIds || [];
    return this.courses.filter(c => assignedIds.includes(c.id));
  }

  public getStudents(): User[] {
    return this.users.filter(u => u.role === 'student');
  }

  public getSubAdmins(): User[] {
    return this.users.filter(u => u.role === 'sub_admin');
  }

  public addStudent(studentData: Partial<User>): User {
    const newStudent: User = {
      id: `usr-student-${Date.now()}`,
      email: studentData.email || '',
      full_name: studentData.full_name || 'New Student',
      role: 'student',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      college: studentData.college || 'Engineering Institute',
      branch: studentData.branch || 'Computer Science',
      year_of_study: studentData.year_of_study || '3rd Year',
      status: 'active',
      created_at: new Date().toISOString(),
      assigned_courses: studentData.assigned_courses || ['course-fs-101'],
    };
    this.users.unshift(newStudent);
    this.saveToStorage('users', this.users);

    // Notify student
    this.createNotification({
      user_id: newStudent.id,
      title: 'Welcome to SkillNova LMS',
      message: 'Your student account is active. Explore your enrolled courses and roadmaps.',
      type: 'system',
      link: '/student/dashboard',
    });

    return newStudent;
  }

  public importStudentsCSV(parsedRows: Array<{ name: string; email: string; college: string; branch: string; year: string; courseId?: string }>): number {
    let count = 0;
    parsedRows.forEach(row => {
      if (row.email && !this.users.some(u => u.email.toLowerCase() === row.email.toLowerCase())) {
        const student: User = {
          id: `usr-csv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          email: row.email.trim(),
          full_name: row.name.trim() || 'Imported Student',
          role: 'student',
          college: row.college?.trim() || 'Partner University',
          branch: row.branch?.trim() || 'Computer Science',
          year_of_study: row.year?.trim() || '3rd Year',
          status: 'active',
          created_at: new Date().toISOString(),
          assigned_courses: row.courseId ? [row.courseId] : ['course-fs-101'],
        };
        this.users.push(student);
        count++;
      }
    });
    this.saveToStorage('users', this.users);
    return count;
  }

  public toggleUserStatus(userId: string) {
    this.users = this.users.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
      }
      return u;
    });
    this.saveToStorage('users', this.users);
  }

  public assignStudentCourses(userId: string, courseIds: string[]) {
    this.users = this.users.map(u => {
      if (u.id === userId) {
        return { ...u, assigned_courses: courseIds };
      }
      return u;
    });
    this.saveToStorage('users', this.users);
  }

  // --- Courses & Roadmaps ---
  public getCourses(): Course[] {
    return [...this.courses];
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.find(c => c.id === id || c.slug === id);
  }

  public addCourse(courseData: Partial<Course>): Course {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseData.title || 'Untitled Course',
      description: courseData.description || 'Course description...',
      slug: (courseData.title || 'untitled-course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: courseData.category || 'Technology',
      mentor_name: courseData.mentor_name || 'Senior Instructor',
      mentor_email: courseData.mentor_email || 'mentor@skillnova.edu',
      duration_weeks: Number(courseData.duration_weeks) || 12,
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      roadmap_image_url: courseData.roadmap_image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
      enrolled_students_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: true,
    };
    this.courses.unshift(newCourse);
    this.saveToStorage('courses', this.courses);
    return newCourse;
  }

  public updateCourseRoadmap(courseId: string, roadmapUrl: string) {
    this.courses = this.courses.map(c => {
      if (c.id === courseId) {
        return { ...c, roadmap_image_url: roadmapUrl, updated_at: new Date().toISOString() };
      }
      return c;
    });
    this.saveToStorage('courses', this.courses);
  }

  // --- Modules & Topics ---
  public getModulesForCourse(courseId: string): CourseModule[] {
    const courseMods = this.modules
      .filter(m => m.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);

    return courseMods.map(m => ({
      ...m,
      topics: this.topics
        .filter(t => t.module_id === m.id)
        .sort((a, b) => a.order_index - b.order_index),
    }));
  }

  public addModule(courseId: string, title: string, description?: string): CourseModule {
    const currentMods = this.modules.filter(m => m.course_id === courseId);
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      course_id: courseId,
      title,
      description,
      order_index: currentMods.length + 1,
    };
    this.modules.push(newMod);
    this.saveToStorage('modules', this.modules);
    return newMod;
  }

  public addTopic(topicData: Partial<Topic>): Topic {
    const courseId = topicData.course_id || (this.courses[0]?.id || 'course-fs-101');
    let moduleId = topicData.module_id;

    // Auto-create module if none exists for this course
    if (!moduleId) {
      const existingMods = this.modules.filter(m => m.course_id === courseId);
      if (existingMods.length > 0) {
        moduleId = existingMods[0].id;
      } else {
        const createdMod = this.addModule(courseId, 'Module 1: Core Curriculum & Practicals');
        moduleId = createdMod.id;
      }
    }

    const releaseStatus = topicData.release_status || 'released';
    const isReleased = releaseStatus === 'released';

    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      module_id: moduleId,
      course_id: courseId,
      title: topicData.title || 'New Topic',
      description: topicData.description || '',
      class_date: topicData.class_date || new Date().toISOString().split('T')[0],
      order_index: this.topics.filter(t => t.module_id === moduleId).length + 1,
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
      released_by: topicData.released_by || 'Administrator',
      resource_category: topicData.resource_category || 'pdf',
      has_recording: Boolean(topicData.recording_link || topicData.recording_url),
      has_notes: Boolean(topicData.drive_notes_link || topicData.pdf_url),
      has_quiz: false,
      has_flashcards: false,
      created_at: new Date().toISOString(),
    };
    this.topics.unshift(newTopic);
    this.saveToStorage('topics', this.topics);

    if (isReleased) {
      this.notifyEnrolledStudents(newTopic);
    }

    return newTopic;
  }

  private notifyEnrolledStudents(topic: Topic) {
    this.getStudents().forEach(student => {
      const assigned = student.assigned_courses || student.enrolledCourseIds || [];
      if (assigned.includes(topic.course_id)) {
        this.createNotification({
          user_id: student.id,
          title: `Resource Released: ${topic.title}`,
          message: `New curriculum material is now available in your enrolled course.`,
          type: 'resource',
          link: `/student/courses/${topic.course_id}`,
        });
      }
    });
  }

  public releaseTopic(topicId: string, releasedBy = 'Administrator'): Topic | undefined {
    const topic = this.topics.find(t => t.id === topicId);
    if (!topic) return undefined;
    topic.release_status = 'released';
    topic.is_published = true;
    topic.released_at = new Date().toISOString();
    topic.released_by = releasedBy;
    this.saveToStorage('topics', this.topics);
    this.notifyEnrolledStudents(topic);
    return topic;
  }

  public holdTopic(topicId: string, scheduledIsoDate?: string, heldBy = 'Administrator'): Topic | undefined {
    const topic = this.topics.find(t => t.id === topicId);
    if (!topic) return undefined;
    topic.release_status = scheduledIsoDate ? 'scheduled' : 'held';
    topic.is_published = false;
    topic.scheduled_release_at = scheduledIsoDate;
    this.saveToStorage('topics', this.topics);
    return topic;
  }

  public archiveTopic(topicId: string): Topic | undefined {
    const topic = this.topics.find(t => t.id === topicId);
    if (!topic) return undefined;
    topic.release_status = 'archived';
    topic.is_published = false;
    this.saveToStorage('topics', this.topics);
    return topic;
  }

  public getReleasedTopics(courseId?: string): Topic[] {
    const now = new Date().getTime();
    let updatedAny = false;
    this.topics.forEach(t => {
      if (t.release_status === 'scheduled' && t.scheduled_release_at) {
        if (new Date(t.scheduled_release_at).getTime() <= now) {
          t.release_status = 'released';
          t.is_published = true;
          t.released_at = new Date().toISOString();
          updatedAny = true;
          this.notifyEnrolledStudents(t);
        }
      }
    });
    if (updatedAny) {
      this.saveToStorage('topics', this.topics);
    }

    let list = this.topics.filter(t => t.release_status === 'released' || (!t.release_status && t.is_published));
    if (courseId) {
      list = list.filter(t => t.course_id === courseId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllAdminTopics(courseId?: string): Topic[] {
    let list = this.topics;
    if (courseId) {
      list = list.filter(t => t.course_id === courseId);
    }
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAllPublishedTopics(): Topic[] {
    return this.getReleasedTopics();
  }

  // --- Google Drive Link Access Validation Helper ---
  public validateDriveLink(url: string): { isValid: boolean; isPublic: boolean; advice: string } {
    if (!url || !url.trim()) {
      return { isValid: false, isPublic: false, advice: 'Please enter a valid URL.' };
    }
    const isDrive = url.includes('drive.google.com') || url.includes('docs.google.com');
    if (!isDrive) {
      return { isValid: true, isPublic: true, advice: 'External link verified.' };
    }
    const hasViewPermission = url.includes('/view') || url.includes('/sharing') || url.includes('id=');
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
    rawText: string
  ): AIGenerationJob {
    const course = this.getCourseById(courseId);
    const topic = this.topics.find(t => t.id === topicId);
    const topicTitle = topic ? topic.title : 'Selected Topic';

    // Grounded mock extraction simulation (mimicking Gemini 2.0 Flash structured outputs)
    const summary = `Systematic summary of "${documentName}" for topic "${topicTitle}". The document covers fundamental principles, architectural boundaries, edge cases, and industry implementation patterns grounded in source text.`;

    const generatedFlashcards: Flashcard[] = [
      {
        id: `fc-gen-${Date.now()}-1`,
        topic_id: topicId,
        topic_title: topicTitle,
        question: `According to ${documentName}, what is the primary architecture rationale for this approach?`,
        answer: `It isolates state mutations, guarantees referential transparency, and reduces runtime bottlenecks under high concurrency.`,
        difficulty: 'medium',
        source_ref: `${documentName}, Section 2.1 (Grounded in uploaded PDF)`,
      },
      {
        id: `fc-gen-${Date.now()}-2`,
        topic_id: topicId,
        topic_title: topicTitle,
        question: `Which tradeoff is explicitly highlighted in ${documentName}?`,
        answer: `Increased initial memory overhead in exchange for sub-millisecond retrieval latency.`,
        difficulty: 'hard',
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
          'Strict transactional serializability without locking overhead',
          'Eventual consistency with asynchronous gossip protocol',
          'Unbounded in-memory queueing',
          'Manual memory deallocation',
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
          'Silent cascade degradation during downstream network partitions',
          'Uncontrolled CPU overclocking',
          'Browser cache overfill',
          'Compiler syntax ambiguity',
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
        role_category: course?.category || 'Engineering',
        question: `How would you explain the core concepts of "${topicTitle}" as presented in ${documentName} in a senior technical interview?`,
        model_answer: `Begin by articulating the core engineering problem: scale and maintainability. Reference the specific invariants outlined in ${documentName}, discuss why traditional alternatives fail under load, and outline defensive monitoring metrics.`,
        key_talking_points: [
          'State boundaries and isolation',
          'Quantitative throughput tradeoffs',
          'Defensive error recovery and fallback strategies',
        ],
        source_ref: `${documentName}, Executive Summary & System Design Chapter`,
      },
    ];

    const importantConcepts = [
      {
        term: 'Grounded Execution Invariant',
        definition: 'System state condition that remains true across all concurrent executions without drift.',
        source_page: `${documentName}, Page 5`,
      },
      {
        term: 'Optimistic Verification',
        definition: 'Method of validating operations at commit time rather than locking resources proactively.',
        source_page: `${documentName}, Page 18`,
      },
    ];

    const newJob: AIGenerationJob = {
      id: `job-${Date.now()}`,
      course_id: courseId,
      topic_id: topicId,
      document_name: documentName,
      extracted_text_preview: rawText.slice(0, 320) + (rawText.length > 320 ? '...' : ''),
      status: 'pending_review',
      summary,
      flashcards: generatedFlashcards,
      quiz_questions: generatedQuizzes,
      interview_questions: generatedInterviews,
      important_concepts: importantConcepts,
      created_at: new Date().toISOString(),
    };

    this.aiJobs.unshift(newJob);
    this.saveToStorage('aiJobs', this.aiJobs);
    return newJob;
  }

  public getAIJobs(): AIGenerationJob[] {
    return [...this.aiJobs];
  }

  public updateAIJob(jobId: string, updates: Partial<AIGenerationJob>) {
    this.aiJobs = this.aiJobs.map(j => {
      if (j.id === jobId) {
        return { ...j, ...updates, reviewed_at: new Date().toISOString() };
      }
      return j;
    });
    this.saveToStorage('aiJobs', this.aiJobs);
  }

  public approveAndPublishAIJob(jobId: string, reviewerName: string) {
    const job = this.aiJobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = 'published';
    job.reviewed_by = reviewerName;
    job.reviewed_at = new Date().toISOString();

    // Publish flashcards to main collection
    if (job.flashcards && job.flashcards.length > 0) {
      this.flashcards.push(...job.flashcards);
      this.saveToStorage('flashcards', this.flashcards);
    }

    // Publish quizzes to main collection
    if (job.quiz_questions && job.quiz_questions.length > 0) {
      this.quizzes.push(...job.quiz_questions);
      this.saveToStorage('quizzes', this.quizzes);
    }

    // Mark topic flags
    this.topics = this.topics.map(t => {
      if (t.id === job.topic_id) {
        return {
          ...t,
          has_quiz: true,
          has_flashcards: true,
        };
      }
      return t;
    });
    this.saveToStorage('topics', this.topics);

    this.saveToStorage('aiJobs', this.aiJobs);

    // Notify enrolled students
    this.getStudents().forEach(student => {
      if (student.assigned_courses?.includes(job.course_id)) {
        this.createNotification({
          user_id: student.id,
          title: `New AI Assessments Published`,
          message: `AI-grounded flashcards and quizzes for ${job.document_name} have been approved and published.`,
          type: 'quiz',
          link: `/student/practice/quiz/${job.quiz_questions[0]?.id || ''}`,
        });
      }
    });
  }

  // --- Flashcards & Practice ---
  public getFlashcards(courseIdOrTopicId?: string, topicId?: string): Flashcard[] {
    const tid = topicId || (courseIdOrTopicId?.startsWith('top-') ? courseIdOrTopicId : undefined);
    const cid = topicId ? courseIdOrTopicId : (!courseIdOrTopicId?.startsWith('top-') ? courseIdOrTopicId : undefined);
    let list = this.flashcards;
    if (tid) {
      list = list.filter(f => f.topic_id === tid);
    }
    if (cid && !tid) {
      list = list.filter(f => f.course_id === cid);
    }
    return [...list];
  }

  // --- Quizzes & Scoring ---
  public getQuizzes(topicId?: string): QuizQuestion[] {
    if (topicId) {
      return this.quizzes.filter(q => q.topic_id === topicId);
    }
    return [...this.quizzes];
  }

  public submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completed_at'>): QuizAttempt {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
      completed_at: new Date().toISOString(),
    };
    this.quizAttempts.unshift(newAttempt);
    this.saveToStorage('quizAttempts', this.quizAttempts);
    return newAttempt;
  }

  public getQuizAttempts(studentId?: string): QuizAttempt[] {
    if (studentId) {
      return this.quizAttempts.filter(a => a.student_id === studentId);
    }
    return [...this.quizAttempts];
  }

  // --- Saturday Special ---
  public getSaturdaySpecials(): SaturdaySpecial[] {
    return [...this.saturdaySpecial].sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }

  public addSaturdaySpecial(session: Partial<SaturdaySpecial>): SaturdaySpecial {
    const newSession: SaturdaySpecial = {
      id: `sat-${Date.now()}`,
      title: session.title || 'Emerging Tech Session',
      category: session.category || 'Generative AI',
      description: session.description || '',
      speaker: session.speaker || 'Guest Specialist',
      speaker_role: session.speaker_role || 'Industry Expert',
      session_date: session.session_date || 'Saturday, 11:00 AM IST',
      cover_image: session.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      recording_url: session.recording_url,
      slides_url: session.slides_url,
      resources_url: session.resources_url,
      is_upcoming: session.is_upcoming ?? true,
      attendees_count: 0,
    };
    this.saturdaySpecial.unshift(newSession);
    this.saveToStorage('saturdaySpecial', this.saturdaySpecial);

    // Notify students
    this.getStudents().forEach(s => {
      this.createNotification({
        user_id: s.id,
        title: `Saturday Special: ${newSession.title}`,
        message: `New emerging technology session announced: ${newSession.category}.`,
        type: 'saturday',
        link: '/student/saturday-special',
      });
    });

    return newSession;
  }

  // --- Opportunities & Career ---
  public getOpportunities(): Opportunity[] {
    return [...this.opportunities];
  }

  public addOpportunity(opp: Partial<Opportunity>): Opportunity {
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: opp.title || 'New Opportunity',
      organization: opp.organization || 'Hiring Organization',
      category: opp.category || 'internship',
      description: opp.description || '',
      eligibility: opp.eligibility || 'Open to all students',
      required_skills: opp.required_skills || ['Programming', 'Problem Solving'],
      location: opp.location || 'Remote',
      is_remote: opp.is_remote ?? true,
      stipend_salary: opp.stipend_salary,
      deadline: opp.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      apply_url: opp.apply_url || 'https://skillnova.edu/careers',
      published_at: new Date().toISOString(),
      is_featured: opp.is_featured ?? true,
      bookmarked: false,
    };
    this.opportunities.unshift(newOpp);
    this.saveToStorage('opportunities', this.opportunities);

    this.getStudents().forEach(s => {
      this.createNotification({
        user_id: s.id,
        title: `New Opportunity: ${newOpp.organization}`,
        message: `${newOpp.title} is now open for applications.`,
        type: 'opportunity',
        link: '/student/opportunities',
      });
    });

    return newOpp;
  }

  public toggleBookmarkOpportunity(id: string) {
    this.opportunities = this.opportunities.map(o => {
      if (o.id === id) {
        return { ...o, bookmarked: !o.bookmarked };
      }
      return o;
    });
    this.saveToStorage('opportunities', this.opportunities);
  }

  // --- Career Blueprints ---
  public getCareerBlueprints(): CareerBlueprint[] {
    return [...this.blueprints];
  }

  public getBlueprintBySlug(slug: string): CareerBlueprint | undefined {
    return this.blueprints.find(b => b.slug === slug || b.id === slug);
  }

  public addCareerBlueprint(bp: CareerBlueprint) {
    this.blueprints.push(bp);
    this.saveToStorage('blueprints', this.blueprints);
  }

  // --- Notifications ---
  public getNotifications(userId?: string): Notification[] {
    if (userId) {
      return this.notifications.filter(n => n.user_id === userId || n.user_id === 'all');
    }
    return [...this.notifications];
  }

  public createNotification(n: Omit<Notification, 'id' | 'read' | 'created_at'>): Notification {
    const newNotif: Notification = {
      ...n,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    this.saveToStorage('notifications', this.notifications);
    return newNotif;
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    });
    this.saveToStorage('notifications', this.notifications);
  }

  public markAllNotificationsRead(userId: string) {
    this.notifications = this.notifications.map(n => {
      if (n.user_id === userId || n.user_id === 'all') {
        return { ...n, read: true };
      }
      return n;
    });
    this.saveToStorage('notifications', this.notifications);
  }

  // --- Additional Convenience Methods ---
  public getInterviewQuestions(): InterviewQuestion[] {
    return this.interviews;
  }

  public getTopics(courseId?: string): Topic[] {
    if (courseId) {
      return this.topics.filter(t => t.course_id === courseId);
    }
    return [...this.topics];
  }

  public getModules(courseId: string): CourseModule[] {
    return this.getModulesForCourse(courseId);
  }

  public getEnrolledCourses(studentId?: string): (Course & { progressPercentage: number })[] {
    const targetStudent = studentId ? this.users.find(u => u.id === studentId) : this.currentUser;
    const assignedIds = targetStudent?.assigned_courses || ['course-fs-101', 'course-ai-201'];
    return this.courses
      .filter(c => assignedIds.includes(c.id))
      .map(c => ({
        ...c,
        progressPercentage: c.id === 'course-fs-101' ? 68 : c.id === 'course-ai-201' ? 42 : 25,
      }));
  }

  public getResources(courseId?: string): any[] {
    const filteredTopics = courseId 
      ? this.topics.filter(t => t.course_id === courseId && t.is_published)
      : this.topics.filter(t => t.is_published);

    return filteredTopics.map(t => {
      const course = this.getCourseById(t.course_id);
      return {
        id: `res-${t.id}`,
        topicId: t.id,
        courseId: t.course_id,
        courseName: course?.title || 'SkillNova Course',
        topicTitle: t.title,
        description: t.description || 'Lecture materials, core concept notes, and class recordings.',
        publishedAt: t.class_date || 'Today',
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
      list = list.filter(q => q.topic_id === topicId);
    }
    return list;
  }

  public getSaturdaySpecialSessions(): SaturdaySpecial[] {
    return this.getSaturdaySpecials();
  }

  public publishSaturdaySpecial(data: any): SaturdaySpecial {
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

  public publishOpportunity(data: any): Opportunity {
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
    this.aiJobs = this.aiJobs.map(j => {
      if (j.id === jobId) {
        return { ...j, status: 'rejected', reviewed_at: new Date().toISOString() };
      }
      return j;
    });
    this.saveToStorage('aiJobs', this.aiJobs);
  }

  public generateAIContentFromDoc(courseId: string, topicId: string, docName: string, text: string) {
    return this.generateAIContentFromDocument(courseId, topicId, docName, text);
  }

  // --- Discussion Room & Community ---
  public getDiscussions(): DiscussionPost[] {
    return [...this.discussions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getDiscussionReplies(postId: string): DiscussionReply[] {
    return this.discussionReplies.filter(r => r.post_id === postId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public createDiscussionPost(post: Partial<DiscussionPost>): DiscussionPost {
    const newPost: DiscussionPost = {
      id: `disc-${Date.now()}`,
      author_id: post.author_id || this.currentUser?.id || 'usr-student-1',
      author_name: post.author_name || this.currentUser?.full_name || 'Student',
      author_role: post.author_role || this.currentUser?.role || 'student',
      author_avatar: post.author_avatar || this.currentUser?.avatar_url,
      author_batch: post.author_batch || this.currentUser?.year_of_study || 'Batch 2027',
      title: post.title || 'Untitled Discussion',
      content: post.content || '',
      category: post.category || 'general',
      tags: post.tags || ['General'],
      likes_count: 0,
      liked_by_user_ids: [],
      replies_count: 0,
      created_at: new Date().toISOString()
    };
    this.discussions.unshift(newPost);
    this.saveToStorage('discussions', this.discussions);
    return newPost;
  }

  public toggleLikeDiscussion(postId: string, userId: string): DiscussionPost | undefined {
    const post = this.discussions.find(p => p.id === postId);
    if (!post) return undefined;
    const hasLiked = post.liked_by_user_ids.includes(userId);
    if (hasLiked) {
      post.liked_by_user_ids = post.liked_by_user_ids.filter(id => id !== userId);
      post.likes_count = Math.max(0, post.likes_count - 1);
    } else {
      post.liked_by_user_ids.push(userId);
      post.likes_count += 1;
    }
    this.saveToStorage('discussions', this.discussions);
    return post;
  }

  public addDiscussionReply(reply: Partial<DiscussionReply>): DiscussionReply {
    const newReply: DiscussionReply = {
      id: `rep-${Date.now()}`,
      post_id: reply.post_id || '',
      author_id: reply.author_id || this.currentUser?.id || 'usr-student-1',
      author_name: reply.author_name || this.currentUser?.full_name || 'Member',
      author_role: reply.author_role || this.currentUser?.role || 'student',
      author_avatar: reply.author_avatar || this.currentUser?.avatar_url,
      content: reply.content || '',
      created_at: new Date().toISOString()
    };
    this.discussionReplies.push(newReply);
    const post = this.discussions.find(p => p.id === reply.post_id);
    if (post) {
      post.replies_count = (post.replies_count || 0) + 1;
      this.saveToStorage('discussions', this.discussions);
    }
    this.saveToStorage('discussionReplies', this.discussionReplies);
    return newReply;
  }

  // --- Request a Mentor (Private Channel) ---
  public getMentorRequests(studentId?: string): MentorRequest[] {
    if (studentId) {
      return this.mentorRequests.filter(r => r.student_id === studentId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.mentorRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createMentorRequest(req: Partial<MentorRequest>): MentorRequest {
    const newReq: MentorRequest = {
      id: `mreq-${Date.now()}`,
      student_id: req.student_id || this.currentUser?.id || 'usr-student-1',
      student_name: req.student_name || this.currentUser?.full_name || 'Student',
      student_email: req.student_email || this.currentUser?.email || 'student@skillnova.edu',
      course_id: req.course_id || 'course-fs-101',
      course_title: req.course_title || 'General Course',
      topic_title: req.topic_title || 'General Doubt',
      assigned_mentor_name: req.assigned_mentor_name || 'Lead Faculty Mentor',
      doubt_title: req.doubt_title || 'Technical Inquiry',
      doubt_description: req.doubt_description || '',
      code_snippet: req.code_snippet,
      status: 'pending',
      priority: req.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: []
    };
    this.mentorRequests.unshift(newReq);
    this.saveToStorage('mentorRequests', this.mentorRequests);

    this.createNotification({
      user_id: 'usr-admin-1',
      title: `New Mentor Request: ${newReq.doubt_title}`,
      message: `${newReq.student_name} submitted a private doubt in ${newReq.course_title}.`,
      type: 'system',
      link: '/admin/discussions'
    });

    return newReq;
  }

  public addMentorRequestReply(reply: Partial<MentorRequestReply>): MentorRequest | undefined {
    const req = this.mentorRequests.find(r => r.id === reply.request_id);
    if (!req) return undefined;

    const newReply: MentorRequestReply = {
      id: `mrep-${Date.now()}`,
      request_id: reply.request_id || '',
      author_id: reply.author_id || this.currentUser?.id || 'usr-mentor-1',
      author_name: reply.author_name || this.currentUser?.full_name || 'Faculty Mentor',
      author_role: reply.author_role || this.currentUser?.role || 'sub_admin',
      content: reply.content || '',
      created_at: new Date().toISOString()
    };
    req.replies.push(newReply);
    req.updated_at = new Date().toISOString();
    if (newReply.author_role !== 'student' && req.status === 'pending') {
      req.status = 'in_progress';
    }
    this.saveToStorage('mentorRequests', this.mentorRequests);

    if (newReply.author_role !== 'student') {
      this.createNotification({
        user_id: req.student_id,
        title: `Mentor Replied to your Doubt`,
        message: `${newReply.author_name} responded to "${req.doubt_title}".`,
        type: 'system',
        link: '/student/discussion'
      });
    }

    return req;
  }

  public updateMentorRequestStatus(requestId: string, status: MentorRequest['status']): MentorRequest | undefined {
    const req = this.mentorRequests.find(r => r.id === requestId);
    if (!req) return undefined;
    req.status = status;
    req.updated_at = new Date().toISOString();
    this.saveToStorage('mentorRequests', this.mentorRequests);
    return req;
  }
}

export const dataService = new DataService();
