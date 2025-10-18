"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { MicrophoneIcon, StopIcon, RefreshIcon } from "./Icons";

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  showQuickActions?: boolean;
  onRetry?: () => void;
}

export default function Recorder({ onRecordingComplete, showQuickActions = false, onRetry }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const maxRecordingTime = 60;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      analyzeAudio();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setAudioLevel(0);
        
        // Create blob and wait 2s before calling onRecordingComplete
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setTimeout(() => {
          onRecordingComplete(blob);
        }, 2000);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setJustFinished(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxRecordingTime) {
            stopRecording();
            return maxRecordingTime;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setJustFinished(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = recordingTime / maxRecordingTime;

  return (
    <div className="space-y-6">
      {/* Recording visualization */}
      <motion.div 
        className="flex flex-col items-center justify-center py-8 relative"
        animate={isRecording ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Wave rings */}
        <div className="relative">
          <AnimatePresence>
            {isRecording && (
              <>
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-electric-purple/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{
                      scale: 1 + (audioLevel * 0.5) + (i * 0.3),
                      opacity: [0.5, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Main orb */}
          <motion.div
            onClick={isRecording ? stopRecording : (!justFinished ? startRecording : undefined)}
            animate={isRecording ? {
              scale: 1 + (audioLevel * 0.15),
            } : justFinished ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: justFinished ? 0.4 : 0.1,
              ease: "easeOut",
            }}
            whileHover={!isRecording && !justFinished ? { scale: 1.05 } : isRecording ? { scale: 1.08 } : {}}
            whileTap={!isRecording && !justFinished ? { scale: 0.95 } : isRecording ? { scale: 0.92 } : {}}
            className={`w-24 h-24 rounded-full flex items-center justify-center relative glass-frosted shadow-glass ${
              justFinished ? "ring-2 ring-electric-cyan/50" : isRecording ? "ring-2 ring-electric-purple/50 cursor-pointer" : ""
            } ${!isRecording && !justFinished ? "cursor-pointer" : ""}`}
          >
            {isRecording && (
              <div 
                className="absolute inset-0 rounded-full bg-electric-purple/20 blur-lg"
                style={{ opacity: 0.2 + (audioLevel * 0.3) }}
              />
            )}
            
            <MicrophoneIcon className={`w-10 h-10 relative z-10 transition-colors ${
              isRecording ? 'text-electric-purple' : 
              justFinished ? 'text-electric-cyan' : 
              'text-white'
            }`} />
          </motion.div>

          {/* Progress ring */}
          {isRecording && (
            <svg className="absolute -inset-2 w-28 h-28 -rotate-90 pointer-events-none">
              <circle
                cx="56"
                cy="56"
                r="52"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r="52"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress)}`}
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B2FF7" />
                  <stop offset="100%" stopColor="#00D9FF" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Time/status display */}
        <div className="mt-6 text-center">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)] tabular-nums">
                  {formatTime(recordingTime)}
                </p>
                <motion.div
                  className="mt-3 flex items-center justify-center gap-2 text-electric-purple text-sm font-medium"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-electric-purple rounded-full"
                  />
                  Recording • Tap to stop
                </motion.div>
                {recordingTime >= 55 && (
                  <p className="text-xs text-electric-cyan/80 mt-2">
                    Max 1 minute - auto-stopping soon
                  </p>
                )}
              </motion.div>
            ) : justFinished ? (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <p className="text-lg font-semibold text-electric-cyan">
                  ✓ Recording stopped
                </p>
                <p className="text-sm text-white/60 mt-1">
                  {recordingTime >= 59 ? "Auto-stopped at 1 minute" : "Ready to process your dream"} 
                </p>
                <p className="text-xs text-white/40 mt-2">
                  Processing your dream...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-lg font-medium text-white">
                  Tap to start recording
                </p>
                <p className="text-sm text-white/60 mt-1">
                  Speak naturally about your dream
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Accessible status for screen readers */}
          <p aria-live="polite" className="sr-only">
            {isRecording ? `Recording: ${formatTime(recordingTime)}. Tap to stop.` : justFinished ? "Recording stopped. Processing your dream." : "Ready to record"}
          </p>
        </div>
      </motion.div>

      {/* Waveform */}
      {isRecording && (
        <motion.div 
          className="flex justify-center gap-1 h-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-electric-purple/50 to-electric-cyan/50 rounded-full transition-all duration-100"
              style={{
                height: `${15 + (audioLevel * 85 * (Math.random() * 0.5 + 0.5))}%`,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Main action button */}
      <AnimatePresence mode="wait">
        {!isRecording && !justFinished && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button 
              onClick={startRecording} 
              fullWidth 
              icon={<MicrophoneIcon className="w-5 h-5" />}
            >
              Start Recording
            </Button>
          </motion.div>
        )}

        {isRecording && (
          <motion.div
            key="stop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button 
              onClick={stopRecording} 
              variant="glass" 
              fullWidth
            >
              Create My Dream ✨
            </Button>
          </motion.div>
        )}

        {justFinished && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button 
              onClick={() => onRecordingComplete(new Blob(chunksRef.current, { type: "audio/webm" }))} 
              variant="glass" 
              fullWidth
            >
              Create My Dream ✨
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick retry option - only shows briefly after recording */}
      {showQuickActions && onRetry && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-center overflow-hidden"
        >
          <button
            onClick={onRetry}
            className="text-sm text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-2"
          >
            <RefreshIcon className="w-4 h-4" />
            Not happy? Record again
          </button>
        </motion.div>
      )}
    </div>
  );
}
