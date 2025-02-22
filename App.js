const { useState, useEffect } = React;
const e = React.createElement;

// Reusable and beautiful Tab component
const Tab = ({ id, label, active, onClick }) => {
  return e(
    "button",
    {
      onClick: () => onClick(id),
      className: `
        px-5 py-3
        font-semibold rounded-lg
        transition-colors duration-200
        ${
          active
            ? "bg-indigo-700 text-white shadow-md hover:bg-indigo-600"
            : "text-gray-700 hover:bg-gray-100"
        }
      `,
    },
    label
  );
};

// Animated Rocket Timeline with refined aesthetics
const Timeline = ({ positions }) => {
  return e(
    "div",
    { className: "mt-12 relative" }, // Increased marginTop for better spacing
    // Rocket at the top - more visually appealing and slightly larger
    e(
      "div",
      { className: "flex justify-center mb-8" }, // Increased marginBottom
      e(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 100 100",
          className: "w-20 h-20", // Slightly larger rocket
        },
        // More refined gradient for a premium metallic look
        e(
          "defs",
          null,
          e(
            "linearGradient",
            {
              id: "metallicGradient",
              x1: "0%",
              y1: "0%",
              x2: "100%",
              y2: "0%",
            },
            e("stop", {
              offset: "0%",
              style: { stopColor: "#B0BEC5", stopOpacity: 1 }, // Light silver
            }),
            e("stop", {
              offset: "50%",
              style: { stopColor: "#ECEFF1", stopOpacity: 1 }, // Very light gray
            }),
            e("stop", {
              offset: "100%",
              style: { stopColor: "#B0BEC5", stopOpacity: 1 }, // Light silver
            })
          )
        ),
        // Body - smoother shape and fill
        e("path", {
          d: "M45 85 L45 28 C45 23 55 23 55 28 L55 85 C55 90 45 90 45 85",
          fill: "url(#metallicGradient)",
          stroke: "#78909C", // Darker gray for better definition
          strokeWidth: "1.2",
        }),
        // Nose cone - sharper and more defined
        e("path", {
          d: "M45 28 C45 23 50 10 50 10 C50 10 55 23 55 28",
          fill: "url(#metallicGradient)",
          stroke: "#78909C",
          strokeWidth: "1.2",
        }),
        // Fins - more subtle and refined
        e("path", {
          d: "M45 33 L33 38 L45 43",
          fill: "#90A4AE", // Medium gray for fins
          stroke: "#78909C",
          strokeWidth: "1",
        }),
        e("path", {
          d: "M55 33 L67 38 L55 43",
          fill: "#90A4AE",
          stroke: "#78909C",
          strokeWidth: "1",
        }),
        e("path", {
          d: "M45 73 L30 83 L45 83",
          fill: "#90A4AE",
          stroke: "#78909C",
          strokeWidth: "1",
        }),
        e("path", {
          d: "M55 73 L70 83 L55 83",
          fill: "#90A4AE",
          stroke: "#78909C",
          strokeWidth: "1",
        }),
        // Window - more prominent and styled
        e("circle", {
          cx: "50",
          cy: "38", // Adjusted window position slightly lower
          r: "2.5", // Slightly larger window
          fill: "#263238", // Darker window
          stroke: "#78909C",
          strokeWidth: "0.6",
        }),
        // Engine flames - more dynamic and vibrant
        e(
          "path",
          {
            d: "M45 85 Q50 100 55 85",
            fill: "none",
            stroke: "#F44336", // Vibrant red flame
            strokeWidth: "2.5", // Thicker flame
            strokeLinecap: "round", // Rounded flame ends
          },
          e("animate", {
            attributeName: "d",
            dur: "0.4s", // Faster animation
            repeatCount: "indefinite",
            values:
              "M45 85 Q50 100 55 85;M45 85 Q50 92 55 85;M45 85 Q50 100 55 85", // More subtle flame variation
          })
        ),
        e(
          "path",
          {
            d: "M47 85 Q50 95 53 85",
            fill: "none",
            stroke: "#FFCDD2", // Lighter red for inner flame
            strokeWidth: "1.8", // Slightly thicker inner flame
            strokeLinecap: "round",
          },
          e("animate", {
            attributeName: "d",
            dur: "0.3s", // Faster inner flame animation
            repeatCount: "indefinite",
            values:
              "M47 85 Q50 95 53 85;M47 85 Q50 89 53 85;M47 85 Q50 95 53 85", // More subtle inner flame variation
          })
        )
      )
    ),
    // Timeline line - more visually distinct
    e("div", {
      className:
        "absolute left-1/2 top-20 bottom-0 w-0.5 bg-indigo-300 transform -translate-x-1/2", // Indigo color for line
      style: { zIndex: 0, bottom: positions.length > 0 ? undefined : '20px' }, // Modified to stop at last position or rocket if no positions
    }),
    // Timeline items - refined styling and spacing
    positions
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .map((position, index) =>
        e(
          "div",
          {
            key: index,
            className: "relative flex items-center py-6", // Added py-6 for vertical spacing
          },
          // Dot indicator - enhanced dot style
          e("div", {
            className:
              "absolute left-1/2 w-5 h-5 rounded-full bg-indigo-500 border-2 border-white transform -translate-x-1/2", // Larger dot, indigo color
            style: { zIndex: 1, boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.3)" }, // Subtle shadow for depth
          }),
          // Content - improved card styling
          e(
            "div",
            {
              className: `w-1/2 ${
                index % 2 === 0 ? "pr-10 text-right" : "pl-10 ml-auto text-left" // Increased padding and aligned text
              }`,
            },
            e(
              "div",
              {
                className:
                  "bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100", // Enhanced card styling, rounded corners, shadow, border
              },
              e(
                "h3",
                { className: "font-bold text-gray-800 text-lg mb-2" }, // Darker title, larger font
                position.title || position.tile
              ),
              e(
                "p",
                { className: "mt-1 text-gray-700" }, // Darker description
                `at ${position.institution.name}`
              ),
              position.institution.supervisor &&
                e(
                  "p",
                  { className: "mt-2 text-sm text-gray-600 italic" }, // Italic supervisor text
                  `with ${position.institution.supervisor.name}`
                ),
              e(
                "div",
                { className: "mt-3 text-sm text-gray-500 font-medium" }, // Slightly bolder date
                `${new Date(position.start_date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })} ${
                  position.end_date
                    ? `- ${new Date(position.end_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}`
                    : "(Present)" // Added "(Present)" for ongoing positions
                }`
              )
            )
          )
        )
      )
  );
};

