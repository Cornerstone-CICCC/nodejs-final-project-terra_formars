/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-teal": "#1ABC9C",
        "custom-yellow": "#FFC700",
        "custom-pink": "#FF8577",
        "custom-right-blue": "#699BF7",
        "custom-dark-blue": "#0E4EC5",
      },
      boxShadow: {
        custom: "5px 5px 0px 0px rgba(0, 0, 0, 1)",
      },
      borderWidth: {
        1.5: "1.5px",
      },
      fontFamily: {
        mochiy_pop_one: ["Mochiy Pop One", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        nunito: ["Nunito Sans", "sans-serif"],
        russo_one: ["Russo One", "sans-serif"],
      },
    },
  },
  plugins: [],
};
