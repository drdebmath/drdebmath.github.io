// News section with subtle visual enhancements
const News = ({ data }) => {
    const [currentNewsIndex, setCurrentNewsIndex] = React.useState(0);
    const [showAllNews, setShowAllNews] = React.useState(false);

    const recentNews = data.news.slice(0, 5);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentNewsIndex((prevIndex) => prevIndex === recentNews.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [recentNews.length]);

    const currentNews = recentNews[currentNewsIndex];

    const NewsItem = ({ news }) => React.createElement(
        "div",
        { className: "space-y-3 dark:text-gray-200" }, // Slightly increased spacing in news item
        React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-300 font-medium" }, news.date), // Darker date
        React.createElement("p", { className: "mt-1 text-gray-800 dark:text-gray-200" }, news.title) // Darker title
    );

    return React.createElement(
        "div",
        { className: "space-y-6 mt-8 dark:bg-gray-800" }, // Increased marginTop for news section

        // Recent News Carousel - enhanced card and controls
        React.createElement(
            "div",
            {
                className: "bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700", // Enhanced card styling
            },
            React.createElement(
                "div",
                { className: "flex justify-between items-center mb-4 dark:text-gray-200" }, // Spacing for title and controls
                React.createElement("h3", { className: "font-semibold text-lg" }, "Latest News"), // Darker title
                React.createElement(
                    "div",
                    { className: "flex space-x-3" }, // Spacing for buttons
                    React.createElement(
                        "button",
                        {
                            onClick: () => setCurrentNewsIndex((prev) => prev === 0 ? recentNews.length - 1 : prev - 1
                            ),
                            className: "text-gray-700 dark:text-gray-300 hover:text-indigo-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200", // Styled buttons
                        },
                        "←"
                    ),
                    React.createElement(
                        "button",
                        {
                            onClick: () => setCurrentNewsIndex((prev) => prev === recentNews.length - 1 ? 0 : prev + 1
                            ),
                            className: "text-gray-700 dark:text-gray-300 hover:text-indigo-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200", // Styled buttons
                        },
                        "→"
                    )
                )
            ),
            currentNews.url
                ? React.createElement(
                    "a",
                    {
                        href: currentNews.url,
                        className: "block cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200 dark:hover:bg-gray-700", // Added padding and rounded corners on hover
                        target: "_blank",
                        rel: "noopener noreferrer",
                    },
                    React.createElement(NewsItem, { news: currentNews })
                )
                : React.createElement(NewsItem, { news: currentNews }),
            React.createElement(
                "div",
                { className: "flex justify-center space-x-2 mt-4" }, // Spacing for dots
                recentNews.map((_, index) => React.createElement("div", {
                    key: index,
                    className: `h-2.5 w-2.5 rounded-full ${index === currentNewsIndex ? "bg-indigo-600 dark:bg-indigo-300" : "bg-gray-300 dark:bg-gray-600" // Indigo active dot
                        }`,
                })
                )
            )
        ),

        // All News Section - styled button and list
        React.createElement(
            "div",
            { className: "mt-6 dark:text-gray-200" }, // Spacing for "View All News" button
            React.createElement(
                "button",
                {
                    onClick: () => setShowAllNews(!showAllNews),
                    className: "text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-gray-200", // Indigo button
                },
                showAllNews ? "Hide All News" : "View All News"
            ),
            showAllNews &&
            React.createElement(
                "div",
                { className: "mt-5 space-y-5" }, // Spacing for all news list
                data.news.map((news, index) => React.createElement(
                    "div",
                    {
                        key: index,
                        className: "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300", // Consistent card styling
                    },
                    news.url
                        ? React.createElement(
                            "a",
                            {
                                href: news.url,
                                className: "block cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200 dark:hover:bg-gray-700", // Hover effect for all news items
                                target: "_blank",
                                rel: "noopener noreferrer",
                            },
                            React.createElement(NewsItem, { news })
                        )
                        : React.createElement(NewsItem, { news })
                )
                )
            )
        )
    );
};
