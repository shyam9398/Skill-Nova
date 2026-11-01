import React, { useState, useEffect } from 'react';
import {
  MessageSquare, UserCheck, Plus, ThumbsUp, MessageCircle, Send,
  HelpCircle, Clock, CheckCircle2, AlertCircle, Code, Filter, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import type { DiscussionPost, DiscussionReply, MentorRequest, Course } from '../../types';

export const StudentDiscussionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'mentor'>('general');

  // General Discussion State
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<DiscussionPost | null>(null);
  const [postReplies, setPostReplies] = useState<DiscussionReply[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'general' | 'project' | 'resources' | 'tech'>('general');
  const [replyInput, setReplyInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Request a Mentor State
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [doubtTopic, setDoubtTopic] = useState('');
  const [doubtTitle, setDoubtTitle] = useState('');
  const [doubtDescription, setDoubtDescription] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [mentorPriority, setMentorPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedRequest, setSelectedRequest] = useState<MentorRequest | null>(null);
  const [mentorReplyInput, setMentorReplyInput] = useState('');

  useEffect(() => {
    const refresh = () => {
      setDiscussions(dataService.getDiscussions());
      if (currentUser) {
        // Enforce private channel: student only receives their own mentor requests
        setMentorRequests(dataService.getMentorRequests(currentUser.id));
        setCourses(dataService.getEnrolledCoursesForStudent(currentUser.id));
      }
    };
    refresh();
    return dataService.subscribe(refresh);
  }, [currentUser]);

  useEffect(() => {
    if (selectedPost) {
      setPostReplies(dataService.getDiscussionReplies(selectedPost.id));
    }
  }, [selectedPost, discussions]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    dataService.createDiscussionPost({
      title: newTitle,
      content: newContent,
      category: newCategory,
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
      author_batch: currentUser?.year_of_study || 'Batch 2027',
      tags: [newCategory.toUpperCase(), 'SkillNova']
    });

    setNewTitle('');
    setNewContent('');
    setShowNewPostModal(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedPost) return;

    dataService.addDiscussionReply({
      post_id: selectedPost.id,
      content: replyInput,
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
      author_role: 'student'
    });

    setReplyInput('');
    setPostReplies(dataService.getDiscussionReplies(selectedPost.id));
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) return;
    dataService.toggleLikeDiscussion(postId, currentUser.id);
  };

  const handleCreateMentorRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtTitle.trim() || !doubtDescription.trim() || !selectedCourseId) return;

    const course = courses.find(c => c.id === selectedCourseId);

    dataService.createMentorRequest({
      student_id: currentUser?.id,
      student_name: currentUser?.full_name,
      student_email: currentUser?.email,
      course_id: selectedCourseId,
      course_title: course?.title || 'Enrolled Course',
      topic_title: doubtTopic || 'Course Curriculum',
      assigned_mentor_name: course?.mentor_name || 'Assigned Mentor',
      doubt_title: doubtTitle,
      doubt_description: doubtDescription,
      code_snippet: codeSnippet || undefined,
      priority: mentorPriority
    });

    setDoubtTitle('');
    setDoubtDescription('');
    setCodeSnippet('');
    setShowMentorModal(false);
  };

  const handleSendMentorReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorReplyInput.trim() || !selectedRequest) return;

    const updated = dataService.addMentorRequestReply({
      request_id: selectedRequest.id,
      content: mentorReplyInput,
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_role: 'student'
    });

    if (updated) {
      setSelectedRequest(updated);
    }
    setMentorReplyInput('');
  };

  const filteredDiscussions = discussions.filter(d => {
    if (filterCategory === 'all') return true;
    return d.category === filterCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header and Channel Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE9F6] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#15243B] flex items-center gap-2">
            Discussion Room
            <span className="text-xs font-bold text-[#176BFF] px-2.5 py-0.5 rounded-full bg-[#EAF3FF] border border-[#00A3FF]/25">
              Community Hub
            </span>
          </h1>
          <p className="text-xs text-[#73839B] mt-0.5">
            Collaborate with fellow engineers in General Discussion or consult faculty in private Request a Mentor.
          </p>
        </div>

        {/* Channel Selection Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F9FF] border border-[#DFE9F6] rounded-2xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'general'
                ? 'bg-white text-[#176BFF] shadow-sm border border-[#DFE9F6]'
                : 'text-[#73839B] hover:text-[#15243B]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#176BFF]" />
            <span>General Discussion</span>
          </button>

          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'mentor'
                ? 'bg-white text-[#00A3FF] shadow-sm border border-[#DFE9F6]'
                : 'text-[#73839B] hover:text-[#15243B]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#00A3FF]" />
            <span>Request a Mentor</span>
            {mentorRequests.filter(r => r.status === 'in_progress').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#00A3FF] animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* ================= CHANNEL A: GENERAL DISCUSSION ================= */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Discussion Posts Feed */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter and New Post Trigger */}
            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DFE9F6] shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'tech', 'project', 'resources'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                      filterCategory === cat
                        ? 'bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/30'
                        : 'text-[#73839B] hover:bg-[#F5F9FF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-bold shadow-md shadow-[#00A3FF]/20 flex items-center gap-1.5 shrink-0 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Start Discussion</span>
              </button>
            </div>

            {/* Posts List */}
            {filteredDiscussions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#DFE9F6] text-xs text-[#73839B]">
                No discussions in this category yet. Be the first to start a conversation!
              </div>
            ) : (
              filteredDiscussions.map(post => {
                const isSelected = selectedPost?.id === post.id;
                const hasLiked = currentUser ? post.liked_by_user_ids.includes(currentUser.id) : false;

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs ${
                      isSelected
                        ? 'border-[#176BFF] shadow-md ring-2 ring-[#00A3FF]/15'
                        : 'border-[#DFE9F6] hover:border-[#00A3FF]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={post.author_name}
                          className="w-9 h-9 rounded-full object-cover border border-[#DFE9F6]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#15243B] flex items-center gap-1.5">
                            {post.author_name}
                            <span className="text-[10px] font-mono text-[#00A3FF] bg-[#EAF3FF] px-2 py-0.2 rounded-full">
                              {post.author_batch}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#73839B]">
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F9FF] text-[#176BFF] border border-[#DFE9F6]">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#15243B] mt-3">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#73839B] mt-1.5 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#DFE9F6] text-xs text-[#73839B]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post.id);
                        }}
                        className={`flex items-center gap-1.5 font-semibold transition ${
                          hasLiked ? 'text-[#176BFF]' : 'hover:text-[#176BFF]'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes_count} Likes</span>
                      </button>

                      <div className="flex items-center gap-1.5 font-semibold text-[#00A3FF]">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.replies_count} Replies</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Discussion Thread & Replies */}
          <div className="lg:col-span-5">
            {selectedPost ? (
              <div className="bg-white rounded-3xl border border-[#DFE9F6] p-5 shadow-sm space-y-4 sticky top-24">
                <div className="border-b border-[#DFE9F6] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#176BFF] font-mono">
                    {selectedPost.category}
                  </span>
                  <h3 className="text-base font-bold text-[#15243B] mt-2">
                    {selectedPost.title}
                  </h3>
                  <p className="text-xs text-[#15243B]/80 mt-1.5 leading-relaxed">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Replies Thread */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {postReplies.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#73839B]">
                      No replies yet. Join the conversation!
                    </div>
                  ) : (
                    postReplies.map(reply => (
                      <div key={reply.id} className="p-3 bg-[#F5F9FF] rounded-2xl border border-[#DFE9F6] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#15243B] text-[11px] flex items-center gap-1.5">
                            {reply.author_name}
                            {reply.author_role !== 'student' && (
                              <span className="text-[9px] bg-[#EAF3FF] text-[#176BFF] px-1.5 py-0.2 rounded font-bold">
                                MENTOR
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-[#73839B]">
                            {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#15243B]/80 leading-relaxed text-[11px]">
                          {reply.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input Form */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-[#DFE9F6]">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:outline-hidden focus:border-[#176BFF]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#176BFF] hover:bg-[#1358d4] text-white transition shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#DFE9F6] p-8 text-center text-xs text-[#73839B] shadow-xs">
                <MessageSquare className="w-10 h-10 text-[#00A3FF] mx-auto mb-2 opacity-50" />
                Select any discussion on the left to read and participate in the community thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CHANNEL B: REQUEST A MENTOR ================= */}
      {activeTab === 'mentor' && (
        <div className="space-y-6">
          {/* Top Info & New Request Trigger */}
          <div className="bg-gradient-to-r from-[#EAF3FF] via-white to-[#F5F9FF] p-6 rounded-3xl border border-[#DFE9F6] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#176BFF] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#00A3FF]" />
                Confidential Faculty Advisory
              </span>
              <h2 className="text-lg font-black text-[#15243B]">
                Private 1-on-1 Mentor Support
              </h2>
              <p className="text-xs text-[#73839B] max-w-xl">
                Submit specific technical doubts, architecture questions, or code debugging requests directly to your assigned course mentors.
              </p>
            </div>

            <button
              onClick={() => setShowMentorModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-xs font-bold shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 shrink-0 hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Doubt to Mentor</span>
            </button>
          </div>

          {/* Mentor Requests List */}
          {mentorRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#DFE9F6] shadow-xs space-y-3">
              <UserCheck className="w-12 h-12 text-[#00A3FF] mx-auto opacity-40" />
              <h3 className="text-sm font-bold text-[#15243B]">No Mentor Requests Yet</h3>
              <p className="text-xs text-[#73839B] max-w-sm mx-auto">
                Whenever you encounter architectural challenges or debugging blockers in your courses, submit a request here for direct faculty guidance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentorRequests.map(req => {
                const statusColors = {
                  pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
                  in_progress: 'bg-[#EAF3FF] text-[#176BFF] border-[#00A3FF]/30',
                  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                };

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="p-5 rounded-3xl bg-white border border-[#DFE9F6] hover:border-[#176BFF] transition shadow-xs cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F9FF] text-[#73839B] border border-[#DFE9F6]">
                        {req.course_title}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[req.status]}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#15243B]">
                      {req.doubt_title}
                    </h4>
                    <p className="text-xs text-[#73839B] line-clamp-2 leading-relaxed">
                      {req.doubt_description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#DFE9F6] text-xs">
                      <span className="text-[11px] text-[#73839B]">
                        Assigned Mentor: <strong className="text-[#15243B]">{req.assigned_mentor_name}</strong>
                      </span>
                      <span className="text-[11px] font-semibold text-[#176BFF]">
                        {req.replies.length} Responses
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New General Discussion Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-[#15243B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#15243B]">Start a Community Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#73839B]">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next.js 15 Server Actions best practices"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#73839B]">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] mt-1"
                >
                  <option value="general">General</option>
                  <option value="tech">Technology</option>
                  <option value="project">Project Collaboration</option>
                  <option value="resources">Learning Resources</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#73839B]">Content</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details, architecture questions, or insights..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#73839B] hover:bg-[#F5F9FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-[#1358d4] text-white text-xs font-bold shadow-md shadow-[#00A3FF]/20"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Mentor Request Modal */}
      {showMentorModal && (
        <div className="fixed inset-0 z-50 bg-[#15243B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#176BFF] font-mono">
                Private Advisory
              </span>
              <h3 className="text-base font-bold text-[#15243B] mt-1">Submit Doubt to Assigned Mentor</h3>
            </div>

            <form onSubmit={handleCreateMentorRequest} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#73839B]">Select Enrolled Course</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] mt-1"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#73839B]">Doubt Subject</label>
                <input
                  type="text"
                  required
                  value={doubtTitle}
                  onChange={(e) => setDoubtTitle(e.target.value)}
                  placeholder="e.g. Memory leak in WebSocket connection listener"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#73839B]">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={doubtDescription}
                  onChange={(e) => setDoubtDescription(e.target.value)}
                  placeholder="Explain what you tried, the expected behavior, and where you are blocked..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#73839B]">Optional Code Snippet</label>
                <textarea
                  rows={2}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste relevant snippet..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-mono text-[#15243B] mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMentorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#73839B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A3FF] hover:bg-[#008fdb] text-white text-xs font-bold shadow-md shadow-[#00A3FF]/20"
                >
                  Submit to Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Mentor Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-[#15243B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#176BFF] font-mono">
                  {selectedRequest.course_title}
                </span>
                <h3 className="text-base font-bold text-[#15243B] mt-1">{selectedRequest.doubt_title}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-[#73839B] hover:text-[#15243B] text-xs font-bold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#15243B]/80 leading-relaxed bg-[#F5F9FF] p-4 rounded-2xl border border-[#DFE9F6]">
              {selectedRequest.doubt_description}
            </p>

            {selectedRequest.code_snippet && (
              <pre className="p-3.5 rounded-2xl bg-[#15243B] text-white text-[11px] font-mono overflow-x-auto">
                <code>{selectedRequest.code_snippet}</code>
              </pre>
            )}

            {/* Replies Thread */}
            <div className="space-y-2.5 pt-2">
              <h5 className="text-xs font-bold text-[#15243B]">Mentor Responses</h5>
              {selectedRequest.replies.length === 0 ? (
                <div className="text-xs text-[#73839B] italic py-2">
                  Awaiting mentor response. You will receive a notification when updated.
                </div>
              ) : (
                selectedRequest.replies.map(r => (
                  <div key={r.id} className="p-3.5 rounded-2xl bg-[#EAF3FF]/70 border border-[#00A3FF]/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#176BFF]">{r.author_name}</span>
                      <span className="text-[10px] text-[#73839B]">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[#15243B] leading-relaxed">{r.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Follow-up Message */}
            <form onSubmit={handleSendMentorReply} className="flex gap-2 pt-2 border-t border-[#DFE9F6]">
              <input
                type="text"
                value={mentorReplyInput}
                onChange={(e) => setMentorReplyInput(e.target.value)}
                placeholder="Follow up with mentor..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-bold"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
