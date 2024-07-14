let commonAuthors = {};
let publications = [];
let darkMode = false;

document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      darkMode = false; // Set default to light mode
      setupHeader(data.about_me);
      commonAuthors = data.common_authors;
      publications = data.publications;
      urls = data.urls;
      setupNavbar(Object.keys(data));
      displayAboutMe(data.about_me);
      displayNewsAndArchive(data.news);
      displayResearchInterests(data.research);
      displayCurrentResearch(data.current_research);
      displayAllPublications(publications, "year"); 
      displayTalks(data.talks);
      displayAwards(data.awards);
      displaySkills(data.skills);
      displayTeaching(data.teaching);
      displayCommunityServices(data.community_services);
      setupGroupingButtons();
      setupDarkMode();
      setupGoToTopButton();
    });
});


function setupDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const htmlElement = document.documentElement;
  
  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    htmlElement.classList.add('dark');
    darkMode = true;
  } else {
    htmlElement.classList.remove('dark');
    darkMode = false;
  }

  darkModeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode.toString());
  });
}

function setupGoToTopButton() {
  const goToTopButton = document.getElementById('goToTop');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > window.innerHeight) {
      goToTopButton.style.display = 'block';
    } else {
      goToTopButton.style.display = 'none';
    }
  });

  goToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function setupHeader(aboutMe) {
  document.getElementById("name").textContent = aboutMe.name;
  document.getElementById("position").textContent = aboutMe.position;
  document.getElementById(
    "links"
  ).innerHTML = `<div class="flex items-center mt-4">
      <a href="${aboutMe.dblp}" class="mr-4" title="DBLP Profile">
          <img src="https://dblp.org/img/dblp.icon.192x192.png" alt="DBLP Logo" class="h-8">
      </a>
      <a href="${aboutMe.google_scholar}" class="mr-4" title="Google Scholar Profile">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Scholar_logo.svg" alt="Google Scholar Logo" class="h-8">
      </a>
      <a href="${aboutMe.orcid}" class="mr-4" title="ORCID Profile">
          <img src="https://orcid.org/sites/default/files/images/orcid_24x24.png" alt="ORCID Logo" class="h-8">
      </a>
      <a href="https://twitter.com/drdebmath?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @drdebmath</a>
  </div>`;
}

