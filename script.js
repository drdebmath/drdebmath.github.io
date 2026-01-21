document.addEventListener("DOMContentLoaded", () => {
  // Initialize dark mode preference from local storage or default to light mode
  const savedDarkMode = localStorage.getItem("darkMode");
  const darkMode = savedDarkMode === "true";
  document.documentElement.classList.toggle("dark", darkMode);

  // Set up dark mode toggle for all pages
  setupDarkMode(darkMode);

  // Set up go to top button if it exists
  if (document.getElementById("goToTop")) {
    setupGoToTopButton();
  }

  // Check which page we're on
  const isIndexPage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/");
  const isVizPage = window.location.pathname.includes("viz.html");

  if (isIndexPage) {
    // Only fetch data.json for the main index page
    fetch("data.json")
      .then((response) => response.json())
      .then((data) => {
        initializeWebsite(data, darkMode);
      })
      .catch((error) => console.error("Error fetching data:", error));
  } else if (isVizPage) {
    // For the viz page, just set up a simple navbar with a link back to home
    setupVizNavbar();
  }
});

function initializeWebsite(data, initialDarkMode) {
  commonAuthors = data.common_authors || {};
  publications = data.publications || [];

  setupHeader(data.about_me, data.about_me.department);
  setupNavbar(Object.keys(data));
  setupContentDisplay(data);
  setupGroupingButtons();
  setupResponsiveLayout();
}

/**
 * Handles moving the News section between the main column (mobile)
 * and the sidebar (desktop) to ensure no vertical gap issues.
 */
function setupResponsiveLayout() {
  const newsSection = document.getElementById("news");
  const rightSidebar = document.getElementById("right-sidebar");
  const aboutMeSection = document.getElementById("about_me");

  if (!newsSection || !rightSidebar || !aboutMeSection) return;

  const handleResize = () => {
    const isDesktop = window.matchMedia("(min-width: 1280px)").matches;

    if (isDesktop) {
      // Move to sidebar if not already there
      if (newsSection.parentElement !== rightSidebar) {
        rightSidebar.appendChild(newsSection);
        rightSidebar.classList.remove("hidden"); // Ensure sidebar is visible
      }
    } else {
      // Move back to main content flow (after About Me)
      if (newsSection.parentElement === rightSidebar) {
        aboutMeSection.insertAdjacentElement("afterend", newsSection);
        // Sidebar can be hidden or left empty
      }
    }
  };

  // Initial check
  handleResize();

  // Listen for resize events
  window.addEventListener("resize", handleResize);
}

function setupContentDisplay(data) {
  displaySectionContent("about_me_content", displayAboutMe, data.about_me);
  displaySectionContent("news_content", displayNewsAndArchive, data.news);
  displaySectionContent(
    "research_interests_content",
    displayResearchInterests,
    data.research
  );
  displaySectionContent(
    "current_research_content",
    displayCurrentResearch,
    data.current_research
  );
  displaySectionContent(
    "current_teaching_content",
    displayCurrentTeaching,
    data.current_teaching
  );
  displaySectionContent(
    "publications_list",
    displayAllPublications,
    data.publications,
    "year"
  ); // Default grouping by year
  displaySectionContent("talks_list", displayTalks, data.talks);
  displaySectionContent("awards_content", displayAwards, data.awards);
  displaySectionContent("skills_content", displaySkills, data.skills);
  displaySectionContent("teaching_list", displayTeaching, data.teaching);
  displaySectionContent(
    "community_services_list",
    displayCommunityServices,
    data.community_services
  );
  displaySectionContent("archive_list", displayArchive, data.news); // Assuming archive is part of news data
}

function displaySectionContent(elementId, displayFunction, data, ...args) {
  if (data) {
    // Check if data exists before trying to display
    displayFunction(data, ...args);
  } else {
    console.warn(`Data for section "${elementId}" is missing in data.json.`);
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML =
        '<p class="dark:text-gray-400 text-gray-600 italic">Content not available.</p>';
    }
  }
}

function setupDarkMode(initialDarkMode) {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const htmlElement = document.documentElement;
  let darkMode = initialDarkMode; // Start with the initial value

  darkModeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    htmlElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
  });
}

