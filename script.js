document.addEventListener("DOMContentLoaded", () => {
  // Initialize dark mode preference from local storage or default to light mode
  const savedDarkMode = localStorage.getItem('darkMode');
  const darkMode = savedDarkMode === 'true';
  document.documentElement.classList.toggle('dark', darkMode);

  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      initializeWebsite(data, darkMode);
    })
    .catch(error => console.error("Error fetching data:", error));
});

function initializeWebsite(data, initialDarkMode) {
  commonAuthors = data.common_authors || {};
  publications = data.publications || [];

  setupHeader(data.about_me);
  setupNavbar(Object.keys(data));
  setupContentDisplay(data);
  setupGroupingButtons();
  setupDarkMode(initialDarkMode);
  setupGoToTopButton();
}

function setupContentDisplay(data) {
  displaySectionContent("about_me_content", displayAboutMe, data.about_me);
  displaySectionContent("news_content", displayNewsAndArchive, data.news);
  displaySectionContent("research_interests_content", displayResearchInterests, data.research);
  displaySectionContent("current_research_content", displayCurrentResearch, data.current_research);
  displaySectionContent("publications_list", displayAllPublications, data.publications, "year"); // Default grouping by year
  displaySectionContent("talks_list", displayTalks, data.talks);
  displaySectionContent("awards_content", displayAwards, data.awards);
  displaySectionContent("skills_content", displaySkills, data.skills);
  displaySectionContent("teaching_list", displayTeaching, data.teaching);
  displaySectionContent("community_services_list", displayCommunityServices, data.community_services);
  displaySectionContent("archive_list", displayArchive, data.news); // Assuming archive is part of news data
}

function displaySectionContent(elementId, displayFunction, data, ...args) {
  if (data) { // Check if data exists before trying to display
    displayFunction(data, ...args);
  } else {
    console.warn(`Data for section "${elementId}" is missing in data.json.`);
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = '<p class="dark:text-gray-400 text-gray-600 italic">Content not available.</p>';
    }
  }
}


function setupDarkMode(initialDarkMode) {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const htmlElement = document.documentElement;
  let darkMode = initialDarkMode; // Start with the initial value

  darkModeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    htmlElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  });
}

