"use client";

import { motion } from "framer-motion";
import { InstagramIcon, TikTokIcon, LinkIcon } from "@/components/Icons";
import { useState } from "react";

interface ShareButtonsProps {
  dreamId?: string;
  shareUrl?: string;
  dreamTitle?: string;
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

  // Real Instagram sharing
  const handleInstagramShare = onInstagram || (async () => {
    
    // Try native Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ThoughtFull Dreams",
          text: dreamTitle,
          url: defaultShareUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, continue to fallback
      }
    }

    // Fallback: Open Instagram and copy just the URL to clipboard
    await navigator.clipboard.writeText(defaultShareUrl);
    window.open("https://www.instagram.com/", "_blank");
  });

  // Real TikTok sharing
  const handleTikTokShare = onTikTok || (async () => {
    
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ThoughtFull Dreams",
          text: dreamTitle,
          url: defaultShareUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, continue to fallback
      }
    }

    // Fallback: Open TikTok and copy just the URL to clipboard
    await navigator.clipboard.writeText(defaultShareUrl);
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
