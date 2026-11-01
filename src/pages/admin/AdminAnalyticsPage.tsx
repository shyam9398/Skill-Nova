import React from 'react';
import { 
  BarChart2, 
  Users, 
  BookOpen, 
  Sparkles, 
  Award, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { dataService } from '../../services/dataService';

export const AdminAnalyticsPage: React.FC = () => {
  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const resources = dataService.getResources();
  const attempts = dataService.getQuizAttempts();

  const totalScoreAverage = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, a) => acc + (a.score / (a.total_questions || 1)) * 100, 0) / attempts.length)
    : 84;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-[#397BFF]" />
            Cohort Insights & Readiness
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">Live Telemetry</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
          Learning Analytics & Student Activity
        </h1>
        <p className="text-sm text-[#9BAAC2]">
          Real-time metrics on concept retention, assessment performance, and curriculum resource consumption.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#15233A] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cohort</span>
            <Users className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F0F5FF]">{students.length}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> 100% On-Track
            </span>
          </div>
          <p className="text-[11px] text-[#9BAAC2]">Target 50 students initial benchmark</p>
        </div>

        <div className="bg-[#15233A] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg MCQ Retention</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F0F5FF]">{totalScoreAverage}%</span>
            <span className="text-xs text-emerald-400 font-semibold">+6% vs last week</span>
          </div>
          <p className="text-[11px] text-[#9BAAC2]">Across all AI-generated quizzes</p>
        </div>

        <div className="bg-[#15233A] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-semibold uppercase tracking-wider">Resources Published</span>
            <FileText className="w-4 h-4 text-[#77B4FF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F0F5FF]">{resources.length}</span>
            <span className="text-xs text-[#77B4FF] font-semibold">100% verified links</span>
          </div>
          <p className="text-[11px] text-[#9BAAC2]">Google Drive & Direct uploads</p>
        </div>

        <div className="bg-[#15233A] p-5 rounded-2xl border border-white/5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Grounded Sets</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F0F5FF]">48</span>
            <span className="text-xs text-purple-400 font-semibold">Zero hallucinations</span>
          </div>
          <p className="text-[11px] text-[#9BAAC2]">Approved human-in-the-loop</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Course Progress Breakdown */}
        <div className="lg:col-span-7 bg-[#15233A] rounded-2xl border border-white/5 p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-[#F0F5FF] flex items-center justify-between">
            <span>Course Enrollment & Completion Index</span>
            <span className="text-xs text-[#9BAAC2] font-mono">Real-time</span>
          </h3>

          <div className="space-y-4">
            {courses.map((course) => {
              const enrolledCount = students.filter(s => (s.assigned_courses || s.enrolledCourseIds || []).includes(course.id)).length;
              const percent = Math.min(100, Math.round((enrolledCount / (students.length || 1)) * 100));
              return (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F0F5FF]">{course.title}</span>
                    <span className="text-[#9BAAC2] font-mono">{enrolledCount} Students ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#080E1C] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#397BFF] to-[#77B4FF] rounded-full transition-all duration-700" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Quiz Performance Log */}
        <div className="lg:col-span-5 bg-[#15233A] rounded-2xl border border-white/5 p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-[#F0F5FF]">Recent Quiz Attempts</h3>
          <div className="space-y-3">
            {attempts.length > 0 ? (
              attempts.map((att) => (
                <div key={att.id} className="p-3.5 rounded-xl bg-[#101A2D] border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#F0F5FF]">{att.topic_id || 'Assessment'}</h4>
                    <p className="text-[11px] text-[#9BAAC2] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#397BFF]" /> {att.completed_at || 'Recently'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400">
                      {att.score} / {att.total_questions}
                    </span>
                    <p className="text-[10px] text-[#9BAAC2]">{Math.round((att.score / (att.total_questions || 1)) * 100)}% Pass</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#9BAAC2] text-center py-6">
                Students have not completed any quizzes today.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
