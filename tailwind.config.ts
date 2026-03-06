import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        app: "28rem",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        /* Verde oliva */
        primary: {
          50: "#f5f6f0",
          100: "#e8ebdc",
          200: "#d1d7b8",
          300: "#b0ba8a",
          400: "#8f9c5c",
          500: "#6B7344",
          600: "#556B2F",
          700: "#4A5D23",
          800: "#3d4c1e",
          900: "#2d3816",
        },
        /* Bege – fundos e superfícies */
        sand: {
          50: "#FDFBF7",
          100: "#FAF8F3",
          200: "#F5F2EB",
          300: "#EDE8E0",
          400: "#E0DAD0",
        },
        /* Preto – texto e contraste */
        ink: {
          900: "#0a0a0a",
          800: "#171717",
          700: "#262626",
          600: "#525252",
          500: "#737373",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px -2px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
