/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      colors: {
        onyx: "#0F0F0F",
        gold: "#D4AF37",
        "gold-light": "#E5C866",
        "gold-dark": "#B8962E",
        ivory: "#FFFFFF",
        sand: "#EFECE4",
        mist: "#F8F8F8",
        charcoal: "#1A1A1A",
      },
      fontFamily: {
        serif: ["Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        display: ["Playfair Display", "Georgia", "serif"],
        garamond: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
        body: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.35em",
      },
      animation: {
        "kenburns": "kenburns 20s ease-out infinite alternate",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
      },
    },
  },
  plugins: [],
};
