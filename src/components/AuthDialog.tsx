"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Button from "./Button";
import { CloseIcon } from "./Icons";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { sendMagicLink, isLoading, magicLinkSent } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendMagicLink(email);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
      console.error(err);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
          >
            <div className="glass-frosted rounded-3xl shadow-glass p-6 md:p-8 relative w-full max-w-md">
              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close authentication dialog"
              >
                <CloseIcon className="w-5 h-5 text-white/70" />
              </motion.button>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <h2 className="text-2xl font-bold text-white mb-1">
                  {magicLinkSent ? "Check your email" : "Sign in"}
                </h2>
                <p className="text-white/60 text-sm">
                  {magicLinkSent
                    ? "We've sent a magic link to your email"
                    : "Sign in with a magic link - no password needed"}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {magicLinkSent ? (
                  // Success State
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Email confirmation */}
                    <div className="p-4 bg-electric-cyan/10 border border-electric-cyan/30 rounded-xl">
                      <p className="text-white font-medium text-sm break-all">{email}</p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 text-white/70 text-sm">
                      <p>✨ Click the link in your email to sign in</p>
                      <p>⏱️ The link expires in 1 hour</p>
                      <p>💡 If you don't see it, check your spam folder</p>
                    </div>

                    {/* Resend Button */}
                    <Button
                      onClick={() => {
                        setEmail("");
                      }}
                      variant="secondary"
                      fullWidth
                      disabled={isLoading}
                    >
                      Try another email
                    </Button>
                  </motion.div>
                ) : (
                  // Magic Link Form
                  <motion.form
                    key="magic-link-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleMagicLink}
                    className="space-y-4"
                  >
                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-sm font-medium text-white mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 transition-all"
                      />
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading || !email}
                        variant="primary"
                      >
                        {isLoading ? "Sending..." : "Send Magic Link"}
                      </Button>
                    </motion.div>

                    {/* Info */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-xs text-white/50 text-center"
                    >
                      ✨ A magic link will be sent to your email - no password needed!
                    </motion.p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
