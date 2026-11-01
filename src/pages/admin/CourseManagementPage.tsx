import React, { useState, useEffect } from 'react';
import {
  BookOpen, PlusCircle, MapPin, Edit, Users, Clock,
  Layers, Sparkles, ChevronRight, Check
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Course, CourseModule } from '../../types';
import { InteractiveRoadmapViewer } from '../../components/courses/InteractiveRoadmapViewer';

export const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);

  // Add course modal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

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

  useEffect(() => {
    const update = () => {
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
    update();
    return dataService.subscribe(update);
  }, []);

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

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    dataService.addModule(selectedCourse.id, moduleTitle.trim());
    setModuleTitle('');
    setShowAddModule(false);
  };

  const handleUpdateRoadmap = (newUrl: string) => {
    if (selectedCourse) {
      dataService.updateCourseRoadmap(selectedCourse.id, newUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#397BFF]" />
            Course & Roadmap Management
          </h1>
          <p className="text-xs text-[#9BAAC2] mt-0.5">
            Create structured technology curricula, manage modules, and update floating roadmaps.
          </p>
        </div>

        <button
          onClick={() => setShowAddCourse(true)}
          className="px-4 py-2 rounded-xl bg-[#397BFF] hover:bg-[#2868ea] text-white text-xs font-bold shadow-lg shadow-[#397BFF]/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Selector Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-[#9BAAC2] uppercase tracking-wider">
            Available Courses ({courses.length})
          </h3>

          <div className="space-y-2.5">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#15233A] border-[#397BFF] shadow-[0_0_15px_rgba(57,123,255,0.25)]'
                      : 'bg-[#101A2D] border-[#1F2E47] hover:border-[#397BFF]/40'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30">
                      {course.category}
                    </span>
                    <h4 className="text-xs font-bold text-[#F0F5FF] line-clamp-1">{course.title}</h4>
                    <div className="text-[11px] text-[#9BAAC2] flex items-center gap-2">
                      <span>{course.duration_weeks} Weeks</span>
                      <span>•</span>
                      <span>{course.mentor_name}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#397BFF]' : 'text-[#9BAAC2]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Course Details, Roadmap & Modules (8 cols) */}
        {selectedCourse && (
          <div className="lg:col-span-8 space-y-6">
            {/* Course Summary Banner */}
            <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-[#77B4FF] uppercase tracking-wider bg-[#397BFF]/20 px-2.5 py-0.5 rounded border border-[#397BFF]/30">
                    {selectedCourse.category}
                  </span>
                  <h2 className="text-xl font-black text-[#F0F5FF] mt-1.5">{selectedCourse.title}</h2>
                  <p className="text-xs text-[#9BAAC2] mt-1">{selectedCourse.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-bold text-[#F0F5FF]">Mentor: {selectedCourse.mentor_name}</div>
                  <div className="text-[11px] text-[#77B4FF]">{selectedCourse.mentor_email}</div>
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
            <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F2E47] pb-3">
                <h3 className="text-base font-bold text-[#F0F5FF] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#397BFF]" />
                  Curriculum Modules & Topics
                </h3>
                <button
                  onClick={() => setShowAddModule(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#397BFF]/20 hover:bg-[#397BFF]/30 text-[#77B4FF] border border-[#397BFF]/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Module
                </button>
              </div>

              {/* Module List */}
              <div className="space-y-4">
                {courseModules.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#9BAAC2]">
                    No modules defined for this course yet. Click "Add Module" above.
                  </div>
                ) : (
                  courseModules.map((mod, idx) => (
                    <div key={mod.id} className="bg-[#15233A] border border-[#1F2E47] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F0F5FF]">{mod.title}</span>
                        <span className="text-[11px] text-[#77B4FF] font-mono">
                          {mod.topics?.length || 0} Topics
                        </span>
                      </div>

                      {mod.topics && mod.topics.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-[#397BFF]/40">
                          {mod.topics.map(t => (
                            <div key={t.id} className="text-xs text-[#9BAAC2] flex items-center justify-between py-1">
                              <span>{t.title}</span>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                {t.has_recording && <span className="text-emerald-400">Rec</span>}
                                {t.has_notes && <span className="text-[#77B4FF]">Notes</span>}
                                {t.has_quiz && <span className="text-purple-400">Quiz</span>}
                              </div>
                            </div>
                          ))}
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

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#397BFF]" />
              Create Structured Course
            </h3>
            <p className="text-xs text-[#9BAAC2] mb-4">
              Add course syllabus, mentor contact, duration, and floating roadmap graphic.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & High-Scale Backend"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Category</label>
                  <input
                    type="text"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={newCourse.duration_weeks}
                    onChange={(e) => setNewCourse({ ...newCourse, duration_weeks: Number(e.target.value) })}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Roadmap Image URL</label>
                <input
                  type="text"
                  value={newCourse.roadmap_image_url}
                  onChange={(e) => setNewCourse({ ...newCourse, roadmap_image_url: e.target.value })}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#9BAAC2] bg-[#15233A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#397BFF] text-white hover:bg-[#2868ea]"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-1">
              Add Module to {selectedCourse?.title}
            </h3>
            <p className="text-xs text-[#9BAAC2] mb-3">
              Define a sequential module in the curriculum.
            </p>

            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 4: High-Throughput Message Queues"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#9BAAC2] bg-[#15233A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#397BFF] text-white hover:bg-[#2868ea]"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
