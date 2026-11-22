import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Plus, Search, Edit3, Trash2, Eye, EyeOff,
  ExternalLink, Upload, CheckCircle2, AlertCircle, X,
  Globe, Tag, Layers, RefreshCw, ArrowUpRight, FolderGit2
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import type { Project, ProjectCategory, ProjectStatus } from '../../types';

const CATEGORIES: ProjectCategory[] = [
  'AI/ML',
  'Web Development',
  'App Development',
  'IoT',
  'Cybersecurity',
  'Cloud Computing',
  'Other'
];

export const ProjectShowcaseManagementCard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(dataService.getProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('AI/ML');
  const [status, setStatus] = useState<ProjectStatus>('published');

  // Image upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void dataService.syncProjectsFromSupabase();
    const update = () => {
      setProjects(dataService.getProjects());
    };
    return dataService.subscribe(update);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setProjectUrl('');
    setCategory('AI/ML');
    setStatus('published');
    setImagePreview('');
    setEditingProjectId(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setImageUrl(project.image_url);
    setImagePreview(project.image_url);
    setProjectUrl(project.project_url || '');
    setCategory(project.category || 'Other');
    setStatus(project.status);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit.', 'error');
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await storageService.uploadProjectImage(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
        setImagePreview(res.url);
        showToast('Project image uploaded successfully!');
      } else {
        showToast(res.error || 'Failed to upload image.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading image.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Project Title is required.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Project Description is required.', 'error');
      return;
    }

    if (!imageUrl.trim()) {
      showToast('Project Image is required. Please upload an image or provide an image URL.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProjectId) {
        // Update existing project
        await dataService.updateProject(editingProjectId, {
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          project_url: projectUrl.trim() ? projectUrl.trim() : null,
          category,
          status,
        });
        showToast(`Project "${title.trim()}" updated successfully!`);
      } else {
        // Create new project
        await dataService.createProject({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          project_url: projectUrl.trim() ? projectUrl.trim() : null,
          category,
          status,
        });
        showToast(`Project "${title.trim()}" created and ${status === 'published' ? 'published' : 'saved as draft'}!`);
      }
      resetForm();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save project.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      const updated = await dataService.toggleProjectPublishStatus(project.id);
      if (updated) {
        showToast(
          updated.status === 'published'
            ? `Project "${project.title}" published to public landing page!`
            : `Project "${project.title}" switched to draft (hidden from public).`
        );
      }
    } catch (err: any) {
      showToast('Failed to toggle publication status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await dataService.deleteProject(projectToDelete.id);
      showToast(`Project "${projectToDelete.title}" deleted successfully.`);
      if (editingProjectId === projectToDelete.id) {
        resetForm();
      }
    } catch (err: any) {
      showToast('Failed to delete project.', 'error');
    } finally {
      setProjectToDelete(null);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const publishedCount = projects.filter((p) => p.status === 'published').length;
  const draftCount = projects.filter((p) => p.status === 'draft').length;

  return (
    <div className="bg-white dark:bg-[#0D1833] rounded-3xl border border-[#DFE9F6] dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-8 relative overflow-hidden transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 backdrop-blur-md'
              : 'bg-red-950/90 border border-red-500/40 text-red-200 backdrop-blur-md'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 transition"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DFE9F6] dark:border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176BFF]/10 dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] text-xs font-mono font-bold border border-[#00A3FF]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOMEPAGE SHOWCASE CURATION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#15243B] dark:text-[#F4F7FF]">
            Project Showcase Management
          </h2>
          <p className="text-xs sm:text-sm text-[#73839B] dark:text-[#9BAAC5] max-w-2xl">
            Upload student and institutional capstones, configure external demo/GitHub links, and manage real-time publishing to the public SkillNova landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isFormOpen ? resetForm : handleOpenAdd}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
              isFormOpen
                ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-300'
                : 'bg-[#176BFF] hover:bg-[#1258d4] text-white shadow-[#176BFF]/25'
            }`}
          >
            {isFormOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel / Close</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>+ Add New Project</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F5F9FF] dark:bg-[#070D1E] p-3.5 rounded-2xl border border-[#DFE9F6] dark:border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#73839B] dark:text-[#9BAAC5]">Total Projects</span>
          <span className="text-base font-black text-[#15243B] dark:text-white font-mono">{projects.length}</span>
        </div>
        <div className="bg-[#F5F9FF] dark:bg-[#070D1E] p-3.5 rounded-2xl border border-[#DFE9F6] dark:border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Published</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{publishedCount}</span>
        </div>
        <div className="bg-[#F5F9FF] dark:bg-[#070D1E] p-3.5 rounded-2xl border border-[#DFE9F6] dark:border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Drafts</span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{draftCount}</span>
        </div>
        <div className="bg-[#F5F9FF] dark:bg-[#070D1E] p-3.5 rounded-2xl border border-[#DFE9F6] dark:border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#176BFF] dark:text-[#00E5FF]">Landing Section</span>
          <span className="text-xs font-mono font-bold text-[#176BFF] dark:text-[#00E5FF]">Active</span>
        </div>
      </div>

      {/* Add / Edit Project Form */}
      {isFormOpen && (
        <div
          ref={formRef}
          className="rounded-3xl bg-slate-50 dark:bg-[#070D1E] border-2 border-[#176BFF]/40 dark:border-[#00A8FF]/40 p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE9F6] dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#176BFF]/15 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center font-bold">
                {editingProjectId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#15243B] dark:text-white">
                {editingProjectId ? 'Edit Project Showcase' : 'Add New Project'}
              </h3>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              title="Close Form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#15243B] dark:text-slate-200 flex items-center gap-1">
                  <span>Project Title</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Drone Navigation with Computer Vision"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-xs font-medium text-[#15243B] dark:text-white focus:outline-hidden focus:border-[#176BFF] transition"
                />
              </div>

              {/* Project Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#15243B] dark:text-slate-200">
                  Project Category
                </label>
                <select
                  value={category || 'Other'}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-xs font-medium text-[#15243B] dark:text-white focus:outline-hidden focus:border-[#176BFF] transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Image Upload & Replacement */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#15243B] dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Project Image</span>
                  <span className="text-red-500">*</span>
                </span>
                {editingProjectId && (
                  <span className="text-[11px] font-normal text-[#176BFF] dark:text-[#00E5FF]">
                    Image replacement supported
                  </span>
                )}
              </label>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Upload Action Card */}
                <div className="md:col-span-7 space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isUploadingImage
                        ? 'border-[#176BFF] bg-[#176BFF]/5'
                        : 'border-[#DFE9F6] dark:border-white/15 hover:border-[#176BFF] dark:hover:border-[#00D9FF] bg-white dark:bg-[#0D1833]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] dark:bg-[#00A8FF]/15 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center">
                        {isUploadingImage ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#15243B] dark:text-white">
                          {isUploadingImage
                            ? 'Uploading image to Supabase Storage...'
                            : editingProjectId
                            ? 'Click to Replace Project Image'
                            : 'Click to Upload Project Image'}
                        </p>
                        <p className="text-[11px] text-[#73839B] dark:text-[#9BAAC5] mt-0.5">
                          Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Or Direct Image URL input */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#73839B] dark:text-[#9BAAC5] uppercase tracking-wider">
                      Or Paste Image Public URL:
                    </span>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/... or Supabase storage public URL"
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-xs font-mono text-[#15243B] dark:text-white focus:outline-hidden focus:border-[#176BFF] transition"
                    />
                  </div>
                </div>

                {/* Live Image Preview Card */}
                <div className="md:col-span-5">
                  <div className="border border-[#DFE9F6] dark:border-white/10 rounded-2xl p-3 bg-white dark:bg-[#0D1833] space-y-2">
                    <span className="text-[10px] font-mono font-bold text-[#73839B] dark:text-[#9BAAC5] uppercase tracking-wider block">
                      Preview Aspect Ratio (16:9)
                    </span>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Project Preview"
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview('')}
                        />
                      ) : (
                        <div className="text-center p-4 text-[#73839B] dark:text-[#9BAAC5]">
                          <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px] font-mono">No Image Uploaded Yet</span>
                        </div>
                      )}
                      {category && (
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 backdrop-blur-md text-[#00E5FF] border border-[#00E5FF]/30">
                          {category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#15243B] dark:text-slate-200 flex items-center gap-1">
                <span>Project Description</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A detailed explanation of the project, including its objectives, tech stack, architecture, student innovation, and real-world results..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-xs font-medium text-[#15243B] dark:text-white focus:outline-hidden focus:border-[#176BFF] transition leading-relaxed"
              />
            </div>

            {/* Project Link & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#15243B] dark:text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#00E5FF]" />
                  <span>Project Link (Optional)</span>
                </label>
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://github.com/username/project or live demo URL"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-xs font-mono text-[#15243B] dark:text-white focus:outline-hidden focus:border-[#176BFF] transition"
                />
                <span className="text-[10px] text-[#73839B] dark:text-[#9BAAC5] block">
                  When added, visitors can click "Explore Project" to view the live demo or GitHub repository.
                </span>
              </div>

              {/* Publication Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#15243B] dark:text-slate-200">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      status === 'published'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'bg-white dark:bg-[#0D1833] border-[#DFE9F6] dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Published (Public)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      status === 'draft'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'bg-white dark:bg-[#0D1833] border-[#DFE9F6] dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Draft (Private)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions: Save & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFE9F6] dark:border-white/10">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 text-[#73839B] dark:text-[#9BAAC5] hover:text-[#15243B] dark:hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploadingImage}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#176BFF] hover:bg-[#1258d4] text-white shadow-md shadow-[#176BFF]/25 hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingProjectId ? 'Update Project' : 'Save Project'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Projects Management List & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-[#15243B] dark:text-white">
              Existing Projects ({filteredProjects.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#F5F9FF] dark:bg-[#070D1E] border border-[#DFE9F6] dark:border-white/10 text-xs text-[#15243B] dark:text-white focus:outline-hidden focus:border-[#176BFF]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-[#F5F9FF] dark:bg-[#070D1E] border border-[#DFE9F6] dark:border-white/10 text-xs font-bold text-[#15243B] dark:text-white focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="border border-dashed border-[#DFE9F6] dark:border-white/10 rounded-2xl p-12 text-center space-y-3 bg-[#F5F9FF]/50 dark:bg-[#070D1E]/50">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] dark:bg-[#00A8FF]/15 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#15243B] dark:text-white">
              {searchQuery || selectedCategory !== 'All'
                ? 'No matching projects found'
                : 'No projects added yet'}
            </h4>
            <p className="text-xs text-[#73839B] dark:text-[#9BAAC5] max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or category filter.'
                : 'Get started by creating your first student project showcase.'}
            </p>
            {!isFormOpen && (
              <button
                onClick={handleOpenAdd}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#176BFF] hover:bg-[#1258d4] text-white shadow-md shadow-[#176BFF]/25"
              >
                + Add First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isPub = project.status === 'published';

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-[#F5F9FF] dark:bg-[#070D1E] border border-[#DFE9F6] dark:border-white/10 hover:border-[#176BFF] dark:hover:border-[#00D9FF] p-4 flex flex-col justify-between space-y-4 transition-all duration-200 group shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Thumbnail with overlay badges */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600';
                        }}
                      />
                      {project.category && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-mono font-bold text-[#00E5FF] border border-[#00E5FF]/30">
                          {project.category}
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        {isPub ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/90 text-white shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/90 text-white shadow-xs">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-black text-[#15243B] dark:text-white line-clamp-1 group-hover:text-[#176BFF] dark:group-hover:text-[#00E5FF] transition">
                        {project.title}
                      </h4>
                      <p className="text-xs text-[#73839B] dark:text-[#9BAAC5] line-clamp-2 mt-1 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* External Link pill if available */}
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#176BFF] dark:text-[#00E5FF] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{project.project_url}</span>
                      </a>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-[#DFE9F6] dark:border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(project)}
                      title={isPub ? 'Unpublish (Switch to Draft)' : 'Publish to Landing Page'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isPub
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isPub ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isPub ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        title="Edit Project"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#176BFF] dark:hover:text-[#00E5FF] hover:bg-white dark:hover:bg-white/10 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-[#050816]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0D1833] rounded-3xl border border-[#DFE9F6] dark:border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#15243B] dark:text-white">
                Delete Project Showcase?
              </h3>
              <p className="text-xs text-[#73839B] dark:text-[#9BAAC5] leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{projectToDelete.title}"</strong>? This will permanently remove it from the platform and the public landing page.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFE9F6] dark:border-white/10">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-md shadow-red-600/25"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

