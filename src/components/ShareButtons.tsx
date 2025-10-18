"use client";

import { motion } from "framer-motion";
import { InstagramIcon, TikTokIcon, LinkIcon } from "@/components/Icons";
import { useState } from "react";

interface ShareButtonsProps {
  dreamId?: string;
  shareUrl?: string;
  dreamTitle?: string;
  videoUrl?: string; // Video URL for direct sharing
  onInstagram?: () => void;
  onTikTok?: () => void;
  onCopy?: () => void;
  layout?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  direction?: "row" | "col";
}

export default function ShareButtons({
  dreamId,
  shareUrl,
  dreamTitle = "Check out my dream video",
  videoUrl,
  onInstagram,
  onTikTok,
  onCopy,
  layout = "horizontal",
  size = "md",
  showLabels = false,
  direction = "row",
}: ShareButtonsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const defaultShareUrl = shareUrl || `${baseUrl}/share/${dreamId || "dream"}`;
  const [copiedState, setCopiedState] = useState(false);

  // Helper: Download video file
  const downloadVideo = async () => {
    if (!videoUrl) return false;
    
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-${dreamId || 'video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Download failed:", error);
      return false;
    }
  };

  // Helper: Share video file via Web Share API
  const shareVideoFile = async (platform: string) => {
    if (!videoUrl) return false;
    
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], "dream-video.mp4", { type: "video/mp4" });
      
      // Check if browser supports file sharing
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "ThoughtFull Dreams",
          text: `${dreamTitle}\n\n${defaultShareUrl}`,
          files: [file],
        });
        return true;
      }
    } catch (error) {
      // User cancelled or not supported
      return false;
    }
    
    return false;
  };

  // Helper: Detect mobile
  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  // Size mappings
  const sizeClasses = {
    sm: "p-2.5",
    md: "p-3.5",
    lg: "p-4",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Enhanced Instagram sharing
  const handleInstagramShare = onInstagram || (async () => {
    const shareText = `${dreamTitle}\n\n${defaultShareUrl}`;
    
    // Strategy 1: Try to share video file directly (mobile with video)
    if (videoUrl && isMobile()) {
      const shared = await shareVideoFile("Instagram");
      if (shared) return; // Success! User can now select Instagram from share sheet
    }
    
    // Strategy 2: Download video + copy caption (desktop with video)
    if (videoUrl && !isMobile()) {
      const downloaded = await downloadVideo();
      if (downloaded) {
        await navigator.clipboard.writeText(shareText);
        alert("✅ Video downloaded!\n📋 Caption copied!\n\n👉 Open Instagram and create a new post/reel with the downloaded video.");
        window.open("https://www.instagram.com/", "_blank");
        return;
      }
    }
    
    // Strategy 3: Mobile fallback - copy text and guide
    if (isMobile()) {
      await navigator.clipboard.writeText(shareText);
      window.location.href = "instagram://share";
      setTimeout(() => {
        window.open("https://www.instagram.com/", "_blank");
      }, 1000);
      return;
    }
    
    // Strategy 4: Desktop fallback - just copy and open
    await navigator.clipboard.writeText(shareText);
    alert("📋 Link copied to clipboard!\n\n👉 Paste it in Instagram to share.");
    window.open("https://www.instagram.com/", "_blank");
  });

  // Enhanced TikTok sharing
  const handleTikTokShare = onTikTok || (async () => {
    const shareText = `${dreamTitle}\n${defaultShareUrl}`;
    
    // Strategy 1: Try to share video file directly (mobile with video)
    if (videoUrl && isMobile()) {
      const shared = await shareVideoFile("TikTok");
      if (shared) return; // Success! User can now select TikTok from share sheet
    }
    
    // Strategy 2: Download video + copy caption (desktop with video)
    if (videoUrl && !isMobile()) {
      const downloaded = await downloadVideo();
      if (downloaded) {
        await navigator.clipboard.writeText(shareText);
        alert("✅ Video downloaded!\n📋 Caption copied!\n\n👉 Open TikTok and create a new post with the downloaded video.");
        window.open("https://www.tiktok.com/", "_blank");
        return;
      }
    }
    
    // Strategy 3: Mobile fallback - copy text and guide
    if (isMobile()) {
      await navigator.clipboard.writeText(shareText);
      window.location.href = "tiktok://";
      setTimeout(() => {
        window.open("https://www.tiktok.com/", "_blank");
      }, 1000);
      return;
    }
    
    // Strategy 4: Desktop fallback - just copy and open
    await navigator.clipboard.writeText(shareText);
    alert("📋 Link copied to clipboard!\n\n👉 Paste it in TikTok to share.");
    window.open("https://www.tiktok.com/", "_blank");
  });

  // Copy link to clipboard
  const handleCopyLink = onCopy || (async () => {
    try {
      await navigator.clipboard.writeText(defaultShareUrl);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  });

  const flexClass = direction === "row" ? "flex-row" : "flex-col";
  const gapClass = direction === "row" ? "gap-3" : "gap-2";

  return (
    <motion.div
      className={`flex ${flexClass} ${gapClass} items-center`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Instagram */}
      <motion.button
        onClick={handleInstagramShare}
        className={`group relative glass-frosted rounded-xl ${sizeClasses[size]} hover:bg-white/15 transition-all backdrop-blur-md bg-white/5 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60`}
        whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share to Instagram"
        title="Share to Instagram"
      >
        <InstagramIcon className={`${iconSizes[size]} text-white transition-colors group-hover:text-electric-cyan`} />
      </motion.button>

      {/* TikTok */}
      <motion.button
        onClick={handleTikTokShare}
        className={`group relative glass-frosted rounded-xl ${sizeClasses[size]} hover:bg-white/15 transition-all backdrop-blur-md bg-white/5 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60`}
        whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share to TikTok"
        title="Share to TikTok"
      >
        <TikTokIcon className={`${iconSizes[size]} text-white transition-colors group-hover:text-electric-cyan`} />
      </motion.button>

      {/* Copy Link */}
      <motion.button
        onClick={handleCopyLink}
        className={`group relative glass-frosted rounded-xl ${sizeClasses[size]} hover:bg-white/15 transition-all backdrop-blur-md bg-white/5 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60`}
        whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.95 }}
        aria-label={copiedState ? "Copied!" : "Copy share link"}
        title={copiedState ? "Copied to clipboard!" : "Copy share link"}
      >
        <motion.div
          initial={false}
          animate={{ scale: copiedState ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <LinkIcon className={`${iconSizes[size]} text-white transition-colors group-hover:text-electric-cyan ${copiedState ? "text-electric-green" : ""}`} />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}


