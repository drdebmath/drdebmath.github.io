import {
  createLinkHtml,
  escapeHtml,
  formatDateRange,
  getStudentCounts,
  linkifyBiographyHtml,
  renderAwardsList,
  renderGrantsList,
  renderProfileHeader,
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
    .then((data) => initializeCVPage(data))
    .catch((error) => {
      console.error("Error fetching data:", error);
      const container = document.getElementById("cv_content");
      if (container) {
        container.innerHTML =
          '<p class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Unable to load the CV data right now.</p>';
      }
    });
});

function initializeCVPage(data) {
  renderProfileHeader(data.about_me, {
    department: data.about_me?.department,
  });
  setupPrimaryNav(data);
  renderSiteFooter(data);
  setupSiteSearch(data);

  const content = document.getElementById("cv_content");

  if (!content) return;

  const snapshotCards = [
    {
      label: "Current Position",
      value: `${data.about_me?.position || ""} at ${
        data.about_me?.current_institution?.name || ""
      }`,
    },
    {
      label: "Publications",
      value: `${data.publications?.length || 0} listed works`,
    },
    {
      label: "Research Areas",
      value: `${data.research?.length || 0} active themes`,
    },
    {
      label: "Grants",
      value: `${data.grants?.length || 0} funded project${
        data.grants?.length === 1 ? "" : "s"
      }`,
    },
  ];

  content.innerHTML = `
    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Profile</h2></div>
      <div class="panel-body">
      <div class="leading-7 text-gray-800 dark:text-gray-100">
        <p>${renderCvBiography(data.about_me?.biodata)}</p>
      </div>
      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        ${snapshotCards
          .map(
            (card) => `
              <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">${escapeHtml(
                  card.label
                )}</p>
                <p class="mt-2 text-lg font-semibold">${escapeHtml(card.value)}</p>
              </div>
            `
          )
          .join("")}
      </div>
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Education &amp; Experience</h2></div>
      <div class="panel-body">
      ${renderCareerTimeline(
        data.about_me?.education || [],
        data.about_me?.positions || []
      )}
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Teaching</h2></div>
      <div class="panel-body">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">${renderTeaching(
        [...(data.current_teaching || []), ...(data.teaching || [])]
      )}</div>
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Research Supervision</h2></div>
      <div class="panel-body">
      ${renderStudentStats(data.students || {})}
      <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">
        ${createLinkHtml({
          url: "for_students.html#students",
          label: "View full student list →",
          className:
            "text-blue-600 dark:text-blue-400 hover:underline font-medium",
        })}
      </p>
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Service</h2></div>
      <div class="panel-body">
      ${renderServiceSection(
        data.administrative_responsibilities || [],
        data.community_services || {}
      )}
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Awards</h2></div>
      <div class="panel-body">
      ${renderAwardsList(data.awards || [], {
        itemClass: "h-full",
      })}
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Grants</h2></div>
      <div class="panel-body">
      ${renderGrantsList(data.grants || [], {
        itemClass: "h-full",
      })}
      </div>
    </section>

    <section class="surface-panel">
      <div class="panel-header"><h2 class="section-heading">Talks</h2></div>
      <div class="panel-body">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">${renderTalks(data.talks || [])}</div>
      </div>
    </section>
  `;
}

function renderCvBiography(bioData) {
  const shortBio = bioData?.short_bio?.[0] || "";
  const sanitizedBio = shortBio.replace(
    /\s*See my CV for a fuller academic profile\.?\s*$/i,
    ""
  );

  return linkifyBiographyHtml({
    ...bioData,
    short_bio: [sanitizedBio],
  });
}

function institutionLinkHtml(institution) {
  if (!institution?.name) return "";
  return institution.url
    ? createLinkHtml({
        url: institution.url,
        label: institution.name,
        className:
          "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
      })
    : escapeHtml(institution.name);
}

function personLinkHtml(person) {
  if (!person?.name) return "";
  return person.url
    ? createLinkHtml({
        url: person.url,
        label: person.name,
        className:
          "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
      })
    : escapeHtml(person.name);
}

