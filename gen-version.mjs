// Cache-busting versions and the "Last updated" stamp. Run via `npm run build`.
//
//   node gen-version.mjs assets   (before prerender)
//     Stamps every local script, stylesheet and data.json reference with a hash of
//     that file's contents (script.js?v=3f9a2c1b0d). A changed file gets a new URL,
//     so browsers never pair a fresh page with a stale script. Unchanged files keep
//     their URL and stay cached.
//
//   node gen-version.mjs stamp    (after prerender)
//     Hashes the built site. If it differs from build-info.json, the site changed:
//     record the current time and write it into each page's
//     <meta name="last-updated"> and baked footer date. Rebuilding without changes
//     leaves everything untouched.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { lastUpdatedTimeHtml } from "./shared.js";

const PAGE_SCRIPTS = ["script.js", "cv.js", "for_students.js", "timeline.js"];
const HTML_FILES = [
  ...readdirSync(".").filter((f) => f.endsWith(".html")),
  ...readdirSync("visualizations")
    .filter((f) => f.endsWith(".html"))
    .map((f) => `visualizations/${f}`),
];
const ROOT_PAGES = HTML_FILES.filter((f) => !f.includes("/"));
const INFO_FILE = "build-info.json";

const hash = (content) => createHash("sha256").update(content).digest("hex").slice(0, 10);
const read = (f) => readFileSync(f, "utf8");
const update = (file, fn) => {
  const before = read(file);
  const after = fn(before);
  if (after !== before) writeFileSync(file, after);
};

const META_RE = /<meta name="last-updated" content="[^"]*">/;
const TIME_RE = /<time data-last-updated=""[^>]*>[^<]*<\/time>/g;

const phase = process.argv[2];
if (phase === "assets") stampAssets();
else if (phase === "stamp") stampLastUpdated();
else throw new Error("usage: node gen-version.mjs assets|stamp");

function stampAssets() {
  const shared = hash(read("shared.js"));
  const data = hash(read("data.json"));
  const versions = { "assets/site.css": hash(read("assets/site.css")) };

  for (const file of PAGE_SCRIPTS) {
    update(file, (s) =>
      s
        .replace(/(["'])\.\/shared\.js(\?v=[0-9a-f]+)?\1/g, `$1./shared.js?v=${shared}$1`)
        .replace(/(["'])data\.json(\?v=[0-9a-f]+)?\1/g, `$1data.json?v=${data}$1`)
    );
    versions[file] = hash(read(file)); // after its own imports are stamped
  }

  // Pages need the meta tag before prerender so the footer bakes the date.
  const info = existsSync(INFO_FILE) ? JSON.parse(read(INFO_FILE)) : {};
  const updated = info.updated || new Date().toISOString().replace(/\.\d+Z$/, "Z");

  for (const file of HTML_FILES) {
    update(file, (s) => {
      s = s.replace(
        /(href=")((?:\.\.\/)?assets\/site\.css)(\?v=[0-9a-f]+)?"/g,
        (_, a, url) => `${a}${url}?v=${versions["assets/site.css"]}"`
      );
      s = s.replace(
        /(src=")(script\.js|cv\.js|for_students\.js|timeline\.js)(\?v=[0-9a-f]+)?"/g,
        (_, a, url) => `${a}${url}?v=${versions[url]}"`
      );
      if (ROOT_PAGES.includes(file) && !META_RE.test(s)) {
        s = s.replace(
          /(\n?)([ \t]*)<\/head>/,
          `$1$2    <meta name="last-updated" content="${updated}">\n$2</head>`
        );
      }
      return s;
    });
  }
  console.log(
    `gen-version: ${Object.entries(versions)
      .map(([f, v]) => `${f}?v=${v}`)
      .join(", ")}`
  );
}

function stampLastUpdated() {
  // Everything a visitor receives, with the stamp itself blanked out.
  const files = [...HTML_FILES, ...PAGE_SCRIPTS, "shared.js", "data.json", "assets/site.css", "llms.txt"];
  const siteHash = hash(
    files
      .map((f) => `${f}\n${read(f).replace(META_RE, "").replace(TIME_RE, "")}`)
      .join("\n")
  );

  const info = existsSync(INFO_FILE) ? JSON.parse(read(INFO_FILE)) : {};
  if (info.hash === siteHash && info.updated) {
    console.log(`gen-version: no changes since ${info.updated}`);
    return;
  }

  // First run keeps the time the pages were just built with; later runs mean
  // the content changed, so the update happened now.
  const updated = info.hash
    ? new Date().toISOString().replace(/\.\d+Z$/, "Z")
    : read("index.html").match(/<meta name="last-updated" content="([^"]*)">/)?.[1] ||
      new Date().toISOString().replace(/\.\d+Z$/, "Z");

  for (const file of ROOT_PAGES) {
    update(file, (s) =>
      s
        .replace(META_RE, `<meta name="last-updated" content="${updated}">`)
        .replace(TIME_RE, lastUpdatedTimeHtml(updated, { relative: false }))
    );
  }
  writeFileSync(INFO_FILE, JSON.stringify({ updated, hash: siteHash }, null, 2) + "\n");
  console.log(`gen-version: site changed, last updated ${updated}`);
}
