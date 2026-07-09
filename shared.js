const EXTERNAL_URL_PATTERN = /^(https?:)?\/\//i;

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegex(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

export function isExternalUrl(url) {
  return EXTERNAL_URL_PATTERN.test(String(url ?? ""));
}

export function getLinkAttributes(url) {
  return isExternalUrl(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
}

export function createLinkHtml({
  url,
  label,
  className = "",
  title = "",
  extraAttributes = "",
}) {
  const href = escapeAttribute(url || "#");
  const classes = className ? ` class="${className}"` : "";
  const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : "";
  const otherAttributes = extraAttributes ? ` ${extraAttributes.trim()}` : "";

  return `<a href="${href}"${getLinkAttributes(url)}${classes}${titleAttribute}${otherAttributes}>${escapeHtml(label)}</a>`;
}

export function formatMonthYear(dateString) {
  if (!dateString) return "";

  const [year, month = "1", day = "1"] = String(dateString).split("-");
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateString);
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "";
  if (!startDate) return formatMonthYear(endDate);

  const start = formatMonthYear(startDate);
  const end = endDate ? formatMonthYear(endDate) : "Present";
  return `${start} - ${end}`;
}

export function renderAwardsList(
  awards,
  {
    containerClass = "grid gap-4 md:grid-cols-2 list-none p-0 m-0",
    itemClass = "",
  } = {}
) {
  if (!Array.isArray(awards) || awards.length === 0) {
    return `
      <p class="text-sm text-gray-500 dark:text-gray-400 italic">
        No awards listed.
      </p>
    `;
  }

  return `
    <ul class="${containerClass}">
      ${awards
        .map(
          (award, index) => `
            <li class="rounded-lg border border-amber-200/80 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-4 transition-colors duration-200 ${itemClass}">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
                  ${index + 1}
                </span>
                <div class="min-w-0">
                  <span class="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-800/70 bg-white/80 dark:bg-gray-900/60 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                    Award
                  </span>
                  <p class="mt-2 text-sm leading-6 text-gray-800 dark:text-gray-100">
                    ${escapeHtml(award)}
                  </p>
                </div>
              </div>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

export function renderGrantsList(
  grants,
  {
    containerClass = "grid gap-4 md:grid-cols-2 list-none p-0 m-0",
    itemClass = "",
  } = {}
) {
  if (!Array.isArray(grants) || grants.length === 0) {
    return `
      <p class="text-sm text-gray-500 dark:text-gray-400 italic">
        No grants listed.
      </p>
    `;
  }

  return `
    <ul class="${containerClass}">
      ${grants
        .map(
          (grant, index) => `
            <li class="rounded-lg border border-emerald-200/80 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-4 transition-colors duration-200 ${itemClass}">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                  ${index + 1}
                </span>
                <div class="min-w-0">
                  <span class="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-800/70 bg-white/80 dark:bg-gray-900/60 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    Grant
                  </span>
                  <p class="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ${escapeHtml(grant.title || "")}${grant.year ? ` (${escapeHtml(grant.year)})` : ""}
                  </p>
                  ${grant.funding_agency ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300"><strong>Funding Agency:</strong> ${escapeHtml(grant.funding_agency)}</p>` : ""}
                  ${grant.project_title ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300"><strong>Project:</strong> ${escapeHtml(grant.project_title)}</p>` : ""}
                </div>
              </div>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

export function linkifyBiographyHtml(
  bioData,
  className = "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
) {
  if (
    !bioData ||
    !bioData.urls ||
    !bioData.short_bio ||
    !bioData.short_bio[0]
  ) {
    return "";
  }

  let bioText = bioData.short_bio[0];
  const entries = Object.entries(bioData.urls).sort(
    ([nameA], [nameB]) => nameB.length - nameA.length
  );

  entries.forEach(([name], index) => {
    bioText = bioText.replace(
      new RegExp(escapeRegex(name), "g"),
      `__BIO_LINK_${index}__`
    );
  });

  entries.forEach(([name, url], index) => {
    bioText = bioText.replaceAll(
      `__BIO_LINK_${index}__`,
      createLinkHtml({
        url,
        label: name,
        className,
      })
    );
  });

  return bioText;
}

export function setupDarkMode(toggleId = "darkModeToggle") {
  const htmlElement = document.documentElement;
  const darkModeToggle = document.getElementById(toggleId);
  let darkMode = localStorage.getItem("darkMode") === "true";

  htmlElement.classList.toggle("dark", darkMode);

  if (!darkModeToggle) {
    return darkMode;
  }

  darkModeToggle.setAttribute("aria-pressed", String(darkMode));

  darkModeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    htmlElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
    darkModeToggle.setAttribute("aria-pressed", String(darkMode));
  });

  return darkMode;
}

export function setupGoToTopButton(buttonId = "goToTop") {
  const goToTopButton = document.getElementById(buttonId);

  if (!goToTopButton) {
    return;
  }

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

const NAV_LINK_CLASS =
  "block rounded-md px-2.5 py-1.5 text-sm text-center text-gray-100 transition-colors duration-200 hover:bg-blue-700 dark:hover:bg-blue-900";

const NAV_LINK_ACTIVE_CLASS =
  "block rounded-md px-2.5 py-1.5 text-sm text-center font-semibold text-white bg-blue-700 dark:bg-blue-900";

export function getContactInfo(data) {
  const about = data?.about_me || {};
  const contact = about.contact || {};
  return {
    email: contact.email || about.email || "",
    office: contact.office || about.department?.office || "",
    department: contact.department || about.department?.name || "",
    institution:
      contact.institution || about.current_institution?.name || "",
  };
}

export function renderSiteFooter(data, containerId = "site_footer") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const about = data?.about_me || {};
  const contact = getContactInfo(data);
  const name = about.name || "Debasish Pattanayak";
  const email = contact.email;
  const office = contact.office;
  const institution = contact.institution;
  const department = contact.department;

  const socialLinks = [
    { href: about.google_scholar, label: "Google Scholar" },
    { href: about.orcid, label: "ORCID" },
    { href: about.dblp, label: "DBLP" },
    { href: about.github, label: "GitHub" },
    { href: about.linkedin, label: "LinkedIn" },
    { href: about.x, label: "X" },
  ].filter((link) => link.href);

  container.innerHTML = `
    <div class="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <h2 class="text-lg font-semibold text-white">${escapeHtml(name)}</h2>
          <p class="mt-2 text-sm text-blue-100/90">
            ${escapeHtml(about.position || "Assistant Professor")}${
              department ? `, ${escapeHtml(department)}` : ""
            }
          </p>
          ${
            institution
              ? `<p class="mt-1 text-sm text-blue-100/80">${escapeHtml(
                  institution
                )}</p>`
              : ""
          }
        </div>
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-200">Contact</h3>
          <ul class="mt-3 space-y-2 text-sm text-blue-50">
            ${
              email
                ? `<li><a class="hover:underline" href="mailto:${escapeAttribute(
                    email
                  )}">${escapeHtml(email)}</a></li>`
                : ""
            }
            ${office ? `<li>${escapeHtml(office)}</li>` : ""}
            <li>
              <a class="hover:underline" href="cv.html">Curriculum Vitae</a>
              ·
              <a class="hover:underline" href="for_students.html">For Students</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-200">Links</h3>
          <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-blue-50">
            ${socialLinks
              .map(
                (link) => `
                  <li>${createLinkHtml({
                    url: link.href,
                    label: link.label,
                    className: "hover:underline",
                  })}</li>
                `
              )
              .join("")}
            <li><a class="hover:underline" href="publications.html">Publications</a></li>
            <li><a class="hover:underline" href="teaching.html">Teaching</a></li>
            <li><a class="hover:underline" href="talks.html">Talks</a></li>
            <li><a class="hover:underline" href="timeline.html">Timeline</a></li>
            ${
              about.whiteboard?.url
                ? `<li>${createLinkHtml({
                    url: about.whiteboard.url,
                    label: about.whiteboard.label || "Whiteboard",
                    className: "hover:underline",
                  })}</li>`
                : ""
            }
          </ul>
        </div>
      </div>
      <p class="mt-8 border-t border-blue-500/40 pt-4 text-xs text-blue-100/70">
        © ${new Date().getFullYear()} ${escapeHtml(name)}. Academic homepage.
      </p>
    </div>
  `;
}

export function publicationKey(titleOrPub, year, type) {
  let title = titleOrPub;
  let y = year;
  let t = type;

  if (titleOrPub && typeof titleOrPub === "object") {
    title = titleOrPub.title;
    y = titleOrPub.year;
    t = titleOrPub.type;
  }

  const base = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

  const suffix = [y, t].filter((part) => part !== undefined && part !== null && part !== "").join("-");
  return suffix ? `${base}--${suffix}` : base;
}

export function getPublicationDeepLink(titleOrPub) {
  const key = publicationKey(titleOrPub);
  return key ? `publications.html?pub=${encodeURIComponent(key)}` : "publications.html";
}

export function getStudentCounts(students = {}) {
  const phdOngoing = students.phd_ongoing?.length || 0;
  const mtechOngoing = students.mtech_ongoing?.length || 0;
  const bscHonors = students.bsc_honors?.length || 0;
  const completed = students.completed?.length || 0;
  const current = phdOngoing + mtechOngoing;
  const former = bscHonors + completed;
  return {
    phdOngoing,
    mtechOngoing,
    bscHonors,
    completed,
    current,
    former,
    total: current + former,
  };
}

function formatStudentMetaLines(student) {
  const lines = [];
  const topBits = [
    student.degree,
    student.institution,
    student.status,
    student.joined ? `Joined ${student.joined}` : "",
  ].filter(Boolean);
  if (topBits.length) lines.push(topBits.join(" · "));
  if (student.project) lines.push(`Project: ${student.project}`);
  if (student.co_supervisor) {
    lines.push(`Co-supervised with ${student.co_supervisor}`);
  }
  return lines;
}

export function renderStudentsSectionHtml(students = {}) {
  const phd = students.phd_ongoing || [];
  const mtech = students.mtech_ongoing || [];
  const bscHonors = students.bsc_honors || [];
  const completed = students.completed || [];

  const renderGroup = (title, items, badgeClass, showEmpty = false) => {
    if (!showEmpty && items.length === 0) return "";

    return `
    <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md p-5">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHtml(
          title
        )}</h3>
        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}">
          ${items.length}
        </span>
      </div>
      ${
        items.length === 0
          ? `<p class="text-sm text-gray-500 dark:text-gray-400 italic">None listed.</p>`
          : `<ul class="space-y-3">
              ${items
                .map((student) => {
                  const meta = formatStudentMetaLines(student);
                  return `
                    <li class="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 px-3 py-3">
                      <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500"></span>
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-white">${escapeHtml(
                          student.name || ""
                        )}</p>
                        ${meta
                          .map(
                            (line) =>
                              `<p class="mt-0.5 text-sm text-gray-600 dark:text-gray-400">${escapeHtml(
                                line
                              )}</p>`
                          )
                          .join("")}
                      </div>
                    </li>
                  `;
                })
                .join("")}
            </ul>`
      }
    </div>
  `;
  };

  return `
    <div class="grid gap-4 md:grid-cols-2">
      ${renderGroup(
        "Ph.D. Supervision (Ongoing)",
        phd,
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
        true
      )}
      ${renderGroup(
        "M.Tech. Supervision (Ongoing)",
        mtech,
        "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
        true
      )}
      ${renderGroup(
        "B.Sc. Honors (University of Ottawa)",
        bscHonors,
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
      )}
      ${renderGroup(
        "Completed",
        completed,
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      )}
    </div>
  `;
}

function buildSearchIndex(data) {
  const items = [];

  (data.publications || []).forEach((pub) => {
    items.push({
      type: "Publication",
      title: pub.title || "",
      subtitle: [
        pub.journal?.short || pub.conference?.short || pub.booktitle || "",
        pub.year || "",
      ]
        .filter(Boolean)
        .join(" · "),
      href: getPublicationDeepLink(pub),
      haystack: [
        pub.title,
        ...(pub.authors || []),
        ...(pub.keywords || []),
        pub.journal?.full,
        pub.journal?.short,
        pub.conference?.full,
        pub.conference?.short,
        pub.year,
        pub.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  });

  (data.talks || []).forEach((talk) => {
    items.push({
      type: "Talk",
      title: talk.title || "",
      subtitle: [talk.event, talk.Place, talk.date].filter(Boolean).join(" · "),
      href: "talks.html",
      haystack: [talk.title, talk.event, talk.Place, talk.date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  });

  (data.news || []).forEach((item) => {
    items.push({
      type: "News",
      title: item.title || "",
      subtitle: item.date || "",
      href: item.url || "index.html#news",
      haystack: [item.title, item.date].filter(Boolean).join(" ").toLowerCase(),
    });
  });

  [...(data.current_teaching || []), ...(data.teaching || [])].forEach(
    (course) => {
      const title = course.title || course.course || "";
      items.push({
        type: "Teaching",
        title,
        subtitle: [course.session || course.duration, course.institution]
          .filter(Boolean)
          .join(" · "),
        href: course.url || "teaching.html",
        haystack: [
          title,
          course.session,
          course.duration,
          course.institution,
          course.year,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      });
    }
  );

  (data.research_themes || []).forEach((theme) => {
    items.push({
      type: "Research",
      title: theme.title || "",
      subtitle: theme.description || "",
      href: "index.html#research",
      haystack: [theme.title, theme.description, ...(theme.selected_papers || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  });

  (data.students?.phd_ongoing || []).forEach((student) => {
    items.push({
      type: "Student",
      title: student.name || "",
      subtitle: `Ph.D. · joined ${student.joined || ""}`.trim(),
      href: "for_students.html#students",
      haystack: [student.name, "phd", "ph.d.", student.joined]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  });

  (data.students?.mtech_ongoing || []).forEach((student) => {
    items.push({
      type: "Student",
      title: student.name || "",
      subtitle: `M.Tech. · joined ${student.joined || ""}`.trim(),
      href: "for_students.html#students",
      haystack: [student.name, "mtech", "m.tech.", student.joined]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  });

  (data.students?.bsc_honors || []).forEach((student) => {
    items.push({
      type: "Student",
      title: student.name || "",
      subtitle: [
        student.degree || "B.Sc. Honors",
        student.institution,
        student.project,
      ]
        .filter(Boolean)
        .join(" · "),
      href: "for_students.html#students",
      haystack: [
        student.name,
        "b.sc.",
        "bsc",
        "honors",
        "ottawa",
        student.degree,
        student.institution,
        student.project,
        student.co_supervisor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  });

  return items;
}

export function setupSiteSearch(data, options = {}) {
  const {
    inputId = "site_search_input",
    resultsId = "site_search_results",
    formId = "site_search_form",
  } = options;

  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  const form = document.getElementById(formId);
  if (!input || !results) return;

  const index = buildSearchIndex(data);

  const hideResults = () => {
    results.classList.add("hidden");
    results.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
  };

  const showResults = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      hideResults();
      return;
    }

    const matches = index
      .filter((item) => item.haystack.includes(q) || item.title.toLowerCase().includes(q))
      .slice(0, 10);

    if (matches.length === 0) {
      results.innerHTML = `
        <div class="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
          No matches for “${escapeHtml(query.trim())}”.
        </div>
      `;
      results.classList.remove("hidden");
      input.setAttribute("aria-expanded", "true");
      return;
    }

    results.innerHTML = matches
      .map(
        (item) => `
          <a href="${escapeAttribute(item.href)}"
             class="block px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              ${escapeHtml(item.type)}
            </span>
            <span class="mt-1 block text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              ${escapeHtml(item.title)}
            </span>
            ${
              item.subtitle
                ? `<span class="mt-0.5 block text-xs text-gray-500 dark:text-gray-400 line-clamp-1">${escapeHtml(
                    item.subtitle
                  )}</span>`
                : ""
            }
          </a>
        `
      )
      .join("");
    results.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
  };

  input.addEventListener("input", () => showResults(input.value));
  input.addEventListener("focus", () => showResults(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideResults();
      input.blur();
    }
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      showResults(input.value);
    });
  }

  document.addEventListener("click", (event) => {
    if (
      !results.contains(event.target) &&
      event.target !== input &&
      !form?.contains(event.target)
    ) {
      hideResults();
    }
  });
}

export function appendNavLinks(navbar, links, className = NAV_LINK_CLASS) {
  if (!navbar) return;

  links.forEach((link) => {
    const li = document.createElement("li");
    li.className = "flex shrink-0 items-center";
    li.innerHTML = createLinkHtml({
      url: link.href,
      label: link.label,
      className: link.active ? NAV_LINK_ACTIVE_CLASS : className,
      extraAttributes: link.active ? 'aria-current="page"' : "",
    });
    navbar.appendChild(li);
  });
}

const PAGE_HREFS = {
  home: "index.html",
  publications: "publications.html",
  teaching: "teaching.html",
  talks: "talks.html",
  timeline: "timeline.html",
  "for-students": "for_students.html",
  cv: "cv.html",
};

export function setupPrimaryNav(data = {}, extraLinks = []) {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const activeHref = PAGE_HREFS[document.body.dataset.page] || "";
  navbar.innerHTML = "";
  navbar.className =
    "flex min-w-0 flex-1 gap-1.5 overflow-x-auto whitespace-nowrap nav-scroll";
  appendNavLinks(
    navbar,
    [...getPrimarySiteLinks(data), ...extraLinks].map((link) => ({
      ...link,
      active: link.href === activeHref,
    }))
  );
}

export function renderSimulatorCardsHtml(simulators = []) {
  return simulators
    .map((item) => {
      const primaryLink = createLinkHtml({
        url: item.url,
        label: item.name,
        className:
          "text-base font-semibold text-blue-700 dark:text-blue-300 hover:underline transition-colors duration-200",
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
        <article class="surface-card-hover h-full p-4 !rounded-xl">
          <p>${primaryLink}</p>
          <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">${escapeHtml(
            item.description || "Interactive resource"
          )}</p>
          ${sourceLink ? `<p class="mt-3">${sourceLink}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