function setupGoToTopButton() {
  const goToTopButton = document.getElementById("goToTop");

  window.addEventListener("scroll", () => {
    goToTopButton.classList.toggle(
      "hidden",
      window.pageYOffset <= window.innerHeight
    );
  });

  goToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupHeader(aboutMe, department) {
  const nameElement = document.getElementById("name");
  const nameElementodia = document.getElementById("name_odia");
  const positionElement = document.getElementById("position");
  const linksElement = document.getElementById("links");
  const pictureElement = document.getElementById("picture");
  const pictureUrl = aboutMe?.picture || "default_picture.jpg"; // Fallback to a default picture if not provided
  if (!aboutMe) {
    console.warn("About me data is missing.");
    return;
  }

  nameElement.textContent = (aboutMe.name || "");
  nameElementodia.textContent = aboutMe.name_odia || "";

  const institutionName = aboutMe.current_institution?.name || "";
  const institutionUrl = aboutMe.current_institution?.url || "#";
  const linkedInstitution = institutionName ? `<a href="${institutionUrl}" target="_blank" class="hover:underline decoration-blue-300 decoration-2 underline-offset-2">${institutionName}</a>` : "";

  if (department && department.name && department.url) {
    positionElement.innerHTML = `${aboutMe.position || ""} at <a href="${department.url}" target="_blank" class="hover:underline decoration-blue-300 decoration-2 underline-offset-2">${department.name}</a>, ${linkedInstitution}`;
  } else {
    positionElement.innerHTML = `${aboutMe.position || ""} at ${linkedInstitution}`;
  }

  // Add office address if available
  if (department && department.office) {
    const formattedOffice = department.office.replace(/,/g, ',<br>');
    // Mobile/Tablet view (hidden on large screens)
    let officeElement = document.getElementById("office");
    if (!officeElement) {
      officeElement = document.createElement("p");
      officeElement.id = "office";
      officeElement.className = "text-md mt-1 font-medium opacity-90 lg:hidden";
      positionElement.parentNode.insertBefore(officeElement, linksElement);
    }
    officeElement.innerHTML = formattedOffice;

    // Desktop view (right side of header)
    const headerAddressContainer = document.getElementById("header_address_container");
    if (headerAddressContainer) {
      headerAddressContainer.innerHTML = `
            <p class="text-xs uppercase tracking-wider opacity-75 mb-1">Office</p>
            <p class="font-bold text-lg leading-tight text-white shadow-sm">${formattedOffice}</p>
        `;
    }
  }

  // Add the picture
  if (pictureElement) {
    pictureElement.innerHTML = `
      <img src="${pictureUrl}" alt="Profile picture" class="rounded-full object-cover mx-auto shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200 w-full h-full"/>
    `;
  }

  const linkIcons = [
    {
      href: aboutMe.dblp,
      src: "https://dblp.org/img/dblp.icon.192x192.png",
      alt: "DBLP Logo",
      title: "DBLP Profile",
    },
    {
      href: aboutMe.google_scholar,
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Scholar_logo.svg",
      alt: "Google Scholar Logo",
      title: "Google Scholar Profile",
    },
    {
      href: aboutMe.orcid,
      src: "https://orcid.org/sites/default/files/images/orcid_24x24.png",
      alt: "ORCID Logo",
      title: "ORCID Profile",
    },
    {
      href: aboutMe.x,
      src: "https://x.com/favicon.ico",
      alt: "X Logo",
      title: "X Profile",
    },
    {
      href: aboutMe.github,
      src: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      alt: "GitHub Logo",
      title: "GitHub Profile",
    },
    {
      href: aboutMe.linkedin,
      src: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
      alt: "LinkedIn Logo",
      title: "LinkedIn Profile",
    },
  ];

  const linksHTML = `
    <div class="flex items-center mt-4 justify-center">
      ${linkIcons
      .map((icon) =>
        icon.href
          ? `
        <a href="${icon.href}" class="p-4" title="${icon.title}">
          <img src="${icon.src}" alt="${icon.alt}" class="h-8 opacity-80 hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 rounded-full overflow-hidden" style="object-fit: cover;">
        </a>
      `: ""
      )
      .join("")}
    </div>
  `;

  linksElement.innerHTML = linksHTML;
}

function setupNavbar(sections) {
  const navbar = document.getElementById("navbar");
  navbar.innerHTML = ""; // clear any previous items

  const highLevel = ["research", "publications", "talks", "teaching"];

  // Add the fixed links first
  const fixed = [
    { href: "IITIJan2026CS637/", label: "CS637" },
    { href: "CCMModel/", label: "CCM Model" },
    { href: "LCMmodel/", label: "LCM Model" },
    { href: "visualizations/", label: "Visualizations" },
  ];

  // Create a <ul> for the navbar
  // For small screens: 2 rows, for md+: 1 row
  const ul = document.createElement("ul");
  ul.className =
    "grid grid-cols-2 gap-x-2 gap-y-1 md:flex md:flex-nowrap md:space-x-2 p-2";

  // Helper to add links
  [
    ...fixed,
    ...highLevel
      .filter((s) => sections.includes(s))
      .map((s) => ({
        href: "#" + s,
        label: s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()),
      })),
  ].forEach((link) => {
    const li = document.createElement("li");
    li.className = "flex items-center w-full md:w-auto";
    li.innerHTML = `<a href="${link.href}"
        class="block w-full text-center px-2 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-900
               text-gray-100 transition-colors duration-200">${link.label}</a>`;
    ul.appendChild(li);
  });

  navbar.appendChild(ul);
}


