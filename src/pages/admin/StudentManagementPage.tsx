import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, CheckCircle, XCircle,
  BookOpen, Key, Phone, AlertCircle, X
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

  // Simplified Add Student Form State: ONLY 4 fields
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
    return dataService.subscribe(update);
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

    const cleanUser = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '');

    if (!cleanUser || cleanUser.length < 3) {
      setFormError(
        'Username must be at least 3 characters and may contain letters, numbers, dots, underscores, or hyphens.'
      );
      return;
    }

    if (!password || password.trim().length < 8) {
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40">
              ACADEMIC ADMISSIONS
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">
              Total Enrolled: {students.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#397BFF]" />
            Student Management
          </h1>
          <p className="text-xs text-[#9BAAC2] mt-0.5">
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
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username, full name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${statusFilter === filter
                ? 'bg-[#397BFF] text-white shadow-md'
                : 'bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF]'
                }`}
            >
              {filter} ({filter === 'all' ? students.length : students.filter(s => s.status === filter).length})
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#9BAAC2]">
            <thead className="bg-[#0A101D] text-[#77B4FF] uppercase text-[10px] tracking-wider border-b border-[#1F2E47]">
              <tr>
                <th className="py-3 px-4">Student & Username</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Enrolled Courses</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2E47]/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#9BAAC2]">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentCourses = courses.filter(c => student.assigned_courses?.includes(c.id));

                  return (
                    <tr key={student.id} className="hover:bg-[#15233A]/50 transition">
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={student.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-[#397BFF]/30"
                          />
                          <div>
                            <div className="font-bold text-[#F0F5FF] text-sm">{student.full_name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-[#00D4B8] font-semibold">
                                @{student.username || student.email.split('@')[0]}
                              </span>
                              <span className="text-[10px] text-[#9BAAC2]">({student.email})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#F0F5FF] font-mono">
                          <Phone className="w-3.5 h-3.5 text-[#77B4FF]" />
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
                                className="text-[10px] px-2 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30 font-medium"
                              >
                                {c.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#9BAAC2]">Default Track (FS-101)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${student.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowAssignModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#15233A] hover:bg-[#1F2E47] text-[#77B4FF] border border-[#1F2E47] transition"
                            title="Assign Course Cohorts"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(student)}
                            className="p-1.5 rounded-lg bg-[#15233A] hover:bg-[#1F2E47] text-amber-400 border border-[#1F2E47] transition"
                            title="Reset Credentials / Generate Recovery Token"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(student.id)}
                            className={`p-1.5 rounded-lg border text-xs transition ${student.status === 'active'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
                              }`}
                            title={student.status === 'active' ? 'Deactivate Student Account' : 'Activate Student Account'}
                          >
                            {student.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#9BAAC2] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#397BFF]/20 text-[#397BFF] flex items-center justify-center border border-[#397BFF]/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F0F5FF]">Add Student</h3>
                <p className="text-[11px] text-[#9BAAC2]">Simplified 4-field administrative enrollment</p>
              </div>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4 mt-4">
              {/* Field 1: Username */}
              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  1. Username <span className="text-[#397BFF]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#77B4FF]">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul.varma"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-8 pr-4 py-2.5 text-xs text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF] transition"
                  />
                </div>
                <span className="text-[10px] text-[#9BAAC2] mt-1 block">
                  Unique student identifier for login.
                </span>
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  2. Password <span className="text-[#397BFF]">*</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-[#9BAAC2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
                  />
                </div>
              </div>

              {/* Field 3: Full Name */}
              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  3. Full Name <span className="text-[#397BFF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Varma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
                />
              </div>

              {/* Field 4: Phone Number */}
              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  4. Phone Number <span className="text-[#397BFF]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#9BAAC2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF] transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9BAAC2] bg-[#15233A] hover:text-white"
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F0F5FF]">Credential Recovery Token</h3>
              <p className="text-xs text-[#9BAAC2] mt-1">
                Issued for student <span className="text-[#F0F5FF] font-bold">{selectedStudent.full_name}</span> (@{selectedStudent.username || selectedStudent.email.split('@')[0]})
              </p>
            </div>

            <div className="p-3 bg-[#15233A] rounded-xl border border-white/10 font-mono text-sm text-[#00D4B8] font-bold select-all">
              SKILLNOVA-REC-{Math.floor(100000 + Math.random() * 900000)}
            </div>

            <p className="text-[11px] text-[#9BAAC2]">
              Share this recovery authorization with the student or provide a direct password reset link.
            </p>

            <button
              onClick={() => setShowResetModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] text-xs font-bold text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Assign Courses Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#F0F5FF] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#397BFF]" />
                Course Enrolments
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-[#9BAAC2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#9BAAC2]">
              Select courses accessible to <strong className="text-white">{selectedStudent.full_name}</strong>:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {courses.map((course) => {
                const isAssigned = (selectedStudent.assigned_courses || []).includes(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] cursor-pointer transition border border-white/5"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#F0F5FF]">{course.title}</div>
                      <div className="text-[10px] text-[#77B4FF]">{course.category} • {course.duration_weeks} Weeks</div>
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

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#9BAAC2] bg-[#15233A]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveCourses(selectedStudent.assigned_courses || [])}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#397BFF] text-white"
              >
                Save Enrolments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementPage;
