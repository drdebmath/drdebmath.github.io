// Teaching and Talks section with consistent styling
const TeachingAndTalks = ({ data }) => {
    const [activeSection, setActiveSection] = React.useState("teaching");

    return React.createElement(
        "div",
        { className: "space-y-8 dark:bg-gray-800 dark:text-gray-200" },
        // Section Toggle
        React.createElement(
            "div",
            { className: "flex space-x-4 mb-6" },
            React.createElement(
                "button",
                {
                    onClick: () => setActiveSection("teaching"),
                    className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        activeSection === "teaching"
                            ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`,
                },
                "Teaching Experience"
            ),
            React.createElement(
                "button",
                {
                    onClick: () => setActiveSection("talks"),
                    className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        activeSection === "talks"
                            ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`,
                },
                "Talks & Presentations"
            )
        ),

        // Teaching Section
        activeSection === "teaching" && React.createElement(
            "div",
            { className: "space-y-6" },
            React.createElement("h2", { className: "text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6" }, "Teaching Experience"),
            data.teaching.map((course, index) => React.createElement(
                "div",
                {
                    key: index,
                    className: "bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700",
                },
                React.createElement("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2" }, course.course),
                React.createElement("p", { className: "text-gray-600 dark:text-gray-400" }, course.institution),
                React.createElement("p", { className: "text-gray-500 dark:text-gray-500 text-sm mt-2" }, course.duration || course.year)
            ))
        ),

        // Talks Section
        activeSection === "talks" && React.createElement(
            "div",
            { className: "space-y-6" },
            React.createElement("h2", { className: "text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6" }, "Talks & Presentations"),
            data.talks.map((talk, index) => React.createElement(
                "div",
                {
                    key: index,
                    className: "bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700",
                },
                React.createElement("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2" }, talk.title),
                React.createElement("p", { className: "text-gray-600 dark:text-gray-400 mb-2" }, talk.event),
                talk.Organizer && React.createElement(
                    "p",
                    { className: "text-gray-500 dark:text-gray-500 text-sm" },
                    "Organized by: ",
                    React.createElement(
                        "a",
                        {
                            href: talk.Organizer.url,
                            className: "text-indigo-600 dark:text-indigo-400 hover:underline",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        },
                        talk.Organizer.name
                    )
                ),
                talk.tweet && React.createElement(
                    "a",
                    {
                        href: talk.tweet,
                        className: "text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block",
                        target: "_blank",
                        rel: "noopener noreferrer"
                    },
                    "View on X"
                )
            ))
        )
    );
};