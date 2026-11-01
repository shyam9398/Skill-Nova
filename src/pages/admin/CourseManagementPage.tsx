import React, { useState, useEffect } from 'react';
import {
  BookOpen, PlusCircle, MapPin, Edit, Users, Clock,
  Layers, Sparkles, ChevronRight, Check, Trash2, Power,
  Archive, FileText, Image, Video, Compass, Save
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Course, CourseModule } from '../../types';
import { InteractiveRoadmapViewer } from '../../components/courses/InteractiveRoadmapViewer';

export const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);

  // Modals state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  // Form states
  const [moduleTitle, setModuleTitle] = useState('');
  const [targetModuleId, setTargetModuleId] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Full Stack',
    mentor_name: 'Vikram Patel',
    mentor_email: 'mentor@skillnova.edu',
    duration_weeks: 14,
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    roadmap_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
  });

  const [editCourseData, setEditCourseData] = useState({
    title: '',
    category: 'Full Stack',
    mentor_name: '',
    mentor_email: '',
    duration_weeks: 12,
    description: '',
    thumbnail: '',
    roadmap_image_url: '',
    is_published: true,
  });

  useEffect(() => {
    loadCourses();
    const unsubscribe = dataService.subscribe(loadCourses);
    return () => unsubscribe();
  }, []);

  const loadCourses = () => {
    const list = dataService.getCourses();
    setCourses(list);
    if (!selectedCourse && list.length > 0) {
      setSelectedCourse(list[0]);
      setCourseModules(dataService.getModulesForCourse(list[0].id));
    } else if (selectedCourse) {
      const refreshed = list.find(c => c.id === selectedCourse.id);
      if (refreshed) {
        setSelectedCourse(refreshed);
        setCourseModules(dataService.getModulesForCourse(refreshed.id));
      }
    }
  };

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setCourseModules(dataService.getModulesForCourse(c.id));
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title) return;
    const created = dataService.addCourse(newCourse);
    setShowAddCourse(false);
    handleSelectCourse(created);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditCourseData({
      title: course.title,
      category: course.category,
      mentor_name: course.mentor_name,
      mentor_email: course.mentor_email,
      duration_weeks: course.duration_weeks,
      description: course.description,
      thumbnail: course.thumbnail || '',
      roadmap_image_url: course.roadmap_image_url || '',
      is_published: course.is_published,
    });
    setShowEditCourse(true);
  };

  const handleSaveEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    dataService.updateCourse(selectedCourse.id, editCourseData);
    setShowEditCourse(false);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    dataService.addModule(selectedCourse.id, moduleTitle.trim());
    setModuleTitle('');
    setShowAddModule(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !targetModuleId || !newTopicTitle.trim()) return;
    dataService.addTopic({
      course_id: selectedCourse.id,
      module_id: targetModuleId,
      title: newTopicTitle.trim(),
      description: newTopicDesc.trim(),
      release_status: 'released',
    });
    setNewTopicTitle('');
    setNewTopicDesc('');
    setShowAddTopic(false);
  };

  const handleUpdateRoadmap = (newUrl: string) => {
    if (selectedCourse) {
      dataService.updateCourseRoadmap(selectedCourse.id, newUrl);
    }
  };

  const handleToggleCoursePublish = () => {
    if (!selectedCourse) return;
    dataService.updateCourse(selectedCourse.id, { is_published: !selectedCourse.is_published });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 3D Elevated Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#EAF3FF] via-[#F0F6FF] to-[#E3EFFF] border border-[#00D9FF]/30 shadow-[0_12px_30px_-5px_rgba(0,163,255,0.12)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176BFF]/10 text-[#176BFF] text-xs font-bold border border-[#00A3FF]/25 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>Curriculum Architecture & Roadmaps</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#15243B] tracking-tight">
            Course Management Studio
          </h1>
          <p className="text-xs text-[#73839B] mt-0.5 leading-relaxed">
            Create multi-tier courses, define modules and practical topics, assign mentors, and update interactive visual roadmaps.
          </p>
        </div>

        <button
          onClick={() => setShowAddCourse(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/30 flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Selector Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-[#15243B] uppercase tracking-wider">
              Available Courses ({courses.length})
            </h3>
            <span className="text-[10px] text-[#73839B] font-mono">Select to Manage</span>
          </div>

          <div className="space-y-3">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className={`p-4 rounded-3xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#E1EEFD] to-[#EDF5FE] border-[#00D9FF] shadow-[0_8px_24px_rgba(0,163,255,0.18)] ring-2 ring-[#00D9FF]/30 scale-[1.01]'
                      : 'bg-white/85 border-[#00D9FF]/20 hover:border-[#00D9FF]/40 shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#176BFF]/15 text-[#176BFF] border border-[#00A3FF]/25">
                        {course.category}
                      </span>
                      {course.is_published ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Archived
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-[#15243B] line-clamp-1">{course.title}</h4>
                    <div className="text-[11px] text-[#73839B] flex items-center gap-2">
                      <span>{course.duration_weeks} Weeks</span>
                      <span>•</span>
                      <span>{course.mentor_name}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#176BFF]' : 'text-[#73839B]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Course Details, Roadmap & Modules (8 cols) */}
        {selectedCourse && (
          <div className="lg:col-span-8 space-y-6">
            {/* Course Summary Banner with 3D Bevel */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/30 shadow-[0_16px_36px_-6px_rgba(0,163,255,0.12)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#176BFF] font-bold uppercase tracking-wider bg-[#176BFF]/15 px-2.5 py-0.5 rounded-full border border-[#00A3FF]/30">
                      {selectedCourse.category}
                    </span>
                    <span className="text-xs font-bold text-[#73839B]">
                      {selectedCourse.duration_weeks} Weeks Curriculum
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-[#15243B]">{selectedCourse.title}</h2>
                  <p className="text-xs text-[#73839B] max-w-xl leading-relaxed">{selectedCourse.description}</p>
                </div>

                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditCourse(selectedCourse)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F6FF] border border-[#00D9FF]/35 text-[#176BFF] text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={handleToggleCoursePublish}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition ${
                      selectedCourse.is_published
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{selectedCourse.is_published ? 'Deactivate' : 'Activate Course'}</span>
                  </button>
                </div>
              </div>

              {/* Floating Course Roadmap Viewer */}
              <div className="pt-2">
                <InteractiveRoadmapViewer
                  roadmapUrl={selectedCourse.roadmap_image_url}
                  courseTitle={selectedCourse.title}
                  allowReplace={true}
                  onReplaceUrl={handleUpdateRoadmap}
                />
              </div>
            </div>

            {/* Modules and Topics Section */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#00D9FF]/30 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-[#00A3FF]/20 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#15243B] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#176BFF]" />
                    Curriculum Modules & Lesson Topics
                  </h3>
                  <p className="text-[11px] text-[#73839B]">Define sequential learning chapters and practical lessons</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddModule(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#EAF3FF] hover:bg-[#176BFF] text-[#176BFF] hover:text-white border border-[#00A3FF]/30 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                </div>
              </div>

              {/* Module List */}
              <div className="space-y-4">
                {courseModules.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#73839B] space-y-2">
                    <Layers className="w-8 h-8 text-[#00A3FF] mx-auto opacity-50" />
                    <p>No modules defined for this course yet.</p>
                    <button
                      onClick={() => setShowAddModule(true)}
                      className="text-xs text-[#176BFF] font-bold hover:underline"
                    >
                      Create First Module
                    </button>
                  </div>
                ) : (
                  courseModules.map((mod) => (
                    <div key={mod.id} className="bg-gradient-to-r from-[#F9FCFF] to-[#F2F7FE] border border-[#00A3FF]/25 rounded-2xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#15243B]">{mod.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#176BFF] font-mono font-bold">
                            {mod.topics?.length || 0} Lessons
                          </span>
                          <button
                            onClick={() => {
                              setTargetModuleId(mod.id);
                              setShowAddTopic(true);
                            }}
                            className="text-[11px] font-bold text-[#176BFF] hover:underline flex items-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Add Topic</span>
                          </button>
                        </div>
                      </div>

                      {mod.topics && mod.topics.length > 0 ? (
                        <div className="space-y-2 pl-3 border-l-2 border-[#176BFF]/40">
                          {mod.topics.map(t => (
                            <div key={t.id} className="text-xs text-[#15243B] flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-white border border-[#00A3FF]/15">
                              <span className="font-semibold">{t.title}</span>
                              <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
                                {t.recording_url && <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Video</span>}
                                {t.drive_notes_url && <span className="text-[#176BFF] bg-blue-100 px-1.5 py-0.5 rounded">Notes</span>}
                                {t.pdf_file_url && <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">PDF</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#73839B] italic pl-3">
                          No topics added yet. Click "Add Topic" to populate this module.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ADD COURSE MODAL */}
      {/* ======================================================== */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/40 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#15243B] flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#176BFF]" />
              Create Structured Course
            </h3>
            <p className="text-xs text-[#73839B]">
              Add course title, category, duration, mentor contact, and floating visual roadmap image.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & High-Scale Microservices"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1">Category</label>
                  <input
                    type="text"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={newCourse.duration_weeks}
                    onChange={(e) => setNewCourse({ ...newCourse, duration_weeks: Number(e.target.value) })}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1">Assigned Mentor</label>
                  <input
                    type="text"
                    value={newCourse.mentor_name}
                    onChange={(e) => setNewCourse({ ...newCourse, mentor_name: e.target.value })}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1">Mentor Email</label>
                  <input
                    type="email"
                    value={newCourse.mentor_email}
                    onChange={(e) => setNewCourse({ ...newCourse, mentor_email: e.target.value })}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Course Description</label>
                <textarea
                  rows={2}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Visual Roadmap Image URL</label>
                <input
                  type="url"
                  value={newCourse.roadmap_image_url}
                  onChange={(e) => setNewCourse({ ...newCourse, roadmap_image_url: e.target.value })}
                  className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#73839B] hover:bg-[#F0F6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-xs font-black shadow-md shadow-[#00A3FF]/30"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT COURSE MODAL */}
      {/* ======================================================== */}
      {showEditCourse && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#FAFCFF] to-[#EFF6FF] border border-[#00D9FF]/40 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#15243B] flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#176BFF]" />
              Edit Course Details
            </h3>

            <form onSubmit={handleSaveEditCourse} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editCourseData.title}
                  onChange={(e) => setEditCourseData({ ...editCourseData, title: e.target.value })}
                  className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1">Category</label>
                  <input
                    type="text"
                    value={editCourseData.category}
                    onChange={(e) => setEditCourseData({ ...editCourseData, category: e.target.value })}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#15243B] block mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={editCourseData.duration_weeks}
                    onChange={(e) => setEditCourseData({ ...editCourseData, duration_weeks: Number(e.target.value) })}
                    className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editCourseData.description}
                  onChange={(e) => setEditCourseData({ ...editCourseData, description: e.target.value })}
                  className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Roadmap Image URL</label>
                <input
                  type="url"
                  value={editCourseData.roadmap_image_url}
                  onChange={(e) => setEditCourseData({ ...editCourseData, roadmap_image_url: e.target.value })}
                  className="w-full bg-white border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCourse(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#73839B] hover:bg-[#F0F6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-xs font-black shadow-md shadow-[#00A3FF]/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD MODULE MODAL */}
      {/* ======================================================== */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#00D9FF]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-base font-black text-[#15243B]">
              Add Module to {selectedCourse?.title}
            </h3>
            <p className="text-xs text-[#73839B]">Define a new curriculum chapter or section.</p>

            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 4: High-Throughput Event Streams"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full bg-[#F5F9FF] border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#73839B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-bold"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD TOPIC DIRECTLY MODAL */}
      {/* ======================================================== */}
      {showAddTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#00D9FF]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-base font-black text-[#15243B]">
              Add Topic to Curriculum
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Docker Containerization & Pod Orchestration"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full bg-[#F5F9FF] border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#15243B] block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Core concepts covered..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full bg-[#F5F9FF] border border-[#00A3FF]/30 rounded-2xl px-4 py-2.5 text-xs text-[#15243B] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopic(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#73839B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-bold"
                >
                  Save Lesson Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
