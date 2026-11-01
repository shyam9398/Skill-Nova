import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Map, Layers, Video, FileText, Sparkles,
  CheckCircle2, Clock, Play, HelpCircle, ExternalLink,
  Presentation, Download, BookOpen, Compass
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { InteractiveRoadmapViewer } from '../../components/courses/InteractiveRoadmapViewer';
import { InAppResourceViewer } from '../../components/resource/InAppResourceViewer';
import { FlashcardDeck } from '../../components/practice/FlashcardDeck';
import { QuizEngine } from '../../components/practice/QuizEngine';
import type { Topic } from '../../types';

export const StudentCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = dataService.getCourseById(courseId || '');
  const modules = dataService.getModules(courseId || '');
  const topics = dataService.getTopics(courseId || '');
  const attempts = dataService.getQuizAttempts();

  const [activeTab, setActiveTab] = useState<'feed' | 'roadmap' | 'practice' | 'quiz'>('feed');

  // In-App Viewer State
  const [viewerTopic, setViewerTopic] = useState<Topic | null>(null);
  const [viewerType, setViewerType] = useState<'recording' | 'drive_notes' | 'pdf' | 'ppt' | 'meet' | null>(null);

  if (!course) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-[#15243B]">Course Not Found</h2>
        <p className="text-xs text-[#73839B]">The requested course is not assigned to your account or has been archived.</p>
        <Link to="/student/courses" className="text-xs text-[#176BFF] font-bold hover:underline">
          Return to My Courses
        </Link>
      </div>
    );
  }

  // Chronological learning feed (newest first per Section 7)
  const sortedTopics = [...topics].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  const openInAppViewer = (topic: Topic, type: 'recording' | 'drive_notes' | 'pdf' | 'ppt' | 'meet') => {
    setViewerTopic(topic);
    setViewerType(type);
  };

  const courseAttempts = attempts.filter(a => a.course_id === course.id);
  const progressPercent = Math.min(100, Math.round((courseAttempts.length / Math.max(1, topics.length)) * 100));

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Back Link */}
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#73839B] hover:text-[#176BFF] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Enrolled Courses</span>
      </Link>

      {/* Course Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 font-mono">
              {course.category}
            </span>
            <span className="text-xs text-[#73839B] font-mono">{course.duration_weeks} Weeks Curriculum</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#15243B]">
            {course.title}
          </h1>

          <p className="text-xs md:text-sm text-[#73839B] leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <span className="text-[#15243B]">
              Assigned Mentor: <strong className="text-[#176BFF]">{course.mentor_name}</strong>
            </span>
            <span>•</span>
            <span className="text-[#73839B]">
              {modules.length} Modules • {topics.length} Published Topics
            </span>
          </div>
        </div>

        {/* Progress & Quick Stats Card */}
        <div className="bg-[#F5F9FF] p-5 rounded-2xl border border-[#DFE9F6] space-y-2 md:min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#15243B]">Syllabus Progress</span>
            <span className="text-[#176BFF]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#DFE9F6] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#176BFF] to-[#00A3FF] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-[#73839B] text-center pt-1">
            {courseAttempts.length} of {topics.length} lessons evaluated
          </div>
        </div>
      </div>

      {/* Course Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DFE9F6] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'feed'
              ? 'bg-[#176BFF] text-white shadow-sm'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Learning Resource Feed</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {topics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'bg-[#176BFF] text-white shadow-sm'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Interactive Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'practice'
              ? 'bg-[#176BFF] text-white shadow-sm'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Flashcards Deck</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'bg-[#176BFF] text-white shadow-sm'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Timed Quiz Drill</span>
        </button>
      </div>

      {/* Tab Content 1: My Learning Resource Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#73839B]">
            <span>Showing latest published topics first (chronological feed)</span>
            <span className="font-mono">{sortedTopics.length} Total Lessons</span>
          </div>

          <div className="space-y-3">
            {sortedTopics.map((topic, idx) => {
              const hasRecording = Boolean(topic.recording_url);
              const hasDriveNotes = Boolean(topic.drive_notes_url);
              const hasPdf = Boolean(topic.pdf_file_url);
              const hasPpt = Boolean(topic.ppt_file_url);
              const isMeet = topic.recording_url?.includes('meet.google.com');

              return (
                <div
                  key={topic.id}
                  className="p-5 rounded-3xl bg-white border border-[#DFE9F6] shadow-xs hover:border-[#00A3FF] transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center font-bold text-xs shrink-0">
                        {sortedTopics.length - idx}
                      </span>
                      <h3 className="text-sm font-bold text-[#15243B]">
                        {topic.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#73839B] font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#176BFF]" />
                      <span>{topic.created_at ? new Date(topic.created_at).toLocaleDateString() : 'Today'}</span>
                    </div>
                  </div>

                  {topic.description && (
                    <p className="text-xs text-[#73839B] leading-relaxed">
                      {topic.description}
                    </p>
                  )}

                  {/* Resource Action Triggers (Keep in-app!) */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DFE9F6]">
                    {hasRecording && (
                      <button
                        onClick={() => openInAppViewer(topic, isMeet ? 'meet' : 'recording')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EAF3FF] hover:bg-[#176BFF] text-[#176BFF] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{isMeet ? 'Live Class Info' : 'Class Recording'}</span>
                      </button>
                    )}

                    {hasDriveNotes && (
                      <button
                        onClick={() => openInAppViewer(topic, 'drive_notes')}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-semibold text-[#15243B] flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#00A3FF]" />
                        <span>Drive Notes</span>
                      </button>
                    )}

                    {hasPdf && (
                      <button
                        onClick={() => openInAppViewer(topic, 'pdf')}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-semibold text-[#15243B] flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#176BFF]" />
                        <span>PDF Lecture</span>
                      </button>
                    )}

                    {hasPpt && (
                      <button
                        onClick={() => openInAppViewer(topic, 'ppt')}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-semibold text-[#15243B] flex items-center gap-1.5 transition"
                      >
                        <Presentation className="w-3.5 h-3.5 text-[#00D9FF]" />
                        <span>Presentation Slides</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Interactive Course Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <InteractiveRoadmapViewer
            courseTitle={course.title}
            roadmapUrl={course.roadmap_image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200'}
          />
        </div>
      )}

      {/* Tab Content 3: Flashcards Deck */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <FlashcardDeck cards={dataService.getFlashcards(course.id)} topicTitle={course.title} />
        </div>
      )}

      {/* Tab Content 4: Timed Quiz Engine */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <QuizEngine 
            questions={dataService.getQuizzes()} 
            topicTitle={course.title}
            courseId={course.id} 
          />
        </div>
      )}

      {/* In-App Resource Viewer Modal */}
      {viewerTopic && viewerType && (
        <InAppResourceViewer
          topic={viewerTopic}
          resourceType={viewerType}
          onClose={() => {
            setViewerTopic(null);
            setViewerType(null);
          }}
        />
      )}
    </div>
  );
};
