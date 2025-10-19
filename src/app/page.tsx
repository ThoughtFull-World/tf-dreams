"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Recorder from "@/components/Recorder";
import ProgressSteps from "@/components/ProgressSteps";
import Button from "@/components/Button";
import { SparklesIcon, LinkIcon, RefreshIcon, InstagramIcon, TikTokIcon, FullscreenIcon, PlayIcon, CloseIcon } from "@/components/Icons";
import { processDream, generateVideo, pollForVideo, getRandomVideo } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Step = "record" | "generating" | "complete";
type PipelineStep = "transcribe" | "story" | "video" | "ready";

export default function HomePage() {
  const [step, setStep] = useState<Step>("record");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [dreamId, setDreamId] = useState<string | null>(null);
  const [storyNodeId, setStoryNodeId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [story, setStory] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);
  const [currentPipelineStep, setCurrentPipelineStep] = useState<PipelineStep>("transcribe");
  const [showRetry, setShowRetry] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMemoryTip, setShowMemoryTip] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [wordChunkIndex, setWordChunkIndex] = useState(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { isAuthenticated, isLoading, signInAnonymously } = useAuth();

  // Cycle through word chunks for long transcripts
  useEffect(() => {
    if (step === "generating" && transcript) {
      const words = transcript.split(' ');
      const chunkSize = 15;
      const totalChunks = Math.ceil(words.length / chunkSize);
      
      // Only cycle if there are multiple chunks
      if (totalChunks > 1) {
        const interval = setInterval(() => {
          setWordChunkIndex((prev) => (prev + 1) % totalChunks);
        }, 5000); // Change every 5 seconds
        
        return () => clearInterval(interval);
      }
    }
  }, [step, transcript]);

  // Fetch random background video on mount
  useEffect(() => {
    const fetchBackgroundVideo = async () => {
      try {
        const randomVideoUrl = await getRandomVideo();
        if (randomVideoUrl) {
          setBackgroundVideoUrl(randomVideoUrl);
        }
      } catch (error) {
        console.error("Error fetching background video:", error);
      }
    };

    fetchBackgroundVideo();
  }, []);

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    setWordChunkIndex(0); // Reset word chunk index for new recording
    setIsRecording(false); // Reset recording state
    
    // Ensure user is authenticated (anonymously if needed)
    if (!isAuthenticated) {
      try {
        await signInAnonymously();
      } catch (error) {
        console.error("Failed to authenticate:", error);
        setShowRetry(true);
        alert("Failed to authenticate. Please try again.");
        return;
      }
    }
    
    // Immediately transition to generation
    startGeneration(blob);
  };

  const startGeneration = async (blob: Blob) => {
    try {
      setStep("generating");
      setShowRetry(false);
      
      // Step 1: Transcribe audio & generate story
      setCurrentPipelineStep("transcribe");
      
      // Call process-dream API (transcription + story generation)
      const result = await processDream(blob);
      
      setDreamId(result.dreamId);
      setStoryNodeId(result.storyNodeId);
      setTranscript(result.transcript);
      setStory(result.story);
      
      // Step 2: Story generation (already done in processDream)
      setCurrentPipelineStep("story");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Explicitly trigger video generation from UI
      setCurrentPipelineStep("video");
      
      // Trigger video generation
      await generateVideo(result.storyNodeId);
      
      // Poll for video completion
      const video = await pollForVideo(result.storyNodeId);
      
      if (video) {
        setVideoUrl(video);
      }
      
      // Step 4: Complete
      setCurrentPipelineStep("ready");
      setShareToken(result.dreamId);
      setStep("complete");
      
    } catch (error) {
      console.error("Dream generation failed:", error);
      setShowRetry(true);
      alert("Failed to generate dream. Please try again.");
    }
  };

  const handleRetry = () => {
    setStep("record");
    setAudioBlob(null);
    setDreamId(null);
    setStoryNodeId(null);
    setShareToken(null);
    setTranscript("");
    setStory("");
    setVideoUrl(null);
    setCurrentPipelineStep("transcribe");
    setShowRetry(false);
    setIsRecording(false); // Reset recording state for retry
  };

  const handleCopyLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const handleInstagramShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    const shareText = `Check out my dream video created with ThoughtFull Dreams!\n\n${shareUrl}`;
    
    // Try native Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ThoughtFull Dreams",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // User cancelled, continue to fallback
      }
    }

    // Fallback: Copy just the URL to clipboard and open Instagram
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      window.open("https://www.instagram.com/", "_blank");
    }
  };

  const handleTikTokShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    const shareText = `Check out my dream video created with ThoughtFull Dreams!\n${shareUrl}`;
    
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ThoughtFull Dreams",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // User cancelled, continue to fallback
      }
    }

    // Fallback: Copy just the URL to clipboard and open TikTok
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      window.open("https://www.tiktok.com/", "_blank");
    }
  };

  const handlePlayVideo = async () => {
    if (!videoContainerRef.current) return;

    try {
      await videoContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
      setIsPlaying(true);
      setShowFullscreenControls(false);
      // Play the video
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error("Play failed:", err));
      }
    } catch (error) {
      console.error("Could not enter fullscreen:", error);
      // Fallback: just play without fullscreen
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error("Play failed:", err));
      }
    }
  };

  const handleFullscreenInteraction = () => {
    if (!isFullscreen) return;
    
    // Toggle controls visibility
    setShowFullscreenControls(prev => !prev);
  };

  const exitFullscreen = () => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
    setIsPlaying(false);
    setShowFullscreenControls(false);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setIsPlaying(false);
        setShowFullscreenControls(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <main className="flex h-screen flex-col items-center justify-center p-3 sm:p-4 md:p-6 relative z-10 overflow-y-auto overflow-x-hidden w-full max-w-full">
      {/* Background Video - Only on record step */}
      {step === "record" && (
        <>
          {/* Background Video - Fullscreen with Random Dream Video */}
          {backgroundVideoUrl ? (
            <video
              key={backgroundVideoUrl}
              className="fixed inset-0 w-full h-full object-cover -z-10"
              src={backgroundVideoUrl}
              autoPlay
              muted
              loop
            />
          ) : (
            <div className="fixed inset-0 w-full h-full -z-10 bg-gradient-to-br from-electric-purple/30 via-electric-magenta/30 to-electric-cyan/30 animate-pulse" />
          )}
          
          {/* Dark Overlay - Multiple layers for readability */}
          <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 -z-10" />
          <div className="fixed inset-0 bg-black/25 -z-10 backdrop-blur-sm" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-full ${step === "complete" ? "md:max-w-4xl" : "md:max-w-lg"} transition-all duration-500 px-2 sm:px-0`}
      >
        {/* Header - consistent size */}
        <motion.div 
          className="text-center mb-4 sm:mb-6 md:mb-10"
          animate={{ 
            y: step === "complete" ? -10 : 0,
          }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-3 font-[family-name:var(--font-space-grotesk)] text-white px-2">
            ThoughtFull Dreams
          </h1>
          <AnimatePresence mode="wait">
            <motion.p 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-base sm:text-lg text-white/60 font-medium px-2"
            >
              {step === "record" && "Record your dream to begin"}
              {step === "generating" && "Creating your dream video..."}
              {step === "complete" && "Share your dream with the world"}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* RECORD & GENERATING STEPS */}
          {(step === "record" || step === "generating") && (
            <motion.div
              key="before-complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-frosted rounded-3xl shadow-glass p-8 relative"
            >
              {step === "record" && (
                <>
                  <Recorder 
                    onRecordingComplete={handleRecordingComplete}
                    showQuickActions={showRetry}
                    onRetry={handleRetry}
                    onRecordingStart={() => setIsRecording(true)}
                  />
                  
                  {/* Memory Tip - Collapsible - Hidden during recording */}
                  {!isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mt-6"
                    >
                      <AnimatePresence mode="wait">
                        {!showMemoryTip ? (
                          <motion.button
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMemoryTip(true)}
                            className="w-full glass rounded-2xl p-3 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group"
                          >
                            <span className="text-xl">💡</span>
                            <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors font-medium">
                              Tip: How memory works
                            </span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass rounded-2xl p-5 sm:p-6 border border-white/10 overflow-hidden"
                          >
                            <div className="flex items-start gap-4">
                              <span className="text-3xl sm:text-4xl flex-shrink-0 mt-1">💡</span>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                                  Your Dreams Remember
                                </h3>
                                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                                  Each dream continues your story. Starting fresh? Just say 
                                  <span className="text-electric-cyan font-semibold"> "this is a new dream"</span>.
                                </p>
                              </div>
                              <button
                                onClick={() => setShowMemoryTip(false)}
                                className="text-white/50 hover:text-white/90 transition-colors text-2xl leading-none flex-shrink-0 -mt-1"
                                aria-label="Close tip"
                              >
                                ×
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              )}

              {step === "generating" && (
                <div className="py-4">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <motion.div
                        className="inline-block"
                        animate={{
                          rotate: 360,
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        }}
                      >
                        <SparklesIcon className="w-14 h-14 text-electric-purple" />
                      </motion.div>
                    </div>
                    <motion.h2 
                      className="text-2xl sm:text-3xl font-bold text-white mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Crafting Your Dream
                    </motion.h2>
                    <motion.p 
                      className="text-white/70 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Weaving your words into magic...
                    </motion.p>
                  </div>

                  {/* Animated Words from Transcript */}
                  {transcript && (() => {
                    const words = transcript.split(' ');
                    const chunkSize = 15;
                    const startIndex = wordChunkIndex * chunkSize;
                    const currentChunk = words.slice(startIndex, startIndex + chunkSize);
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative h-40 sm:h-48 mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-electric-purple/10 via-electric-magenta/10 to-electric-cyan/10 border border-white/10"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={wordChunkIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6"
                          >
                            {currentChunk.map((word, index) => {
                              const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
                              const colors = ['text-electric-purple', 'text-electric-cyan', 'text-electric-magenta', 'text-white', 'text-white', 'text-white/90'];
                              const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
                              const randomColor = colors[Math.floor(Math.random() * colors.length)];
                              const delay = index * 0.08;
                              const isHighlight = randomColor.includes('white');
                              
                              return (
                                <motion.span
                                  key={`${wordChunkIndex}-${index}`}
                                  className={`${randomSize} ${randomColor} font-bold ${isHighlight ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-80'}`}
                                  initial={{ opacity: 0, scale: 0, rotate: -10 }}
                                  animate={{ 
                                    opacity: isHighlight ? [0, 1, 1, 0.9, 1] : [0, 1, 0.8, 1, 0.6, 1],
                                    scale: isHighlight ? [0, 1.3, 1.1, 1.2, 1.1] : [0, 1.2, 1, 1.1, 1],
                                    rotate: [-10, 5, 0, -5, 0]
                                  }}
                                  transition={{
                                    duration: 3,
                                    delay: delay,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: "easeInOut"
                                  }}
                                >
                                  {word}
                                </motion.span>
                              );
                            })}
                          </motion.div>
                        </AnimatePresence>
                        
                        {/* Glow overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-electric-purple/20 via-transparent to-electric-cyan/20 pointer-events-none"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    );
                  })()}
                  
                  <ProgressSteps currentStep={currentPipelineStep} />

                  {/* Accessible status for screen readers */}
                  <p aria-live="polite" aria-atomic="true" className="sr-only">
                    {`Processing: ${currentPipelineStep}. Please wait while we create your dream video.`}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* COMPLETE STEP - Video Hero Layout */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Large Video Player - Hero Element */}
              <motion.div
                ref={videoContainerRef}
                className={`relative group ${isFullscreen ? 'flex items-center justify-center bg-black' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleFullscreenInteraction}
              >
                {/* Video container with glass effect */}
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
                  {videoUrl ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={videoUrl}
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
                        <p className="text-white/40 text-sm mt-2">This may take a minute</p>
                      </div>
                    </div>
                  )}

                  {/* Play button overlay - only show when not playing and video is ready */}
                  {!isPlaying && videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <motion.div
                        onClick={handlePlayVideo}
                        className="glass-frosted w-20 h-20 rounded-full flex items-center justify-center shadow-glow cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      >
                        <PlayIcon className="w-10 h-10 text-white ml-1" />
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

                        {/* Share buttons in center */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex gap-4 pointer-events-auto">
                            <motion.button
                              aria-label="Share to Instagram"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInstagramShare();
                              }}
                              className="glass-frosted rounded-2xl p-4 hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <InstagramIcon className="w-8 h-8 text-white" />
                            </motion.button>

                            <motion.button
                              aria-label="Share to TikTok"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTikTokShare();
                              }}
                              className="glass-frosted rounded-2xl p-4 hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <TikTokIcon className="w-8 h-8 text-white" />
                            </motion.button>

                            <motion.button
                              aria-label="Copy share link"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink();
                              }}
                              className="glass-frosted rounded-2xl p-4 hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <LinkIcon className="w-8 h-8 text-white" />
                            </motion.button>
                          </div>
                        </motion.div>

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
                                handleRetry();
                              }}
                              className="relative w-full py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-cyan text-white shadow-2xl flex items-center justify-center gap-3"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <SparklesIcon className="w-6 h-6" />
                              Create Another Dream
                              ✨
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Share Options - Glass Icon Buttons - Hide in fullscreen */}
              {!isFullscreen && (
                <motion.div
                  className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                {/* Instagram */}
                <motion.button
                  aria-label="Share to Instagram"
                  onClick={handleInstagramShare}
                  className="glass-frosted rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share to Instagram"
                >
                  <InstagramIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.button>

                {/* TikTok */}
                <motion.button
                  aria-label="Share to TikTok"
                  onClick={handleTikTokShare}
                  className="glass-frosted rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share to TikTok"
                >
                  <TikTokIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.button>

                {/* Copy Link */}
                <motion.button
                  aria-label="Copy share link"
                  onClick={handleCopyLink}
                  className="glass-frosted rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy Link"
                >
                  <LinkIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.button>
              </motion.div>
              )}

              {/* Create Another Button - Stunning Design - Hide in fullscreen */}
              {!isFullscreen && (
                <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="relative"
              >
                {/* Glow background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-cyan rounded-xl sm:rounded-2xl blur-xl opacity-50"
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
                  onClick={handleRetry}
                  className="relative w-full py-3 px-6 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-cyan text-white shadow-2xl flex items-center justify-center gap-2 sm:gap-3"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.div>
                  <span className="hidden sm:inline">Create Another Dream</span>
                  <span className="sm:hidden">New Dream</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
              
                  </motion.div>
                </motion.button>
              </motion.div>
              )}

              {/* Authentication Prompt - Show if not authenticated */}
              {!isFullscreen && !isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    Save Your Dream ✨
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 mb-3 sm:mb-4">
                    Sign in or create an account to save and access all your recorded dreams from anywhere.
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 mb-3 sm:mb-4">
                    Build your personal dream library and revisit your creative moments anytime.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // Focus on the account button to trigger auth dialog
                        const accountButton = document.querySelector('[aria-label*="Sign in"]') as HTMLButtonElement;
                        accountButton?.click();
                      }}
                    >
                      Sign In Now
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
