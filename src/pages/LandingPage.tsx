import React from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, GraduationCap, Shield, Sparkles, ArrowRight,
  CheckCircle2, Compass, Award, BookOpen, Rocket, Check, Code2, Terminal
} from 'lucide-react';
import { MountainPathToSuccess } from '../components/3d/MountainPathToSuccess';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF3FC] via-[#F0F6FF] to-[#E3EFFF] text-[#15243B] flex flex-col font-sans selection:bg-[#00D9FF]/20 relative overflow-hidden">
      {/* Subtle Fluorescent Ambient Mesh Gradients in Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/6 w-96 h-96 bg-[#176BFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Elevated Navigation Header */}
      <nav className="h-20 border-b border-[#00D9FF]/25 px-6 md:px-12 flex items-center justify-between bg-[#FAFCFF]/85 backdrop-blur-md sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,163,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-md shadow-[#00A3FF]/30">
            <div className="w-full h-full bg-[#FAFCFF] rounded-[14px] flex items-center justify-center">
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

        {/* Right Corner Access Controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAFCFF] hover:bg-[#EAF3FF] border border-[#00D9FF]/30 text-xs font-bold text-[#15243B] hover:text-[#176BFF] transition group shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-[#176BFF] group-hover:scale-110 transition-transform" />
            <span>Admin Access</span>
          </Link>

          <Link
            to="/student/login"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] hover:opacity-95 text-white text-xs font-black shadow-md shadow-[#00A3FF]/30 hover:scale-105 transition transform"
          >
            Student Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 md:py-16 space-y-12 relative z-10">
        {/* Top Text Showcase */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1EEFD] border border-[#00D9FF]/40 text-xs font-black text-[#176BFF] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>3D Interactive Mountain Ascent • Python Coding Lab • Verified Mentorship</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-[#15243B] leading-[1.12] tracking-tight">
            Your Path to Success <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF]">
              Starts Here.
            </span>
          </h1>

          <p className="text-base text-[#73839B] leading-relaxed max-w-2xl mx-auto font-medium">
            Learn emerging technologies, write and execute Python code in-browser with Pyodide WebAssembly, explore structured syllabi, and prepare for high-impact software careers.
          </p>

          {/* Primary Two Login Options */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/student/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] hover:opacity-95 text-white text-sm font-black shadow-xl shadow-[#00A3FF]/35 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FAFCFF] hover:bg-[#EAF3FF] border border-[#00D9FF]/35 text-[#15243B] text-sm font-bold flex items-center justify-center gap-3 transition shadow-xs hover:border-[#00D9FF]"
            >
              <Shield className="w-5 h-5 text-[#176BFF]" />
              <span>Admin & Faculty Login</span>
            </Link>
          </div>
        </div>

        {/* 3D Mountain Path to Success Interactive Hero Canvas (10 Milestones) */}
        <div className="max-w-5xl mx-auto">
          <MountainPathToSuccess />
        </div>

        {/* Feature Highlights 3D Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/30 shadow-[0_12px_32px_-6px_rgba(0,163,255,0.12)] space-y-3 transition transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#176BFF]/15 text-[#176BFF] flex items-center justify-center border border-[#00A3FF]/25 shadow-xs">
              <Code2 className="w-6 h-6 text-[#176BFF]" />
            </div>
            <h3 className="text-base font-black text-[#15243B]">Python 3 Coding Lab</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Client-side Monaco code editor powered by Pyodide WebAssembly. Instant local execution, input() support, starter snippets, and zero third-party subscription costs.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/30 shadow-[0_12px_32px_-6px_rgba(0,163,255,0.12)] space-y-3 transition transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#00A3FF]/15 text-[#00A3FF] flex items-center justify-center border border-[#00A3FF]/25 shadow-xs">
              <BookOpen className="w-6 h-6 text-[#00A3FF]" />
            </div>
            <h3 className="text-base font-black text-[#15243B]">Release & Hold Workflows</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Comprehensive admin publishing for PDFs, PPTs, Drive videos, and Meet links with immediate release or scheduled release in Asia/Kolkata timezone.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/30 shadow-[0_12px_32px_-6px_rgba(0,163,255,0.12)] space-y-3 transition transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#00D9FF]/15 text-[#00A3FF] flex items-center justify-center border border-[#00D9FF]/30 shadow-xs">
              <Compass className="w-6 h-6 text-[#176BFF]" />
            </div>
            <h3 className="text-base font-black text-[#15243B]">10-Milestone Mountain Ascent</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Ascend from Learn and Build through Mentorship, Internships, Hackathons, Emerging Technologies, and Career Guidance to reach industry Success.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00D9FF]/25 bg-[#FAFCFF]/80 backdrop-blur-md py-8 px-6 md:px-12 text-center text-xs text-[#73839B] mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#15243B]">SkillNova</span>
            <span>•</span>
            <span>Learn. Build. Explore. Grow.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Initial Target: 50 Students & Mentors</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Database Driven
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
