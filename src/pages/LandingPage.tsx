import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, GraduationCap, Shield, Sparkles, ArrowRight,
  CheckCircle2, Compass, Award, BookOpen, Rocket, Check,
  Code2, Terminal, UserPlus, MessageCircle, Star, Lightbulb,
  Users, Briefcase, Trophy, FileText, Cpu, TrendingUp,
  Menu, X, ChevronRight, HelpCircle, Laptop, Calendar,
  ArrowUpRight, Target, Flame, Layers, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ExperienceSkillNovaSection } from '../components/homepage/ExperienceSkillNovaSection';
import { FloatingSocialConnect } from '../components/common/FloatingSocialConnect';
import { StudentAccessRequestModal } from '../components/homepage/StudentAccessRequestModal';
import mountainJourneyImg from '../assets/mountain-journey.jpg';
import heroImg from '../assets/hero.png';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutToast, setLogoutToast] = useState<string | null>(null);

  useEffect(() => {
    const msg = sessionStorage.getItem('skillnova_logout_toast');
    if (msg) {
      setLogoutToast(msg);
      sessionStorage.removeItem('skillnova_logout_toast');
      setTimeout(() => setLogoutToast(null), 5000);
    }
  }, []);

  // 10 Platform Features for Section 5: Learning Experience / What We Offer
  const platformFeatures = [
    {
      id: 'feat-1',
      title: 'Structured Technical Classes',
      desc: 'Modular curriculum structured week-by-week covering foundational computer science to distributed architecture.',
      icon: BookOpen,
      accent: 'text-[#176BFF]',
      bg: 'bg-[#176BFF]/10'
    },
    {
      id: 'feat-2',
      title: 'Practical Coding Sessions',
      desc: 'Live mentor coding drills with real-time feedback, debugging workflows, and clean code standards.',
      icon: Terminal,
      accent: 'text-[#00A3FF]',
      bg: 'bg-[#00A3FF]/10'
    },
    {
      id: 'feat-3',
      title: 'Python 3 Coding Lab',
      desc: 'Monaco-powered editor with client-side WebAssembly (Pyodide) execution, standard input prompts, and instant results.',
      icon: Code2,
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'feat-4',
      title: 'Quizzes and Flashcards',
      desc: 'Unit-by-unit knowledge assessments, timed evaluations, and high-yield flashcard recall drills.',
      icon: Sparkles,
      accent: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'feat-5',
      title: 'Interview Preparation',
      desc: 'Curated technical question banks, mock interview simulations, and systems design problem breakdowns.',
      icon: Target,
      accent: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 'feat-6',
      title: 'Saturday Special Sessions',
      desc: 'Weekend live interactive masterclasses with senior industry practitioners and guest faculty.',
      icon: Calendar,
      accent: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      id: 'feat-7',
      title: 'Emerging Technologies',
      desc: 'Hands-on exploration of Generative AI, LLM tool-calling, autonomous agents, and cloud containerization.',
      icon: Cpu,
      accent: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'feat-8',
      title: 'Research Papers & Hackathons',
      desc: 'Guided literature reviews, paper implementation breakdowns, and competitive collegiate hackathon mentorship.',
      icon: Trophy,
      accent: 'text-sky-500',
      bg: 'bg-sky-500/10'
    },
    {
      id: 'feat-9',
      title: 'Career Guidance & Mentorship',
      desc: '1-on-1 resume reviews, GitHub portfolio critique, and personalized career roadmaps.',
      icon: Users,
      accent: 'text-teal-500',
      bg: 'bg-teal-500/10'
    },
    {
      id: 'feat-10',
      title: 'Internship & Opportunity Updates',
      desc: 'Curated verified listings of collegiate internships, tech fellowships, and early-career software roles.',
      icon: Briefcase,
      accent: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#15243B] flex flex-col font-sans selection:bg-[#176BFF]/20 relative overflow-x-hidden">
      {/* Floating Logout Toast if user just signed out */}
      {logoutToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-white border border-[#DFE9F6] shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#15243B]">{logoutToast}</span>
        </div>
      )}

      {/* 2. Header / Navigation Bar – Clean, Professional, University-style */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo on Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#176BFF] to-[#00A3FF] flex items-center justify-center text-white shadow-md shadow-[#176BFF]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#0B1220]">
                Skill<span className="text-[#176BFF]">Nova</span>
              </span>
              <p className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase -mt-0.5">
                Learn • Build • Explore • Grow
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#475569]">
            <a href="#about" className="hover:text-[#176BFF] transition">
              About
            </a>
            <a href="#experience" className="hover:text-[#176BFF] transition">
              Learning Experience
            </a>
            <a href="#courses" className="hover:text-[#176BFF] transition">
              Courses
            </a>
            <a href="#contact" className="hover:text-[#176BFF] transition">
              Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 shadow-xs ${
                theme === 'dark'
                  ? 'bg-[#0D1833] hover:bg-[#132247] border-white/10 text-amber-300 hover:text-amber-200 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                  : 'bg-white hover:bg-[#EAF3FF] border-[#DFE9F6] text-[#176BFF] hover:text-[#00A8FF]'
              }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Cosmic Dark Theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setShowAccessModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#176BFF] bg-[#F0F6FF] hover:bg-[#E2EDFF] border border-[#BFDBFE] transition"
            >
              Request Access
            </button>

            <Link
              to="/admin/login"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#475569] hover:text-[#0B1220] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Admin</span>
            </Link>

            <Link
              to="/student/login"
              className="px-5 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#1258d4] text-white text-xs font-bold shadow-md shadow-[#176BFF]/25 hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              Student Login
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 ${
                theme === 'dark'
                  ? 'bg-[#0D1833] border-white/10 text-amber-300'
                  : 'bg-white border-[#DFE9F6] text-[#176BFF]'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/student/login"
              className="px-3 py-1.5 rounded-lg bg-[#176BFF] text-white text-xs font-bold"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#475569] hover:text-[#0B1220]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-[#475569]">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#176BFF]"
              >
                About SkillNova
              </a>
              <a
                href="#experience"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#176BFF]"
              >
                Learning Experience
              </a>
              <a
                href="#courses"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#176BFF]"
              >
                Courses & Curriculum
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#176BFF]"
              >
                Contact & Support
              </a>
            </nav>
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowAccessModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-[#176BFF] bg-[#F0F6FF] border border-[#BFDBFE]"
              >
                Request Access
              </button>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                Admin Portal
              </Link>
              <Link
                to="/student/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-[#176BFF] text-white"
              >
                Student Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section – Split Layout with Reference Image 1 Inspiration */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:min-h-[640px] items-center">
            {/* Left Content (Cols 1-7) */}
            <div className="lg:col-span-7 py-12 sm:py-16 lg:py-20 z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#38BDF8]">
                <span className="w-2 h-2 rounded-full bg-[#00A3FF] animate-pulse" />
                <span>Premier Engineering Education • Cohort 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Your Path to Success <br className="hidden sm:inline" />
                Starts <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A3FF] via-[#38BDF8] to-[#93C5FD]">Here.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                SkillNova transforms engineering education through practical software development, client-side WebAssembly Python labs, live weekend masterclasses, and verified industry mentorship.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/student/login"
                  className="px-7 py-3.5 rounded-xl bg-[#176BFF] hover:bg-[#1258d4] text-white text-xs sm:text-sm font-bold shadow-xl shadow-[#176BFF]/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Login</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowAccessModal(true)}
                  className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition backdrop-blur-md"
                >
                  <UserPlus className="w-4 h-4 text-[#38BDF8]" />
                  <span>Request Student Access</span>
                </button>

                <Link
                  to="/admin/login"
                  className="px-4 py-3.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              </div>

              {/* Supporting approach note */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Curated Syllabi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>In-Browser Python 3 Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Live Industry Mentorship</span>
                </div>
              </div>
            </div>

            {/* Right Angled Image (Cols 8-12) */}
            <div className="lg:col-span-5 relative w-full h-64 sm:h-80 md:h-96 lg:h-full min-h-[260px] sm:min-h-[340px] lg:min-h-[580px] flex items-center justify-center overflow-hidden my-4 lg:my-0">
              {/* Angled container with mountain / learning visual */}
              <div className="relative w-full h-full rounded-2xl lg:rounded-none lg:[clip-path:polygon(10%_0%,_100%_0%,_100%_100%,_0%_100%)] overflow-hidden shadow-2xl bg-[#0B1220]">
                <img
                  src={mountainJourneyImg}
                  alt="SkillNova Pathway to Success"
                  className="w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-700 hover:scale-105"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== window.location.origin + '/mountain-journey.jpg') {
                      target.src = '/mountain-journey.jpg';
                    } else if (target.src !== heroImg) {
                      target.src = heroImg;
                    }
                  }}
                />
                {/* Gradient Overlay to blend seamlessly into the dark background */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0B1220] via-[#0B1220]/40 to-transparent opacity-85 lg:opacity-75 pointer-events-none" />
                <div className="absolute inset-0 bg-[#00A8FF]/10 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About SkillNova Section – Reference Image 2 (Welcome to KTU College Inspiration) */}
      <section id="about" className="py-20 lg:py-28 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header Title & Intro */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#176BFF]">
              About SkillNova
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1220] tracking-tight">
              Welcome to SkillNova
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              SkillNova is a premier educational platform committed to bridging collegiate academia with production software engineering through structured curriculums, practical coding sessions, and continuous mentorship.
            </p>
          </div>

          {/* Two Balanced Columns: Our Mission & Our Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-2">
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#176BFF]">
                Strategic Focus
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220]">
                Our Mission
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                To make technology education accessible through structured learning, practical development, and continuous mentorship.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#00A3FF]">
                Long-Term Horizon
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220]">
                Our Vision
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                To build a learning community where students develop technical skills, explore emerging technologies, and prepare confidently for their careers.
              </p>
            </div>
          </div>

          {/* Large Rounded Image – University Lecture Hall / Auditorium Aesthetic (Ref Image 2) */}
          <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-xl aspect-[16/8] max-h-[500px] w-full bg-[#F1F5F9]">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&auto=format&fit=crop&q=80"
              alt="SkillNova Academic Lecture Hall and Collaborative Learning Community"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 5. Learning Experience / What We Offer Section */}
      <section id="experience" className="py-20 lg:py-28 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#176BFF]">
              What We Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1220] tracking-tight">
              The SkillNova Learning Experience
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              A comprehensive educational platform designed to take you from foundational logic to production system architecture.
            </p>
          </div>

          {/* 10 Platform Features in a Structured Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="bg-white p-7 rounded-3xl border border-[#E2E8F0] shadow-xs hover:border-[#176BFF] hover:shadow-md transition-all duration-200 space-y-3.5 group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <Icon className={`w-6 h-6 ${feat.accent}`} />
                  </div>
                  <h3 className="text-base font-bold text-[#0B1220] tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Courses and Curriculum Section (Dynamic Supabase Catalog) */}
      <section id="courses" className="py-20 lg:py-28 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExperienceSkillNovaSection onOpenAccessRequest={() => setShowAccessModal(true)} />
        </div>
      </section>

      {/* 7. Footer – Premium Dark Design (Reference Image 3 - SNKS Inspiration) */}
      <footer id="contact" className="bg-[#0A0E17] text-white pt-16 pb-12 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
            {/* Left Section: Logo & Tagline (Cols 1-5) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#176BFF] to-[#00A3FF] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white font-mono">
                  SkillNova
                </span>
              </div>
              <p className="text-sm font-medium text-slate-300">
                Learn. Build. Explore. Grow.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Empowering college engineers and aspiring developers with structured curriculum, real-time feedback, and authentic career mentorship.
              </p>
            </div>

            {/* Middle Section: Explore Links (Cols 6-8) */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                EXPLORE
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <a href="#about" className="hover:text-white transition flex items-center gap-1.5">
                    About SkillNova <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="#courses" className="hover:text-white transition flex items-center gap-1.5">
                    Courses & Curriculum <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="#experience" className="hover:text-white transition flex items-center gap-1.5">
                    Learning Experience <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <Link to="/student/login" className="hover:text-white transition flex items-center gap-1.5">
                    Student Learning Portal <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Section: Details & Legal (Cols 9-12) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                THE DETAILS
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="hover:text-white transition text-left"
                  >
                    Request Student Access
                  </button>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition">
                    Administrator Login
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400 cursor-default">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 cursor-default">
                    Terms & Conditions
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Thin Divider Line (Ref Image 3) */}
          <div className="border-t border-[#1E293B]" />

          {/* Copyright Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
            <div>
              © 2026 SkillNova. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Technology Education • Modern Engineering Standards</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. Social Media Icons – UNCHANGED: Exactly as configured in FloatingSocialConnect */}
      <FloatingSocialConnect />

      {/* Student Access Request Modal */}
      <StudentAccessRequestModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
      />
    </div>
  );
};

export default LandingPage;
