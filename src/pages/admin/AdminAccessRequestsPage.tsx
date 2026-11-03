import React, { useState, useEffect } from 'react';
import {
  UserPlus, CheckCircle2, XCircle, Clock, Search, Filter,
  Shield, Check, AlertCircle, ArrowRight, UserCheck, MessageSquare, BookOpen, Layers
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { StudentAccessRequest, Course } from '../../types';

export const AdminAccessRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<StudentAccessRequest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Approval modal state
  const [selectedRequest, setSelectedRequest] = useState<StudentAccessRequest | null>(null);
  const [assignBatch, setAssignBatch] = useState('Batch 2027');
  const [assignCourseId, setAssignCourseId] = useState('course-fs-101');
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Rejection modal state
  const [rejectingRequest, setRejectingRequest] = useState<StudentAccessRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  const loadData = () => {
    setRequests(dataService.getStudentAccessRequests());
    const courseList = dataService.getCourses();
    setCourses(courseList);
    if (courseList.length > 0) {
      setAssignCourseId(courseList[0].id);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await dataService.approveStudentAccessRequest(
        selectedRequest.id,
        assignBatch,
        assignCourseId,
        adminNote || 'Approved by Administrator. Student account activated.'
      );
      setSelectedRequest(null);
      setAdminNote('');
      loadData();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest) return;
    setIsProcessing(true);
    try {
      await dataService.rejectStudentAccessRequest(
        rejectingRequest.id,
        rejectionReason || 'Verification failed.'
      );
      setRejectingRequest(null);
      setRejectionReason('');
      loadData();
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.target_course || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-[#DFE9F6] p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 font-mono">
              ADMISSION QUEUE
            </span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#15243B]">
            Student Access Requests & Verification
          </h1>
          <p className="text-xs md:text-sm text-[#73839B]">
            Review prospective student submissions from the public homepage, verify WhatsApp group membership, assign academic cohorts, and activate institutional access.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#DFE9F6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#73839B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, college..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-[#176BFF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#73839B]" />
          <div className="flex items-center gap-1 bg-[#F5F9FF] p-1 rounded-xl border border-[#DFE9F6] text-xs">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize font-bold transition ${
                  statusFilter === s
                    ? 'bg-white text-[#176BFF] shadow-xs'
                    : 'text-[#73839B] hover:text-[#15243B]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-[#DFE9F6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F9FF] border-b border-[#DFE9F6] text-[#73839B] uppercase font-mono text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-bold">Student Name & Email</th>
                <th className="py-3.5 px-4 font-bold">College & Branch</th>
                <th className="py-3.5 px-4 font-bold">Target Cohort</th>
                <th className="py-3.5 px-4 font-bold">Payment Ref</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE9F6]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#73839B]">
                    No access requests found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F5F9FF]/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#15243B] text-xs">{req.full_name}</div>
                      <div className="text-[11px] text-[#73839B] font-mono">{req.email}</div>
                      {req.phone && (
                        <div className="text-[10px] text-emerald-600 font-mono">{req.phone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#15243B]">{req.college}</div>
                      <div className="text-[10px] text-[#73839B]">{req.branch} • {req.year_of_study}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#176BFF]">{req.target_course || 'Full Stack'}</span>
                      {req.assigned_batch && (
                        <div className="text-[10px] text-emerald-600 font-mono">Assigned: {req.assigned_batch}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#73839B]">
                      {req.payment_reference || 'PENDING'}
                    </td>

                    <td className="py-3.5 px-4">
                      {req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Approved
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setAdminNote('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingRequest(req);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#73839B]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15243B]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#15243B]">Approve Student Access</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-[#73839B]">
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#F5F9FF] rounded-2xl border border-[#DFE9F6] text-xs space-y-1">
              <div>
                Candidate: <strong className="text-[#15243B]">{selectedRequest.full_name}</strong>
              </div>
              <div>
                Email: <span className="font-mono text-[#176BFF]">{selectedRequest.email}</span>
              </div>
              <div>
                College: <span className="text-[#73839B]">{selectedRequest.college}</span>
              </div>
              <div>
                Ref: <span className="font-mono text-emerald-600 font-bold">{selectedRequest.payment_reference}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#73839B] block mb-1">Assign Batch</label>
                <select
                  value={assignBatch}
                  onChange={(e) => setAssignBatch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-semibold"
                >
                  <option value="Batch 2027">Batch 2027 (Current Cohort)</option>
                  <option value="Batch 2028">Batch 2028 (Junior Cohort)</option>
                  <option value="Batch 2026">Batch 2026 (Final Year Fast-Track)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#73839B] block mb-1">Assign Course Workspace</label>
                <select
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-semibold"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#73839B] block mb-1">Internal Note (Optional)</label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. WhatsApp verified. UPI payment reconciled."
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-[#F5F9FF] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                {isProcessing ? 'Activating...' : 'Confirm & Activate Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15243B]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
              <h3 className="text-base font-bold text-red-600">Reject Access Request</h3>
              <button onClick={() => setRejectingRequest(null)} className="text-[#73839B]">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#73839B]">
              Are you sure you want to decline access for <strong className="text-[#15243B]">{rejectingRequest.full_name}</strong>?
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#73839B] block mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Payment reference not found in bank ledger."
                className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 rounded-xl bg-[#F5F9FF] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccessRequestsPage;
