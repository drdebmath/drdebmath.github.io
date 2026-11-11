// Palette roles (see AGENT.md): Tailwind's own gray (ink on a white page) and its own
// blue, the site's main colour (top band, nav, footer, links, buttons). One typeface,
// Latin Modern: the face every paper in the field is typeset in.
const latinModern = ['"Latin Modern"', '"Latin Modern Roman"', '"Computer Modern"', "Georgia", "Cambria", "serif"];

module.exports = {
  content: ["./*.html", "./*.js", "./visualizations/*.html", "./shared.js"],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: latinModern,
      display: latinModern,
      mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
    extend: {
      colors: {
        // The four research themes.
        light: { 1: "#1d4ed8", 2: "#0f766e", 3: "#c2410c", 4: "#7e22ce" },
        lightd: { 1: "#93c5fd", 2: "#5eead4", 3: "#fdba74", 4: "#d8b4fe" },
        dark: { bg: "#0d1326", text: "#e5e7eb" },
      },
    },
  },
};