function setupNavbar(sections) {
  const navbarContainer = document.getElementById("navbar");
  const navbarList = document.createElement("ul");
  navbarList.classList.add(
    "text-xs",
    "flex",
    "flex-wrap",
    "justify-end",
    "space-x-2",
    "p-2"
  );

  const highLevelSections = [
    "research",
    "publications",
    "talks",
    "teaching"
  ];

  highLevelSections.forEach((section) => {
    if (sections.includes(section)) {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="#${section}" class="text-gray-100 hover:underline">
          ${section.replace("_", " ").charAt(0).toUpperCase() + section.replace("_", " ").slice(1)}
        </a>`;
      navbarList.appendChild(li);
    }
  });
  navbarContainer.appendChild(navbarList);
}

function convertToLinks(bioData) {
  const { urls, short_bio } = bioData;
  let bioText = short_bio[0];

  for (const [name, url] of Object.entries(urls)) {
    const link = `<a class="text-blue-600 dark:text-blue-400 hover:underline" href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`;
    bioText = bioText.replace(new RegExp(name, "g"), link);
  }

  return bioText;
}

function displayAboutMe(aboutMe) {
  const container = document.getElementById("about_me_content");
  container.classList.add("text-justify", "dark:text-white", "bg-white", "p-4", "rounded-lg", "shadow-md");

  container.innerHTML = `
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    `;

  // Add short bio content
  const bioContainer = document.createElement("div");
  const bioWithLinks = convertToLinks(aboutMe.biodata);
  bioContainer.innerHTML = bioWithLinks;
  container.appendChild(bioContainer);
}

function displayNewsAndArchive(news) {
  const container = document.getElementById("news_content");
  const dateContainer = document.createElement("div");
  const newsContainer = document.createElement("div");
  const archiveContainer = document.getElementById("archive_list");

  dateContainer.classList.add("flex", "flex-wrap", "mb-4");
  newsContainer.classList.add(
    "news-item",
    "bg-white",
    "dark:bg-gray-800",
    "p-4",
    "shadow",
    "rounded",
    "border-l-4",
    "border-green-600",
    "dark:text-white"
  );

  let currentIndex = 0;
  let dateElements = [];
  let interval;

  function showNews(index) {
    dateElements.forEach((dateElement, i) => {
      if (i === index) {
        dateElement.classList.add("bg-green-600");
        dateElement.classList.remove("bg-blue-600");
      } else {
        dateElement.classList.remove("bg-green-600");
        dateElement.classList.add("bg-blue-600");
      }
    });

    const item = news[index];
    newsContainer.innerHTML = `
        <p>${item.title}
          ${
            item.urls
              ? Object.keys(item.urls)
                  .map(
                    (key) =>
                      `<a href="${item.urls[key]}" class="text-blue-600 dark:text-blue-400 hover:underline">${key}</a>`
                  )
                  .join(" ")
              : ""
          }
        </p>
      `;
  }

  function startInterval() {
    clearInterval(interval); // Clear existing interval
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % Math.min(5, news.length);
      showNews(currentIndex);
    }, 3000);
  }

  news.slice(0, 5).forEach((item, index) => {
    const [day, month, year] = item.date.split(" ");
    const dateElement = document.createElement("div");

    dateElement.classList.add(
      "flex-shrink-0",
      "w-12",
      "h-12",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "bg-blue-600",
      "text-white",
      "rounded",
      "m-1",
      "cursor-pointer"
    );
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

  const archiveItems = news.slice(5);
  archiveContainer.innerHTML = archiveItems
    .map(
      (item) => `
          <div class="news-item bg-white dark:bg-gray-800 p-4 shadow mb-4 rounded dark:text-white">
            <p>${item.date}: ${item.title}
              ${
                item.urls
                  ? Object.keys(item.urls)
                      .map(
                        (key) =>
                          `<a href="${item.urls[key]}" class="text-blue-600 dark:text-blue-400 hover:underline">${key}</a>`
                      )
                      .join(" ")
                  : ""
              }
            </p>
          </div>
        `
    )
    .join("");
}

function displayResearchInterests(interests) {
  document.getElementById(
    "research_interests_content"
  ).innerHTML = `<p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white">${interests.join(
    ", "
  )}</p>`;
}

function displayCurrentResearch(currentResearch) {
  document.getElementById(
    "current_research_content"
  ).innerHTML = `<p class="bg-white dark:bg-gray-800 p-4 shadow rounded dark:text-white">${currentResearch}</p>`;
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
  
  // Set the initial active button (optional)
  setActiveButton(groupByYearBtn, groupByTypeBtn);
}

function setActiveButton(activeBtn, inactiveBtn) {
  activeBtn.classList.add('bg-blue-700', 'text-white');
  activeBtn.classList.remove('bg-blue-500');
  inactiveBtn.classList.remove('bg-blue-700');
  inactiveBtn.classList.add('bg-blue-500', 'text-white');
}

// Call the function to setup the buttons
setupGroupingButtons();

function groupPublicationsByType(publications) {
  const groupedPublications = {};
  const typeOrder = ["journal", "conference", "poster", "preprint"]; // Define custom order

  // Group publications by type
  publications.forEach((pub) => {
    const type = pub.type;
    if (!groupedPublications[type]) {
      groupedPublications[type] = [];
    }
    groupedPublications[type].push(pub);
  });

  // Convert the object into an array for sorting
  const groupedPublicationsArray = Object.keys(groupedPublications).map(
    (type) => ({
      type: type,
      publications: groupedPublications[type],
    })
  );

  // Sort the array by custom type order
  groupedPublicationsArray.sort(
    (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
  );

  return groupedPublicationsArray;
}

function groupPublicationsByYear(publications) {
  const groupedPublications = {};

  // Group publications by year
  publications.forEach((pub) => {
    const year = pub.year;
    if (!groupedPublications[year]) {
      groupedPublications[year] = [];
    }
    groupedPublications[year].push(pub);
  });

  // Convert the object into an array for sorting
  const groupedPublicationsArray = Object.keys(groupedPublications).map(
    (year) => ({
      year: year,
      publications: groupedPublications[year],
    })
  );

  // Sort the array by year in descending order
  groupedPublicationsArray.sort((a, b) => b.year - a.year);

  return groupedPublicationsArray;
}
function displayAsCard(item, groupBy, colors) {
  let marginClass = "";
  if (item.title.length <= 50) {
    marginClass = "mb-20";
  } else if (item.title.length <= 75) {
    marginClass = "mb-14";
  } else if (item.title.length <= 100) {
    marginClass = "mb-8";
  } else if (item.title.length > 100) {
    marginClass = "mb-2";
  }

  let journalOrConference = "";
  if (item.type === "preprint") {
    journalOrConference = "arXiv";
  } else {
    journalOrConference = item.conference?.short || item.journal?.short || "";
  }

  const toAppearBanner = !item.doi ? `<div class="absolute top-0 right-0 bg-yellow-500 text-white px-1 py-0 origin-top-right text-xs rounded-l">To appear</div>` : '';
  const titleContent = item.doi ? `<a href="${item.doi}" target="_blank" class="hover:underline">${item.title}</a>` : item.title;

  return `
    <div class="p-4 shadow-lg rounded-lg border-l-4 w-full sm:w-56 ${colors[item.type]} flex flex-col justify-between relative overflow-hidden">
      ${toAppearBanner}
      <p class="text-md font-bold text-black dark:text-white ${marginClass}">${titleContent}</p>
      <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">${formatAuthors(item.authors)}</p>
      <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
        ${journalOrConference}
        ${groupBy === "type" ? ` (${item.year})` : ""}
      </p>
    </div>
  `;
}


function displayAllPublications(publications, groupBy = "type") {
  const container = document.getElementById("publications_list");
  container.className = "flex flex-wrap gap-4 justify-center items-stretch";

  const colors = {
    journal: "bg-red-100 dark:bg-red-900 border-red-600",
    conference: "bg-blue-100 dark:bg-blue-900 border-blue-600",
    poster: "bg-yellow-100 dark:bg-yellow-900 border-yellow-600",
    preprint: "bg-gray-100 dark:bg-gray-900 border-gray-600",
  };

  const groupFunction =
    groupBy === "type" ? groupPublicationsByType : groupPublicationsByYear;
  const groupedPublications = groupFunction(publications);

  container.innerHTML = groupedPublications
    .map(
      (group) => `
      <div class="w-full">
        <h3 class="text-xl font-bold mb-4 dark:text-white">${
          groupBy === "type" ? group.type.charAt(0).toUpperCase() + group.type.slice(1).toLowerCase() + "s" : group.year
        }</h3>
        <div class="flex flex-wrap gap-2">
          ${group.publications
            .map((item) => displayAsCard(item, groupBy, colors))
            .join("")}
        </div>
      </div>
    `
    )
    .join("");
}

function formatAuthors(authors) {
  const linkHoverStyles = "hover:text-blue-600 dark:hover:text-blue-400";
  return authors
    .map((author) => {
      if (author === "Debasish Pattanayak") {
        return `<strong><a href="${commonAuthors[author].url}" class="highlighted ${linkHoverStyles}">${author}</a></strong>`;
      }
      return commonAuthors[author] && commonAuthors[author].url !== "#"
        ? `<a href="${commonAuthors[author].url}" class="${linkHoverStyles}">${author}</a>`
        : author;
    })
    .join(", ");
}

function displayTalks(talks) {
  const list = document.getElementById("talks_list");
  list.classList.add("list-none", "p-0"); // Add these classes to remove bullet points and padding
  list.innerHTML = talks
    .map(
      (talk) => `
        <li class="mb-4">
            <div class="bg-white dark:bg-gray-800 p-4 shadow rounded">
                <p class="dark:text-white"><strong>Title:</strong> ${talk.title}</p>
                <p class="dark:text-white"><strong>Event:</strong> ${talk.event}</p>
                ${
                  talk.links
                    ? Object.keys(talk.links)
                        .map(
                          (key) =>
                            `<a href="${
                              talk.links[key]
                            }" class="text-blue-600 dark:text-blue-400 hover:underline">${
                              key.charAt(0).toUpperCase() + key.slice(1)
                            }</a>`
                        )
                        .join(" ")
                    : ""
                }
                ${
                  talk.tweet
                    ? `<a href="${talk.tweet}" class="text-blue-600 dark:text-blue-400 hover:underline">Tweet</a> `
                    : ""
                }
                ${
                  talk.author
                    ? `<strong class="dark:text-white">Author:</strong> <a href="${talk.author.url}" class="text-blue-600 dark:text-blue-400 hover:underline">${talk.author.name}</a> `
                    : ""
                }
                ${talk.Place ? `<strong class="dark:text-white">Place:</strong> <span class="dark:text-white">${talk.Place}</span> ` : ""}
            </div>
        </li>
    `
    )
    .join("");
}

function displayAwards(awards) {
  const container = document.getElementById("awards_content");
  container.innerHTML = awards
    .map(
      (award) => `
        <div class="awards-item bg-white dark:bg-gray-800 p-4 shadow mb-4 rounded">
            <p class="dark:text-white">${award}</p>
        </div>
    `
    )
    .join("");
}

function displaySkills(skills) {
  const container = document.getElementById("skills_content");
  container.innerHTML = `<div class="bg-white dark:bg-gray-800 p-4 shadow rounded">
                               <p class="dark:text-white"><strong>Programming:</strong> ${skills.programming.join(
                                 ", "
                               )}</p>
                               <p class="dark:text-white"><strong>Python Libraries:</strong> ${skills.python_libraries.join(
                                 ", "
                               )}</p>
                           </div>`;
}

function displayTeaching(teaching) {
  const list = document.getElementById("teaching_list");
  list.classList.add("list-none", "p-0");
  list.innerHTML = teaching
    .map(
      (course) => `
        <li class="mb-4">
            <div class="bg-white dark:bg-gray-800 p-4 shadow rounded">
                <p class="dark:text-white"><strong>Course:</strong> ${course.course}</p>
                <p class="dark:text-white"><strong>Duration:</strong> ${course.duration}</p>
                <p class="dark:text-white"><strong>Institution:</strong> ${course.institution}</p>
            </div>
        </li>
    `
    )
    .join("");
}

function displayCommunityServices(services) {
  const list = document.getElementById("community_services_list");
  list.innerHTML = services
    .map((service) => `<li class="mb-2 dark:text-white">${service}</li>`)
    .join("");
}

