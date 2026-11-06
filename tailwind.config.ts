import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    screens: {
      sm: "640px",
      md: "960px",
      lg: "1280px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-subtle": "var(--bg-subtle)",
        surface: "var(--surface)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          tint: "var(--accent-tint)",
        },
        agent: {
          orby: {
            DEFAULT: "var(--agent-orby)",
            tint: "var(--agent-orby-tint)",
          },
          biblio: {
            DEFAULT: "var(--agent-biblio)",
            tint: "var(--agent-biblio-tint)",
          },
          cosmo: {
            DEFAULT: "var(--agent-cosmo)",
            tint: "var(--agent-cosmo-tint)",
          },
          atlas: {
            DEFAULT: "var(--agent-atlas)",
            tint: "var(--agent-atlas-tint)",
          },
          breeze: {
            DEFAULT: "var(--agent-breeze)",
            tint: "var(--agent-breeze-tint)",
          },
          palette: {
            DEFAULT: "var(--agent-palette)",
            tint: "var(--agent-palette-tint)",
          },
        },
        status: {
          success: "var(--success)",
          "success-tint": "var(--success-tint)",
          warning: "var(--warning)",
          "warning-tint": "var(--warning-tint)",
          error: "var(--error)",
          "error-tint": "var(--error-tint)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "999px",
        squircle: "22%",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      keyframes: {
        marqueeLeft: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "marquee-left": "marqueeLeft 35s linear infinite",
        "marquee-right": "marqueeRight 35s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