// Setup navbar for viz page
function setupVizNavbar() {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return; // Safety check

  // Clear any existing content
  navbarContainer.innerHTML = "";

  const navbarList = document.createElement("ul");
  navbarList.className = "text-xs flex flex-wrap justify-end space-x-2 p-2";

  navbarList.innerHTML = `
    <li class="navbar-item">
      <a href="index.html" class="text-gray-100 hover:underline px-2 py-1 rounded transition-colors duration-200 hover:bg-blue-700 dark:hover:bg-blue-900">
        Home
      </a>
    </li>
  `;

  navbarContainer.appendChild(navbarList);
}

function convertToLinks(bioData) {
  if (
    !bioData ||
    !bioData.urls ||
    !bioData.short_bio ||
    !bioData.short_bio[0]
  ) {
    return "";
  }
  let bioText = bioData.short_bio[0];

  for (const [name, url] of Object.entries(bioData.urls)) {
    const link = `<a class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200" href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`;
    bioText = bioText.replace(new RegExp(name, "g"), link);
  }
  return bioText;
}

function displayAboutMe(aboutMe) {
  const container = document.getElementById("about_me_content");
  container.className =
    "text-justify dark:text-white bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 transition-colors duration-200";

  const bioContainer = document.createElement("div");
  bioContainer.innerHTML = convertToLinks(aboutMe.biodata);
  container.appendChild(bioContainer);
}

function displayNewsAndArchive(news) {
  const container = document.getElementById("news_content");
  container.innerHTML = "";
  if (!news || news.length === 0) {
    container.innerHTML = '<p class="dark:text-white">No news available.</p>';
    return;
  }

  const dateContainer = document.createElement("div");
  dateContainer.className = "flex flex-wrap mb-4 justify-center";
  const newsContainer = document.createElement("div");
  newsContainer.className =
    "news-item bg-white dark:bg-gray-800 p-4 shadow rounded border-l-4 border-green-600 dark:text-white transition-colors duration-200";
  const archiveContainer = document.getElementById("archive_list");
  archiveContainer.innerHTML = "";

  let currentIndex = 0;
  let dateElements = [];
  let interval;

  function showNews(index) {
    dateElements.forEach((dateElement, i) => {
      dateElement.classList.toggle("bg-green-600", i === index);
      dateElement.classList.toggle("bg-blue-600", i !== index);
    });

    const item = news[index];
    newsContainer.innerHTML = `
        <p>${item.title}
          ${item.urls
        ? Object.entries(item.urls)
          .map(
            ([key, url]) =>
              `<a href="${url}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">${key}</a>`
          )
          .join(" ")
        : ""
      }
        </p>
      `;
  }

  function startInterval() {
    clearInterval(interval);
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % Math.min(5, news.length);
      showNews(currentIndex);
    }, 3000);
  }

  news.slice(0, 5).forEach((item, index) => {
    const [day, month, year] = item.date.split(" ");
    const dateElement = document.createElement("div");
    dateElement.className =
      "flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-blue-600 text-white rounded m-1 cursor-pointer transition-colors duration-200 hover:bg-green-600";
    dateElement.innerHTML = `
        <span class="text-xs">${day}</span>
        <span class="text-xs font-bold">${month}</span>
        <span class="text-xs font-bold">${year}</span>
      `;

    dateElement.addEventListener("mouseenter", () => {
      clearInterval(interval);
      currentIndex = index;
      showNews(index);
    });
    dateElement.addEventListener("mouseleave", startInterval);
    dateElement.addEventListener("click", () => {
      currentIndex = (index + 1) % Math.min(5, news.length);
      showNews(currentIndex);
      startInterval();
    });

    dateContainer.appendChild(dateElement);
    dateElements.push(dateElement);
  });

  container.appendChild(dateContainer);
  container.appendChild(newsContainer);

  showNews(currentIndex);
  startInterval();

  displayArchive(news.slice(5)); // Display archive here
}

