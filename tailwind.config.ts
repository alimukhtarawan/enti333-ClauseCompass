import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a3060",
          dark: "#0f1f42",
          gold: "#c8921a",
          "gold-dark": "#a87510",
          green: "#2d7d44",
        },
      },
    },
  },
  plugins: [],
};
export default config;
