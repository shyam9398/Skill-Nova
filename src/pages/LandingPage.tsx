import React from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, GraduationCap, Shield, Sparkles, ArrowRight,
  CheckCircle2, Compass, Award, BookOpen, Rocket, Check
} from 'lucide-react';
import { MountainPathToSuccess } from '../components/3d/MountainPathToSuccess';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#15243B] flex flex-col font-sans selection:bg-[#00A3FF]/20">
      {/* Unified Single Navigation Header */}
      <nav className="h-20 border-b border-[#DFE9F6] px-6 md:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-md shadow-[#00A3FF]/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#176BFF]" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#15243B]">
              Skill<span className="text-[#176BFF]">Nova</span>
            </span>
            <p className="text-[10px] text-[#73839B] font-bold tracking-wider uppercase -mt-0.5">
              Learn • Build • Explore • Grow
            </p>
          </div>
        </div>

        {/* Right Corner Access Controls (No public sign up!) */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-bold text-[#73839B] hover:text-[#176BFF] transition group shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-[#176BFF] group-hover:scale-110 transition-transform" />
            <span>Admin Access</span>
          </Link>

          <Link
            to="/student/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-black shadow-md shadow-[#00A3FF]/25 hover:scale-105 transition transform"
          >
            Student Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 md:py-16 space-y-12">
        {/* Top Text Showcase */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAF3FF] border border-[#00A3FF]/30 text-xs font-bold text-[#176BFF] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span>3D-Enhanced Learning & Career Development Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-[#15243B] leading-[1.12] tracking-tight">
            Your Path to Success <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF]">
              Starts Here.
            </span>
          </h1>

          <p className="text-base text-[#73839B] leading-relaxed max-w-2xl mx-auto">
            Learn emerging technologies, develop practical skills and prepare for your professional future with SkillNova. Structured roadmaps, verified mentors, and career blueprints designed for top engineering talent.
          </p>

          {/* Primary Two Login Options */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/student/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-sm font-black shadow-xl shadow-[#00A3FF]/30 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-[#15243B] text-sm font-bold flex items-center justify-center gap-3 transition shadow-xs"
            >
              <Shield className="w-5 h-5 text-[#176BFF]" />
              <span>Admin & Faculty Login</span>
            </Link>
          </div>
        </div>

        {/* 3D Mountain Path to Success Interactive Hero Canvas */}
        <div className="max-w-5xl mx-auto">
          <MountainPathToSuccess />
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="p-6 rounded-3xl bg-white border border-[#DFE9F6] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#176BFF]" />
            </div>
            <h3 className="text-base font-bold text-[#15243B]">Structured Engineering Curricula</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Full Stack, Artificial Intelligence, and DSA learning roadmaps paired with daily class recordings, Drive notes, and in-app document viewing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#DFE9F6] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#00A3FF] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#00A3FF]" />
            </div>
            <h3 className="text-base font-bold text-[#15243B]">Grounded AI Practice</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Zero-hallucination interactive flashcards, multiple-choice quizzes, and technical interview questions strictly grounded in uploaded source documents.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#DFE9F6] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#00D9FF] flex items-center justify-center">
              <Compass className="w-6 h-6 text-[#176BFF]" />
            </div>
            <h3 className="text-base font-bold text-[#15243B]">Discussion Room & Mentorship</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Open general discussion room for cohort project collaboration alongside private 1-on-1 Request a Mentor communication channels.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DFE9F6] bg-white py-8 px-6 md:px-12 text-center text-xs text-[#73839B]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#15243B]">SkillNova</span>
            <span>•</span>
            <span>Learn. Build. Explore. Grow.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Initial Target: 50 Students & Mentors</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Supabase Database Driven
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
