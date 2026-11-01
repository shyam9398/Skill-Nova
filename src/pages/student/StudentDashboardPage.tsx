import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Video, FileText, Sparkles, MessageSquare, Rocket,
  ArrowRight, CheckCircle2, Clock, User, Compass, Award, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const studentId = currentUser?.id || '';

  // Retrieve ONLY courses assigned to this logged-in student per Section 6
  const enrolledCourses = currentUser
    ? dataService.getEnrolledCoursesForStudent(studentId)
    : [];

  const topics = dataService.getTopics();
  const attempts = dataService.getQuizAttempts();

  // Calculate actual statistics from student records
  const totalEnrolled = enrolledCourses.length;
  const courseIds = enrolledCourses.map(c => c.id);
  const relevantTopics = topics.filter(t => courseIds.includes(t.course_id));
  const completedLessonsCount = attempts.length; // Lessons where quizzes were completed
  const pendingLessonsCount = Math.max(0, relevantTopics.length - completedLessonsCount);
  const averageProgress = totalEnrolled > 0
    ? Math.round(Math.min(100, (completedLessonsCount / Math.max(1, relevantTopics.length)) * 100))
    : 0;

  const recentlyAccessedCourse = enrolledCourses[0] || null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* 1. Welcome Section */}
      <div className="rounded-3xl bg-white border border-[#DFE9F6] p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 font-mono">
              {currentUser?.year_of_study || 'Batch 2027'} • {currentUser?.branch || 'Computer Science'}
            </span>
            <span className="text-xs text-[#73839B] font-mono">ID: {currentUser?.id || 'SN-STU-01'}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#15243B]">
            Welcome back, <span className="text-[#176BFF]">{currentUser?.full_name || 'Student'}</span>!
          </h1>
          <p className="text-xs md:text-sm text-[#73839B] leading-relaxed">
            Welcome to your structured engineering workspace. You have {enrolledCourses.length} active course enrollments with real-time class recordings and document notes available.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser?.full_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00A3FF]/30 shadow-md"
          />
        </div>
      </div>

      {/* 2. Learning Analysis Cards (Actual Student Records) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#DFE9F6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#73839B]">
            <span>Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-[#176BFF]" />
          </div>
          <div className="text-2xl font-black text-[#15243B]">{totalEnrolled}</div>
          <div className="text-[11px] text-[#73839B]">Assigned by Administrator</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DFE9F6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#73839B]">
            <span>Completed Lessons</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-[#15243B]">{completedLessonsCount}</div>
          <div className="text-[11px] text-[#73839B]">Quizzes attempted</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DFE9F6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#73839B]">
            <span>Pending Lessons</span>
            <Clock className="w-4 h-4 text-[#00A3FF]" />
          </div>
          <div className="text-2xl font-black text-[#15243B]">{pendingLessonsCount}</div>
          <div className="text-[11px] text-[#73839B]">In active syllabus</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DFE9F6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#73839B]">
            <span>Overall Progress</span>
            <Sparkles className="w-4 h-4 text-[#176BFF]" />
          </div>
          <div className="text-2xl font-black text-[#176BFF]">{averageProgress}%</div>
          <div className="w-full h-1.5 rounded-full bg-[#DFE9F6] overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#176BFF] to-[#00A3FF] rounded-full"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. My Enrolled Courses (Only Assigned Courses!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#15243B]">My Enrolled Courses</h2>
            <p className="text-xs text-[#73839B]">
              Direct access to syllabus roadmaps, daily lecture feeds, and notes.
            </p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-bold text-[#176BFF] hover:underline flex items-center gap-1"
          >
            <span>View All ({enrolledCourses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          /* Clean Professional Empty State per Section 5 & 6 */
          <div className="p-12 text-center rounded-3xl bg-white border border-[#DFE9F6] shadow-xs space-y-3">
            <BookOpen className="w-12 h-12 text-[#00A3FF] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#15243B]">
              No courses have been assigned to your account yet.
            </h3>
            <p className="text-xs text-[#73839B] max-w-md mx-auto">
              Please contact your department administrator or coordinator to enroll you in the current academic semester cohort.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const courseTopics = topics.filter(t => t.course_id === course.id);
              const recordingsCount = courseTopics.filter(t => t.recording_url).length;
              const notesCount = courseTopics.filter(t => t.drive_notes_url || t.pdf_file_url).length;
              const latestTopic = courseTopics[courseTopics.length - 1];

              return (
                <div
                  key={course.id}
                  className="rounded-3xl bg-white border border-[#DFE9F6] overflow-hidden shadow-xs hover:border-[#00A3FF] hover:shadow-md transition-all flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-[#EAF3FF]">
                    <img
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#176BFF] border border-[#DFE9F6]">
                      {course.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[#15243B] line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#73839B] line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="text-[11px] text-[#15243B] font-medium pt-1">
                        Assigned Mentor: <strong className="text-[#176BFF]">{course.mentor_name}</strong>
                      </div>
                    </div>

                    {/* Meta stats: recordings, notes, latest topic */}
                    <div className="pt-3 border-t border-[#DFE9F6] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#73839B]">
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-[#176BFF]" />
                          {recordingsCount} Recordings
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#00A3FF]" />
                          {notesCount} Notes
                        </span>
                      </div>

                      {latestTopic && (
                        <div className="text-[10px] text-[#73839B] bg-[#F5F9FF] p-2 rounded-xl border border-[#DFE9F6] truncate">
                          Latest: <span className="font-semibold text-[#15243B]">{latestTopic.title}</span>
                        </div>
                      )}

                      <Link
                        to={`/student/courses/${course.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#EAF3FF] hover:bg-[#176BFF] text-[#176BFF] hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                      >
                        <span>Open Course Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quick Action Hub (Discussion Room & Pathfinders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/student/discussion"
          className="p-5 rounded-3xl bg-white border border-[#DFE9F6] hover:border-[#176BFF] shadow-xs flex items-center gap-4 transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6 text-[#176BFF]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#176BFF] uppercase tracking-wider font-mono">
              Student Community
            </div>
            <h4 className="text-sm font-black text-[#15243B]">
              Discussion Room & Mentor Doubts
            </h4>
            <p className="text-xs text-[#73839B]">
              Ask technical questions publicly or request private faculty reviews.
            </p>
          </div>
        </Link>

        <Link
          to="/student/pathfinders"
          className="p-5 rounded-3xl bg-white border border-[#DFE9F6] hover:border-[#00A3FF] shadow-xs flex items-center gap-4 transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#00A3FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Rocket className="w-6 h-6 text-[#00A3FF]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#00A3FF] uppercase tracking-wider font-mono">
              Upcoming Module
            </div>
            <h4 className="text-sm font-black text-[#15243B]">
              Pathfinders — Coming Soon to Blast!
            </h4>
            <p className="text-xs text-[#73839B]">
              Preview the upcoming autonomous AI career acceleration engine.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
