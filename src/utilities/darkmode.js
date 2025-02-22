// Dark mode toggle component
const DarkModeToggle = ({ isDark, onToggle }) => {
    return React.createElement(
      "button",
      {
        onClick: onToggle,
        className: `fixed top-10 right-4 p-2 rounded-lg transition-colors duration-200 ${
          isDark ? "bg-gray-800 text-yellow-400" : "bg-white text-gray-700"
        } hover:opacity-80`,
        "aria-label": "Toggle dark mode"
      },
      isDark ? "🌙" : "☀️"
    );
  };