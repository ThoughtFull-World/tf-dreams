"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, HeartIcon } from "@/components/Icons";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import AuthDialog from "./AuthDialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleAccountClick = async () => {
    if (isAuthenticated) {
      // If already in library, logout
      // Otherwise redirect to library
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      console.log("👤 Account click - authenticated, path:", path);
      
      if (path === "/library") {
        // User is in library and authenticated, logout
        console.log("📍 In library - logging out");
        try {
          await logout();
          router.push("/");
        } catch (error) {
          console.error("Logout failed:", error);
        }
      } else {
        // User is authenticated but not in library, redirect there
        console.log("📍 Not in library - redirecting");
        router.push("/library");
      }
    } else {
      // Not authenticated, show login
      console.log("👤 Account click - not authenticated, showing dialog");
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
            ThoughtFull Dreams
          </motion.div>

          {/* User Account Button - Right side */}
          <motion.button
            onClick={handleAccountClick}
            className="rounded-full p-2 md:p-3 hover:bg-white/10 transition-all backdrop-blur-md bg-white/5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isAuthenticated ? `Account (${user?.email})` : "Sign in to your account"}
            title={isAuthenticated ? `Logout (${user?.email})` : "Sign In"}
          >
            {isAuthenticated && user?.email ? (
              // Show user initial when logged in
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-white font-bold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              // Show user icon when logged out
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
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

