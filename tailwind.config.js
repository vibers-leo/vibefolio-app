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
        primary: "#16A34A",
        "primary-dark": "#15803D",
        "primary-light": "#dcfce7",
        accent: "#84CC16",
        background: "#f8fafc",
        "background-dark": "#09090b",
        surface: "#ffffff",
        "surface-dark": "rgba(255,255,255,0.05)",
        "text-primary": "#0f172a",
        "text-secondary": "#64748b",
        border: "#e2e8f0",
        "badge-popular": "#f97316",
        "badge-new": "#16a34a",
        "badge-category": "#6366f1",
        "badge-tech": "#8b5cf6",
        "badge-audit": "#ea580c",
      },
    },
  },
  plugins: [],
};
