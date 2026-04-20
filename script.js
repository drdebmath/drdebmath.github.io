import {
  createLinkHtml,
  escapeHtml,
  formatDateRange,
  linkifyBiographyHtml,
  renderAwardsList,
  renderGrantsList,
  renderProfileHeader,
  setupDarkMode,
  setupGoToTopButton,
} from "./shared.js";

document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  setupGoToTopButton();

  if (!document.getElementById("publications_list")) {
    return;
  }

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      initializeWebsite(data);
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function initializeWebsite(data) {
  commonAuthors = data.common_authors || {};
  publications = data.publications || [];

  renderProfileHeader(data.about_me, {
    department: data.about_me?.department,
    stackedPosition: true,
  });
  setupNavbar(data);
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
        rightSidebar.classList.add("hidden");
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
    "publications_list",
    displayAllPublications,
    data.publications,
    "year"
  ); // Default grouping by year
  displaySectionContent(
    "teaching_content",
    displayTeachingSection,
    {
      currentTeaching: data.current_teaching || [],
      teaching: data.teaching || [],
    }
  );
  displaySectionContent("talks_list", displayTalks, data.talks);
  displaySectionContent("awards_content", displayAwards, data.awards);
  displaySectionContent("grants_content", displayGrants, data.grants);
  displaySectionContent(
    "community_services_list",
    displayCommunityServices,
    data.community_services
  );
  displaySectionContent(
    "administrative_responsibilities_content",
    displayAdministrativeResponsibilities,
    data.administrative_responsibilities
  );
  displaySectionContent("education_content", displayEducation, data.about_me?.education);
  displaySectionContent("positions_content", displayPositions, data.about_me?.positions);
  displaySectionContent("visualizations_content", displayVisualizations, data.visualizations);
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

function setupNavbar(data) {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.innerHTML = "";
  navbar.className =
    "grid grid-cols-2 gap-x-2 gap-y-1 md:flex md:flex-wrap md:gap-2 p-2";

  const featuredLinks = [];

  if (data.about_me?.cv?.url) {
    featuredLinks.push({ href: data.about_me.cv.url, label: "CV" });
  }

  const currentCourse = data.current_teaching?.[0];
  if (currentCourse?.url) {
    featuredLinks.push({
      href: currentCourse.url,
      label: (currentCourse.title || "Current Course").split(":")[0].trim(),
    });
  }

  const sectionLinks = [
    { id: "research", label: "Research" },
    { id: "publications", label: "Publications" },
    { id: "teaching", label: "Teaching" },
    { id: "talks", label: "Talks" },
    { id: "awards", label: "Awards" },
    { id: "grants", label: "Grants" },
    { id: "service", label: "Service" },
    { id: "visualizations", label: "Visualizations" },
  ].filter((section) => document.getElementById(section.id));

  [...featuredLinks, ...sectionLinks.map((section) => ({
    href: `#${section.id}`,
    label: section.label,
  }))].forEach((link) => {
    const li = document.createElement("li");
    li.className = "flex items-center w-full md:w-auto";
    li.innerHTML = createLinkHtml({
      url: link.href,
      label: link.label,
      className:
        "block w-full text-center px-2 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-900 text-gray-100 transition-colors duration-200",
    });
    navbar.appendChild(li);
  });
}

function displayAboutMe(aboutMe) {
  const container = document.getElementById("about_me_content");
  container.className =
    "text-justify dark:text-white bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 transition-colors duration-200";
  container.innerHTML = "";

  const bioContainer = document.createElement("div");
  bioContainer.innerHTML = linkifyBiographyHtml(aboutMe.biodata);
  container.appendChild(bioContainer);
}