function displayArchive(archiveItems) {
  const archiveContainer = document.getElementById("archive_list");
  if (!archiveContainer) return;

  // Group items by year
  const groupedByYear = archiveItems.reduce((acc, item) => {
    const yearMatch = item.date.match(/\d{4}$/);
    const year = yearMatch ? yearMatch[0] : "Other";
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return b - a;
  });

  const renderItem = (item) => `
    <div class="news-item bg-white dark:bg-gray-800 p-4 shadow mb-4 rounded dark:text-white transition-colors duration-200">
      <p>${item.date}: ${item.title}
        ${item.urls
      ? Object.entries(item.urls)
        .map(
          ([key, url]) =>
            `<a href="${url}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">${key}</a>`
        )
        .join(" ")
      : ""
    }
      </p>
    </div>
  `;

  archiveContainer.innerHTML = years.map(year => `
    <div class="mt-8 mb-4">
      <button id="toggle-${year}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors duration-200 flex items-center gap-2">
        <span>Show ${year} Archive</span>
        <svg id="toggle-icon-${year}" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="archive-${year}-content" class="hidden mt-4 space-y-4">
        ${groupedByYear[year].map(renderItem).join("")}
      </div>
    </div>
  `).join("");

  years.forEach(year => {
    const toggleBtn = document.getElementById(`toggle-${year}`);
    const content = document.getElementById(`archive-${year}-content`);
    const icon = document.getElementById(`toggle-icon-${year}`);

    toggleBtn.addEventListener("click", () => {
      const isHidden = content.classList.contains("hidden");
      content.classList.toggle("hidden");
      icon.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
      toggleBtn.querySelector("span").textContent = isHidden ? `Hide ${year} Archive` : `Show ${year} Archive`;
    });
  });
}

function displayResearchInterests(interests) {
  document.getElementById("research_interests_content").innerHTML = `
    <p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">${interests ? interests.join(", ") : "No research interests listed."
    }</p>
  `;
}

function displayCurrentResearch(currentResearch) {
  document.getElementById("current_research_content").innerHTML = `
    <p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">${currentResearch || "No current research information available."
    }</p>
  `;
}
function displayCurrentTeaching(currentTeaching) {
  const container = document.getElementById("current_teaching_content");
  if (!Array.isArray(currentTeaching) || currentTeaching.length === 0) {
    container.innerHTML = `
      <p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">
        No current teaching information available.
      </p>
    `;
    return;
  }
  container.innerHTML = currentTeaching
    .map(
      (course) => `
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded mb-4 dark:text-white transition-colors duration-200">
          <p><strong>Course:</strong> ${course.title || ""}</p>
          <p><strong>Session:</strong> ${course.session || ""}</p>
          <p><strong>Institution:</strong> ${course.institution || ""}</p>
          ${course.url
          ? `<a href="${course.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">(More details)</a>`
          : ""
        }
        </div>
      `
    )
    .join("");
}

function setupGroupingButtons() {
  const groupByTypeBtn = document.getElementById("group_by_type");
  const groupByYearBtn = document.getElementById("group_by_year");
  const groupByTopicBtn = document.getElementById("group_by_topic");

  if (!groupByTypeBtn || !groupByYearBtn || !groupByTopicBtn) return;

  groupByTypeBtn.addEventListener("click", () => {
    displayAllPublications(publications, "type");
    setActiveButton(groupByTypeBtn, [groupByYearBtn, groupByTopicBtn]);
  });

  groupByYearBtn.addEventListener("click", () => {
    displayAllPublications(publications, "year");
    setActiveButton(groupByYearBtn, [groupByTypeBtn, groupByTopicBtn]);
  });

  groupByTopicBtn.addEventListener("click", () => {
    displayAllPublications(publications, "topic");
    setActiveButton(groupByTopicBtn, [groupByTypeBtn, groupByYearBtn]);
  });

  setActiveButton(groupByTopicBtn, [groupByTypeBtn, groupByYearBtn]);
}

function setActiveButton(activeBtn, inactiveBtns) {
  activeBtn.classList.add("bg-blue-700", "text-white");
  activeBtn.classList.remove("bg-blue-500", "hover:bg-blue-700");

  inactiveBtns.forEach(btn => {
    btn.classList.add("bg-blue-500", "hover:bg-blue-700", "text-white");
    btn.classList.remove("bg-blue-700");
  });
}

function groupPublicationsByType(publications) {
  const typeOrder = ["journal", "conference", "poster", "preprint"];
  const groupedPublications = {};

  publications.forEach((pub) => {
    const type = pub.type;
    groupedPublications[type] = groupedPublications[type] || [];
    groupedPublications[type].push(pub);
  });

  return typeOrder.map((type) => ({
    type: type,
    publications: groupedPublications[type] || [],
  }));
}

