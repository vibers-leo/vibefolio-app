/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* ━━━ Supanova Premium Palette ━━━ */
        primary: {
          DEFAULT: "#16A34A",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16A34A",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        accent: {
          DEFAULT: "#84CC16",
          glow: "#a3e635",
        },
        surface: {
          DEFAULT: "#ffffff",
          elevated: "#fafbfc",
          muted: "#f8fafc",
          overlay: "rgba(0,0,0,0.03)",
        },
        ink: {
          DEFAULT: "#0f172a",
          secondary: "#475569",
          tertiary: "#94a3b8",
          ghost: "#cbd5e1",
        },
        border: {
          DEFAULT: "#e2e8f0",
          light: "#f1f5f9",
          focus: "#16A34A",
        },
        badge: {
          popular: "#f97316",
          new: "#6366f1",
          category: "#8b5cf6",
          tech: "#06b6d4",
          audit: "#ea580c",
        },
      },
      borderRadius: {
        "2xl": 16,
        "3xl": 20,
        "4xl": 24,
      },
    },
  },
  plugins: [],
};
