import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "glass" | "destructive";
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = "left",
  ariaLabel,
  type = "button",
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold text-base transition-all relative inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-electric-purple via-electric-magenta to-electric-blue text-white shadow-glow hover:brightness-110",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/20 shadow-glass",
    tertiary: "bg-transparent text-white/80 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10",
    glass: "glass-dark text-white hover:brightness-110 shadow-glass",
    destructive: "bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30",
  };
  
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles}`}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }}
    >
      {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
      
      {/* Glow effect for primary - optimized */}
      {!disabled && variant === "primary" && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-electric-purple to-electric-blue opacity-20 blur-lg -z-10" />
      )}
    </motion.button>
  );
}