function setupGoToTopButton() {
  const goToTopButton = document.getElementById('goToTop');

  window.addEventListener('scroll', () => {
    goToTopButton.classList.toggle('hidden', window.pageYOffset <= window.innerHeight);
  });

  goToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupHeader(aboutMe) {
  const nameElement = document.getElementById("name");
  const positionElement = document.getElementById("position");
  const linksElement = document.getElementById("links");

  if (!aboutMe) {
    console.warn("About me data is missing.");
    return;
  }

  nameElement.textContent = aboutMe.name || "";
  positionElement.textContent = (aboutMe.position || "") + " at " + (aboutMe.current_institution.name || "");

  const linkIcons = [
    { href: aboutMe.dblp, src: "https://dblp.org/img/dblp.icon.192x192.png", alt: "DBLP Logo", title: "DBLP Profile" },
    { href: aboutMe.google_scholar, src: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Scholar_logo.svg", alt: "Google Scholar Logo", title: "Google Scholar Profile" },
    { href: aboutMe.orcid, src: "https://orcid.org/sites/default/files/images/orcid_24x24.png", alt: "ORCID Logo", title: "ORCID Profile" },
    { href: aboutMe.x, src: "https://x.com/favicon.ico", alt: "X Logo", title: "X Profile"},
    { href: aboutMe.github, src: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", alt: "GitHub Logo", title: "GitHub Profile"},
    { href: aboutMe.linkedin, src: "https://cdn-icons-png.flaticon.com/512/174/174857.png", alt: "LinkedIn Logo", title: "LinkedIn Profile"},
  ];

  const linksHTML = `
    <div class="flex items-center mt-4 justify-center">
      ${linkIcons.map(icon => icon.href ? `
        <a href="${icon.href}" class="p-4" title="${icon.title}">
          <img src="${icon.src}" alt="${icon.alt}" class="h-8 opacity-80 hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 rounded-full overflow-hidden" style="object-fit: cover;">
        </a>
      ` : '').join('')}
    </div>
  `;

  linksElement.innerHTML = linksHTML;
}


function setupNavbar(sections) {
  const navbarContainer = document.getElementById("navbar");
  const navbarList = document.createElement("ul");
  navbarList.className = "text-xs flex flex-wrap justify-end space-x-2 p-2";

  const highLevelSections = ["research", "publications", "talks", "teaching"];

  navbarList.innerHTML = highLevelSections
    .filter(section => sections.includes(section))
    .map(section => `
      <li class="navbar-item">
        <a href="#${section}" class="text-gray-100 hover:underline px-2 py-1 rounded transition-colors duration-200 hover:bg-blue-700 dark:hover:bg-blue-900">
          ${section.replace("_", " ").charAt(0).toUpperCase() + section.replace("_", " ").slice(1)}
        </a>
      </li>
    `).join('');

  navbarContainer.appendChild(navbarList);
}


function convertToLinks(bioData) {
  if (!bioData || !bioData.urls || !bioData.short_bio || !bioData.short_bio[0]) {
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
  container.className = "text-justify dark:text-white bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 transition-colors duration-200";

  const bioContainer = document.createElement("div");
  bioContainer.innerHTML = convertToLinks(aboutMe.biodata);
  container.appendChild(bioContainer);
}

function displayNewsAndArchive(news) {
  const container = document.getElementById("news_content");
  container.innerHTML = '';
  if (!news || news.length === 0) {
    container.innerHTML = '<p class="dark:text-white">No news available.</p>';
    return;
  }

  const dateContainer = document.createElement("div");
  dateContainer.className = "flex flex-wrap mb-4 justify-center";
  const newsContainer = document.createElement("div");
  newsContainer.className = "news-item bg-white dark:bg-gray-800 p-4 shadow rounded border-l-4 border-green-600 dark:text-white transition-colors duration-200";
  const archiveContainer = document.getElementById("archive_list");
  archiveContainer.innerHTML = '';

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
          ${item.urls ? Object.entries(item.urls)
            .map(([key, url]) => `<a href="${url}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">${key}</a>`)
            .join(" ") : ""}
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
    dateElement.className = "flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-blue-600 text-white rounded m-1 cursor-pointer transition-colors duration-200 hover:bg-green-600";
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
    if (!archiveContainer) return; // Exit if archive_list element is not found

    archiveContainer.innerHTML = archiveItems
        .map(item => `
            <div class="news-item bg-white dark:bg-gray-800 p-4 shadow mb-4 rounded dark:text-white transition-colors duration-200">
                <p>${item.date}: ${item.title}
                    ${item.urls ? Object.entries(item.urls)
                        .map(([key, url]) => `<a href="${url}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">${key}</a>`)
                        .join(" ") : ""}
                </p>
            </div>
        `).join("");
}


function displayResearchInterests(interests) {
  document.getElementById("research_interests_content").innerHTML = `
    <p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">${interests ? interests.join(", ") : 'No research interests listed.'}</p>
  `;
}

function displayCurrentResearch(currentResearch) {
  document.getElementById("current_research_content").innerHTML = `
    <p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white transition-colors duration-200">${currentResearch || 'No current research information available.'}</p>
  `;
}


function setupGroupingButtons() {
  const groupByTypeBtn = document.getElementById("group_by_type");
  const groupByYearBtn = document.getElementById("group_by_year");

  groupByTypeBtn.addEventListener("click", () => {
    displayAllPublications(publications, "type");
    setActiveButton(groupByTypeBtn, groupByYearBtn);
  });

  groupByYearBtn.addEventListener("click", () => {
    displayAllPublications(publications, "year");
    setActiveButton(groupByYearBtn, groupByTypeBtn);
  });

  setActiveButton(groupByYearBtn, groupByTypeBtn);
}

function setActiveButton(activeBtn, inactiveBtn) {
  activeBtn.classList.add('bg-blue-700', 'text-white');
  activeBtn.classList.remove('bg-blue-500', 'hover:bg-blue-700');
  inactiveBtn.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');
  inactiveBtn.classList.remove('bg-blue-700');
}


function groupPublicationsByType(publications) {
  const typeOrder = ["journal", "conference", "poster", "preprint"];
  const groupedPublications = {};

  publications.forEach(pub => {
    const type = pub.type;
    groupedPublications[type] = groupedPublications[type] || [];
    groupedPublications[type].push(pub);
  });

  return typeOrder.map(type => ({
    type: type,
    publications: groupedPublications[type] || []
  }));
}

function groupPublicationsByYear(publications) {
  const groupedPublications = {};

  publications.forEach(pub => {
    const year = pub.year;
    groupedPublications[year] = groupedPublications[year] || [];
    groupedPublications[year].push(pub);
  });

  return Object.entries(groupedPublications)
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, pubs]) => ({ year: year, publications: pubs }));
}


function displayAsCard(item, groupBy, colors) {
  const marginClass = item.title.length <= 50 ? 'mb-20' : item.title.length <= 75 ? 'mb-14' : item.title.length <= 100 ? 'mb-8' : 'mb-2';
  const journalOrConference = item.type === "preprint" ? "arXiv" : item.conference?.short || item.journal?.short || "";
  const toAppearBanner = !item.doi ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white px-1 py-0 origin-top-right text-xs rounded-l">To appear</div>` : '';
  const titleContent = item.doi ? `<a href="${item.doi}" target="_blank" class="hover:underline transition-colors duration-200">${item.title}</a>` : item.title;
  const arxivBottomBanner = item.arxiv ? `<div class="absolute bottom-0 right-0 bg-green-500 text-white px-2 py-0.5 text-xs rounded-l"><a href="${item.arxiv}" target="_blank" class="hover:underline transition-colors duration-200">arXiv</a></div>` : '';
  const cardColorClass = colors[item.type] || 'bg-gray-100 dark:bg-gray-900 border-gray-600'; // Default color if type is not found

  return `
    <div class="publication-card p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-56 ${cardColorClass} flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      ${toAppearBanner}
      <p class="card-title text-md font-bold text-black dark:text-white ${marginClass}">${titleContent}</p>
      <p class="card-authors text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">${formatAuthors(item.authors)}</p>
      <p class="card-details text-sm text-gray-700 dark:text-gray-300 mb-2">
        ${journalOrConference} ${groupBy === "type" ? `(${item.year})` : ""}
      </p>
      ${arxivBottomBanner}
    </div>
  `;
}


function displayAllPublications(publications, groupBy = "year") {
  const container = document.getElementById("publications_list");
  container.className = "publications-container flex flex-wrap gap-4 items-stretch mt-4";
  const colors = {
    journal: "bg-red-100 dark:bg-red-900 border-red-600",
    conference: "bg-blue-100 dark:bg-blue-900 border-blue-600",
    poster: "bg-yellow-100 dark:bg-yellow-900 border-yellow-600",
    preprint: "bg-gray-100 dark:bg-gray-900 border-gray-600",
  };

  const groupFunction = groupBy === "type" ? groupPublicationsByType : groupPublicationsByYear;
  const groupedPublications = groupFunction(publications);

  container.innerHTML = groupedPublications
    .map(group => `
      <div class="publication-group w-full">
        <h3 class="group-title text-xl font-bold mb-4 dark:text-white transition-colors duration-200">${groupBy === "type" ? group.type.charAt(0).toUpperCase() + group.type.slice(1).toLowerCase() + "s" : group.year}</h3>
        <div class="publication-cards flex flex-wrap gap-2">  
          ${group.publications.map(item => displayAsCard(item, groupBy, colors)).join("")}
        </div>
      </div>
    `).join("");
}


let commonAuthors = {};
let publications = [];

function formatAuthors(authors) {
  const linkHoverClass = "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200";
  return authors
    .map(author => {
      if (author === "Debasish Pattanayak") {
        return `<strong><a href="${commonAuthors[author]?.url || '#'}" class="highlighted ${linkHoverClass}">${author}</a></strong>`;
      }
      const authorData = commonAuthors[author];
      return authorData && authorData.url !== "#"
        ? `<a href="${authorData.url}" class="${linkHoverClass}">${author}</a>`
        : author;
    })
    .join(", ");
}

function displayTalks(talks) {
  const list = document.getElementById("talks_list");
  list.className = "talks-list list-none p-0 mt-4";
  list.innerHTML = talks.map(talk => `
    <li class="talk-item mb-4">
        <div class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
            <p class="talk-title dark:text-white"><strong>Title:</strong> ${talk.title}</p>
            <p class="talk-event dark:text-white"><strong>Event:</strong> ${talk.event}</p>
            <div class="talk-links mt-2">
              ${talk.links ? Object.entries(talk.links)
                .map(([key, url]) => `<a href="${url}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 mr-2">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`)
                .join(" ") : ""}
              ${talk.tweet ? `<a href="${talk.tweet}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 mr-2">Tweet</a>` : ""}
              ${talk.author ? `<strong class="talk-author-label dark:text-white">Author:</strong> <a href="${talk.author.url}" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">${talk.author.name}</a>` : ""}
              ${talk.Place ? `<strong class="talk-place-label dark:text-white">Place:</strong> <span class="talk-place dark:text-white">${talk.Place}</span>` : ""}
            </div>
        </div>
    </li>
  `).join("");
}


function displayAwards(awards) {
  const container = document.getElementById("awards_content");
  container.innerHTML = awards.map(award => `
    <div class="awards-item bg-white dark:bg-gray-800 p-4 shadow mb-4 rounded transition-colors duration-200">
      <p class="dark:text-white">${award}</p>
    </div>
  `).join("");
}

function displaySkills(skills) {
  const container = document.getElementById("skills_content");
  container.innerHTML = `
    <div class="skills-content bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
      <p class="dark:text-white"><strong class="skills-label dark:text-white">Programming:</strong> ${skills.programming ? skills.programming.join(", ") : 'Not listed'}</p>
      <p class="dark:text-white"><strong class="skills-label dark:text-white">Python Libraries:</strong> ${skills.python_libraries ? skills.python_libraries.join(", ") : 'Not listed'}</p>
    </div>
  `;
}

function displayTeaching(teaching) {
  const list = document.getElementById("teaching_list");
  list.className = "teaching-list list-none p-0 mt-4";
  list.innerHTML = teaching.map(course => `
    <li class="teaching-item mb-4">
      <div class="bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200">
        <p class="teaching-course dark:text-white"><strong>Course:</strong> ${course.course}</p>
        <p class="teaching-duration dark:text-white"><strong>Duration:</strong> ${course.duration}</p>
        <p class="teaching-institution dark:text-white"><strong>Institution:</strong> ${course.institution}</p>
      </div>
    </li>
  `).join("");
}


function displayCommunityServices(services) {
  const container = document.getElementById("community_services_list");
  container.className = "community-services bg-white dark:bg-gray-800 p-4 shadow rounded transition-colors duration-200 mt-4";
  container.innerHTML = `
    <ul class="community-services-list list-disc pl-5">
      <li class="community-services-item mb-2 dark:text-white">
        <strong class="community-services-label dark:text-white">Reviewer:</strong>
        <ul class="community-services-sublist ml-4 list-disc">
          <li>
            <strong class="community-services-sublabel dark:text-white">Conferences:</strong>
            <ul class="community-services-sublist-inner ml-4 list-disc">
              ${services.reviewer_for?.conferences?.map(conf => `<li>${conf}</li>`).join('') || '<li>Not listed</li>'}
            </ul>
          </li>
          <li>
            <strong class="community-services-sublabel dark:text-white">Journals:</strong>
            <ul class="community-services-sublist-inner ml-4 list-disc">
              ${services.reviewer_for?.journals?.map(journal => `<li>${journal}</li>`).join('') || '<li>Not listed</li>'}
            </ul>
          </li>
        </ul>
      </li>
      <li class="community-services-item mb-2 dark:text-white">
        <strong class="community-services-label dark:text-white">PC member:</strong>
        <p class="community-services-text ml-4">${services.pc_member_for?.join(", ") || 'Not listed'}</p>
      </li>
      <li class="community-services-item mb-2 dark:text-white">
        <strong class="community-services-label dark:text-white">Organizing committee:</strong>
        <p class="community-services-text ml-4">${services.organizing_committee?.join(", ") || 'Not listed'}</p>
      </li>
    </ul>
  `;
}