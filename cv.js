import {
  createLinkHtml,
  escapeHtml,
  formatDateRange,
  linkifyBiographyHtml,
  renderAwardsList,
  renderGrantsList,
  renderProfileHeader,
  setupDarkMode,
} from "./shared.js";

document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();

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
    linkItemClass: "p-3",
  });

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
    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Profile</h2>
      <div class="prose prose-slate max-w-none dark:prose-invert">
        <p>${renderCvBiography(data.about_me?.biodata)}</p>
      </div>
      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        ${snapshotCards
          .map(
            (card) => `
              <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">${escapeHtml(
                  card.label
                )}</p>
                <p class="mt-2 text-lg font-semibold">${escapeHtml(card.value)}</p>
              </div>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Education</h2>
      <div class="space-y-4">${renderEducation(data.about_me?.education || [])}</div>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Positions</h2>
      <div class="space-y-4">${renderPositions(data.about_me?.positions || [])}</div>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Teaching</h2>
      <div class="space-y-4">${renderTeaching(
        [...(data.current_teaching || []), ...(data.teaching || [])]
      )}</div>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Administrative Responsibilities</h2>
      <ul class="space-y-3 list-disc pl-5">
        ${renderAdministrativeResponsibilities(
          data.administrative_responsibilities || []
        )}
      </ul>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Awards</h2>
      ${renderAwardsList(data.awards || [], {
        itemClass: "h-full",
      })}
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Grants</h2>
      ${renderGrantsList(data.grants || [], {
        itemClass: "h-full",
      })}
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4">Talks</h2>
      <div class="space-y-4">${renderTalks(data.talks || [])}</div>
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

function renderEducation(education) {
  return education
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
          ? `<p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Supervisors: ${entry.supervisors
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
        <article class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
          <p class="text-lg font-semibold">${escapeHtml(entry.degree || "")}</p>
          <p class="mt-1 text-slate-700 dark:text-slate-200">${institution}</p>
          ${supervisors}
        </article>
      `;
    })
    .join("");
}

function renderPositions(positions) {
  return [...positions]
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
        ? `<p class="mt-2 text-sm text-slate-600 dark:text-slate-300">With ${
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
        ? `<p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${escapeHtml(
            entry.fellowship
          )}</p>`
        : "";

      return `
        <article class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-lg font-semibold">${escapeHtml(
                entry.title || entry.tile || ""
              )}</p>
              <p class="text-slate-700 dark:text-slate-200">${institution}</p>
            </div>
            <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">${escapeHtml(
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
        <article class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
          <p class="text-lg font-semibold">${escapeHtml(courseTitle)}</p>
          <p class="mt-1 text-slate-700 dark:text-slate-200">${escapeHtml(
            institution
          )}</p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(
            String(duration)
          )}</p>
          ${courseLink}
        </article>
      `;
    })
    .join("");
}

function renderAdministrativeResponsibilities(responsibilities) {
  return responsibilities
    .map(
      (responsibility) => `
        <li class="text-slate-700 dark:text-slate-200">${escapeHtml(
          responsibility
        )}</li>
      `
    )
    .join("");
}

function renderTalks(talks) {
  return talks
    .map((talk) => {
      const organizer = talk.Organizer
        ? `<p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Organizer: ${
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
        <article class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
          <p class="text-lg font-semibold">${escapeHtml(talk.title || "")}</p>
          ${
            talk.event
              ? `<p class="mt-1 text-slate-700 dark:text-slate-200">${escapeHtml(
                  talk.event
                )}</p>`
              : ""
          }
          ${
            talk.Place
              ? `<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(
                  talk.Place
                )}</p>`
              : ""
          }
          ${
            talk.date
              ? `<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(
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
