"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function Recorder({ onRecordingComplete }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const maxRecordingTime = 60; // 60 seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setHasRecording(true);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
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
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleConfirm = () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    onRecordingComplete(blob);
  };

  const handleRetry = () => {
    setHasRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording visualization */}
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          animate={isRecording ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
          }}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center text-4xl
            ${isRecording ? "bg-gradient-to-br from-peach to-lavender" : "bg-gradient-to-br from-mint to-sky"}
            shadow-soft
          `}
        >
          🎤
        </motion.div>

        <div className="mt-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
          </p>
          {isRecording && (
            <p className="text-sm text-gray-600 mt-1">Recording...</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {!isRecording && !hasRecording && (
          <Button onClick={startRecording} fullWidth>
            🎙️ Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="secondary" fullWidth>
            ⏹️ Stop Recording
          </Button>
        )}

        {hasRecording && !isRecording && (
          <>
            <Button onClick={handleConfirm} fullWidth>
              ✅ Use This Recording
            </Button>
            <Button onClick={handleRetry} variant="secondary" fullWidth>
              🔄 Record Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

