/** @type {import('tailwindcss').Config} */
module.exports = { 
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        background: "#1F2937", 
        foreground: "#374151", 
      },
    },
  },
  plugins: [],
};