// Refined About section with better layout and styling
const About = ({ data }) => {
  return e(
    "div",
    { className: "space-y-8" }, // Increased spacing between sections
    e(
      "div",
      { className: "bg-white p-8 rounded-xl shadow-lg border border-gray-100" }, // Enhanced card styling for About section
      e(
        "div",
        { className: "mb-6" }, // Spacing for "About Me" text
        e("h2", { className: "text-2xl font-bold text-gray-800 mb-4" }, "About Me"), // Section title styling
        e(
          "div",
          { className: "text-gray-700 leading-relaxed" }, // Improved text styling
          data.about_me.biodata.short_bio[0]
        )
      ),
      e(
        "div",
        null,
        e("h3", { className: "font-semibold text-lg text-gray-800 mb-3" }, "Research Interests"), // Sub-section title styling
        e(
          "div",
          { className: "flex flex-wrap gap-3" }, // Improved gap for research topics
          data.research.map((topic, index) =>
            e(
              "span",
              {
                key: index,
                className:
                  "bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors duration-200", // Enhanced tag styling
              },
              topic
            )
          )
        )
      ),
    ),
    e(News, { data }), // News section remains largely the same but inherits overall styling
    e(
      "div",
      { className: "bg-white p-8 rounded-xl shadow-lg border border-gray-100" }, // Consistent card styling for Academic Journey
      e("h2", { className: "text-2xl font-bold text-gray-800 mb-6" }, "Academic Journey"), // Section title
      e(Timeline, { positions: data.about_me.positions })
    )
  );
};

