"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Button from "@/components/Button";
import { LinkIcon, SparklesIcon, PlayIcon, CloseIcon } from "@/components/Icons";
import { createBrowserClient } from "@supabase/ssr";
import AppLayout from "@/components/AppLayout";

interface Dream {
  id: string;
  transcript: string;
  video_url?: string;
  story_content?: string;
  created_at: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Fetch dream data
  useEffect(() => {
    const fetchDream = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );

        const { data, error: fetchError } = await supabase
          .from("dreams")
          .select(`
            id,
            transcript,
            created_at,
            story_nodes (
              video_url,
              content
            )
          `)
          .eq("id", token)
          .single();

        if (fetchError) {
          setError("Dream not found or has been deleted");
          setLoading(false);
          return;
        }

        if (data) {
          const dreamData: Dream = {
            id: data.id,
            transcript: data.transcript,
            created_at: data.created_at,
            video_url: data.story_nodes?.[0]?.video_url || undefined,
            story_content: data.story_nodes?.[0]?.content || undefined,
          };
          setDream(dreamData);
        }
      } catch (err) {
        setError("Failed to load dream");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDream();
    }
  }, [token]);

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = "/";
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
    }
  };

  const handlePlayVideo = async () => {
    if (!videoRef.current) return;
    try {
      if (videoContainerRef.current) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
        setShowFullscreenControls(true);
      }
      setIsPlaying(true);
      videoRef.current.play();
    } catch (error) {
      // Fullscreen not available, just play
      setIsPlaying(true);
      videoRef.current?.play();
    }
  };

  const exitFullscreen = () => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
    setShowFullscreenControls(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleFullscreenInteraction = () => {
    if (!isFullscreen) return;
    setShowFullscreenControls(true);
    // Hide controls after 3 seconds of no interaction
    const timer = setTimeout(() => {
      setShowFullscreenControls(false);
    }, 3000);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-6 relative z-10 w-full max-w-full overflow-x-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-electric-cyan border-t-transparent rounded-full"
        />
      </main>
    );
  }

  if (error || !dream) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-6 relative z-10 w-full max-w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center px-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 font-[family-name:var(--font-space-grotesk)] text-white">
            Dream Not Found
          </h1>
          <p className="text-base sm:text-lg text-white/60 mb-6 sm:mb-8">
            {error || "This dream doesn't exist or has been deleted"}
          </p>
          <Button 
            onClick={handleGoHome} 
            variant="primary" 
            icon={<SparklesIcon className="w-5 h-5" />}
          >
            Create Your Own Dream
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <AppLayout>
      <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-6 pt-16 sm:pt-20 w-full max-w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl px-2 sm:px-0"
        >
          {/* Clean header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 font-[family-name:var(--font-space-grotesk)] text-white">
              ThoughtFull Dreams
            </h1>
            <p className="text-base sm:text-lg text-white/60">
              Someone shared their dream with you
            </p>
          </div>

          {/* Main card */}
          <motion.div
            className="glass-frosted rounded-2xl sm:rounded-3xl shadow-glass p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Video player */}
            <motion.div
              ref={videoContainerRef}
              className={`relative group mb-4 sm:mb-6 ${isFullscreen ? 'flex items-center justify-center bg-black' : ''}`}
              onClick={handleFullscreenInteraction}
            >
              <div className={`glass-frosted overflow-hidden shadow-glass relative ${isFullscreen ? 'w-full h-full' : 'rounded-3xl aspect-video'}`}>
                {/* Gradient background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 via-electric-blue/10 to-electric-cyan/10"
                  animate={{ 
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                  }}
                />

                {/* Video Element */}
                {dream.video_url ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src={dream.video_url}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    muted
                    loop
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-electric-purple/20 to-electric-cyan/20">
                    <div className="text-center p-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4"
                      >
                        <SparklesIcon className="w-full h-full text-white/60" />
                      </motion.div>
                      <p className="text-white/80 font-medium">Generating your dream video...</p>
                    </div>
                  </div>
                )}

                {/* Play button overlay - only show when not playing and video is ready */}
                {!isPlaying && dream.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <motion.div
                      onClick={handlePlayVideo}
                      className="glass-frosted w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-glow cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                      <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                    </motion.div>
                  </div>
                )}

                {/* Fullscreen Controls - Show on interaction */}
                <AnimatePresence>
                  {isFullscreen && showFullscreenControls && (
                    <>
                      {/* Close Button - Top Right */}
                      <motion.button
                        aria-label="Exit fullscreen"
                        className="absolute top-6 right-6 z-40 glass-frosted rounded-xl p-3 hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          exitFullscreen();
                        }}
                      >
                        <CloseIcon className="w-6 h-6 text-white" />
                      </motion.button>

                      {/* Create Another Dream Button at bottom */}
                      <motion.div
                        className="absolute bottom-8 left-0 right-0 z-30 px-4 sm:px-8 pointer-events-none"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative max-w-md mx-auto pointer-events-auto">
                          {/* Glow background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-cyan rounded-2xl blur-xl opacity-50"
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              exitFullscreen();
                              handleGoHome();
                            }}
                            className="relative w-full py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-cyan text-white shadow-2xl flex items-center justify-center gap-3"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            Create Your Own Dream
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            {/* Dream Info */}
            <div className="glass rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-glass">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-semibold">
                Dream Description
              </p>
              <p className="text-sm text-white/80 line-clamp-3 mb-2 sm:mb-3">
                {dream.transcript || "No transcript available"}
              </p>
              <p className="text-xs text-white/50">
                Created: {new Date(dream.created_at).toLocaleDateString()}
              </p>
            </div>
            
            {/* Actions */}
            <div className="space-y-2 sm:space-y-3">
              <Button 
                onClick={handleGoHome} 
                variant="primary" 
                fullWidth
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                Create Your Own Dream
              </Button>
              
              <Button 
                onClick={handleCopyLink} 
                variant="secondary" 
                fullWidth
                icon={<LinkIcon className="w-5 h-5" />}
              >
                Copy Share Link
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </AppLayout>
  );
}
