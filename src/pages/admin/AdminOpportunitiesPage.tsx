import React, { useState } from 'react';
import { 
  Briefcase, 
  Trophy, 
  Plus, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  CheckCircle, 
  Tag, 
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Opportunity } from '../../types';

export const AdminOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(dataService.getOpportunities());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'internship' | 'job' | 'hackathon'>('internship');
  const [location, setLocation] = useState('Remote / Bengaluru');
  const [stipendOrPrize, setStipendOrPrize] = useState('₹45,000 / month');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Node.js');
  const [applyUrl, setApplyUrl] = useState('https://careers.example.com');

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesType = filterType === 'all' || opp.type === filterType;
    const companyName = opp.organization || opp.company || '';
    const skills = opp.required_skills || opp.requiredSkills || [];
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) return;

    const newOpp = dataService.publishOpportunity({
      title,
      company,
      type,
      location,
      stipendOrPrize,
      deadline,
      description,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      applyUrl
    });

    setOpportunities([newOpp, ...opportunities]);
    setShowModal(false);
    resetForm();

    setNotification(`Successfully published opportunity: "${title}" at ${company}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setType('internship');
    setLocation('Remote / Bengaluru');
    setStipendOrPrize('₹45,000 / month');
    setDeadline('2026-12-15');
    setDescription('');
    setRequiredSkills('React, TypeScript, Node.js');
    setApplyUrl('https://careers.example.com');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#397BFF]" />
              Career Acceleration Engine
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">Curated Student Openings</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
            Internships, Jobs & Hackathons
          </h1>
          <p className="text-sm text-[#9BAAC2]">
            Publish vetted opportunities, technical challenges, and hiring sprints directly to student dashboards.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#77B4FF] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(57,123,255,0.4)] transition"
        >
          <Plus className="w-4 h-4" /> Publish Opportunity
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#15233A] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search role, company or skill (e.g. PyTorch)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080E1C] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'internship', 'job', 'hackathon'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                filterType === t
                  ? 'bg-[#397BFF] text-white shadow-md'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              {t === 'all' ? 'All Opportunities' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opp) => (
          <div 
            key={opp.id}
            className="bg-[#15233A] rounded-2xl border border-white/5 p-5 hover:border-[#397BFF]/40 transition group flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                  opp.type === 'internship'
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                    : opp.type === 'hackathon'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                }`}>
                  {opp.type}
                </span>
                <span className="text-xs text-[#9BAAC2] font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#397BFF]" /> Apply by {opp.deadline}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F0F5FF] group-hover:text-[#77B4FF] transition">
                  {opp.title}
                </h3>
                <p className="text-xs text-[#9BAAC2] font-medium mt-0.5">
                  {opp.company} • <span className="text-[#F0F5FF]">{opp.location}</span>
                </p>
              </div>

              {opp.stipendOrPrize && (
                <div className="p-2.5 rounded-lg bg-[#101A2D] border border-white/5 text-xs text-[#77B4FF] font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#397BFF]" />
                  {opp.stipendOrPrize}
                </div>
              )}

              <p className="text-xs text-[#9BAAC2] line-clamp-3 leading-relaxed">
                {opp.description}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(opp.required_skills || opp.requiredSkills || []).map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#080E1C] text-[10px] text-[#9BAAC2] font-mono border border-white/5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-[#9BAAC2]">
                Posted: {opp.published_at || opp.postedDate || 'Today'}
              </span>
              <a
                href={opp.apply_url || opp.applyUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#397BFF]/15 hover:bg-[#397BFF]/25 text-[#77B4FF] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                Apply Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Publish Opportunity */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15233A] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#F0F5FF] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#397BFF]" />
                Publish Opportunity
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#9BAAC2] hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Software Engineering Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Microsoft, Startup"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Full-time Job</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                    Location / Work Mode
                  </label>
                  <input
                    type="text"
                    placeholder="Remote / Bengaluru"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                    Stipend / Prize Pool
                  </label>
                  <input
                    type="text"
                    placeholder="₹45,000 / mo or $10,000"
                    value={stipendOrPrize}
                    onChange={(e) => setStipendOrPrize(e.target.value)}
                    className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Python, PyTorch, React, Docker"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Application URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Role Description & Eligibility
                </label>
                <textarea
                  rows={3}
                  placeholder="Eligibility criteria, interview rounds, work overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#9BAAC2] hover:text-[#F0F5FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#77B4FF] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(57,123,255,0.4)] transition"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