function displayEducation(education) {
  const container = document.getElementById("education_content");
  if (!container) return;

  container.className = "space-y-4";
  container.innerHTML = education
    .map((entry) => {
      const institution = entry.institution?.url
        ? createLinkHtml({
            url: entry.institution.url,
            label: entry.institution.name,
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
          })
        : escapeHtml(entry.institution?.name || "");

      const supervisors =
        entry.supervisors && entry.supervisors.length
          ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Supervisors: ${entry.supervisors
              .map((supervisor) =>
                supervisor.url
                  ? createLinkHtml({
                      url: supervisor.url,
                      label: supervisor.name,
                      className:
                        "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
                    })
                  : escapeHtml(supervisor.name)
              )
              .join(", ")}</p>`
          : "";

      return `
        <article class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
          <p class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHtml(
            entry.degree || ""
          )}</p>
          <p class="mt-1 text-gray-700 dark:text-gray-200">${institution}</p>
          ${supervisors}
        </article>
      `;
    })
    .join("");
}

function displayPositions(positions) {
  const container = document.getElementById("positions_content");
  if (!container) return;

  container.className = "space-y-4";
  container.innerHTML = [...positions]
    .sort((left, right) => (right.start_date || "").localeCompare(left.start_date || ""))
    .map((entry) => {
      const institution = entry.institution?.url
        ? createLinkHtml({
            url: entry.institution.url,
            label: entry.institution.name,
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
          })
        : escapeHtml(entry.institution?.name || "");

      const supervisor = entry.institution?.supervisor
        ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">With ${
            entry.institution.supervisor.url
              ? createLinkHtml({
                  url: entry.institution.supervisor.url,
                  label: entry.institution.supervisor.name,
                  className:
                    "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
                })
              : escapeHtml(entry.institution.supervisor.name)
          }</p>`
        : "";

      const fellowship = entry.fellowship
        ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(
            entry.fellowship
          )}</p>`
        : "";

      return `
        <article class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHtml(
                entry.title || entry.tile || ""
              )}</p>
              <p class="text-gray-700 dark:text-gray-200">${institution}</p>
            </div>
            <p class="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">${escapeHtml(
              formatDateRange(entry.start_date, entry.end_date) || entry.duration || ""
            )}</p>
          </div>
          ${supervisor}
          ${fellowship}
        </article>
      `;
    })
    .join("");
}

function extractResourceLinks(item, { includePrimary = true } = {}) {
  const links = [];

  if (includePrimary && item.url) {
    links.push({ label: "Link", url: item.url });
  }

  if (item.urls) {
    Object.entries(item.urls).forEach(([label, url]) => {
      links.push({ label, url });
    });
  }

  if (item.slides) {
    links.push({ label: "Slides", url: item.slides });
  }

  return links;
}

function renderSupplementaryLinks(item, { includePrimary = true } = {}) {
  const links = extractResourceLinks(item, { includePrimary });
  if (links.length === 0) return "";

  return `
    <div class="mt-2 flex flex-wrap gap-3 text-sm">
      ${links
        .map((link) =>
          createLinkHtml({
            url: link.url,
            label: link.label.charAt(0).toUpperCase() + link.label.slice(1),
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
          })
        )
        .join("")}
    </div>
  `;
}

function formatNewsDateParts(dateString) {
  const parts = String(dateString || "").trim().split(/\s+/);
  return {
    day: parts[0] || "",
    month: (parts[1] || "").slice(0, 3),
    year: parts[parts.length - 1] || "",
  };
}

function renderNewsBody(item, { linkTitle = false } = {}) {
  const title = linkTitle && item.url
    ? createLinkHtml({
        url: item.url,
        label: item.title,
        className:
          "font-semibold text-blue-700 dark:text-blue-300 hover:underline transition-colors duration-200",
      })
    : `<span class="${linkTitle ? "font-semibold" : ""}">${escapeHtml(
        item.title || ""
      )}</span>`;

  return `
    <div>
      <p>${title}</p>
      ${renderSupplementaryLinks(item, { includePrimary: !linkTitle })}
    </div>
  `;
}

function displayNewsAndArchive(news) {
  const container = document.getElementById("news_content");
  const archiveContainer = document.getElementById("archive_list");

  if (!container || !archiveContainer) return;

  container.innerHTML = "";
  archiveContainer.innerHTML = "";

  if (!news || news.length === 0) {
    container.innerHTML = '<p class="dark:text-white">No news available.</p>';
    return;
  }

  const dateContainer = document.createElement("div");
  dateContainer.className = "flex flex-wrap mb-4 justify-center";
  const newsContainer = document.createElement("div");
  newsContainer.className =
    "news-item bg-white dark:bg-gray-800 p-4 shadow rounded border-l-4 border-green-600 dark:text-white transition-colors duration-200";

  let currentIndex = 0;
  let interval;
  const dateElements = [];

  function showNews(index) {
    dateElements.forEach((dateElement, itemIndex) => {
      dateElement.classList.toggle("bg-green-600", itemIndex === index);
      dateElement.classList.toggle("bg-blue-600", itemIndex !== index);
    });

    newsContainer.innerHTML = renderNewsBody(news[index], { linkTitle: true });
  }

  function startInterval() {
    clearInterval(interval);
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % Math.min(5, news.length);
      showNews(currentIndex);
    }, 3000);
  }

  news.slice(0, 5).forEach((item, index) => {
    const { day, month, year } = formatNewsDateParts(item.date);
    const dateElement = document.createElement("button");
    dateElement.type = "button";
    dateElement.className =
      "flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-blue-600 text-white rounded m-1 cursor-pointer transition-colors duration-200 hover:bg-green-600";
    dateElement.innerHTML = `
      <span class="text-xs">${escapeHtml(day)}</span>
      <span class="text-xs font-bold">${escapeHtml(month)}</span>
      <span class="text-xs font-bold">${escapeHtml(year)}</span>
    `;

    dateElement.addEventListener("mouseenter", () => {
      clearInterval(interval);
      currentIndex = index;
      showNews(index);
    });
    dateElement.addEventListener("mouseleave", startInterval);
    dateElement.addEventListener("click", () => {
      currentIndex = index;
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

  displayArchive(news.slice(5));
}

function displayArchive(archiveItems) {
  const archiveContainer = document.getElementById("archive_list");
  if (!archiveContainer) return;

  if (!archiveItems || archiveItems.length === 0) {
    archiveContainer.innerHTML =
      '<p class="text-gray-600 dark:text-gray-400 italic">No archived news yet.</p>';
    return;
  }

  const groupedByYear = archiveItems.reduce((accumulator, item) => {
    const yearMatch = item.date?.match(/\d{4}$/);
    const year = yearMatch ? yearMatch[0] : "Other";
    if (!accumulator[year]) accumulator[year] = [];
    accumulator[year].push(item);
    return accumulator;
  }, {});

  const years = Object.keys(groupedByYear).sort((left, right) => {
    if (left === "Other") return 1;
    if (right === "Other") return -1;
    return Number(right) - Number(left);
  });

  archiveContainer.innerHTML = years
    .map(
      (year) => `
        <div class="mt-8 mb-4">
          <button id="toggle-${year}" type="button" aria-expanded="false" aria-controls="archive-${year}-content"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors duration-200 flex items-center gap-2">
            <span>Show ${year} Archive</span>
            <svg id="toggle-icon-${year}" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div id="archive-${year}-content" class="hidden mt-4 space-y-4">
            ${groupedByYear[year]
              .map(
                (item) => `
                  <article class="news-item bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">
                    <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">${escapeHtml(
                      item.date || ""
                    )}</p>
                    <div class="mt-2">${renderNewsBody(item)}</div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");

  years.forEach((year) => {
    const toggleButton = document.getElementById(`toggle-${year}`);
    const content = document.getElementById(`archive-${year}-content`);
    const icon = document.getElementById(`toggle-icon-${year}`);

    toggleButton.addEventListener("click", () => {
      const isHidden = content.classList.contains("hidden");
      content.classList.toggle("hidden");
      toggleButton.setAttribute("aria-expanded", String(isHidden));
      icon.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
      toggleButton.querySelector("span").textContent = isHidden
        ? `Hide ${year} Archive`
        : `Show ${year} Archive`;
    });
  });
}

function displayResearchInterests(interests) {
  const container = document.getElementById("research_interests_content");
  if (!container) return;

  container.className =
    "bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200";
  container.innerHTML = (interests || [])
    .map(
      (interest) => `
        <span class="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2 border border-blue-200 dark:border-blue-800/50">
          ${escapeHtml(interest)}
        </span>
      `
    )
    .join("");
}

function displayCurrentResearch(currentResearch) {
  document.getElementById("current_research_content").innerHTML = `
    <p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">${escapeHtml(
      currentResearch || "No current research information available."
    )}</p>
  `;
}

function renderTeachingCards(
  courses,
  colorClass,
  sectionLabel,
  emptyMessage,
  flagClass = "bg-teal-700 before:border-t-teal-900"
) {
  const sectionFlag = `
    <div class="absolute -top-7 left-0 ${flagClass} text-white text-xs px-3 py-1 font-bold rounded-t-lg shadow-sm whitespace-nowrap z-10 before:content-[''] before:absolute before:top-full before:left-0 before:border-t-4 before:border-r-4 before:border-r-transparent">
      ${escapeHtml(sectionLabel)}
    </div>
  `;

  if (!Array.isArray(courses) || courses.length === 0) {
    return `
      <div class="teaching-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-64 mt-8 ${colorClass} flex flex-col justify-between relative transition-colors duration-200">
        ${sectionFlag}
        <p class="text-black dark:text-white font-medium">${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return courses
    .map((course, index) =>
      displayAsTeachingCard(
        {
          course: course.title || course.course || "",
          duration: course.session || course.duration || (course.year ? String(course.year) : ""),
          institution: course.institution || "",
          url: course.url,
        },
        colorClass,
        index === 0 ? sectionLabel : null,
        flagClass
      )
    )
    .join("");
}

