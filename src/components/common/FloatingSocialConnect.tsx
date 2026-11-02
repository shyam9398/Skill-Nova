import React, { useState, useEffect } from 'react';
import { MessageCircle, QrCode, X, ExternalLink, Sparkles } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { HomepageSettings } from '../../types';

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export const FloatingSocialConnect: React.FC = () => {
  const [settings, setSettings] = useState<HomepageSettings>(dataService.getHomepageSettings());
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const update = () => {
      setSettings(dataService.getHomepageSettings());
    };
    update();
    return dataService.subscribe(update);
  }, []);

  const hasAnySocial = settings.whatsapp_is_active || settings.instagram_is_active || settings.linkedin_is_active;
  if (!hasAnySocial) return null;

  return (
    <>
      {/* Floating Social Panel (Vertical on desktop, bottom-left compact on mobile) */}
      <div className="fixed left-4 bottom-6 md:bottom-auto md:top-1/3 z-40 flex md:flex-col items-center gap-2.5 p-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#DFE9F6] shadow-xl shadow-[#00A3FF]/15 animate-fadeIn">
        {/* WhatsApp Link & QR Trigger */}
        {settings.whatsapp_is_active && (
          <div className="relative group">
            <a
              href={settings.whatsapp_group_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={settings.whatsapp_display_name || 'Join WhatsApp Group'}
              className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition transform group-hover:scale-105 shadow-md shadow-emerald-500/20"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
            </a>

            {/* Desktop Quick Actions Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden md:group-hover:flex items-center gap-2 p-2 rounded-xl bg-white border border-[#DFE9F6] shadow-xl whitespace-nowrap z-50">
              <span className="text-xs font-bold text-[#15243B]">
                {settings.whatsapp_display_name || 'Official WhatsApp'}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQrModal(true);
                }}
                className="p-1 rounded-lg bg-[#EAF3FF] hover:bg-[#DFE9F6] text-[#176BFF] text-xs font-semibold flex items-center gap-1"
                title="Scan QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR</span>
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp QR Direct Button on Mobile */}
        {settings.whatsapp_is_active && (
          <button
            onClick={() => setShowQrModal(true)}
            className="md:hidden w-10 h-10 rounded-xl bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25 flex items-center justify-center transition"
            title="Scan WhatsApp QR"
            aria-label="Scan WhatsApp QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}

        {/* Instagram */}
        {settings.instagram_is_active && (
          <div className="relative group">
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={settings.instagram_display_name || 'Instagram'}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center transition transform group-hover:scale-105 shadow-md shadow-pink-500/20"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden md:group-hover:block px-3 py-1.5 rounded-xl bg-white border border-[#DFE9F6] shadow-xl whitespace-nowrap z-50 text-xs font-bold text-[#15243B]">
              {settings.instagram_display_name || 'Follow Instagram'}
            </div>
          </div>
        )}

        {/* LinkedIn */}
        {settings.linkedin_is_active && (
          <div className="relative group">
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={settings.linkedin_display_name || 'LinkedIn'}
              className="w-10 h-10 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white flex items-center justify-center transition transform group-hover:scale-105 shadow-md shadow-[#0077B5]/20"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden md:group-hover:block px-3 py-1.5 rounded-xl bg-white border border-[#DFE9F6] shadow-xl whitespace-nowrap z-50 text-xs font-bold text-[#15243B]">
              {settings.linkedin_display_name || 'Connect on LinkedIn'}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15243B]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DFE9F6] p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative animate-scaleUp">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF] transition"
              aria-label="Close QR Modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-[#15243B]">Scan to Join Official Community</h3>
              <p className="text-xs text-[#73839B]">
                Open WhatsApp on your mobile phone and scan this code to enter the official SkillNova student cohort.
              </p>
            </div>

            {/* QR Code Image */}
            <div className="p-4 bg-[#F5F9FF] rounded-2xl border border-[#DFE9F6] flex items-center justify-center">
              <img
                src={
                  settings.whatsapp_qr_code_url ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    settings.whatsapp_group_url
                  )}`
                }
                alt="SkillNova WhatsApp QR Code"
                className="w-48 h-48 rounded-xl object-contain shadow-xs bg-white p-2 border border-[#DFE9F6]"
              />
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={settings.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
              >
                <span>Direct Invitation Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[10px] text-[#73839B]">
                Official credentials are distributed via WhatsApp group coordinators after verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSocialConnect;
