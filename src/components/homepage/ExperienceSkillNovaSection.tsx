import React, { useState, useEffect } from 'react';
import {
  Play, Sparkles, ExternalLink, MessageCircle, Clock, BookOpen,
  Layers, CheckCircle2, ChevronRight, Tag, Calendar, UserPlus,
  Check, ArrowRight, ShieldCheck
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { HomepageSettings, Course } from '../../types';

export const ExperienceSkillNovaSection: React.FC<{ onOpenAccessRequest?: () => void }> = ({ onOpenAccessRequest }) => {
  const [settings, setSettings] = useState<HomepageSettings>(dataService.getHomepageSettings());
  const [courses, setCourses] = useState<Course[]>(dataService.getCourses().filter(c => c.is_published));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<Course | null>(null);

  useEffect(() => {
    const update = () => {
      setSettings(dataService.getHomepageSettings());
      const activeCourses = dataService.getCourses().filter(c => c.is_published);
      setCourses(activeCourses);
      if (!selectedCourseForCurriculum && activeCourses.length > 0) {
        setSelectedCourseForCurriculum(activeCourses[0]);
      }
    };
    update();
    return dataService.subscribe(update);
  }, []);

  // Helper to convert YouTube, Vimeo, or Google Drive URL to an embeddable URL
  const getEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';

    // YouTube
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Google Drive
    const gDriveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      return `https://drive.google.com/file/d/${gDriveMatch[1]}/preview`;
    }

    return rawUrl;
  };

  const embedUrl = getEmbedUrl(settings.demo_video_url);

  return (
    <section className="py-12 space-y-20">
      {/* 1. Experience SkillNova - Demo Video Section */}
      {settings.demo_video_is_active && settings.demo_video_url && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1EEFD] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] text-xs font-mono font-bold border border-[#00D9FF]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
              <span>EXPERIENCE SKILLNOVA</span>
            </div>
            <h2 className="text-3xl font-black text-[#15243B] dark:text-[#F4F7FF]">
              {settings.demo_video_title || 'SkillNova Learning Experience Walkthrough'}
            </h2>
            <p className="text-xs sm:text-sm text-[#73839B] dark:text-[#9BAAC5] leading-relaxed">
              {settings.demo_video_description ||
                'Watch how SkillNova transforms student careers through hands-on technical training, live mentor reviews, and production project builds.'}
            </p>
          </div>

          {/* Video Player Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-[#080E1C] border border-[#00D9FF]/30 p-2 sm:p-3 shadow-2xl shadow-[#00A3FF]/20 overflow-hidden">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {isPlaying ? (
                <iframe
                  src={embedUrl}
                  title={settings.demo_video_title || 'SkillNova Demo Video'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                  {/* Poster / Thumbnail */}
                  <img
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
                    alt="Demo Video Thumbnail"
                    className="w-full h-full object-cover filter brightness-75 group-hover:scale-102 transition duration-500"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 group-hover:bg-black/20 transition">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-1 shadow-2xl shadow-[#00A3FF]/50 group-hover:scale-110 transition transform">
                      <div className="w-full h-full bg-[#080E1C] rounded-full flex items-center justify-center pl-1">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white" />
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-mono">
                      Click to Play Demo
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Prominent Course Listing Section with Fee, Duration, Timeline, Curriculum & Enroll */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1EEFD] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] text-xs font-mono font-bold border border-[#00D9FF]/40">
            <BookOpen className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span>INDUSTRY CERTIFICATION COHORTS</span>
          </div>
          <h2 className="text-3xl font-black text-[#15243B] dark:text-[#F4F7FF]">
            Available Programs & Live Tracks
          </h2>
          <p className="text-xs sm:text-sm text-[#73839B] dark:text-[#9BAAC5]">
            Configured by SkillNova administration. Review curriculum modules and join the official cohort WhatsApp community.
          </p>
        </div>

        {/* Dynamic Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {courses.map((course) => {
            const courseCurriculum = course.curriculum_text || dataService.getCourseCurriculum(course.id);
            const feeDisplay = String(course.course_fee || course.fee || '₹14,999');
            const timelineDisplay = course.timeline || `${course.duration_weeks} Weeks • Regular Cohort`;

            return (
              <div
                key={course.id}
                className="rounded-3xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 hover:border-[#00D9FF] dark:hover:border-[#00D9FF] shadow-lg shadow-[#00A3FF]/5 hover:shadow-2xl hover:shadow-[#00A3FF]/15 transition duration-300 flex flex-col justify-between overflow-hidden group transform hover:-translate-y-1"
              >
                <div>
                  {/* Course Thumbnail */}
                  <div className="relative h-52 overflow-hidden bg-[#EAF3FF] dark:bg-[#060B18]">
                    <img
                      src={course.thumbnail || course.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#15243B]/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#00D9FF] border border-[#00D9FF]/30">
                      {course.category}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0B1530]/95 backdrop-blur-md text-xs font-black text-emerald-600 dark:text-emerald-400 shadow-md">
                      {feeDisplay}
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                      {timelineDisplay}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-[#15243B] dark:text-[#F4F7FF] group-hover:text-[#176BFF] dark:group-hover:text-[#00A8FF] transition line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#73839B] dark:text-[#9BAAC5] line-clamp-2 mt-1 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Timeline & Duration Badges */}
                    <div className="flex items-center justify-between text-[11px] text-[#73839B] dark:text-[#9BAAC5] bg-[#F5F9FF] dark:bg-[#070D1E] p-2.5 rounded-xl border border-[#DFE9F6] dark:border-white/10">
                      <span>Duration: <strong className="text-[#15243B] dark:text-[#F4F7FF]">{course.duration_weeks} Weeks</strong></span>
                      <span>Mentor: <strong className="text-[#15243B] dark:text-[#F4F7FF]">{course.mentor_name}</strong></span>
                    </div>

                    {/* Curriculum Overview (Section 14 requirement) */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#176BFF] dark:text-[#00A8FF] uppercase tracking-wider block">
                        Curriculum Overview:
                      </span>
                      <div className="bg-[#FAFCFF] dark:bg-[#070D1E] p-3 rounded-xl border border-[#DFE9F6] dark:border-white/10 text-xs font-mono text-[#15243B] dark:text-[#F4F7FF] line-clamp-4 leading-relaxed whitespace-pre-line max-h-28 overflow-y-auto">
                        {courseCurriculum || 'Module 1: Architecture\nModule 2: Core Engineering\nModule 3: Project Deployment'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Enroll Button -> WhatsApp Invitation & Student Access Modal */}
                <div className="p-6 pt-0 space-y-2">
                  <a
                    href={settings.whatsapp_group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition transform active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Enroll • Join WhatsApp Cohort</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  {onOpenAccessRequest && (
                    <button
                      type="button"
                      onClick={onOpenAccessRequest}
                      className="w-full py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#070D1E] hover:bg-[#EAF3FF] dark:hover:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-xs font-bold text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center gap-1.5 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Request Student Access</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Prominent Full-Width Curriculum Showcase Section */}
      {courses.length > 0 && (
        <div className="max-w-6xl mx-auto rounded-3xl bg-[#080E1C] border border-[#00D9FF]/30 p-6 md:p-10 shadow-2xl space-y-6 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] text-xs font-mono font-bold border border-[#00D9FF]/40 mb-1">
                <Layers className="w-3.5 h-3.5" />
                ACADEMIC BLUEPRINT
              </div>
              <h3 className="text-2xl font-black text-white">
                Detailed Curriculum Syllabus
              </h3>
              <p className="text-xs text-[#9BAAC2] mt-0.5">
                Inspect module descriptions and learning outcomes directly as configured by our academic team.
              </p>
            </div>

            {/* Course Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseForCurriculum(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    (selectedCourseForCurriculum?.id || courses[0].id) === c.id
                      ? 'bg-[#176BFF] text-white shadow-xs'
                      : 'bg-white/5 text-[#9BAAC2] hover:text-white'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum Content Viewer */}
          <div className="bg-[#101A2D] rounded-2xl border border-white/10 p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00D4B8] font-mono uppercase tracking-wider">
                {selectedCourseForCurriculum?.title || courses[0]?.title} • Complete Module Outline
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {selectedCourseForCurriculum?.course_fee || selectedCourseForCurriculum?.fee || '₹14,999'}
              </span>
            </div>

            <pre className="text-xs sm:text-sm font-mono text-[#E0EBF7] leading-relaxed whitespace-pre-wrap font-sans bg-[#080E1C] p-4 rounded-xl border border-white/5 max-h-96 overflow-y-auto">
              {selectedCourseForCurriculum?.curriculum_text ||
                dataService.getCourseCurriculum(selectedCourseForCurriculum?.id || courses[0]?.id) ||
                `Module 1: Web Protocols & Foundations\n- HTTP/3, DNS, DOM Tree & V8 JIT Compilation\n- TypeScript 5.5 Type System & Asynchronous Event Loops\n\nModule 2: Client Architecture & Dynamic UIs\n- React 19 State Models, Hooks & Concurrent Rendering\n- Tailwind CSS Glassmorphism Design Tokens\n\nModule 3: Scalable Backend Services\n- Python 3 FastAPI Asynchronous Endpoints\n- PostgreSQL Index Optimization & Row Level Security\n- Containerization with Docker & Cloud Deployment`}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExperienceSkillNovaSection;
