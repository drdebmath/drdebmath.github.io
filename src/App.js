// Main App component - enhanced header and overall layout
const App = () => {
    const [activeTab, setActiveTab] = React.useState("about");
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    // Handle dark mode
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handler = (e) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Fetch data
    React.useEffect(() => {
        fetch("src/data.json")
            .then((response) => response.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading data:", error);
                setLoading(false);
            });
    }, []);

    React.useEffect(() => {
        window.onscroll = function() {
            const button = document.getElementById('goToTop');
            if (button) {
                if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                    button.style.display = 'block';
                } else {
                    button.style.display = 'none';
                }
            }
        };
    }, []);

    if (loading) {
        return React.createElement(
            "div",
            { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" },
            React.createElement("p", { className: "text-xl text-gray-700 dark:text-gray-300 font-semibold" }, "Loading...")
        );
    }

    if (!data) {
        return React.createElement(
            "div",
            { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" },
            React.createElement("p", { className: "text-xl text-red-700 dark:text-red-400 font-bold" }, "Error loading data")
        );
    }

    return React.createElement(
        "div",
        { className: "min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200" },
        React.createElement(
            "header",
            { className: "bg-white dark:bg-gray-800 shadow-md" },
            React.createElement(
                "div",
                { className: "container mx-auto px-6 py-8" },
                React.createElement(
                    "div",
                    { className: "flex justify-between items-center" },
                    React.createElement(
                        "div",
                        null,
                        React.createElement("h1", { className: "text-2xl font-bold text-indigo-800 dark:text-indigo-400" }, data.about_me.name),
                        React.createElement(
                            "p",
                            { className: "text-gray-700 dark:text-gray-300 mt-2" },
                            `${data.about_me.position}, ${data.about_me.current_institution.name}`
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "flex items-center space-x-5" },
                        React.createElement(
                            "nav",
                            { className: "flex space-x-5" },
                            React.createElement(Tab, {
                                id: "about",
                                label: "About",
                                active: activeTab === "about",
                                onClick: setActiveTab,
                            }),
                            React.createElement(Tab, {
                                id: "publications",
                                label: "Publications",
                                active: activeTab === "publications",
                                onClick: setActiveTab,
                            }),
                            React.createElement(DarkModeToggle, { isDark: isDarkMode, onToggle: () => setIsDarkMode(!isDarkMode) })
                        )
                    )
                )
            )
        ),
        React.createElement(
            "main",
            { className: "container mx-auto px-6 py-10 max-w-5xl" },
            activeTab === "about" && React.createElement(About, { data }),
            activeTab === "publications" && React.createElement(Publications, { data })
        ),
        React.createElement(
            "button",
            {
                id: "goToTop",
                className: "fixed bottom-10 right-10 p-2 rounded-full bg-indigo-600 dark:bg-indigo-300 text-white shadow-md hover:bg-indigo-500 dark:hover:bg-indigo-200 transition-colors duration-200",
                style: { display: "none" },
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            },
            "↑"
        )
    );
};

ReactDOM.render(React.createElement(App), document.getElementById("root"));