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
    linkItemClass = "p-4",
    iconImageClass = "h-8 opacity-80 hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 rounded-full overflow-hidden",
    pictureClass = "rounded-full object-cover mx-auto shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200 w-full h-full",
    positionLinkClass = "hover:underline decoration-blue-300 decoration-2 underline-offset-2",
    stackedPosition = false,
    officeTextClass = "text-md mt-1 font-medium opacity-90 lg:hidden",
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
          ? `<span class="block">${escapeHtml(aboutMe.position)}</span>`
          : "",
        departmentHtml
          ? `<span class="mt-1 block">${departmentHtml}</span>`
          : "",
        institutionHtml
          ? `<span class="mt-1 block">${institutionHtml}</span>`
          : "",
      ].filter(Boolean);

      positionElement.innerHTML = positionLines.join("");
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
    pictureElement.innerHTML = `
      <img src="${escapeAttribute(pictureUrl)}" alt="Profile picture" class="${pictureClass}" />
    `;
  }

  if (linksElement) {
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

    linksElement.innerHTML = linkIcons
      .filter((icon) => icon.href)
      .map(
        (icon) => `
          <a href="${escapeAttribute(icon.href)}"${getLinkAttributes(
            icon.href
          )} title="${escapeAttribute(icon.title)}" class="${linkItemClass}">
            <img src="${escapeAttribute(icon.src)}" alt="${escapeAttribute(
              icon.alt
            )}" class="${iconImageClass}" style="object-fit: cover;">
          </a>
        `
      )
      .join("");
  }
}
