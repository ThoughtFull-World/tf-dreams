"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { LinkIcon, SparklesIcon, PlayIcon } from "@/components/Icons";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* Clean header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 font-[family-name:var(--font-space-grotesk)] text-white">
            Shared Dream
          </h1>
          <p className="text-lg text-white/60">
            Someone shared their dream with you
          </p>
        </div>

        {/* Main card */}
        <motion.div
          className="glass-frosted rounded-3xl shadow-glass p-8 mb-6 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
        >
          {/* Video player */}
          <div className="relative mb-6">
            <div className="relative glass rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-glass">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(123, 47, 247, 0.2) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(0, 217, 255, 0.2) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 20%, rgba(255, 45, 135, 0.2) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 80%, rgba(0, 102, 255, 0.2) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(123, 47, 247, 0.2) 0%, transparent 50%)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Play button */}
              <div className="relative z-10">
                <motion.div
                  className="glass-frosted w-20 h-20 rounded-full flex items-center justify-center shadow-glow cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayIcon className="w-8 h-8 text-white ml-1" />
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Token info */}
          <div className="glass rounded-xl p-4 mb-6 shadow-glass">
            <p className="text-xs text-white/50 mb-1 uppercase tracking-wider font-semibold">
              Dream ID
            </p>
            <p className="font-mono text-sm text-white/80 break-all">
              {token}
            </p>
          </div>
          
          {/* Actions - Improved CTA Hierarchy */}
          <div className="space-y-3">
            {/* Primary action: Create Your Own */}
            <Button 
              onClick={handleGoHome} 
              variant="primary" 
              fullWidth
              ariaLabel="Create your own dream"
              icon={<SparklesIcon className="w-5 h-5" />}
            >
              Create Your Own Dream
            </Button>
            
            {/* Secondary action: Copy Link */}
            <Button 
              onClick={handleCopyLink} 
              variant="secondary" 
              fullWidth
              ariaLabel="Copy this dream's share link to clipboard"
              icon={<LinkIcon className="w-5 h-5" />}
            >
              Copy Share Link
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
