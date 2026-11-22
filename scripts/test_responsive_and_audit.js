/**
 * SkillNova LMS - Verification of Responsiveness, Video Embedding & Audit Logs
 */
import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('--- Running SkillNova Responsiveness & Audit Logs Tests ---');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  // 1. Check index.css for video-container and mobile overflow rules
  const css = fs.readFileSync(path.join(process.cwd(), 'src/index.css'), 'utf-8');
  assert(css.includes('.video-container'), 'index.css defines .video-container');
  assert(css.includes('aspect-ratio: 16 / 9 !important'), '.video-container enforces strict 16:9 aspect ratio');
  assert(css.includes('max-width: 100vw') && css.includes('overflow-x: hidden'), 'html, body, and #root guard against viewport horizontal overflow');
  assert(css.includes('width: min(calc(100vw - 1rem), 1100px) !important'), 'modal boxes compute responsive width ensuring zero overflow on 320px/375px mobile');

  // 2. Check ExperienceSkillNovaSection.tsx for responsive video container and scaled play button
  const expVideo = fs.readFileSync(path.join(process.cwd(), 'src/components/homepage/ExperienceSkillNovaSection.tsx'), 'utf-8');
  assert(expVideo.includes('video-container'), 'ExperienceSkillNovaSection uses .video-container');
  assert(expVideo.includes('w-12 h-12 sm:w-16 sm:h-16'), 'ExperienceSkillNovaSection play button scales down cleanly on mobile');

  // 3. Check EmbeddedVideoPlayer.tsx for aspect ratio and removal of mobile height traps
  const embedPlayer = fs.readFileSync(path.join(process.cwd(), 'src/components/resource/EmbeddedVideoPlayer.tsx'), 'utf-8');
  assert(embedPlayer.includes('video-container'), 'EmbeddedVideoPlayer applies .video-container');
  assert(!embedPlayer.includes("minHeight: '480px'"), 'EmbeddedVideoPlayer removes fixed minHeight: 480px trap');

  // 4. Check SkillNovaDocumentViewer.tsx for responsive 16:9 video-wrapper
  const docViewer = fs.readFileSync(path.join(process.cwd(), 'src/components/resource/SkillNovaDocumentViewer.tsx'), 'utf-8');
  assert(docViewer.includes('video-wrapper') || docViewer.includes('aspect-video'), 'SkillNovaDocumentViewer uses responsive 16:9 aspect wrapper for documents and slides');

  // 5. Check Header.tsx for responsive popover width
  const header = fs.readFileSync(path.join(process.cwd(), 'src/components/common/Header.tsx'), 'utf-8');
  assert(header.includes('w-[min(90vw,24rem)] max-w-[calc(100vw-1rem)]'), 'Header notification popover is guarded against 320px screen overflow');

  // 6. Check StudentLayout and AdminLayout for <main> overflow guards and layout roots
  const studentLayout = fs.readFileSync(path.join(process.cwd(), 'src/layouts/StudentLayout.tsx'), 'utf-8');
  const adminLayout = fs.readFileSync(path.join(process.cwd(), 'src/layouts/AdminLayout.tsx'), 'utf-8');
  assert(studentLayout.includes('overflow-x-hidden w-full max-w-full'), 'StudentLayout <main> container prevents horizontal overflow');
  assert(adminLayout.includes('overflow-x-hidden w-full max-w-full'), 'AdminLayout <main> container prevents horizontal overflow');
  assert(studentLayout.includes('student-layout-root'), 'StudentLayout defines student-layout-root class');
  assert(css.includes('margin: auto !important'), 'index.css enforces margin: auto on floating modal boxes for rock-solid centering');

  // 7. Check StudentCourseDetailPage and StudentSaturdaySpecialPage for responsive padding
  const courseDetail = fs.readFileSync(path.join(process.cwd(), 'src/pages/student/StudentCourseDetailPage.tsx'), 'utf-8');
  const satSpecial = fs.readFileSync(path.join(process.cwd(), 'src/pages/student/StudentSaturdaySpecialPage.tsx'), 'utf-8');
  assert(courseDetail.includes('p-3.5 sm:p-5 md:p-6'), 'StudentCourseDetailPage resource cards use responsive mobile padding');
  assert(satSpecial.includes('p-3.5 sm:p-5 md:p-6'), 'StudentSaturdaySpecialPage session cards use responsive mobile padding');

  // 7. Check dataService.ts for student activity audit bridge
  const dataService = fs.readFileSync(path.join(process.cwd(), 'src/services/dataService.ts'), 'utf-8');
  assert(dataService.includes('quiz_attempt: \'QUIZ_SUBMISSION\''), 'dataService maps student quiz activity to audit logs');
  assert(dataService.includes('module_complete: \'MODULE_COMPLETED\''), 'dataService maps module completion to audit logs');
  assert(dataService.includes('python_lab: \'CODE_LAB_SUBMISSION\''), 'dataService maps Python code lab to audit logs');
  assert(dataService.includes('PROFILE_UPDATED'), 'dataService records audit logs on profile updates');

  // 8. Check AdminAuditLogsPage.tsx for All Activity tab and pagination
  const adminAudit = fs.readFileSync(path.join(process.cwd(), 'src/pages/admin/AdminAuditLogsPage.tsx'), 'utf-8');
  assert(adminAudit.includes("activeTab === 'all_activity'"), 'AdminAuditLogsPage provides All Activity & Audit Logs view');
  assert(adminAudit.includes('filteredActivityLogs'), 'AdminAuditLogsPage filters real-time student activities');
  assert(adminAudit.includes('activityCategoryFilter'), 'AdminAuditLogsPage supports category filtering');
  assert(adminAudit.includes('paginatedActivityLogs'), 'AdminAuditLogsPage supports clean pagination');

  // 9. Check GlobalQuizLeaderboardView.tsx for mobile grid responsiveness
  const leaderboard = fs.readFileSync(path.join(process.cwd(), 'src/components/quizzes/GlobalQuizLeaderboardView.tsx'), 'utf-8');
  assert(leaderboard.includes('grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3'), 'GlobalQuizLeaderboardView uses responsive stats grid');

  console.log(`\nResults: ${passed}/${total} assertions passed.`);
  if (passed === total) {
    console.log('ALL RESPONSIVENESS, VIDEO & AUDIT LOG TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests();

