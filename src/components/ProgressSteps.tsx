import { motion } from "framer-motion";

type Step = "transcribe" | "story" | "video" | "ready";

interface ProgressStepsProps {
  currentStep: Step;
}

const steps: { id: Step; label: string; emoji: string }[] = [
  { id: "transcribe", label: "Transcribe", emoji: "🎤" },
  { id: "story", label: "Story", emoji: "📖" },
  { id: "video", label: "Video", emoji: "🎬" },
  { id: "ready", label: "Ready", emoji: "✨" },
];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all
              ${isActive ? "bg-gradient-to-r from-lavender to-sky text-white shadow-soft" : ""}
              ${isCompleted ? "bg-mint/30 text-gray-700" : ""}
              ${!isActive && !isCompleted ? "bg-gray-100 text-gray-400" : ""}
            `}
          >
            <span className="text-2xl">{step.emoji}</span>
            <span className="font-semibold">{step.label}</span>
            {isActive && (
              <motion.div
                className="ml-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⚙️
              </motion.div>
            )}
            {isCompleted && (
              <span className="ml-auto">✅</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

