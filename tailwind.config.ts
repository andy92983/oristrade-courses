import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // OrisTrade Brand Colors
        brand: {
          bg: "#0A0E1A",          // Deep navy background
          card: "#1A2035",         // Card / section background
          border: "#252D45",       // Border color
          gold: "#D4AF37",         // Primary gold accent
          "gold-light": "#E8C84A", // Hover gold
          green: "#00C851",        // BUY signal
          red: "#FF4444",          // SELL signal
          gray: "#AAAAAA",         // WAIT signal
          text: "#FFFFFF",         // Primary text
          muted: "#8892A4",        // Secondary text
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #E8C84A 50%, #B8960C 100%)",
        "card-gradient": "linear-gradient(135deg, #1A2035 0%, #0F1626 100%)",
      },
      animation: {
        "ticker": "ticker 30s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "score-fill": "scoreFill 1.5s ease-out forwards",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        scoreFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--score-width)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
