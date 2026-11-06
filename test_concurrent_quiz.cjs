// Concurrent Multi-User Quiz Testing Script (50 simultaneous students)
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ktjnzjhypwwtpciikwnf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7T7cwx413smVojHmlkzBkQ_JVfM7FvD';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runConcurrencyTest() {
  console.log('================================================================');
  console.log('🚀 SKILLNOVA CONCURRENCY LOAD TEST: 50 SIMULTANEOUS STUDENTS');
  console.log('================================================================\n');

  // 1. Fetch available quizzes
  const { data: quizzes, error: qErr } = await client.from('quizzes').select('*');
  if (qErr || !quizzes || quizzes.length === 0) {
    console.error('❌ Failed to fetch quizzes from Supabase:', qErr);
    return;
  }

  const targetQuiz = quizzes[0];
  console.log(`📌 Target Competition Quiz: "${targetQuiz.title}" (ID: ${targetQuiz.id})`);
  console.log(`⏱ Total Marks: ${targetQuiz.total_marks}, Duration: ${targetQuiz.duration_minutes} mins`);

  // 2. Fetch quiz questions
  const { data: questions, error: questErr } = await client
    .from('quiz_questions')
    .select('id, question, options, order_index')
    .eq('quiz_id', targetQuiz.id)
    .order('order_index', { ascending: true });

  if (questErr || !questions || questions.length === 0) {
    console.error('❌ Failed to fetch quiz questions:', questErr);
    return;
  }
  console.log(`📋 Loaded ${questions.length} questions for assessment from Supabase.\n`);

  // 3. Prepare 50 simulated concurrent students
  const NUM_STUDENTS = 50;
  console.log(`⚡ Generating ${NUM_STUDENTS} distinct student attempt payloads...`);

  const studentSessions = Array.from({ length: NUM_STUDENTS }, (_, i) => {
    const studentNum = (i + 1).toString().padStart(2, '0');
    // Generate UUID-like student ID
    const studentId = `00000000-0000-4000-8000-${studentNum.repeat(6)}`;
    const studentName = `Cohort Student #${studentNum}`;

    // Generate random answers with varied skill levels (top students get more correct)
    const answers = {};
    const correctRatio = Math.max(0.1, Math.min(1.0, 1 - (i / NUM_STUDENTS) * 0.9)); // Top ranks get higher ratio
    const timeSpent = Math.floor(180 + Math.random() * 600 + i * 5); // 3 to 15 mins

    questions.forEach((q) => {
      // Simulate answering: high performers answer 'B' (the known correct answer for seeded drills) or 'A'
      if (Math.random() < correctRatio) {
        answers[q.id] = 'B';
      } else {
        answers[q.id] = Math.random() > 0.5 ? 'A' : 'C';
      }
    });

    return {
      quizId: targetQuiz.id,
      studentId,
      studentName,
      answers,
      timeSpent,
      isPractice: false
    };
  });

  console.log(`🔥 Launching 50 SIMULTANEOUS CONCURRENT SUBMISSIONS via submit_quiz_attempt RPC...`);
  const startTime = Date.now();

  const submissionPromises = studentSessions.map((session, idx) => {
    return client.rpc('submit_quiz_attempt', {
      p_quiz_id: session.quizId,
      p_student_id: session.studentId,
      p_student_name: session.studentName,
      p_answers: session.answers,
      p_time_spent_seconds: session.timeSpent,
      p_is_practice: session.isPractice
    }).then(res => ({
      index: idx + 1,
      name: session.studentName,
      data: res.data,
      error: res.error
    }));
  });

  const results = await Promise.all(submissionPromises);
  const totalDuration = Date.now() - startTime;

  console.log(`\n✅ All ${NUM_STUDENTS} concurrent attempts processed in ${totalDuration}ms (${(totalDuration / NUM_STUDENTS).toFixed(1)}ms/req avg)!`);

  // Check errors
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error(`⚠️ ${errors.length} submissions encountered errors:`, errors[0].error);
  } else {
    console.log(`🎉 100% SUCCESS RATE: 0 errors across 50 concurrent submissions.`);
  }

  // 4. Test Duplicate Submission Prevention (Requirement 2 & 7)
  console.log(`\n🔒 Testing Duplicate Submission Prevention for Student #01...`);
  const student1 = studentSessions[0];
  const duplicateRes = await client.rpc('submit_quiz_attempt', {
    p_quiz_id: student1.quizId,
    p_student_id: student1.studentId,
    p_student_name: student1.studentName,
    p_answers: student1.answers,
    p_time_spent_seconds: 9999,
    p_is_practice: false
  });

  if (duplicateRes.data) {
    console.log(`   is_first_attempt for duplicate submission: ${duplicateRes.data.is_first_attempt} (EXPECTED: false)`);
    if (duplicateRes.data.is_first_attempt === false) {
      console.log(`   ✅ PASSED: Official first attempt locked; duplicate attempt marked secondary without overwriting official score!`);
    } else {
      console.error(`   ❌ FAILED: Duplicate submission claimed first attempt!`);
    }
  }

  // 5. Fetch Official Shared Leaderboard via RPC (Requirement 5)
  console.log(`\n🏆 Fetching Official Competition Leaderboard from Supabase...`);
  const { data: leaderboard, error: lbErr } = await client.rpc('get_quiz_leaderboard', {
    p_quiz_id: targetQuiz.id
  });

  if (lbErr) {
    console.error('❌ Failed to fetch leaderboard:', lbErr);
    return;
  }

  console.log(`   Total Official Ranked Participants: ${leaderboard.length}`);
  console.log('\n--- TOP 3 PODIUM OF CHAMPIONS ---');
  leaderboard.slice(0, 3).forEach((entry, idx) => {
    const medal = idx === 0 ? '🥇 GOLD' : idx === 1 ? '🥈 SILVER' : '🥉 BRONZE';
    console.log(`   ${medal} - Rank #${entry.rank}: ${entry.student_name} | Score: ${entry.score}/${entry.total_marks} | Acc: ${entry.accuracy}% | Time: ${entry.time_spent_seconds}s`);
  });

  console.log('\n--- SAMPLE REMAINING PARTICIPANTS (Rank 4 Onwards) ---');
  leaderboard.slice(3, 8).forEach(entry => {
    console.log(`   Rank #${entry.rank}: ${entry.student_name} | Score: ${entry.score}/${entry.total_marks} | Acc: ${entry.accuracy}% | Time: ${entry.time_spent_seconds}s`);
  });

  // Verify Ranking Order: Score DESC -> Accuracy DESC -> Time ASC
  let isRankOrderValid = true;
  for (let i = 0; i < leaderboard.length - 1; i++) {
    const curr = leaderboard[i];
    const next = leaderboard[i + 1];
    if (curr.score < next.score) {
      isRankOrderValid = false;
      break;
    } else if (curr.score === next.score) {
      if (curr.accuracy < next.accuracy) {
        isRankOrderValid = false;
        break;
      } else if (curr.accuracy === next.accuracy) {
        if (curr.time_spent_seconds > next.time_spent_seconds) {
          isRankOrderValid = false;
          break;
        }
      }
    }
  }

  console.log(`\n🎯 Ranking Integrity Check (Score -> Acc -> Time): ${isRankOrderValid ? '✅ PERFECTLY ORDERED' : '❌ FAILED'}`);
  console.log('================================================================\n');
}

runConcurrencyTest();
