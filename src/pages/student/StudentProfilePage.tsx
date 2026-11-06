import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  BookOpen,
  Award,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Check,
  Lock,
  Save,
  Camera,
  AlertCircle,
  RefreshCw,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const StudentProfilePage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser, refreshUser } = useAuth();

  // Active user resolution
  const user = currentUser || dataService.getCurrentUser() || {
    id: 'student-session',
    full_name: 'SkillNova Student',
    email: 'student@skillnova.edu',
    username: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    college: 'SkillNova Engineering Academy',
    branch: 'Computer Science & Engineering',
    year_of_study: '3rd Year (Batch 2026)',
    status: 'active' as const,
    role: 'student' as const
  };

  // Editable fields strictly restricted to: 1. Full name, 2. Profile image
  const [fullName, setFullName] = useState(user.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [user.id, user.full_name, user.avatar_url]);

  const enrolledCourses = dataService.getEnrolledCourses(user.id);
  const attempts = dataService.getQuizAttempts(user.id);

  // File selection & validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid format. Please select a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Remove current / preview image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setSaveStatus({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    setFileError(null);

    try {
      let finalAvatarUrl = avatarUrl;

      // If user uploaded a new local file from their device
      if (selectedFile) {
        const uploadRes = await storageService.uploadUserAvatar(selectedFile, user.id);
        if (!uploadRes.success || !uploadRes.url) {
          throw new Error(uploadRes.error || 'Failed to upload photo to Supabase storage.');
        }
        finalAvatarUrl = uploadRes.url;
        setAvatarUrl(finalAvatarUrl);
      }

      const res = await dataService.updateUserProfile(user.id, {
        full_name: fullName.trim(),
        avatar_url: finalAvatarUrl
      });

      if (res.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setSaveStatus({
          type: 'success',
          message: 'Leaderboard profile picture and identity updated in Supabase database!'
        });
        refreshUser();
      } else {
        setSaveStatus({
          type: 'error',
          message: res.error || 'Failed to update profile in database.'
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err?.message || 'Unexpected error while updating profile.'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40 flex items-center gap-1.5 font-mono">
            <UserIcon className="w-3.5 h-3.5 text-[#00A3FF]" />
            Student Identity & Settings
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            ID: {user.username || user.email?.split('@')[0] || user.id.slice(0, 8)}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
          My Academic Profile & Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#9BAAC2]">
          Authorized institutional learning identity, theme preferences, and verified competency records.
        </p>
      </div>

      {/* Profile Update Feedback */}
      {saveStatus && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all ${saveStatus.type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300'
            }`}
        >
          {saveStatus.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Main Profile & Editable Section */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-200 dark:border-white/10 text-center sm:text-left">
          <div className="relative group">
            <img
              src={avatarUrl || user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={fullName || user.full_name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#00A3FF] shadow-[0_0_20px_rgba(0,163,255,0.3)]"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
              {user.status || 'Active'}
            </span>
          </div>

          <div className="space-y-1.5 flex-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {fullName || user.full_name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAAC2] flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#00A3FF]" /> {user.email}
            </p>
          </div>
        </div>

        {/* Academic Details Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">Status</span>
            <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Enrolled & Verified
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">Tracks</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#00A3FF]" /> {enrolledCourses.length} Enrolled Courses
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">Assessments</span>
            <p className="text-sm font-bold text-[#00A3FF] flex items-center gap-1.5 font-mono">
              <Award className="w-4 h-4 text-[#00A3FF]" /> {attempts.length} Completed
            </p>
          </div>
        </div>

        {/* SECTION 1: LEADERBOARD PROFILE PICTURE & IDENTITY */}
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00A3FF]" />
                <span>Leaderboard Profile Picture</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BAAC2]">
                Your official photo displayed on the Winner Podium, Global Quiz Leaderboard, and Student Dashboard.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/30 font-bold uppercase self-start sm:self-auto">
              Supabase Storage
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Upload & Preview Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center gap-6">
              {/* Picture Preview */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#00A3FF] shadow-lg shadow-[#00A3FF]/20 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  {(previewUrl || avatarUrl || user.avatar_url) ? (
                    <img
                      src={previewUrl || avatarUrl || user.avatar_url}
                      alt={fullName || user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#176BFF] to-[#00A3FF] text-white font-mono text-2xl font-black">
                      {(fullName || user.full_name || 'S').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {previewUrl && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                    New Preview
                  </span>
                )}
              </div>

              {/* Upload Controls & Actions */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedFile ? selectedFile.name : ((previewUrl || avatarUrl || user.avatar_url) ? 'Active Leaderboard Photo' : 'No Profile Picture Uploaded')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-[#9BAAC2] mt-0.5">
                    Select a photo from your device. Allowed formats: <strong>JPG, JPEG, PNG, WEBP</strong> (Max 5MB).
                  </p>
                </div>

                {fileError && (
                  <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 justify-center sm:justify-start">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Hidden File Picker Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#00A3FF] hover:bg-[#008de0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#00A3FF]/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{(previewUrl || avatarUrl || user.avatar_url) ? 'Change Image' : 'Upload Image'}</span>
                  </button>

                  {(previewUrl || avatarUrl || user.avatar_url) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 dark:border-white/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name & Preset Quick Options */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Student Full Name (Displayed on Leaderboard) <span className="text-[#00A3FF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 dark:bg-[#060B18] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00A3FF] transition font-medium"
                />
              </div>

              {/* Preset Avatars for Fast Selection */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAC2] block">
                  Or pick a curated avatar preset:
                </span>
                <div className="flex items-center gap-3">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(url);
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${(avatarUrl === url && !previewUrl)
                        ? 'border-[#00A3FF] ring-2 ring-[#00A3FF]/40 scale-105'
                        : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: INSTITUTIONAL & ACADEMIC FIELDS (Strictly Read-Only) */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Institutional & Academic Credentials (Strictly Read-Only)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BAAC2]">
                These verified attributes are managed exclusively by SkillNova Institutional Administration and cannot be altered by students.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked by Admin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {/* Username */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">
                  Username
                </span>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {user.username || user.email?.split('@')[0] || 'student'}
              </p>
            </div>

            {/* Email Address */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">
                  Email Address
                </span>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                {user.email}
              </p>
            </div>

            {/* Role */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">
                  System Role
                </span>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-[#00A3FF] uppercase font-mono">
                {user.role || 'Student'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: THEME CUSTOMIZATION */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A3FF]" />
                <span>Portal Theme Customization</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BAAC2]">
                Choose your visual workspace aesthetic. Persisted to your Supabase profile across all logins.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/30 font-bold uppercase">
              Current: {theme}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Theme Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${theme === 'light'
                ? 'border-[#00A3FF] bg-[#EAF4FF] shadow-lg shadow-[#00A3FF]/15 scale-[1.02]'
                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060B18] opacity-80 hover:opacity-100'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#00A3FF]/30 text-[#00A3FF] flex items-center justify-center shadow-sm">
                    <Sun className="w-5 h-5 text-[#00A3FF]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Light Theme</h4>
                    <span className="text-[10px] text-[#00A3FF] font-mono font-bold">Fluorescent Blue Accents</span>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="w-6 h-6 rounded-full bg-[#00A3FF] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Clean light background with electric-blue highlights, clear dark typography, subtle blue shadows, and restrained blue sprinkles.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="w-4 h-4 rounded-full bg-white border border-slate-300" title="Clean White" />
                <span className="w-4 h-4 rounded-full bg-[#00A3FF]" title="Fluorescent Blue" />
                <span className="w-4 h-4 rounded-full bg-[#176BFF]" title="Electric Accent" />
                <span className="w-4 h-4 rounded-full bg-[#F0F7FF]" title="Soft Highlight" />
              </div>
            </div>

            {/* Dark Theme Card */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${theme === 'dark'
                ? 'border-[#00A3FF] bg-[#0A1A3F] shadow-lg shadow-[#00A3FF]/20 scale-[1.02]'
                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060B18] opacity-80 hover:opacity-100'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#050811] border border-[#00A3FF]/40 text-[#00D1FF] flex items-center justify-center shadow-sm">
                    <Moon className="w-5 h-5 text-[#00D1FF]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dark Theme</h4>
                    <span className="text-[10px] text-[#00D1FF] font-mono font-bold">Black & Fluorescent Blue</span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="w-6 h-6 rounded-full bg-[#00A3FF] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Deep black background with luminous fluorescent blue bottom glow, falling sparkling particles, and high-contrast text.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="w-4 h-4 rounded-full bg-[#050811] border border-white/20" title="Deep Black" />
                <span className="w-4 h-4 rounded-full bg-[#00A3FF]" title="Fluorescent Blue" />
                <span className="w-4 h-4 rounded-full bg-[#00D1FF]" title="Luminous Cyan" />
                <span className="w-4 h-4 rounded-full bg-[#0A1A3F]" title="Bottom Glow" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: ENROLLED COURSES SUMMARY (Read-Only) */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BAAC2] font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00A3FF]" />
              Assigned Technology Tracks ({enrolledCourses.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Strictly Read-Only</span>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-[#9BAAC2]">
              No active course enrollments found for this account.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enrolledCourses.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-[#9BAAC2] font-mono">
                      Mentor: {c.mentor_name || 'Senior Mentor'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#00A3FF] font-mono">
                    {c.progressPercentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
