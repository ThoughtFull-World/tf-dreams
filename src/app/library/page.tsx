"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/Button";
import ShareButtons from "@/components/ShareButtons";
import { SparklesIcon } from "@/components/Icons";
import { createBrowserClient } from "@supabase/ssr";

interface Dream {
  id: string;
  transcript: string;
  created_at: string;
  video_url?: string;
  story_content?: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loadingDreams, setLoadingDreams] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch dreams from Supabase
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchDreams = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );

        const { data, error } = await supabase
          .from("dreams")
          .select(`
            id,
            transcript,
            created_at,
            story_nodes (
              video_url,
              content
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching dreams:", error);
          setDreams([]);
        } else {
          // Transform data to flatten story_nodes
          const transformedData = (data || []).map((dream: any) => ({
            id: dream.id,
            transcript: dream.transcript,
            created_at: dream.created_at,
            video_url: dream.story_nodes?.[0]?.video_url || null,
            story_content: dream.story_nodes?.[0]?.content || null,
          }));
          setDreams(transformedData);
        }
      } catch (err) {
        console.error("Error fetching dreams:", err);
        setDreams([]);
      } finally {
        setLoadingDreams(false);
      }
    };

    fetchDreams();
  }, [isAuthenticated, user?.id]);

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

  return (
    <main className="flex flex-col min-h-screen p-3 sm:p-4 md:p-6 relative z-10 pt-20 sm:pt-24 md:pt-24">
      <div className="w-full max-w-6xl mx-auto flex-1">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 font-[family-name:var(--font-space-grotesk)] text-white">
            Your Dreams
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/60 font-medium break-words">
            Welcome back, <span className="text-electric-cyan">{user?.username || user?.email}</span>
          </p>
        </motion.div>

        {/* Dreams Grid or Empty State */}
        {loadingDreams ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-electric-cyan border-t-transparent rounded-full"
            />
          </motion.div>
        ) : dreams.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-12"
          >
            {dreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="glass-frosted rounded-2xl p-4 sm:p-6 hover:brightness-110 transition-all cursor-pointer group"
              >
                {/* Video or Placeholder */}
                <div className="relative aspect-video mb-4 rounded-xl bg-gradient-to-br from-electric-purple/20 to-electric-cyan/20 border border-white/10 overflow-hidden">
                  {dream.video_url ? (
                    <video
                      src={dream.video_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => {
                        const video = e.currentTarget as HTMLVideoElement;
                        video.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget as HTMLVideoElement;
                        video.pause();
                        video.currentTime = 0;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
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
                      <div className="absolute bottom-2 right-2 text-xs text-white/40 bg-black/40 px-2 py-1 rounded">
                        Generating...
                      </div>
                    </div>
                  )}
                </div>

                {/* Dream Info */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors line-clamp-2">
                  {dream.transcript?.substring(0, 50) || "Untitled Dream"}
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mb-3 sm:mb-4">
                  {new Date(dream.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {/* Share Buttons */}
                <div className="flex justify-center pt-2 border-t border-white/10 mt-4">
                  <ShareButtons 
                    dreamId={dream.id} 
                    size="sm"
                    direction="row"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <SparklesIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-6">
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
      </div>
    </main>
  );
}
