"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to be processed
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to library
        console.log("✅ Auth callback: User authenticated, redirecting to library");
        router.push("/library");
      } else {
        // Auth failed
        console.error("❌ Auth callback: Authentication failed");
        setError("Authentication failed. Please try again.");
        setTimeout(() => {
          router.push("/?error=auth_failed");
        }, 2000);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <main className="flex h-screen items-center justify-center p-4 relative z-10">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Authentication Failed
            </h1>
            <p className="text-white/60">{error}</p>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-electric-cyan border-t-transparent rounded-full mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-white">
              Signing you in...
            </h1>
            <p className="text-white/60 mt-2">
              Redirecting to your library
            </p>
          </>
        )}
      </motion.div>
    </main>
  );
}
