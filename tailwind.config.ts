import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Spec's own breakpoints: mobile <768px, tablet 768-1280px, desktop
    // 1280px+. `md` (768) is already Tailwind's default; `lg` is overridden
    // from Tailwind's default 1024 to the spec's literal 1280 desktop cutoff.
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1280px",
      xl: "1536px",
    },
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-panel": "var(--bg-panel)",
        cyan: "var(--cyan)",
        green: "var(--green)",
        orange: "var(--orange)",
        red: "var(--red)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
      },
      fontFamily: {
        display: ["var(--font-orbitron)"],
        body: ["var(--font-inter)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      keyframes: {
        "loading-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
      },
      animation: {
        "loading-sweep": "loading-sweep 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