function groupPublicationsByYear(publications) {
  const groupedPublications = {};

  publications.forEach((pub) => {
    const year = pub.year;
    groupedPublications[year] = groupedPublications[year] || [];
    groupedPublications[year].push(pub);
  });

  return Object.entries(groupedPublications)
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, pubs]) => ({ year: year, publications: pubs }));
}

function groupPublicationsByTopic(publications) {
  const groupedPublications = {};

  publications.forEach((pub) => {
    const keywords = pub.keywords || ["Other"];
    keywords.forEach(keyword => {
      groupedPublications[keyword] = groupedPublications[keyword] || [];
      groupedPublications[keyword].push(pub);
    });
  });

  return Object.entries(groupedPublications)
    .sort(([topicA], [topicB]) => topicA.localeCompare(topicB))
    .map(([topic, pubs]) => ({ type: topic, publications: pubs }));
}

function displayAsCard(item, groupBy, colors, cardIndex, groupIndex, yearLabel = null) {
  const yearFlag = yearLabel
    ? `<div class="absolute -top-7 left-0 bg-blue-600 text-white text-xs px-3 py-1 font-bold rounded-t-lg shadow-sm whitespace-nowrap z-10 before:content-[''] before:absolute before:top-full before:left-0 before:border-t-4 before:border-t-blue-800 before:border-r-4 before:border-r-transparent">
         ${yearLabel}
       </div>`
    : "";
  const marginClass =
    item.title.length <= 50
      ? "mb-20"
      : item.title.length <= 75
        ? "mb-14"
        : item.title.length <= 100
          ? "mb-8"
          : "mb-2";
  const journalOrConference =
    item.type === "preprint"
      ? "arXiv"
      : item.conference?.short || item.journal?.short || "";
  const toAppearBanner = !item.doi
    ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white px-1 py-0 origin-top-right text-xs rounded-l">To appear</div>`
    : "";
  const titleContent = item.doi
    ? `<a href="${item.doi}" target="_blank" class="hover:underline transition-colors duration-200">${item.title}</a>`
    : item.title;
  const arxivBottomBanner = item.arxiv
    ? `<div class="absolute bottom-0 right-0 bg-green-500 text-white px-2 py-0.5 text-xs rounded-l"><a href="${item.arxiv}" target="_blank" class="hover:underline transition-colors duration-200">arXiv</a></div>`
    : "";
  const cardColorClass =
    colors[item.type] || "bg-gray-100 dark:bg-gray-900 border-gray-600"; // Default color if type is not found

  const keywordBubbles = (item.keywords || [])
    .map(k => `<span class="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-bold mr-1 mb-1 border border-blue-200 dark:border-blue-800/50">${k}</span>`)
    .join("");

  // Add a data attribute for identifying the card
  return `
    <div class="publication-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-56 mt-8 ${cardColorClass} flex flex-col justify-between relative transition-colors duration-200 cursor-pointer"
         data-card-index="${cardIndex}" data-group-index="${groupIndex}">
      ${yearFlag}
      ${toAppearBanner}
      <div>
        <p class="card-title text-md font-bold text-black dark:text-white ${marginClass}">${titleContent}</p>
        <div class="card-keywords mb-4 flex flex-wrap">
          ${keywordBubbles}
        </div>
        <p class="card-authors text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">${formatAuthors(item.authors)}</p>
      </div>
      <div>
        <p class="card-details text-sm text-gray-700 dark:text-gray-300 mb-2">
          ${journalOrConference} ${groupBy === "type" ? `(${item.year})` : ""}
        </p>
        ${arxivBottomBanner}
      </div>
    </div>
  `;
}

// Helper to render the abstract popout
let activeTopics = new Set();
let topicsInitialized = false;
let currentFilterMode = "year";

const colors = {
  journal: "bg-red-100 dark:bg-red-900 border-red-600",
  conference: "bg-blue-100 dark:bg-blue-900 border-blue-600",
  poster: "bg-yellow-100 dark:bg-yellow-900 border-yellow-600",
  preprint: "bg-gray-100 dark:bg-gray-900 border-gray-600",
};

