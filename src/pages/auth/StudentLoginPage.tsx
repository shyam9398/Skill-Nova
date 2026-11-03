import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, AlertCircle, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentLoginPage: React.FC = () => {
  const [email, setEmail] = useState('student');
  const [password, setPassword] = useState('SkillNova@2026');
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
      const res = await login(email, password, 'student');
      if (res.success) {
        navigate('/student/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check network connection.');
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
          to="/admin/login"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-bold text-[#73839B] hover:text-[#176BFF] transition shadow-xs"
        >
          <Lock className="w-3.5 h-3.5 text-[#176BFF]" />
          <span>Admin Portal</span>
        </Link>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#DFE9F6] p-8 shadow-xl shadow-[#00A3FF]/5 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center mx-auto border border-[#00A3FF]/25 shadow-sm">
              <GraduationCap className="w-7 h-7 text-[#176BFF]" />
            </div>
            <h1 className="text-2xl font-black text-[#15243B]">Student Workspace</h1>
            <p className="text-xs text-[#73839B]">
              Enter your registered student credentials provisioned by your department administrator.
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
                Registered Student Username or Email
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username (e.g. mohan) or registered email"
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:outline-hidden focus:border-[#176BFF] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#73839B]">Password</label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[11px] text-[#176BFF] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
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
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access for Evaluators */}
          <div className="pt-4 border-t border-[#DFE9F6] space-y-2">
            <span className="text-[11px] text-[#73839B] font-semibold block text-center">
              Evaluator Quick Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="p-2 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF3FF] border border-[#DFE9F6] text-[11px] font-bold text-[#15243B] transition"
              >
                Aarav Sharma (@student)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('pooja.verma')}
                className="p-2 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF3FF] border border-[#DFE9F6] text-[11px] font-bold text-[#15243B] transition"
              >
                Pooja Verma (@pooja.verma)
              </button>
            </div>
          </div>

          {/* Clear Notice: No public registration! */}
          <div className="p-3 bg-[#EAF3FF]/70 rounded-2xl border border-[#00A3FF]/25 text-center text-[11px] text-[#176BFF] font-medium">
            Account creation is restricted to authorized Administrators. Public sign up is disabled.
          </div>
        </div>
      </div>

      {/* Account Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-[#15243B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6 text-[#176BFF]" />
            </div>
            <h3 className="text-base font-bold text-[#15243B]">Administrator Account Recovery</h3>
            <p className="text-xs text-[#73839B] leading-relaxed">
              Student accounts are managed under institutional single-sign-on and administrative access control. To reset your password or recover access, contact your department coordinator or submit a recovery ticket.
            </p>
            <div className="p-3 rounded-2xl bg-[#F5F9FF] border border-[#DFE9F6] text-[11px] font-mono text-[#176BFF]">
              admin-support@skillnova.edu
            </div>
            <button
              onClick={() => setShowRecoveryModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#176BFF] text-white text-xs font-bold"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
