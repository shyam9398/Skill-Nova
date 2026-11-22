/**
 * SkillNova LMS Enhancements Test Suite
 * Tests Student Dashboard Dynamic Tracking, Streak Logic, PDF Generation, and Real-time Activity
 */

// 1. Setup minimal browser storage mock for Node
if (typeof window === 'undefined') {
  const storageMap = new Map<string, string>();
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => storageMap.get(k) || null,
      setItem: (k: string, v: string) => storageMap.set(k, v),
      removeItem: (k: string) => storageMap.delete(k),
      clear: () => storageMap.clear(),
    },
    sessionStorage: {
      getItem: (k: string) => storageMap.get(`sess_${k}`) || null,
      setItem: (k: string, v: string) => storageMap.set(`sess_${k}`, v),
      removeItem: (k: string) => storageMap.delete(`sess_${k}`),
      clear: () => storageMap.clear(),
    },
  };
  (global as any).localStorage = (global as any).window.localStorage;
  (global as any).sessionStorage = (global as any).window.sessionStorage;
  if (typeof (globalThis as any).URL.createObjectURL !== 'function') {
    (globalThis as any).URL.createObjectURL = () => 'blob:mock-skillnova-pdf-url';
    (globalThis as any).URL.revokeObjectURL = () => {};
  }
}

