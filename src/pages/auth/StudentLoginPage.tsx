import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, AlertCircle, Sparkles, HelpCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import mountainJourneyImg from '../../assets/mountain-journey.jpg';

export const StudentLoginPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Username-only authentication (internally resolved by AuthContext)
      const res = await login(username.trim(), password, 'student');
      if (res.success) {
        navigate('/student/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify your student credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col font-sans bg-cover bg-center selection:bg-[#00A3FF]/20"
      style={{ backgroundImage: `url(${mountainJourneyImg})` }}
    >
      {/* Semi-transparent dark wash with gentle blur so background image remains richly visible */}
      <div className="absolute inset-0 bg-[#050816]/75 dark:bg-[#050816]/85 backdrop-blur-[2px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="relative z-20 h-20 border-b border-white/10 px-6 md:px-12 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-md shadow-[#00A3FF]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0D1833] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00A8FF]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              Skill<span className="text-[#00A8FF]">Nova</span>
            </span>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider -mt-0.5">
              Learn • Build • Explore • Grow
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-amber-300 backdrop-blur-md transition shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition backdrop-blur-md shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-[#00A8FF]" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </nav>

      {/* Main Glassmorphic Container */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md rounded-3xl p-8 backdrop-blur-2xl bg-slate-900/65 dark:bg-[#070D1E]/75 border border-white/20 shadow-2xl shadow-black/50 space-y-6 text-white">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00A8FF]/20 text-[#00E5FF] flex items-center justify-center mx-auto border border-[#00A3FF]/30 shadow-lg shadow-[#00A3FF]/15">
              <GraduationCap className="w-7 h-7 text-[#00E5FF]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider">
              Student Learning Workspace
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Student Login</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sign in using your institutional username provisioned by your department administrator.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                Registered Student Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. mohan"
                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enter your username only. No domain extension required.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[11px] text-[#38BDF8] hover:text-white font-semibold transition"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-black shadow-lg shadow-[#00A3FF]/30 flex items-center justify-center gap-2 transition hover:scale-102 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Security Notice */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center text-[11px] text-slate-300 font-medium">
            Account registration is managed exclusively by authorized department Administrators.
          </div>
        </div>
      </div>

      {/* Account Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1833] rounded-3xl border border-white/20 p-6 max-w-sm w-full shadow-2xl space-y-4 text-center text-white">
            <div className="w-12 h-12 rounded-2xl bg-[#00A8FF]/20 text-[#00E5FF] flex items-center justify-center mx-auto border border-[#00A3FF]/30">
              <HelpCircle className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <h3 className="text-base font-bold text-white">Administrator Account Recovery</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Student accounts are managed under institutional single-sign-on. To reset your password or verify your username, contact your department coordinator.
            </p>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-[11px] font-mono text-[#38BDF8]">
              admin-support@skillnova.edu
            </div>
            <button
              onClick={() => setShowRecoveryModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#1258d4] text-white text-xs font-bold transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLoginPage;
