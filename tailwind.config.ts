import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#fff8f1",
          100: "#feeedc",
          200: "#fcd9b6",
          300: "#fabd85",
          400: "#f69546",
          500: "#f2751b",
          600: "#e35910",
          700: "#bc420e",
          800: "#953513",
          900: "#792e13",
          950: "#411407",
        },
        amberGold: {
          DEFAULT: "#F59E0B",
          light: "#FDE68A",
          dark: "#B45309",
        },
        darkSurface: {
          bg: "#171a22",
          card: "#212632",
          border: "#333c4e",
          hover: "#2a3242",
          subtle: "#3e485e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "pulse-subtle": "pulseSubtle 2s infinite ease-in-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(242, 117, 27, 0.35)",
        ambient: "0 10px 30px -5px rgba(245, 158, 11, 0.15)",
        card: "0 10px 30px -10px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
