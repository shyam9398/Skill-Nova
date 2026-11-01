import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, Sparkles, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@skillnova.edu');
  const [password, setPassword] = useState('SkillNova@2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email, password, 'admin');
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrative credentials or insufficient authorization.');
      }
    } catch (err: any) {
      setError(err?.message || 'Administrative login failed. Check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SkillNova@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#15243B] flex flex-col font-sans selection:bg-[#00A3FF]/20">
      {/* Header */}
      <nav className="h-20 border-b border-[#DFE9F6] px-6 md:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-md shadow-[#00A3FF]/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#176BFF]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#15243B]">
              Skill<span className="text-[#176BFF]">Nova</span>
            </span>
            <p className="text-[10px] text-[#73839B] font-bold uppercase tracking-wider -mt-0.5">
              Learn • Build • Explore • Grow
            </p>
          </div>
        </Link>

        <Link
          to="/student/login"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-bold text-[#73839B] hover:text-[#176BFF] transition shadow-xs"
        >
          <span>Student Portal</span>
        </Link>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#DFE9F6] p-8 shadow-xl shadow-[#00A3FF]/5 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center mx-auto border border-[#00A3FF]/25 shadow-sm">
              <Lock className="w-7 h-7 text-[#176BFF]" />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 font-mono">
                Privileged Access
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#15243B]">Administrator & Faculty Desk</h1>
            <p className="text-xs text-[#73839B]">
              Enter authorized administrative credentials to manage curriculums, review AI content, and provision student cohorts.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1.5">
                Authorized Admin or Faculty Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skillnova.edu"
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:outline-hidden focus:border-[#176BFF] transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1.5">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:outline-hidden focus:border-[#176BFF] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center justify-center gap-2 transition hover:scale-102"
            >
              {isLoading ? (
                <span>Verifying Security Clearance...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access for Evaluators */}
          <div className="pt-4 border-t border-[#DFE9F6] space-y-2">
            <span className="text-[11px] text-[#73839B] font-semibold block text-center">
              Evaluator Administrative Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@skillnova.edu')}
                className="p-2 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF3FF] border border-[#DFE9F6] text-[11px] font-bold text-[#15243B] transition"
              >
                Super Admin (Dr. Evelyn)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('mentor@skillnova.edu')}
                className="p-2 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF3FF] border border-[#DFE9F6] text-[11px] font-bold text-[#15243B] transition"
              >
                Sub-Admin (Vikram Patel)
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#F5F9FF] rounded-2xl border border-[#DFE9F6] text-center text-[11px] text-[#73839B]">
            Public registration is disabled. Super Admin accounts are provisioned via database migrations.
          </div>
        </div>
      </div>
    </div>
  );
};
