import {
  createLinkHtml,
  escapeHtml,
  formatDateRange,
  getPublicationDeepLink,
  renderSiteFooter,
  setupDarkMode,
  setupGoToTopButton,
  setupPrimaryNav,
  setupSiteSearch,
} from "./shared.js";

document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  setupGoToTopButton();

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      setupPrimaryNav(data);
      renderSiteFooter(data);
      setupSiteSearch(data);
      renderTimeline(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      const container = document.getElementById("timeline_content");
      if (container) {
        container.innerHTML =
          '<p class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Unable to load the timeline right now.</p>';
      }
    });
});

// ---------------------------------------------------------------------------
// Dates. Everything is reduced to a month index: year * 12 + month (0-based).

const MONTH_INDEXES = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function monthKeyFromIso(isoDate) {
  const [year, month = "1"] = String(isoDate || "").split("-");
  if (!/^\d{4}$/.test(year)) return null;
  return Number(year) * 12 + (Number(month) - 1);
}

// "July-Nov 2025", "Jun 19 2026", "1 July 2026", "Feb-May 2022", "2022",
// "Jul-Nov 2016 & 2017" — take the first month name and the first year.
function monthKeyFromLoose(text) {
  const s = String(text || "");
  const yearMatch = s.match(/\d{4}/);
  if (!yearMatch) return null;
  const monthMatch = s.toLowerCase().match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/);
  const month = monthMatch ? MONTH_INDEXES[monthMatch[0]] : 5;
  return Number(yearMatch[0]) * 12 + month;
}

