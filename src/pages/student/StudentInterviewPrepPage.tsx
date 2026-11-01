import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Search,
  Filter,
  Award,
  Layers
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { InterviewQuestion } from '../../types';

export const StudentInterviewPrepPage: React.FC = () => {
  const [questions] = useState<InterviewQuestion[]>(dataService.getInterviewQuestions());
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id || null);

  const filtered = questions.filter(q => {
    const diff = q.difficulty || 'medium';
    const matchesDiff = difficultyFilter === 'all' || diff === difficultyFilter;
    const answer = q.model_answer || q.sampleAnswer || '';
    const matchesSearch = 
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      answer.toLowerCase().includes(search.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#397BFF]" />
            Technical Interview Readiness
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">Curated Engineering Q&A</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
          Interview Question Practice
        </h1>
        <p className="text-sm text-[#9BAAC2]">
          Practice answering real-world architectural and fundamentals interview questions grounded in course lecture notes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#15233A] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search interview questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080E1C] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                difficultyFilter === diff
                  ? 'bg-[#397BFF] text-white shadow-md'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filtered.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          return (
            <div 
              key={item.id}
              className="bg-[#15233A] rounded-2xl border border-white/5 overflow-hidden transition shadow-md hover:border-[#397BFF]/30"
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-5 flex items-start justify-between text-left gap-4 hover:bg-[#101A2D]/50 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#397BFF]/15 text-[#77B4FF] text-xs font-bold flex items-center justify-center font-mono flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#F0F5FF] leading-snug">
                      {item.question}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        (item.difficulty || 'medium') === 'hard'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                          : (item.difficulty || 'medium') === 'medium'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      }`}>
                        {item.difficulty || 'medium'}
                      </span>
                      <span className="text-[#9BAAC2] font-mono text-[11px]">
                        Citation: {item.source_ref || item.sourceCitation || 'Course Lecture Notes'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#080E1C] text-[#9BAAC2] flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-[#101A2D] border-t border-white/5 space-y-4 animate-fadeIn">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#77B4FF] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#397BFF]" /> Model Industry Response
                    </h4>
                    <p className="text-xs sm:text-sm text-[#F0F5FF] leading-relaxed bg-[#080E1C] p-4 rounded-xl border border-white/5">
                      {item.model_answer || item.sampleAnswer}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#15233A] border border-white/5 flex items-center justify-between text-xs text-[#9BAAC2]">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#397BFF]" />
                      Grounded in syllabus document: {item.source_ref || item.sourceCitation || 'Course Lecture Notes'}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Mentor Verified
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
