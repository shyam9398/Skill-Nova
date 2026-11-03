import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Play, 
  Download, 
  ExternalLink, 
  Calendar, 
  Filter, 
  Search, 
  BookOpen,
  Sparkles,
  Layers,
  Radio
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { LearningResource, Course } from '../../types';

export const StudentResourcesFeedPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void dataService.syncTopicsFromSupabase();
    void dataService.syncCoursesFromSupabase();
    // Initial fetch
    setResources(dataService.getResources());
    setCourses(dataService.getCourses());

    // Subscribe to reactive store so newly published resources appear immediately
    const unsubscribe = dataService.subscribe(() => {
      setResources(dataService.getResources());
      setCourses(dataService.getCourses());
    });

    return () => unsubscribe();
  }, []);

  const filtered = resources.filter(res => {
    const matchesCourse = selectedCourseFilter === 'all' || res.courseId === selectedCourseFilter;
    const matchesType = selectedTypeFilter === 'all' || 
      (selectedTypeFilter === 'recording' && !!res.recordingUrl) ||
      (selectedTypeFilter === 'notes' && !!res.driveNotesUrl);
    const matchesSearch = 
      res.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Live Chronological Learning Stream
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">Real-time Reactive Feed</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
          Published Learning Resources
        </h1>
        <p className="text-sm text-[#9BAAC2]">
          All class recordings, syllabus notes, slide decks, and external references published by mentors—sorted newest first.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#15233A] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search topic or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080E1C] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Course Select */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[#080E1C] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedTypeFilter === 'all' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedTypeFilter('recording')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedTypeFilter === 'recording' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              Recordings
            </button>
            <button
              onClick={() => setSelectedTypeFilter('notes')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedTypeFilter === 'notes' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              Notes / PDFs
            </button>
          </div>
        </div>
      </div>

      {/* Chronological Feed */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item, index) => (
            <div
              key={item.id}
              className="bg-[#15233A] rounded-2xl border border-white/5 p-5 hover:border-[#397BFF]/40 transition group shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#101A2D] border border-white/5 flex items-center justify-center flex-shrink-0 text-[#77B4FF] group-hover:scale-105 transition">
                    {item.recordingUrl ? (
                      <Video className="w-6 h-6 text-[#397BFF]" />
                    ) : (
                      <FileText className="w-6 h-6 text-[#77B4FF]" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#397BFF]/15 text-[#77B4FF] border border-[#397BFF]/25">
                        {item.courseName}
                      </span>
                      <span className="text-xs text-[#9BAAC2] font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#397BFF]" /> {item.publishedAt}
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          Newest
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#F0F5FF] group-hover:text-[#77B4FF] transition">
                      {item.topicTitle}
                    </h3>

                    <p className="text-xs text-[#9BAAC2] line-clamp-2 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>

                    {/* Indicators */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      {item.recordingUrl ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                          ● Recording Available
                        </span>
                      ) : (
                        <span className="text-[#9BAAC2] flex items-center gap-1 text-[11px]">
                          ○ No Recording
                        </span>
                      )}

                      {item.driveNotesUrl ? (
                        <span className="text-blue-400 flex items-center gap-1 font-medium text-[11px]">
                          ● Notes Attached
                        </span>
                      ) : (
                        <span className="text-[#9BAAC2] flex items-center gap-1 text-[11px]">
                          ○ No Drive Notes
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  {item.recordingUrl && (
                    <a
                      href={item.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#397BFF] hover:bg-[#397BFF]/90 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(57,123,255,0.3)] transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Watch Recording
                    </a>
                  )}

                  {item.driveNotesUrl && (
                    <a
                      href={item.driveNotesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#101A2D] hover:bg-[#080E1C] border border-white/10 text-[#F0F5FF] text-xs font-semibold flex items-center gap-2 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#77B4FF]" /> Drive Notes <ExternalLink className="w-3 h-3 text-[#9BAAC2]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#15233A] rounded-2xl border border-white/5 p-12 text-center text-[#9BAAC2]">
            No learning resources match your current filter.
          </div>
        )}
      </div>
    </div>
  );
};
