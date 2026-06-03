module.exports = {
  content: ["./*.html", "./*.js", "./visualizations/*.html"],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
    },
    extend: {
      colors: {
        dark: {
          bg: "#1a202c",
          text: "#e2e8f0",
        },
      },
    },
  },
};