function buildTimelineItems(education, positions) {
  const items = [];

  education.forEach((entry) => {
    items.push({
      kind: "Education",
      title: entry.degree || "",
      institution: entry.institution,
      people: entry.supervisors || [],
      peopleLabel: "Supervisors",
      dates: formatDateRange(entry.start_date, entry.end_date),
      sortKey: entry.start_date || "",
    });
  });

  positions.forEach((entry) => {
    items.push({
      kind: "Position",
      title: entry.title || entry.tile || "",
      institution: entry.institution,
      people: entry.institution?.supervisor ? [entry.institution.supervisor] : [],
      peopleLabel: "With",
      fellowship: entry.fellowship || "",
      dates: formatDateRange(entry.start_date, entry.end_date) || entry.duration || "",
      sortKey: entry.start_date || "",
    });
  });

  return items.sort((a, b) => (b.sortKey || "").localeCompare(a.sortKey || ""));
}

function renderCareerTimeline(education, positions) {
  const items = buildTimelineItems(education, positions);
  if (items.length === 0) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400 italic">Nothing listed.</p>';
  }

  const kindStyles = {
    Education: {
      dot: "bg-amber-500",
      chip: "border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200",
    },
    Position: {
      dot: "bg-blue-500",
      chip: "border-blue-200 dark:border-blue-800/70 bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200",
    },
  };

  return `
    <div class="relative">
      <div class="absolute inset-y-0 left-[8px] w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-700 md:left-1/2"></div>
      <ol class="relative md:grid md:grid-cols-2 md:gap-x-16">
      ${items
        .map((item, index) => {
          const style = kindStyles[item.kind];
          const people = (item.people || []).map(personLinkHtml).filter(Boolean);
          const onLeft = index % 2 === 0;
          const sideClasses = onLeft
            ? "md:col-start-1 md:pl-0 md:pr-0 md:text-right"
            : "md:col-start-2";
          const dotSide = onLeft
            ? "md:left-auto md:right-[calc(-2rem_-_7px)]"
            : "md:left-[calc(-2rem_-_7px)]";
          return `
            <li class="relative pl-6 pb-8 last:pb-0 md:pb-10 ${sideClasses}" style="grid-row: ${index + 1}">
              <span class="absolute left-[1px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-gray-800 ${style.dot} ${dotSide}"></span>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1${onLeft ? " md:flex-row-reverse" : ""}">
                <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${style.chip}">
                  ${item.kind}
                </span>
                ${
                  item.dates
                    ? `<span class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">${escapeHtml(
                        item.dates
                      )}</span>`
                    : ""
                }
              </div>
              <p class="mt-1.5 text-lg font-semibold">${escapeHtml(item.title)}</p>
              <p class="mt-0.5 text-gray-700 dark:text-gray-200">${institutionLinkHtml(
                item.institution
              )}</p>
              ${
                people.length
                  ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(
                      item.peopleLabel
                    )}: ${people.join(", ")}</p>`
                  : ""
              }
              ${
                item.fellowship
                  ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(
                      item.fellowship
                    )}</p>`
                  : ""
              }
            </li>
          `;
        })
        .join("")}
      </ol>
    </div>
  `;
}

function renderTeaching(teaching) {
  return teaching
    .map((course) => {
      const courseTitle = course.title || course.course || "";
      const duration = course.session || course.duration || course.year || "";
      const institution = course.institution || "";
      const courseLink = course.url
        ? `<p class="mt-2">${createLinkHtml({
            url: course.url,
            label: "Course page",
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium",
          })}</p>`
        : "";

      return `
        <article class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4">
          <p class="text-lg font-semibold">${escapeHtml(courseTitle)}</p>
          <p class="mt-1 text-gray-700 dark:text-gray-200">${escapeHtml(
            institution
          )}</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">${escapeHtml(
            String(duration)
          )}</p>
          ${courseLink}
        </article>
      `;
    })
    .join("");
}

function renderStudentStats(students) {
  const counts = getStudentCounts(students);
  const cards = [
    {
      label: "Current students",
      value: String(counts.current),
      detail: `${counts.phdOngoing} Ph.D. · ${counts.mtechOngoing} M.Tech.`,
    },
    {
      label: "Former students",
      value: String(counts.former),
      detail: `${counts.bscHonors} B.Sc. Honors · ${counts.completed} other completed`,
    },
    {
      label: "Total supervised",
      value: String(counts.total),
      detail: "Ph.D., M.Tech., and B.Sc. Honors",
    },
  ];

  return `
    <div class="grid gap-4 sm:grid-cols-3">
      ${cards
        .map(
          (card) => `
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">${escapeHtml(
                card.label
              )}</p>
              <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">${escapeHtml(
                card.value
              )}</p>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(
                card.detail
              )}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderServiceStat(label, value) {
  return `
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-center">
      <p class="text-2xl font-extrabold text-gray-900 dark:text-white">${escapeHtml(
        String(value)
      )}</p>
      <p class="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">${escapeHtml(
        label
      )}</p>
    </div>
  `;
}

