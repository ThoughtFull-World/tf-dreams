"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, HeartIcon } from "@/components/Icons";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import AuthDialog from "./AuthDialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      // Navigate to library if authenticated
      router.push("/library");
    } else {
      // Show auth dialog if not authenticated
      setShowAuthDialog(true);
    }
  };

  return (
    <>
      {/* User Icon Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          {/* Logo/Wordmark - Left side */}
          <motion.div 
            className="font-semibold text-white text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
          </motion.div>

          {/* User Account Button - Right side */}
          <motion.button
            onClick={handleAccountClick}
            className="rounded-full p-2 md:p-3 hover:bg-white/10 transition-all backdrop-blur-md bg-white/5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isAuthenticated ? "Open account menu" : "Sign in to your account"}
            title={isAuthenticated ? "Sign In / Library" : "Sign In"}
          >
            <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.button>
        </div>
      </motion.header>
      
      {children}

      {/* Footer */}
      <motion.footer 
        className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-xs md:text-sm font-medium flex items-center justify-center gap-1">
            Made with <HeartIcon className="w-3.5 h-3.5 text-red-400" /> at Cursor Hackathon SG '25
          </p>
        </div>
      </motion.footer>

      {/* Auth Dialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </>
  );
}

