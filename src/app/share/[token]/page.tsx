"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ThoughtFull Dreams
          </h1>
          <p className="text-white/80">
            Shared Dream Video
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft p-8"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Dream Video
          </h2>
          
          {/* Placeholder video area */}
          <div className="bg-gradient-to-br from-mint to-lavender rounded-2xl aspect-video mb-4 flex items-center justify-center">
            <p className="text-white text-lg font-medium">
              🎬 Video Player
            </p>
          </div>
          
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Token:</p>
            <p className="font-mono text-sm text-gray-800 break-all">{token}</p>
          </div>
          
          <Button onClick={handleGoHome} fullWidth>
            ✨ Create Your Own Dream
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}

