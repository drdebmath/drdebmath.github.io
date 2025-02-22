// Animated Rocket Timeline with refined aesthetics
const Timeline = ({ positions }) => {
    return React.createElement(
        "div",
        { className: "mt-12 relative" },
        // Rocket at the top - more visually appealing and slightly larger
        React.createElement(
            "div",
            { className: "flex justify-center mb-8" },
            React.createElement(
                "svg",
                {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 100 100",
                    className: "w-20 h-20", // Slightly larger rocket
                },
                // More refined gradient for a premium metallic look
                React.createElement(
                    "defs",
                    null,
                    React.createElement(
                        "linearGradient",
                        {
                            id: "metallicGradient",
                            x1: "0%",
                            y1: "0%",
                            x2: "100%",
                            y2: "0%",
                        },
                        React.createElement("stop", {
                            offset: "0%",
                            style: { stopColor: "#B0BEC5", stopOpacity: 1 }, // Light silver
                        }),
                        React.createElement("stop", {
                            offset: "50%",
                            style: { stopColor: "#ECEFF1", stopOpacity: 1 }, // Very light gray
                        }),
                        React.createElement("stop", {
                            offset: "100%",
                            style: { stopColor: "#B0BEC5", stopOpacity: 1 }, // Light silver
                        })
                    )
                ),
                // Body - smoother shape and fill
                React.createElement("path", {
                    d: "M45 85 L45 28 C45 23 55 23 55 28 L55 85 C55 90 45 90 45 85",
                    fill: "url(#metallicGradient)",
                    stroke: "#78909C", // Darker gray for better definition
                    strokeWidth: "1.2",
                }),
                // Nose cone - sharper and more defined
                React.createElement("path", {
                    d: "M45 28 C45 23 50 10 50 10 C50 10 55 23 55 28",
                    fill: "url(#metallicGradient)",
                    stroke: "#78909C",
                    strokeWidth: "1.2",
                }),
                // Fins - more subtle and refined
                React.createElement("path", {
                    d: "M45 33 L33 38 L45 43",
                    fill: "#90A4AE", // Medium gray for fins
                    stroke: "#78909C",
                    strokeWidth: "1",
                }),
                React.createElement("path", {
                    d: "M55 33 L67 38 L55 43",
                    fill: "#90A4AE",
                    stroke: "#78909C",
                    strokeWidth: "1",
                }),
                React.createElement("path", {
                    d: "M45 73 L30 83 L45 83",
                    fill: "#90A4AE",
                    stroke: "#78909C",
                    strokeWidth: "1",
                }),
                React.createElement("path", {
                    d: "M55 73 L70 83 L55 83",
                    fill: "#90A4AE",
                    stroke: "#78909C",
                    strokeWidth: "1",
                }),
                // Window - more prominent and styled
                React.createElement("circle", {
                    cx: "50",
                    cy: "38", // Adjusted window position slightly lower
                    r: "2.5", // Slightly larger window
                    fill: "#263238", // Darker window
                    stroke: "#78909C",
                    strokeWidth: "0.6",
                }),
                // Engine flames - more dynamic and vibrant
                React.createElement(
                    "path",
                    {
                        d: "M45 85 Q50 100 55 85",
                        fill: "none",
                        stroke: "#F44336", // Vibrant red flame
                        strokeWidth: "2.5", // Thicker flame
                        strokeLinecap: "round", // Rounded flame ends
                    },
                    React.createElement("animate", {
                        attributeName: "d",
                        dur: "0.4s", // Faster animation
                        repeatCount: "indefinite",
                        values: "M45 85 Q50 100 55 85;M45 85 Q50 92 55 85;M45 85 Q50 100 55 85", // More subtle flame variation
                    })
                ),
                React.createElement(
                    "path",
                    {
                        d: "M47 85 Q50 95 53 85",
                        fill: "none",
                        stroke: "#FFCDD2", // Lighter red for inner flame
                        strokeWidth: "1.8", // Slightly thicker inner flame
                        strokeLinecap: "round",
                    },
                    React.createElement("animate", {
                        attributeName: "d",
                        dur: "0.3s", // Faster inner flame animation
                        repeatCount: "indefinite",
                        values: "M47 85 Q50 95 53 85;M47 85 Q50 89 53 85;M47 85 Q50 95 53 85", // More subtle inner flame variation
                    })
                )
            )
        ),
        // Timeline line - more visually distinct
        React.createElement("div", {
            className: "absolute left-1/2 top-20 bottom-0 w-0.5 bg-indigo-300 dark:bg-indigo-700 transform -translate-x-1/2", // Indigo color for line, dark mode support
            style: { zIndex: 0, bottom: positions.length > 0 ? undefined : '20px' }, // Modified to stop at last position or rocket if no positions
        }),
        // Timeline items - refined styling and spacing
        positions
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
            .map((position, index) => React.createElement(
                "div",
                {
                    key: index,
                    className: "relative flex items-center py-6", // Added py-6 for vertical spacing
                },
                // Dot indicator - enhanced dot style
                React.createElement("div", {
                    className: "absolute left-1/2 w-5 h-5 rounded-full bg-indigo-500 border-2 border-white dark:bg-indigo-900 dark:border-gray-800 transform -translate-x-1/2", // Larger dot, indigo color
                    style: { zIndex: 1, boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.3)" }, // Subtle shadow for depth
                }),
                // Content - improved card styling
                React.createElement(
                    "div",
                    {
                        className: `w-1/2 ${index % 2 === 0 ? "pr-10 text-right" : "pl-10 ml-auto text-left" // Increased padding and aligned text
                            }`,
                    },
                    React.createElement(
                        "div",
                        {
                            className: "bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700", // Enhanced card styling, rounded corners, shadow, border
                        },
                        React.createElement(
                            "h3",
                            {
                                className: "font-bold text-gray-800 dark:text-gray-200 text-lg mb-2", // Darker title, larger font
                            },
                            position.title || position.tile
                        ),
                        React.createElement(
                            "p",
                            {
                                className: "mt-1 text-gray-700 dark:text-gray-300", // Darker description
                            },
                            `at ${position.institution.name}`
                        ),
                        position.institution.supervisor &&
                        React.createElement(
                            "p",
                            {
                                className: "mt-2 text-sm text-gray-600 dark:text-gray-400 italic", // Italic supervisor text
                            },
                            `with ${position.institution.supervisor.name}`
                        ),
                        React.createElement(
                            "div",
                            {
                                className: "mt-3 text-sm text-gray-500 dark:text-gray-300 font-medium", // Slightly bolder date
                            },
                            `${new Date(position.start_date).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                            })} ${position.end_date
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
