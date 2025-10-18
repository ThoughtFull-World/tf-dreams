import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-2xl font-semibold text-lg transition-all shadow-soft";
  const variantStyles = {
    primary: "bg-gradient-to-r from-lavender to-sky text-white hover:shadow-lg",
    secondary: "bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-200",
  };
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles}`}
    >
      {children}
    </motion.button>
  );
}

