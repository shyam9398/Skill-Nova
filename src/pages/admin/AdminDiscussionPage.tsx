import React, { useState, useEffect } from 'react';
import {
  MessageSquare, UserCheck, CheckCircle2, Clock,
  AlertCircle, Send, Trash2, Filter, Shield, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import type { DiscussionPost, MentorRequest } from '../../types';

export const AdminDiscussionPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'mentor_requests' | 'general_moderation'>('mentor_requests');
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MentorRequest | null>(null);
  const [mentorReplyText, setMentorReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const update = () => {
      // Mentors and Admins see all requests
      setMentorRequests(dataService.getMentorRequests());
      setDiscussions(dataService.getDiscussions());
    };
    update();
    return dataService.subscribe(update);
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorReplyText.trim() || !selectedRequest) return;

    const updated = await dataService.addMentorRequestReply({
      request_id: selectedRequest.id,
      content: mentorReplyText,
      author_id: currentUser?.id,
      author_name: `${currentUser?.full_name} (${role === 'admin' ? 'Faculty Admin' : 'Assigned Mentor'})`,
      author_role: role || 'sub_admin'
    });

    if (updated) {
      setSelectedRequest(updated);
    }
    setMentorReplyText('');
  };

  const handleUpdateStatus = async (status: MentorRequest['status']) => {
    if (!selectedRequest) return;
    const updated = await dataService.updateMentorRequestStatus(selectedRequest.id, status);
    if (updated) {
      setSelectedRequest(updated);
    }
  };

  const filteredRequests = mentorRequests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE9F6] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#15243B] flex items-center gap-2">
            Discussion & Mentorship Hub
            <span className="text-xs font-bold text-[#176BFF] px-2.5 py-0.5 rounded-full bg-[#EAF3FF] border border-[#00A3FF]/25">
              Faculty Desk
            </span>
          </h1>
          <p className="text-xs text-[#73839B] mt-0.5">
            Resolve student 1-on-1 technical queries and moderate the campus general community.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F9FF] border border-[#DFE9F6] rounded-2xl">
          <button
            onClick={() => setActiveTab('mentor_requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'mentor_requests'
                ? 'bg-white text-[#176BFF] shadow-sm border border-[#DFE9F6]'
                : 'text-[#73839B] hover:text-[#15243B]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#176BFF]" />
            <span>Mentor Doubts Queue</span>
            {mentorRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {mentorRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('general_moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'general_moderation'
                ? 'bg-white text-[#00A3FF] shadow-sm border border-[#DFE9F6]'
                : 'text-[#73839B] hover:text-[#15243B]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#00A3FF]" />
            <span>Community Moderation</span>
          </button>
        </div>
      </div>

      {/* ================= MENTOR REQUESTS QUEUE ================= */}
      {activeTab === 'mentor_requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Requests Queue */}
          <div className="lg:col-span-5 space-y-3">
            {/* Filter */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#DFE9F6] shadow-xs">
              <Filter className="w-3.5 h-3.5 text-[#73839B]" />
              <div className="flex gap-1 overflow-x-auto text-xs">
                {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize text-[11px] transition ${
                      statusFilter === status
                        ? 'bg-[#EAF3FF] text-[#176BFF]'
                        : 'text-[#73839B] hover:bg-[#F5F9FF]'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredRequests.map(req => {
              const isSelected = selectedRequest?.id === req.id;
              const statusColors = {
                pending: 'bg-amber-100 text-amber-800',
                assigned: 'bg-blue-100 text-blue-800',
                in_progress: 'bg-[#EAF3FF] text-[#176BFF]',
                resolved: 'bg-emerald-100 text-emerald-800'
              };

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs space-y-2 ${
                    isSelected
                      ? 'border-[#176BFF] ring-2 ring-[#00A3FF]/20'
                      : 'border-[#DFE9F6] hover:border-[#00A3FF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#15243B] flex items-center gap-1.5">
                      <User className="w-3 h-3 text-[#176BFF]" />
                      {req.student_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[req.status]}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#15243B]">
                    {req.doubt_title}
                  </h4>
                  <p className="text-[11px] text-[#73839B] line-clamp-1">
                    {req.course_title}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Inquiry Resolution Studio */}
          <div className="lg:col-span-7">
            {selectedRequest ? (
              <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 shadow-sm space-y-5">
                {/* Header & Status Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE9F6]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EAF3FF] text-[#176BFF]">
                      {selectedRequest.course_title}
                    </span>
                    <h3 className="text-base font-bold text-[#15243B] mt-1.5">
                      {selectedRequest.doubt_title}
                    </h3>
                    <div className="text-xs text-[#73839B] mt-0.5">
                      Submitted by: <strong>{selectedRequest.student_name}</strong> ({selectedRequest.student_email})
                    </div>
                  </div>

                  {/* Status Controller */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedRequest.status === 'in_progress'
                          ? 'bg-[#176BFF] text-white shadow-sm'
                          : 'bg-[#F5F9FF] text-[#73839B] hover:bg-[#EAF3FF]'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedRequest.status === 'resolved'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-[#F5F9FF] text-[#73839B] hover:bg-emerald-50'
                      }`}
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                {/* Question Details */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-[#73839B] uppercase tracking-wider">
                    Student Query Details
                  </h5>
                  <p className="text-xs text-[#15243B] leading-relaxed bg-[#F5F9FF] p-4 rounded-2xl border border-[#DFE9F6]">
                    {selectedRequest.doubt_description}
                  </p>
                  {selectedRequest.code_snippet && (
                    <pre className="p-4 rounded-2xl bg-[#15243B] text-white text-[11px] font-mono overflow-x-auto">
                      <code>{selectedRequest.code_snippet}</code>
                    </pre>
                  )}
                </div>

                {/* Conversation Thread */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold text-[#73839B] uppercase tracking-wider">
                    Responses & Faculty Notes
                  </h5>
                  {selectedRequest.replies.map(r => (
                    <div
                      key={r.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        r.author_role === 'student'
                          ? 'bg-white border-[#DFE9F6]'
                          : 'bg-[#EAF3FF]/80 border-[#00A3FF]/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#15243B]">{r.author_name}</span>
                        <span className="text-[10px] text-[#73839B]">{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-[#15243B] leading-relaxed">{r.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-[#DFE9F6]">
                  <textarea
                    rows={3}
                    required
                    value={mentorReplyText}
                    onChange={(e) => setMentorReplyText(e.target.value)}
                    placeholder="Provide advice, guidance, code fix or meeting slot..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:outline-hidden focus:border-[#176BFF]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-bold shadow-md shadow-[#00A3FF]/20 flex items-center gap-2 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Faculty Response</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#DFE9F6] p-12 text-center text-xs text-[#73839B] shadow-xs">
                <UserCheck className="w-12 h-12 text-[#00A3FF] mx-auto mb-3 opacity-40" />
                Select any doubt from the left queue to review and guide the student.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= COMMUNITY MODERATION ================= */}
      {activeTab === 'general_moderation' && (
        <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE9F6]">
            <div>
              <h3 className="text-sm font-bold text-[#15243B]">Campus General Discussions</h3>
              <p className="text-xs text-[#73839B]">Review all public posts shared across cohorts.</p>
            </div>
            <span className="text-xs text-[#176BFF] font-mono font-bold bg-[#EAF3FF] px-3 py-1 rounded-full">
              {discussions.length} Active Posts
            </span>
          </div>

          <div className="divide-y divide-[#DFE9F6]">
            {discussions.map(post => (
              <div key={post.id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#15243B]">{post.author_name}</span>
                    <span className="text-[10px] text-[#73839B]">• {new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full bg-[#F5F9FF] text-[#176BFF] border border-[#DFE9F6]">
                      {post.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#15243B]">{post.title}</h4>
                  <p className="text-xs text-[#73839B] leading-relaxed line-clamp-2">{post.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs text-[#73839B]">
                  <span>{post.likes_count} likes</span>
                  <span>•</span>
                  <span>{post.replies_count} replies</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