// News section with subtle visual enhancements
const News = ({ data }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [showAllNews, setShowAllNews] = useState(false);

  const recentNews = data.news.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prevIndex) =>
        prevIndex === recentNews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [recentNews.length]);

  const currentNews = recentNews[currentNewsIndex];

  const NewsItem = ({ news }) =>
    e(
      "div",
      { className: "space-y-3" }, // Slightly increased spacing in news item
      e("p", { className: "text-sm text-gray-600 font-medium" }, news.date), // Darker date
      e("p", { className: "mt-1 text-gray-800" }, news.title) // Darker title
    );

  return e(
    "div",
    { className: "space-y-6 mt-8" }, // Increased marginTop for news section
    // Recent News Carousel - enhanced card and controls
    e(
      "div",
      {
        className:
          "bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100", // Enhanced card styling
      },
      e(
        "div",
        { className: "flex justify-between items-center mb-4" }, // Spacing for title and controls
        e("h3", { className: "font-semibold text-lg text-gray-800" }, "Latest News"), // Darker title
        e(
          "div",
          { className: "flex space-x-3" }, // Spacing for buttons
          e(
            "button",
            {
              onClick: () =>
                setCurrentNewsIndex((prev) =>
                  prev === 0 ? recentNews.length - 1 : prev - 1
                ),
              className: "text-gray-700 hover:text-indigo-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200", // Styled buttons
            },
            "←"
          ),
          e(
            "button",
            {
              onClick: () =>
                setCurrentNewsIndex((prev) =>
                  prev === recentNews.length - 1 ? 0 : prev + 1
                ),
              className: "text-gray-700 hover:text-indigo-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200", // Styled buttons
            },
            "→"
          )
        )
      ),
      currentNews.url
        ? e(
            "a",
            {
              href: currentNews.url,
              className:
                "block cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200", // Added padding and rounded corners on hover
              target: "_blank",
              rel: "noopener noreferrer",
            },
            e(NewsItem, { news: currentNews })
          )
        : e(NewsItem, { news: currentNews }),
      e(
        "div",
        { className: "flex justify-center space-x-2 mt-4" }, // Spacing for dots
        recentNews.map((_, index) =>
          e("div", {
            key: index,
            className: `h-2.5 w-2.5 rounded-full ${
              index === currentNewsIndex ? "bg-indigo-600" : "bg-gray-300" // Indigo active dot
            }`,
          })
        )
      )
    ),

    // All News Section - styled button and list
    e(
      "div",
      { className: "mt-6" }, // Spacing for "View All News" button
      e(
        "button",
        {
          onClick: () => setShowAllNews(!showAllNews),
          className: "text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200", // Indigo button
        },
        showAllNews ? "Hide All News" : "View All News"
      ),
      showAllNews &&
        e(
          "div",
          { className: "mt-5 space-y-5" }, // Spacing for all news list
          data.news.map((news, index) =>
            e(
              "div",
              {
                key: index,
                className: "bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300", // Consistent card styling
              },
              news.url
                ? e(
                    "a",
                    {
                      href: news.url,
                      className:
                        "block cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200", // Hover effect for all news items
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                    e(NewsItem, { news })
                  )
                : e(NewsItem, { news })
            )
          )
        )
    )
  );
};

