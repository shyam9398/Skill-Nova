import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  Video,
  Presentation,
  FileText,
  Tag,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  Clock,
  Eye,
  X,
  Link as LinkIcon,
  BookOpen
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { SaturdaySpecial } from '../../types';

export const AdminSaturdaySpecialPage: React.FC = () => {
  const [sessions, setSessions] = useState<SaturdaySpecial[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedSession, setSelectedSession] = useState<SaturdaySpecial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields (Requirement 7)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Agentic AI & LLMs');
  const [description, setDescription] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [pptUrl, setPptUrl] = useState('');
  const [notesUrl, setNotesUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [additionalResourcesUrl, setAdditionalResourcesUrl] = useState('');
  const [releaseStatus, setReleaseStatus] = useState<'released' | 'hold'>('released');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const categories = [
    'Agentic AI & LLMs',
    'Generative AI',
    'Cloud Native & Kubernetes',
    'DevOps & CI/CD',
    'Cybersecurity & Ethical Hacking',
    'Robotics & Embedded Systems',
    'Research Paper Discussions',
    'Hackathon Strategy',
    'System Design'
  ];

  useEffect(() => {
    void dataService.syncSaturdaySpecialsFromSupabase();
    const update = () => {
      setSessions(dataService.getSaturdaySpecials());
    };
    update();
    return dataService.subscribe(update);
  }, []);

  // Modal background scroll lock & escape listener (Requirement 1 & 2)
  useEffect(() => {
    const isAnyModalOpen = showAddModal || showEditModal || showViewModal || showDeleteModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowAddModal(false);
          setShowEditModal(false);
          setShowViewModal(false);
          setShowDeleteModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAddModal, showEditModal, showViewModal, showDeleteModal]);

  const resetForm = () => {
    setTitle('');
    setCategory('Agentic AI & LLMs');
    setDescription('');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setRecordingUrl('');
    setPptUrl('');
    setNotesUrl('');
    setDocUrl('');
    setAdditionalResourcesUrl('');
    setReleaseStatus('released');
    setCoverImageUrl('');
    setSelectedSession(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (session: SaturdaySpecial) => {
    setSelectedSession(session);
    setTitle(session.title || '');
    setCategory(session.category || 'Agentic AI & LLMs');
    setDescription(session.description || '');
    setSessionDate(session.session_date ? session.session_date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setRecordingUrl(session.recording_url || session.recordingUrl || '');
    setPptUrl(session.ppt_url || session.slides_url || '');
    setNotesUrl(session.notes_url || '');
    setDocUrl(session.doc_url || '');
    setAdditionalResourcesUrl(session.additional_resources_url || session.resources_url || session.resourceDocUrl || '');
    setReleaseStatus(session.release_status === 'hold' || session.is_published === false ? 'hold' : 'released');
    setCoverImageUrl(session.cover_image || session.coverImageUrl || '');
    setShowEditModal(true);
  };

  const openViewModal = (session: SaturdaySpecial) => {
    setSelectedSession(session);
    setShowViewModal(true);
  };

  const openDeleteModal = (session: SaturdaySpecial) => {
    setSelectedSession(session);
    setShowDeleteModal(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setNotification({ type: 'error', message: 'Session Title and Description are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const isPublished = releaseStatus === 'released';
      await dataService.addSaturdaySpecial({
        title: title.trim(),
        category,
        description: description.trim(),
        session_date: sessionDate,
        recording_url: recordingUrl.trim(),
        slides_url: pptUrl.trim(),
        ppt_url: pptUrl.trim(),
        notes_url: notesUrl.trim(),
        doc_url: docUrl.trim(),
        resources_url: additionalResourcesUrl.trim() || notesUrl.trim() || docUrl.trim(),
        additional_resources_url: additionalResourcesUrl.trim(),
        cover_image: coverImageUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        release_status: releaseStatus,
        is_published: isPublished,
        is_upcoming: isPublished
      });

      setShowAddModal(false);
      resetForm();
      setNotification({ type: 'success', message: `Saturday Special session "${title.trim()}" published successfully to Supabase!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save session to Supabase.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    if (!title.trim() || !description.trim()) {
      setNotification({ type: 'error', message: 'Session Title and Description are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const isPublished = releaseStatus === 'released';
      await dataService.updateSaturdaySpecial(selectedSession.id, {
        title: title.trim(),
        category,
        description: description.trim(),
        session_date: sessionDate,
        recording_url: recordingUrl.trim(),
        slides_url: pptUrl.trim(),
        ppt_url: pptUrl.trim(),
        notes_url: notesUrl.trim(),
        doc_url: docUrl.trim(),
        resources_url: additionalResourcesUrl.trim() || notesUrl.trim() || docUrl.trim(),
        additional_resources_url: additionalResourcesUrl.trim(),
        cover_image: coverImageUrl.trim() || selectedSession.cover_image,
        release_status: releaseStatus,
        is_published: isPublished,
        is_upcoming: isPublished
      });

      setShowEditModal(false);
      resetForm();
      setNotification({ type: 'success', message: `Saturday Special session updated successfully in Supabase!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update session.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSession) return;
    setIsSubmitting(true);
    try {
      await dataService.deleteSaturdaySpecial(selectedSession.id);
      setShowDeleteModal(false);
      const name = selectedSession.title;
      setSelectedSession(null);
      setNotification({ type: 'success', message: `Session "${name}" permanently deleted from Supabase.` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete session.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Action Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg animate-fadeIn ${notification.type === 'success'
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-[#397BFF]/20 text-[#0284C7] dark:text-[#77B4FF] border border-sky-200 dark:border-[#397BFF]/40 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#397BFF]" />
              CURRICULUM EXPANSION
            </span>
            <span className="text-xs text-slate-600 dark:text-[#9BAAC2] font-mono">Total Sessions: {sessions.length}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-[#F0F5FF]">
            Saturday Special Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAAC2] mt-0.5">
            Full administrative CRUD for weekend emerging tech workshops, recordings, PPTs, notes, and resources.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition hover:scale-102"
        >
          <Plus className="w-4 h-4" /> + Publish Saturday Session
        </button>
      </div>

      {/* Grid of Sessions */}
      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center text-slate-600 dark:text-[#9BAAC2] space-y-3 shadow-md">
          <BookOpen className="w-10 h-10 text-[#176BFF] dark:text-[#397BFF] mx-auto opacity-60" />
          <h4 className="text-base font-bold text-slate-900 dark:text-[#F0F5FF]">No Saturday Sessions Published Yet</h4>
          <p className="text-xs">Click "+ Publish Saturday Session" to create your first emerging technology masterclass.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const isReleased = session.release_status !== 'hold' && session.is_published !== false;

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-[#101A2D] rounded-3xl border border-slate-200 dark:border-[#1F2E47] overflow-hidden hover:border-sky-400 dark:hover:border-[#397BFF]/40 transition group flex flex-col justify-between shadow-md dark:shadow-xl"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={session.cover_image || session.coverImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                      alt={session.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#080E1C]/90 backdrop-blur-md border border-white/10 text-[#77B4FF] flex items-center gap-1 font-mono">
                        <Tag className="w-3 h-3 text-[#397BFF]" /> {session.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isReleased
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-slate-950 font-bold'
                      }`}>
                        {isReleased ? 'Released' : 'On Hold'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 text-[11px] text-white font-mono flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" /> {session.session_date || session.date || 'TBD'}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-[#F0F5FF] group-hover:text-[#176BFF] dark:group-hover:text-[#77B4FF] transition line-clamp-1">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#9BAAC2] line-clamp-2 leading-relaxed">
                      {session.description}
                    </p>

                    {/* Resources Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                      {(session.recording_url || session.recordingUrl) && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 flex items-center gap-1 font-semibold">
                          <Video className="w-3.5 h-3.5 text-rose-500" /> Video Recording
                        </span>
                      )}
                      {(session.ppt_url || session.slides_url) && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 flex items-center gap-1 font-semibold">
                          <Presentation className="w-3.5 h-3.5 text-amber-500" /> PPT Slides
                        </span>
                      )}
                      {(session.notes_url || session.doc_url) && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 flex items-center gap-1 font-semibold">
                          <FileText className="w-3.5 h-3.5 text-blue-500" /> Notes & Doc
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: View, Edit, Delete */}
                <div className="p-4 bg-slate-50 dark:bg-[#0A101D] border-t border-slate-200 dark:border-[#1F2E47] flex items-center justify-between gap-2">
                  <button
                    onClick={() => openViewModal(session)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-teal-700 dark:text-[#00D4B8] text-xs font-bold flex items-center gap-1.5 transition"
                    title="View Session Details"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(session)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-sky-700 dark:text-[#77B4FF] border border-slate-200 dark:border-[#1F2E47] transition"
                      title="Edit Session"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(session)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden">
            {/* Pinned / Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2E47] px-6 py-4 shrink-0 bg-slate-50 dark:bg-[#0E1626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-[#397BFF]/20 dark:text-[#397BFF] flex items-center justify-center border border-sky-200 dark:border-[#397BFF]/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">
                    {showAddModal ? 'Publish Saturday Special Session' : 'Edit Saturday Special Session'}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">
                    Syncs to Supabase and instantly reflects across student dashboards
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="saturday-special-form"
              onSubmit={showAddModal ? handleCreateSession : handleUpdateSession}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs"
            >
              {/* Field 1: Title */}
              <div>
                <label className="font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                  1. Session Title <span className="text-[#176BFF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft Architecture in Production"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2.5 text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#176BFF] transition"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2.5 text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF] transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                    Scheduled Date <span className="text-[#176BFF]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-4 py-2.5 text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF] transition font-mono"
                  />
                </div>
              </div>

              {/* Field 2: Description */}
              <div>
                <label className="font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">
                  2. Session Description <span className="text-[#176BFF]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Overview of the core takeaways, architectural topics covered, and live demo breakdown..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl p-3 text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#176BFF] transition"
                />
              </div>

              {/* Media Links Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#1F2E47] space-y-3">
                <span className="font-mono font-bold text-[#0284C7] dark:text-[#77B4FF] uppercase text-[11px] block">
                  Media & Learning Materials Links (YouTube, Google Drive, PPT)
                </span>

                {/* Video Link */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-rose-500" /> Recording Video Link (YouTube or Google Drive)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or Google Drive video preview"
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    className="w-full bg-white dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#176BFF]"
                  />
                </div>

                {/* PPT Link */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-amber-500" /> PPT Presentation Link (Google Slides, Drive preview, Office)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/presentation/d/.../edit or public PPT link"
                    value={pptUrl}
                    onChange={(e) => setPptUrl(e.target.value)}
                    className="w-full bg-white dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#176BFF]"
                  />
                </div>

                {/* Notes & Document Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Notes Link (Google Docs)
                    </label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/document/d/..."
                      value={notesUrl}
                      onChange={(e) => setNotesUrl(e.target.value)}
                      className="w-full bg-white dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#176BFF]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" /> PDF / Document Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../preview"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="w-full bg-white dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#176BFF]"
                    />
                  </div>
                </div>

                {/* Additional Resources Link */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D4B8]" /> Additional Learning Resources Link (GitHub repo, cheat sheet, reading list)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/skillnova/... or documentation resource"
                    value={additionalResourcesUrl}
                    onChange={(e) => setAdditionalResourcesUrl(e.target.value)}
                    className="w-full bg-white dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F0F5FF] font-mono outline-none focus:border-[#176BFF]"
                  />
                </div>
              </div>

              {/* Release vs Hold Status */}
              <div>
                <label className="font-bold text-slate-800 dark:text-[#F0F5FF] block mb-2">Publishing Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReleaseStatus('released')}
                    className={`p-3 rounded-xl border text-left transition ${
                      releaseStatus === 'released'
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-[#15233A] border-slate-200 dark:border-[#1F2E47] text-slate-600 dark:text-[#9BAAC2]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Release Immediately
                    </div>
                    <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">Available to all students in their portal now.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReleaseStatus('hold')}
                    className={`p-3 rounded-xl border text-left transition ${
                      releaseStatus === 'hold'
                        ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-[#15233A] border-slate-200 dark:border-[#1F2E47] text-slate-600 dark:text-[#9BAAC2]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Hold / Draft
                    </div>
                    <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">Saved to Supabase but hidden until released.</p>
                  </button>
                </div>
              </div>
            </form>

            {/* Pinned / Fixed Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                form="saturday-special-form"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to Supabase...' : showAddModal ? 'Publish Session' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedSession && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2E47] px-6 py-4 shrink-0 bg-slate-50 dark:bg-[#0E1626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 dark:bg-[#00D4B8]/20 dark:text-[#00D4B8] flex items-center justify-center border border-teal-200 dark:border-[#00D4B8]/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Session Details</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">{selectedSession.category}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Session Title</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedSession.title}</h4>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Description</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#15233A] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                  {selectedSession.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-white/5">
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Scheduled Date</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold">{selectedSession.session_date || selectedSession.date || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-white/5">
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-bold block mb-1">Publish Status</span>
                  <span className={`font-bold uppercase font-mono ${
                    selectedSession.release_status === 'hold' || selectedSession.is_published === false
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {selectedSession.release_status === 'hold' || selectedSession.is_published === false ? 'On Hold' : 'Released'}
                  </span>
                </div>
              </div>

              {/* Resource Links List */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-white/5 space-y-2">
                <span className="text-[10px] text-slate-600 dark:text-[#9BAAC2] uppercase font-bold block">Assigned Links</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {(selectedSession.recording_url || selectedSession.recordingUrl) && (
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-300">
                      <span>Video Recording:</span>
                      <a href={selectedSession.recording_url || selectedSession.recordingUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-semibold">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {(selectedSession.ppt_url || selectedSession.slides_url) && (
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
                      <span>PPT Presentation:</span>
                      <a href={selectedSession.ppt_url || selectedSession.slides_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-semibold">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {(selectedSession.notes_url || selectedSession.doc_url || selectedSession.resources_url) && (
                    <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
                      <span>Notes & Documents:</span>
                      <a href={selectedSession.notes_url || selectedSession.doc_url || selectedSession.resources_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-semibold">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedSession.additional_resources_url && (
                    <div className="flex items-center justify-between text-teal-700 dark:text-[#00D4B8]">
                      <span>Additional Resources:</span>
                      <a href={selectedSession.additional_resources_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-semibold">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex justify-end shrink-0">
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

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedSession && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-rose-300 dark:border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-scaleUp space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Delete Saturday Special</h3>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Irreversible administrative removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#9BAAC2] leading-relaxed">
              Are you sure you want to permanently delete the session <strong className="text-slate-900 dark:text-white">"{selectedSession.title}"</strong>?
            </p>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-[11px]">
              This will remove the session from Supabase and immediately unpublish it from the student portal.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSaturdaySpecialPage;
