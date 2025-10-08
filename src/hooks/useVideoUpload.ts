import { useState } from 'react';

interface UploadVideoData {
  title: string;
  description?: string;
  file: File;
}

interface VideoUploadResponse {
  success: boolean;
  video: {
    _id: string;
    videoUrl: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface UseVideoUploadResult {
  uploadVideo: (data: UploadVideoData) => Promise<VideoUploadResponse>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export const useVideoUpload = (): UseVideoUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadVideo = async ({ title, description, file }: UploadVideoData) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Get ImageKit auth
      const authRes = await fetch('/api/imagekit-auth');
      if (!authRes.ok) {
        throw new Error('Failed to get upload authentication');
      }
      const authData = await authRes.json();

      // Step 2: Upload to ImageKit
      const { upload } = await import('@imagekit/next');
      
      const uploadResult = await upload({
        expire: authData.authParams.expire,
        token: authData.authParams.token,
        signature: authData.authParams.signature,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
        file,
        fileName: `${Date.now()}-${file.name}`,
        folder: "/scrollit-videos/",
        onProgress: (event) => {
          const progressPercentage = (event.loaded / event.total) * 100;
          setProgress(progressPercentage);
        },
      });

      // Step 3: Save to database
      const videoData = {
        videoUrl: uploadResult.url,
        title: title.trim(),
        description: description?.trim() || "",
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
        transform: {
          width: 1920,
          height: 1080,
          quality: 80
        }
      };

      const backendRes = await fetch('/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      });

      if (!backendRes.ok) {
        throw new Error('Failed to save video to database');
      }

      const savedVideo = await backendRes.json();
      
      setSuccess(true);
      setProgress(100);
      
      return savedVideo;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadVideo,
    isUploading,
    progress,
    error,
    success
  };
};