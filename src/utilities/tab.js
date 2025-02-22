// Reusable and beautiful Tab component
const Tab = ({ id, label, active, onClick }) => {
    return React.createElement(
        "button",
        {
            onClick: () => onClick(id),
            className: `
        px-5 py-3
        font-semibold rounded-lg
        transition-colors duration-200
        ${active
                    ? "bg-indigo-700 text-white shadow-md hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900"}
      `,
        },
        label
    );
};
