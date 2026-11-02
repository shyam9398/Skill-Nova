import React, { useState, useEffect } from 'react';
import {
  Sparkles, BookOpen, Layers, Play, Pause, ChevronRight,
  ChevronLeft, X, Maximize2, CheckCircle2, Award, Compass, Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import type { Course } from '../../types';

export const StudentFloatingCurriculum: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [curriculumSections, setCurriculumSections] = useState<{ title: string; points: string[] }[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const list = currentUser
      ? dataService.getEnrolledCoursesForStudent(currentUser.id)
      : dataService.getCourses();

    setCourses(list);
    if (list.length > 0 && !selectedCourseId) {
      setSelectedCourseId(list[0].id);
    }
  }, [currentUser]);

  // Parse curriculum text into structured animated slides
  useEffect(() => {
    if (!selectedCourseId) return;
    const rawText = dataService.getCourseCurriculum(selectedCourseId);
    const parsed = parseCurriculumText(rawText);
    setCurriculumSections(parsed);
    setActiveSlide(0);
  }, [selectedCourseId]);

  // Autoplay through slides
  useEffect(() => {
    if (!isOpen || !isPlaying || curriculumSections.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % curriculumSections.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, curriculumSections.length]);

  const parseCurriculumText = (text: string) => {
    if (!text) return [];
    const lines = text.split('\n');
    const sections: { title: string; points: string[] }[] = [];
    let currentTitle = 'Course Overview';
    let currentPoints: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('#') || trimmed.toLowerCase().startsWith('module') || trimmed.endsWith(':')) {
        if (currentPoints.length > 0) {
          sections.push({ title: currentTitle, points: currentPoints });
          currentPoints = [];
        }
        currentTitle = trimmed.replace(/^[#\-\*]+\s*/, '').replace(/:$/, '');
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        currentPoints.push(trimmed.replace(/^[-•*]\s*/, ''));
      } else {
        currentPoints.push(trimmed);
      }
    });

    if (currentPoints.length > 0) {
      sections.push({ title: currentTitle, points: currentPoints });
    }

    if (sections.length === 0) {
      sections.push({
        title: 'Complete Course Syllabus',
        points: ['Core Language Mechanics & Data Structures', 'Real-world System Architecture', 'Production Certification & Portfolio']
      });
    }

    return sections;
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <>
      {/* Floating Trigger Button in Student Dashboard */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] text-white shadow-xl shadow-[#00A3FF]/30 hover:scale-105 active:scale-98 transition transform border border-white/20"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <div className="text-left">
            <div className="text-[10px] uppercase font-mono tracking-wider opacity-90 leading-tight">Interactive 16:9</div>
            <div className="text-xs font-black tracking-wide">Course Curriculum</div>
          </div>
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* 16:9 Ratio Animated Frame Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080E1C]/85 backdrop-blur-md animate-fadeIn">
          {/* Main 16:9 Frame Container */}
          <div className="w-full max-w-5xl bg-[#0B1528] rounded-3xl border border-[#00D9FF]/30 shadow-[0_0_50px_rgba(0,163,255,0.25)] overflow-hidden flex flex-col relative animate-scaleUp">
            {/* Top Toolbar */}
            <div className="h-14 border-b border-[#1F2E47] px-6 flex items-center justify-between bg-[#101C33]/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#176BFF] to-[#00D9FF] p-0.5">
                  <div className="w-full h-full bg-[#0B1528] rounded-[10px] flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-[#00D9FF]" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>{selectedCourse?.title || 'Course Curriculum Showcase'}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#176BFF]/20 text-[#00D9FF] border border-[#00D9FF]/30">
                      16:9 FRAME
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Selector Dropdown if multiple */}
              <div className="flex items-center gap-3">
                {courses.length > 1 && (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-[#15233A] border border-[#1F2E47] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-hidden"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-[#9BAAC2] hover:text-white hover:bg-[#15233A] transition"
                  title="Close Showcase"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Strict 16:9 Aspect Ratio Display Stage */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-[#060B14] via-[#0B1528] to-[#091833] flex flex-col justify-between p-8 sm:p-12 overflow-hidden select-none">
              {/* Animated Glow Mesh in Background */}
              <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#176BFF]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#00D9FF]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Counter Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00D9FF]">
                    Chapter {activeSlide + 1} of {curriculumSections.length}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-xs text-[#9BAAC2] font-medium">Curriculum Blueprint</span>
                </div>

                {/* Play/Pause & Slide Navigation */}
                <div className="flex items-center gap-2 bg-[#15233A]/80 border border-[#1F2E47] rounded-full px-3 py-1 text-xs">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-[#00D9FF] hover:text-white transition p-1"
                    title={isPlaying ? 'Pause Auto-Advance' : 'Play Auto-Advance'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-white/20">|</span>
                  <button
                    onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : curriculumSections.length - 1))}
                    className="text-[#9BAAC2] hover:text-white transition p-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSlide((prev) => (prev + 1) % curriculumSections.length)}
                    className="text-[#9BAAC2] hover:text-white transition p-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Section Animated Content */}
              <div className="my-auto relative z-10 space-y-6 max-w-3xl">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176BFF]/20 text-[#00D9FF] text-xs font-mono font-bold border border-[#00D9FF]/30">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>SYLLABUS MODULE</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight animate-fadeIn">
                    {curriculumSections[activeSlide]?.title || 'Core Engineering Track'}
                  </h2>
                </div>

                {/* Animated Topic Points */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-2">
                  {curriculumSections[activeSlide]?.points.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00D9FF]/40 backdrop-blur-xs transition transform hover:translate-x-1"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#176BFF] to-[#00D9FF] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                        {idx + 1}
                      </div>
                      <span className="text-sm sm:text-base text-[#E0EBF7] font-medium leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Progress Bar & Jump Dots */}
              <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-[#9BAAC2]">
                  <span>SkillNova Engineering Syllabus</span>
                  <div className="flex items-center gap-1.5">
                    {curriculumSections.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        className={`h-2 rounded-full transition-all ${
                          activeSlide === idx ? 'w-8 bg-[#00D9FF]' : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentFloatingCurriculum;
