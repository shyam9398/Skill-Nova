import React, { useState } from 'react';
import {
  X, Video, FileText, Presentation, ExternalLink,
  ShieldAlert, CheckCircle2, Calendar, Info, Clock, Download
} from 'lucide-react';
import type { Topic } from '../../types';

interface InAppResourceViewerProps {
  topic: Topic | null;
  resourceType: 'recording' | 'drive_notes' | 'pdf' | 'ppt' | 'meet' | 'reference' | null;
  onClose: () => void;
}

export const InAppResourceViewer: React.FC<InAppResourceViewerProps> = ({
  topic,
  resourceType,
  onClose
}) => {
  if (!topic || !resourceType) return null;

  // Convert Google Drive view URLs to embeddable preview URLs
  const getEmbeddableDriveUrl = (url: string): string => {
    if (!url) return '';
    // Format: https://drive.google.com/file/d/FILE_ID/view... -> .../preview
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    // Format: https://drive.google.com/open?id=FILE_ID
    const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[1]) {
      return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
    }
    return url;
  };

  const isGoogleMeet = resourceType === 'meet' || topic.recording_url?.includes('meet.google.com');

  return (
    <div className="fixed inset-0 z-50 bg-[#15243B]/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#DFE9F6] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="h-16 px-6 border-b border-[#DFE9F6] bg-[#F5F9FF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center border border-[#00A3FF]/20 shrink-0">
              {resourceType === 'recording' || isGoogleMeet ? (
                <Video className="w-5 h-5 text-[#176BFF]" />
              ) : resourceType === 'ppt' ? (
                <Presentation className="w-5 h-5 text-[#00A3FF]" />
              ) : (
                <FileText className="w-5 h-5 text-[#176BFF]" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-[#15243B] truncate">
                {topic.title}
              </h3>
              <p className="text-[11px] text-[#73839B] truncate">
                In-App Viewer • {resourceType.toUpperCase()} Resource
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#73839B] hover:text-[#15243B] hover:bg-[#DFE9F6] transition"
              aria-label="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 bg-[#F5F9FF] p-4 md:p-6 overflow-y-auto">
          {/* Google Meet Scheduled Class */}
          {isGoogleMeet ? (
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-5 bg-white p-8 rounded-3xl border border-[#DFE9F6] shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center border border-[#00A3FF]/30 shadow-md">
                <Video className="w-8 h-8 text-[#00A3FF]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 font-mono">
                  Live Classroom
                </span>
                <h4 className="text-xl font-black text-[#15243B]">{topic.title}</h4>
                <p className="text-xs text-[#73839B] leading-relaxed">
                  {topic.description || 'Live interactive mentor lecture and doubt clearing session for enrolled students.'}
                </p>
              </div>

              {/* Notice regarding Google's X-Frame restrictions */}
              <div className="bg-[#EAF3FF]/80 rounded-2xl p-4 border border-[#00A3FF]/30 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#176BFF]">
                  <Info className="w-4 h-4 shrink-0 text-[#00A3FF]" />
                  <span>Google Meet Security Architecture</span>
                </div>
                <p className="text-[#15243B]/80 text-[11px] leading-relaxed">
                  Google’s security policy strictly blocks third-party iframe embedding via <code className="font-mono text-[#176BFF]">X-Frame-Options: SAMEORIGIN</code> to prevent clickjacking. Click the action below to launch directly in this window.
                </p>
              </div>

              <a
                href={topic.recording_url || 'https://meet.google.com'}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1358d4] hover:to-[#008fdb] text-white text-xs font-bold shadow-lg shadow-[#00A3FF]/25 flex items-center justify-center gap-2 transition"
              >
                <span>Enter Google Meet Live Session</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : resourceType === 'recording' && topic.recording_url ? (
            /* Google Drive / Approved Video Player */
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1 rounded-2xl overflow-hidden bg-black border border-[#DFE9F6] shadow-md relative">
                <iframe
                  src={getEmbeddableDriveUrl(topic.recording_url)}
                  title={`Recording: ${topic.title}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#DFE9F6] flex items-center justify-between text-xs text-[#73839B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Streaming directly inside SkillNova in-app player</span>
                </div>
                <a
                  href={topic.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#176BFF] font-semibold hover:underline flex items-center gap-1"
                >
                  Direct Drive link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : resourceType === 'drive_notes' && topic.drive_notes_url ? (
            /* Google Drive Notes & Documents Embed */
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1 rounded-2xl overflow-hidden bg-white border border-[#DFE9F6] shadow-md">
                <iframe
                  src={getEmbeddableDriveUrl(topic.drive_notes_url)}
                  title={`Notes: ${topic.title}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#DFE9F6] flex items-center justify-between text-xs text-[#73839B]">
                <span>In-App Document Preview</span>
                <a
                  href={topic.drive_notes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#176BFF] font-semibold hover:underline flex items-center gap-1"
                >
                  Open in Google Docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : resourceType === 'pdf' ? (
            /* Direct In-App PDF Viewer */
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1 rounded-2xl overflow-hidden bg-white border border-[#DFE9F6] shadow-md relative">
                <iframe
                  src={topic.pdf_file_url || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'}
                  title={`PDF: ${topic.title}`}
                  className="w-full h-full border-0"
                />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#DFE9F6] flex items-center justify-between text-xs text-[#73839B]">
                <span>SkillNova Native PDF Document Engine</span>
                <span className="text-[11px] font-mono text-[#176BFF]">Embedded View</span>
              </div>
            </div>
          ) : resourceType === 'ppt' ? (
            /* In-App Presentation Viewer */
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1 rounded-2xl overflow-hidden bg-white border border-[#DFE9F6] shadow-md">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(topic.ppt_file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')}&embedded=true`}
                  title={`Presentation: ${topic.title}`}
                  className="w-full h-full border-0"
                />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#DFE9F6] flex items-center justify-between text-xs text-[#73839B]">
                <span>In-App Slide Deck Preview</span>
                <span className="text-[11px] font-mono text-[#00A3FF]">Presentation Viewer</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-8">
              <FileText className="w-12 h-12 text-[#73839B]" />
              <h4 className="text-base font-bold text-[#15243B]">Resource Loading</h4>
              <p className="text-xs text-[#73839B] max-w-sm">
                Preparing authenticated view for {topic.title}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
