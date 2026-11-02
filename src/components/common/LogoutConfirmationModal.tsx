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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15243B]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-sm w-full shadow-2xl space-y-5 text-center relative animate-scaleUp">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF] transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-xs">
          <LogOut className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-[#15243B]">Confirm Sign Out</h3>
          <p className="text-xs text-[#73839B] leading-relaxed">
            Are you sure you want to end your current session? You will be redirected to the public homepage.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF3FF] border border-[#DFE9F6] text-xs font-bold text-[#15243B] transition"
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
