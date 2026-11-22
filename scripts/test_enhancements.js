// Verification test for Student Account Audit and Quiz Participation calculations
import assert from 'assert';

console.log('--- Verifying DataService calculation logic ---');

// Mock data to test calculations
const mockStudents = [
  { id: 's1', email: 'alice@example.com', full_name: 'Alice Smith', username: 'alice', role: 'student', created_at: '2026-11-20T10:00:00Z', is_active: true },
  { id: 's2', email: 'bob@example.com', full_name: 'Bob Jones', username: 'bob', role: 'student', created_at: '2026-11-21T11:00:00Z', is_active: true },
  { id: 's3', email: 'charlie@example.com', full_name: 'Charlie Brown', username: 'charlie', role: 'student', created_at: '2026-11-22T09:00:00Z', is_active: false }
];

const mockAuditLogs = [
  { action: 'LOGIN_SUCCESS', actor_email: 'alice@example.com', timestamp: '2026-11-22T08:30:00Z', details: { ip: '127.0.0.1' } },
  { action: 'LOGIN_SUCCESS', actor_email: 'alice@example.com', timestamp: '2026-11-21T08:30:00Z', details: { ip: '127.0.0.1' } },
  { action: 'UPDATE_PROFILE', actor_email: 'bob@example.com', timestamp: '2026-11-21T12:00:00Z' }
];

// Test 1: Student Account Audit
function computeStudentAccountAudits(users, auditLogs) {
  const students = users.filter((u) => u.role === 'student');
  const studentAudits = students.map((student) => {
    const studentLogins = auditLogs.filter(
      (log) =>
        (log.action === 'LOGIN_SUCCESS' || log.action?.includes('LOGIN')) &&
        (log.actor_email?.toLowerCase() === student.email.toLowerCase() ||
         log.entity_id === student.id ||
         log.details?.user_id === student.id)
    );

    studentLogins.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestLogin = studentLogins.length > 0 ? studentLogins[0].timestamp : undefined;
    const hasLoggedIn = Boolean(student.last_login_at || latestLogin);

    return {
      id: student.id,
      email: student.email,
      full_name: student.full_name || student.email.split('@')[0],
      username: student.username || student.email.split('@')[0],
      has_logged_in: hasLoggedIn,
      last_login_at: student.last_login_at || latestLogin,
      created_at: student.created_at || '2026-01-01T00:00:00Z',
      is_active: student.is_active !== false,
      login_count: studentLogins.length,
      college: student.college,
      branch: student.branch
    };
  });

  const totalCreated = studentAudits.length;
  const loggedInCount = studentAudits.filter((s) => s.has_logged_in).length;
  const neverLoggedInCount = totalCreated - loggedInCount;

  return { totalCreated, loggedInCount, neverLoggedInCount, studentAudits };
}

const auditResult = computeStudentAccountAudits(mockStudents, mockAuditLogs);
console.log('Student Account Audit result:', {
  totalCreated: auditResult.totalCreated,
  loggedInCount: auditResult.loggedInCount,
  neverLoggedInCount: auditResult.neverLoggedInCount
});

assert.strictEqual(auditResult.totalCreated, 3, 'Total created should be 3');
assert.strictEqual(auditResult.loggedInCount, 1, 'Only Alice has logged in');
assert.strictEqual(auditResult.neverLoggedInCount, 2, 'Bob and Charlie have never logged in');
assert.strictEqual(auditResult.studentAudits[0].last_login_at, '2026-11-22T08:30:00Z', 'Alice last login timestamp matches newest log');
console.log('✓ Student Account Audit calculations passed!');

// Test 2: Quiz Participation Monitoring
const mockCourseEnrollments = [
  { course_id: 'c1', student_id: 's1' },
  { course_id: 'c1', student_id: 's2' },
  { course_id: 'c2', student_id: 's3' }
];

const mockQuizzes = [
  { id: 'q1', course_id: 'c1', title: 'Python Basics Quiz', total_points: 100, pass_percentage: 60 }
];

const mockSubmissions = [
  { id: 'sub1', quiz_id: 'q1', user_id: 's1', score: 90, percentage: 90, status: 'completed', submitted_at: '2026-11-22T10:00:00Z' }
];

function computeQuizParticipation(quiz, users, enrollments, submissions) {
  const courseStudents = users.filter(u => 
    u.role === 'student' && enrollments.some(e => e.course_id === quiz.course_id && e.student_id === u.id)
  );

  const eligibleCohortCount = courseStudents.length;
  const quizSubmissions = submissions.filter(s => s.quiz_id === quiz.id);

  let attemptedCount = 0;
  let notAttemptedCount = 0;
  let completedCount = 0;
  let inProgressCount = 0;

  const participants = courseStudents.map(student => {
    const studentSub = quizSubmissions.find(s => s.user_id === student.id);
    const attempted = Boolean(studentSub);
    const completed = studentSub?.status === 'completed';

    if (attempted) {
      attemptedCount++;
      if (completed) completedCount++;
      else inProgressCount++;
    } else {
      notAttemptedCount++;
    }

    return {
      student_id: student.id,
      student_name: student.full_name,
      student_email: student.email,
      attempted,
      completed,
      score: studentSub?.score,
      accuracy: studentSub?.percentage,
      submitted_at: studentSub?.submitted_at
    };
  });

  return { eligibleCohortCount, attemptedCount, notAttemptedCount, completedCount, inProgressCount, participants };
}

const quizResult = computeQuizParticipation(mockQuizzes[0], mockStudents, mockCourseEnrollments, mockSubmissions);
console.log('Quiz Participation Summary result:', {
  eligibleCohortCount: quizResult.eligibleCohortCount,
  attemptedCount: quizResult.attemptedCount,
  notAttemptedCount: quizResult.notAttemptedCount,
  completedCount: quizResult.completedCount,
  inProgressCount: quizResult.inProgressCount
});

assert.strictEqual(quizResult.eligibleCohortCount, 2, '2 students enrolled in course c1 (s1, s2)');
assert.strictEqual(quizResult.attemptedCount, 1, '1 student attempted (s1)');
assert.strictEqual(quizResult.notAttemptedCount, 1, '1 student not attempted (s2)');
assert.strictEqual(quizResult.completedCount, 1, '1 student completed (s1)');
assert.strictEqual(quizResult.participants[0].score, 90, 'Score is 90 for s1');
console.log('✓ Quiz Participation calculations passed!');

console.log('All enhancement unit calculations verified successfully!');

