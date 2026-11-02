import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'sub_admin' | 'student')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, role, isLoading } = useAuth();
  const location = useLocation();

  // 1. DO NOT redirect while initial auth/session check is in flight!
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-lg shadow-[#00A3FF]/25 animate-pulse">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#176BFF]" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#15243B]">
          <Loader2 className="w-4 h-4 animate-spin text-[#176BFF]" />
          <span>Verifying SkillNova Authenticated Session...</span>
        </div>
      </div>
    );
  }

  // 2. If no user, redirect to appropriate login page, preserving path
  if (!currentUser) {
    const isStudentPath = location.pathname.startsWith('/student');
    const redirectPath = isStudentPath ? '/student/login' : '/admin/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 3. Check role restrictions
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If student tries to access admin
    if (role === 'student' && location.pathname.startsWith('/admin')) {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If admin tries to access student, allow admin inspection or redirect
  }

  return <>{children}</>;
};