function displayAllPublications(publications, groupBy = "year") {
  currentFilterMode = groupBy;
  const container = document.getElementById("publications_list");
  if (!container) return;
  container.innerHTML = "";
  container.className = "publications-container mt-4";

  if (groupBy === "topic") {
    const allTopics = new Set();
    publications.forEach(pub => {
      (pub.keywords || ["Other"]).forEach(k => allTopics.add(k));
    });

    if (!topicsInitialized) {
      allTopics.forEach(t => activeTopics.add(t));
      topicsInitialized = true;
    }

    // Create topic buttons container
    const filterContainer = document.createElement("div");
    filterContainer.id = "keyword-filter-container";
    filterContainer.className = "flex flex-wrap gap-2 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner";

    // Add a helper text
    const helperText = document.createElement("p");
    helperText.className = "w-full text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider";
    helperText.textContent = "Filter publications by topic:";
    filterContainer.appendChild(helperText);

    // Create dynamic set of topics
    const topicsArr = Array.from(allTopics).sort();

    // Create selection shortcuts container
    const shortcutContainer = document.createElement("div");
    shortcutContainer.className = "w-full flex gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700";

    const selectAllBtn = document.createElement("button");
    selectAllBtn.className = "text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1";
    selectAllBtn.innerHTML = `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg> Select All`;
    selectAllBtn.onclick = () => {
      topicsArr.forEach(t => activeTopics.add(t));
      displayAllPublications(publications, "topic");
    };

    const deselectAllBtn = document.createElement("button");
    deselectAllBtn.className = "text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1";
    deselectAllBtn.innerHTML = `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg> Deselect All`;
    deselectAllBtn.onclick = () => {
      activeTopics.clear();
      displayAllPublications(publications, "topic");
    };

    shortcutContainer.appendChild(selectAllBtn);
    shortcutContainer.appendChild(deselectAllBtn);
    filterContainer.appendChild(shortcutContainer);

    topicsArr.forEach(topic => {
      const btn = document.createElement("button");
      const isActive = activeTopics.has(topic);
      btn.className = `px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border ${isActive
        ? "bg-blue-600 text-white border-blue-600 shadow-md"
        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
        }`;
      btn.textContent = topic;

      btn.onclick = () => {
        if (activeTopics.has(topic)) {
          activeTopics.delete(topic);
        } else {
          activeTopics.add(topic);
        }
        displayAllPublications(publications, "topic");
      };
      filterContainer.appendChild(btn);
    });
    container.appendChild(filterContainer);

    const filteredPubs = publications.filter(pub => {
      const pubKeywords = pub.keywords || ["Other"];
      return pubKeywords.some(k => activeTopics.has(k));
    });

    const cardContainer = document.createElement("div");
    cardContainer.className = "flex flex-wrap gap-4 items-stretch";
    filteredPubs.forEach((item, index) => {
      cardContainer.innerHTML += displayAsCard(item, groupBy, colors, index, 0);
    });
    container.appendChild(cardContainer);
  } else {
    const groupFunction = groupBy === "type" ? groupPublicationsByType : groupPublicationsByYear;
    const groupedPublications = groupFunction(publications);

    if (groupBy === "year") {
      const cardContainer = document.createElement("div");
      cardContainer.className = "flex flex-wrap gap-4 items-stretch";
      groupedPublications.forEach((group, groupIndex) => {
        group.publications.forEach((item, cardIndex) => {
          const yearLabel = cardIndex === 0 ? group.year : null;
          cardContainer.innerHTML += displayAsCard(item, groupBy, colors, cardIndex, groupIndex, yearLabel);
        });
      });
      container.appendChild(cardContainer);
    } else {
      groupedPublications.forEach((group, groupIndex) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "publication-group w-full mb-8";
        groupDiv.setAttribute("data-group-index", groupIndex);
        groupDiv.innerHTML = `
          <h3 class="group-title text-xl font-bold mb-4 dark:text-white transition-colors duration-200">
            ${group.type.charAt(0).toUpperCase() + group.type.slice(1).toLowerCase() + "s"}
          </h3>
          <div class="publication-cards flex flex-wrap gap-4 items-stretch">  
            ${group.publications.map((item, cardIndex) => displayAsCard(item, groupBy, colors, cardIndex, groupIndex)).join("")}
          </div>
        `;
        container.appendChild(groupDiv);
      });
    }
  }
  setupPublicationClickHandlers(container, publications, groupBy);
}

