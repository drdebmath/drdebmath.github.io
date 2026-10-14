// Generates llms.txt (https://llmstxt.org): a plain-Markdown summary of the site
// from data.json, for AI tools and anyone reading the site as text.
// Run via `npm run build`; regenerated on every build, never hand-edited.
import { readFileSync, writeFileSync } from "node:fs";
import { getPublicationDeepLink } from "./shared.js";

const SITE = "https://drdebmath.github.io/";
const data = JSON.parse(readFileSync("data.json", "utf8"));
const a = data.about_me || {};

const clean = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const link = (label, url) => (url ? `[${clean(label)}](${new URL(url, SITE).href})` : clean(label));
const section = (title, lines) =>
  lines.filter(Boolean).length ? [`## ${title}`, "", ...lines.filter(Boolean), ""] : [];

const venueOf = (p) =>
  [p.journal?.full || p.conference?.full || p.booktitle, p.journal?.short || p.conference?.short]
    .filter(Boolean)
    .filter((v, i, all) => all.indexOf(v) === i)
    .join(", ");

const publications = [...(data.publications || [])].sort(
  (x, y) => Number(y.year || 0) - Number(x.year || 0)
);

const lines = [
  `# ${a.name}`,
  "",
  `> ${clean(a.position)}, ${clean(a.department?.name)}, ${clean(a.current_institution?.name)}. ` +
    "Research on distributed algorithms for mobile agents and mobile robots.",
  "",
  ...(a.biodata?.short_bio || []).map(clean),
  "",
  clean(data.current_research),
  "",
  ...section("Contact and profiles", [
    a.email && `- Email: ${a.email}`,
    a.department?.office && `- Office: ${clean(a.department.office)}`,
    ...[
      ["Google Scholar", a.google_scholar],
      ["DBLP", a.dblp],
      ["ORCID", a.orcid],
      ["GitHub", a.github],
      ["LinkedIn", a.linkedin],
      ["X", a.x],
    ].map(([label, url]) => url && `- ${link(label, url)}`),
  ]),
  ...section("Pages", [
    `- ${link("Home", "index.html")}: bio, news, research themes, recent talks`,
    `- ${link("Publications", "publications.html")}: full publication list with abstracts`,
    `- ${link("Talks", "talks.html")}`,
    `- ${link("Teaching", "teaching.html")}`,
    `- ${link("Timeline", "timeline.html")}: everything by month`,
    `- ${link("For Students", "for_students.html")}: supervised students and resources`,
    `- ${link("Simulators", "simulators.html")}`,
    a.cv?.url && `- ${link("CV", a.cv.url)}`,
  ]),
  ...section("Projects", [
    a.mobility_matters?.url &&
      `- ${link(a.mobility_matters.label || "Mobility Matters", a.mobility_matters.url)}: ` +
        clean(a.mobility_matters.title) +
        (a.mobility_matters.pdf ? ` (${link("PDF", a.mobility_matters.pdf)})` : ""),
    a.blog?.url && `- ${link(a.blog.title || "Blog", a.blog.url)}: blog`,
    ...(data.visualizations?.simulators || []).map(
      (s) => `- ${link(s.name, s.url)}: ${clean(s.description)}`
    ),
  ]),
  ...section(
    "Research themes",
    (data.research_themes || []).map((t) => `- ${clean(t.title)}: ${clean(t.description)}`)
  ),
  ...section(
    "Publications",
    publications.map((p) => {
      const extras = [
        p.doi && link("DOI", p.doi),
        p.arxiv && link("arXiv", p.arxiv),
        p.status && clean(p.status),
      ].filter(Boolean);
      return (
        `- ${(p.authors || []).join(", ")}. ${link(clean(p.title).replace(/\.$/, ""), getPublicationDeepLink(p))}. ` +
        `${[venueOf(p), p.year].filter(Boolean).join(", ")}.` +
        (extras.length ? ` ${extras.join(" · ")}` : "")
      );
    })
  ),
  ...section(
    "Talks",
    (data.talks || []).map((t) => {
      const url = Object.values(t.links || {})[0];
      return `- ${link(t.title, url)}. ${[t.event, t.Place, t.date].filter(Boolean).map(clean).join(", ")}`;
    })
  ),
  ...section(
    "Teaching",
    [...(data.current_teaching || []), ...(data.teaching || [])]
      .filter((c, i, all) => all.findIndex((o) => o.course === c.course && o.duration === c.duration) === i)
      .map((c) => `- ${link(c.course, c.url)}. ${[c.institution, c.duration].filter(Boolean).join(", ")}`)
  ),
  ...section("Awards", (data.awards || []).map((x) => `- ${clean(x)}`)),
  ...section(
    "Grants",
    (data.grants || []).map(
      (g) =>
        `- ${[g.title, g.funding_agency].filter(Boolean).map(clean).join(", ")}` +
        (g.year ? ` (${g.year})` : "") +
        (g.project_title ? `: ${clean(g.project_title)}` : "")
    )
  ),
];

writeFileSync("llms.txt", lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
console.log(`gen-llms: ${publications.length} publications, ${lines.length} lines.`);
