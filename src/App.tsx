import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { StudentLayout } from './layouts/StudentLayout';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { StudentLoginPage } from './pages/auth/StudentLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Shared Pages
import { PathfindersPage } from './pages/PathfindersPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentManagementPage } from './pages/admin/StudentManagementPage';
import { SubAdminManagementPage } from './pages/admin/SubAdminManagementPage';
import { CourseManagementPage } from './pages/admin/CourseManagementPage';
import { ResourcePublishingPage } from './pages/admin/ResourcePublishingPage';
import { AIContentGeneratorPage } from './pages/admin/AIContentGeneratorPage';
import { AdminSaturdaySpecialPage } from './pages/admin/AdminSaturdaySpecialPage';
import { AdminOpportunitiesPage } from './pages/admin/AdminOpportunitiesPage';
import { AdminDiscussionPage } from './pages/admin/AdminDiscussionPage';
import { AdminBlueprintsPage } from './pages/admin/AdminBlueprintsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentCourseDetailPage } from './pages/student/StudentCourseDetailPage';
import { StudentDiscussionPage } from './pages/student/StudentDiscussionPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing & Public Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="students" element={<StudentManagementPage />} />
            <Route path="subadmins" element={<SubAdminManagementPage />} />
            <Route path="courses" element={<CourseManagementPage />} />
            <Route path="resources" element={<ResourcePublishingPage />} />
            <Route path="ai-generator" element={<AIContentGeneratorPage />} />
            <Route path="opportunities" element={<AdminOpportunitiesPage />} />
            <Route path="saturday-special" element={<AdminSaturdaySpecialPage />} />
            <Route path="discussions" element={<AdminDiscussionPage />} />
            <Route path="pathfinders" element={<PathfindersPage />} />
            <Route path="blueprints" element={<AdminBlueprintsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>

          {/* Student Portal Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="courses" element={<StudentCoursesPage />} />
            <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
            <Route path="discussion" element={<StudentDiscussionPage />} />
            <Route path="pathfinders" element={<PathfindersPage />} />
            <Route path="notifications" element={<StudentNotificationsPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
            {/* Redirect legacy separate learning resources to courses workspace per Section 6 */}
            <Route path="resources" element={<Navigate to="/student/courses" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