function displayTeachingSection(teachingData) {
  const container = document.getElementById("teaching_content");
  if (!container) return;

  const currentTeaching = teachingData?.currentTeaching || [];
  const teaching = teachingData?.teaching || [];
  const currentStyle = {
    cardClass: "bg-teal-100 dark:bg-teal-900 border-teal-600",
    flagClass: "bg-teal-700 before:border-t-teal-900",
  };
  const pastStyle = {
    cardClass: "bg-emerald-100 dark:bg-emerald-900 border-emerald-600",
    flagClass: "bg-emerald-700 before:border-t-emerald-900",
  };

  container.className = "teaching-container mt-4 flex flex-wrap gap-4 items-stretch";
  container.innerHTML = `
    ${renderTeachingCards(
      currentTeaching,
      currentStyle.cardClass,
      "Current",
      "No current teaching information available.",
      currentStyle.flagClass
    )}
    ${renderTeachingCards(
      teaching,
      pastStyle.cardClass,
      "Past",
      "No past teaching information available.",
      pastStyle.flagClass
    )}
  `;
}

function displayVisualizations(visualizations) {
  const container = document.getElementById("visualizations_content");
  if (!container) return;

  const simulators = (visualizations?.simulators || []).filter(
    (item) => item.featured_on_homepage !== false
  );
  container.className = "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
  container.innerHTML = simulators
    .map((item) => {
      const primaryLink = createLinkHtml({
        url: item.url,
        label: item.name,
        className:
          "text-lg font-semibold text-blue-700 dark:text-blue-300 hover:underline transition-colors duration-200",
      });
      const sourceLink = item.source_url
        ? createLinkHtml({
            url: item.source_url,
            label: "Source code",
            className:
              "text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
          })
        : "";

      return `
        <article class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
          <p>${primaryLink}</p>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(
            item.description || "Interactive resource"
          )}</p>
          ${sourceLink ? `<p class="mt-3">${sourceLink}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function displayCV(cv) {
  const container = document.getElementById("cv_content");
  if (!container) return;

  const action = cv?.url
    ? createLinkHtml({
        url: cv.url,
        label: cv.label || "View CV",
        className:
          "inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition-colors duration-200",
      })
    : "";

  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
      <p class="text-gray-700 dark:text-gray-200">
        A dedicated CV page is available with education, academic positions, awards, teaching, and talks in one place.
      </p>
      ${action}
    </div>
  `;
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

  setActiveButton(groupByYearBtn, [groupByTypeBtn, groupByTopicBtn]);
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

function getPublicationAwardStyle(award) {
  const normalizedAward = award.toLowerCase();

  if (normalizedAward.includes("best paper")) {
    return {
      badgeClass:
        "bg-red-300 text-red-950 dark:bg-red-500/45 dark:text-red-50",
    };
  }

  if (normalizedAward.includes("best poster")) {
    return {
      badgeClass:
        "bg-cyan-100 text-cyan-900 dark:bg-cyan-300/15 dark:text-cyan-100",
    };
  }

  return {
    badgeClass:
      "bg-rose-100 text-rose-900 dark:bg-rose-300/15 dark:text-rose-100",
  };
}

function renderPublicationAwardBadge(award) {
  const { badgeClass } = getPublicationAwardStyle(award);

  return `
    <div class="absolute left-0 top-0 max-w-[calc(100%-4.5rem)] rounded-tl-md rounded-br-md px-2.5 py-1 text-[10px] font-semibold leading-none shadow-sm ${badgeClass}">
      ${escapeHtml(award)}
    </div>
  `;
}

function renderPublicationStatusBadge(label) {
  return `
    <div class="absolute right-0 top-0 rounded-tr-md rounded-bl-md bg-gray-100 px-2.5 py-1 text-[10px] font-medium leading-none text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
      ${escapeHtml(label)}
    </div>
  `;
}

function displayAsCard(item, groupBy, colors, cardIndex, groupIndex, yearLabel = null) {
  const yearFlag = yearLabel
    ? `<div class="absolute top-px -left-1 -translate-y-full bg-blue-600 text-white text-xs px-3 py-1 font-bold rounded-t-lg shadow-sm whitespace-nowrap z-10 before:content-[''] before:absolute before:top-full before:left-0 before:border-t-4 before:border-t-blue-800 before:border-r-4 before:border-r-transparent">
         ${yearLabel}
       </div>`
    : "";
  const topSpacingClass = yearLabel ? "mt-7" : "mt-8";
  const hasAwardBanner = Boolean(item.award);
  const journalOrConference =
    item.type === "preprint"
      ? "arXiv"
      : item.conference?.short || item.journal?.short || "";
  const awardBanner = hasAwardBanner ? renderPublicationAwardBadge(item.award) : "";
  const toAppearBanner = !item.doi ? renderPublicationStatusBadge("To appear") : "";
  const titleContent = item.doi
    ? createLinkHtml({
        url: item.doi,
        label: item.title,
        className: "hover:underline transition-colors duration-200",
      })
    : escapeHtml(item.title);
  const arxivBottomBanner = item.arxiv
    ? `<div class="absolute bottom-0 right-0 bg-green-500 text-white px-2 py-0.5 text-xs rounded-tl-md rounded-br-md">${createLinkHtml({
        url: item.arxiv,
        label: "arXiv",
        className: "text-white hover:underline transition-colors duration-200",
      })}</div>`
    : "";
  const cardColorClass =
    colors[item.type] || "bg-gray-100 dark:bg-gray-900 border-gray-600"; // Default color if type is not found
  const cardBottomPaddingClass = item.arxiv ? "pb-8" : "";
  const cardTopPaddingClass = awardBanner || toAppearBanner ? "pt-10" : "";

  const keywordBubbles = (item.keywords || [])
    .map(k => `<span class="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-bold mr-1 mb-1 border border-blue-200 dark:border-blue-800/50">${escapeHtml(k)}</span>`)
    .join("");
  const keywordSection = keywordBubbles
    ? `<div class="card-keywords mt-4 flex flex-wrap">
         ${keywordBubbles}
       </div>`
    : "";

  // Add a data attribute for identifying the card
  return `
    <div class="publication-card p-4 ${cardTopPaddingClass} shadow-lg rounded-lg border-l-4 w-full sm:w-56 ${topSpacingClass} ${cardBottomPaddingClass} ${cardColorClass} flex flex-col relative transition-colors duration-200 cursor-pointer"
         data-card-index="${cardIndex}" data-group-index="${groupIndex}">
      ${yearFlag}
      ${awardBanner}
      ${toAppearBanner}
      <div class="flex flex-1 flex-col">
        <div>
          <p class="card-title text-md font-bold text-black dark:text-white">${titleContent}</p>
          ${keywordSection}
        </div>
        <div class="mt-auto pt-5">
          <p class="card-authors text-sm font-semibold text-gray-800 dark:text-gray-200">${formatAuthors(item.authors)}</p>
          <p class="card-details text-sm text-gray-700 dark:text-gray-300 mt-3">
            ${journalOrConference} ${groupBy === "type" ? `(${item.year})` : ""}
          </p>
        </div>
      </div>
      ${arxivBottomBanner}
    </div>
  `;
}

function renderCommunityServiceItems(items, bulletClass) {
  if (!items?.length) {
    return `
      <p class="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        Not listed
      </p>
    `;
  }

  return `
    <ul class="space-y-2">
      ${items
        .map(
          (item) => `
            <li class="flex items-start gap-3 rounded-xl border border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-900/30 px-3 py-2">
              <span class="mt-2 h-2 w-2 shrink-0 rounded-full ${bulletClass}"></span>
              <span class="text-sm leading-6 text-gray-700 dark:text-gray-200">${escapeHtml(item)}</span>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function renderCommunityServicePills(items, pillClass) {
  if (!items?.length) {
    return `
      <p class="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        Not listed
      </p>
    `;
  }

  return `
    <div class="flex flex-wrap gap-2">
      ${items
        .map(
          (item) => `
            <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${pillClass}">
              ${escapeHtml(item)}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCommunityServiceCard({
  title,
  description,
  countLabel,
  accentBorderClass,
  badgeClass,
  contentHtml,
  spanClass = "",
}) {
  const badgeHtml = countLabel
    ? `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}">${countLabel}</span>`
    : "";

  return `
    <section class="rounded-2xl border-l-4 ${accentBorderClass} bg-white dark:bg-gray-800 shadow-md p-5 transition-colors duration-200 ${spanClass}">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">${description}</p>
        </div>
        ${badgeHtml}
      </div>
      ${contentHtml}
    </section>
  `;
}

function displayCommunityServices(services) {
  const container = document.getElementById("community_services_list");
  if (!container) return;

  const reviewerJournals = services.reviewer_for?.journals || [];
  const reviewerConferences = services.reviewer_for?.conferences || [];
  const pcMemberItems = services.pc_member_for || [];
  const organizingCommitteeItems = services.organizing_committee || [];

  const reviewerContent = `
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">Journals</h4>
          <span class="text-xs font-semibold text-amber-700 dark:text-amber-300">${reviewerJournals.length}</span>
        </div>
        ${renderCommunityServiceItems(reviewerJournals, "bg-amber-500")}
      </div>
      <div class="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">Conferences</h4>
          <span class="text-xs font-semibold text-amber-700 dark:text-amber-300">${reviewerConferences.length}</span>
        </div>
        ${renderCommunityServicePills(
          reviewerConferences,
          "border-amber-200 bg-white/85 text-amber-900 dark:border-amber-800/70 dark:bg-amber-900/40 dark:text-amber-100"
        )}
      </div>
    </div>
  `;

  container.className = "community-services mt-4 grid gap-4 xl:grid-cols-2";
  container.innerHTML = `
    ${renderCommunityServiceCard({
      title: "Reviewer",
      description: "Journal and conference reviewing activity across theory and distributed computing venues.",
      countLabel: `${reviewerJournals.length + reviewerConferences.length} venues`,
      accentBorderClass: "border-amber-500",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
      contentHtml: reviewerContent,
      spanClass: "xl:col-span-2",
    })}
    ${renderCommunityServiceCard({
      title: "PC Member",
      description: "Program committee and track-level service contributions.",
      countLabel: `${pcMemberItems.length} roles`,
      accentBorderClass: "border-blue-500",
      badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      contentHtml: renderCommunityServiceItems(pcMemberItems, "bg-blue-500"),
    })}
    ${renderCommunityServiceCard({
      title: "Organizing Committee",
      description: "Conference organization and workshop support.",
      countLabel: `${organizingCommitteeItems.length} event${organizingCommitteeItems.length === 1 ? "" : "s"}`,
      accentBorderClass: "border-emerald-500",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
      contentHtml: renderCommunityServiceItems(organizingCommitteeItems, "bg-emerald-500"),
    })}
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

    const filterContainer = document.createElement("div");
    filterContainer.id = "keyword-filter-container";
    filterContainer.className = "flex flex-wrap gap-2 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner";

    const helperText = document.createElement("p");
    helperText.className = "w-full text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider";
    helperText.textContent = "Filter publications by topic:";
    filterContainer.appendChild(helperText);

    const topicsArr = Array.from(allTopics).sort();

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

    if (e.target.closest("a")) {
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
        const debasishUrl = commonAuthors[author]?.url;
        return debasishUrl && debasishUrl !== "#"
          ? `<strong>${createLinkHtml({
              url: debasishUrl,
              label: author,
              className: `highlighted ${linkHoverClass}`,
            })}</strong>`
          : `<strong>${escapeHtml(author)}</strong>`;
      }
      const authorData = commonAuthors[author];
      return authorData && authorData.url !== "#"
        ? createLinkHtml({
            url: authorData.url,
            label: author,
            className: linkHoverClass,
          })
        : escapeHtml(author);
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
          createLinkHtml({
            url,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 mr-2",
          })
      )
      .join("")
    : "";

  const tweetHTML = talk.tweet
    ? createLinkHtml({
        url: talk.tweet,
        label: "Tweet",
        className:
          "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 mr-2",
      })
    : "";

  const authorHTML = talk.author
    ? `<div class="text-xs mt-1 text-gray-700 dark:text-gray-300">By ${createLinkHtml({
        url: talk.author.url,
        label: talk.author.name,
        className: "hover:underline",
      })}</div>`
    : "";

  const placeHTML = talk.Place
    ? `<div class="text-xs text-gray-600 dark:text-gray-400">${escapeHtml(
        talk.Place
      )}</div>`
    : "";

  const organizerHTML = talk.Organizer
    ? `<div class="text-xs text-gray-600 dark:text-gray-400">Org: ${createLinkHtml({
        url: talk.Organizer.url,
        label: talk.Organizer.name,
        className: "hover:underline",
      })}</div>`
    : "";

  return `
    <div class="talk-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-64 ${colorClass} flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      <div>
        <p class="card-title text-md font-bold text-black dark:text-white ${marginClass}">${escapeHtml(
          talk.title
        )}</p>
        ${talk.event
          ? `<p class="card-event text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">${escapeHtml(
              talk.event
            )}</p>`
          : ""}
        ${placeHTML}
        ${organizerHTML}
        ${authorHTML}
      </div>
      <div class="card-footer mt-2 flex flex-wrap gap-2 text-sm">
        ${talk.date ? `<span class="text-gray-600 dark:text-gray-400 italic">${escapeHtml(talk.date)}</span>` : ""}
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
  if (!container) return;

  container.innerHTML = renderAwardsList(awards);
}

function displayGrants(grants) {
  const container = document.getElementById("grants_content");
  if (!container) return;

  container.innerHTML = renderGrantsList(grants);
}

function displaySkills(skills) {
  const container = document.getElementById("skills_content");
  container.innerHTML = `
    <div class="skills-content bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
      <p class="dark:text-white"><strong class="skills-label dark:text-white">Programming:</strong> ${skills.programming ? skills.programming.map(escapeHtml).join(", ") : "Not listed"
    }</p>
      <p class="dark:text-white"><strong class="skills-label dark:text-white">Python Libraries:</strong> ${skills.python_libraries
      ? skills.python_libraries.map(escapeHtml).join(", ")
      : "Not listed"
    }</p>
    </div>
  `;
}

function displayAsTeachingCard(
  course,
  colorClass,
  sectionLabel = null,
  flagClass = "bg-teal-700 before:border-t-teal-900"
) {
  const courseTitle = course.course || "";
  const sectionFlag = sectionLabel
    ? `<div class="absolute -top-7 left-0 ${flagClass} text-white text-xs px-3 py-1 font-bold rounded-t-lg shadow-sm whitespace-nowrap z-10 before:content-[''] before:absolute before:top-full before:left-0 before:border-t-4 before:border-r-4 before:border-r-transparent">
         ${escapeHtml(sectionLabel)}
       </div>`
    : "";
  const marginClass =
    courseTitle.length <= 50
      ? "mb-20"
      : courseTitle.length <= 75
        ? "mb-14"
        : courseTitle.length <= 100
          ? "mb-8"
          : "mb-2";

  return `
    <div class="teaching-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-64 mt-8 ${colorClass} flex flex-col justify-between relative transition-colors duration-200">
      ${sectionFlag}
      <div>
        <p class="card-title text-md font-bold text-black dark:text-white ${marginClass}">${escapeHtml(
          courseTitle
        )}</p>
        <p class="card-institution text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">${escapeHtml(
          course.institution
        )}</p>
        <p class="card-duration text-xs text-gray-600 dark:text-gray-400">${escapeHtml(
          course.duration ? course.duration : (course.year ? String(course.year) : "")
        )}</p>
      </div>
      <div class="card-footer mt-2 text-sm">
        ${course.url
      ? createLinkHtml({
          url: course.url,
          label: "Course Website →",
          className:
            "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium",
        })
      : ""
    }
      </div>
    </div>
  `;
}

function displayAdministrativeResponsibilities(responsibilities) {
  const container = document.getElementById(
    "administrative_responsibilities_content"
  );
  if (!container) return;

  container.className = "space-y-4";
  container.innerHTML = responsibilities
    .map(
      (responsibility) => `
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
          <p class="text-gray-900 dark:text-white font-medium">${escapeHtml(
            responsibility
          )}</p>
        </div>
      `
    )
    .join("");
}
