/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        clinical: "#0f766e",
        alert: "#b91c1c",
      },
    },
  },
  plugins: [],
};
