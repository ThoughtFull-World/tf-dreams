import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Glassmorphism dark mode palette (from reference)
        glass: {
          bg: "rgba(30, 30, 50, 0.6)",
          bgDark: "rgba(20, 20, 40, 0.7)",
          border: "rgba(255, 255, 255, 0.1)",
          borderLight: "rgba(255, 255, 255, 0.15)",
        },
        // Vibrant accent colors (from reference design)
        electric: {
          blue: "#0066FF",
          purple: "#7B2FF7",
          pink: "#FF2D87",
          cyan: "#00D9FF",
          magenta: "#9D4EDD",
        },
        // Background colors
        dark: {
          900: "#0E1220",
          800: "#13182B",
          700: "#1A1F36",
        },
        // Status colors
        red: {
          200: "#FCBDBD",
          500: "#FF6B6B",
        },
      },
      backgroundImage: {
        'vibrant-waves': 'radial-gradient(ellipse at 80% 10%, rgba(0, 217, 255, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(255, 45, 135, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, rgba(123, 47, 247, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(157, 78, 221, 0.3) 0%, transparent 50%)',
        'glass-shine': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 100%)',
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        'glass-inset': "inset 0 0 20px rgba(255, 255, 255, 0.05)",
        glow: "0 0 30px rgba(123, 47, 247, 0.5)",
        'glow-cyan': "0 0 30px rgba(0, 217, 255, 0.5)",
        'glow-pink': "0 0 30px rgba(255, 45, 135, 0.5)",
        float: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