function setupPublicationClickHandlers(container, allPublications, groupBy) {
  let openAbstract = { groupIndex: null, cardIndex: null };

  function removeAbstractPopout() {
    const existing = container.querySelector(".publication-abstract-wrapper");
    if (existing) existing.remove();
    openAbstract = { groupIndex: null, cardIndex: null };
  }

  container.onclick = function (e) {
    if (e.target.classList.contains("close-abstract-popout")) {
      removeAbstractPopout();
      return;
    }

    let card = e.target;
    while (card && !card.classList.contains("publication-card")) {
      card = card.parentElement;
    }
    if (!card) return;

    const cardIndex = parseInt(card.getAttribute("data-card-index"));
    const groupIndex = parseInt(card.getAttribute("data-group-index"));

    let pub;
    if (groupBy === "topic") {
      const filteredPubs = allPublications.filter(p => {
        const pKeywords = p.keywords || ["Other"];
        return pKeywords.some(k => activeTopics.has(k));
      });
      pub = filteredPubs[cardIndex];
    } else {
      const groupFunction = groupBy === "type" ? groupPublicationsByType : groupPublicationsByYear;
      const grouped = groupFunction(allPublications);
      pub = grouped[groupIndex]?.publications[cardIndex];
    }

    if (!pub || !pub.abstract) return;

    if (openAbstract.groupIndex === groupIndex && openAbstract.cardIndex === cardIndex) {
      removeAbstractPopout();
      return;
    }

    removeAbstractPopout();

    const abstractDiv = document.createElement("div");
    abstractDiv.className = "publication-abstract-wrapper w-full";
    abstractDiv.style.width = "100%";
    abstractDiv.innerHTML = renderAbstractPopout(pub);

    if (card.nextSibling) {
      card.parentElement.insertBefore(abstractDiv, card.nextSibling);
    } else {
      card.parentElement.appendChild(abstractDiv);
    }

    const closeBtn = abstractDiv.querySelector(".close-abstract-popout");
    if (closeBtn) {
      closeBtn.onclick = function (event) {
        event.stopPropagation();
        removeAbstractPopout();
      };
    }

    if (window.renderMathInElement) {
      renderMathInElement(abstractDiv, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }

    openAbstract = { groupIndex, cardIndex };
  };
}

function renderAbstractPopout(item) {
  if (!item.abstract) return "";
  const keywordBubbles = (item.keywords || [])
    .map(k => `<span class="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold mr-1 mb-1 border border-blue-200 dark:border-blue-800">${k}</span>`)
    .join("");

  return `
    <div class="publication-abstract-popout w-full bg-white dark:bg-gray-900 border-t-4 border-blue-600 p-6 my-2 shadow-lg rounded-lg z-20 transition-colors duration-200">
      <div class="flex justify-between items-center mb-4">
        <div class="flex flex-wrap items-center">
          <span class="font-bold text-lg text-black dark:text-white mr-4">Abstract</span>
          ${keywordBubbles}
        </div>
        <button class="close-abstract-popout text-gray-600 dark:text-gray-300 hover:text-red-600 text-xl font-bold px-2">&times;</button>
      </div>
      <div class="text-gray-800 dark:text-gray-200 text-justify leading-relaxed">${item.abstract}</div>
    </div>
  `;
}

let commonAuthors = {};
let publications = [];

function formatAuthors(authors) {
  const linkHoverClass =
    "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200";
  return authors
    .map((author) => {
      if (author === "Debasish Pattanayak") {
        return `<strong><a href="${commonAuthors[author]?.url || "#"
          }" class="highlighted ${linkHoverClass}">${author}</a></strong>`;
      }
      const authorData = commonAuthors[author];
      return authorData && authorData.url !== "#"
        ? `<a href="${authorData.url}" class="${linkHoverClass}">${author}</a>`
        : author;
    })
    .join(", ");
}

function displayAsTalkCard(talk, colorClass) {
  const marginClass =
    talk.title.length <= 50
      ? "mb-20"
      : talk.title.length <= 75
        ? "mb-14"
        : talk.title.length <= 100
          ? "mb-8"
          : "mb-2";

  const linksHTML = talk.links
    ? Object.entries(talk.links)
      .map(
        ([key, url]) =>
          `<a href="${url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 mr-2">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`
      )
      .join("")
    : "";

  const tweetHTML = talk.tweet
    ? `<a href="${talk.tweet}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 mr-2">Tweet</a>`
    : "";

  const authorHTML = talk.author
    ? `<div class="text-xs mt-1 text-gray-700 dark:text-gray-300">By <a href="${talk.author.url}" target="_blank" class="hover:underline">${talk.author.name}</a></div>`
    : "";

  const placeHTML = talk.Place
    ? `<div class="text-xs text-gray-600 dark:text-gray-400">${talk.Place}</div>`
    : "";

  const organizerHTML = talk.Organizer
    ? `<div class="text-xs text-gray-600 dark:text-gray-400">Org: <a href="${talk.Organizer.url}" target="_blank" class="hover:underline">${talk.Organizer.name}</a></div>`
    : "";

  return `
    <div class="talk-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-64 ${colorClass} flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      <div>
        <p class="card-title text-md font-bold text-black dark:text-white ${marginClass}">${talk.title}</p>
        <p class="card-event text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">${talk.event}</p>
        ${placeHTML}
        ${organizerHTML}
        ${authorHTML}
      </div>
      <div class="card-footer mt-2 flex flex-wrap gap-2 text-sm">
        ${talk.date ? `<span class="text-gray-600 dark:text-gray-400 italic">${talk.date}</span>` : ""}
        <div class="flex gap-2">
          ${linksHTML}
          ${tweetHTML}
        </div>
      </div>
    </div>
  `;
}

function displayTalks(talks) {
  const container = document.getElementById("talks_list");
  container.className = "talks-container flex flex-wrap gap-4 items-stretch mt-4";
  const colorClass = "bg-purple-100 dark:bg-purple-900 border-purple-600";

  container.innerHTML = talks
    .map((talk) => displayAsTalkCard(talk, colorClass))
    .join("");
}

function displayAwards(awards) {
  const container = document.getElementById("awards_content");
  container.innerHTML = awards
    .map(
      (award) => `
    <div class="awards-item bg-white dark:bg-gray-800 p-4 shadow mb-4 rounded transition-colors duration-200">
      <p class="dark:text-white">${award}</p>
    </div>
  `
    )
    .join("");
}

function displaySkills(skills) {
  const container = document.getElementById("skills_content");
  container.innerHTML = `
    <div class="skills-content bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
      <p class="dark:text-white"><strong class="skills-label dark:text-white">Programming:</strong> ${skills.programming ? skills.programming.join(", ") : "Not listed"
    }</p>
      <p class="dark:text-white"><strong class="skills-label dark:text-white">Python Libraries:</strong> ${skills.python_libraries
      ? skills.python_libraries.join(", ")
      : "Not listed"
    }</p>
    </div>
  `;
}

function displayAsTeachingCard(course, colorClass) {
  const marginClass =
    course.course.length <= 50
      ? "mb-20"
      : course.course.length <= 75
        ? "mb-14"
        : course.course.length <= 100
          ? "mb-8"
          : "mb-2";

  return `
    <div class="teaching-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-64 ${colorClass} flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      <div>
        <p class="card-title text-md font-bold text-black dark:text-white ${marginClass}">${course.course}</p>
        <p class="card-institution text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">${course.institution}</p>
        <p class="card-duration text-xs text-gray-600 dark:text-gray-400">${course.duration ? course.duration : (course.year ? course.year : "")}</p>
      </div>
      <div class="card-footer mt-2 text-sm">
        ${course.url
      ? `<a href="${course.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium">Course Website &rarr;</a>`
      : ""
    }
      </div>
    </div>
  `;
}

function displayTeaching(teaching) {
  const container = document.getElementById("teaching_list");
  container.className = "teaching-container flex flex-wrap gap-4 items-stretch mt-4";
  const colorClass = "bg-teal-100 dark:bg-teal-900 border-teal-600";

  container.innerHTML = teaching
    .map((course) => displayAsTeachingCard(course, colorClass))
    .join("");
}

function displayCommunityServices(services) {
  const container = document.getElementById("community_services_list");
  container.className =
    "community-services bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200 mt-4";
  container.innerHTML = `
    <ul class="community-services-list list-disc pl-5">
      <li class="community-services-item mb-2 dark:text-white">
        <strong class="community-services-label dark:text-white">PC member:</strong>
        <ul class="community-services-sublist ml-4 list-disc">
          ${services.pc_member_for
      ?.map((item) => `<li>${item}</li>`)
      .join("") || "<li>Not listed</li>"
    }
        </ul>
      </li>
      <li class="community-services-item mb-2 dark:text-white">
        <strong class="community-services-label dark:text-white">Reviewer:</strong>
        <ul class="community-services-sublist ml-4 list-disc">
          <li>
            <strong class="community-services-sublabel dark:text-white">Journals:</strong>
            <ul class="community-services-sublist-inner ml-4 list-disc">
              ${services.reviewer_for?.journals
      ?.map((journal) => `<li>${journal}</li>`)
      .join("") || "<li>Not listed</li>"
    }
            </ul>
          </li>
          <li>
            <strong class="community-services-sublabel dark:text-white">Conferences:</strong>
            <ul class="community-services-sublist-inner ml-4 list-disc">
              ${services.reviewer_for?.conferences
      ?.map((conf) => `<li>${conf}</li>`)
      .join("") || "<li>Not listed</li>"
    }
            </ul>
          </li>
        </ul>
      </li>
      <li class="community-services-item mb-2 dark:text-white">
        <strong class="community-services-label dark:text-white">Organizing committee:</strong>
        <p class="community-services-text ml-4">${services.organizing_committee?.join(", ") || "Not listed"
    }</p>
      </li>
    </ul>
  `;
}
