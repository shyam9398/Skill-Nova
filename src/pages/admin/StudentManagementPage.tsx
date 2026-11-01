import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, FileSpreadsheet, Search, CheckCircle, XCircle,
  RotateCcw, BookOpen, Filter, Download, MoreVertical, ShieldAlert
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
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Manual Add Form State
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    email: '',
    college: 'Apex Institute of Technology',
    branch: 'Computer Science & Engineering',
    year_of_study: '3rd Year (Batch 2027)',
    assigned_courses: ['course-fs-101'],
  });

  // CSV State
  const [csvText, setCsvText] = useState(
    `name,email,college,branch,year\nDev Sharma,dev.sharma@skillnova.edu,National Institute of Tech,CSE,3rd Year\nSneha Patel,sneha.patel@skillnova.edu,Metropolitan College,IT,4th Year\nAnanya Rao,ananya.rao@skillnova.edu,Apex Tech,AI & Data Science,2nd Year`
  );
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  // Reset alert
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);

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
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.full_name || !newStudent.email) return;

    dataService.addStudent({
      ...newStudent,
      role: 'student',
    });

    setShowAddModal(false);
    setNewStudent({
      full_name: '',
      email: '',
      college: 'Apex Institute of Technology',
      branch: 'Computer Science & Engineering',
      year_of_study: '3rd Year (Batch 2027)',
      assigned_courses: ['course-fs-101'],
    });
  };

  const handleCsvImport = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setCsvMessage('CSV must contain at least 1 header line and 1 data row.');
        return;
      }
      const rows = lines.slice(1).map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0] || 'Student',
          email: parts[1] || '',
          college: parts[2] || 'Engineering Institute',
          branch: parts[3] || 'CSE',
          year: parts[4] || '3rd Year',
        };
      });

      const count = dataService.importStudentsCSV(rows);
      setCsvMessage(`Successfully enrolled ${count} students into SkillNova!`);
      setTimeout(() => {
        setShowCsvModal(false);
        setCsvMessage(null);
      }, 1200);
    } catch {
      setCsvMessage('Failed to parse CSV. Please verify column format.');
    }
  };

  const handleToggleStatus = (id: string) => {
    dataService.toggleUserStatus(id);
  };

  const handleResetAccess = (student: User) => {
    setRecoveryNotice(`Secure credential recovery token generated for ${student.full_name}: SKILLNOVA-REC-${Math.floor(100000 + Math.random() * 900000)}. Instructions sent to ${student.email}.`);
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleSaveCourses = (courseIds: string[]) => {
    if (selectedStudent) {
      dataService.assignStudentCourses(selectedStudent.id, courseIds);
      setShowAssignModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#397BFF]" />
            Student Cohort Management
          </h1>
          <p className="text-xs text-[#9BAAC2] mt-0.5">
            Initial cohort: 50 target students. Enforce enrollment, course scopes, and recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-xs font-semibold text-[#F0F5FF] flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#77B4FF]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#397BFF] hover:bg-[#2868ea] text-white text-xs font-bold shadow-lg shadow-[#397BFF]/30 flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Recovery notification banner */}
      {recoveryNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{recoveryNotice}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, college, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F0F5FF] placeholder-[#9BAAC2]/50 focus:border-[#397BFF] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-[#9BAAC2]">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-1.5 text-xs text-[#F0F5FF] outline-none"
          >
            <option value="all">All Statuses ({students.length})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#15233A] border-b border-[#1F2E47] text-[#9BAAC2] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Academic Details</th>
                <th className="py-3 px-4">Enrolled Courses</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2E47]/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#9BAAC2]">
                    No students match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentCourses = courses.filter(c => student.assigned_courses?.includes(c.id));

                  return (
                    <tr key={student.id} className="hover:bg-[#15233A]/50 transition">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={student.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-[#397BFF]/30"
                          />
                          <div>
                            <div className="font-bold text-[#F0F5FF]">{student.full_name}</div>
                            <div className="text-[11px] text-[#77B4FF]">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* College & Branch */}
                      <td className="py-3 px-4">
                        <div className="text-[#F0F5FF] font-medium">{student.college}</div>
                        <div className="text-[11px] text-[#9BAAC2]">{student.branch} • {student.year_of_study}</div>
                      </td>

                      {/* Assigned Courses */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {studentCourses.length > 0 ? (
                            studentCourses.map(c => (
                              <span
                                key={c.id}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30 font-medium"
                              >
                                {c.category}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#9BAAC2]">No courses assigned</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            student.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowAssignModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#15233A] hover:bg-[#1F2E47] text-[#77B4FF] border border-[#1F2E47] transition"
                            title="Assign Courses & Batches"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetAccess(student)}
                            className="p-1.5 rounded-lg bg-[#15233A] hover:bg-[#1F2E47] text-[#9BAAC2] hover:text-[#F0F5FF] border border-[#1F2E47] transition"
                            title="Reset Access / Password Recovery"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(student.id)}
                            className={`p-1.5 rounded-lg border text-xs transition ${
                              student.status === 'active'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                            title={student.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
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

      {/* Manual Student Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#397BFF]" />
              Add Student to SkillNova
            </h3>
            <p className="text-xs text-[#9BAAC2] mb-4">
              Enter official student details. Student will be provisioned with default course roadmaps.
            </p>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@skillnova.edu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">College</label>
                  <input
                    type="text"
                    value={newStudent.college}
                    onChange={(e) => setNewStudent({ ...newStudent, college: e.target.value })}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Branch</label>
                  <input
                    type="text"
                    value={newStudent.branch}
                    onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Year of Study</label>
                <input
                  type="text"
                  value={newStudent.year_of_study}
                  onChange={(e) => setNewStudent({ ...newStudent, year_of_study: e.target.value })}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#9BAAC2] bg-[#15233A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#397BFF] text-white hover:bg-[#2868ea]"
                >
                  Create & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#77B4FF]" />
              Import Students via CSV
            </h3>
            <p className="text-xs text-[#9BAAC2] mb-3">
              Paste CSV records below or edit sample entries. Header format: <code className="text-[#77B4FF]">name,email,college,branch,year</code>.
            </p>

            {csvMessage && (
              <div className="p-3 mb-3 rounded-lg bg-[#397BFF]/20 text-[#77B4FF] text-xs font-semibold">
                {csvMessage}
              </div>
            )}

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl p-3 text-xs font-mono text-[#F0F5FF] outline-none focus:border-[#397BFF]"
            />

            <div className="pt-3 flex items-center justify-between">
              <span className="text-[11px] text-[#9BAAC2]">
                {csvText.trim().split('\n').length - 1} records ready to import
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#9BAAC2] bg-[#15233A]"
                >
                  Close
                </button>
                <button
                  onClick={handleCsvImport}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#397BFF] text-white hover:bg-[#2868ea]"
                >
                  Execute Bulk Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Assignment Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-1">
              Assign Courses: {selectedStudent.full_name}
            </h3>
            <p className="text-xs text-[#9BAAC2] mb-4">
              Select which course roadmaps and topic feeds this student can access.
            </p>

            <div className="space-y-2 mb-4">
              {courses.map(course => {
                const isAssigned = selectedStudent.assigned_courses?.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#15233A] border border-[#1F2E47] text-xs cursor-pointer hover:border-[#397BFF]/50 transition"
                  >
                    <div>
                      <div className="font-bold text-[#F0F5FF]">{course.title}</div>
                      <div className="text-[10px] text-[#77B4FF]">{course.category} • {course.mentor_name}</div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={isAssigned}
                      onChange={(e) => {
                        const current = selectedStudent.assigned_courses || [];
                        const updated = e.target.checked
                          ? [...current, course.id]
                          : current.filter(id => id !== course.id);
                        setSelectedStudent({ ...selectedStudent, assigned_courses: updated });
                      }}
                      className="accent-[#397BFF] w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#9BAAC2] bg-[#15233A]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveCourses(selectedStudent.assigned_courses || [])}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#397BFF] text-white hover:bg-[#2868ea]"
              >
                Save Course Enrollments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
