import { motion } from "framer-motion";
import { MicrophoneIcon, SparklesIcon, VideoIcon, CheckIcon } from "./Icons";

type Step = "transcribe" | "story" | "video" | "ready";

interface ProgressStepsProps {
  currentStep: Step;
}

const steps: { id: Step; label: string; icon: any; color: string }[] = [
  { id: "transcribe", label: "Transcribing audio", icon: MicrophoneIcon, color: "from-electric-purple to-electric-pink" },
  { id: "story", label: "Crafting your story", icon: SparklesIcon, color: "from-electric-blue to-electric-cyan" },
  { id: "video", label: "Rendering video", icon: VideoIcon, color: "from-electric-pink to-electric-purple" },
  { id: "ready", label: "Your dream is ready", icon: CheckIcon, color: "from-electric-cyan to-electric-blue" },
];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;
        const Icon = step.icon;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
            }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="relative"
          >
            {/* Clean step card */}
            <div className={`
              relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all
              ${isActive ? "glass-frosted shadow-glass" : ""}
              ${isCompleted ? "glass shadow-glass" : ""}
              ${isPending ? "glass-dark" : ""}
            `}>
              {/* Glow for active */}
              {isActive && (
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${step.color} opacity-15 blur-xl -z-10`}
                />
              )}

              {/* Icon indicator */}
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center relative flex-shrink-0
                  ${isActive ? "glass-frosted" : ""}
                  ${isCompleted ? "glass" : ""}
                  ${isPending ? "glass-dark" : ""}
                `}
              >
                {isActive && (
                  <motion.div
                    animate={{ 
                      rotate: step.id === "story" ? 360 : 0,
                      scale: step.id === "video" ? [1, 1.2, 1] : [1, 1.15, 1],
                      y: step.id === "transcribe" ? [0, -2, 0] : 0
                    }}
                    transition={{ 
                      rotate: step.id === "story" ? { duration: 2, repeat: Infinity, ease: "linear" } : {},
                      scale: { 
                        duration: step.id === "video" ? 1 : 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      },
                      y: step.id === "transcribe" ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}
                    }}
                  >
                    <Icon className="w-5 h-5 text-electric-cyan" />
                  </motion.div>
                )}
                {isCompleted && <CheckIcon className="w-5 h-5 text-electric-cyan" />}
                {isPending && <Icon className="w-5 h-5 text-white/30" />}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p 
                  className={`
                    font-medium text-base
                    ${isActive ? "text-white" : ""}
                    ${isCompleted ? "text-white/80" : ""}
                    ${isPending ? "text-white/50" : ""}
                  `}
                >
                  {step.label}
                </p>
              </div>

              {/* Status dot */}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-electric-cyan flex-shrink-0"
                />
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-9 top-full w-0.5 h-3 bg-white/10" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
