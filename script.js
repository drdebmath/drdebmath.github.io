import {
  appendNavLinks,
  buildPublicationStacks,
  createLinkHtml,
  escapeHtml,
  formatDateRange,
  getPrimarySiteLinks,
  linkifyBiographyHtml,
  publicationKey,
  renderAwardsList,
  renderGrantsList,
  renderOutreachCredit,
  renderLatestBlogPosts,
  renderProfileHeader,
  renderSimulatorCardsHtml,
  renderSiteFooter,
  setupDarkMode,
  setupGoToTopButton,
  setupPrimaryNav,
  setupSiteSearch,
} from "./shared.js?v=9c1b8a704f";

document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  setupGoToTopButton();

  fetch("data.json?v=42e086e9ae")
    .then((response) => response.json())
    .then((data) => {
      commonAuthors = data.common_authors || {};
      publications = data.publications || [];
      publicationStacks = buildPublicationStacks(publications);
      renderSiteFooter(data);
      setupSiteSearch(data);

      const page = document.body.dataset.page || "home";
      if (page === "publications") {
        initializePublicationsPage(data);
      } else if (page === "teaching") {
        initializeTeachingPage(data);
      } else if (page === "talks") {
        initializeTalksPage(data);
      } else if (page === "simulators") {
        initializeSimulatorsPage(data);
      } else if (document.getElementById("about_me_content")) {
        initializeWebsite(data);
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function initializeWebsite(data) {
  renderProfileHeader(data.about_me, {
    department: data.about_me?.department,
    stackedPosition: true,
    showOffice: false,
  });
  setupPrimaryNav(data);
  displayHero(data);
  displayFeatured(data);
  setupContentDisplay(data);
}

// One light per research theme, in data.json order. The hero simulation
const THEME_LIGHTS = [
  { text: "text-light-1 dark:text-lightd-1", border: "border-light-1 dark:border-lightd-1" },
  { text: "text-light-2 dark:text-lightd-2", border: "border-light-2 dark:border-lightd-2" },
  { text: "text-light-3 dark:text-lightd-3", border: "border-light-3 dark:border-lightd-3" },
  { text: "text-light-4 dark:text-lightd-4", border: "border-light-4 dark:border-lightd-4" },
];

function displayHero(data) {
  const about = data.about_me || {};
  const themes = (data.research_themes || []).slice(0, THEME_LIGHTS.length);

  const tagline = document.getElementById("tagline");
  if (tagline) tagline.textContent = about.tagline || "";

  const cvLink = document.getElementById("hero_cv");
  if (cvLink && about.cv?.url) cvLink.href = about.cv.url;

  setupHeroSimulation(data.hero_simulations || []);
}

// The hero figure is a real simulator run in an <iframe> (the simulator's own
// "embed" mode). It is loaded only after the page itself has finished loading.
function setupHeroSimulation(simulations) {
  const frame = document.getElementById("hero_sim");
  const caption = document.getElementById("hero_sim_caption");
  const tabs = document.getElementById("hero_sim_tabs");
  if (!frame || !caption || !tabs || !simulations.length) return;

  const TAB = "text-[0.95rem] underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white";
  const TAB_ON = "font-bold text-white underline";
  const TAB_OFF = "text-blue-100 hover:text-white hover:underline";

  tabs.innerHTML = simulations
    .map(
      (sim, index) =>
        `<button type="button" data-sim="${index}" aria-pressed="false">(${String.fromCharCode(97 + index)}) ${escapeHtml(sim.label || sim.title || "")}</button>`
    )
    .join("");

  let current = 0;
  let ready = false;
  const frameUrl = (sim) => {
    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    return `${sim.embed_url}${sim.embed_url.includes("?") ? "&" : "?"}theme=${theme}`;
  };

  const show = (index) => {
    current = index;
    const sim = simulations[index];
    caption.innerHTML = `<span class="italic">${escapeHtml(sim.title || "")}.</span> ${escapeHtml(
      sim.description || ""
    )}`;
    tabs.querySelectorAll("button[data-sim]").forEach((button) => {
      const on = Number(button.dataset.sim) === index;
      button.setAttribute("aria-pressed", String(on));
      button.className = `${TAB} ${on ? TAB_ON : TAB_OFF}`;
    });
    if (ready) frame.src = frameUrl(sim);
  };

  // The runs change on their own until the visitor picks one; they also wait
  // while the pointer or focus is on the figure, or the tab is in the background.
  const ROTATE_MS = 20000;
  const figure = frame.closest("figure") || frame.parentElement;
  let auto = simulations.length > 1;
  let hovering = false;

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-sim]");
    if (!button) return;
    auto = false;
    show(Number(button.dataset.sim));
  });

  show(0);

  // Pre-rendering bakes the DOM into the page: leave the frame empty there.
  if (window.__PRERENDER__) return;

  figure.addEventListener("pointerenter", () => (hovering = true));
  figure.addEventListener("pointerleave", () => (hovering = false));
  // Clicks inside the iframe never reach this page; the window losing focus to it is the signal.
  window.addEventListener("blur", () => {
    if (document.activeElement === frame) auto = false;
  });

  // Keep the simulator out of the page's own load: start it once the page is done and idle.
  const start = () => {
    ready = true;
    frame.src = frameUrl(simulations[current]);
    new MutationObserver(() => {
      frame.src = frameUrl(simulations[current]);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setInterval(() => {
      if (!auto || hovering || document.hidden) return;
      show((current + 1) % simulations.length);
    }, ROTATE_MS);
  };
  const whenIdle = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300));
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

// The featured project (about_me.mobility_matters), set as a theorem-like block.
function displayFeatured(data) {
  const section = document.getElementById("featured");
  const container = document.getElementById("featured_content");
  const survey = data.about_me?.mobility_matters;
  if (!section || !container || !survey?.url) return;

  const actions = [
    createLinkHtml({ url: survey.url, label: "Open the survey →", className: "btn-primary" }),
    survey.pdf ? createLinkHtml({ url: survey.pdf, label: "Book (PDF)", className: "btn-quiet" }) : "",
    survey.source_url
      ? createLinkHtml({ url: survey.source_url, label: "Contribute on GitHub", className: "meta-link self-center ml-1.5" })
      : "",
  ].filter(Boolean);

  container.innerHTML = `
    <div class="theorem">
      <h2 class="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
        ${createLinkHtml({
          url: survey.url,
          label: survey.label || "Mobility Matters",
          className: "hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
        })}
      </h2>
      <p class="mt-2 max-w-3xl text-lg leading-relaxed text-gray-800 dark:text-gray-200 text-pretty">${
        survey.title ? `<em>${escapeHtml(survey.title)}.</em> ` : ""
      }${escapeHtml(survey.description || "")}</p>
      <div class="mt-4 flex flex-wrap gap-2.5">${actions.join("")}</div>
    </div>
  `;
  section.classList.remove("hidden");
}

function initializePublicationsPage(data) {
  setupPrimaryNav(data);
  setupGroupingButtons();
  displayAllPublications(data.publications || [], "year");
  // Deep link from search: ?pub=<key>
  requestAnimationFrame(() => focusPublicationFromUrl());
}

function initializeTeachingPage(data) {
  setupPrimaryNav(data);
  displayTeachingSection({
    currentTeaching: data.current_teaching || [],
    teaching: data.teaching || [],
  });
}

function initializeTalksPage(data) {
  setupPrimaryNav(data);
  displayTalks(data.talks || []);
}

function initializeSimulatorsPage(data) {
  setupPrimaryNav(data);
  const container = document.getElementById("simulators_grid");
  if (container) {
    container.innerHTML = renderSimulatorEmbedsHtml(data.visualizations?.simulators || []);
  }
}

// Simulators page: every simulator runs in place, in its own lazily loaded frame.
// `embed_url` (the simulator's compact embed mode) is used when it has one;
// `embed: false` lists the entry without a frame.
function renderSimulatorEmbedsHtml(simulators) {
  return simulators
    .map((item) => {
      const links = [
        createLinkHtml({ url: item.url, label: "Open full screen ↗", className: "meta-link whitespace-nowrap" }),
        item.source_url
          ? createLinkHtml({ url: item.source_url, label: "Source code", className: "meta-link whitespace-nowrap" })
          : "",
      ].filter(Boolean);
      const frame =
        item.embed === false
          ? ""
          : `<div class="mt-3 overflow-hidden rounded-sm border border-gray-300 dark:border-gray-600 bg-white">
              <iframe src="${escapeHtml(item.embed_url || item.url)}" title="${escapeHtml(
                item.name
              )} simulator" loading="lazy" class="block h-[70vh] min-h-[26rem] max-h-[46rem] w-full border-0"></iframe>
            </div>`;
      return `
        <article>
          <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">${escapeHtml(item.name)}</h3>
            <p class="flex flex-wrap gap-x-5 gap-y-1">${links.join("")}</p>
          </div>
          <p class="mt-1 text-base leading-7 text-gray-700 dark:text-gray-300">${escapeHtml(
            item.description || ""
          )}</p>
          ${frame}
        </article>
      `;
    })
    .join("");
}

function setupContentDisplay(data) {
  displaySectionContent("about_me_content", displayAboutMe, data.about_me);
  displaySectionContent("news_content", displayNewsAndArchive, data.news);
  displayBlog(data.about_me?.blog);
  displaySectionContent(
    "research_themes_content",
    displayResearchThemes,
    {
      themes: data.research_themes || [],
      publications: data.publications || [],
    }
  );
  displaySectionContent("talks_list", displayRecentTalks, {
    talks: data.talks || [],
    featuredTitles: data.homepage_talks || [],
    limit: 3,
  });
  displaySectionContent("awards_content", displayAwards, data.awards);
  displaySectionContent("grants_content", displayGrants, data.grants);
  displaySectionContent("outreach_content", displayOutreach, data.community_services?.social);
  displaySectionContent("visualizations_content", displayVisualizations, data.visualizations);
}

function displayBlog(blog) {
  const section = document.getElementById("blog");
  if (!section) return;
  if (!blog?.feed) {
    section.remove();
    return;
  }
  const link = document.getElementById("blog_link");
  if (link && blog.url) link.href = blog.url;
  renderLatestBlogPosts("blog_content", blog, 3);
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

function displayAboutMe(aboutMe) {
  const container = document.getElementById("about_me_content");
  container.className =
    "prose-link text-lg leading-relaxed text-gray-800 dark:text-gray-100 text-pretty";
  container.innerHTML = `<p>${linkifyBiographyHtml(aboutMe.biodata, "")}</p>`;
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
      const linkOrText = (item) =>
        item.url
          ? createLinkHtml({
              url: item.url,
              label: item.name,
              className:
                "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
            })
          : escapeHtml(item.name);

      const institution = (entry.institutions || [entry.institution])
        .filter((item) => item?.name)
        .map(linkOrText)
        .join(" &amp; ");

      const supervisors =
        entry.supervisors || (entry.institution?.supervisor ? [entry.institution.supervisor] : []);
      const supervisor = supervisors.length
        ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">${
            supervisors.length > 1 ? "Co-supervised by" : "With"
          } ${supervisors.map(linkOrText).join(" and ")}</p>`
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

const KATEX_BASE = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/";
let katexLoading = null;

// KaTeX is fetched only when some text on the page actually contains math.
function loadKatex() {
  if (katexLoading) return katexLoading;
  const script = (src) =>
    new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = KATEX_BASE + src;
      el.crossOrigin = "anonymous";
      el.onload = resolve;
      el.onerror = reject;
      document.head.append(el);
    });
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = `${KATEX_BASE}katex.min.css`;
  css.crossOrigin = "anonymous";
  document.head.append(css);
  katexLoading = script("katex.min.js").then(() => script("contrib/auto-render.min.js"));
  return katexLoading;
}

function renderMath(element) {
  // Never while pre-rendering: the loader would be baked into the page.
  if (window.__PRERENDER__ || !element || !element.textContent.includes("$")) return;
  loadKatex()
    .then(() =>
      window.renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      })
    )
    .catch((error) => console.warn("KaTeX unavailable:", error));
}

// The six most recent items as a dated list; the full history is on the timeline.
function displayNewsAndArchive(news) {
  const container = document.getElementById("news_content");
  if (!container) return;

  if (!news || news.length === 0) {
    container.innerHTML =
      '<p class="text-sm text-gray-500 dark:text-gray-400 italic">No news available.</p>';
    return;
  }

  container.innerHTML = `
    <ol class="divide-y divide-gray-200 dark:divide-gray-700">
      ${news
        .slice(0, 6)
        .map((item) => {
          const { day, month, year } = formatNewsDateParts(item.date);
          const title = item.url
            ? createLinkHtml({
                url: item.url,
                label: item.title,
                className:
                  "text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-4 hover:decoration-current",
              })
            : escapeHtml(item.title || "");
          const extras = extractResourceLinks(item, { includePrimary: false })
            .map((link) => createLinkHtml({ url: link.url, label: link.label, className: "meta-link" }))
            .join('<span class="mx-1.5 text-gray-400">·</span>');
          return `
            <li class="py-3.5 first:pt-0">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 tabular-nums">${escapeHtml(
                [day, month, year].filter(Boolean).join(" ")
              )}</p>
              <p class="mt-1 text-[0.95rem] leading-6 text-gray-800 dark:text-gray-200">${title}</p>
              ${extras ? `<p class="mt-1">${extras}</p>` : ""}
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
  renderMath(container);
}

// A theme may name any version of a work; show the head of its stack
// (the latest full journal or conference version).
function findPublicationByTitle(publications, title) {
  const match = (publications || []).find((pub) => pub.title === title);
  return match ? getPublicationStack(match).head : undefined;
}

// Versions are linked through see_also (publicationKey() slugs) and stacked
// by buildPublicationStacks, so the label is derived from the target's own
// type/title rather than duplicated in data.json.
function relatedVersionLabel(source, target) {
  const sourceIsBA = /^BA:/i.test(source.title || "");
  const targetIsBA = /^BA:/i.test(target.title || "");
  if (targetIsBA) return "Brief announcement";
  if (sourceIsBA) return "Full version";
  if (target.type === "journal") return "Journal version";
  if (target.type === "conference") return "Conference version";
  return "Related version";
}

function renderRelatedVersionLinks(pub) {
  return getPublicationStack(pub)
    .others.map((target) => {
      const url = target.doi || target.arxiv || target.url;
      if (!url) return "";
      const venue = target.conference?.short || target.journal?.short || "";
      const label = `${relatedVersionLabel(pub, target)}${venue ? `, ${venue}` : ""}`;
      return createLinkHtml({ url, label, className: "meta-link" });
    })
    .filter(Boolean);
}

function renderSelectedPaperRow(pub) {
  if (!pub) return "";

  const venue =
    pub.type === "preprint"
      ? "arXiv"
      : pub.conference?.short ||
        pub.journal?.short ||
        pub.journal?.full ||
        pub.booktitle ||
        "";
  const link = pub.doi || pub.arxiv || pub.url;
  const titleClass =
    "font-medium text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 transition-colors";
  const titleHtml = link
    ? createLinkHtml({ url: link, label: pub.title, className: titleClass })
    : `<span class="font-medium text-gray-900 dark:text-white">${escapeHtml(pub.title)}</span>`;
  const { head, others } = getPublicationStack(pub);
  const award = [head, ...others].map((version) => version.award).find(Boolean);

  const meta = [
    `<span class="font-semibold text-gray-700 dark:text-gray-200">${escapeHtml(
      [venue, pub.year].filter(Boolean).join(" ")
    )}</span>`,
    award ? `<span class="tag-award">★ ${escapeHtml(award)}</span>` : "",
    pub.arxiv && pub.arxiv !== link
      ? createLinkHtml({ url: pub.arxiv, label: "arXiv", className: "meta-link" })
      : "",
    ...renderRelatedVersionLinks(pub),
  ].filter(Boolean);

  return `
    <li class="py-3">
      <p class="text-[0.95rem] leading-6">${titleHtml}</p>
      <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-500 dark:text-gray-400">
        ${meta.join("")}
      </p>
    </li>
  `;
}

function displayResearchThemes({ themes, publications }) {
  const container = document.getElementById("research_themes_content");
  if (!container) return;

  if (!Array.isArray(themes) || themes.length === 0) {
    container.innerHTML =
      '<p class="text-gray-600 dark:text-gray-400 italic">No research themes listed.</p>';
    return;
  }

  container.innerHTML = `
    <div class="grid gap-6 lg:grid-cols-2">
      ${themes
        .map((theme, themeIndex) => {
          const light = THEME_LIGHTS[themeIndex % THEME_LIGHTS.length];
          const papers = (theme.selected_papers || [])
            .map((title) => findPublicationByTitle(publications, title))
            .filter(Boolean);

          return `
            <article id="theme-${themeIndex + 1}" class="surface-card scroll-mt-28 border-t-4 p-5 sm:p-6 ${light.border}">
              <h3 class="flex items-baseline gap-2.5 text-xl font-bold leading-snug text-gray-900 dark:text-white">
                <span class="light-dot translate-y-[-1px] ${light.text}"></span>
                ${escapeHtml(theme.title || "")}
              </h3>
              ${
                theme.description
                  ? `<p class="mt-2 text-[0.95rem] leading-7 text-gray-600 dark:text-gray-300">${escapeHtml(
                      theme.description
                    )}</p>`
                  : ""
              }
              <ul class="mt-4 divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
                ${
                  papers.length
                    ? papers.map((paper) => renderSelectedPaperRow(paper)).join("")
                    : '<li class="py-3 text-sm text-gray-500 italic">No selected papers.</li>'
                }
              </ul>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="mt-12 flex flex-col gap-4 border-y border-gray-200 dark:border-gray-700 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-lg font-bold text-gray-900 dark:text-white">
        Open problems, supervision and student projects on these themes.
      </p>
      <div class="flex shrink-0 flex-wrap gap-2.5">
        <a href="for_students.html" class="btn-quiet">For students</a>
        <a href="publications.html" class="btn-primary">All publications</a>
      </div>
    </div>
  `;
  renderMath(container);
}

function parseTalkSortKey(talk) {
  if (!talk?.date) return 0;
  const parsed = Date.parse(talk.date);
  if (!Number.isNaN(parsed)) return parsed;
  // Fallback for formats like "Jun 19 2026" / "April 24 2025"
  const loose = Date.parse(String(talk.date).replace(/(\d{1,2})\s+(\w+)\s+(\d{4})/, "$2 $1, $3"));
  return Number.isNaN(loose) ? 0 : loose;
}

function displayRecentTalks({ talks = [], featuredTitles = [], limit = 3 } = {}) {
  const container = document.getElementById("talks_list");
  if (!container) return;

  const byTitle = new Map((talks || []).map((talk) => [talk.title, talk]));
  let recent = (featuredTitles || [])
    .map((title) => byTitle.get(title))
    .filter(Boolean)
    .slice(0, limit);

  // Fallback: newest talks if featured list is missing/empty
  if (recent.length === 0) {
    recent = [...(talks || [])]
      .sort((a, b) => parseTalkSortKey(b) - parseTalkSortKey(a))
      .slice(0, limit);
  }

  container.className = "talks-container grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  container.innerHTML = recent.length
    ? recent.map((talk) => displayAsTalkCard(talk)).join("")
    : '<p class="text-gray-600 dark:text-gray-400 italic">No talks listed.</p>';
}

// Teaching page: the same ruled list as the publications page — a group label
// on the left (Current / Past), one row per course.
function renderCourseRow(course) {
  const title = course.title || course.course || "";
  const session = course.session || course.duration || (course.year ? String(course.year) : "");
  const titleHtml = course.url
    ? createLinkHtml({
        url: course.url,
        label: title,
        className: "hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-2",
      })
    : escapeHtml(title);

  return `
    <li class="border-t border-gray-200 dark:border-gray-700 first:border-t-0 py-4">
      <div class="flex flex-col gap-x-6 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
        <p class="card-title min-w-0 text-base font-bold leading-snug text-gray-900 dark:text-white">${titleHtml}</p>
        <p class="shrink-0 text-sm font-bold text-gray-800 dark:text-gray-200 sm:text-right">${escapeHtml(
          course.institution || ""
        )}</p>
      </div>
      <p class="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
        <span>${escapeHtml(session)}</span>
        ${course.url ? createLinkHtml({ url: course.url, label: "Course website", className: "meta-link" }) : ""}
      </p>
    </li>
  `;
}

function displayTeachingSection(teachingData) {
  const container = document.getElementById("teaching_content");
  if (!container) return;

  const groups = [
    ["Current", teachingData?.currentTeaching || []],
    ["Past", teachingData?.teaching || []],
  ].filter(([, courses]) => courses.length);

  container.className = "teaching-container";
  container.innerHTML = groups.length
    ? groups
        .map(
          ([label, courses]) => `
            <div class="grid gap-x-8 gap-y-2 border-t border-gray-900/70 dark:border-gray-500 py-6 md:grid-cols-[9rem_minmax(0,1fr)]">
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">${label}</h2>
                <p class="mt-1 text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">${courses.length} ${
                  courses.length === 1 ? "course" : "courses"
                }</p>
              </div>
              <ul class="list-none m-0 p-0">${courses.map(renderCourseRow).join("")}</ul>
            </div>
          `
        )
        .join("")
    : '<p class="text-gray-600 dark:text-gray-400 italic">No teaching information available.</p>';
}

function displayVisualizations(visualizations) {
  const container = document.getElementById("visualizations_content");
  if (!container) return;

  const simulators = (visualizations?.simulators || []).filter(
    (item) => item.featured_on_homepage !== false
  );
  container.className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  container.innerHTML = renderSimulatorCardsHtml(simulators);
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

  if (!groupByTypeBtn || !groupByYearBtn) return;

  groupByTypeBtn.addEventListener("click", () => {
    displayAllPublications(publications, "type");
    setActiveButton(groupByTypeBtn, [groupByYearBtn]);
  });

  groupByYearBtn.addEventListener("click", () => {
    displayAllPublications(publications, "year");
    setActiveButton(groupByYearBtn, [groupByTypeBtn]);
  });

  setActiveButton(groupByYearBtn, [groupByTypeBtn]);
}

const GROUP_BTN_ACTIVE = ["bg-gray-900", "text-white", "dark:bg-gray-100", "dark:text-gray-900"];
const GROUP_BTN_INACTIVE = [
  "text-gray-700",
  "dark:text-gray-200",
  "hover:bg-gray-200/70",
  "dark:hover:bg-gray-700",
];

function setActiveButton(activeBtn, inactiveBtns) {
  activeBtn.classList.add(...GROUP_BTN_ACTIVE);
  activeBtn.classList.remove(...GROUP_BTN_INACTIVE);
  activeBtn.setAttribute("aria-pressed", "true");

  inactiveBtns.forEach(btn => {
    btn.classList.add(...GROUP_BTN_INACTIVE);
    btn.classList.remove(...GROUP_BTN_ACTIVE);
    btn.setAttribute("aria-pressed", "false");
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

const PUBLICATION_TYPE_LABELS = {
  journal: "Journal",
  conference: "Conference",
  poster: "Poster",
  preprint: "Preprint",
};

// One publication as a typeset row. `showYear` is set when rows are not
// already grouped under a year heading.
function displayAsCard(item, groupBy, cardIndex, groupIndex) {
  const venueShort =
    item.type === "preprint"
      ? "arXiv"
      : item.conference?.short || item.journal?.short || item.journal?.full || "";
  const venueFull = item.conference?.full || item.journal?.full || "";
  const publicationLink = item.doi || item.url;
  const titleContent = publicationLink
    ? createLinkHtml({
        url: publicationLink,
        label: item.title,
        className:
          "hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150",
      })
    : escapeHtml(item.title);
  const pubKey = publicationKey(item);
  const { others: otherVersions } = getPublicationStack(item);

  const meta = [
    `<span class="tag">${escapeHtml(PUBLICATION_TYPE_LABELS[item.type] || item.type || "Paper")}</span>`,
    venueFull && venueFull !== venueShort
      ? `<span class="min-w-0">${escapeHtml(venueFull)}${
          groupBy === "type" ? `, ${escapeHtml(String(item.year))}` : ""
        }</span>`
      : groupBy === "type"
        ? `<span>${escapeHtml(String(item.year))}</span>`
        : "",
    item.award ? `<span class="tag-award">★ ${escapeHtml(item.award)}</span>` : "",
    !item.doi ? '<span class="tag">To appear</span>' : "",
    item.arxiv ? createLinkHtml({ url: item.arxiv, label: "arXiv", className: "meta-link" }) : "",
    item.abstract ? '<span class="meta-link cursor-pointer">Abstract</span>' : "",
  ].filter(Boolean);

  const interactiveAttributes = item.abstract
    ? `role="button" tabindex="0" aria-expanded="false" aria-label="Show abstract for ${escapeHtml(
        item.title || "publication"
      )}"`
    : "";
  const interactiveClass = item.abstract
    ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    : "";

  return `
    <div class="publication-card relative -ml-4 border-t border-t-gray-200 dark:border-t-gray-700 first:border-t-transparent dark:first:border-t-transparent border-l-2 border-l-transparent hover:border-l-gray-300 dark:hover:border-l-gray-600 py-4 pl-4 pr-2 transition-colors duration-150 ${interactiveClass}"
         data-card-index="${cardIndex}" data-group-index="${groupIndex}" data-publication-key="${pubKey}" ${interactiveAttributes}>
      <div class="flex flex-col gap-x-4 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
        <p class="card-title min-w-0 text-base font-bold leading-snug text-gray-900 dark:text-white text-pretty">${titleContent}</p>
        ${
          venueShort
            ? `<p class="shrink-0 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:whitespace-nowrap"${
                venueFull ? ` title="${escapeHtml(venueFull)}"` : ""
              }>${escapeHtml(venueShort)}</p>`
            : ""
        }
      </div>
      <p class="card-authors mt-1.5 text-[0.95rem] leading-6 text-gray-600 dark:text-gray-300">${formatAuthors(item.authors)}</p>
      <div class="card-details mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] leading-5 text-gray-500 dark:text-gray-400">
        ${meta.join("")}
      </div>
      ${renderOtherVersions(item, otherVersions)}
    </div>
  `;
}

function renderOtherVersions(head, versions) {
  if (!versions.length) return "";
  const rows = versions
    .map((version) => {
      const url = version.doi || version.arxiv || version.url;
      const venue =
        version.conference?.short || version.journal?.short || version.booktitle || "";
      const meta = [relatedVersionLabel(head, version), venue, version.year]
        .filter(Boolean)
        .join(" · ");
      const title = url
        ? createLinkHtml({
            url,
            label: version.title,
            className: "hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-2",
          })
        : escapeHtml(version.title);
      const arxiv =
        version.arxiv && version.arxiv !== url
          ? ` · ${createLinkHtml({ url: version.arxiv, label: "arXiv", className: "meta-link" })}`
          : "";
      return `
        <li class="publication-version" data-publication-key="${publicationKey(version)}">
          <p class="text-sm font-medium leading-snug text-gray-800 dark:text-gray-100">${title}</p>
          <p class="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">${escapeHtml(meta)}${arxiv}</p>
        </li>
      `;
    })
    .join("");
  const label = `${versions.length} earlier version${versions.length > 1 ? "s" : ""}`;
  return `
    <details class="publication-versions group/versions mt-2">
      <summary class="inline-block cursor-pointer select-none list-none text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white [&::-webkit-details-marker]:hidden">
        <span class="inline-block transition-transform group-open/versions:rotate-90">▸</span> ${label}
      </summary>
      <ul class="mt-2 space-y-2.5 border-l border-gray-300 dark:border-gray-600 pl-4">${rows}</ul>
    </details>
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

function stackKeywords(pub) {
  const { head, others } = getPublicationStack(pub);
  return [head, ...others].flatMap((version) => version.keywords || ["Other"]);
}

// Only the head of each version stack gets a card; the others fold under it.
function filterByActiveTopics(publications) {
  return publications.filter(
    (pub) =>
      getPublicationStack(pub).head === pub &&
      stackKeywords(pub).some((keyword) => activeTopics.has(keyword))
  );
}

function buildTopicFilter(publications, topics, groupBy) {
  const wrapper = document.createElement("div");
  wrapper.id = "keyword-filter-container";
  wrapper.className = "mb-12";
  wrapper.innerHTML = `
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
        Topics
      </p>
      <div class="flex gap-4">
        <button type="button" data-topic-action="all" class="meta-link">Select all</button>
        <button type="button" data-topic-action="none" class="meta-link">Clear</button>
      </div>
    </div>
    <div class="mt-3 flex flex-wrap gap-1.5">
      ${topics
        .map((topic) => {
          const isActive = activeTopics.has(topic);
          return `
            <button type="button" data-topic="${escapeHtml(topic)}" aria-pressed="${isActive}"
              class="rounded-full border px-2.5 py-0.5 text-[13px] transition-colors duration-150 ${
                isActive
                  ? "border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-900 dark:hover:border-gray-200"
                  : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 line-through hover:text-gray-700 dark:hover:text-gray-300"
              }">${escapeHtml(topic)}</button>
          `;
        })
        .join("")}
    </div>
  `;

  wrapper.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    // The filter sits inside the publications container, which opens abstracts on click.
    event.stopPropagation();

    const { topicAction, topic } = button.dataset;
    if (topicAction === "all") {
      topics.forEach((item) => activeTopics.add(item));
    } else if (topicAction === "none") {
      activeTopics.clear();
    } else if (topic) {
      if (activeTopics.has(topic)) activeTopics.delete(topic);
      else activeTopics.add(topic);
    } else {
      return;
    }

    displayAllPublications(publications, groupBy);
  });

  return wrapper;
}

function displayAllPublications(publications, groupBy = "year") {
  currentFilterMode = groupBy;
  const container = document.getElementById("publications_list");
  if (!container) return;
  container.innerHTML = "";
  container.className = "publications-container mt-8";

  const topics = [
    ...new Set(publications.flatMap((pub) => pub.keywords || ["Other"])),
  ].sort();

  if (!topicsInitialized) {
    topics.forEach((topic) => activeTopics.add(topic));
    topicsInitialized = true;
  }

  container.appendChild(buildTopicFilter(publications, topics, groupBy));

  const filtered = filterByActiveTopics(publications);

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-sm italic text-gray-500 dark:text-gray-400";
    empty.textContent = "No publications match the selected topics.";
    container.appendChild(empty);
    return;
  }

  // Each group is a ruled row: a sticky label in the margin, the papers beside it.
  const groups =
    groupBy === "type"
      ? groupPublicationsByType(filtered).map((group) => ({
          label: `${PUBLICATION_TYPE_LABELS[group.type] || group.type}s`,
          publications: group.publications,
        }))
      : groupPublicationsByYear(filtered).map((group) => ({
          label: group.year,
          publications: group.publications,
        }));

  groups.forEach((group, groupIndex) => {
    if (!group.publications.length) return;
    const groupDiv = document.createElement("div");
    groupDiv.className =
      "publication-group grid gap-x-10 border-t border-gray-900/80 dark:border-gray-500 pt-4 pb-8 md:grid-cols-[9rem_minmax(0,1fr)]";
    groupDiv.setAttribute("data-group-index", groupIndex);
    groupDiv.innerHTML = `
      <div class="md:sticky md:top-16 md:self-start">
        <h2 class="group-title text-3xl font-bold text-gray-900 dark:text-white">${escapeHtml(
          String(group.label)
        )}</h2>
        <p class="mt-1 text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">${
          group.publications.length
        } ${group.publications.length === 1 ? "paper" : "papers"}</p>
      </div>
      <div class="publication-cards mt-2 md:-mt-3 min-w-0">
        ${group.publications
          .map((item, cardIndex) => displayAsCard(item, groupBy, cardIndex, groupIndex))
          .join("")}
      </div>
    `;
    container.appendChild(groupDiv);
  });

  setupPublicationClickHandlers(container, publications, groupBy);
  // Re-apply deep link after re-render (year/type switch, topic filter change)
  requestAnimationFrame(() => focusPublicationFromUrl());
}

const PUBLICATION_HIGHLIGHT_CLASSES = [
  "publication-highlight",
  "!border-l-blue-700",
  "dark:!border-l-blue-300",
  "bg-white",
  "dark:bg-gray-800",
];

let publicationOpenController = null;

function clearPublicationHighlights(container) {
  if (!container) return;
  container.querySelectorAll(".publication-card.publication-highlight").forEach((card) => {
    card.classList.remove(...PUBLICATION_HIGHLIGHT_CLASSES);
  });
}

function highlightPublicationCard(card) {
  if (!card) return;
  card.classList.add(...PUBLICATION_HIGHLIGHT_CLASSES);
}

function focusPublicationFromUrl() {
  const key = new URLSearchParams(window.location.search).get("pub");
  if (!key || !publicationOpenController) return;
  publicationOpenController.openByKey(key, { force: true, scroll: true });
}

function setupPublicationClickHandlers(container, allPublications, groupBy) {
  let openAbstract = { groupIndex: null, cardIndex: null };

  function removeAbstractPopout() {
    const existing = container.querySelector(".publication-abstract-wrapper");
    if (existing) existing.remove();
    container
      .querySelectorAll(".publication-card[aria-expanded='true']")
      .forEach((openCard) => {
        openCard.setAttribute("aria-expanded", "false");
        openCard.removeAttribute("aria-controls");
      });
    openAbstract = { groupIndex: null, cardIndex: null };
  }

  function resolvePublication(card) {
    const cardIndex = parseInt(card.getAttribute("data-card-index"), 10);
    const groupIndex = parseInt(card.getAttribute("data-group-index"), 10);

    const groupFunction =
      groupBy === "type" ? groupPublicationsByType : groupPublicationsByYear;
    const grouped = groupFunction(filterByActiveTopics(allPublications));
    return {
      pub: grouped[groupIndex]?.publications[cardIndex],
      cardIndex,
      groupIndex,
    };
  }

  function openPublicationCard(card, { force = false, scroll = false } = {}) {
    if (!card) return;

    clearPublicationHighlights(container);
    highlightPublicationCard(card);

    const { pub, cardIndex, groupIndex } = resolvePublication(card);

    if (!pub?.abstract) {
      if (scroll) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (
      !force &&
      openAbstract.groupIndex === groupIndex &&
      openAbstract.cardIndex === cardIndex
    ) {
      removeAbstractPopout();
      clearPublicationHighlights(container);
      return;
    }

    removeAbstractPopout();
    highlightPublicationCard(card);

    const abstractDiv = document.createElement("div");
    const abstractId = `publication-abstract-${groupIndex}-${cardIndex}`;
    abstractDiv.id = abstractId;
    abstractDiv.className = "publication-abstract-wrapper";
    abstractDiv.innerHTML = renderAbstractPopout(pub);

    if (card.nextSibling) {
      card.parentElement.insertBefore(abstractDiv, card.nextSibling);
    } else {
      card.parentElement.appendChild(abstractDiv);
    }

    card.setAttribute("aria-expanded", "true");
    card.setAttribute("aria-controls", abstractId);

    const closeBtn = abstractDiv.querySelector(".close-abstract-popout");
    if (closeBtn) {
      closeBtn.onclick = function (event) {
        event.stopPropagation();
        removeAbstractPopout();
        clearPublicationHighlights(container);
      };
    }

    renderMath(abstractDiv);

    openAbstract = { groupIndex, cardIndex };

    if (scroll) {
      requestAnimationFrame(() => {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  function openByKey(key, options = {}) {
    if (!key) return false;
    const decoded = decodeURIComponent(key);
    const card =
      container.querySelector(
        `.publication-card[data-publication-key="${CSS.escape(decoded)}"]`
      ) ||
      container.querySelector(
        `.publication-card[data-publication-key="${decoded.replace(/"/g, "")}"]`
      );
    if (!card) {
      const stack = publicationStacks.get(decoded);
      const headCard =
        stack &&
        container.querySelector(
          `.publication-card[data-publication-key="${CSS.escape(publicationKey(stack.head))}"]`
        );
      if (!headCard) return false;
      const versions = headCard.querySelector(".publication-versions");
      if (versions) versions.open = true;
      openPublicationCard(headCard, options);
      return true;
    }
    openPublicationCard(card, options);
    return true;
  }

  function findPublicationCard(target) {
    let card = target;
    while (card && !card.classList.contains("publication-card")) {
      card = card.parentElement;
    }
    return card;
  }

  container.onclick = function (e) {
    if (e.target.classList.contains("close-abstract-popout")) {
      removeAbstractPopout();
      clearPublicationHighlights(container);
      return;
    }

    if (e.target.closest("a") || e.target.closest(".publication-versions")) {
      return;
    }

    openPublicationCard(findPublicationCard(e.target));
  };

  container.onkeydown = function (e) {
    if (e.target.closest("a") || e.target.closest(".publication-versions")) {
      return;
    }

    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }

    const card = findPublicationCard(e.target);
    if (!card) return;

    e.preventDefault();
    openPublicationCard(card);
  };

  publicationOpenController = { openByKey, openPublicationCard };
}

function renderAbstractPopout(item) {
  if (!item.abstract) return "";
  const keywords = (item.keywords || [])
    .map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`)
    .join("");

  return `
    <div class="publication-abstract-popout -ml-4 border-l-2 border-blue-700 dark:border-blue-300 bg-white dark:bg-gray-800 px-4 pb-5 pt-1">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Abstract</span>
          ${keywords}
        </div>
        <button class="close-abstract-popout -mt-1 px-2 text-xl leading-none text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" aria-label="Close abstract">&times;</button>
      </div>
      <div class="mt-3 max-w-3xl text-[0.95rem] leading-7 text-gray-700 dark:text-gray-200 text-pretty">${item.abstract}</div>
    </div>
  `;
}

let commonAuthors = {};
let publications = [];
let publicationStacks = new Map();

function getPublicationStack(pub) {
  return publicationStacks.get(publicationKey(pub)) || { head: pub, others: [] };
}

function formatAuthors(authors) {
  const linkHoverClass =
    "hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-2 transition-colors duration-150";
  return authors
    .map((author) => {
      if (author === "Debasish Pattanayak") {
        const debasishUrl = commonAuthors[author]?.url;
        return debasishUrl && debasishUrl !== "#"
          ? `<strong class="font-semibold text-gray-900 dark:text-white">${createLinkHtml({
              url: debasishUrl,
              label: author,
              className: `highlighted ${linkHoverClass}`,
            })}</strong>`
          : `<strong class="font-semibold text-gray-900 dark:text-white">${escapeHtml(author)}</strong>`;
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

function displayAsTalkCard(talk) {
  const links = [
    ...Object.entries(talk.links || {}).map(([key, url]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      url,
    })),
    ...(talk.tweet ? [{ label: "Tweet", url: talk.tweet }] : []),
  ]
    .map((link) => createLinkHtml({ url: link.url, label: link.label, className: "meta-link" }))
    .join("");

  const person = (prefix, who) =>
    who
      ? `<p class="text-sm text-gray-500 dark:text-gray-400">${prefix} ${createLinkHtml({
          url: who.url,
          label: who.name,
          className: "hover:underline underline-offset-2",
        })}</p>`
      : "";

  return `
    <article class="talk-card surface-card h-full p-5 flex flex-col border-t-2 !border-t-violet-500">
      ${
        talk.date
          ? `<p class="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">${escapeHtml(
              talk.date
            )}</p>`
          : ""
      }
      <h3 class="card-title mt-1.5 text-base font-bold leading-snug text-gray-900 dark:text-white">${escapeHtml(
        talk.title
      )}</h3>
      ${
        talk.event
          ? `<p class="card-event mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">${escapeHtml(
              talk.event
            )}</p>`
          : ""
      }
      ${talk.Place ? `<p class="text-sm text-gray-500 dark:text-gray-400">${escapeHtml(talk.Place)}</p>` : ""}
      ${person("Hosted by", talk.Organizer)}
      ${person("By", talk.author)}
      ${links ? `<p class="card-footer mt-auto pt-4 flex flex-wrap gap-x-4 gap-y-1">${links}</p>` : ""}
    </article>
  `;
}

function displayTalks(talks) {
  const container = document.getElementById("talks_list");
  if (!container) return;

  container.className = "talks-container grid gap-4 sm:grid-cols-2 xl:grid-cols-3";
  const sorted = [...(talks || [])].sort(
    (a, b) => parseTalkSortKey(b) - parseTalkSortKey(a)
  );

  container.innerHTML = sorted.length
    ? sorted.map((talk) => displayAsTalkCard(talk)).join("")
    : '<p class="text-gray-600 dark:text-gray-400 italic">No talks listed.</p>';
}

function displayAwards(awards) {
  const container = document.getElementById("awards_content");
  if (container)
    container.innerHTML = renderAwardsList((awards || []).slice(0, 4), {
      containerClass: "list-none p-0 m-0",
    });
}

function displayOutreach(social) {
  const container = document.getElementById("outreach_content");
  if (!container) return;

  container.innerHTML = social
    .map(
      (item) => `
        <article>
          <h3 class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            ${createLinkHtml({
              url: item.url,
              label: item.title,
              className:
                "text-xl font-bold text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
            })}
            ${item.role ? `<span class="tag">${escapeHtml(item.role)}</span>` : ""}
          </h3>
          <p class="mt-3 max-w-2xl text-base leading-7 text-gray-700 dark:text-gray-200 text-pretty">${escapeHtml(
            item.description || ""
          )}</p>
          ${renderOutreachCredit(
            item,
            "mt-3 text-sm text-gray-600 dark:text-gray-300"
          )}
        </article>
      `
    )
    .join("");
}

function displayGrants(grants) {
  const container = document.getElementById("grants_content");
  if (container)
    container.innerHTML = renderGrantsList(grants || [], {
      containerClass: "list-none p-0 m-0",
    });
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
