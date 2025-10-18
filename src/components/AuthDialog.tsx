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

type AuthTab = "login" | "signup";

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { login, signup, isLoading } = useAuth();
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setTab("login");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await signup(email, password, username);
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setUsername("");
      setTab("login");
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error(err);
    }
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
            onClick={onClose}
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
            <div className="glass-frosted rounded-3xl shadow-glass p-6 md:p-8 relative w-full max-w-md"
            >
              {/* Close Button */}
              <motion.button
                onClick={onClose}
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
                  {tab === "login" ? "Welcome Back" : "Join Us"}
                </h2>
                <p className="text-white/60 text-sm">
                  {tab === "login"
                    ? "Sign in to access your dream library"
                    : "Create an account to save your dreams"}
                </p>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl"
              >
                <motion.button
                  onClick={() => {
                    setTab("login");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 ${
                    tab === "login"
                      ? "bg-gradient-to-r from-electric-purple to-electric-cyan text-white shadow-glow"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => {
                    setTab("signup");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 ${
                    tab === "signup"
                      ? "bg-gradient-to-r from-electric-purple to-electric-cyan text-white shadow-glow"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Sign Up
                </motion.button>
              </motion.div>

              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={tab}
                  initial={{ opacity: 0, x: tab === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === "login" ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={tab === "login" ? handleLogin : handleSignup}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 transition-all"
                    />
                  </motion.div>

                  {/* Username Field (Signup only) */}
                  {tab === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block text-sm font-medium text-white mb-2">
                        Username (Optional)
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="dreamer123"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 transition-all"
                      />
                    </motion.div>
                  )}

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: tab === "signup" ? 0.3 : 0.25 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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
                    transition={{ delay: tab === "signup" ? 0.35 : 0.3 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      disabled={isLoading}
                      variant="primary"
                    >
                      {isLoading
                        ? "Processing..."
                        : tab === "login"
                        ? "Sign In"
                        : "Create Account"}
                    </Button>
                  </motion.div>

                  {/* Footer Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: tab === "signup" ? 0.4 : 0.35 }}
                    className="text-xs text-white/50 text-center"
                  >
                    {tab === "login" ? (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setTab("signup")}
                          className="text-electric-cyan hover:text-electric-cyan/80 underline focus:outline-none focus-visible:ring-1 focus-visible:ring-electric-cyan rounded px-1"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setTab("login")}
                          className="text-electric-cyan hover:text-electric-cyan/80 underline focus:outline-none focus-visible:ring-1 focus-visible:ring-electric-cyan rounded px-1"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </motion.p>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
