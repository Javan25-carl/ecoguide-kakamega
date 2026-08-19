/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#2E7D32",
          light: "#66BB6A",
        },
        emerald: "#009688",
        sky: "#4FC3F7",
        soft: "#F5F5F5",
        charcoal: "#263238",
        gold: "#FFC107",
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(38, 50, 56, 0.08)",
        card: "0 2px 16px rgba(38, 50, 56, 0.06)",
      },
    },
  },
  plugins: [],
};
