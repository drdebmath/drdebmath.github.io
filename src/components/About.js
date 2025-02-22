// Refined About section with better layout and styling
const About = ({ data }) => {
    const biodata = data.about_me.biodata;
    const bioWithLinks = convertToLinks(biodata);

    return React.createElement(
        "div",
        { className: "space-y-8 dark:bg-gray-800 dark:text-gray-200" }, // Dark mode support
        React.createElement(
            "div",
            {
                className: `bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700`, // Enhanced card styling for About section with dark mode
            },
            React.createElement(
                "div",
                { className: "mb-6" }, // Spacing for "About Me" text
                React.createElement("h2", { className: "text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4" }, "About Me"), // Section title styling
                React.createElement(
                    "div",
                    { className: "text-gray-700 dark:text-gray-300 leading-relaxed" },
                    React.createElement("p", { dangerouslySetInnerHTML: { __html: bioWithLinks } })
                )
            ),
            React.createElement(
                "div",
                null,
                React.createElement("h3", { className: "font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3" }, "Research Interests"), // Sub-section title styling
                React.createElement(
                    "div",
                    { className: "flex flex-wrap gap-3" }, // Improved gap for research topics
                    data.research.map((topic, index) => React.createElement(
                        "span",
                        {
                            key: index,
                            className: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200", // Enhanced tag styling with dark mode
                        },
                        topic
                    )
                    )
                )
            )
        ),
        React.createElement(News, { data }), // News section remains largely the same but inherits overall styling
        React.createElement(
            "div",
            {
                className: `bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700`, // Consistent card styling for Academic Journey with dark mode
            },
            React.createElement("h2", { className: "text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6" }, "Academic Journey"), // Section title
            React.createElement(Timeline, { positions: data.about_me.positions })
        )
    );
};
