/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0077B6",
          green: "#219653",
          yellow: "#E9C46A",
          dark: "#212529",
          light: "#F8F9FA",
        },
      },
      boxShadow: {
        card: "0 2px 24px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