function monthKeyLabel(key) {
  const date = new Date(Math.floor(key / 12), key % 12, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Visits are day-precision (unlike eras, which are month-precision), and an
// open-ended end_date shouldn't read as "- Present" the way formatDateRange
// renders it for an ongoing position — so this formats visits on its own.
function parseIsoDate(iso) {
  const [y, m = "1", d = "1"] = String(iso || "").split("-");
  if (!/^\d{4}$/.test(y)) return null;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatVisitDates(visit) {
  const start = parseIsoDate(visit.start_date);
  if (!start) return "";
  if (!visit.end_date) {
    return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  const end = parseIsoDate(visit.end_date);
  if (!end) return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    const monthLabel = start.toLocaleDateString("en-US", { month: "short" });
    return `${monthLabel} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`;
  }
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

// ---------------------------------------------------------------------------
// Type styles (semantic accents from AGENT.md)

const EVENT_STYLES = {
  Publication: {
    dot: "bg-indigo-500",
    chip: "border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200",
  },
  Talk: {
    dot: "bg-purple-500",
    chip: "border-purple-200 dark:border-purple-800/70 bg-purple-50/80 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200",
  },
  Teaching: {
    dot: "bg-teal-500",
    chip: "border-teal-200 dark:border-teal-800/70 bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200",
  },
  News: {
    dot: "bg-green-500",
    chip: "border-green-200 dark:border-green-800/70 bg-green-50/80 dark:bg-green-950/40 text-green-800 dark:text-green-200",
  },
  Visit: {
    dot: "bg-rose-500",
    chip: "border-rose-200 dark:border-rose-800/70 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200",
  },
};

const ERA_STYLES = {
  Education: {
    dot: "bg-amber-500",
    card: "border-amber-300/80 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/30",
    chip: "border-amber-200 dark:border-amber-800/70 bg-white/80 dark:bg-gray-900/60 text-amber-800 dark:text-amber-200",
  },
  Position: {
    dot: "bg-blue-500",
    card: "border-blue-300/80 dark:border-blue-800/70 bg-blue-50/80 dark:bg-blue-950/30",
    chip: "border-blue-200 dark:border-blue-800/70 bg-white/80 dark:bg-gray-900/60 text-blue-800 dark:text-blue-200",
  },
};

// ---------------------------------------------------------------------------
// Build eras (education + positions) and point events, then group by month.

function buildEras(aboutMe = {}) {
  const eras = [];

  (aboutMe.education || []).forEach((entry) => {
    const start = monthKeyFromIso(entry.start_date);
    if (start === null) return;
    eras.push({
      kind: "Education",
      title: entry.degree || "",
      institution: entry.institution,
      people: entry.supervisors || [],
      peopleLabel: "Supervisors",
      start,
      end: monthKeyFromIso(entry.end_date),
      dates: formatDateRange(entry.start_date, entry.end_date),
    });
  });

  (aboutMe.positions || []).forEach((entry) => {
    const start = monthKeyFromIso(entry.start_date);
    if (start === null) return;
    eras.push({
      kind: "Position",
      title: entry.title || entry.tile || "",
      institution: entry.institution,
      people: entry.institution?.supervisor ? [entry.institution.supervisor] : [],
      peopleLabel: "With",
      fellowship: entry.fellowship || "",
      start,
      end: monthKeyFromIso(entry.end_date),
      dates: formatDateRange(entry.start_date, entry.end_date) || entry.duration || "",
    });
  });

  return eras.sort((a, b) => a.start - b.start);
}

const NEWS_MATCH_STOPWORDS = new Set([
  "paper", "accepted", "version", "brief", "announcement", "full",
  "with", "under", "from", "this", "that", "another",
]);

function significantTokens(text) {
  const words = String(text || "")
    .toLowerCase()
    .replace(/\$[^$]*\$/g, " ")
    .match(/[a-z]{4,}/g) || [];
  return new Set(words.filter((word) => !NEWS_MATCH_STOPWORDS.has(word)));
}

function doiFromUrl(url) {
  const match = String(url || "").match(/10\.\d{4,9}\/[^\s?#]+/);
  return match ? match[0].toLowerCase() : null;
}

function arxivIdFromUrl(url) {
  const match = String(url || "").match(/(\d{4}\.\d{4,5})/);
  return match ? match[1] : null;
}

// A news item that announces a paper is the same story as the publication:
// match by DOI, then arXiv id, then title-token overlap.
function findMatchingPublication(newsItem, pubEntries) {
  const newsDoi = doiFromUrl(newsItem.url);
  if (newsDoi) {
    const hit = pubEntries.find((entry) => entry.doi === newsDoi);
    if (hit) return hit;
  }
  const newsArxiv = arxivIdFromUrl(newsItem.url);
  if (newsArxiv) {
    const hit = pubEntries.find((entry) => entry.arxiv === newsArxiv);
    if (hit) return hit;
  }

  const newsTokens = significantTokens(newsItem.title);
  const newsShortTokens = new Set(
    String(newsItem.title || "").toLowerCase().match(/[a-z]{3,}/g) || []
  );
  let best = null;
  let bestScore = 0;
  pubEntries.forEach((entry) => {
    let score = 0;
    entry.tokens.forEach((token) => {
      if (newsTokens.has(token)) score += 1;
    });
    const venueHit = [...entry.venueTokens].some((token) =>
      newsShortTokens.has(token)
    );
    const matched = score >= 2 || (score >= 1 && venueHit);
    if (matched && (score > bestScore || best === null)) {
      best = entry;
      bestScore = score;
    }
  });
  return best;
}

// Venue names, short names, and acronyms ("International Journal of
// Networking and Computing" -> "ijnc") so "accepted to IJNC" style news match.
function venueTokens(pub) {
  const tokens = new Set();
  [
    pub.journal?.short,
    pub.journal?.full,
    pub.conference?.short,
    pub.conference?.full,
    pub.booktitle,
  ].forEach((venue) => {
    if (!venue) return;
    (String(venue).toLowerCase().match(/[a-z]{3,}/g) || []).forEach((word) =>
      tokens.add(word)
    );
    const acronym = (String(venue).match(/\b[A-Za-z]+/g) || [])
      .filter((word) => /^[A-Z]/.test(word))
      .map((word) => word[0].toLowerCase())
      .join("");
    if (acronym.length >= 3) tokens.add(acronym);
  });
  return tokens;
}

function buildEvents(data) {
  const events = [];

  const pubEntries = (data.publications || []).map((pub) => {
    // Conference event dates place the paper; otherwise the registry date; else the year.
    const iso = String(pub.published_date || "");
    const preciseKey =
      monthKeyFromLoose(pub.date) ??
      (iso.includes("-") ? monthKeyFromIso(iso) : null);
    return {
      pub,
      doi: doiFromUrl(pub.doi),
      arxiv: arxivIdFromUrl(pub.arxiv),
      tokens: significantTokens(pub.title),
      venueTokens: venueTokens(pub),
      monthKey: preciseKey ?? monthKeyFromLoose(String(pub.year || "")),
      monthIsPrecise: preciseKey !== null,
    };
  });

  // A talk given during a trip is the same story as the visit itself (its
  // "reason" already names the talk) — matched talks fold into the visit
  // card below instead of getting their own duplicate card.
  const visitRanges = (data.visits || []).map((visit) => {
    const start = monthKeyFromIso(visit.start_date);
    const end = visit.end_date ? monthKeyFromIso(visit.end_date) : start;
    return { visit, start, end: end ?? start };
  });

  // Place strings are messy ("Dept. of Mathematics, IIT Guwahati" vs.
  // "IIT Guwahati, India", or the place folded into "event" instead of
  // "Place") — match on shared distinctive words rather than substrings.
  const PLACE_STOPWORDS = new Set([
    "the", "and", "for", "institute", "department", "mathematics",
    "mathematical", "science", "sciences", "technology", "university",
    "india", "school", "conference", "workshop", "symposium", "international",
  ]);
  function placeTokens(text) {
    return new Set(
      (String(text || "").toLowerCase().match(/[a-z]{3,}/g) || []).filter(
        (word) => !PLACE_STOPWORDS.has(word)
      )
    );
  }

  function findMatchingVisit(talk) {
    const talkKey = monthKeyFromLoose(talk.date);
    if (talkKey === null) return null;
    const talkTokens = placeTokens([talk.Place, talk.event].filter(Boolean).join(" "));
    if (talkTokens.size === 0) return null;
    return visitRanges.find(({ visit, start, end }) => {
      if (start === null || talkKey < start || talkKey > end) return false;
      const visitTokens = placeTokens(visit.place);
      return [...visitTokens].some((token) => talkTokens.has(token));
    })?.visit;
  }

  (data.talks || []).forEach((talk) => {
    const key = monthKeyFromLoose(talk.date);
    if (key === null) return;
    if (findMatchingVisit(talk)) return; // folded into its visit card instead
    events.push({
      kind: "Talk",
      monthKey: key,
      title: talk.title || "",
      subtitle: [talk.event, talk.Place].filter(Boolean).join(" · "),
      href: "talks.html",
    });
  });

  visitRanges.forEach(({ visit, start }) => {
    if (start === null) return;
    events.push({
      kind: "Visit",
      monthKey: start,
      title: visit.place || "",
      subtitle: [visit.reason, formatVisitDates(visit)].filter(Boolean).join(" · "),
      href: "",
    });
  });

  [...(data.current_teaching || []), ...(data.teaching || [])].forEach((course) => {
    const key = monthKeyFromLoose(course.session || course.duration || course.year);
    if (key === null) return;
    events.push({
      kind: "Teaching",
      monthKey: key,
      title: course.title || course.course || "",
      subtitle: [course.institution, course.session || course.duration || course.year]
        .filter(Boolean)
        .join(" · "),
      href: course.url || "teaching.html",
    });
  });

  (data.news || []).forEach((item) => {
    const key = monthKeyFromLoose(item.date);
    if (key === null) return;

    // Paper announcements merge into their publication card (awards stay).
    if (!/award|grant/i.test(item.title || "")) {
      const match = findMatchingPublication(item, pubEntries);
      if (match) {
        if (!match.monthIsPrecise) {
          // Year-only publication: place it at its announcement date instead.
          match.monthKey = key;
          match.monthIsPrecise = true;
        }
        return;
      }
    }

    events.push({
      kind: "News",
      monthKey: key,
      title: item.title || "",
      subtitle: item.date || "",
      href: item.url || "",
    });
  });

  pubEntries.forEach(({ pub, monthKey }) => {
    if (monthKey === null) return;
    events.push({
      kind: "Publication",
      monthKey,
      title: pub.title || "",
      subtitle: [
        pub.journal?.short || pub.conference?.short || pub.booktitle || "",
        pub.type || "",
      ]
        .filter(Boolean)
        .join(" · "),
      href: getPublicationDeepLink(pub),
    });
  });

  return events.sort((a, b) => a.monthKey - b.monthKey);
}

// ---------------------------------------------------------------------------
// Render

function renderEraCard(era) {
  const style = ERA_STYLES[era.kind];
  const institution = era.institution?.name
    ? era.institution.url
      ? createLinkHtml({
          url: era.institution.url,
          label: era.institution.name,
          className:
            "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
        })
      : escapeHtml(era.institution.name)
    : "";
  const people = (era.people || [])
    .filter((person) => person?.name)
    .map((person) =>
      person.url
        ? createLinkHtml({
            url: person.url,
            label: person.name,
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
          })
        : escapeHtml(person.name)
    );

  return `
    <div class="rounded-2xl border ${style.card} p-5 shadow-md">
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${style.chip}">
          ${era.kind}
        </span>
        <span class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">${escapeHtml(
          era.dates
        )}</span>
      </div>
      <p class="mt-2 text-lg font-bold leading-snug text-gray-900 dark:text-white">${escapeHtml(
        era.title
      )}</p>
      ${institution ? `<p class="mt-1 text-sm text-gray-700 dark:text-gray-200">${institution}</p>` : ""}
      ${
        people.length
          ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(
              era.peopleLabel
            )}: ${people.join(", ")}</p>`
          : ""
      }
      ${
        era.fellowship
          ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(era.fellowship)}</p>`
          : ""
      }
    </div>
  `;
}

function renderEvent(event) {
  const style = EVENT_STYLES[event.kind];
  const title = event.href
    ? createLinkHtml({
        url: event.href,
        label: event.title,
        className:
          "font-semibold text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200",
      })
    : `<span class="font-semibold text-gray-900 dark:text-white">${escapeHtml(event.title)}</span>`;

  return `
    <div class="surface-card mt-1.5 !rounded-xl p-3 text-sm">
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.chip}">
        ${event.kind}
      </span>
      <p class="mt-1.5 leading-snug">${title}</p>
      ${
        event.subtitle
          ? `<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${escapeHtml(event.subtitle)}</p>`
          : ""
      }
    </div>
  `;
}

function renderMonthRow(key, events) {
  return `
    <div class="relative pl-6 py-2" data-month-label="${escapeHtml(monthKeyLabel(key))}">
      <span class="absolute -left-[7px] top-2.5 h-3 w-3 rounded-full ring-4 ring-gray-100 dark:ring-dark-bg ${
        EVENT_STYLES[events[0].kind].dot
      }"></span>
      <p class="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">${escapeHtml(
        monthKeyLabel(key)
      )}</p>
      ${events.map(renderEvent).join("")}
    </div>
  `;
}

// Stints (internships, visiting stays) sit INSIDE a longer era: they must not
// chop the containing era into pieces. They render as compact cards that stick
// just below the month chip while their own months scroll past.
function splitEras(eras) {
  const span = (era) => (era.end ?? Infinity) - era.start;
  const isContained = (a) =>
    eras.some(
      (b) =>
        b !== a &&
        b.start <= a.start &&
        (a.end ?? a.start) <= (b.end ?? Infinity) &&
        span(b) > span(a)
    );
  const stints = eras.filter(isContained);
  return { primary: eras.filter((era) => !stints.includes(era)), stints };
}

function renderStintCard(stint) {
  const style = ERA_STYLES[stint.kind];
  const institution = stint.institution?.name
    ? stint.institution.url
      ? createLinkHtml({
          url: stint.institution.url,
          label: stint.institution.name,
          className: "hover:underline",
        })
      : escapeHtml(stint.institution.name)
    : "";
  const person = stint.people?.[0];
  const personHtml = person?.name
    ? ` · With ${
        person.url
          ? createLinkHtml({ url: person.url, label: person.name, className: "hover:underline" })
          : escapeHtml(person.name)
      }`
    : "";

  return `
    <div class="rounded-xl border ${style.card} !bg-opacity-100 bg-white dark:bg-gray-800 px-4 py-2.5 shadow-lg">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.chip}">
          ${stint.kind}
        </span>
        <span class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">${escapeHtml(
          stint.dates
        )}</span>
      </div>
      <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
        ${escapeHtml(stint.title)}${institution ? ` — ${institution}` : ""}<span class="font-normal text-gray-600 dark:text-gray-300">${personHtml}</span>
      </p>
    </div>
  `;
}

const ALL_KINDS = ["Education", "Position", "Publication", "Talk", "Teaching", "News", "Visit"];
const activeKinds = new Set(ALL_KINDS);
let timelineData = null;

function renderTimeline(data) {
  timelineData = data;
  renderLegend();
  renderFilteredTimeline();
}

function renderFilteredTimeline() {
  const data = timelineData;
  const container = document.getElementById("timeline_content");
  if (!container || !data) return;

  const allEras = buildEras(data.about_me);
  // Section boundaries always come from the FULL era list, filtered or not:
  // dropping an era kind must not let a neighboring era's section swell to
  // cover months it never actually spanned. The active-kinds filter only
  // decides whether a given era/stint's card is drawn, further down.
  const { primary: eras, stints } = splitEras(allEras);
  const events = buildEvents(data).filter((event) => activeKinds.has(event.kind));

  if (eras.length === 0) {
    container.innerHTML =
      '<p class="text-gray-600 dark:text-gray-400 italic">No dated entries found.</p>';
    return;
  }

  const now = new Date();
  const lastMonth = Math.max(
    now.getFullYear() * 12 + now.getMonth(),
    events.length ? events[events.length - 1].monthKey : 0
  );

  // Era i owns the months [start_i, start_{i+1}); the last era runs to today.
  const sections = eras.map((era, index) => ({
    era,
    from: era.start,
    to: index + 1 < eras.length ? eras[index + 1].start - 1 : lastMonth,
  }));

  // Clamp stray events (before the first era) into the first section.
  const firstFrom = sections[0].from;
  const eventsByMonth = new Map();
  events.forEach((event) => {
    const key = Math.max(event.monthKey, firstFrom);
    if (!eventsByMonth.has(key)) eventsByMonth.set(key, []);
    eventsByMonth.get(key).push(event);
  });

  container.innerHTML = [...sections]
    .reverse()
    .map(({ era, from, to }) => {
      // Boundaries stay true to the full era list; a filtered-out stint kind
      // just renders without its card, still inside its real owning section.
      const sectionStints = stints.filter(
        (stint) => stint.start >= from && stint.start <= to
      );

      const months = [];
      let key = to;
      while (key >= from) {
        const stint = sectionStints.find(
          (candidate) =>
            key >= candidate.start &&
            key <= Math.min(candidate.end ?? candidate.start, to)
        );
        if (stint) {
          const stintFrom = Math.max(stint.start, from);
          const rows = [];
          for (let k = key; k >= stintFrom; k -= 1) {
            const monthEvents = eventsByMonth.get(k);
            if (monthEvents?.length) rows.push(renderMonthRow(k, monthEvents));
          }
          const stintCard = activeKinds.has(stint.kind)
            ? `
              <div class="sticky top-[6.75rem] z-[5] pl-6 py-1">
                ${renderStintCard(stint)}
              </div>
            `
            : "";
          months.push(`
            <div class="relative">
              ${stintCard}
              ${rows.join("")}
            </div>
          `);
          key = stintFrom - 1;
          continue;
        }
        const monthEvents = eventsByMonth.get(key);
        if (monthEvents?.length) months.push(renderMonthRow(key, monthEvents));
        key -= 1;
      }
      if (months.length === 0) {
        months.push(
          '<p class="pl-6 py-3 text-sm italic text-gray-500 dark:text-gray-400">No dated items in this period.</p>'
        );
      }

      return `
        <section class="grid gap-x-8 gap-y-4 lg:grid-cols-[20rem,minmax(0,1fr)] items-start">
          <div class="sticky top-24 z-10">
            ${activeKinds.has(era.kind) ? renderEraCard(era) : ""}
          </div>
          <div class="relative ml-2 border-l-2 border-gray-200 dark:border-gray-700">
            ${months.join("")}
          </div>
        </section>
      `;
    })
    .join("");

  setupMonthIndicator();
}

function renderLegend() {
  const container = document.getElementById("timeline_legend");
  if (!container) return;

  const entries = [
    ["Education", ERA_STYLES.Education],
    ["Position", ERA_STYLES.Position],
    ["Publication", EVENT_STYLES.Publication],
    ["Talk", EVENT_STYLES.Talk],
    ["Teaching", EVENT_STYLES.Teaching],
    ["News", EVENT_STYLES.News],
    ["Visit", EVENT_STYLES.Visit],
  ];

  container.innerHTML = entries
    .map(
      ([label, style]) => `
        <button type="button" data-kind="${label}" aria-pressed="true"
          class="legend-filter inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 surface-chip transition-opacity duration-150 hover:opacity-80">
          <span class="h-2.5 w-2.5 rounded-full ${style.dot}"></span>
          ${label}
        </button>
      `
    )
    .join("");

  container.querySelectorAll(".legend-filter").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.kind;
      if (activeKinds.has(kind)) {
        activeKinds.delete(kind);
      } else {
        activeKinds.add(kind);
      }
      button.setAttribute("aria-pressed", String(activeKinds.has(kind)));
      button.classList.toggle("opacity-40", !activeKinds.has(kind));
      renderFilteredTimeline();
    });
  });
}

function setupMonthIndicator() {
  const indicator = document.getElementById("timeline_current_month");
  if (!indicator) return;

  const update = () => {
    const rows = [...document.querySelectorAll("[data-month-label]")];
    if (rows.length === 0) return;
    // Rows are newest-first; pick the last one that has crossed the header line.
    let label = rows[0].dataset.monthLabel;
    for (const row of rows) {
      if (row.getBoundingClientRect().top <= 140) {
        label = row.dataset.monthLabel;
      } else {
        break;
      }
    }
    indicator.textContent = label;
  };

  if (!indicator.dataset.listenerAttached) {
    window.addEventListener("scroll", update, { passive: true });
    indicator.dataset.listenerAttached = "true";
  }
  update();
}
