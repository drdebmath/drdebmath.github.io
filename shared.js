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

    if (departmentHtml && institutionHtml) {
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
