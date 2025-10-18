"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Recorder from "@/components/Recorder";
import ProgressSteps from "@/components/ProgressSteps";
import Button from "@/components/Button";
import { SparklesIcon, LinkIcon, RefreshIcon, InstagramIcon, TikTokIcon, FullscreenIcon, PlayIcon, CloseIcon } from "@/components/Icons";
import { processDream, generateVideo, pollForVideo } from "@/lib/api";
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
  const [currentPipelineStep, setCurrentPipelineStep] = useState<PipelineStep>("transcribe");
  const [showRetry, setShowRetry] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { isAuthenticated, isLoading, signInAnonymously } = useAuth();

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    
    // Ensure user is authenticated (anonymously if needed)
    if (!isAuthenticated) {
      try {
        console.log("🔐 Signing in anonymously...");
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
      console.log("🎤 Starting transcription...");
      setCurrentPipelineStep("transcribe");
      
      // Call process-dream API (transcription + story generation)
      const result = await processDream(blob);
      
      setDreamId(result.dreamId);
      setStoryNodeId(result.storyNodeId);
      setTranscript(result.transcript);
      setStory(result.story);
      
      console.log("📝 Transcription complete:", result.transcript);
      
      // Step 2: Story generation (already done in processDream)
      console.log("✨ Story generation complete");
      setCurrentPipelineStep("story");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Explicitly trigger video generation from UI
      console.log("🎥 Triggering video generation from UI...");
      setCurrentPipelineStep("video");
      
      // Trigger video generation
      await generateVideo(result.storyNodeId);
      console.log("✅ Video generation request sent");
      
      // Poll for video completion
      const video = await pollForVideo(result.storyNodeId, (secondsElapsed) => {
        console.log(`⏳ Waiting for video... ${secondsElapsed}s elapsed`);
      });
      
      if (video) {
        setVideoUrl(video);
        console.log("✅ Video ready:", video);
      } else {
        console.warn("⚠️ Video generation timeout or failed");
      }
      
      // Step 4: Complete
      setCurrentPipelineStep("ready");
      setShareToken(result.dreamId);
      setStep("complete");
      
    } catch (error) {
      console.error("❌ Dream generation failed:", error);
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
  };

  const handleCopyLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const handleInstagramShare = () => {
    // In production, this would use Instagram's sharing API or deep link
    alert("Instagram sharing would open here. In production, this uses Instagram's sharing API.");
  };

  const handleTikTokShare = () => {
    // In production, this would use TikTok's sharing API or deep link
    alert("TikTok sharing would open here. In production, this uses TikTok's sharing API.");
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
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
    setIsPlaying(false);
    setShowFullscreenControls(false);
  };

  // Listen for fullscreen changes
  useEffect(() => {
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
    <main className="flex h-screen flex-col items-center justify-center p-4 md:p-6 relative z-10 overflow-hidden">
      {/* Background Video - Only on record step */}
      {step === "record" && (
        <>
          {/* Background Video - Fullscreen */}
          <video
            className="fixed inset-0 w-full h-full object-cover -z-10"
            src="https://dreams.thoughtfull.world/videos/81c771d6-e4c4-4ffe-882e-d113a00480d3/ecfee84f-e6a4-495f-9fde-62bab741f8f9/c778cf59-c8ad-4c7a-935d-94185f6ebebb.mp4"
            autoPlay
            muted
            loop
          />
          
          {/* Dark Overlay - Multiple layers for readability */}
          <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 -z-10" />
          <div className="fixed inset-0 bg-black/25 -z-10 backdrop-blur-sm" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full ${step === "complete" ? "max-w-4xl" : "max-w-lg"} transition-all duration-500`}
      >
        {/* Header - consistent size */}
        <motion.div 
          className="text-center mb-6 md:mb-10"
          animate={{ 
            y: step === "complete" ? -10 : 0,
          }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-3 font-[family-name:var(--font-space-grotesk)] text-white">
            ThoughtFull Dreams
          </h1>
          <AnimatePresence mode="wait">
            <motion.p 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg text-white/60 font-medium"
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
                <Recorder 
                  onRecordingComplete={handleRecordingComplete}
                  showQuickActions={showRetry}
                  onRetry={handleRetry}
                />
              )}

              {step === "generating" && (
                <div className="py-4">
                  <div className="text-center mb-6">
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
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mb-3"
                    >
                      <p className="text-lg font-semibold text-electric-cyan mb-1">
                        Recording captured!
                      </p>
                    </motion.div>
                    <motion.h2 
                      className="text-2xl font-bold text-white mb-2"
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
                      This will only take a moment
                    </motion.p>
                  </div>
                  
                  <ProgressSteps currentStep={currentPipelineStep} />

                  {/* Accessible status for screen readers */}
                  <p aria-live="polite" aria-atomic="true" className="sr-only">
                    {`Processing: ${currentPipelineStep}. Please wait while we create your dream video.`}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-6 text-center"
                  >
                    <button
                      onClick={handleRetry}
                      className="text-sm text-white/60 hover:text-white/80 transition-colors inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 rounded px-2 py-1"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      Start over
                    </button>
                  </motion.div>
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
                          className="absolute bottom-8 left-0 right-0 z-30 px-8 pointer-events-none"
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
                  className="flex justify-center gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                {/* Instagram */}
                <motion.button
                  aria-label="Share to Instagram"
                  onClick={handleInstagramShare}
                  className="glass-frosted rounded-2xl p-4 hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share to Instagram"
                >
                  <InstagramIcon className="w-8 h-8 text-white" />
                </motion.button>

                {/* TikTok */}
                <motion.button
                  aria-label="Share to TikTok"
                  onClick={handleTikTokShare}
                  className="glass-frosted rounded-2xl p-4 hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share to TikTok"
                >
                  <TikTokIcon className="w-8 h-8 text-white" />
                </motion.button>

                {/* Copy Link */}
                <motion.button
                  aria-label="Copy share link"
                  onClick={handleCopyLink}
                  className="glass-frosted rounded-2xl p-4 hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy Link"
                >
                  <LinkIcon className="w-8 h-8 text-white" />
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
                  onClick={handleRetry}
                  className="relative w-full py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-cyan text-white shadow-2xl flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <SparklesIcon className="w-6 h-6" />
                  </motion.div>
                  Create Another Dream
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✨
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
                  className="glass rounded-2xl p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    Save Your Dream ✨
                  </h3>
                  <p className="text-white/70 mb-4">
                    Sign in or create an account to save and access all your recorded dreams from anywhere.
                  </p>
                  <p className="text-sm text-white/50 mb-4">
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