function renderServiceItems(items, emptyLabel = "None listed.") {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p class="text-sm text-gray-500 dark:text-gray-400 italic">${escapeHtml(
      emptyLabel
    )}</p>`;
  }

  return `
    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
      ${items
        .map(
          (item) => `
            <li class="py-2.5 first:pt-0 last:pb-0 text-sm leading-6 text-gray-700 dark:text-gray-200">
              ${escapeHtml(item)}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function renderServiceColumn(title, count, items, accentClass) {
  return `
    <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900/40">
      <div class="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 px-4 py-3 ${accentClass}">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">${escapeHtml(
          title
        )}</h3>
        <span class="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/70 px-2 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-200">
          ${count}
        </span>
      </div>
      <div class="px-4 py-3">
        ${renderServiceItems(items)}
      </div>
    </div>
  `;
}

function renderServiceSection(administrative, community) {
  const reviewerJournals = community.reviewer_for?.journals || [];
  const reviewerConferences = community.reviewer_for?.conferences || [];
  const pcMember = community.pc_member_for || [];
  const organizing = community.organizing_committee || [];

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${renderServiceStat("Admin roles", administrative.length)}
        ${renderServiceStat("PC roles", pcMember.length)}
        ${renderServiceStat("Journals", reviewerJournals.length)}
        ${renderServiceStat("Conferences", reviewerConferences.length)}
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        ${renderServiceColumn(
          "Administrative",
          administrative.length,
          administrative,
          "bg-violet-50 dark:bg-violet-950/30"
        )}
        ${renderServiceColumn(
          "Organizing committee",
          organizing.length,
          organizing,
          "bg-emerald-50 dark:bg-emerald-950/30"
        )}
      </div>

      ${renderServiceColumn(
        "Program committee",
        pcMember.length,
        pcMember,
        "bg-blue-50 dark:bg-blue-950/30"
      )}

      <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Reviewer</h3>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            ${reviewerJournals.length} journals · ${reviewerConferences.length} conferences
          </p>
        </div>
        <div class="grid gap-0 md:grid-cols-2 md:divide-x divide-gray-200 dark:divide-gray-700">
          <div class="px-4 py-4">
            <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Journals</h4>
            ${renderServiceItems(reviewerJournals)}
          </div>
          <div class="px-4 py-4 border-t md:border-t-0 border-gray-200 dark:border-gray-700">
            <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Conferences</h4>
            <div class="flex flex-wrap gap-2">
              ${
                reviewerConferences.length
                  ? reviewerConferences
                      .map(
                        (item) => `
                          <span class="inline-flex items-center rounded-md border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-900 dark:text-amber-100">
                            ${escapeHtml(item)}
                          </span>
                        `
                      )
                      .join("")
                  : `<p class="text-sm text-gray-500 dark:text-gray-400 italic">None listed.</p>`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTalks(talks) {
  return talks
    .map((talk) => {
      const organizer = talk.Organizer
        ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Organizer: ${
            talk.Organizer.url
              ? createLinkHtml({
                  url: talk.Organizer.url,
                  label: talk.Organizer.name,
                  className:
                    "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
                })
              : escapeHtml(talk.Organizer.name)
          }</p>`
        : "";

      const links = talk.links
        ? `<p class="mt-2 text-sm">${Object.entries(talk.links)
            .map(([label, url]) =>
              createLinkHtml({
                url,
                label,
                className:
                  "mr-3 text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
              })
            )
            .join("")}</p>`
        : "";

      const tweet = talk.tweet
        ? `<p class="mt-2 text-sm">${createLinkHtml({
            url: talk.tweet,
            label: "Tweet",
            className:
              "text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200",
          })}</p>`
        : "";

      return `
        <article class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4">
          <p class="text-lg font-semibold">${escapeHtml(talk.title || "")}</p>
          ${
            talk.event
              ? `<p class="mt-1 text-gray-700 dark:text-gray-200">${escapeHtml(
                  talk.event
                )}</p>`
              : ""
          }
          ${
            talk.Place
              ? `<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">${escapeHtml(
                  talk.Place
                )}</p>`
              : ""
          }
          ${
            talk.date
              ? `<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">${escapeHtml(
                  talk.date
                )}</p>`
              : ""
          }
          ${organizer}
          ${links}
          ${tweet}
        </article>
      `;
    })
    .join("");
}
