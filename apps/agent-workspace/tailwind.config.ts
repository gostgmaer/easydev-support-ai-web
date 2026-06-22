import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/*/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "hsl(210, 40%, 96.1%)",
          100: "hsl(210, 40%, 90%)",
          500: "hsl(217, 91%, 60%)",
          600: "hsl(221, 83%, 53%)",
          900: "hsl(222, 47%, 11%)"
        },
        neutral: {
          50: "hsl(210, 40%, 98%)",
          100: "hsl(210, 40%, 96%)",
          200: "hsl(214, 32%, 91%)",
          500: "hsl(215, 16%, 47%)",
          900: "hsl(222, 47%, 11%)"
        },
        success: "hsl(142, 76%, 36%)",
        warning: "hsl(48, 96%, 53%)",
        danger: "hsl(346, 84%, 61%)",
        info: "hsl(199, 89%, 48%)"
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.125rem"
      },
      animation: {
        "typing-dot": "typing 1.4s infinite ease-in-out"
      },
      keyframes: {
        typing: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
