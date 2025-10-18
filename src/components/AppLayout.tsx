"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserIcon, HeartIcon, LogoutIcon, ArrowLeftIcon } from "@/components/Icons";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import AuthDialog from "./AuthDialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const isLibraryPage = pathname === "/library";

  const handleAccountClick = async () => {
    if (isAuthenticated) {
      // If authenticated on home page, redirect to library
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      
      if (path === "/") {
        // On home page, redirect to library
        router.push("/library");
      } else if (path === "/library") {
        // On library page, do nothing (user profile/menu would go here)
      } else {
        // On any other page, redirect to library
        router.push("/library");
      }
    } else {
      // Not authenticated, show login dialog
      setShowAuthDialog(true);
    }
  };

  return (
    <>
      {/* Back Arrow - Only on library page */}
      {isLibraryPage && (
        <motion.button
          onClick={() => router.push("/")}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[60] p-2 sm:p-3 rounded-full hover:bg-white/10 transition-all backdrop-blur-md bg-white/5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to home"
        >
          <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </motion.button>
      )}

      {/* User Icon Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-end gap-2">
          {/* Logout Button - Only on library page */}
          {isLibraryPage && isAuthenticated && (
            <motion.button
              onClick={logout}
              className="rounded-full p-2 md:p-3 hover:bg-white/10 transition-all backdrop-blur-md bg-white/5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Logout"
              title="Logout"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LogoutIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.button>
          )}

          {/* User Account Button */}
          <motion.button
            onClick={handleAccountClick}
            className="rounded-full p-2 md:p-3 hover:bg-white/10 transition-all backdrop-blur-md bg-white/5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isAuthenticated ? `Account (${user?.email})` : "Sign in to your account"}
            title={isAuthenticated ? `Account (${user?.email})` : "Sign In"}
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
        className="fixed bottom-0 left-0 right-0 z-50 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-[10px] sm:text-xs md:text-sm font-medium flex items-center justify-center gap-1">
            Made with <HeartIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" /> at Cursor Hackathon SG '25
          </p>
        </div>
      </motion.footer>

      {/* Auth Dialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </>
  );
}

