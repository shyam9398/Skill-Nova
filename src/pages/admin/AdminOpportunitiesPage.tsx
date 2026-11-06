import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Trophy,
  Plus,
  MapPin,
  Calendar,
  ExternalLink,
  Trash2,
  CheckCircle,
  Tag,
  Search,
  Filter,
  DollarSign,
  Edit3,
  Eye,
  AlertCircle,
  X
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Opportunity } from '../../types';

export const AdminOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => dataService.getOpportunities());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Keyboard Escape & Scroll Lock when modals are open
  useEffect(() => {
    const isAnyModalOpen = showAddModal || showEditModal || showViewModal || showDeleteModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setShowDeleteModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddModal, showEditModal, showViewModal, showDeleteModal]);

  useEffect(() => {
    void dataService.syncOpportunitiesFromSupabase();
    const unsub = dataService.subscribe(() => {
      setOpportunities(dataService.getOpportunities());
    });
    return unsub;
  }, []);

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
    const oppType = opp.type || opp.category || 'internship';
    const matchesType = filterType === 'all' || oppType === filterType;
    const companyName = opp.organization || opp.company || '';
    const skills = opp.required_skills || opp.requiredSkills || [];
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

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
    setSelectedOpp(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setTitle(opp.title || '');
    setCompany(opp.organization || opp.company || '');
    setType((opp.category || opp.type || 'internship') as any);
    setLocation(opp.location || 'Remote');
    setStipendOrPrize(opp.stipend || opp.stipendOrPrize || '');
    setDeadline(opp.deadline ? opp.deadline.split('T')[0] : '2026-12-31');
    setDescription(opp.description || '');
    const skillsArr = opp.required_skills || opp.requiredSkills || [];
    setRequiredSkills(Array.isArray(skillsArr) ? skillsArr.join(', ') : '');
    setApplyUrl(opp.apply_url || opp.applyUrl || '');
    setShowEditModal(true);
  };

  const openViewModal = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setShowViewModal(true);
  };

  const openDeleteModal = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setShowDeleteModal(true);
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    setIsSubmitting(true);
    try {
      const skillsArray = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      await dataService.publishOpportunity({
        title: title.trim(),
        company: company.trim(),
        type,
        location: location.trim(),
        stipendOrPrize: stipendOrPrize.trim(),
        deadline,
        description: description.trim(),
        requiredSkills: skillsArray,
        applyUrl: applyUrl.trim()
      });

      setShowAddModal(false);
      resetForm();
      setNotification({ type: 'success', message: `Opportunity "${title}" published successfully to Supabase!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save opportunity to Supabase.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !title.trim() || !company.trim()) return;

    setIsSubmitting(true);
    try {
      const skillsArray = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      await dataService.updateOpportunity(selectedOpp.id, {
        title: title.trim(),
        organization: company.trim(),
        company: company.trim(),
        category: type,
        type,
        location: location.trim(),
        stipend: stipendOrPrize.trim(),
        stipendOrPrize: stipendOrPrize.trim(),
        deadline,
        description: description.trim(),
        required_skills: skillsArray,
        requiredSkills: skillsArray,
        apply_url: applyUrl.trim(),
        applyUrl: applyUrl.trim()
      });

      setShowEditModal(false);
      resetForm();
      setNotification({ type: 'success', message: `Opportunity "${title}" updated successfully in Supabase!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update opportunity.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOpp) return;
    setIsSubmitting(true);
    try {
      await dataService.deleteOpportunity(selectedOpp.id);
      setShowDeleteModal(false);
      const name = selectedOpp.title;
      setSelectedOpp(null);
      setNotification({ type: 'success', message: `Opportunity "${name}" removed from Supabase.` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete opportunity.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Action Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg animate-fadeIn ${notification.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5 font-mono">
              <Briefcase className="w-3.5 h-3.5 text-[#397BFF]" />
              CAREER ACCELERATION ENGINE
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">Total Openings: {opportunities.length}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
            Internships, Jobs & Hackathons
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAAC2] mt-0.5">
            Full administrative CRUD for vetted opportunities, hiring sprints, and hackathons.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition hover:scale-102"
        >
          <Plus className="w-4 h-4" /> + Publish Opportunity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'internship', 'job', 'hackathon'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${filterType === filter
                  ? 'bg-[#397BFF] text-white shadow-md'
                  : 'bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF]'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-[#101A2D] border border-white/10 rounded-3xl p-12 text-center text-[#9BAAC2] space-y-3">
          <Briefcase className="w-10 h-10 text-[#397BFF] mx-auto opacity-60" />
          <h4 className="text-base font-bold text-[#F0F5FF]">No Opportunities Found</h4>
          <p className="text-xs">Adjust search parameters or click "+ Publish Opportunity" to add a new opening.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const oppType = opp.category || opp.type || 'internship';
            const companyName = opp.organization || opp.company || 'Enterprise Partner';
            const stipendValue = opp.stipend || opp.stipendOrPrize;

            return (
              <div
                key={opp.id}
                className="bg-[#101A2D] rounded-3xl border border-[#1F2E47] p-6 space-y-4 hover:border-[#397BFF]/40 transition group flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${oppType === 'hackathon'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : oppType === 'job'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                      {oppType}
                    </span>
                    <span className="text-[11px] font-mono text-[#9BAAC2] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#397BFF]" /> Due: {opp.deadline || 'Rolling'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#F0F5FF] group-hover:text-[#77B4FF] transition line-clamp-1">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-[#9BAAC2] font-medium mt-0.5">
                      {companyName} • <span className="text-[#F0F5FF]">{opp.location || 'Remote'}</span>
                    </p>
                  </div>

                  {stipendValue && (
                    <div className="p-2.5 rounded-xl bg-[#15233A] border border-white/5 text-xs text-[#77B4FF] font-semibold flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-[#397BFF]" />
                      {stipendValue}
                    </div>
                  )}

                  <p className="text-xs text-[#9BAAC2] line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(opp.required_skills || opp.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#15233A] text-[10px] text-[#9BAAC2] font-mono border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions: View, Edit, Delete */}
                <div className="pt-3 border-t border-[#1F2E47] flex items-center justify-between gap-2">
                  <button
                    onClick={() => openViewModal(opp)}
                    className="px-3 py-1.5 rounded-lg bg-[#15233A] hover:bg-[#1F2E47] text-[#00D4B8] text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(opp)}
                      className="p-1.5 rounded-lg bg-[#15233A] hover:bg-[#1F2E47] text-[#77B4FF] border border-[#1F2E47] transition"
                      title="Edit Opportunity"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(opp)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Delete Opportunity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative animate-scaleUp overflow-hidden">
            {/* Pinned / Fixed Header */}
            <div className="flex items-center justify-between border-b border-[#1F2E47] px-6 py-4 shrink-0 bg-[#0E1626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#397BFF]/20 text-[#397BFF] flex items-center justify-center border border-[#397BFF]/30 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#F0F5FF]">
                    {showAddModal ? 'Publish Career Opportunity' : 'Edit Opportunity'}
                  </h3>
                  <p className="text-[11px] text-[#9BAAC2]">Persists directly in Supabase</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-[#9BAAC2] hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={showAddModal ? handleCreateOpportunity : handleUpdateOpportunity} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#F0F5FF] block mb-1">
                  Opportunity Title <span className="text-[#397BFF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer AI Research & Engineering Fellow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#F0F5FF] block mb-1">
                    Company / Organization <span className="text-[#397BFF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, SkillNova Labs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#F0F5FF] block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Full-Time Job</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#F0F5FF] block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / Bengaluru"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#F0F5FF] block mb-1">Stipend / Prize</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 / month"
                    value={stipendOrPrize}
                    onChange={(e) => setStipendOrPrize(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#F0F5FF] block mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2 text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="font-bold text-[#F0F5FF] block mb-1">Role Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key responsibilities, team mission, and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl p-3 text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="font-bold text-[#F0F5FF] block mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Python, Docker"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2 text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="font-bold text-[#F0F5FF] block mb-1">Application Portal Link</label>
                <input
                  type="url"
                  placeholder="https://careers.company.com/apply"
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2 text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF]"
                />
              </div>

              {/* Pinned Footer */}
              <div className="shrink-0 pt-4 border-t border-[#1F2E47] flex items-center justify-end gap-3 sticky bottom-0 bg-[#101A2D] pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl font-semibold text-[#9BAAC2] bg-[#15233A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : showAddModal ? 'Publish' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedOpp && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1F2E47] px-6 py-4 shrink-0 bg-[#0E1626]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00D4B8]/20 text-[#00D4B8] flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedOpp.title}</h3>
                  <p className="text-xs text-[#9BAAC2]">{selectedOpp.organization || selectedOpp.company}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-[#9BAAC2] hover:text-white p-1 rounded-lg hover:bg-white/5 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#15233A] border border-white/5">
                  <span className="text-[10px] text-[#9BAAC2] uppercase font-bold block mb-1">Type</span>
                  <span className="font-bold text-white capitalize">{selectedOpp.category || selectedOpp.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#15233A] border border-white/5">
                  <span className="text-[10px] text-[#9BAAC2] uppercase font-bold block mb-1">Location</span>
                  <span className="text-white">{selectedOpp.location || 'Remote'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15233A] border border-white/5">
                <span className="text-[10px] text-[#9BAAC2] uppercase font-bold block mb-1">Compensation / Prize</span>
                <span className="font-mono text-[#77B4FF] font-bold">{selectedOpp.stipend || selectedOpp.stipendOrPrize || 'Unpaid / Certificate'}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#9BAAC2] uppercase font-bold block mb-1">Description</span>
                <p className="text-slate-300 leading-relaxed bg-[#15233A] p-3 rounded-xl border border-white/5">
                  {selectedOpp.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#9BAAC2] uppercase font-bold block mb-1">Required Skills</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedOpp.required_skills || selectedOpp.requiredSkills || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#15233A] text-slate-300 text-[10px] font-mono border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t border-[#1F2E47] shrink-0 bg-[#0E1626]">
              <a
                href={selectedOpp.apply_url || selectedOpp.applyUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#77B4FF] hover:underline flex items-center gap-1 font-mono"
              >
                Open Application Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] text-xs font-bold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-scaleUp space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F0F5FF]">Delete Opportunity</h3>
                <p className="text-[11px] text-rose-400">Irreversible removal</p>
              </div>
            </div>

            <p className="text-xs text-[#9BAAC2] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{selectedOpp.title}"</strong> ({selectedOpp.organization || selectedOpp.company})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9BAAC2] bg-[#15233A] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunitiesPage;
