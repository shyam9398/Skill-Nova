import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { AIGenerationJob, Course, Topic } from '../../types';

export const AIContentGeneratorPage: React.FC = () => {
  const [courses] = useState<Course[]>(dataService.getCourses());
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [activeJob, setActiveJob] = useState<AIGenerationJob | null>(() => {
    const jobs = dataService.getAIJobs();
    return jobs[0] || null;
  });

  // Upload & Generation state
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [rawTextSample, setRawTextSample] = useState('');
  const [reviewTab, setReviewTab] = useState<'summary' | 'flashcards' | 'quizzes' | 'interview' | 'concepts'>('summary');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const topics: Topic[] = selectedCourse ? dataService.getTopics(selectedCourse.id) : [];

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setRawTextSample(`[Extracted text stream from ${file.name}]\nSection 1: Core Paradigms\nModern distributed backends require deterministic concurrency models and unified memory bounds. In Node.js / React microservices, asynchronous execution handles non-blocking I/O via the V8 event loop phases: timers, pending callbacks, idle/prepare, poll, check, and close callbacks...`);
  };

  const handleTriggerAIGeneration = () => {
    if (!selectedCourseId) return;
    setIsUploading(true);
    setPublishSuccess(false);

    setTimeout(() => {
      const topicTitle = topics.find(t => t.id === selectedTopicId)?.title || 'Modern Architecture & Async Runtimes';
      const newJob = dataService.generateAIContentFromDoc(
        selectedCourseId,
        selectedTopicId || 't-new',
        fileName || 'Architecture_Fundamentals.pdf',
        rawTextSample || `Document for ${topicTitle}`
      );
      setActiveJob(newJob);
      setIsUploading(false);
    }, 1800);
  };

  const handlePublishJob = () => {
    if (!activeJob) return;
    dataService.approveAndPublishAIJob(activeJob.id, 'Dr. Evelyn Reed (Admin)');
    setPublishSuccess(true);
    setActiveJob({
      ...activeJob,
      status: 'published'
    });
    setTimeout(() => setPublishSuccess(false), 4000);
  };

  const handleRejectJob = () => {
    if (!activeJob) return;
    dataService.rejectAIJob(activeJob.id);
    setActiveJob({
      ...activeJob,
      status: 'rejected'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#397BFF]" />
              AI Studio & Curriculum Grounding
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">Gemini 2.0 Flash Verified</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
            AI-Powered Learning Content Generator
          </h1>
          <p className="text-sm text-[#9BAAC2]">
            Upload curriculum PDFs or lecture documents to automatically generate source-grounded summaries, flashcards, MCQs, and interview questions with human-in-the-loop validation.
          </p>
        </div>

        {activeJob && activeJob.status !== 'published' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRejectJob}
              disabled={activeJob.status === 'rejected'}
              className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium text-sm flex items-center gap-2 transition"
            >
              <XCircle className="w-4 h-4" /> Reject Draft
            </button>
            <button
              onClick={handlePublishJob}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#397BFF] to-[#77B4FF] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(57,123,255,0.4)] transition"
            >
              <CheckCircle className="w-4 h-4" /> Approve & Publish to Students
            </button>
          </div>
        )}
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Content Successfully Published!</p>
              <p className="text-xs text-emerald-400/80">Flashcards and Quiz assessments are now live for all enrolled students in this course.</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">Live in Course Feed</span>
        </div>
      )}

      {/* Grid: Left config / Right Review Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Extraction & Trigger */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#15233A] rounded-2xl border border-white/5 p-5 shadow-lg">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#397BFF]" /> 1. Target Course & Topic
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedTopicId('');
                  }}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Select Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                >
                  <option value="">-- Choose Module Topic --</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                  ))}
                </select>
              </div>

              {/* File Upload Box */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Source Learning Document (PDF, PPTX, TXT)
                </label>
                <div className="relative border-2 border-dashed border-white/15 hover:border-[#397BFF]/60 rounded-xl p-5 text-center transition bg-[#101A2D]/50 group">
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.txt,.docx"
                    onChange={handleSimulateUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 text-[#77B4FF] group-hover:scale-110 transition mb-2" />
                    <p className="text-sm font-medium text-[#F0F5FF]">
                      {fileName || 'Drop syllabus notes or click to upload'}
                    </p>
                    <p className="text-xs text-[#9BAAC2] mt-1">
                      {fileSize ? `Size: ${fileSize}` : 'PDF, PPTX up to 35 MB'}
                    </p>
                  </div>
                </div>
              </div>

              {rawTextSample && (
                <div className="p-3 bg-[#080E1C] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between text-xs text-[#9BAAC2] mb-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounding Text Extracted
                    </span>
                    <span>1,840 tokens</span>
                  </div>
                  <p className="text-[11px] text-[#9BAAC2] font-mono line-clamp-3 leading-relaxed">
                    {rawTextSample}
                  </p>
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={handleTriggerAIGeneration}
                disabled={isUploading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                  isUploading
                    ? 'bg-[#397BFF]/50 text-white cursor-wait'
                    : 'bg-[#397BFF] hover:bg-[#397BFF]/90 text-white shadow-[0_0_20px_rgba(57,123,255,0.3)]'
                }`}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing Curriculum Concepts...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Structured Materials
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generation Guardrails Info */}
          <div className="p-4 rounded-xl bg-[#101A2D] border border-white/5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#77B4FF]">
              <ShieldCheck className="w-4 h-4" /> Zero-Hallucination Grounding Rule
            </div>
            <p className="text-xs text-[#9BAAC2] leading-relaxed">
              SkillNova strictly requires all generated definitions, flashcards, and quizzes to cite exact document page references or section headings. Nothing is fabricated.
            </p>
          </div>
        </div>

        {/* Right Column: 5-Tab Human-in-the-Loop Review Studio */}
        <div className="lg:col-span-8">
          {activeJob ? (
            <div className="bg-[#15233A] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex flex-col min-h-[640px]">
              {/* Studio Header */}
              <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#101A2D]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#77B4FF]">{activeJob.document_name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      activeJob.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activeJob.status === 'rejected'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {activeJob.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#F0F5FF]">Curriculum Review & Approval Studio</h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-[#080E1C] p-1 rounded-xl border border-white/10 overflow-x-auto text-xs font-medium">
                  <button
                    onClick={() => setReviewTab('summary')}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                      reviewTab === 'summary' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setReviewTab('flashcards')}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                      reviewTab === 'flashcards' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Flashcards ({activeJob.flashcards?.length || 0})
                  </button>
                  <button
                    onClick={() => setReviewTab('quizzes')}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                      reviewTab === 'quizzes' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Quizzes ({activeJob.quiz_questions?.length || 0})
                  </button>
                  <button
                    onClick={() => setReviewTab('interview')}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                      reviewTab === 'interview' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Interview ({activeJob.interview_questions?.length || 0})
                  </button>
                  <button
                    onClick={() => setReviewTab('concepts')}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                      reviewTab === 'concepts' ? 'bg-[#397BFF] text-white' : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
                    }`}
                  >
                    Concepts
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 overflow-y-auto max-h-[680px]">
                {/* 1. Summary */}
                {reviewTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <h4 className="text-sm font-bold text-[#F0F5FF]">Extracted High-Level Synthesis</h4>
                      <span className="text-xs text-[#9BAAC2] font-mono">Status: Ready for Human Approval</span>
                    </div>
                    <div className="p-5 rounded-xl bg-[#101A2D] border border-white/5 space-y-4">
                      <p className="text-sm text-[#F0F5FF] leading-relaxed">
                        {activeJob.summary || 'No summary available for this job.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Flashcards */}
                {reviewTab === 'flashcards' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h4 className="text-sm font-bold text-[#F0F5FF]">Generated Practice Flashcards</h4>
                      <span className="text-xs text-[#9BAAC2]">Click cards to view back and citation</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeJob.flashcards?.map((card, idx) => (
                        <div key={card.id || idx} className="p-4 rounded-xl bg-[#101A2D] border border-white/5 hover:border-[#397BFF]/40 transition space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#397BFF]/15 text-[#77B4FF]">
                              Card #{idx + 1}
                            </span>
                            <span className="text-[10px] text-[#9BAAC2] font-mono">
                              {card.source_ref || 'Section 1.2'}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-[#F0F5FF]">{card.question}</p>
                            <p className="text-xs text-[#9BAAC2] bg-[#080E1C] p-2.5 rounded-lg border border-white/5">
                              {card.answer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Quizzes */}
                {reviewTab === 'quizzes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h4 className="text-sm font-bold text-[#F0F5FF]">Multiple-Choice Quiz Bank</h4>
                      <span className="text-xs text-[#9BAAC2]">Includes explanation & citation</span>
                    </div>
                    <div className="space-y-4">
                      {activeJob.quiz_questions?.map((quiz, idx) => (
                        <div key={quiz.id || idx} className="p-4 rounded-xl bg-[#101A2D] border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#F0F5FF]">Question {idx + 1}: {quiz.question}</span>
                            <span className="text-[11px] font-mono text-[#77B4FF] bg-[#397BFF]/15 px-2 py-0.5 rounded">
                              {quiz.source_ref || 'Page 4'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {quiz.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                                  optIdx === quiz.correct_index
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                    : 'bg-[#080E1C] border-white/5 text-[#9BAAC2]'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + optIdx)}. {typeof opt === 'string' ? opt : opt.text}</span>
                                {optIdx === quiz.correct_index && (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[#9BAAC2] bg-[#080E1C] p-2.5 rounded-lg border border-white/5">
                            <span className="font-semibold text-[#77B4FF]">Explanation: </span>
                            {quiz.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Interview Questions */}
                {reviewTab === 'interview' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h4 className="text-sm font-bold text-[#F0F5FF]">Technical Interview Question Bank</h4>
                      <span className="text-xs text-[#9BAAC2]">Evaluated with rubric and citations</span>
                    </div>
                    <div className="space-y-4">
                      {activeJob.interview_questions?.map((item, idx) => (
                        <div key={item.id || idx} className="p-4 rounded-xl bg-[#101A2D] border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[#F0F5FF]">Q{idx + 1}: {item.question}</h5>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF]">
                              {item.role_category}
                            </span>
                          </div>
                          <div className="bg-[#080E1C] p-3 rounded-lg border border-white/5 space-y-1.5">
                            <span className="text-[11px] font-bold text-[#77B4FF] uppercase tracking-wider">Model Industry Response</span>
                            <p className="text-xs text-[#9BAAC2] leading-relaxed">{item.model_answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Concepts */}
                {reviewTab === 'concepts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h4 className="text-sm font-bold text-[#F0F5FF]">Grounded Definitions & Concept Matrix</h4>
                      <span className="text-xs text-[#9BAAC2]">Extracted from {activeJob.document_name}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeJob.important_concepts?.map((concept, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#101A2D] border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[#77B4FF]">{concept.term}</h5>
                            <span className="text-[10px] text-[#9BAAC2] font-mono">{concept.source_page}</span>
                          </div>
                          <p className="text-xs text-[#9BAAC2] leading-relaxed">{concept.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#15233A] rounded-2xl border border-white/5 p-12 text-center text-[#9BAAC2] flex flex-col items-center justify-center min-h-[500px]">
              <Sparkles className="w-12 h-12 text-[#397BFF]/40 mb-4" />
              <h3 className="text-base font-bold text-[#F0F5FF] mb-1">No AI Generation Job Active</h3>
              <p className="text-xs max-w-sm">Select a course and upload a learning document on the left to trigger the zero-hallucination Gemini processing pipeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
