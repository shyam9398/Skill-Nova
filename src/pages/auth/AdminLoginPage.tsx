import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, Sparkles, UserCheck, KeyRound, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import mountainJourneyImg from '../../assets/mountain-journey.jpg';

export const AdminLoginPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [loginMode, setLoginMode] = useState<'admin' | 'sub_admin'>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Username or email login authenticated with Supabase Auth
      const res = await login(identifier, password, loginMode);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error || `Invalid credentials or insufficient authorization for ${loginMode === 'admin' ? 'Administrator' : 'Sub-admin'} portal.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Administrative login failed. Check server connection.');
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
            to="/student/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition backdrop-blur-md shadow-xs"
          >
            <span>Student Portal</span>
          </Link>
        </div>
      </nav>

      {/* Main Glassmorphic Container */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="dark-card w-full max-w-md rounded-3xl p-8 backdrop-blur-2xl bg-slate-900/65 dark:bg-[#070D1E]/75 border border-white/20 shadow-2xl shadow-black/50 space-y-6 text-white">

          {/* Segmented Mode Selector: Admin Login vs Sub-admin Login */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginMode === 'admin'
                ? 'bg-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
                : 'text-slate-300 hover:text-white'
                }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('sub_admin');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginMode === 'sub_admin'
                ? 'bg-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
                : 'text-slate-300 hover:text-white'
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sub-admin Login</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00A8FF]/20 text-[#00E5FF] flex items-center justify-center mx-auto border border-[#00A3FF]/30 shadow-lg shadow-[#00A3FF]/15">
              {loginMode === 'admin' ? (
                <Shield className="w-7 h-7 text-[#00E5FF]" />
              ) : (
                <UserCheck className="w-7 h-7 text-[#00E5FF]" />
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider">
              {loginMode === 'admin' ? 'Privileged Super Administrator' : 'Academic Sub-Administrator'}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {loginMode === 'admin' ? 'Administrator Desk' : 'Sub-Admin Faculty Desk'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {loginMode === 'admin'
                ? 'Authorized super administrators: manage institutional configurations, accounts, and full platform oversight.'
                : 'Operational sub-admins: manage curriculums, modules, learning resources, quizzes, and student cohorts.'}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                {loginMode === 'admin' ? 'Admin Username or Email' : 'Registered Sub-Admin Username'}
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMode === 'admin' ? 'e.g. admin or admin@skillnova.edu' : 'e.g. mohan'}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00A3FF] transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {loginMode === 'sub_admin'
                  ? 'Enter your registered username only. Domain extension is handled automatically.'
                  : 'Enter your username or registered email address.'}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00A3FF] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center justify-center gap-2 transition hover:scale-102 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying Security Clearance...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {loginMode === 'admin' ? 'Authenticate Administrator' : 'Authenticate Sub-Admin'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center text-[11px] text-slate-300">
            Administrative accounts are provisioned via verified database roles and Supabase authentication policies.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
