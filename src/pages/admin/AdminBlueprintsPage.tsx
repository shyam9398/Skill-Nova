import React, { useState } from 'react';
import { 
  Compass, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Layers, 
  Code, 
  Terminal, 
  BookOpen, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { CareerBlueprint } from '../../types';

export const AdminBlueprintsPage: React.FC = () => {
  const [blueprints, setBlueprints] = useState<CareerBlueprint[]>(dataService.getCareerBlueprints());
  const [selectedRole, setSelectedRole] = useState<CareerBlueprint>(blueprints[0]);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [roleTitle, setRoleTitle] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [summary, setSummary] = useState('');
  const [mandatorySkills, setMandatorySkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [projectIdeas, setProjectIdeas] = useState('');

  const handleSaveBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle) return;

    const newBlueprint: CareerBlueprint = {
      id: `bp-${Date.now()}`,
      role_name: roleTitle,
      roleTitle,
      slug: roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      overview: summary,
      summary,
      mandatory_skills: mandatorySkills.split(',').map(s => s.trim()).filter(Boolean),
      mandatorySkills: mandatorySkills.split(',').map(s => s.trim()).filter(Boolean),
      preferred_skills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      recommended_languages: ['TypeScript', 'Python', 'Go'],
      core_cs: ['Operating Systems', 'System Design', 'Algorithms', 'Computer Networks'],
      frameworks_tools: ['Docker', 'PostgreSQL', 'Git'],
      recommended_projects: projectIdeas.split('\n').filter(Boolean).map(p => ({
        title: p,
        description: 'End-to-end production deployment with tests',
        tech_stack: ['Full Stack'],
        portfolio_highlight: 'Quantifiable latency/throughput metrics'
      })),
      projectIdeas: projectIdeas.split('\n').filter(Boolean),
      github_portfolio_advice: ['Include CI/CD badges and architecture diagrams'],
      resume_structure: [
        { section: 'Summary', description: 'Impact-focused profile', dos: ['Quantify metrics'], donts: ['Vague claims'] }
      ],
      resumeStructure: [
        'Contact Info & Verified GitHub / Portfolio',
        'Technical Skills (categorized by Languages, Frameworks, Cloud)',
        'Production Projects with quantifiable metrics (e.g. latency reduced by 30%)',
        'Internships / Work Experience',
        'Education & Relevant Coursework'
      ],
      common_mistakes: [
        'Listing tutorial clones like Todo app without architectural depth',
        'Over-claiming AI/ML experience without showing evaluation metrics'
      ],
      commonMistakes: [
        'Listing tutorial clones like Todo app without architectural depth',
        'Over-claiming AI/ML experience without showing evaluation metrics'
      ],
      frequently_asked_interview_topics: [
        'Time & Space Complexity analysis',
        'Concurrency & Deadlock prevention',
        'Database indexing and query execution plans'
      ],
      sample_resume_outline: 'Header: Name, Contact, GitHub, LinkedIn\nTechnical Summary: 3-line elevator pitch with key tech stack\nWork Experience / Internships with quantifiable achievements\nFlagship Production Projects with Live URLs\nEducation & Relevant CS Coursework'
    };

    const updated = [newBlueprint, ...blueprints];
    setBlueprints(updated);
    setSelectedRole(newBlueprint);
    setShowModal(false);
    setNotification(`Successfully updated Career Blueprint for "${roleTitle}"`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#397BFF]" />
              Career Blueprint Curriculum
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">Role-Specific Resume Requirements</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
            Career Blueprint Guidelines
          </h1>
          <p className="text-sm text-[#9BAAC2]">
            Define exact industry expectations for 12+ professional tech tracks—distinguishing mandatory vs. preferred skills and vetted project architectures.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#77B4FF] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(57,123,255,0.4)] transition"
        >
          <Plus className="w-4 h-4" /> Add Career Track
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Main Grid: Track List & Deep Dive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Track Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9BAAC2] px-1">
            Active Career Tracks ({blueprints.length})
          </h3>
          <div className="space-y-2">
            {blueprints.map((bp) => {
              const isSelected = selectedRole?.id === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => setSelectedRole(bp)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#397BFF]/15 border-[#397BFF] text-[#F0F5FF] shadow-[0_0_15px_rgba(57,123,255,0.2)]'
                      : 'bg-[#15233A] border-white/5 text-[#9BAAC2] hover:bg-[#101A2D] hover:text-[#F0F5FF]'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#F0F5FF]">{bp.roleTitle || bp.role_name}</h4>
                    <p className="text-xs text-[#9BAAC2]">{bp.category}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080E1C] border border-white/5 text-[#77B4FF]">
                    {(bp.mandatorySkills || bp.mandatory_skills || []).length} Core Skills
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Blueprint Details Preview */}
        <div className="lg:col-span-8">
          {selectedRole && (
            <div className="bg-[#15233A] rounded-2xl border border-white/5 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                <div>
                  <span className="text-xs font-semibold text-[#77B4FF] uppercase tracking-wider font-mono">
                    {selectedRole.category}
                  </span>
                  <h2 className="text-xl font-extrabold text-[#F0F5FF]">
                    {selectedRole.roleTitle || selectedRole.role_name} Specification
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold">
                  Visible to All Students
                </span>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9BAAC2] mb-1.5">
                  Role Intent & Industry Scope
                </h4>
                <p className="text-sm text-[#F0F5FF] leading-relaxed bg-[#101A2D] p-4 rounded-xl border border-white/5">
                  {selectedRole.summary || selectedRole.overview}
                </p>
              </div>

              {/* Skills Split: Mandatory vs Preferred */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#080E1C] border border-red-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                    <AlertCircle className="w-4 h-4" /> Non-Negotiable Mandatory Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedRole.mandatorySkills || selectedRole.mandatory_skills || []).map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-300 text-xs font-medium border border-red-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#080E1C] border border-blue-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#77B4FF]">
                    <CheckCircle className="w-4 h-4" /> Preferred & Differentiating Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedRole.preferredSkills || selectedRole.preferred_skills || []).map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-[#397BFF]/10 text-[#77B4FF] text-xs font-medium border border-[#397BFF]/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Projects */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9BAAC2] flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#397BFF]" /> Recommended Portfolio Projects
                </h4>
                <div className="space-y-2">
                  {(selectedRole.projectIdeas || selectedRole.recommended_projects || []).map((project: any, idx: number) => {
                    const text = typeof project === 'string' ? project : project.title;
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-[#101A2D] border border-white/5 text-xs text-[#F0F5FF] flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#397BFF]/20 text-[#77B4FF] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resume Outline & Common Pitfalls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#101A2D] border border-white/5 space-y-2">
                  <h5 className="text-xs font-bold text-[#77B4FF] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#397BFF]" /> Optimal Resume Structure
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#9BAAC2]">
                    {(Array.isArray(selectedRole.resumeStructure) ? selectedRole.resumeStructure : selectedRole.resume_structure || []).map((line: any, idx: number) => {
                      const text = typeof line === 'string' ? line : `${line.section}: ${line.description}`;
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#397BFF] mt-1.5 flex-shrink-0" />
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#101A2D] border border-white/5 space-y-2">
                  <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Common Mistakes to Avoid
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#9BAAC2]">
                    {(selectedRole.commonMistakes || selectedRole.common_mistakes || []).map((line: any, idx: number) => {
                      const text = typeof line === 'string' ? line : String(line);
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Career Track */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15233A] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#F0F5FF] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#397BFF]" />
                Add Career Track Blueprint
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#9BAAC2] hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveBlueprint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRE / DevOps Engineer"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Role Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Focus on high availability, distributed tracing, and infrastructure as code..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Mandatory Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Linux, Docker, Kubernetes, Terraform, Bash"
                  value={mandatorySkills}
                  onChange={(e) => setMandatorySkills(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Preferred Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Prometheus, Grafana, ArgoCD, eBPF"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Recommended Project Ideas (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Multi-cluster Kubernetes setup with automated canary releases via Argo Rollouts"
                  value={projectIdeas}
                  onChange={(e) => setProjectIdeas(e.target.value)}
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
                  Publish Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
