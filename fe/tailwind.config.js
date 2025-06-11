/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#23272f",
        background: "#111827", // dark navy
        foreground: "#f3f4f6", // light gray
        card: "#1e293b", // slightly lighter than background
        "card-foreground": "#f3f4f6",
        input: "#23272f",
        ring: "#2563eb", // blue accent
        accent: "#2563eb", // blue accent for highlights
        warning: "#f59e42", // orange for warnings
        error: "#ef4444", // red for errors
        success: "#22c55e", // green for success
      },
      borderColor: {
        DEFAULT: "#23272f",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
