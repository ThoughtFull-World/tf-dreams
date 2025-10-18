"use client";

import { useEffect, useState } from 'react';

export default function TestVideoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Simulate the video appearing after polling
    console.log("Starting video test...");
    
    setTimeout(() => {
      console.log("✅ Video URL set!");
      setVideoUrl("https://dreams.3a84906547565f48c7843679bf05b915.r2.cloudflarestorage.com/videos/81c771d6-e4c4-4ffe-882e-d113a00480d3/ecfee84f-e6a4-495f-9fde-62bab741f8f9/c778cf59-c8ad-4c7a-935d-94185f6ebebb.mp4");
    }, 2000); // Wait 2 seconds to simulate polling
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Video Display Test</h1>
        
        {/* Status */}
        <div className="mb-8 p-4 bg-white/10 rounded-xl">
          <p className="text-white">
            Video URL State: <code className="text-electric-cyan">{videoUrl ? "SET ✅" : "null ❌"}</code>
          </p>
        </div>

        {/* Before video loads */}
        {!videoUrl && (
          <div className="text-white text-center p-8">
            <p className="text-xl mb-4">⏳ Waiting for video...</p>
            <p className="text-white/60">This simulates the polling period</p>
          </div>
        )}

        {/* Video Player - Same logic as main page */}
        {videoUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
              <p className="text-green-200">✅ Video URL is set! Player should appear below:</p>
            </div>
            
            <div className="glass-frosted rounded-3xl overflow-hidden shadow-glass">
              <video
                className="w-full h-full object-cover"
                src={videoUrl}
                controls
                autoPlay
                loop
                muted
              />
            </div>

            <div className="text-white/60 text-sm">
              <p>🔗 Video URL:</p>
              <code className="text-xs break-all">{videoUrl}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

