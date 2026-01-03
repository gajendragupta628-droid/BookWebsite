/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/views/**/*.ejs",
    "./src/public/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        // Core storefront palette: clean, book-focused (no harsh gold/black)
        charcoal: "#1e293b", // soft slate for body text
        onyx: "#020617",     // deep, ink-like accents
        ivory: "#f5efe6",    // warm, paper-like background
        gold: "#0d9488"      // refined teal accent for CTAs
      },
      boxShadow: {
        subtle: "0 2px 20px rgba(13,13,15,0.05)",
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio')
  ]
}
