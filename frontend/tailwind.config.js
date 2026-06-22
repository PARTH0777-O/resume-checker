/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: "#0F4C81", light: "#1a6bb5", dark: "#0a3560" },
        accent:   { DEFAULT: "#00C9A7", light: "#33d4b8", dark: "#009e83" },
        surface:  { DEFAULT: "#F8FAFC", card: "#FFFFFF", dark: "#1E293B" },
        score: {
          low:  "#EF4444",
          mid:  "#F59E0B",
          good: "#22C55E",
          high: "#0EA5E9",
        }
      },
      fontFamily: {
        sans:    ["'DM Sans'", "sans-serif"],
        display: ["'Sora'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "pulse-ring": "pulseRing 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: 0 },              "100%": { opacity: 1 } },
        slideUp:   { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseRing: { "0%,100%": { transform: "scale(1)", opacity: 1 }, "50%": { transform: "scale(1.05)", opacity: 0.8 } },
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)",
        hover: "0 4px 20px rgba(15,76,129,0.15)",
        glow:  "0 0 20px rgba(0,201,167,0.3)",
      }
    }
  },
  plugins: [],
}
