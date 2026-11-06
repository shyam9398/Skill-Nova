import React, { useState } from 'react';
import { Terminal, Code2, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { PythonCodingLab } from '../../components/coding/PythonCodingLab';
import { dataService } from '../../services/dataService';

export const StudentPythonLabPage: React.FC = () => {
  const user = dataService.getCurrentUser();
  const enrolledCourses = dataService.getEnrolledCourses(user?.id);
  const allCourses = dataService.getCourses();
  
  // Available courses list for assignment association, defaulting to general lab
  const availableCourses = enrolledCourses.length > 0 ? enrolledCourses : allCourses;
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableCourses[0]?.id || 'skillnova-py-lab'
  );

  const selectedCourse = availableCourses.find(c => c.id === selectedCourseId) || {
    id: 'skillnova-py-lab',
    title: 'Python 3 Core & Systems Engineering',
    course_name: 'Python 3 Core & Systems Engineering'
  };

  const courseTitle = (selectedCourse as any).title || (selectedCourse as any).course_name || 'SkillNova Python Lab';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="dark-section dark-card bg-gradient-to-r from-[#11192A] via-[#15233A] to-[#0A101D] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4B8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#397BFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00D4B8]/15 text-[#00D4B8] border border-[#00D4B8]/30 flex items-center gap-1.5 shadow-sm">
                <Terminal className="w-3.5 h-3.5 text-[#00D4B8]" />
                WebAssembly Pyodide 3.12 Engine
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                100% Client-Side Web Worker Execution
              </span>
              <span className="text-xs text-[#9BAAC2] font-mono hidden sm:inline">
                Zero Cloud Latency • Isolated Sandbox
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F0F5FF] tracking-tight flex items-center gap-3">
              <Code2 className="w-7 h-7 text-[#00D4B8]" />
              Python Code Lab
            </h1>

            <p className="text-sm text-[#9BAAC2] max-w-2xl leading-relaxed">
              Write, execute, and debug Python 3 in your browser with real-time standard I/O, starter templates, and interactive debugging without server quotas.
            </p>
          </div>

          {/* Quick Course Switcher for Lab Practicals */}
          {availableCourses.length > 0 && (
            <div className="bg-[#0D1526]/80 p-3 rounded-xl border border-white/10 backdrop-blur-md flex flex-col gap-1.5 self-start md:self-auto min-w-[240px]">
              <label className="text-[11px] font-semibold text-[#77B4FF] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Associated Course
              </label>
              <select
                aria-label="Associated Course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-[#15233A] text-xs text-[#F0F5FF] px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#00D4B8] transition cursor-pointer"
              >
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#11192A] text-white">
                    {(c as any).title || (c as any).course_name || c.id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Coding Lab Workspace */}
      <div className="dark-card bg-[#0A101D] border border-white/10 rounded-2xl p-3 sm:p-5 shadow-2xl">
        <PythonCodingLab
          courseId={selectedCourseId}
          courseTitle={courseTitle}
          practicalId="student-sidebar-lab"
        />
      </div>
    </div>
  );
};

export default StudentPythonLabPage;
