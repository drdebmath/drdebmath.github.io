import {
  escapeHtml,
  renderSiteFooter,
  renderStudentsSectionHtml,
  setupDarkMode,
  setupGoToTopButton,
  setupPrimaryNav,
  setupSiteSearch,
} from "./shared.js";

const collaboratorData = [
  { name: "John Augustine", uni: "IIT Madras", coords: [12.9915, 80.2337], type: "indian" },
  { name: "Subhash Bhagat", uni: "IIT Jodhpur", coords: [26.4718, 73.1139], type: "indian" },
  { name: "Sruti Gan Chaudhuri", uni: "Jadavpur University", coords: [22.4991, 88.3715], type: "indian" },
  { name: "H. Ramesh", uni: "IIT Guwahati", coords: [26.1844, 91.5629], type: "indian" },
  { name: "P. S. Mandal", uni: "IIT Guwahati", coords: [26.1844, 91.5629], type: "indian" },
  { name: "Anisur Rahaman Molla", uni: "ISI Kolkata", coords: [22.5999, 88.3995], type: "indian" },
  { name: "Kaushik Mondal", uni: "IIT Ropar", coords: [30.9681, 76.4716], type: "indian" },
  { name: "Caterina Feletti", uni: "University of Milan, Italy", coords: [45.4792, 9.1859], type: "international" },
  { name: "Paola Flocchini", uni: "University of Ottawa, Canada", coords: [45.4215, -75.6823], type: "international" },
  { name: "Nicola Santoro", uni: "Carleton University, Canada", coords: [45.3876, -75.6960], type: "international" },
  { name: "Klaus-Tycho Förster", uni: "TU Dortmund, Germany", coords: [51.4935, 7.4128], type: "international" },
  { name: "Stefan Schmid", uni: "TU Berlin, Germany", coords: [52.5121, 13.3272], type: "international" },
  { name: "Loukas Georgiadis", uni: "University of Ioannina, Greece", coords: [39.6167, 20.8431], type: "international" },
  { name: "Giuseppe F. Italiano", uni: "Luiss University, Rome, Italy", coords: [41.9097, 12.4923], type: "international" },
  { name: "Giuseppe Antonio Di Luna", uni: "Sapienza University of Rome, Italy", coords: [41.9038, 12.5152], type: "international" },
  { name: "Francesco Piselli", uni: "University of Perugia, Italy", coords: [43.1122, 12.3888], type: "international" },
  { name: "Ajay D. Kshemkalyani", uni: "UIC, USA", coords: [41.8722, -87.6481], type: "international" },
  { name: "Gokarna Sharma", uni: "Kent State University, USA", coords: [41.1492, -81.3439], type: "international" },
  { name: "Evangelos Kosinas", uni: "University of Ioannina, Greece", coords: [39.6167, 20.8431], type: "international" },
  { name: "Andrzej Pelc", uni: "UQO, Canada", coords: [45.4339, -75.7335], type: "international" },
  { name: "Masafumi Yamashita", uni: "Kyushu University, Japan", coords: [33.6217, 130.4283], type: "international" },
  { name: "Yukiko Yamauchi", uni: "Kyushu University, Japan", coords: [33.6217, 130.4283], type: "international" },
  { name: "Alfredo Navarra", uni: "University of Perugia, Italy", coords: [43.1122, 12.3888], type: "international" },
  { name: "Giuseppe Prencipe", uni: "University of Pisa, Italy", coords: [43.7228, 10.4017], type: "international" },
];

document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  setupGoToTopButton();

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      initializePage(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      initializeMap(collaboratorData);
    });
});

function initializePage(data) {
  setupPrimaryNav(data);
  renderSiteFooter(data);
  setupSiteSearch(data);
  displayResearchInterests(data.research || []);
  displayStudents(data.students || {});
  displayBooks(data.recommended_books || []);
  initializeMap(collaboratorData);
}

function displayResearchInterests(interests) {
  const container = document.getElementById("research_interests_content");

  if (!container) return;

  container.innerHTML = interests
    .map(
      (interest) => `
        <span class="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-1.5 text-sm font-semibold surface-chip">
          ${escapeHtml(interest)}
        </span>
      `
    )
    .join("");
}

function displayBooks(books) {
  const container = document.getElementById("books_grid");
  if (!container) return;
  container.innerHTML = books
    .map(
      (book) => `
        <div class="rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-bold text-lg mb-1 text-gray-800 dark:text-white">${escapeHtml(book.title)}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">${escapeHtml(book.authors)} · ${escapeHtml(book.publisher)}</p>
          <p class="text-gray-600 dark:text-gray-300">${escapeHtml(book.description)}</p>
          <a href="${escapeHtml(book.link)}" class="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener">${escapeHtml(book.link_label)} →</a>
        </div>
      `
    )
    .join("");
}

