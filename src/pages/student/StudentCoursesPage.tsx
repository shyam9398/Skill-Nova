import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, UserCheck, Search, Filter, Video, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import type { Course } from '../../types';

export const StudentCoursesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>(() => 
    currentUser ? dataService.getEnrolledCoursesForStudent(currentUser.id) : []
  );

  useEffect(() => {
    void dataService.syncCoursesFromSupabase();
    void dataService.syncUsersFromSupabase();
    const update = () => {
      setEnrolledCourses(currentUser ? dataService.getEnrolledCoursesForStudent(currentUser.id) : []);
    };
    update();
    return dataService.subscribe(update);
  }, [currentUser]);

  const topics = dataService.getTopics();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(enrolledCourses.map(c => c.category)))];

  const filtered = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                          course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] dark:bg-[#15233A] text-[#176BFF] dark:text-[#77B4FF] border border-[#00A3FF]/25 dark:border-white/10 font-mono flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#77B4FF]" />
            Academic Curriculum
          </span>
          <span className="text-xs text-[#73839B] dark:text-[#9BAAC2] font-mono">{enrolledCourses.length} Enrolled Courses</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#15243B] dark:text-white">
          My Technology Courses
        </h1>
        <p className="text-xs md:text-sm text-[#73839B] dark:text-[#9BAAC2]">
          Follow structured modules, access daily recordings, download study notes, and track your topic completion progress.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#73839B] dark:text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#101A2D] border border-[#DFE9F6] dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#15243B] dark:text-white placeholder-[#73839B] dark:placeholder-[#9BAAC2] focus:outline-hidden focus:border-[#176BFF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#73839B] dark:text-[#9BAAC2] shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-[#176BFF] text-white shadow-sm'
                  : 'bg-white dark:bg-[#101A2D] border border-[#DFE9F6] dark:border-white/10 text-[#73839B] dark:text-[#9BAAC2] hover:text-[#15243B] dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#101A2D] border border-[#DFE9F6] dark:border-white/10 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-[#00A3FF] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#15243B] dark:text-white">
            No courses found
          </h3>
          <p className="text-xs text-[#73839B] dark:text-[#9BAAC2] max-w-md mx-auto">
            {search ? 'No enrolled courses match your search criteria.' : 'No courses have been assigned to your account yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const courseTopics = topics.filter(t => t.course_id === course.id);
            const recordingsCount = courseTopics.filter(t => t.recording_url).length;
            const notesCount = courseTopics.filter(t => t.drive_notes_url || t.pdf_file_url).length;

            return (
              <div
                key={course.id}
                className="rounded-3xl bg-white dark:bg-[#101A2D] border border-[#DFE9F6] dark:border-white/10 overflow-hidden shadow-xs hover:border-[#00A3FF] hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-[#EAF3FF] dark:bg-[#15233A]">
                  <img
                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#176BFF] dark:text-[#77B4FF] border border-[#DFE9F6] dark:border-white/15">
                    {course.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#15243B] dark:text-white line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#73839B] dark:text-[#9BAAC2] line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="text-[11px] text-[#15243B] dark:text-slate-300 font-medium pt-1">
                      Assigned Mentor: <strong className="text-[#176BFF] dark:text-[#77B4FF]">{course.mentor_name}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE9F6] dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#73839B] dark:text-[#9BAAC2]">
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#77B4FF]" />
                        {recordingsCount} Recordings
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#00A3FF]" />
                        {notesCount} Notes
                      </span>
                    </div>

                    <Link
                      to={`/student/courses/${course.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#EAF3FF] dark:bg-[#15233A] hover:bg-[#176BFF] text-[#176BFF] dark:text-[#77B4FF] hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <span>Open Course Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