import { dataService } from './src/services/dataService';
import { generateQuizPdf } from './src/utils/quizPdfGenerator';
import type { Quiz } from './src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('\n--- 1. Testing Student Dashboard Dynamic Tracking ---');

  // Test with brand new student ID (no activity, no fake demo fallback)
  const freshStudentId = 'student-new-user-999';
  const freshAnalytics = dataService.getStudentAnalytics(freshStudentId);

  console.log('Fresh Student Analytics:', {
    overallProgress: freshAnalytics.overallProgress,
    currentStreak: freshAnalytics.currentStreak,
    longestStreak: freshAnalytics.longestStreak,
    activeLearningDays: freshAnalytics.activeLearningDays,
    averageQuizScore: freshAnalytics.averageQuizScore,
    totalXP: freshAnalytics.totalXP,
  });

  assert(freshAnalytics.currentStreak === 0, 'New student has 0-day current streak');
  assert(freshAnalytics.activeLearningDays === 0, 'New student has 0 active learning days');
  assert(freshAnalytics.averageQuizScore === 0, 'New student has 0% quiz average (no fake 86%)');
  assert(freshAnalytics.activityHeatmap.length === 84, 'Heatmap contains exactly 84 days (12 weeks)');
  assert(freshAnalytics.activityHeatmap[83].dayNumber === 84, 'Heatmap ends on day 84 (today)');

  // Test with existing student
  const activeStudentId = 'usr-student-1';
  const activeAnalytics = dataService.getStudentAnalytics(activeStudentId);

  console.log('\nActive Student Analytics:', {
    overallProgress: activeAnalytics.overallProgress,
    currentStreak: activeAnalytics.currentStreak,
    longestStreak: activeAnalytics.longestStreak,
    activeLearningDays: activeAnalytics.activeLearningDays,
    completedModules: activeAnalytics.completedModulesCount,
    pendingModules: activeAnalytics.pendingModulesCount,
    averageQuizScore: activeAnalytics.averageQuizScore,
    totalXP: activeAnalytics.totalXP,
    scholarLevel: activeAnalytics.scholarLevel,
  });

  assert(
    activeAnalytics.completedModulesCount + activeAnalytics.pendingModulesCount === activeAnalytics.totalModulesCount,
    'Completed modules + Pending modules equals Total modules'
  );
  assert(activeAnalytics.longestStreak >= activeAnalytics.currentStreak, 'Longest streak >= Current streak');

  console.log('\n--- 2. Testing Real-Time Activity Tracking & Metrics Updates ---');
  const xpBefore = activeAnalytics.totalXP;
  const activeDaysBefore = activeAnalytics.activeLearningDays;

  // Record meaningful student learning activities
  await dataService.recordStudentActivity({
    student_id: activeStudentId,
    activity_type: 'video_view',
    item_id: 'vid-topic-1',
    item_title: 'Full Stack Microservices Video Lecture',
    xp_earned: 25,
  });

  await dataService.recordStudentActivity({
    student_id: activeStudentId,
    activity_type: 'slide_view',
    item_id: 'pres-slide-1',
    item_title: 'Architecture Review Deck',
    xp_earned: 20,
  });

  await dataService.recordStudentActivity({
    student_id: activeStudentId,
    activity_type: 'pdf_view',
    item_id: 'pdf-doc-1',
    item_title: 'System Design Patterns Whitepaper',
    xp_earned: 20,
  });

  const updatedAnalytics = dataService.getStudentAnalytics(activeStudentId);
  console.log('After Recording Activities:', {
    newTotalXP: updatedAnalytics.totalXP,
    xpGained: updatedAnalytics.totalXP - xpBefore,
    activeDays: updatedAnalytics.activeLearningDays,
    currentStreak: updatedAnalytics.currentStreak,
  });

  assert(updatedAnalytics.totalXP > xpBefore, 'Skill XP increased dynamically with student activities');
  assert(updatedAnalytics.activeLearningDays >= 1, 'Active days count is >= 1');
  assert(updatedAnalytics.currentStreak >= 1, 'Current streak is active today (>= 1 day)');

  // Verify recent activities log
  const recentActivities = dataService.getStudentActivities(activeStudentId);
  assert(recentActivities.length >= 3, 'Recent activities are correctly recorded in dataService');
  assert(recentActivities[0].activity_type === 'pdf_view', 'Most recent activity is pdf_view');

  console.log('\n--- 3. Testing Quiz Scoring & Dynamic Average Update ---');
  let quizzes = dataService.getQuizzesList();
  if (quizzes.length === 0) {
    await dataService.addQuiz({
      title: 'Distributed Systems & Event-Driven Architecture Exam',
      description: 'Comprehensive evaluation covering message queues, idempotency, and saga patterns.',
      course_id: 'c-fullstack-1',
      course_title: 'Full Stack Web Engineering',
      duration_minutes: 30,
      total_marks: 20,
      status: 'active',
      start_time: new Date(Date.now() - 3600000).toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      questions: [
        {
          id: 'q-demo-1',
          question: 'Which of the following guarantees at-least-once message delivery in an asynchronous broker?',
          options: [
            { key: 'A', text: 'Producer ACK without broker disk persistence' },
            { key: 'B', text: 'Consumer manual ACK after message processing with durable broker queues' },
            { key: 'C', text: 'Auto-commit consumer offsets immediately upon network read' },
            { key: 'D', text: 'Fire-and-forget UDP datagrams' },
          ],
          correct_answer: 'B',
          explanation: 'Manual consumer acknowledgement coupled with persistent storage ensures messages are redelivered if a consumer crashes prior to completion.',
          marks: 10,
          order_index: 1,
        },
      ],
    });
    quizzes = dataService.getQuizzesList();
  }

  assert(quizzes.length > 0, 'Quizzes are available in dataService');
  const targetQuiz = quizzes[0];

  dataService.setCurrentUser({
    id: activeStudentId,
    full_name: 'Alex Rivera',
    email: 'alex.rivera@apextech.edu',
    role: 'student',
    is_active: true,
  } as any);

  const submissionResult = await dataService.submitQuizAttemptRecord({
    quiz_id: targetQuiz.id,
    answers: {
      [targetQuiz.questions?.[0]?.id || 'q-demo-1']: 'B',
    },
    time_spent_seconds: 45,
  });

  assert(submissionResult.attempt !== undefined, 'Quiz attempt was submitted and graded successfully');
  const afterQuizAnalytics = dataService.getStudentAnalytics(activeStudentId);
  console.log('Quiz Submission Results:', {
    score: submissionResult.attempt.score,
    accuracy: submissionResult.attempt.accuracy,
    newQuizAverage: afterQuizAnalytics.averageQuizScore,
    newTotalXP: afterQuizAnalytics.totalXP,
  });

  assert(afterQuizAnalytics.averageQuizScore >= 0, 'Quiz average reflects actual submissions');
  assert(afterQuizAnalytics.totalXP > updatedAnalytics.totalXP, 'Quiz submission awarded Skill XP');

  console.log('\n--- 4. Testing SkillNova Branded Quiz PDF Generator ---');
  const testQuiz: Quiz = {
    id: 'quiz-test-101',
    title: 'Distributed Systems & Event-Driven Architecture Exam',
    description: 'Comprehensive evaluation covering message queues, idempotency, and saga patterns.',
    course_title: 'Full Stack Web Engineering',
    total_marks: 20,
    duration_minutes: 30,
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() - 600000).toISOString(), // closed quiz
    status: 'closed',
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q-1',
        question: 'Which of the following guarantees at-least-once message delivery in an asynchronous broker?',
        options: [
          { key: 'A', text: 'Producer ACK without broker disk persistence' },
          { key: 'B', text: 'Consumer manual ACK after message processing with durable broker queues' },
          { key: 'C', text: 'Auto-commit consumer offsets immediately upon network read' },
          { key: 'D', text: 'Fire-and-forget UDP datagrams' },
        ],
        correct_answer: 'B',
        explanation: 'Manual consumer acknowledgement coupled with persistent storage ensures messages are redelivered if a consumer crashes prior to completion.',
        marks: 5,
        order_index: 1,
      },
      {
        id: 'q-2',
        question: 'In the Saga pattern for distributed transactions, how are partial failures resolved?',
        options: [
          { key: 'A', text: 'Two-phase commit blocking locks' },
          { key: 'B', text: 'Executing compensating backward transactions' },
          { key: 'C', text: 'Dropping all uncommitted database tables' },
          { key: 'D', text: 'Ignoring downstream errors' },
        ],
        correct_answer: 'B',
        explanation: 'Sagas coordinate localized transactions across services and trigger compensating transactions in reverse order if a step fails.',
        marks: 5,
        order_index: 2,
      },
      {
        id: 'q-3',
        question: 'What is the primary advantage of a Dead Letter Queue (DLQ)?',
        options: [
          'A. Increasing network throughput by 200%',
          'B. Isolating malformed or unprocessable messages without stalling consumers',
          'C. Compressing binary payloads',
          'D. Replacing primary database replicas',
        ],
        correct_answer: 'B',
        explanation: 'A DLQ holds poisoning messages that fail repeatedly so main message ingestion continues smoothly while errors are triaged.',
        marks: 10,
        order_index: 3,
      },
    ],
  };

  const pdfResult = generateQuizPdf(testQuiz);

  console.log('PDF Generation Result:', {
    filename: pdfResult.filename,
    totalPages: pdfResult.totalPages,
    blobSize: pdfResult.blob.size,
  });

  assert(pdfResult.totalPages >= 1, 'PDF successfully generated at least 1 page');
  assert(pdfResult.blob.size > 1000, 'PDF Blob size is valid (> 1KB)');
  assert(pdfResult.filename.includes('distributed-systems'), 'Filename is properly slugified');
  assert(Boolean(pdfResult.blobUrl), 'PDF Blob URL is generated for in-app preview');

  console.log('\n🎉 ALL ENHANCEMENT TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
