import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, BookOpen, Check, X, Lock, AlertCircle, PlusCircle } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { User, Course } from '../../types';

export const SubAdminManagementPage: React.FC = () => {
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const currentUser = dataService.getCurrentUser();

  const isSuperAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const update = () => {
      setSubAdmins(dataService.getSubAdmins());
      setCourses(dataService.getCourses());
    };
    update();
    return dataService.subscribe(update);
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="bg-[#101A2D] border border-rose-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-[#F0F5FF]">Access Restricted</h3>
        <p className="text-xs text-[#9BAAC2]">
          Sub-admins cannot create other administrators or alter global security permissions. This area is reserved for Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#77B4FF]" />
            Sub-Admin & Mentor Delegation
          </h1>
          <p className="text-xs text-[#9BAAC2] mt-0.5">
            Delegate course management, resource publishing, and AI content generation to trusted mentors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subAdmins.map((subAdmin) => {
          const assignedCourses = courses.filter(c => subAdmin.assigned_courses?.includes(c.id));

          return (
            <div
              key={subAdmin.id}
              className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <img
                  src={subAdmin.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                  alt={subAdmin.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#397BFF]/40"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#F0F5FF]">{subAdmin.full_name}</h3>
                  <div className="text-xs text-[#77B4FF]">{subAdmin.email}</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30 mt-1 inline-block">
                    ACADEMIC SUB-ADMIN
                  </span>
                </div>
              </div>

              {/* Course Scopes */}
              <div className="space-y-1.5 pt-2 border-t border-[#1F2E47]">
                <div className="text-xs font-semibold text-[#9BAAC2] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#397BFF]" />
                  Assigned Course Scopes:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {assignedCourses.map(c => (
                    <span
                      key={c.id}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#15233A] text-[#F0F5FF] border border-[#1F2E47]"
                    >
                      {c.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delegated Permissions Matrix */}
              <div className="space-y-1.5 pt-2 border-t border-[#1F2E47]">
                <div className="text-xs font-semibold text-[#9BAAC2]">Delegated Permissions:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Course & Topic Edit
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Resource Publishing
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> AI Review Studio
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <X className="w-3.5 h-3.5" /> Super Admin Settings
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
