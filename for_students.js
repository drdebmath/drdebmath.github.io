import {
  escapeHtml,
  renderProfileHeader,
  setupDarkMode,
  setupGoToTopButton,
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
  renderProfileHeader(data.about_me, {
    department: data.about_me?.department,
    linkItemClass:
      "p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors",
    iconImageClass: "h-6 w-6 rounded-full",
    positionLinkClass:
      "hover:underline decoration-blue-100 decoration-2 underline-offset-2 text-blue-100 hover:text-white transition-colors",
  });

  setupNavbar();
  displayResearchInterests(data.research || []);
  initializeMap(collaboratorData);
}

function setupNavbar() {
  const navbar = document.getElementById("navbar");

  if (!navbar) return;

  const links = [
    { href: "index.html", label: "Home" },
    { href: "#research", label: "Research" },
    { href: "#research-topics", label: "Topics" },
    { href: "#collaborator-map", label: "Map" },
    { href: "#simulators", label: "Simulators" },
  ];

  navbar.className = "flex flex-wrap gap-2";
  navbar.innerHTML = links
    .map(
      (link) => `
        <li>
          <a href="${link.href}" class="block px-3 py-1 rounded text-white hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors">${link.label}</a>
        </li>
      `
    )
    .join("");
}

function displayResearchInterests(interests) {
  const container = document.getElementById("research_interests_content");

  if (!container) return;

  container.innerHTML = interests
    .map(
      (interest) => `
        <span class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow">
          ${escapeHtml(interest)}
        </span>
      `
    )
    .join("");
}

function initializeMap(collaborators) {
  const iitIndore = { name: "IIT Indore", coords: [22.7196, 75.8573] };
  const map = L.map("map").setView([30, 20], 2);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  const indoreIcon = L.divIcon({
    html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff6600" class="w-8 h-8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>',
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  L.marker(iitIndore.coords, { icon: indoreIcon })
    .addTo(map)
    .bindPopup("<b>Debasish Pattanayak</b><br>IIT Indore")
    .openPopup();

  const markers = L.markerClusterGroup();

  collaborators.forEach((collaborator) => {
    const color = collaborator.type === "indian" ? "#003366" : "#990000";
    const collaboratorIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-6 h-6"><circle cx="12" cy="12" r="10"/></svg>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker(collaborator.coords, { icon: collaboratorIcon })
      .bindPopup(`<b>${collaborator.name}</b><br>${collaborator.uni}`);

    markers.addLayer(marker);

    L.polyline([iitIndore.coords, collaborator.coords], {
      color: "gray",
      weight: 1.5,
      opacity: 0.6,
      dashArray: collaborator.type === "indian" ? "" : "5, 5",
    }).addTo(map);
  });

  map.addLayer(markers);
}
