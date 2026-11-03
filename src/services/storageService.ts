import { supabase, isLiveSupabaseConfigured } from './supabaseClient';

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

/**
 * Storage Service for permanent file persistence in Supabase Storage.
 * Handles learning documents (PPT, PDF, DOCX), course thumbnails, and user avatars.
 */
export const storageService = {
  /**
   * Upload a learning document or video to the private 'course-materials' bucket.
   */
  async uploadLearningResource(file: File, subFolder: string = 'materials'): Promise<UploadResult> {
    if (!isLiveSupabaseConfigured) {
      return {
        success: true,
        path: `local/${subFolder}/${file.name}`,
        url: URL.createObjectURL(file)
      };
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const filePath = `${subFolder}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('[SkillNova Storage] uploadLearningResource note:', error.message);
        return { success: false, error: error.message };
      }

      // Generate a signed URL valid for 7 days (604800 seconds) for private access
      const { data: signedData } = await supabase.storage
        .from('course-materials')
        .createSignedUrl(data.path, 604800);

      const url = signedData?.signedUrl || '';

      return {
        success: true,
        path: data.path,
        url
      };
    } catch (e: any) {
      console.warn('[SkillNova Storage] uploadLearningResource error:', e);
      return { success: false, error: e?.message || 'Storage upload error' };
    }
  },

  /**
   * Upload a course promotional thumbnail or roadmap image to the public 'course-roadmaps' bucket.
   */
  async uploadCourseThumbnail(file: File): Promise<UploadResult> {
    if (!isLiveSupabaseConfigured) {
      return {
        success: true,
        path: `local/thumbnails/${file.name}`,
        url: URL.createObjectURL(file)
      };
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const filePath = `thumbnails/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('course-roadmaps')
        .upload(filePath, file, {
          cacheControl: '86400',
          upsert: true
        });

      if (error) {
        console.warn('[SkillNova Storage] uploadCourseThumbnail note:', error.message);
        return { success: false, error: error.message };
      }

      const { data: publicData } = supabase.storage
        .from('course-roadmaps')
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: publicData.publicUrl
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Upload failed' };
    }
  },

  /**
   * Upload a user avatar image to the public 'user-avatars' bucket.
   */
  async uploadUserAvatar(file: File, userId: string): Promise<UploadResult> {
    if (!isLiveSupabaseConfigured) {
      return {
        success: true,
        path: `local/avatars/${userId}`,
        url: URL.createObjectURL(file)
      };
    }

    try {
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${userId}.${ext}`;

      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '86400',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: publicData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: publicData.publicUrl
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Upload failed' };
    }
  }
};