// Publications section - improved filters and list appearance
const Publications = ({ data }) => {
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("year");
  const [sortOrder, setSortOrder] = useState("desc");

  const publicationTypes = ["all", "journal", "conference", "preprint"];

  const typeColors = {
    journal: "bg-green-50 border-green-200 text-green-800", // Green color scheme
    conference: "bg-blue-50 border-blue-200 text-blue-800", // Blue color scheme
    preprint: "bg-yellow-50 border-yellow-200 text-yellow-800", // Yellow color scheme
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

  return e(
    "div",
    { className: "space-y-6 mt-8" }, // Increased marginTop for publications section
    e(
      "div",
      { className: "mb-6 space-y-3" }, // Spacing for filter section
      // Publication type filters - enhanced button styling
      e(
        "div",
        { className: "flex space-x-3 justify-start" }, // Aligned filters to start
        publicationTypes.map((type) =>
          e(
            "button",
            {
              key: type,
              onClick: () => setSelectedType(type),
              className: `
                px-4 py-2 rounded-full text-sm font-medium
                transition-colors duration-200
                ${
                  selectedType === type
                    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500" // Indigo active state
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200" // Gray default state
                }
              `,
            },
            type.charAt(0).toUpperCase() + type.slice(1)
          )
        )
      ),
      // Sorting options - styled sorting controls
      e(
        "div",
        { className: "flex items-center space-x-5 justify-start" }, // Aligned sorting to start
        e(
          "div",
          {
            className:
              "flex items-center space-x-1 bg-gray-100 p-1.5 rounded-full", // Rounded container for sort buttons
          },
          e(
            "button",
            {
              onClick: () => setSortBy("year"),
              className: `px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                sortBy === "year"
                  ? "bg-white text-gray-800 shadow-sm" // White active state
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200" // Gray default state
              }`,
            },
            "Year"
          ),
          e(
            "button",
            {
              onClick: () => setSortBy("type"),
              className: `px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                sortBy === "type"
                  ? "bg-white text-gray-800 shadow-sm" // White active state
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200" // Gray default state
              }`,
            },
            "Type"
          )
        ),
        e(
          "button",
          {
            onClick: () => setSortOrder(sortOrder === "desc" ? "asc" : "desc"),
            className: "text-sm text-gray-600 hover:text-indigo-500 transition-colors duration-200", // Indigo sort order button
          },
          sortOrder === "desc" ? "↓ Descending" : "↑ Ascending"
        )
      )
    ),
    // Publication list - enhanced card styling and type badges
    filteredPublications.map((pub, index) =>
      e(
        "div",
        {
          key: index,
          className: `p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border ${
            typeColors[pub.type] || "bg-white border-gray-100" // Type-based background and border
          }`,
        },
        e(
          "div",
          { className: "flex justify-between items-start mb-3" }, // Spacing for title and type
          e("p", { className: "font-medium flex-grow text-gray-800" }, pub.title), // Darker title
          e(
            "span",
            {
              className: `text-xs px-3 py-1 rounded-full font-semibold border ${typeColors[pub.type]}`, // Type-based badge styling
            },
            pub.type.toUpperCase()
          )
        ),
        e(
          "p",
          { className: "text-sm text-gray-700 mt-1" }, // Darker authors
          pub.authors.join(", ")
        ),
        e(
          "p",
          { className: "text-sm text-gray-600 mt-2" }, // Darker journal/conference info
          `${pub.journal?.full || pub.conference?.name} (${pub.year})`
        ),
        pub.doi &&
          e(
            "a",
            {
              href: pub.doi,
              className:
                "text-indigo-600 hover:text-indigo-800 text-sm mt-3 inline-block font-medium transition-colors duration-200", // Indigo DOI link
              target: "_blank",
              rel: "noopener noreferrer",
            },
            "View DOI →" // More descriptive link text
          )
      )
    )
  );
};


// Main App component - enhanced header and overall layout
const App = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("data.json")
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

  if (loading) {
    return e(
      "div",
      { className: "min-h-screen flex items-center justify-center bg-gray-50" }, // Background for loading screen
      e("p", { className: "text-xl text-gray-700 font-semibold" }, "Loading...") // Styled loading text
    );
  }

  if (!data) {
    return e(
      "div",
      { className: "min-h-screen flex items-center justify-center bg-gray-50" }, // Background for error screen
      e("p", { className: "text-xl text-red-700 font-bold" }, "Error loading data") // Styled error text
    );
  }

  return e(
    "div",
    { className: "min-h-screen bg-gray-100" }, // Light gray background for the whole app
    e(
      "header",
      { className: "bg-white shadow-md" }, // Shadow for header
      e(
        "div",
        { className: "container mx-auto px-6 py-8" }, // Increased padding in header
        e(
          "div",
          { className: "flex justify-between items-center" },
          e(
            "div",
            null,
            e("h1", { className: "text-2xl font-bold text-indigo-800" }, data.about_me.name), // Indigo title
            e(
              "p",
              { className: "text-gray-700 mt-2" }, // Darker description
              `${data.about_me.position}, ${data.about_me.current_institution.name}` // More concise position info
            )
          ),
          e(
            "nav", // Using nav for semantic correctness
            { className: "flex space-x-5" }, // Spacing for tabs
            e(Tab, {
              id: "about",
              label: "About",
              active: activeTab === "about",
              onClick: setActiveTab,
            }),
            e(Tab, {
              id: "publications",
              label: "Publications",
              active: activeTab === "publications",
              onClick: setActiveTab,
            })
          )
        )
      )
    ),
    e(
      "main",
      { className: "container mx-auto px-6 py-10 max-w-5xl" }, // Increased max-width for content and padding
      activeTab === "about" && e(About, { data }),
      activeTab === "publications" && e(Publications, { data })
    )
  );
};

ReactDOM.render(e(App), document.getElementById("root"));