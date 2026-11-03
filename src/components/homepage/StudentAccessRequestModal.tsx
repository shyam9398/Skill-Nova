import React, { useState } from 'react';
import {
  MessageCircle, QrCode, ArrowRight, CheckCircle2,
  AlertCircle, X, Shield, ExternalLink, HelpCircle, User, Sparkles
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { HomepageSettings } from '../../types';

interface StudentAccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseTitle?: string;
}

export const StudentAccessRequestModal: React.FC<StudentAccessRequestModalProps> = ({
  isOpen,
  onClose,
  defaultCourseTitle = 'Full Stack Web Engineering & Microservices'
}) => {
  const settings: HomepageSettings = dataService.getHomepageSettings();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year (Batch 2027)');
  const [targetCourse, setTargetCourse] = useState(defaultCourseTitle);
  const [paymentRef, setPaymentRef] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!fullName.trim() || !email.trim() || !college.trim()) {
        setError('Please complete all required fields.');
        setIsSubmitting(false);
        return;
      }

      await dataService.createStudentAccessRequest({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        college: college.trim(),
        branch: branch.trim(),
        year_of_study: yearOfStudy.trim(),
        target_course: targetCourse,
        payment_reference: paymentRef.trim() || 'AWAITING_SETTLEMENT'
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15243B]/65 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0D1833] rounded-3xl border border-[#DFE9F6] dark:border-white/10 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#73839B] dark:text-[#9BAAC5] hover:text-[#15243B] dark:hover:text-white hover:bg-[#F5F9FF] dark:hover:bg-white/10 transition"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] text-xs font-mono font-bold border border-[#00A3FF]/25">
            <Shield className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL ENROLLMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#15243B] dark:text-[#F4F7FF]">
            Request Student Access Credentials
          </h2>
          <p className="text-xs text-[#73839B] dark:text-[#9BAAC5] leading-relaxed">
            Public registration is restricted. To obtain student credentials, join the official SkillNova WhatsApp group. An Administrator will provision and dispatch your login credentials after payment verification.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">Access Request Submitted!</h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Your request has been filed under status <strong className="font-mono">PENDING APPROVAL</strong>.
                Please ensure you have joined the official WhatsApp group below to receive your password setup link once verified by the administrator.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={settings.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Join Official WhatsApp Group</span>
              </a>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-white dark:bg-[#0B1530] border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold text-emerald-800 dark:text-emerald-300"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Official WhatsApp Invitation Banner with QR Code */}
            <div className="p-4 rounded-2xl bg-[#F5F9FF] dark:bg-[#070D1E] border border-[#DFE9F6] dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#15243B] dark:text-[#F4F7FF] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  Step 1: Join Official WhatsApp Community
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                  Required
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <img
                  src={
                    settings.whatsapp_qr_code_url ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      settings.whatsapp_group_url
                    )}`
                  }
                  alt="WhatsApp QR"
                  className="w-24 h-24 rounded-xl bg-white qr-code p-1.5 border border-[#DFE9F6] shadow-xs"
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <p className="text-xs text-[#73839B] dark:text-[#9BAAC5]">
                    Scan QR or click below to enter the verified cohort room. Credentials and batch announcements are coordinated here.
                  </p>
                  <a
                    href={settings.whatsapp_group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Join WhatsApp Group</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Request Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs font-bold text-[#15243B] dark:text-[#F4F7FF] flex items-center gap-2 pt-1">
                <span className="w-5 h-5 rounded-full bg-[#176BFF] text-white flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                Step 2: Submit Student Details for Admin Approval
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] placeholder-[#73839B] dark:placeholder-[#6C7D9C] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">Student Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] placeholder-[#73839B] dark:placeholder-[#6C7D9C] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] placeholder-[#73839B] dark:placeholder-[#6C7D9C] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">College / Institute *</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Apex Tech Institute"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] placeholder-[#73839B] dark:placeholder-[#6C7D9C] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">Branch / Degree</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science & Eng"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] placeholder-[#73839B] dark:placeholder-[#6C7D9C] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">Target Course / Cohort</label>
                  <input
                    type="text"
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#73839B] dark:text-[#9BAAC5] block mb-1">
                  Payment / UPI Reference or Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UPI-REF-89472911 (or enter PENDING)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F9FF] dark:bg-[#0B1530] border border-[#DFE9F6] dark:border-white/15 text-xs text-[#15243B] dark:text-[#F4F7FF] placeholder-[#73839B] dark:placeholder-[#6C7D9C] focus:border-[#176BFF] dark:focus:border-[#00A8FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <span>Filing Request in Supabase...</span>
                ) : (
                  <>
                    <span>Submit Access Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAccessRequestModal;
