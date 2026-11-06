import React, { useState, useEffect } from 'react';
import {
  BookOpen, PlusCircle, Edit, Users, Clock,
  Layers, Sparkles, ChevronRight, Check, Trash2, Power,
  FileText, Image, Compass, Save, CheckCircle2, AlertTriangle,
  X, Tag, Calendar, ExternalLink, ShieldAlert, Plus, FolderPlus
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Module management modal states
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState<number>(1);
  const [isSavingModule, setIsSavingModule] = useState(false);

  // Form states for Add Course
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Full Stack Web Development',
    mentor_name: 'Vikram Patel',
    mentor_email: 'mentor@skillnova.edu',
    duration_weeks: 14,
    timeline: '14 Weeks • Fast-Track Cohort',
    fee: '₹14,999',
    description: 'Master full stack engineering with hands-on projects, systems architecture, and live mentor code reviews.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    roadmap_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    curriculum_text: `Module 1: Foundations & Architecture
- Web Protocols, HTTP/HTTPS, DNS & Browser Engine
- TypeScript 5.5 Core & Asynchronous Event Loop
- RESTful API Contract Design

Module 2: Frontend Engineering
- React 19 State Machines & Server Components
- Tailwind CSS & Kinetic Design Systems
- Client Performance Optimization

Module 3: Distributed Systems & Backend
- Python FastAPI & Async Worker Queues
- PostgreSQL Relational Modeling & Indexing
- Docker, CI/CD & Cloud Deployment`,
    is_published: true
  });

  // Form states for Edit Course
  const [editCourseData, setEditCourseData] = useState({
    id: '',
    title: '',
    category: '',
    mentor_name: '',
    mentor_email: '',
    duration_weeks: 12,
    timeline: '',
    fee: '',
    description: '',
    thumbnail: '',
    roadmap_image_url: '',
    curriculum_text: '',
    is_published: true
  });

  const [curriculumText, setCurriculumText] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadCourses();
    const unsubscribe = dataService.subscribe(loadCourses);
    void dataService.syncCoursesFromSupabase();
    void dataService.syncModulesFromSupabase();
    void dataService.syncSubModulesFromSupabase();
    return () => unsubscribe();
  }, []);

  // Modal background scroll lock & escape listener (Requirement 1)
  useEffect(() => {
    const isAnyModalOpen = showAddCourse || showEditCourse || showDeleteModal || showAddModuleModal || showEditModuleModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowAddCourse(false);
          setShowEditCourse(false);
          setShowDeleteModal(false);
          setShowAddModuleModal(false);
          setShowEditModuleModal(false);
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
  }, [showAddCourse, showEditCourse, showDeleteModal, showAddModuleModal, showEditModuleModal]);

  const loadCourses = () => {
    const list = dataService.getCoursesForCurrentUser();
    setCourses(list);
    if (!selectedCourse && list.length > 0) {
      setSelectedCourse(list[0]);
      setCourseModules(dataService.getModulesForCourse(list[0].id));
      setCurriculumText(dataService.getCourseCurriculum(list[0].id));
    } else if (selectedCourse) {
      const refreshed = list.find(c => c.id === selectedCourse.id);
      if (refreshed) {
        setSelectedCourse(refreshed);
        setCourseModules(dataService.getModulesForCourse(refreshed.id));
      } else if (list.length > 0) {
        setSelectedCourse(list[0]);
        setCourseModules(dataService.getModulesForCourse(list[0].id));
      } else {
        setSelectedCourse(null);
      }
    }
  };

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setCourseModules(dataService.getModulesForCourse(c.id));
    setCurriculumText(dataService.getCourseCurriculum(c.id));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;

    try {
      const created = await dataService.addCourse({
        ...newCourse,
        course_fee: newCourse.fee,
        duration: `${newCourse.duration_weeks} Weeks`
      });

      setShowAddCourse(false);
      handleSelectCourse(created);
      setFeedbackNotice({
        type: 'success',
        message: `Course "${created.title}" successfully created and published to Supabase.`
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: 'Failed to create course in database. Please check connection.'
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleOpenEdit = (course: Course) => {
    setEditCourseData({
      id: course.id,
      title: course.title,
      category: course.category,
      mentor_name: course.mentor_name,
      mentor_email: course.mentor_email,
      duration_weeks: course.duration_weeks,
      timeline: course.timeline || `${course.duration_weeks} Weeks • Regular Track`,
      fee: String(course.course_fee || course.fee || '₹14,999'),
      description: course.description,
      thumbnail: course.thumbnail || course.thumbnail_url || '',
      roadmap_image_url: course.roadmap_image_url || '',
      curriculum_text: course.curriculum_text || dataService.getCourseCurriculum(course.id),
      is_published: course.is_published
    });
    setShowEditCourse(true);
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourseData.id) return;

    try {
      await dataService.updateCourse(editCourseData.id, {
        title: editCourseData.title,
        category: editCourseData.category,
        mentor_name: editCourseData.mentor_name,
        mentor_email: editCourseData.mentor_email,
        duration_weeks: Number(editCourseData.duration_weeks),
        timeline: editCourseData.timeline,
        course_fee: editCourseData.fee,
        fee: editCourseData.fee,
        description: editCourseData.description,
        thumbnail: editCourseData.thumbnail,
        roadmap_image_url: editCourseData.roadmap_image_url,
        curriculum_text: editCourseData.curriculum_text,
        is_published: editCourseData.is_published
      });

      dataService.saveCourseCurriculum(editCourseData.id, editCourseData.curriculum_text);

      setShowEditCourse(false);
      setFeedbackNotice({
        type: 'success',
        message: `Course "${editCourseData.title}" changes saved directly to Supabase.`
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: 'Failed to update course in database.'
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  // Immediate Save Action for Course Row/Card
  const handleDirectSave = async (course: Course) => {
    try {
      await dataService.updateCourse(course.id, {
        title: course.title,
        description: course.description,
        category: course.category,
        is_published: course.is_published
      });

      setFeedbackNotice({
        type: 'success',
        message: `State for "${course.title}" synced and verified with Supabase.`
      });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: `Failed to sync "${course.title}" to database.`
      });
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  const handleOpenDelete = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);

    try {
      const deletedTitle = courseToDelete.title;
      await dataService.deleteCourse(courseToDelete.id);
      setShowDeleteModal(false);
      setCourseToDelete(null);
      setFeedbackNotice({
        type: 'success',
        message: `Course "${deletedTitle}" was safely archived and removed from student workspaces.`
      });
      setTimeout(() => setFeedbackNotice(null), 5000);
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: 'Failed to delete course from database.'
      });
      setTimeout(() => setFeedbackNotice(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveCurriculumText = () => {
    if (!selectedCourse) return;
    dataService.saveCourseCurriculum(selectedCourse.id, curriculumText);
    setFeedbackNotice({
      type: 'success',
      message: `Curriculum blueprint for "${selectedCourse.title}" updated and synced to Supabase.`
    });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // Module Management Handlers
  const handleOpenAddModule = () => {
    if (!selectedCourse) return;
    setModuleTitle(`Module ${courseModules.length + 1}: `);
    setModuleDescription('');
    setModuleOrder(courseModules.length + 1);
    setShowAddModuleModal(true);
  };

  const handleSaveNewModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    setIsSavingModule(true);

    try {
      const created = await dataService.addModule(
        selectedCourse.id,
        moduleTitle.trim(),
        moduleDescription.trim(),
        moduleOrder
      );

      const updatedMods = dataService.getModulesForCourse(selectedCourse.id);
      setCourseModules(updatedMods);

      // Also append to curriculum text editor if not already present
      if (curriculumText && !curriculumText.includes(moduleTitle.trim())) {
        const appended = `${curriculumText.trim()}\n\n${moduleTitle.trim()}${moduleDescription ? `\n- ${moduleDescription}` : ''}`;
        setCurriculumText(appended);
        dataService.saveCourseCurriculum(selectedCourse.id, appended);
      }

      setShowAddModuleModal(false);
      setModuleTitle('');
      setModuleDescription('');
      setFeedbackNotice({
        type: 'success',
        message: `Created module: "${created.title}" and synced to Supabase & Learning Resources!`
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedbackNotice({
        type: 'error',
        message: 'Failed to create module. Please try again.'
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleOpenEditModule = (mod: CourseModule) => {
    setEditingModule(mod);
    setModuleTitle(mod.title);
    setModuleDescription(mod.description || '');
    setModuleOrder(mod.order_index);
    setShowEditModuleModal(true);
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !editingModule || !moduleTitle.trim()) return;
    setIsSavingModule(true);

    try {
      await dataService.updateModule(editingModule.id, {
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        order_index: moduleOrder
      });

      const updatedMods = dataService.getModulesForCourse(selectedCourse.id);
      setCourseModules(updatedMods);
      setShowEditModuleModal(false);
      setEditingModule(null);
      setFeedbackNotice({
        type: 'success',
        message: `Updated module: "${moduleTitle.trim()}" in Supabase!`
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedbackNotice({
        type: 'error',
        message: 'Failed to update module.'
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleDeleteModule = async (mod: CourseModule) => {
    if (!selectedCourse) return;
    if (confirm(`Are you sure you want to delete "${mod.title}"?`)) {
      try {
        await dataService.deleteModule(mod.id);
        const updatedMods = dataService.getModulesForCourse(selectedCourse.id);
        setCourseModules(updatedMods);
        setFeedbackNotice({
          type: 'success',
          message: `Module "${mod.title}" was deleted and removed from Learning Resources.`
        });
        setTimeout(() => setFeedbackNotice(null), 4000);
      } catch (err: any) {
        setFeedbackNotice({
          type: 'error',
          message: 'Failed to delete module from database.'
        });
        setTimeout(() => setFeedbackNotice(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Feedback */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl animate-fadeIn ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 dark:bg-[#397BFF]/20 text-[#0284C7] dark:text-[#77B4FF] border border-sky-200 dark:border-[#397BFF]/40">
              PROGRAM PORTFOLIO
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Supabase Synchronized
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#176BFF] dark:text-[#397BFF]" />
            Course Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#9BAAC2] mt-0.5">
            Create, edit, save, and delete course blueprints, fees, and curriculum modules. Real-time reflection to students and public homepage.
          </p>
        </div>

        <button
          onClick={() => setShowAddCourse(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Course</span>
        </button>
      </div>

      {/* Section 1: Course Cards with Edit, Delete, Save actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#176BFF] dark:text-[#77B4FF]" />
            All Active Courses ({courses.length})
          </h2>
          <span className="text-xs text-slate-600 dark:text-[#9BAAC2]">
            Click any course card to inspect its modules & roadmap blueprint below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;

            return (
              <div
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`bg-white dark:bg-[#101A2D] rounded-3xl border p-5 space-y-4 transition cursor-pointer shadow-md dark:shadow-xl relative group flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#176BFF] ring-2 ring-[#176BFF]/30 bg-sky-50/50 dark:bg-[#15233A]/80'
                    : 'border-slate-200 dark:border-[#1F2E47] hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  {/* Thumbnail & Badges */}
                  <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <img
                      src={course.thumbnail || course.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#11192A]/90 text-[#77B4FF] border border-white/10 backdrop-blur-md">
                        {course.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.is_published
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-amber-500/90 text-black'
                        }`}
                      >
                        {course.is_published ? 'Active' : 'Draft'}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      <span className="font-mono font-bold text-emerald-400">
                        {course.course_fee || course.fee || '₹14,999'}
                      </span>
                      <span className="text-[11px] text-white/80">
                        {course.duration_weeks} Weeks
                      </span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F0F5FF] group-hover:text-[#176BFF] dark:group-hover:text-[#397BFF] transition line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#9BAAC2] line-clamp-2 mt-1 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Mentor & Timeline info */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-600 dark:text-[#9BAAC2]">
                    <span>Mentor: {course.mentor_name}</span>
                    <span className="font-mono font-semibold text-[#0284C7] dark:text-[#77B4FF]">{course.timeline || `${course.duration_weeks} Weeks`}</span>
                  </div>
                </div>

                {/* The 3 Clearly Visible Actions: Edit, Delete, Save */}
                <div
                  className="pt-3 border-t border-slate-200 dark:border-[#1F2E47] grid grid-cols-3 gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Action 1: Edit */}
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] border border-sky-300 dark:border-[#397BFF]/30 text-sky-700 dark:text-[#77B4FF] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Edit course details, fee, timeline, and curriculum"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Action 2: Save */}
                  <button
                    onClick={() => handleDirectSave(course)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Save & sync course to Supabase"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  {/* Action 3: Delete */}
                  <button
                    onClick={() => handleOpenDelete(course)}
                    className="py-2 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Safely archive and delete course from student view"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Selected Course Curriculum Text Blueprint & Roadmap */}
      {selectedCourse && (
        <div className="bg-white dark:bg-[#101A2D] rounded-3xl border border-slate-200 dark:border-[#1F2E47] p-6 space-y-6 shadow-md dark:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2E47]">
            <div>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-[#00D4B8] font-bold uppercase tracking-wider">
                SELECTED PROGRAM BLUEPRINT
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F0F5FF]">
                {selectedCourse.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddModule}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4B8] to-[#00A3FF] hover:opacity-95 text-[#0A111E] text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#00D4B8]/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#0A111E]" />
                <span>+ Add Modules</span>
              </button>
              <button
                onClick={handleSaveCurriculumText}
                className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-[#1258d4] text-white text-xs font-bold flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Curriculum Text to Supabase</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Curriculum Text Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-[#00D4B8]" />
                  Curriculum Modules (Text Format for 16:9 Showcase & Homepage)
                </label>
                <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Markdown / Text supported</span>
              </div>
              <textarea
                rows={10}
                value={curriculumText}
                onChange={(e) => setCurriculumText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-2xl p-4 text-xs font-mono text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF] transition leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter curriculum modules, topics, and week-by-week timeline..."
              />
              <p className="text-[11px] text-slate-500 dark:text-[#9BAAC2]">
                This curriculum text feeds both the animated student dashboard curriculum showcase and the public SkillNova homepage course catalog.
              </p>

              {/* Action Button & Modules Management List */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#1F2E47] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00D4B8]" />
                      Structured Course Modules ({courseModules.length})
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">
                      Organizes Learning Resources uploader & syncs to Supabase.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddModule}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00D4B8] to-[#00A3FF] hover:opacity-95 text-[#0A111E] font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#00D4B8]/20 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0A111E]" />
                    <span>Add Modules</span>
                  </button>
                </div>

                {/* Module cards list */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {courseModules.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-dashed border-slate-300 dark:border-[#1F2E47] text-center">
                      <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
                        No structured modules created yet for this course. Click <strong className="text-cyan-700 dark:text-[#00D4B8]">"Add Modules"</strong> above to create Module 1.
                      </p>
                    </div>
                  ) : (
                    courseModules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-[#1F2E47] hover:border-sky-400 dark:hover:border-[#397BFF]/50 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0 px-2 py-0.5 rounded-lg bg-cyan-100 dark:bg-[#00D4B8]/10 text-cyan-800 dark:text-[#00D4B8] text-[10px] font-mono font-bold border border-cyan-200 dark:border-[#00D4B8]/20">
                            Mod {mod.order_index || idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF] truncate">
                              {mod.title}
                            </h4>
                            {mod.description && (
                              <p className="text-[10px] text-slate-600 dark:text-[#9BAAC2] truncate">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModule(mod)}
                            title="Edit Module"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:text-[#9BAAC2] dark:hover:text-[#397BFF] hover:bg-slate-200 dark:hover:bg-[#101A2D] transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(mod)}
                            title="Delete Module"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-[#9BAAC2] dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-[#101A2D] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Roadmap Viewer for this course */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#176BFF] dark:text-[#397BFF]" />
                  Visual Interactive Learning Roadmap
                </label>
              </div>
              <div className="bg-slate-50 dark:bg-[#15233A] rounded-2xl border border-slate-200 dark:border-white/5 p-4 min-h-[220px]">
                <InteractiveRoadmapViewer
                  roadmapUrl={selectedCourse.roadmap_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'}
                  courseTitle={selectedCourse.title}
                  allowReplace={true}
                  onReplaceUrl={(url: string) => {
                    dataService.updateCourseRoadmap(selectedCourse.id, url);
                    setSelectedCourse({ ...selectedCourse, roadmap_image_url: url });
                    loadCourses();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Edit Course with Full Fields */}
      {showEditCourse && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditCourse(false);
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden">
            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2E47] px-6 py-4 shrink-0 bg-slate-50 dark:bg-[#0E1626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-[#397BFF]/20 dark:text-[#397BFF] flex items-center justify-center border border-sky-200 dark:border-[#397BFF]/30">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Edit Course</h3>
                  <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">Update title, fee, timeline, description, and status</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditCourse(false)}
                className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="edit-course-form" onSubmit={handleSaveEditCourse} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={editCourseData.title}
                    onChange={(e) => setEditCourseData({ ...editCourseData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Category / Domain *</label>
                  <input
                    type="text"
                    required
                    value={editCourseData.category}
                    onChange={(e) => setEditCourseData({ ...editCourseData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Course Fee</label>
                  <input
                    type="text"
                    value={editCourseData.fee}
                    onChange={(e) => setEditCourseData({ ...editCourseData, fee: e.target.value })}
                    placeholder="₹14,999"
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-700 dark:text-[#00D4B8] font-bold outline-none focus:border-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={editCourseData.duration_weeks}
                    onChange={(e) => setEditCourseData({ ...editCourseData, duration_weeks: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Timeline / Cohort</label>
                  <input
                    type="text"
                    value={editCourseData.timeline}
                    onChange={(e) => setEditCourseData({ ...editCourseData, timeline: e.target.value })}
                    placeholder="14 Weeks • Fast-Track"
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Course Thumbnail Image URL</label>
                <input
                  type="text"
                  value={editCourseData.thumbnail}
                  onChange={(e) => setEditCourseData({ ...editCourseData, thumbnail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editCourseData.description}
                  onChange={(e) => setEditCourseData({ ...editCourseData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl p-3 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Curriculum Text Format</label>
                <textarea
                  rows={5}
                  value={editCourseData.curriculum_text}
                  onChange={(e) => setEditCourseData({ ...editCourseData, curriculum_text: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-[#F0F5FF]">
                  <input
                    type="checkbox"
                    checked={editCourseData.is_published}
                    onChange={(e) => setEditCourseData({ ...editCourseData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-[#176BFF]"
                  />
                  <span>Published & Visible to Students</span>
                </label>
              </div>
            </form>

            {/* Pinned Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditCourse(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                form="edit-course-form"
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition"
              >
                Save Changes to Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Course */}
      {showAddCourse && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCourse(false);
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden">
            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2E47] px-6 py-4 shrink-0 bg-slate-50 dark:bg-[#0E1626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-[#397BFF]/20 dark:text-[#397BFF] flex items-center justify-center border border-sky-200 dark:border-[#397BFF]/30">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">Add New Course</h3>
                  <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">Provision a comprehensive engineering curriculum</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCourse(false)}
                className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="add-course-form" onSubmit={handleCreateCourse} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI & Machine Learning Systems"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Fee</label>
                  <input
                    type="text"
                    value={newCourse.fee}
                    onChange={(e) => setNewCourse({ ...newCourse, fee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-700 dark:text-[#00D4B8] font-bold outline-none focus:border-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={newCourse.duration_weeks}
                    onChange={(e) => setNewCourse({ ...newCourse, duration_weeks: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Timeline</label>
                  <input
                    type="text"
                    value={newCourse.timeline}
                    onChange={(e) => setNewCourse({ ...newCourse, timeline: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl p-3 text-xs text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#F0F5FF] block mb-1">Curriculum Text</label>
                <textarea
                  rows={4}
                  value={newCourse.curriculum_text}
                  onChange={(e) => setNewCourse({ ...newCourse, curriculum_text: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#15233A] border border-slate-300 dark:border-[#1F2E47] rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-[#F0F5FF] outline-none focus:border-[#176BFF]"
                />
              </div>

            </form>

            {/* Pinned Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#1F2E47] bg-slate-50 dark:bg-[#0E1626] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddCourse(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                form="add-course-form"
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Safe Transactional Delete Course Confirmation */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101A2D] border border-rose-300 dark:border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-[#F0F5FF]">
                Delete Course: {courseToDelete.title}?
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 font-semibold">
                This action safely archives the course from all student workspaces.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#15233A] p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-700 dark:text-[#9BAAC2]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Removes course availability from student interface and homepage catalog.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Revokes student visibility of all associated Drive videos, PPTs, and quizzes.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Safely retains historical quiz submissions and audit log entries.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCourseToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Archiving...' : 'Yes, Delete Course'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Add Module Modal */}
      {showAddModuleModal && selectedCourse && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModuleModal(false);
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1F2E47]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-[#00D4B8]/15 text-cyan-700 dark:text-[#00D4B8] flex items-center justify-center border border-cyan-200 dark:border-[#00D4B8]/30">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-[#F0F5FF]">Add Curriculum Module</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">{selectedCourse.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModuleModal(false)}
                className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1: Python Core Foundations & Internals"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#15233A] text-xs text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1F2E47] outline-none focus:border-[#176BFF] transition font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Module Description / Key Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Memory models, bytecode disassembly, decorators, generator pipelines..."
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#15233A] text-xs text-slate-900 dark:text-[#F0F5FF] placeholder-slate-400 dark:placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1F2E47] outline-none focus:border-[#176BFF] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Order Index (Sequence)
                </label>
                <input
                  type="number"
                  min={1}
                  value={moduleOrder}
                  onChange={(e) => setModuleOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#15233A] text-xs text-slate-900 dark:text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1F2E47] outline-none focus:border-[#176BFF] transition font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-white/5 text-[11px] text-slate-700 dark:text-[#9BAAC2] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00D4B8] shrink-0 mt-0.5" />
                <span>This module will be immediately available in Learning Resources for Drive Videos, PPT slide ranges, Interview DOCs, Flashcards, and Quizzes, and synced to Supabase.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingModule || !moduleTitle.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#00D4B8] to-[#00A3FF] hover:opacity-95 text-[#0A111E] shadow-lg shadow-[#00D4B8]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingModule ? 'Saving...' : 'Save Module to Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Edit Module Modal */}
      {showEditModuleModal && editingModule && selectedCourse && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModuleModal(false);
              setEditingModule(null);
            }
          }}
        >
          <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1F2E47]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-[#397BFF]/15 text-sky-700 dark:text-[#397BFF] flex items-center justify-center border border-sky-200 dark:border-[#397BFF]/30">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-[#F0F5FF]">Edit Curriculum Module</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">{selectedCourse.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                }}
                className="text-slate-400 hover:text-slate-800 dark:text-[#9BAAC2] dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#15233A] text-xs text-slate-900 dark:text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1F2E47] outline-none focus:border-[#176BFF] transition font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Module Description / Key Objectives
                </label>
                <textarea
                  rows={3}
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#15233A] text-xs text-slate-900 dark:text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1F2E47] outline-none focus:border-[#176BFF] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Order Index (Sequence)
                </label>
                <input
                  type="number"
                  min={1}
                  value={moduleOrder}
                  onChange={(e) => setModuleOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#15233A] text-xs text-slate-900 dark:text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1F2E47] outline-none focus:border-[#176BFF] transition font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModuleModal(false);
                    setEditingModule(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#9BAAC2] bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingModule || !moduleTitle.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#176BFF] hover:bg-[#1258d4] text-white shadow-lg shadow-[#176BFF]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingModule ? 'Saving...' : 'Update Module in Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagementPage;
