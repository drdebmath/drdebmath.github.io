// Publications section - improved filters and list appearance with author links
const Publications = ({ data }) => {
    const [selectedType, setSelectedType] = React.useState("all");
    const [sortBy, setSortBy] = React.useState("year");
    const [sortOrder, setSortOrder] = React.useState("desc");

    const publicationTypes = ["all", "journal", "conference", "preprint"];

    const typeColors = {
        journal: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200",
        conference: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200",
        preprint: "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
    };

    const renderAuthorWithLink = (author) => {
        const authorInfo = data.common_authors[author];
        if (authorInfo && authorInfo.url && authorInfo.url !== "#") {
            return React.createElement(
                "a",
                {
                    href: authorInfo.url,
                    className: "hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200",
                    target: "_blank",
                    rel: "noopener noreferrer"
                },
                author
            );
        }
        return author;
    };

    const renderAuthors = (authors) => {
        return authors.map((author, index) => {
            const element = renderAuthorWithLink(author);
            if (index === authors.length - 1) {
                return element;
            }
            return [element, ", "];
        });
    };

    const filteredPublications = data.publications
        .filter((pub) => selectedType === "all" || pub.type === selectedType)
        .sort((a, b) => {
            if (sortBy === "year") {
                return sortOrder === "desc" ? b.year - a.year : a.year - b.year;
            }
            if (sortBy === "type") {
                if (a.type === b.type) {
                    return sortOrder === "desc" ? b.year - a.year : a.year - b.year;
                }
                return a.type.localeCompare(b.type);
            }
            return 0;
        });

    return React.createElement(
        "div",
        { className: "space-y-6 mt-8" },
        React.createElement(
            "div",
            { className: "mb-6 space-y-3" },
            React.createElement(
                "div",
                { className: "flex space-x-3 justify-start" },
                publicationTypes.map((type) => React.createElement(
                    "button",
                    {
                        key: type,
                        onClick: () => setSelectedType(type),
                        className: `
                            px-4 py-2 rounded-full text-sm font-medium
                            transition-colors duration-200
                            ${selectedType === type
                                ? "bg-indigo-600 dark:bg-indigo-300 text-white shadow-md hover:bg-indigo-500 dark:hover:bg-indigo-200"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }
                        `,
                    },
                    type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1) + "s"
                ))
            ),
            React.createElement(
                "div",
                { className: "flex items-center space-x-5 justify-start" },
                React.createElement(
                    "div",
                    { className: "flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full" },
                    React.createElement(
                        "button",
                        {
                            onClick: () => setSortBy("year"),
                            className: `px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                sortBy === "year"
                                    ? "bg-white dark:bg-gray-700 text-gray-800 shadow-sm dark:text-gray-200"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`,
                        },
                        "Year"
                    ),
                    React.createElement(
                        "button",
                        {
                            onClick: () => setSortBy("type"),
                            className: `px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                sortBy === "type"
                                    ? "bg-white dark:bg-gray-700 text-gray-800 shadow-sm dark:text-gray-200"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`,
                        },
                        "Type"
                    )
                ),
                React.createElement(
                    "button",
                    {
                        onClick: () => setSortOrder(sortOrder === "desc" ? "asc" : "desc"),
                        className: "text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors duration-200",
                    },
                    sortOrder === "desc" ? "↓ Descending" : "↑ Ascending"
                )
            )
        ),
        filteredPublications.map((pub, index) => React.createElement(
            "div",
            {
                key: index,
                className: `p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border ${
                    typeColors[pub.type] || "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`,
            },
            React.createElement(
                "div",
                { className: "flex justify-between items-start mb-3" },
                React.createElement("p", { className: "font-medium flex-grow text-gray-800 dark:text-gray-200" }, pub.title),
                React.createElement(
                    "span",
                    {
                        className: `text-xs px-3 py-1 rounded-full font-semibold border ${typeColors[pub.type]}`,
                    },
                    pub.type.toUpperCase()
                )
            ),
            React.createElement(
                "p",
                { className: "text-sm text-gray-700 dark:text-gray-400 mt-1" },
                renderAuthors(pub.authors)
            ),
            React.createElement(
                "p",
                { className: "text-sm text-gray-600 dark:text-gray-500 mt-2" },
                `${pub.journal?.full || pub.conference?.full || pub.arxiv} (${pub.year})`
            ),
            pub.doi &&
            React.createElement(
                "a",
                {
                    href: pub.doi || pub.arxiv,
                    className: "text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-400 text-sm mt-3 inline-block font-medium transition-colors duration-200",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
                "doi"
            )
        ))
    );
};