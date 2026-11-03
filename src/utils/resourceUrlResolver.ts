/**
 * SkillNova Resource URL Resolver & Embed Utility
 * Safely resolves Google Drive, Google Docs, Google Slides, YouTube, Vimeo,
 * Office Online, and standard document URLs into in-platform embeddable formats.
 */

export interface ResolvedResource {
  rawUrl: string;
  embedUrl: string;
  provider: 'google_drive' | 'google_docs' | 'google_slides' | 'youtube' | 'vimeo' | 'office' | 'direct_pdf' | 'generic';
  canEmbed: boolean;
  fileId?: string;
  mimeType?: string;
}

/**
 * Extracts Google file ID from standard drive/docs/slides URLs
 */
export function extractGoogleFileId(url: string): string | null {
  if (!url) return null;
  // Match /d/{id}
  const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Match id={id}
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  return null;
}

/**
 * Resolves any admin-provided URL into an embeddable URL for iframe display
 */
export function resolveResourceUrl(rawUrl?: string, resourceType?: 'video' | 'ppt' | 'notes' | 'interview' | 'pdf' | 'generic'): ResolvedResource {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {
      rawUrl: '',
      embedUrl: '',
      provider: 'generic',
      canEmbed: false
    };
  }

  const clean = rawUrl.trim();

  // 1. GOOGLE DRIVE (Videos, PDFs, generic Drive files)
  if (clean.includes('drive.google.com')) {
    const fileId = extractGoogleFileId(clean);
    if (fileId) {
      return {
        rawUrl: clean,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        provider: 'google_drive',
        canEmbed: true,
        fileId
      };
    }
    // Fallback: replace /view or /edit with /preview
    const converted = clean.replace(/\/(view|edit|pub)(\?.*)?$/, '/preview');
    return {
      rawUrl: clean,
      embedUrl: converted.includes('/preview') ? converted : `${clean}/preview`,
      provider: 'google_drive',
      canEmbed: true
    };
  }

  // 2. GOOGLE SLIDES (Presentations)
  if (clean.includes('docs.google.com/presentation')) {
    const fileId = extractGoogleFileId(clean);
    const base = fileId
      ? `https://docs.google.com/presentation/d/${fileId}`
      : clean.split('/edit')[0].split('/pub')[0];

    return {
      rawUrl: clean,
      embedUrl: `${base}/embed?start=false&loop=false&delayms=3000`,
      provider: 'google_slides',
      canEmbed: true,
      fileId: fileId || undefined
    };
  }

  // 3. GOOGLE DOCS (Notes, Cheat Sheets, Documents, Interview Questions)
  if (clean.includes('docs.google.com/document')) {
    const fileId = extractGoogleFileId(clean);
    const base = fileId
      ? `https://docs.google.com/document/d/${fileId}`
      : clean.split('/edit')[0].split('/pub')[0];

    return {
      rawUrl: clean,
      embedUrl: `${base}/preview`,
      provider: 'google_docs',
      canEmbed: true,
      fileId: fileId || undefined
    };
  }

  // 4. YOUTUBE
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = clean.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }

    if (videoId) {
      return {
        rawUrl: clean,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
        provider: 'youtube',
        canEmbed: true,
        fileId: videoId
      };
    }
  }

  // 5. VIMEO
  if (clean.includes('vimeo.com')) {
    const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        rawUrl: clean,
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
        provider: 'vimeo',
        canEmbed: true,
        fileId: vimeoMatch[3]
      };
    }
  }

  // 6. MICROSOFT OFFICE ONLINE (for public .ppt, .pptx, .doc, .docx files)
  const isOfficeFile = /\.(ppt|pptx|doc|docx|xls|xlsx)(\?.*)?$/i.test(clean);
  if (isOfficeFile && !clean.includes('officeapps.live.com')) {
    return {
      rawUrl: clean,
      embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(clean)}`,
      provider: 'office',
      canEmbed: true
    };
  }

  // 7. DIRECT PDF FILES
  if (clean.endsWith('.pdf') || clean.includes('.pdf?')) {
    return {
      rawUrl: clean,
      embedUrl: clean,
      provider: 'direct_pdf',
      canEmbed: true
    };
  }

  // 8. GENERIC WEB VIEWER (Google Docs Viewer fallback for other public documents)
  if (resourceType === 'ppt' || resourceType === 'notes' || resourceType === 'interview' || resourceType === 'pdf') {
    return {
      rawUrl: clean,
      embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(clean)}&embedded=true`,
      provider: 'generic',
      canEmbed: true
    };
  }

  return {
    rawUrl: clean,
    embedUrl: clean,
    provider: 'generic',
    canEmbed: true
  };
}

