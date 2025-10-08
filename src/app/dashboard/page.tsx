"use client"
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share, Upload, Home, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Video } from '@imagekit/next';
import { apiClient, VideoType } from '@/utils/api-client';
import { signOut } from 'next-auth/react';

export default function FeedPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [direction, setDirection] = useState(0);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false); // Track if user has unmuted
  const [showSoundHint, setShowSoundHint] = useState(true); // Show sound hint initially
  const [currentVideoMuted, setCurrentVideoMuted] = useState(true); // Track current video mute state
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent rapid transitions
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartY = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const lastSwipeTime = useRef<number>(0); // Debounce swipe gestures
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  // Fetch videos on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getVideos();
        setVideos(response.videos);
        setError(null);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };



    fetchVideos();
  }, []);
// console.log(videos)
  useEffect(() => {
    console.log("Current Index:", currentIndex);
    
    // Force stop ALL videos first
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      }
    });
    
    
    // Then start only the current video
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.muted = hasUnmutedOnce ? false : true;
      setCurrentVideoMuted(currentVideo.muted);
      
      // Small delay to ensure other videos are stopped
      setTimeout(() => {
        currentVideo.play().catch(() => {});
      }, 50);
    }
    
    // Reset transition state after animation completes
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex, hasUnmutedOnce]);

  // Cleanup effect to stop all videos when component unmounts
  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
          video.muted = true;
          video.currentTime = 0;
        }
      });
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRefs.current[currentIndex];
      if (video && video.duration > 0) {
        setProgress(video.currentTime / video.duration);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleVideoClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap - like animation
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 800);
    }
    // Removed single tap pause logic - videos will always auto play
    lastTap.current = now;
  };

  const toggleMute = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo) return;

    if (currentVideo.muted) {
      currentVideo.muted = false;
      setHasUnmutedOnce(true);
      setShowSoundHint(false);
      setCurrentVideoMuted(false);
    } else {
      currentVideo.muted = true;
      setCurrentVideoMuted(true);
      // Don't reset hasUnmutedOnce - user preference persists
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const goNext = () => {
    if (isTransitioning || videos.length === 0) return;
    setIsTransitioning(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const goPrev = () => {
    if (isTransitioning || videos.length === 0) return;
    setIsTransitioning(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isTransitioning) return;
    
    const now = Date.now();
    if (now - lastSwipeTime.current < 300) return; // Debounce
    
    lastSwipeTime.current = now;
    
    if (e.deltaY > 0) goNext();
    else if (e.deltaY < 0) goPrev();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isTransitioning) return;
    
    const now = Date.now();
    if (now - lastSwipeTime.current < 300) return; // Debounce
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Increase threshold for more intentional swipes
    if (Math.abs(diff) > 80) {
      lastSwipeTime.current = now;
      if (diff > 0) goNext();
      else goPrev();
    }
    
    touchStartY.current = null;
  };

  const variants = {
    enter: (dir: number) => ({ 
      y: dir > 0 ? 100 : -100, 
      opacity: 0,
      scale: 0.95
    }),
    center: { 
      y: 0, 
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({ 
      y: dir > 0 ? -100 : 100, 
      opacity: 0,
      scale: 0.95
    }),
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No videos state
  if (videos.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">No videos found</p>
          <button 
            onClick={() => router.push('/upload')} 
            className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Upload First Video
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Main video container with swipe handlers */}
      <div
        className="w-full h-screen flex flex-col items-center justify-center overflow-hidden relative"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render all videos but only show current one */}
        {videos.map((video, idx) => (
          <div
            key={video._id || idx}
            className={`absolute w-full h-full flex items-center justify-center ${
              idx === currentIndex ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
            }`}
          >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {idx === currentIndex && (
              <motion.div
                key={`${video._id || idx}-${currentIndex}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="relative w-full md:max-w-md h-full flex flex-col justify-between">
                  {/* ImageKit Video Component */}
                  <Video
                    ref={(el: HTMLVideoElement | null) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={video.videoUrl}
                    className="w-full h-full object-cover md:rounded-3xl shadow-lg cursor-pointer"
                    loop
                    muted={!hasUnmutedOnce}
                    autoPlay={false}
                    onClick={handleVideoClick}
                    transformation={[
                      {
                        width:1080,
                      height: 1920,
                      quality:80,
                    }
                  ]}
                />

                {/* Subtle gradient overlay for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none md:rounded-b-3xl"></div>

                {/* Bottom overlay info - Simple TikTok style */}
                <div className="absolute bottom-20 left-4 right-16">
                  <h3 className="text-white text-base font-semibold mb-1 leading-snug"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {video.title}
                  </h3>
                  <p className="text-white text-sm opacity-90"
                     style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    @{typeof video.userId === 'object' && 'username' in video.userId ? (video.userId as { username: string }).username : (typeof video.userId === 'string' ? video.userId : 'unknown')}
                  </p>
                </div>

                {/* Progress bar at top of video container */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="w-full h-0.5 bg-black/40 rounded-full">
                    <div className="h-0.5 bg-white rounded-full transition-all duration-100 shadow-sm" style={{ width: `${progress * 100}%` }}></div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="absolute right-3 bottom-20 flex flex-col space-y-5">
                  <button className="flex flex-col items-center text-white transition-transform transform hover:scale-110">
                    <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm border border-white/20">
                      <Heart className="w-6 h-6" />
                    </div>
                    <span className="text-xs mt-1 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>123</span>
                  </button>
                  <button className="flex flex-col items-center text-white transition-transform transform hover:scale-110">
                    <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm border border-white/20">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="text-xs mt-1 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>45</span>
                  </button>
                  <button className="flex flex-col items-center text-white transition-transform transform hover:scale-110">
                    <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm border border-white/20">
                      <Share className="w-6 h-6" />
                    </div>
                    <span className="text-xs mt-1 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Share</span>
                  </button>
                  <button
                    onClick={toggleMute}
                    className="flex flex-col items-center text-white transition-transform transform hover:scale-110"
                  >
                    <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm border border-white/20">
                      {currentVideoMuted ? (
                        <VolumeX className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs mt-1 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>Sound</span>
                  </button>
                </div>

                {/* Double-tap heart animation */}
                {likeAnim && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0, opacity: 1 }}
                    animate={{ scale: 1.5, rotate: 15, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center text-pink-500 text-6xl pointer-events-none"
                  >
                    ❤️
                  </motion.div>
                )}

                {/* Sound hint for first-time users */}
                {showSoundHint && !hasUnmutedOnce && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                               bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Tap the sound button to unmute</span>
                  </motion.div>
                )}

                {/* Videos auto play - no pause overlay needed */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      </div>

      {/* Bottom navigation - Outside swipe container */}
      <div className="absolute bottom-0 w-full flex justify-center items-center space-x-20 bg-black/95 md:bg-black/90 md:backdrop-blur-sm md:rounded-t-3xl md:mx-4 md:mb-4 p-4 md:p-3 z-50 safe-area-inset-bottom">
        <button className="text-white hover:text-pink-500 transition p-2">
          <Home className="w-7 h-7 md:w-8 md:h-8" />
        </button>
        <button className="text-white hover:text-pink-500 transition p-2" onClick={()=> router.push('/upload')}>
          <Upload className="w-7 h-7 md:w-8 md:h-8" />
        </button>
        <button 
          className="text-white hover:text-red-500 transition-colors p-2" 
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="w-7 h-7 md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
}