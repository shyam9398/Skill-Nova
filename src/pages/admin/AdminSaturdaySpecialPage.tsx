import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  Video, 
  FileText, 
  Tag, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { SaturdaySpecialSession } from '../../types';

export const AdminSaturdaySpecialPage: React.FC = () => {
  const [sessions, setSessions] = useState<SaturdaySpecialSession[]>(() => dataService.getSaturdaySpecialSessions());
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    void dataService.syncSaturdaySpecialsFromSupabase();
    const unsub = dataService.subscribe(() => {
      setSessions(dataService.getSaturdaySpecialSessions());
    });
    return unsub;
  }, []);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Agentic AI & LLMs');
  const [description, setDescription] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [resourceDocUrl, setResourceDocUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    'Agentic AI & LLMs',
    'Generative AI',
    'Cloud Native & Kubernetes',
    'DevOps & CI/CD',
    'Cybersecurity & Ethical Hacking',
    'Robotics & Embedded Systems',
    'Research Paper Discussions',
    'Hackathon Strategy'
  ];

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const newSession = await dataService.publishSaturdaySpecial({
        title,
        category,
        description,
        recordingUrl: recordingUrl || 'https://drive.google.com/file/d/demo-session-recording/view',
        resourceDocUrl: resourceDocUrl || 'https://drive.google.com/file/d/demo-presentation-deck/view',
        coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        date
      });

      setSessions([newSession, ...sessions.filter(s => s.id !== newSession.id)]);
      setShowModal(false);
      resetForm();

      setNotification(`Successfully published Saturday Special: "${title}"`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification(`Error saving session: ${err.message || 'Database error'}`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDeleteSession = async (id: string, sTitle: string) => {
    if (!window.confirm(`Delete session "${sTitle}"?`)) return;
    try {
      await dataService.deleteSaturdaySpecial(id);
      setSessions(sessions.filter(s => s.id !== id));
      setNotification(`Session "${sTitle}" removed successfully.`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification(`Error deleting session: ${err.message}`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Agentic AI & LLMs');
    setDescription('');
    setRecordingUrl('');
    setResourceDocUrl('');
    setCoverImageUrl('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#397BFF]" />
              Beyond the Classroom
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">Emerging Technology Sessions</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
            Saturday Special Management
          </h1>
          <p className="text-sm text-[#9BAAC2]">
            Publish high-impact sessions on emerging trends, research paper breakdowns, and engineering innovations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#397BFF] to-[#77B4FF] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(57,123,255,0.4)] transition"
        >
          <Plus className="w-4 h-4" /> Publish New Session
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className="bg-[#15233A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#397BFF]/40 transition group flex flex-col shadow-lg"
          >
            <div className="relative h-44 overflow-hidden bg-[#101A2D]">
              <img 
                src={session.coverImageUrl} 
                alt={session.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15233A] via-transparent to-black/40" />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#080E1C]/80 backdrop-blur-md border border-white/10 text-[#77B4FF] flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[#397BFF]" /> {session.category}
                </span>
              </div>
              <div className="absolute bottom-2 right-3 text-xs text-[#9BAAC2] font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#397BFF]" /> {session.date}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#F0F5FF] group-hover:text-[#77B4FF] transition line-clamp-1 mb-2">
                  {session.title}
                </h3>
                <p className="text-xs text-[#9BAAC2] line-clamp-2 leading-relaxed">
                  {session.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-[#9BAAC2]">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#397BFF]" />
                    {session.recordingUrl ? 'Drive Recording Live' : 'Pending Recording'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#77B4FF]" />
                    {session.resourceDocUrl ? 'Slides Attached' : 'No Slides'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={session.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#77B4FF] hover:underline flex items-center gap-1 font-medium"
                  >
                    View Recording <ExternalLink className="w-3 h-3" />
                  </a>

                  <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live to Students
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Publish Session */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15233A] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#F0F5FF] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#397BFF]" />
                Publish Saturday Special Session
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#9BAAC2] hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DeepSeek R1 & Reasoning Models Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline key concepts covered, prerequisites, and takeaways..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Recording URL (Google Drive / YouTube)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  className="w-full bg-[#080E1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BAAC2] uppercase tracking-wider mb-1.5">
                  Resource Deck / Paper URL
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... or arXiv link"
                  value={resourceDocUrl}
                  onChange={(e) => setResourceDocUrl(e.target.value)}
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
                  Publish Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
