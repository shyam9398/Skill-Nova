import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogoutConfirmationModal: React.FC = () => {
  const { showLogoutModal, setShowLogoutModal, confirmLogout } = useAuth();
  const navigate = useNavigate();

  if (!showLogoutModal) return null;

  const handleConfirm = async () => {
    await confirmLogout();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-[#0B1530] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-white/10 p-6 max-w-sm w-full max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl space-y-5 text-center relative animate-scaleUp my-auto">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900/50 shadow-xs">
          <LogOut className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Confirm Sign Out</h3>
          <p className="text-xs text-slate-600 dark:text-[#9BAAC2] leading-relaxed">
            Are you sure you want to end your current session? You will be redirected to the public homepage.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
