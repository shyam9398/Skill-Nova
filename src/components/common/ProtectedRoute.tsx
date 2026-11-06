import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'sub_admin' | 'student')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, role, isLoading, confirmLogout } = useAuth();
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

  // 3. Deactivated or suspended account check
  if (currentUser.status && currentUser.status !== 'active') {
    void confirmLogout();
    return <Navigate to="/student/login?error=deactivated" replace />;
  }

  // 4. Strict Role-Based Access Isolation (Requirement 15)
  // Admin credentials must only access the admin dashboard
  if ((role === 'admin' || role === 'sub_admin') && location.pathname.startsWith('/student')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Student credentials must only access the student dashboard
  if (role === 'student' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Generic allowedRoles check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallbackPath = role === 'student' ? '/student/dashboard' : '/admin/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
