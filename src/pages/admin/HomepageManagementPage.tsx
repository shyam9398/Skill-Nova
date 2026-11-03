import React, { useState, useEffect } from 'react';
import {
  Globe, Video, MessageCircle, QrCode,
  Save, CheckCircle2, AlertCircle, Eye, RefreshCw, Upload,
  Plus, Trash2, Edit3, ExternalLink, Sparkles, BookOpen, Clock, Tag
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);
import { dataService } from '../../services/dataService';
import { LiveMeetingManagementCard } from '../../components/admin/LiveMeetingManagementCard';
import type { HomepageSettings, HomepageCourse } from '../../types';

export const HomepageManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meeting' | 'video' | 'courses' | 'whatsapp' | 'instagram' | 'linkedin' | 'preview'>('meeting');

  const [settings, setSettings] = useState<HomepageSettings>(dataService.getHomepageSettings());
  const [courses, setCourses] = useState<HomepageCourse[]>(dataService.getHomepageCourses());

  // Form states
  const [videoUrl, setVideoUrl] = useState(settings.demo_video_url);
  const [videoTitle, setVideoTitle] = useState(settings.demo_video_title);
  const [videoDesc, setVideoDesc] = useState(settings.demo_video_description);
  const [videoActive, setVideoActive] = useState(settings.demo_video_is_active);

  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsapp_group_url);
  const [whatsappQr, setWhatsappQr] = useState(settings.whatsapp_qr_code_url);
  const [whatsappName, setWhatsappName] = useState(settings.whatsapp_display_name);
  const [whatsappActive, setWhatsappActive] = useState(settings.whatsapp_is_active);

  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url);
  const [instagramName, setInstagramName] = useState(settings.instagram_display_name);
  const [instagramActive, setInstagramActive] = useState(settings.instagram_is_active);

  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedin_url);
  const [linkedinName, setLinkedinName] = useState(settings.linkedin_display_name);
  const [linkedinActive, setLinkedinActive] = useState(settings.linkedin_is_active);

  // New course modal state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseThumb, setNewCourseThumb] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600');
  const [newCourseFee, setNewCourseFee] = useState('₹4,999');
  const [newCourseTimeline, setNewCourseTimeline] = useState('8 Weeks Cohort');
  const [newCourseCurriculum, setNewCourseCurriculum] = useState(
`Module 1: Foundations & Architecture
- Key language concepts and setup
- Project scaffolding and best practices

Module 2: Advanced Topics & Hands-on Labs
- Production APIs and Database Integration
- Asynchronous workflows and state management

Module 3: Capstone Deployment
- Cloud hosting, Docker containerization
- Final project evaluation and certification`
  );
  const [newCourseWhatsapp, setNewCourseWhatsapp] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    void dataService.syncHomepageFromSupabase();
    void dataService.syncHomepageCoursesFromSupabase();
    const update = () => {
      const s = dataService.getHomepageSettings();
      setSettings(s);
      setCourses(dataService.getHomepageCourses());
    };
    return dataService.subscribe(update);
  }, []);

  const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Convert video URL to embed
  const getEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    const gDriveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      return `https://drive.google.com/file/d/${gDriveMatch[1]}/preview`;
    }
    return rawUrl;
  };

  const handleSaveAll = async () => {
    setIsPublishing(true);
    try {
      await dataService.saveHomepageSettings({
        demo_video_url: videoUrl,
        demo_video_title: videoTitle,
        demo_video_description: videoDesc,
        demo_video_is_active: videoActive,
        whatsapp_group_url: whatsappUrl,
        whatsapp_qr_code_url: whatsappQr,
        whatsapp_display_name: whatsappName,
        whatsapp_is_active: whatsappActive,
        instagram_url: instagramUrl,
        instagram_display_name: instagramName,
        instagram_is_active: instagramActive,
        linkedin_url: linkedinUrl,
        linkedin_display_name: linkedinName,
        linkedin_is_active: linkedinActive
      });

      showToastMsg('Homepage configuration published and saved to Supabase successfully!');
    } catch (e: any) {
      showToastMsg(e?.message || 'Failed to publish settings.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    await dataService.addHomepageCourse({
      title: newCourseTitle.trim(),
      description: newCourseDesc.trim(),
      thumbnail_url: newCourseThumb.trim(),
      fee: newCourseFee.trim(),
      timeline: newCourseTimeline.trim(),
      curriculum_text: newCourseCurriculum.trim(),
      whatsapp_enroll_url: newCourseWhatsapp.trim() || whatsappUrl,
      is_active: true
    });

    setShowAddCourse(false);
    setNewCourseTitle('');
    setNewCourseDesc('');
    showToastMsg('New course published to homepage and stored in Supabase!');
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this course from the homepage?')) {
      await dataService.deleteHomepageCourse(id);
      showToastMsg('Course removed from homepage.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-white border border-[#DFE9F6] p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 font-mono">
              PUBLIC PORTAL CONTROL
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Connected
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#15243B]">
            Homepage Management & Publishing
          </h1>
          <p className="text-xs md:text-sm text-[#73839B]">
            Configure demo videos, public courses with fee, WhatsApp QR invitations, and social community links. All changes persist to Supabase and reflect instantly to students.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF3FF] border border-[#DFE9F6] text-xs font-bold text-[#15243B] flex items-center gap-2 transition"
          >
            <Eye className="w-4 h-4 text-[#176BFF]" />
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#73839B]" />
          </a>

          <button
            onClick={handleSaveAll}
            disabled={isPublishing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-md shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102"
          >
            {isPublishing ? (
              <span>Saving to Supabase...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Updates</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#DFE9F6]">
        <button
          onClick={() => setActiveTab('meeting')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'meeting'
              ? 'bg-[#176BFF] text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <Video className="w-4 h-4 text-red-400" />
          <span>Daily Live Class Link</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'video'
              ? 'bg-[#176BFF] text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Demo Video</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-[#176BFF] text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses with Fee & Enroll ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp & QR Code</span>
        </button>

        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'instagram'
              ? 'bg-[#176BFF] text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <InstagramIcon className="w-4 h-4" />
          <span>Instagram</span>
        </button>

        <button
          onClick={() => setActiveTab('linkedin')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'linkedin'
              ? 'bg-[#0077B5] text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <LinkedinIcon className="w-4 h-4" />
          <span>LinkedIn</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-[#15243B] text-white shadow-xs'
              : 'text-[#73839B] hover:text-[#15243B] hover:bg-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Frame Preview</span>
        </button>
      </div>

      {/* Tab 0: Daily Live Meeting */}
      {activeTab === 'meeting' && (
        <LiveMeetingManagementCard />
      )}

      {/* Tab 1: Demo Video */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl border border-[#DFE9F6] p-6 md:p-8 shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
              <div>
                <h3 className="text-base font-bold text-[#15243B]">Demo Video Configuration</h3>
                <p className="text-xs text-[#73839B]">Supported: YouTube, Vimeo, Google Drive video links</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={videoActive}
                  onChange={(e) => setVideoActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#176BFF]"
                />
                <span className="text-xs font-bold text-[#15243B]">Active on Homepage</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1">Demo Video URL *</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=kqtD5dpn9C8"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-[#176BFF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1">Video Title</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="SkillNova Learning Experience Walkthrough"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-[#176BFF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1">Short Description</label>
              <textarea
                rows={3}
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                placeholder="Explain what students will experience inside the platform..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-[#176BFF]"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isPublishing}
              className="w-full py-3 rounded-xl bg-[#176BFF] hover:bg-[#1358d4] text-white text-xs font-bold shadow-md shadow-[#176BFF]/20 flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Demo Video</span>
            </button>
          </div>

          {/* Interactive Player Preview */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#73839B] block">Interactive Player Preview:</span>
            <div className="rounded-2xl border border-[#DFE9F6] overflow-hidden bg-black aspect-video flex items-center justify-center shadow-md">
              {videoUrl ? (
                <iframe
                  src={getEmbedUrl(videoUrl)}
                  title="Preview"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="text-xs text-[#73839B] text-center p-6">
                  Enter a valid video URL above to preview the playback.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Courses with Fee & WhatsApp Redirect */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#15243B]">Homepage Courses & Pricing</h3>
              <p className="text-xs text-[#73839B]">These certification courses float and display on the public homepage with fees and direct WhatsApp enrollment.</p>
            </div>
            <button
              onClick={() => setShowAddCourse(true)}
              className="px-4 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course with Fee</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl border border-[#DFE9F6] p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-[#EAF3FF]">
                    <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 text-[10px] font-mono text-white">
                      {c.timeline}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-xl bg-white text-xs font-bold text-[#176BFF] shadow-xs">
                      {c.fee}
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-[#15243B]">{c.title}</h4>
                  <p className="text-xs text-[#73839B] line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-[#DFE9F6] space-y-2">
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5 truncate">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Redirects to WhatsApp</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    className="w-full py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from Homepage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Course Modal */}
          {showAddCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15243B]/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
                  <h3 className="text-base font-bold text-[#15243B]">Add Homepage Course with Fee</h3>
                  <button onClick={() => setShowAddCourse(false)} className="text-[#73839B] hover:text-[#15243B]">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateCourse} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={newCourseTitle}
                      onChange={(e) => setNewCourseTitle(e.target.value)}
                      placeholder="e.g. Agentic AI & Generative Workflows"
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#73839B] block mb-1">Fee *</label>
                      <input
                        type="text"
                        required
                        value={newCourseFee}
                        onChange={(e) => setNewCourseFee(e.target.value)}
                        placeholder="₹4,999"
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#73839B] block mb-1">Timeline *</label>
                      <input
                        type="text"
                        required
                        value={newCourseTimeline}
                        onChange={(e) => setNewCourseTimeline(e.target.value)}
                        placeholder="8 Weeks Cohort"
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">Image Thumbnail URL</label>
                    <input
                      type="text"
                      value={newCourseThumb}
                      onChange={(e) => setNewCourseThumb(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">Course Description</label>
                    <textarea
                      rows={2}
                      value={newCourseDesc}
                      onChange={(e) => setNewCourseDesc(e.target.value)}
                      placeholder="High-intensity engineering curriculum..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">
                      Curriculum Text Format (For 16:9 Animated Frame)
                    </label>
                    <textarea
                      rows={5}
                      value={newCourseCurriculum}
                      onChange={(e) => setNewCourseCurriculum(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#73839B] block mb-1">WhatsApp Redirect Link</label>
                    <input
                      type="text"
                      value={newCourseWhatsapp}
                      onChange={(e) => setNewCourseWhatsapp(e.target.value)}
                      placeholder={whatsappUrl}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="px-4 py-2 rounded-xl bg-[#F5F9FF] text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-bold"
                    >
                      Save & Publish Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: WhatsApp Configuration & QR Code */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl border border-[#DFE9F6] p-6 md:p-8 shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
              <div>
                <h3 className="text-base font-bold text-[#15243B]">WhatsApp Group & QR Setup</h3>
                <p className="text-xs text-[#73839B]">Configures the community floating button & enrollment QR code</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappActive}
                  onChange={(e) => setWhatsappActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="text-xs font-bold text-[#15243B]">Active</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1">WhatsApp Group Invitation URL *</label>
              <input
                type="text"
                value={whatsappUrl}
                onChange={(e) => {
                  setWhatsappUrl(e.target.value);
                  // Auto-generate QR code preview URL
                  if (e.target.value) {
                    setWhatsappQr(
                      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                        e.target.value
                      )}`
                    );
                  }
                }}
                placeholder="https://chat.whatsapp.com/SkillNovaOfficial..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1">Display Label</label>
              <input
                type="text"
                value={whatsappName}
                onChange={(e) => setWhatsappName(e.target.value)}
                placeholder="Official SkillNova WhatsApp Community"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#73839B] block mb-1">WhatsApp QR Code Image URL</label>
              <input
                type="text"
                value={whatsappQr}
                onChange={(e) => setWhatsappQr(e.target.value)}
                placeholder="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-emerald-600"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isPublishing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish WhatsApp Settings</span>
            </button>
          </div>

          {/* QR Code Realtime Preview */}
          <div className="space-y-3 flex flex-col items-center justify-center p-6 bg-[#F5F9FF] rounded-2xl border border-[#DFE9F6] text-center">
            <span className="text-xs font-bold text-[#15243B]">Generated Live WhatsApp QR Preview</span>
            <div className="p-4 bg-white rounded-2xl border border-[#DFE9F6] shadow-sm">
              <img
                src={
                  whatsappQr ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappUrl)}`
                }
                alt="QR Preview"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-[11px] text-[#73839B] max-w-xs">
              Students scanning this code on the public homepage will be redirected directly to your official WhatsApp community.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4 & 5: Instagram and LinkedIn */}
      {(activeTab === 'instagram' || activeTab === 'linkedin') && (
        <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 md:p-8 shadow-xs max-w-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
            <h3 className="text-base font-bold text-[#15243B]">
              {activeTab === 'instagram' ? 'Instagram Profile Setup' : 'LinkedIn Page Setup'}
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeTab === 'instagram' ? instagramActive : linkedinActive}
                onChange={(e) =>
                  activeTab === 'instagram' ? setInstagramActive(e.target.checked) : setLinkedinActive(e.target.checked)
                }
                className="w-4 h-4 rounded text-[#176BFF]"
              />
              <span className="text-xs font-bold text-[#15243B]">Active on Homepage</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold text-[#73839B] block mb-1">
              {activeTab === 'instagram' ? 'Instagram Profile URL' : 'LinkedIn Company/Profile URL'}
            </label>
            <input
              type="text"
              value={activeTab === 'instagram' ? instagramUrl : linkedinUrl}
              onChange={(e) =>
                activeTab === 'instagram' ? setInstagramUrl(e.target.value) : setLinkedinUrl(e.target.value)
              }
              placeholder={activeTab === 'instagram' ? 'https://instagram.com/skillnova_edu' : 'https://linkedin.com/company/skillnova'}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-[#176BFF]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#73839B] block mb-1">Display Name</label>
            <input
              type="text"
              value={activeTab === 'instagram' ? instagramName : linkedinName}
              onChange={(e) =>
                activeTab === 'instagram' ? setInstagramName(e.target.value) : setLinkedinName(e.target.value)
              }
              placeholder={activeTab === 'instagram' ? 'Instagram @skillnova_edu' : 'SkillNova on LinkedIn'}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F9FF] border border-[#DFE9F6] text-xs text-[#15243B] focus:border-[#176BFF]"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isPublishing}
            className="w-full py-3 rounded-xl bg-[#176BFF] hover:bg-[#1358d4] text-white text-xs font-bold shadow-md shadow-[#176BFF]/20 flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save & Publish Changes</span>
          </button>
        </div>
      )}

      {/* Tab 6: Live Frame Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DFE9F6]">
            <div>
              <h3 className="text-base font-bold text-[#15243B]">Live Homepage Embedded Preview</h3>
              <p className="text-xs text-[#73839B]">Inspect how visitors and prospective students view the updated layout</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-bold flex items-center gap-2"
            >
              <span>Open Full Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full rounded-2xl border border-[#DFE9F6] overflow-hidden aspect-video shadow-inner">
            <iframe src="/" title="Homepage Preview" className="w-full h-full border-0" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageManagementPage;
