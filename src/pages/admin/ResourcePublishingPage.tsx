import React, { useState, useEffect } from 'react';
import {
  UploadCloud, Link as LinkIcon, FileText, Video, AlertCircle,
  CheckCircle2, Plus, Trash2, ExternalLink, Calendar, BookOpen
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Course, CourseModule, Topic } from '../../types';

export const ResourcePublishingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');

  // Form Fields
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordingLink, setRecordingLink] = useState('');
  const [driveNotesLink, setDriveNotesLink] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pptFileName, setPptFileName] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<{ title: string; url: string }[]>([]);
  const [refTitleInput, setRefTitleInput] = useState('');
  const [refUrlInput, setRefUrlInput] = useState('');

  // Link validation helper state
  const [driveValidation, setDriveValidation] = useState<{ isValid: boolean; isPublic: boolean; advice: string } | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  useEffect(() => {
    const list = dataService.getCourses();
    setCourses(list);
    if (list.length > 0) {
      setSelectedCourseId(list[0].id);
      const mods = dataService.getModulesForCourse(list[0].id);
      setModules(mods);
      if (mods.length > 0) {
        setSelectedModuleId(mods[0].id);
      }
    }
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId || !topicTitle.trim()) return;

    dataService.addTopic({
      course_id: selectedCourseId,
      module_id: selectedModuleId,
      title: topicTitle.trim(),
      description: topicDesc.trim(),
      class_date: classDate,
      recording_link: recordingLink.trim() || undefined,
      drive_notes_link: driveNotesLink.trim() || undefined,
      pdf_url: pdfFileName ? `https://skillnova-cdn.internal/docs/${pdfFileName}` : undefined,
      ppt_url: pptFileName ? `https://skillnova-cdn.internal/slides/${pptFileName}` : undefined,
      reference_links: referenceLinks,
      is_published: true,
    });

    setPublishSuccess(`Topic "${topicTitle}" published successfully! Enrolled students have been notified.`);
    setTimeout(() => setPublishSuccess(null), 5000);

    // Reset fields
    setTopicTitle('');
    setTopicDesc('');
    setRecordingLink('');
    setDriveNotesLink('');
    setPdfFileName('');
    setPptFileName('');
    setReferenceLinks([]);
    setDriveValidation(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-[#397BFF]" />
          Learning Resource Publishing Studio
        </h1>
        <p className="text-xs text-[#9BAAC2] mt-0.5">
          Publish daily lecture recordings, Google Drive notes, PDFs/PPTs, and curated reference links to student feeds.
        </p>
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{publishSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Step 1: Course & Module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#1F2E47]">
          <div>
            <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
              Target Course *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
              Curriculum Module *
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
            >
              {modules.length === 0 ? (
                <option value="">No modules found for this course</option>
              ) : (
                modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Step 2: Topic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
                Topic Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asynchronous Microservices & Kafka Event Stream Ingestion"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
                Class / Lecture Date
              </label>
              <input
                type="date"
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
                className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
              Topic Description & Core Concepts Taught
            </label>
            <textarea
              rows={2}
              placeholder="Outline what was covered during the live lecture session..."
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
            />
          </div>
        </div>

        {/* Step 3: Google Drive & External Links with Live Access Validator */}
        <div className="p-5 rounded-2xl bg-[#15233A]/80 border border-[#1F2E47] space-y-4">
          <h3 className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            1. External Cloud Resources (Google Drive / Video Hosting)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
                Live Class Recording Link
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-[#9BAAC2] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={recordingLink}
                  onChange={(e) => setRecordingLink(e.target.value)}
                  className="w-full bg-[#101A2D] border border-[#1F2E47] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>
              <span className="text-[10px] text-[#9BAAC2] mt-1 block">
                Google Drive video, YouTube unlisted, or Zoom cloud recording URL.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
                Google Drive Notes Link
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#9BAAC2] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveNotesLink}
                  onChange={(e) => setDriveNotesLink(e.target.value)}
                  onBlur={handleDriveUrlBlur}
                  className="w-full bg-[#101A2D] border border-[#1F2E47] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              {/* Live Drive Link Validator Advice */}
              {driveValidation && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#101A2D] border border-[#397BFF]/30 text-xs text-[#77B4FF] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#397BFF] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{driveValidation.advice}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Direct Uploads Simulator */}
        <div className="p-5 rounded-2xl bg-[#15233A]/80 border border-[#1F2E47] space-y-4">
          <h3 className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" />
            2. Direct Uploads (PDF / PPT / Documents)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
                Direct PDF Lecture Notes
              </label>
              <input
                type="text"
                placeholder="e.g. system-design-notes-v1.pdf"
                value={pdfFileName}
                onChange={(e) => setPdfFileName(e.target.value)}
                className="w-full bg-[#101A2D] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9BAAC2] block mb-1.5">
                Presentation Slides (PPT / PPTX)
              </label>
              <input
                type="text"
                placeholder="e.g. kafka-architecture-deck.pptx"
                value={pptFileName}
                onChange={(e) => setPptFileName(e.target.value)}
                className="w-full bg-[#101A2D] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
              />
            </div>
          </div>
        </div>

        {/* Step 5: Reference Links */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#9BAAC2] block">
            Additional Reference Documentation Links
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Resource Name (e.g. Official Documentation)"
              value={refTitleInput}
              onChange={(e) => setRefTitleInput(e.target.value)}
              className="flex-1 bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF] outline-none"
            />
            <input
              type="url"
              placeholder="https://..."
              value={refUrlInput}
              onChange={(e) => setRefUrlInput(e.target.value)}
              className="flex-1 bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF] outline-none"
            />
            <button
              type="button"
              onClick={handleAddRefLink}
              className="px-3.5 py-2 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-xs font-bold text-[#77B4FF] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          </div>

          {referenceLinks.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {referenceLinks.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#15233A] text-xs">
                  <span className="text-[#F0F5FF] font-medium">{ref.title} ({ref.url})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRefLink(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#1F2E47] flex items-center justify-between">
          <div className="text-[11px] text-[#9BAAC2]">
            Resources are immediately propagated to enrolled students without manual page reloads.
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#397BFF] hover:bg-[#2868ea] text-white text-xs font-bold shadow-lg shadow-[#397BFF]/30 transition"
          >
            Publish Daily Topic & Notify Cohort
          </button>
        </div>
      </form>
    </div>
  );
};