function displayStudents(students) {
  const container = document.getElementById("students_content");
  if (!container) return;
  container.innerHTML = renderStudentsSectionHtml(students);
}

const WORLD_LAND_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";
const IIT_INDORE = { uni: "IIT Indore", coords: [22.7196, 75.8573] };

// Groups collaborators sharing an institution into one pin.
function groupCollaboratorsByInstitution(collaborators) {
  const byUni = new Map();
  collaborators.forEach((collaborator) => {
    const group = byUni.get(collaborator.uni) || { ...collaborator, names: [] };
    group.names.push(collaborator.name);
    byUni.set(collaborator.uni, group);
  });
  return [...byUni.values()];
}

function renderCollaboratorList(institutions) {
  const container = document.getElementById("collaborator_list");
  if (!container) return;
  const ordered = [...institutions].sort(
    (a, b) => (a.type === "indian" ? 0 : 1) - (b.type === "indian" ? 0 : 1) || a.uni.localeCompare(b.uni)
  );
  container.innerHTML = ordered
    .map(
      (group) => `
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 px-3.5 py-2.5">
          <p class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <span class="h-2 w-2 shrink-0 rounded-full ${
              group.type === "indian" ? "bg-blue-700 dark:bg-blue-400" : "bg-red-700 dark:bg-red-400"
            }"></span>
            ${escapeHtml(group.uni)}
          </p>
          <p class="mt-0.5 pl-4 text-xs leading-5 text-gray-600 dark:text-gray-300">${group.names
            .map(escapeHtml)
            .join(", ")}</p>
        </div>
      `
    )
    .join("");
}

// A fixed (no pan/zoom, no tiles) world map: land outline, one pin per
// institution and a great-circle line to IIT Indore.
async function initializeMap(collaborators) {
  const container = document.getElementById("map");
  if (!container) return;

  const institutions = groupCollaboratorsByInstitution(collaborators);
  renderCollaboratorList(institutions);

  if (!window.d3 || !window.topojson) return;

  let land;
  try {
    const world = await (await fetch(WORLD_LAND_URL)).json();
    land = topojson.feature(world, world.objects.land);
  } catch (error) {
    console.warn("World map unavailable:", error);
    return;
  }

  const width = 960;
  const height = 440;
  const toLonLat = ([lat, lon]) => [lon, lat];
  // Frame the map on where the collaborators are, not on Antarctica.
  const frame = {
    type: "MultiPoint",
    coordinates: [[-130, 60], [150, 60], [-130, -15], [150, -15]],
  };
  const projection = d3.geoNaturalEarth1().fitExtent([[10, 10], [width - 10, height - 10]], frame);
  const path = d3.geoPath(projection);
  const home = toLonLat(IIT_INDORE.coords);

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "World map of collaborator institutions linked to IIT Indore")
    .attr("class", "block w-full h-auto");

  svg
    .append("path")
    .datum(land)
    .attr("d", path)
    .attr("class", "fill-gray-200 dark:fill-gray-700 stroke-white dark:stroke-gray-800")
    .attr("stroke-width", 0.5);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(institutions)
    .join("path")
    .attr("d", (group) =>
      path({ type: "LineString", coordinates: [home, toLonLat(group.coords)] })
    )
    .attr("class", (group) =>
      group.type === "indian"
        ? "stroke-blue-700/50 dark:stroke-blue-400/60"
        : "stroke-red-700/40 dark:stroke-red-400/50"
    )
    .attr("stroke-width", 1.2)
    .attr("stroke-dasharray", (group) => (group.type === "indian" ? null : "4 3"));

  const pins = svg
    .append("g")
    .selectAll("circle")
    .data(institutions)
    .join("circle")
    .attr("transform", (group) => `translate(${projection(toLonLat(group.coords))})`)
    .attr("r", (group) => 3.5 + Math.min(group.names.length, 3))
    .attr("class", (group) =>
      group.type === "indian"
        ? "fill-blue-700 dark:fill-blue-400 stroke-white dark:stroke-gray-900"
        : "fill-red-700 dark:fill-red-400 stroke-white dark:stroke-gray-900"
    )
    .attr("stroke-width", 1.2);
  pins.append("title").text((group) => `${group.uni}: ${group.names.join(", ")}`);

  svg
    .append("circle")
    .attr("transform", `translate(${projection(home)})`)
    .attr("r", 7)
    .attr("class", "fill-orange-500 stroke-white dark:stroke-gray-900")
    .attr("stroke-width", 2)
    .append("title")
    .text("Debasish Pattanayak, IIT Indore");

  container.replaceChildren(svg.node());
}
