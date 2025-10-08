"use client"

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Upload, 
  X, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Film,
  FileVideo,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

// ImageKit upload response interface
interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size: number;
  filePath: string;
  tags?: string[];
  isPrivateFile?: boolean;
  customCoordinates?: string;
  fileType: string;
  AITags?: Array<{
    name: string;
    confidence: number;
    source: string;
  }>;
  versionInfo?: {
    id: string;
    name: string;
  };
  embeddedMetadata?: Record<string, any>;
  customMetadata?: Record<string, any>;
  extensionStatus?: Record<string, any>;
}

interface FileUploadProps {
  onSuccess?: (response: ImageKitUploadResponse) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
  onClose?: () => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onSuccess, 
  onProgress, 
  fileType = "video",
  onClose 
}) => {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // Navigate to home
  const handleGoHome = () => {
    router.push('/dashboard');
  };

  // File validation
  const validateFile = (file: File): boolean => {
    setUploadState(prev => ({ ...prev, error: null }));
    
    if (fileType === "video") {
      const validTypes = ["video/mp4", "video/avi", "video/mov", "video/mkv", "video/webm"];
      if (!validTypes.includes(file.type)) {
        setUploadState(prev => ({ 
          ...prev, 
          error: `Invalid file type. Please upload: ${validTypes.map(t => t.split('/')[1]).join(', ')}` 
        }));
        return false;
      }
      
      const maxSizeInMB = 100;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setUploadState(prev => ({ 
          ...prev, 
          error: `File size exceeds ${maxSizeInMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB` 
        }));
        return false;
      }
    }
    
    return true;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's a video file (since we accept all files now)
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime'];
    const isVideo = videoTypes.includes(file.type) || 
                   file.name.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/);
    
    if (!isVideo) {
      setUploadState(prev => ({ 
        ...prev, 
        error: "Please select a video file (MP4, MOV, AVI, WebM, MKV)" 
      }));
      return;
    }
    
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadState(prev => ({ ...prev, success: false }));
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setUploadState({ isUploading: false, progress: 0, error: null, success: false });
  };

  // Handle upload
  const handleUpload = async () => {
    // Check if user is authenticated
    if (status === 'loading') {
      setUploadState(prev => ({ 
        ...prev, 
        error: "Loading session, please wait..." 
      }));
      return;
    }

    if (status === 'unauthenticated' || !session) {
      setUploadState(prev => ({ 
        ...prev, 
        error: "You must be logged in to upload videos" 
      }));
      return;
    }

    if (!selectedFile || !title.trim()) {
      setUploadState(prev => ({ 
        ...prev, 
        error: "Please select a file and enter a title" 
      }));
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      progress: 0, 
      error: null 
    }));

    try {
      // Get ImageKit auth
      const authRes = await fetch('/api/imagekit-auth');
      if (!authRes.ok) {
        throw new Error('Failed to get upload authentication');
      }
      const authData = await authRes.json();
      console.log(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY)

      console.log(authData)

      // Upload file
      const uploadResult = await upload({
        expire: authData.authParams.expire,
        token: authData.authParams.token,
        signature: authData.authParams.signature,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
        file: selectedFile,
        fileName: `${Date.now()}-${selectedFile.name}`,
        folder: "/scrollit-videos/",
        onProgress: (event) => {
          const progressPercentage = (event.loaded / event.total) * 100;
          setUploadState(prev => ({ ...prev, progress: progressPercentage }));
          onProgress?.(progressPercentage);
        },
      });

      // Save video data to backend
      console.log('Session status:', status);
      console.log('Session data:', session);
      
      const videoData = {
        videoUrl: uploadResult.url,
        title: title.trim(),
        description: description.trim() || "",
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url, // ImageKit can generate thumbnails
        transform: {
          width: 1920,
          height: 1080,
          quality: 80
        }
      };

      console.log('Sending video data:', videoData);

      const backendRes = await fetch('/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      });
      
      console.log('Backend response status:', backendRes.status);
      console.log('Backend response:', backendRes);

      if (!backendRes.ok) {
        const errorData = await backendRes.json();
        console.log('Error response data:', errorData);
        throw new Error(`Failed to save video to database: ${errorData.error || 'Unknown error'}`);
      }

      const savedVideo = await backendRes.json();

      // Success
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        success: true, 
        progress: 100 
      }));
      
      onSuccess?.(savedVideo);
      
      // Auto close after success
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = "Upload failed. Please try again.";
      
      if (error instanceof ImageKitInvalidRequestError) {
        errorMessage = "Invalid request. Please check your file and try again.";
      } else if (error instanceof ImageKitServerError) {
        errorMessage = "Server error. Please try again later.";
      } else if (error instanceof ImageKitUploadNetworkError) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error instanceof ImageKitAbortError) {
        errorMessage = "Upload was cancelled.";
      }
      
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: errorMessage 
      }));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-md border border-pink-500/30 rounded-3xl p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-pink-500/20 p-3 rounded-full">
              <Film className="w-6 h-6 text-pink-400" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-400">
              Upload Video
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Home Button */}
            <button 
              onClick={handleGoHome}
              className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-full hover:bg-pink-500/10 flex items-center space-x-2"
              title="Go to Home"
            >
              <Home className="w-6 h-6" />
            </button>
            
            {/* Close Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          {!selectedFile ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-gray-600 hover:border-pink-500 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 bg-gray-800/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-pink-500/20 p-4 rounded-full">
                  <Upload className="w-8 h-8 text-pink-400" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-200">Choose a video file</p>
                  <p className="text-gray-400 mt-2">MP4, AVI, MOV, MKV, WebM (Max 100MB)</p>
                </div>
                
                {/* File browse button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Multiple attempts to trigger file input
                    const input = fileInputRef.current;
                    if (input) {
                      // Reset the input
                      input.value = '';
                      
                      // Try different methods
                      setTimeout(() => {
                        input.click();
                      }, 100);
                      
                      // Fallback
                      const evt = new MouseEvent('click', {
                        bubbles: false,
                        cancelable: true,
                        view: window
                      });
                      input.dispatchEvent(evt);
                    }
                  }}
                  className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FileVideo className="w-5 h-5" />
                  Browse Files
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-2xl p-4 space-y-4"
            >
              {/* File Preview */}
              <div className="flex items-center space-x-4">
                {selectedFile.type.startsWith('video/') ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={URL.createObjectURL(selectedFile)}
                      className="w-24 h-24 object-cover rounded-xl"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-xl flex items-center justify-center">
                    <FileVideo className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="font-medium text-gray-200 truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </div>
                
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none text-white placeholder-gray-400 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={3}
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none text-white placeholder-gray-400 resize-none transition-all"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {uploadState.isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Uploading...</span>
                  <span className="text-sm text-pink-400">{Math.round(uploadState.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-pink-500 to-fuchsia-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadState.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {uploadState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{uploadState.error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {uploadState.success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-xl mb-6 flex items-center space-x-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Video uploaded successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        <motion.button
          onClick={handleUpload}
          disabled={!selectedFile || !title.trim() || uploadState.isUploading}
          whileHover={{ scale: uploadState.isUploading ? 1 : 1.02 }}
          whileTap={{ scale: uploadState.isUploading ? 1 : 0.98 }}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
            uploadState.isUploading || !selectedFile || !title.trim()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:shadow-pink-500/25'
          }`}
        >
          {uploadState.isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : uploadState.success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Uploaded!</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload Video</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FileUpload;