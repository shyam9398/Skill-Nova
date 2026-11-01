import React, { useState, useEffect } from 'react';
import {
  UploadCloud, Link as LinkIcon, FileText, Video, AlertCircle,
  CheckCircle2, Plus, Trash2, ExternalLink, Calendar, BookOpen,
  Clock, ShieldAlert, Sparkles, Filter, RefreshCw, Eye, Edit3,
  Archive, PauseCircle, PlayCircle, Check, HelpCircle, Layers,
  Presentation, FileSpreadsheet, Globe, MessageSquare
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Course, CourseModule, Topic, AuditLogEntry } from '../../types';

export const ResourcePublishingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'create' | 'manage' | 'audit'>('create');

  // Form Fields
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [resourceCategory, setResourceCategory] = useState<
    'pdf' | 'ppt' | 'word' | 'drive_doc' | 'drive_video' | 'youtube' | 'live_class' | 'meet' | 'zoom' | 'external_doc' | 'bootstrap_doc' | 'announcement' | 'other'
  >('pdf');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);

  // URLs & Direct Upload simulation
  const [recordingLink, setRecordingLink] = useState('');
  const [driveNotesLink, setDriveNotesLink] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pptFileName, setPptFileName] = useState('');
  const [wordDocUrl, setWordDocUrl] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [docReferenceUrl, setDocReferenceUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Curated reference links list
  const [referenceLinks, setReferenceLinks] = useState<{ title: string; url: string }[]>([]);
  const [refTitleInput, setRefTitleInput] = useState('');
  const [refUrlInput, setRefUrlInput] = useState('');

  // Link validation helper state
  const [driveValidation, setDriveValidation] = useState<{ isValid: boolean; isPublic: boolean; advice: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-publish Release Management Modal State
  const [pendingResource, setPendingResource] = useState<Topic | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [isHoldingOption, setIsHoldingOption] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('09:00');

  // Resource Management View State
  const [resourceFilter, setResourceFilter] = useState<'all' | 'draft' | 'held' | 'scheduled' | 'released' | 'archived'>('all');
  const [adminTopics, setAdminTopics] = useState<Topic[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Reschedule / Edit modal state
  const [reschedulingTopic, setReschedulingTopic] = useState<Topic | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('10:00');

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    const list = dataService.getCourses();
    setCourses(list);
    if (list.length > 0 && !selectedCourseId) {
      setSelectedCourseId(list[0].id);
      const mods = dataService.getModulesForCourse(list[0].id);
      setModules(mods);
      if (mods.length > 0) {
        setSelectedModuleId(mods[0].id);
      }
    }
    setAdminTopics(dataService.getAllAdminTopics());
    setAuditLogs(dataService.getAuditLogs());
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const mods = dataService.getModulesForCourse(courseId);
    setModules(mods);
    if (mods.length > 0) {
      setSelectedModuleId(mods[0].id);
    } else {
      setSelectedModuleId('');
    }
  };

  const handleDriveUrlBlur = () => {
    if (driveNotesLink.trim()) {
      const val = dataService.validateDriveLink(driveNotesLink.trim());
      setDriveValidation(val);
    } else {
      setDriveValidation(null);
    }
  };

  const handleAddRefLink = () => {
    if (refTitleInput.trim() && refUrlInput.trim()) {
      setReferenceLinks([...referenceLinks, { title: refTitleInput.trim(), url: refUrlInput.trim() }]);
      setRefTitleInput('');
      setRefUrlInput('');
    }
  };

  const handleRemoveRefLink = (idx: number) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== idx));
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5500);
  };

  // Main Form Submit -> Saves to Draft/Held state and presents Option A vs Option B modal
  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      showToast('error', 'Please select a target course.');
      return;
    }
    if (!topicTitle.trim()) {
      showToast('error', 'Please provide a clear resource / topic title.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build relevant link fields based on selected resourceCategory
      let recLink = recordingLink.trim() || undefined;
      let driveLink = driveNotesLink.trim() || undefined;
      let pdfUrl = pdfFileName.trim() ? (pdfFileName.startsWith('http') ? pdfFileName : `https://skillnova-cdn.internal/docs/${pdfFileName}`) : undefined;
      let pptUrl = pptFileName.trim() ? (pptFileName.startsWith('http') ? pptFileName : `https://skillnova-cdn.internal/slides/${pptFileName}`) : undefined;
      
      if (resourceCategory === 'meet' || resourceCategory === 'zoom' || resourceCategory === 'live_class') {
        if (meetingUrl.trim()) recLink = meetingUrl.trim();
      } else if (resourceCategory === 'youtube' && recordingLink.trim()) {
        recLink = recordingLink.trim();
      } else if (resourceCategory === 'bootstrap_doc' || resourceCategory === 'external_doc') {
        if (docReferenceUrl.trim()) driveLink = docReferenceUrl.trim();
      } else if (resourceCategory === 'word' && wordDocUrl.trim()) {
        pdfUrl = wordDocUrl.trim();
      }

      // Step 1: Save resource in held state first until admin picks Release or Hold
      const createdTopic = dataService.addTopic({
        course_id: selectedCourseId,
        module_id: selectedModuleId || undefined,
        title: topicTitle.trim(),
        description: topicDesc.trim(),
        class_date: classDate,
        recording_link: recLink,
        recording_url: recLink,
        drive_notes_link: driveLink,
        drive_notes_url: driveLink,
        pdf_url: pdfUrl,
        pdf_file_url: pdfUrl,
        ppt_url: pptUrl,
        ppt_file_url: pptUrl,
        reference_links: referenceLinks,
        resource_category: resourceCategory,
        release_status: 'held', // Hold until admin confirms in Release modal!
        released_by: 'Administrator'
      });

      setPendingResource(createdTopic);
      setShowReleaseModal(true);
      setIsHoldingOption(false);
      showToast('success', `Resource "${createdTopic.title}" saved. Now configure release options.`);

      // Reset form fields
      setTopicTitle('');
      setTopicDesc('');
      setRecordingLink('');
      setDriveNotesLink('');
      setPdfFileName('');
      setPptFileName('');
      setWordDocUrl('');
      setMeetingUrl('');
      setDocReferenceUrl('');
      setThumbnailUrl('');
      setReferenceLinks([]);
      setDriveValidation(null);
    } catch (err) {
      console.error(err);
      showToast('error', 'An error occurred while saving the resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option A: Immediate Release
  const handleImmediateRelease = (topicId?: string) => {
    const targetId = topicId || pendingResource?.id;
    if (!targetId) return;

    dataService.releaseTopic(targetId, 'Administrator');
    setShowReleaseModal(false);
    setPendingResource(null);
    showToast('success', 'Resource has been RELEASED! It is now visible to enrolled students.');
    loadData();
  };

  // Option B: Hold / Schedule
  const handleConfirmHoldOrSchedule = () => {
    if (!pendingResource) return;

    if (isHoldingOption) {
      // Indefinite hold
      dataService.holdTopic(pendingResource.id, undefined, 'Administrator');
      showToast('success', 'Resource placed on indefinite HOLD. Invisible to students.');
    } else {
      // Scheduled release in Asia/Kolkata timezone
      const dateTimeString = `${scheduleDate}T${scheduleTime}:00+05:30`;
      dataService.holdTopic(pendingResource.id, dateTimeString, 'Administrator');
      showToast('success', `Resource SCHEDULED for release on ${scheduleDate} at ${scheduleTime} IST.`);
    }

    setShowReleaseModal(false);
    setPendingResource(null);
    loadData();
  };

  // Reschedule handler
  const handleExecuteReschedule = () => {
    if (!reschedulingTopic) return;
    if (!newScheduleDate) {
      showToast('error', 'Please choose a valid schedule date.');
      return;
    }
    const dateTimeString = `${newScheduleDate}T${newScheduleTime}:00+05:30`;
    dataService.holdTopic(reschedulingTopic.id, dateTimeString, 'Administrator');
    showToast('success', `Resource rescheduled for ${newScheduleDate} at ${newScheduleTime} IST.`);
    setReschedulingTopic(null);
    loadData();
  };

  // Status badge styling
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'released':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            RELEASED
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-700 border border-amber-500/40 shadow-xs">
            <Clock className="w-3 h-3 text-amber-600" />
            SCHEDULED
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-700 border border-purple-500/40 shadow-xs">
            <PauseCircle className="w-3 h-3 text-purple-600" />
            ON HOLD
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-400/20 text-slate-600 border border-slate-300">
            <Archive className="w-3 h-3 text-slate-500" />
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-700 border border-blue-400/40">
            DRAFT
          </span>
        );
    }
  };

  // Filtered topics for table
  const filteredTopics = adminTopics.filter(t => {
    if (resourceFilter === 'all') return true;
    if (resourceFilter === 'released') return t.release_status === 'released' || (!t.release_status && t.is_published);
    if (resourceFilter === 'scheduled') return t.release_status === 'scheduled';
    if (resourceFilter === 'held') return t.release_status === 'held';
    if (resourceFilter === 'archived') return t.release_status === 'archived';
    if (resourceFilter === 'draft') return t.release_status === 'draft';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 3D Elevated Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#EAF3FF] via-[#F0F6FF] to-[#E3EFFF] border border-[#00D9FF]/30 shadow-[0_12px_30px_-5px_rgba(0,163,255,0.12)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176BFF]/10 text-[#176BFF] text-xs font-bold border border-[#00A3FF]/25 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>Admin Control Panel • Asia/Kolkata (IST)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#15243B] tracking-tight">
            Learning Resource & Release Studio
          </h1>
          <p className="text-xs text-[#73839B] mt-0.5 max-w-2xl leading-relaxed">
            Create multi-format learning resources (PDFs, PPTs, Drive videos, Meet links, docs) and control student visibility using strict Release and Hold workflows.
          </p>
        </div>

        {/* Studio View Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#E1EEFD] p-1.5 rounded-2xl border border-[#00A3FF]/25 shadow-inner">
          <button
            onClick={() => setActiveMainTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeMainTab === 'create'
                ? 'bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
                : 'text-[#15243B] hover:text-[#176BFF]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Resource Studio</span>
          </button>

          <button
            onClick={() => setActiveMainTab('manage')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeMainTab === 'manage'
                ? 'bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
                : 'text-[#15243B] hover:text-[#176BFF]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Release Management</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {adminTopics.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeMainTab === 'audit'
                ? 'bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
                : 'text-[#15243B] hover:text-[#176BFF]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Global Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 shadow-lg animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: RESOURCE CREATION STUDIO */}
      {/* ======================================================== */}
      {activeMainTab === 'create' && (
        <form
          onSubmit={handlePublishClick}
          className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#F2F7FE] to-[#E9F2FD] border border-[#00D9FF]/35 shadow-[0_16px_40px_-8px_rgba(0,163,255,0.14)] space-y-6"
        >
          {/* Step 1: Course & Curriculum Module Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-5 border-b border-[#00A3FF]/20">
            <div>
              <label className="text-xs font-bold text-[#15243B] block mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#176BFF]" />
                Target Course *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-3 text-xs font-semibold text-[#15243B] outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 shadow-xs"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} • {c.category} ({c.mentor_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#15243B] block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00A3FF]" />
                Curriculum Module
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-3 text-xs font-semibold text-[#15243B] outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 shadow-xs"
              >
                {modules.length === 0 ? (
                  <option value="">(Auto-provisions Module 1: Core Curriculum upon saving)</option>
                ) : (
                  modules.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))
                )}
              </select>
              <span className="text-[10px] text-[#73839B] mt-1 block">
                Auto-provisions a module if none exists so publishing never fails silently.
              </span>
            </div>
          </div>

          {/* Step 2: Resource Category Picker (Supports All 13 Categories) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#15243B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D9FF]" />
              Select Learning Resource Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {[
                { id: 'pdf', label: 'PDF Lecture Notes', icon: FileText, color: 'text-red-600' },
                { id: 'ppt', label: 'PPT / Presentation', icon: Presentation, color: 'text-orange-600' },
                { id: 'word', label: 'Word Document', icon: FileText, color: 'text-blue-600' },
                { id: 'drive_video', label: 'Drive Video', icon: Video, color: 'text-indigo-600' },
                { id: 'youtube', label: 'YouTube Session', icon: Video, color: 'text-red-500' },
                { id: 'drive_doc', label: 'Google Drive Doc', icon: FileSpreadsheet, color: 'text-emerald-600' },
                { id: 'meet', label: 'Google Meet', icon: Video, color: 'text-green-600' },
                { id: 'zoom', label: 'Zoom Meeting', icon: Video, color: 'text-blue-500' },
                { id: 'live_class', label: 'Live Class Link', icon: Globe, color: 'text-teal-600' },
                { id: 'external_doc', label: 'External Docs', icon: LinkIcon, color: 'text-purple-600' },
                { id: 'bootstrap_doc', label: 'Bootstrap / Libs', icon: Globe, color: 'text-cyan-600' },
                { id: 'announcement', label: 'Topic Announcement', icon: MessageSquare, color: 'text-pink-600' },
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = resourceCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setResourceCategory(cat.id as any)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#176BFF]/15 to-[#00D9FF]/25 border-[#00D9FF] shadow-md shadow-[#00A3FF]/20 scale-[1.02]'
                        : 'bg-[#FAFCFF] border-[#00A3FF]/20 hover:border-[#00D9FF]/40 text-[#73839B]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-[#15243B]' : 'text-[#73839B]'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Core Topic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                  Resource / Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous Microservices & Kafka Event Stream Ingestion"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-3 text-xs font-semibold text-[#15243B] outline-none focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#176BFF]" />
                  Lecture / Curriculum Date
                </label>
                <input
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-3 text-xs font-semibold text-[#15243B] outline-none focus:border-[#00D9FF] shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                Topic Description & Concepts Taught
              </label>
              <textarea
                rows={2}
                placeholder="Key concepts, architecture patterns, and practical implementation notes covered..."
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                className="w-full bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-3 text-xs font-semibold text-[#15243B] outline-none focus:border-[#00D9FF] shadow-xs"
              />
            </div>
          </div>

          {/* Step 4: Contextual Link / Upload Inputs based on Resource Category */}
          <div className="p-5 rounded-2xl bg-[#FAFCFF] border border-[#00A3FF]/25 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-[#176BFF] uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#00A3FF]" />
              Resource URL or Supabase Storage Attachment
            </h3>

            {/* Video / Meeting Inputs */}
            {(resourceCategory === 'drive_video' || resourceCategory === 'youtube') && (
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                  {resourceCategory === 'youtube' ? 'YouTube Video URL (Unlisted / Public)' : 'Google Drive Recording Link'}
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-[#00A3FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view or https://youtu.be/..."
                    value={recordingLink}
                    onChange={(e) => setRecordingLink(e.target.value)}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            )}

            {(resourceCategory === 'meet' || resourceCategory === 'zoom' || resourceCategory === 'live_class') && (
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                  Live Meeting / Class URL
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            )}

            {/* Drive Notes */}
            {resourceCategory === 'drive_doc' && (
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                  Google Drive Document / Folder Link
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#00A3FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveNotesLink}
                    onChange={(e) => setDriveNotesLink(e.target.value)}
                    onBlur={handleDriveUrlBlur}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
                {driveValidation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-[#00A3FF]/40 text-xs text-[#176BFF] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#176BFF] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{driveValidation.advice}</span>
                  </div>
                )}
              </div>
            )}

            {/* Direct PDF / PPT / Word Uploads */}
            {(resourceCategory === 'pdf' || resourceCategory === 'ppt' || resourceCategory === 'word') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                    {resourceCategory === 'pdf' ? 'PDF File Name or Supabase Storage URL' : resourceCategory === 'ppt' ? 'Presentation File (PPTX / Slides)' : 'Word Document (.docx / .doc)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. system-design-cheatsheet.pdf or https://..."
                    value={resourceCategory === 'pdf' ? pdfFileName : resourceCategory === 'ppt' ? pptFileName : wordDocUrl}
                    onChange={(e) => {
                      if (resourceCategory === 'pdf') setPdfFileName(e.target.value);
                      else if (resourceCategory === 'ppt') setPptFileName(e.target.value);
                      else setWordDocUrl(e.target.value);
                    }}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                    Optional Resource Thumbnail URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            )}

            {/* External Documentation / Bootstrap links */}
            {(resourceCategory === 'external_doc' || resourceCategory === 'bootstrap_doc') && (
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1.5">
                  {resourceCategory === 'bootstrap_doc' ? 'Bootstrap / Framework Docs URL' : 'Official Documentation / Resource URL'}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#00A3FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://getbootstrap.com/docs/... or https://docs.python.org/3/"
                    value={docReferenceUrl}
                    onChange={(e) => setDocReferenceUrl(e.target.value)}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Curated Reference Links */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#15243B] block">
              Additional Reference Links (Documentation, GitHub Repos, Articles)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Resource Name (e.g. Official Fastify Documentation)"
                value={refTitleInput}
                onChange={(e) => setRefTitleInput(e.target.value)}
                className="flex-1 bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
              />
              <input
                type="url"
                placeholder="https://..."
                value={refUrlInput}
                onChange={(e) => setRefUrlInput(e.target.value)}
                className="flex-1 bg-[#FAFCFF] border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
              />
              <button
                type="button"
                onClick={handleAddRefLink}
                className="px-4 py-2.5 rounded-2xl bg-[#EAF3FF] hover:bg-[#176BFF] text-[#176BFF] hover:text-white border border-[#00A3FF]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            </div>

            {referenceLinks.length > 0 && (
              <div className="space-y-2 pt-1">
                {referenceLinks.map((ref, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#00A3FF]/20 text-xs">
                    <span className="text-[#15243B] font-semibold">{ref.title} <span className="text-[#73839B] font-normal font-mono">({ref.url})</span></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRefLink(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Action Footer with Prominent Save & Publish Button */}
          <div className="pt-5 border-t border-[#00A3FF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-[#73839B] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#00A3FF]" />
              <span>Saving opens the <strong>Release Management</strong> screen with Release Now or Hold options.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/35 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Resource...' : 'Save & Configure Release'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DEDICATED RELEASE MANAGEMENT DASHBOARD */}
      {/* ======================================================== */}
      {activeMainTab === 'manage' && (
        <div className="space-y-5">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white/70 border border-[#00D9FF]/20 backdrop-blur-md">
            {[
              { id: 'all', label: 'All Resources', count: adminTopics.length },
              { id: 'released', label: 'Released', count: adminTopics.filter(t => t.release_status === 'released' || (!t.release_status && t.is_published)).length },
              { id: 'held', label: 'On Hold', count: adminTopics.filter(t => t.release_status === 'held').length },
              { id: 'scheduled', label: 'Scheduled', count: adminTopics.filter(t => t.release_status === 'scheduled').length },
              { id: 'draft', label: 'Drafts', count: adminTopics.filter(t => t.release_status === 'draft').length },
              { id: 'archived', label: 'Archived', count: adminTopics.filter(t => t.release_status === 'archived').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setResourceFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  resourceFilter === tab.id
                    ? 'bg-[#176BFF] text-white shadow-xs'
                    : 'text-[#73839B] hover:text-[#15243B] hover:bg-[#F0F6FF]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Resources Table / Card Grid */}
          <div className="rounded-3xl bg-white border border-[#00D9FF]/30 shadow-md overflow-hidden">
            {filteredTopics.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#73839B] space-y-2">
                <Layers className="w-8 h-8 text-[#00A3FF] mx-auto opacity-50" />
                <p>No resources found under the "{resourceFilter}" filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EAF3FF]">
                {filteredTopics.map((topic) => {
                  const course = courses.find(c => c.id === topic.course_id);
                  const isReleased = topic.release_status === 'released' || (!topic.release_status && topic.is_published);

                  return (
                    <div
                      key={topic.id}
                      className="p-5 hover:bg-[#F9FCFF] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(topic.release_status)}
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#EAF3FF] text-[#176BFF]">
                            {topic.resource_category || 'Resource'}
                          </span>
                          <span className="text-xs text-[#73839B] font-semibold">
                            {course?.title || topic.course_id}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-[#15243B] leading-snug">
                          {topic.title}
                        </h3>

                        {topic.description && (
                          <p className="text-xs text-[#73839B] line-clamp-1">
                            {topic.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#73839B] pt-0.5">
                          <span>Publisher: <strong className="text-[#15243B]">{topic.released_by || 'Admin'}</strong></span>
                          <span>•</span>
                          {topic.release_status === 'scheduled' && topic.scheduled_release_at ? (
                            <span className="text-amber-700 font-bold">
                              Auto-release: {new Date(topic.scheduled_release_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                            </span>
                          ) : (
                            <span>Created: {new Date(topic.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons for Each Resource */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {!isReleased ? (
                          <button
                            onClick={() => handleImmediateRelease(topic.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Release Now</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              dataService.holdTopic(topic.id, undefined, 'Administrator');
                              showToast('success', `Moved "${topic.title}" to On Hold.`);
                              loadData();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>Hold</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setReschedulingTopic(topic);
                            setNewScheduleDate(new Date().toISOString().split('T')[0]);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#EAF3FF] hover:bg-[#D5E6FF] text-[#176BFF] border border-[#00A3FF]/25 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>

                        {topic.release_status !== 'archived' && (
                          <button
                            onClick={() => {
                              dataService.archiveTopic(topic.id, 'Administrator');
                              showToast('success', `Archived "${topic.title}".`);
                              loadData();
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            title="Archive Resource"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AUDIT TRAIL LOG */}
      {/* ======================================================== */}
      {activeMainTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#00D9FF]/30 shadow-md">
            <h3 className="text-sm font-black text-[#15243B] flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#176BFF]" />
              Publishing & Release Audit Trail (Asia/Kolkata Timezone)
            </h3>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#DFE9F6] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="uppercase font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-[#176BFF]/10 text-[#176BFF]">
                        {log.action}
                      </span>
                      <strong className="text-[#15243B]">{log.resource_title}</strong>
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-[#73839B]">{log.details}</p>
                    )}
                  </div>
                  <div className="text-[10px] text-[#73839B] sm:text-right shrink-0">
                    <span className="text-[#15243B] font-semibold">{log.performed_by}</span>
                    <div>{new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POST-PUBLISH RELEASE MANAGEMENT MODAL (Options A & B) */}
      {/* ======================================================== */}
      {showReleaseModal && pendingResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/40 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#176BFF] to-[#00D9FF] text-white flex items-center justify-center mx-auto shadow-md shadow-[#00A3FF]/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#15243B]">
                Release Management
              </h2>
              <p className="text-xs text-[#73839B] max-w-md mx-auto">
                Resource <strong>"{pendingResource.title}"</strong> has been saved. Choose how to release it to students.
              </p>
            </div>

            {/* Option A vs Option B Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Release Immediately */}
              <button
                type="button"
                onClick={() => handleImmediateRelease()}
                className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-left shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5 space-y-2 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Option A: Release Now</h4>
                  <p className="text-[11px] text-emerald-100 leading-snug mt-1">
                    Immediately publish resource. Visible in enrolled students' feed right now.
                  </p>
                </div>
              </button>

              {/* Option B: Hold / Schedule */}
              <button
                type="button"
                onClick={() => setIsHoldingOption(true)}
                className={`p-5 rounded-2xl border text-left transition transform hover:-translate-y-0.5 space-y-2 ${
                  isHoldingOption
                    ? 'bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-600/25'
                    : 'bg-white hover:bg-purple-50/50 text-[#15243B] border-purple-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <PauseCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Option B: Hold & Schedule</h4>
                  <p className="text-[11px] text-[#73839B] leading-snug mt-1">
                    Keep invisible to students. Schedule automated future release or hold.
                  </p>
                </div>
              </button>
            </div>

            {/* Scheduling Interface (Asia/Kolkata timezone) */}
            {isHoldingOption && (
              <div className="p-4 rounded-2xl bg-white border border-purple-200 space-y-3.5">
                <h4 className="text-xs font-black text-purple-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  When should this resource be released? (Asia/Kolkata IST)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">Release Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-[#F5F9FF] border border-[#DFE9F6] rounded-xl px-3 py-2 text-xs font-bold text-[#15243B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">Release Time (IST)</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-[#F5F9FF] border border-[#DFE9F6] rounded-xl px-3 py-2 text-xs font-bold text-[#15243B] outline-none"
                    />
                  </div>
                </div>

                {/* Quick Schedule Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setScheduleDate(d.toISOString().split('T')[0]);
                      setScheduleTime('09:00');
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                  >
                    Tomorrow 9:00 AM IST
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 3);
                      setScheduleDate(d.toISOString().split('T')[0]);
                      setScheduleTime('18:00');
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                  >
                    In 3 Days 6:00 PM IST
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-purple-100">
                  <button
                    type="button"
                    onClick={() => {
                      dataService.holdTopic(pendingResource.id, undefined, 'Administrator');
                      showToast('success', 'Resource kept on indefinite HOLD without release date.');
                      setShowReleaseModal(false);
                      setPendingResource(null);
                      loadData();
                    }}
                    className="text-[11px] font-bold text-purple-700 hover:underline"
                  >
                    Keep on Hold without Date
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmHoldOrSchedule}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                  >
                    Confirm Scheduled Release
                  </button>
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReleaseModal(false);
                  setPendingResource(null);
                }}
                className="text-xs font-semibold text-[#73839B] hover:text-[#15243B]"
              >
                Close (Keep saved as Held)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RESCHEDULE MODAL */}
      {/* ======================================================== */}
      {reschedulingTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#00D9FF]/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#15243B] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#176BFF]" />
              Reschedule Resource Release
            </h3>
            <p className="text-xs text-[#73839B]">
              Rescheduling <strong>"{reschedulingTopic.title}"</strong> for cohort visibility.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#73839B] block mb-1">New Date</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="w-full bg-[#F5F9FF] border border-[#DFE9F6] rounded-xl px-3 py-2 text-xs font-bold text-[#15243B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#73839B] block mb-1">New Time (IST)</label>
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full bg-[#F5F9FF] border border-[#DFE9F6] rounded-xl px-3 py-2 text-xs font-bold text-[#15243B] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingTopic(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#73839B] hover:bg-[#F5F9FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReschedule}
                className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-[#1358d4] text-white text-xs font-bold shadow-md shadow-[#176BFF]/25"
              >
                Save New Release Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
