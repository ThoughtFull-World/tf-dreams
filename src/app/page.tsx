"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Recorder from "@/components/Recorder";
import ProgressSteps from "@/components/ProgressSteps";
import Button from "@/components/Button";
import { uploadAudioAndCreateDream, startPipeline } from "@/lib/api";
import { DreamStatus } from "@/lib/types";

type Step = "record" | "generate" | "share";
type PipelineStep = "transcribe" | "story" | "video" | "ready";

export default function HomePage() {
  const [step, setStep] = useState<Step>("record");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [dreamId, setDreamId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [currentPipelineStep, setCurrentPipelineStep] = useState<PipelineStep>("transcribe");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setStep("generate");
  };

  const handleStartGenerate = async () => {
    if (!audioBlob) return;
    
    setIsGenerating(true);
    
    // Mock upload
    const dream = await uploadAudioAndCreateDream(audioBlob);
    setDreamId(dream.id);
    
    // Simulate pipeline steps
    setCurrentPipelineStep("transcribe");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentPipelineStep("story");
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setCurrentPipelineStep("video");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setCurrentPipelineStep("ready");
    await startPipeline(dream.id);
    
    // Mock share token
    setShareToken(`dream-${Date.now()}`);
    setIsGenerating(false);
    setStep("share");
  };

  const handleDoAnother = () => {
    setStep("record");
    setAudioBlob(null);
    setDreamId(null);
    setShareToken(null);
    setCurrentPipelineStep("transcribe");
    setIsGenerating(false);
  };

  const handleCopyLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
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
            Turn your dreams into magical videos
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft p-8"
          layout
        >
          {step === "record" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Record Your Dream
              </h2>
              <p className="text-gray-600 mb-6">
                Press the button and describe your dream. You have up to 60 seconds.
              </p>
              <Recorder onRecordingComplete={handleRecordingComplete} />
            </motion.div>
          )}

          {step === "generate" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Generate Your Dream
              </h2>
              <p className="text-gray-600 mb-6">
                We'll transform your dream into a beautiful video.
              </p>
              
              {isGenerating && (
                <div className="mb-6">
                  <ProgressSteps currentStep={currentPipelineStep} />
                </div>
              )}
              
              {!isGenerating && (
                <Button onClick={handleStartGenerate} fullWidth>
                  Start Generate
                </Button>
              )}
            </motion.div>
          )}

          {step === "share" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Your Dream is Ready! ✨
              </h2>
              
              {/* Placeholder video area */}
              <div className="bg-gradient-to-br from-mint to-lavender rounded-2xl aspect-video mb-6 flex items-center justify-center">
                <p className="text-white text-lg font-medium">
                  🎬 Video Preview
                </p>
              </div>
              
              <div className="space-y-3">
                <Button onClick={handleCopyLink} fullWidth>
                  📋 Copy Share Link
                </Button>
                <Button onClick={handleDoAnother} variant="secondary" fullWidth>
                  ✨ Create Another Dream
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}

