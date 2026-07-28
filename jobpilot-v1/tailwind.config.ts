import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          400: "#4c7bf0",
          500: "#3562e0",
          600: "#254bc2",
          900: "#101a3d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