export function getPrimarySiteLinks(data = {}) {
  const links = [
    { href: "index.html", label: "Home" },
    { href: "publications.html", label: "Publications" },
    { href: "teaching.html", label: "Teaching" },
    { href: "talks.html", label: "Talks" },
    { href: "timeline.html", label: "Timeline" },
    { href: "for_students.html", label: "For Students" },
  ];

  if (data.about_me?.cv?.url) {
    links.push({ href: data.about_me.cv.url, label: "CV" });
  }

  return links;
}

export function renderProfileHeader(aboutMe, options = {}) {
  if (!aboutMe) return;

  const {
    department = aboutMe.department,
    nameId = "name",
    nameOdiaId = "name_odia",
    positionId = "position",
    linksId = "links",
    pictureId = "picture",
    officeId = "office",
    headerAddressContainerId = "header_address_container",
    pictureFallback = "debasish_photo.jpeg",
    linkItemClass =
      "social-link inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 border border-white/60 transition-all duration-200 overflow-hidden",
    iconImageClass = "h-6 w-6 object-contain",
    pictureClass = "block w-full h-full object-cover object-top",
    positionLinkClass =
      "text-blue-100 hover:text-white hover:underline decoration-blue-100 decoration-2 underline-offset-2 transition-colors",
    stackedPosition = false,
    officeTextClass = "text-sm mt-2 font-medium opacity-90 lg:hidden leading-relaxed",
  } = options;

  const nameElement = document.getElementById(nameId);
  const nameOdiaElement = document.getElementById(nameOdiaId);
  const positionElement = document.getElementById(positionId);
  const linksElement = document.getElementById(linksId);
  const pictureElement = document.getElementById(pictureId);
  const headerAddressContainer = document.getElementById(
    headerAddressContainerId
  );
  const pictureUrl = aboutMe.picture || pictureFallback;

  if (nameElement) {
    nameElement.textContent = aboutMe.name || "";
  }

  if (nameOdiaElement) {
    nameOdiaElement.textContent = aboutMe.name_odia || "";
  }

  if (positionElement) {
    const institutionName = aboutMe.current_institution?.name || "";
    const institutionUrl = aboutMe.current_institution?.url || "";
    const institutionHtml = institutionName
      ? createLinkHtml({
          url: institutionUrl,
          label: institutionName,
          className: positionLinkClass,
        })
      : "";

    const departmentHtml =
      department?.name && department?.url
        ? createLinkHtml({
            url: department.url,
            label: department.name,
            className: positionLinkClass,
          })
        : escapeHtml(department?.name || "");

    if (stackedPosition) {
      const positionLines = [
        aboutMe.position
          ? `<span class="block text-base sm:text-lg font-semibold text-white">${escapeHtml(
              aboutMe.position
            )}</span>`
          : "",
        departmentHtml
          ? `<span class="mt-1.5 block text-sm sm:text-base text-blue-50/95">${departmentHtml}</span>`
          : "",
        institutionHtml
          ? `<span class="mt-1 block text-sm sm:text-base text-blue-50/90">${institutionHtml}</span>`
          : "",
      ].filter(Boolean);

      positionElement.innerHTML = positionLines.join("");
      positionElement.classList.add("leading-snug");
    } else if (departmentHtml && institutionHtml) {
      positionElement.innerHTML = `${escapeHtml(
        aboutMe.position || ""
      )} at ${departmentHtml}, ${institutionHtml}`;
    } else if (institutionHtml) {
      positionElement.innerHTML = `${escapeHtml(
        aboutMe.position || ""
      )} at ${institutionHtml}`;
    } else {
      positionElement.textContent = aboutMe.position || "";
    }
  }

  if (department?.office && positionElement) {
    const formattedOffice = escapeHtml(department.office).replaceAll(
      ",",
      ",<br>"
    );
    let officeElement = document.getElementById(officeId);

    if (!officeElement) {
      officeElement = document.createElement("p");
      officeElement.id = officeId;
      officeElement.className = officeTextClass;
      positionElement.parentNode.insertBefore(officeElement, linksElement);
    }

    officeElement.innerHTML = formattedOffice;

    if (headerAddressContainer) {
      headerAddressContainer.innerHTML = `
        <p class="text-xs uppercase tracking-wider opacity-75 mb-1">Office</p>
        <p class="font-bold text-lg leading-tight text-white shadow-sm">${formattedOffice}</p>
      `;
    }
  } else if (headerAddressContainer) {
    headerAddressContainer.innerHTML = "";
  }

  if (pictureElement) {
    // Keep container as the circular frame; only replace the image content.
    pictureElement.innerHTML = `
      <img src="${escapeAttribute(pictureUrl)}" alt="Profile picture" class="${pictureClass}" />
    `;
  }

  if (linksElement) {
    const linkIcons = [
      {
        href: aboutMe.dblp,
        src: "assets/icons/dblp.icon.192x192.png",
        title: "DBLP Profile",
      },
      {
        href: aboutMe.google_scholar,
        src: "assets/icons/google_scholar_logo.svg",
        title: "Google Scholar Profile",
      },
      {
        href: aboutMe.orcid,
        src: "assets/icons/orcid_24x24.png",
        title: "ORCID Profile",
      },
      {
        href: aboutMe.x,
        src: "assets/icons/x_favicon.ico",
        title: "X Profile",
      },
      {
        href: aboutMe.github,
        src: "assets/icons/GitHub-Mark.png",
        title: "GitHub Profile",
      },
      {
        href: aboutMe.linkedin,
        src: "assets/icons/linkedin.png",
        title: "LinkedIn Profile",
      },
    ];

    linksElement.classList.add(
      "flex",
      "flex-wrap",
      "items-center",
      "gap-2.5"
    );

    linksElement.innerHTML = linkIcons
      .filter((icon) => icon.href)
      .map(
        (icon) => `
          <a href="${escapeAttribute(icon.href)}"${getLinkAttributes(
            icon.href
          )} title="${escapeAttribute(icon.title)}" aria-label="${escapeAttribute(
            icon.title
          )}" class="${linkItemClass}">
            <img src="${escapeAttribute(icon.src)}" alt="" class="${iconImageClass}" width="22" height="22" decoding="async" />
          </a>
        `
      )
      .join("");
  }
}
