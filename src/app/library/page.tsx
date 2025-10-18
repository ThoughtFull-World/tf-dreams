"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/Button";
import { ArrowLeftIcon, SparklesIcon } from "@/components/Icons";

export default function LibraryPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center p-4 relative z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-electric-cyan border-t-transparent rounded-full"
        />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock dreams data - will be replaced with Supabase integration
  const dreams = [
    {
      id: "1",
      title: "Flying Through Clouds",
      recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration: "2:34",
    },
    {
      id: "2",
      title: "Dancing in the Rain",
      recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      duration: "1:45",
    },
    {
      id: "3",
      title: "Lost in a Library",
      recordedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      duration: "3:12",
    },
  ];

  return (
    <main className="flex h-screen flex-col items-center justify-start p-4 md:p-6 relative z-10 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-2 font-[family-name:var(--font-space-grotesk)] text-white">
              Your Dreams
            </h1>
            <p className="text-lg text-white/60 font-medium">
              Welcome back, <span className="text-electric-cyan">{user?.username || user?.email}</span>
            </p>
          </div>
        </motion.div>

        {/* Back to Main Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex gap-3"
        >
          <Button
            onClick={() => router.push("/")}
            variant="secondary"
            icon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Back to Main
          </Button>
          <Button
            onClick={logout}
            variant="tertiary"
          >
            Logout
          </Button>
        </motion.div>

        {/* Dreams Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {dreams.length > 0 ? (
            dreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="glass-frosted rounded-2xl p-6 hover:brightness-110 transition-all cursor-pointer group"
              >
                {/* Video Placeholder */}
                <div className="relative aspect-video mb-4 rounded-xl bg-gradient-to-br from-electric-purple/20 to-electric-cyan/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-electric-purple/10 via-electric-cyan/10 to-electric-magenta/10"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <SparklesIcon className="w-12 h-12 text-electric-cyan" />
                  </motion.div>
                </div>

                {/* Dream Info */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                  {dream.title}
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  {dream.recordedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-white/40">
                  Duration: {dream.duration}
                </p>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full text-center py-12"
            >
              <SparklesIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-4">
                No dreams recorded yet
              </p>
              <Button
                onClick={() => router.push("/")}
                variant="primary"
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                Create Your First Dream
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-3">
            Coming Soon
          </h2>
          <p className="text-white/70 text-sm">
            We're working on adding more features to your dream library:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li>✨ Watch and share your dream videos</li>
            <li>💾 Cloud storage and sync across devices</li>
            <li>🏷️ Tag and organize your dreams</li>
            <li>📊 Dream analytics and insights</li>
            <li>🔗 Share dreams with friends</li>
          </ul>
        </motion.div>
      </motion.div>
    </main>
  );
}
