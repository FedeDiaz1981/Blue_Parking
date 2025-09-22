// tailwind.config.js
// Tailwind CSS v3 configurado para uso con Astro

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"
  ],
  theme: {
    screens: {
              'sm': '480px', // Custom small screen breakpoint
              'md': '768px',
              'lg': '976px',
              'xl': '1440px',
              'desktop': '1920px', // Custom breakpoint named 'desktop'
            },
    extend: {
      colors: {
        brand: {
          blue: "#1753A8",
          blueDark: "#0C4AA3",
          blueLight: "#39A5DC",
          yellow: "#FFCC01",
          latte: "#D9C3A7",
          caramel: "#CEA068",
          espresso: "#AB5E18",
          coffee: "#372D25",
        },
      },
    },
  },
  plugins: [],
}
