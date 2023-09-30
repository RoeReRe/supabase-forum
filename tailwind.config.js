/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{html,tsx}"],
  theme: {
    fontFamily: {
      sans: ["sofia-pro", "sans-serif"],
      display: ["cubano", "sans-serif"],
      body: ["sofia-pro", "sans-serif"],
      code: ["attribute-mono", "sans-serif"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      gray1: "#f8f8f8",
      gray2: "#dbe1e8",
      gray3: "#b2becd",
      gray4: "#6c7983",
      gray5: "#454e56",
      gray6: "#2a2e35",
      gray7: "#12181b",
      link: "#0000ee",
      blue: colors.blue,
      green: colors.green,
      pink: colors.pink,
      purple: colors.purple,
      orange: colors.orange,
      red: colors.red,
      yellow: colors.yellow,
      gray: colors.gray,
    },
    extend: {
      width: {
        128: "32rem",
        256: "64rem",
      }
    },
    plugins: [],
  }
}