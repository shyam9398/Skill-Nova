import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, CheckCircle, XCircle,
  BookOpen, Key, Phone, AlertCircle, X, Eye, Edit3, Trash2
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { User, Course } from '../../types';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // View Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editYearOfStudy, setEditYearOfStudy] = useState('');
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Simplified Add Student Form State: ONLY 4 fields (Exact Casing Preserved)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  // Feedback banner
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const update = () => {
      setStudents(dataService.getStudents());
      setCourses(dataService.getCourses());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    void dataService.syncUsersFromSupabase();
    void dataService.syncCoursesFromSupabase();
    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone_number && s.phone_number.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Preserve exact case: uppercase, lowercase, numbers, dots, underscores, hyphens
    const cleanUser = username.trim().replace(/[^a-zA-Z0-9_.-]/g, '');

    if (!cleanUser || cleanUser.length < 3) {
      setFormError(
        'Username must be at least 3 characters and may contain letters (case-sensitive), numbers, dots, underscores, or hyphens.'
      );
      return;
    }

    if (!password || password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setFormError('Please enter a valid phone number (at least 8 characters).');
      return;
    }

    if (isCreatingStudent) return;

    setIsCreatingStudent(true);

    try {
      const res = await dataService.addStudent({
        username: cleanUser,
        password,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create student account.');
        return;
      }

      setFormSuccess(`Student account created successfully for @${cleanUser}!`);
      setStudents(dataService.getStudents());

      window.setTimeout(() => {
        setShowAddModal(false);
        setUsername('');
        setPassword('');
        setFullName('');
        setPhoneNumber('');
        setFormSuccess(null);

        setActionNotice({
          type: 'success',
          message: `Student @${cleanUser} (${fullName.trim()}) created successfully.`,
        });

        window.setTimeout(() => setActionNotice(null), 5000);
      }, 1000);
    } catch (error) {
      console.error('[SkillNova] Student creation failed:', error);
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating student.'
      );
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    dataService.toggleUserStatus(id);
    const updated = dataService.getUserById(id);
    setActionNotice({
      type: 'success',
      message: `Account for ${updated?.full_name} is now ${updated?.status?.toUpperCase()}.`
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResetPassword = (student: User) => {
    dataService.resetUserPassword(student.id);
    setSelectedStudent(student);
    setShowResetModal(true);
  };

  const handleSaveCourses = (courseIds: string[]) => {
    if (selectedStudent) {
      dataService.assignStudentCourses(selectedStudent.id, courseIds);
      setShowAssignModal(false);
      setActionNotice({
        type: 'success',
        message: `Course assignments updated for ${selectedStudent.full_name}.`
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleOpenEdit = (student: User) => {
    setEditingStudent(student);
    setEditFullName(student.full_name || '');
    setEditPhone(student.phone_number || student.phone || '');
    setEditCollege(student.college || '');
    setEditBranch(student.branch || '');
    setEditYearOfStudy(student.year_of_study || '');
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsUpdatingStudent(true);
    try {
      const res = await dataService.updateStudent(editingStudent.id, {
        full_name: editFullName.trim(),
        phone_number: editPhone.trim(),
        college: editCollege.trim(),
        branch: editBranch.trim(),
        year_of_study: editYearOfStudy.trim(),
      });
      if (res.success) {
        setStudents(dataService.getStudents());
        setShowEditModal(false);
        setActionNotice({
          type: 'success',
          message: `Student details for ${editFullName.trim()} updated successfully in Supabase.`
        });
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setActionNotice({
          type: 'error',
          message: res.error || 'Failed to update student.'
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Error updating student.'
      });
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    try {
      const res = await dataService.deleteStudent(studentToDelete.id);
      if (res.success) {
        setStudents(dataService.getStudents());
        setShowDeleteModal(false);
        setStudentToDelete(null);
        setActionNotice({
          type: 'success',
          message: `Student account deleted successfully and purged from system.`
        });
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setActionNotice({
          type: 'error',
          message: res.error || 'Failed to delete student.'
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Error deleting student.'
      });
    } finally {
      setIsDeletingStudent(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Action Notification */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg animate-fadeIn ${actionNotice.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {actionNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#397BFF]/15 text-[#176BFF] dark:text-[#77B4FF] border border-[#397BFF]/30">
              ACADEMIC ADMISSIONS
            </span>
            <span className="text-xs text-slate-600 dark:text-[#9BAAC2] font-mono">
              Total Enrolled: {students.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#176BFF] dark:text-[#397BFF]" />
            Student Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#9BAAC2] mt-0.5">
            Simplified account creation: username, password, full name, and phone. Fully secure server-side provisioning.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setFormSuccess(null);
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#9BAAC2] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username, full name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-[#1F2E47] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${statusFilter === filter
                ? 'bg-[#397BFF] text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#15233A] text-slate-700 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-[#F0F5FF]'
                }`}
            >
              {filter} ({filter === 'all' ? students.length : students.filter(s => s.status === filter).length})
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-[#9BAAC2]">
            <thead className="bg-slate-50 dark:bg-[#0A101D] text-slate-800 dark:text-[#77B4FF] uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-[#1F2E47]">
              <tr>
                <th className="py-3 px-4 font-bold">Student & Username</th>
                <th className="py-3 px-4 font-bold">Contact Phone</th>
                <th className="py-3 px-4 font-bold">Enrolled Courses</th>
                <th className="py-3 px-4 font-bold">Account Status</th>
                <th className="py-3 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1F2E47]/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-[#9BAAC2]">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentCourses = courses.filter(c => student.assigned_courses?.includes(c.id));

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-[#15233A]/50 transition">
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={student.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-[#397BFF]/30"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-[#F0F5FF] text-sm">{student.full_name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-[#0284C7] dark:text-[#00D4B8] font-semibold">
                                @{student.username || student.email.split('@')[0]}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">({student.email})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-[#F0F5FF] font-mono">
                          <Phone className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#77B4FF]" />
                          <span>{student.phone_number || student.phone || '+91 98765 43210'}</span>
                        </div>
                      </td>

                      {/* Assigned Courses */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {studentCourses.length > 0 ? (
                            studentCourses.map(c => (
                              <span
                                key={c.id}
                                className="text-[10px] px-2 py-0.5 rounded bg-sky-50 dark:bg-[#397BFF]/20 text-[#0369A1] dark:text-[#77B4FF] border border-sky-200 dark:border-[#397BFF]/30 font-medium"
                              >
                                {c.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Default Track (FS-101)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${student.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => {
                              setViewingStudent(student);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-teal-600 dark:text-[#00D4B8] border border-slate-200 dark:border-[#1F2E47] transition"
                            title="View Student Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-[#176BFF] dark:text-[#77B4FF] border border-slate-200 dark:border-[#1F2E47] transition"
                            title="Edit Student Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Assign Courses */}
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowAssignModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-[#397BFF] border border-slate-200 dark:border-[#1F2E47] transition"
                            title="Assign Course Cohorts"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Token */}
                          <button
                            onClick={() => handleResetPassword(student)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-[#1F2E47] transition"
                            title="Reset Credentials / Generate Recovery Token"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(student.id)}
                            className={`p-1.5 rounded-lg border text-xs transition ${student.status === 'active'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20'
                              }`}
                            title={student.status === 'active' ? 'Deactivate Student Account' : 'Activate Student Account'}
                          >
                            {student.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setStudentToDelete(student);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition"
                            title="Delete Student Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Add Student Modal: ONLY Username, Password, Full Name, Phone Number */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden text-slate-900 dark:text-[#F0F5FF]">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#397BFF]/15 text-[#176BFF] dark:text-[#397BFF] flex items-center justify-center border border-[#397BFF]/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Add Student</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">Simplified 4-field administrative enrollment</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 dark:text-[#9BAAC2] hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Field 1: Username */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                    1. Username <span className="text-[#397BFF]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#176BFF] dark:text-[#77B4FF]">@</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.varma"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF] transition placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] mt-1 block">
                    Unique student identifier for login. Case-sensitive.
                  </span>
                </div>

                {/* Field 2: Password */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                    2. Password <span className="text-[#397BFF]">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAC2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#397BFF] transition placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Field 3: Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                    3. Full Name <span className="text-[#397BFF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Varma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#397BFF] transition placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* Field 4: Phone Number */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                    4. Phone Number <span className="text-[#397BFF]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAC2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF] transition placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStudent}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingStudent ? 'Creating Student...' : 'Save & Provision Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101A2D] border border-amber-300 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-scaleUp text-slate-900 dark:text-[#F0F5FF]">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-500/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-[#F0F5FF]">Credential Recovery Token</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BAAC2] mt-1">
                Issued for student <span className="text-slate-900 dark:text-[#F0F5FF] font-bold">{selectedStudent.full_name}</span> (@{selectedStudent.username || selectedStudent.email.split('@')[0]})
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#15233A] rounded-xl border border-slate-200 dark:border-white/10 font-mono text-sm text-teal-700 dark:text-[#00D4B8] font-bold select-all">
              SKILLNOVA-REC-{Math.floor(100000 + Math.random() * 900000)}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#9BAAC2]">
              Share this recovery authorization with the student or provide a direct password reset link.
            </p>

            <button
              onClick={() => setShowResetModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-xs font-bold text-slate-800 dark:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Assign Courses Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden text-slate-900 dark:text-[#F0F5FF]">
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-between shrink-0">
              <h3 className="text-base font-black text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#176BFF] dark:text-[#397BFF]" />
                Course Enrolments
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 dark:text-[#9BAAC2] hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
                Select courses accessible to <strong className="text-slate-900 dark:text-white font-bold">{selectedStudent.full_name}</strong>:
              </p>

              <div className="space-y-2">
                {courses.map((course) => {
                  const isAssigned = (selectedStudent.assigned_courses || []).includes(course.id);
                  return (
                    <label
                      key={course.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] hover:bg-slate-100 dark:hover:bg-[#1F2E47] cursor-pointer transition border border-slate-200 dark:border-white/5"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">{course.title}</div>
                        <div className="text-[10px] text-[#0369A1] dark:text-[#77B4FF]">{course.category} • {course.duration_weeks} Weeks</div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={isAssigned}
                        onChange={(e) => {
                          const current = selectedStudent.assigned_courses || [];
                          const next = e.target.checked
                            ? [...current, course.id]
                            : current.filter(id => id !== course.id);
                          setSelectedStudent({ ...selectedStudent, assigned_courses: next });
                        }}
                        className="w-4 h-4 rounded text-[#397BFF] focus:ring-0"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveCourses(selectedStudent.assigned_courses || [])}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#176BFF] hover:bg-[#00A3FF] text-white shadow-md shadow-[#176BFF]/25 transition"
              >
                Save Enrolments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {showViewModal && viewingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden text-slate-900 dark:text-[#F0F5FF]">
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-[#00D4B8]/20 text-teal-700 dark:text-[#00D4B8] flex items-center justify-center border border-teal-300 dark:border-[#00D4B8]/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Student Details</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">Detailed academic record and profile information</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 dark:text-[#9BAAC2] hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-[#1F2E47]">
                <img
                  src={viewingStudent.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={viewingStudent.full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#397BFF]/40"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-[#F0F5FF]">{viewingStudent.full_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-semibold text-[#0284C7] dark:text-[#00D4B8]">
                      @{viewingStudent.username || viewingStudent.email.split('@')[0]}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${viewingStudent.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                    >
                      {viewingStudent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A]/70 border border-slate-200 dark:border-[#1F2E47]">
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Email</span>
                  <span className="text-slate-900 dark:text-[#F0F5FF] font-mono break-all">{viewingStudent.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A]/70 border border-slate-200 dark:border-[#1F2E47]">
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Phone Number</span>
                  <span className="text-slate-900 dark:text-[#F0F5FF] font-mono">{viewingStudent.phone_number || viewingStudent.phone || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A]/70 border border-slate-200 dark:border-[#1F2E47]">
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">College</span>
                  <span className="text-slate-900 dark:text-[#F0F5FF]">{viewingStudent.college || 'SkillNova Academy'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A]/70 border border-slate-200 dark:border-[#1F2E47]">
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Branch / Year</span>
                  <span className="text-slate-900 dark:text-[#F0F5FF]">
                    {viewingStudent.branch || 'CSE'} {viewingStudent.year_of_study ? `(${viewingStudent.year_of_study})` : ''}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A]/70 border border-slate-200 dark:border-[#1F2E47]">
                <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1.5">Enrolled Courses</span>
                <div className="flex flex-wrap gap-1.5">
                  {courses.filter(c => viewingStudent.assigned_courses?.includes(c.id)).length > 0 ? (
                    courses.filter(c => viewingStudent.assigned_courses?.includes(c.id)).map(c => (
                      <span
                        key={c.id}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-[#397BFF]/20 text-[#0369A1] dark:text-[#77B4FF] border border-sky-200 dark:border-[#397BFF]/30 font-medium"
                      >
                        {c.title}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-[#9BAAC2]">Default Track (FS-101)</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A]/40 border border-slate-200 dark:border-[#1F2E47]/50 text-[10px] text-slate-500 dark:text-[#9BAAC2] font-mono flex justify-between items-center">
                <span>Account ID: {viewingStudent.id}</span>
                <span>Enrolled: {viewingStudent.created_at ? new Date(viewingStudent.created_at).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end shrink-0">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-xs font-bold text-slate-800 dark:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Details Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-[#1F2E47] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-[#397BFF]/20 dark:text-[#397BFF] flex items-center justify-center border border-sky-200 dark:border-[#397BFF]/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Edit Student</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">
                    Updating @{editingStudent.username || editingStudent.email.split('@')[0]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">College</label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Delhi"
                      value={editCollege}
                      onChange={(e) => setEditCollege(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#397BFF] transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE"
                      value={editBranch}
                      onChange={(e) => setEditBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#397BFF] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Year of Study</label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd Year"
                    value={editYearOfStudy}
                    onChange={(e) => setEditYearOfStudy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#397BFF] transition"
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStudent}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  {isUpdatingStudent ? 'Saving...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101A2D] border border-rose-300 dark:border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Delete Student Account</h3>
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Irreversible administrative action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#9BAAC2] leading-relaxed">
              Are you sure you want to permanently delete the student account for{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{studentToDelete.full_name}</strong> (
              <span className="font-mono text-cyan-700 dark:text-[#00D4B8] font-semibold">@{studentToDelete.username || studentToDelete.email.split('@')[0]}</span>
              )?
            </p>

            <div className="p-3 my-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-[11px] leading-relaxed">
              <strong>Warning:</strong> This will revoke all sessions, delete enrollment records, remove profile data, and immediately purge login access in Supabase.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                {isDeletingStudent ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementPage;
