import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const errors = [];
const warnings = [];

function isExternalUrl(url) {
  return /^(https?:)?\/\//i.test(String(url ?? ""));
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function warn(condition, message) {
  if (!condition) {
    warnings.push(message);
  }
}

function ensureRelativePathExists(url, label) {
  if (!url || isExternalUrl(url) || url.startsWith("#")) {
    return;
  }

  const resolved = path.join(rootDir, url);
  assert(fs.existsSync(resolved), `${label}: missing local target "${url}"`);
}

assert(Array.isArray(data.news), "news must be an array");
assert(Array.isArray(data.publications), "publications must be an array");
assert(Array.isArray(data.talks), "talks must be an array");
assert(Array.isArray(data.teaching), "teaching must be an array");
assert(Array.isArray(data.about_me?.education), "about_me.education must be an array");
assert(Array.isArray(data.about_me?.positions), "about_me.positions must be an array");
assert(Array.isArray(data.research_themes), "research_themes must be an array");
assert(data.students && typeof data.students === "object", "students must be an object");
assert(Array.isArray(data.students?.phd_ongoing), "students.phd_ongoing must be an array");
assert(Array.isArray(data.students?.mtech_ongoing), "students.mtech_ongoing must be an array");
assert(Array.isArray(data.students?.bsc_honors), "students.bsc_honors must be an array");
warn(Boolean(data.about_me?.email || data.about_me?.contact?.email), "about_me is missing email/contact.email");

const publicationTitles = new Set((data.publications || []).map((p) => p.title));
(data.research_themes || []).forEach((theme, themeIndex) => {
  (theme.selected_papers || []).forEach((title, paperIndex) => {
    assert(
      publicationTitles.has(title),
      `research_themes[${themeIndex}].selected_papers[${paperIndex}] title not found in publications: "${title}"`
    );
  });
});

data.about_me.positions.forEach((position, index) => {
  assert(
    Boolean(position.title || position.tile),
    `about_me.positions[${index}] is missing a title`
  );
});

data.news.forEach((item, index) => {
  warn(
    Boolean(item.url || item.urls || item.slides),
    `news[${index}] has no link field`
  );
});

data.talks.forEach((talk, index) => {
  warn(
    Boolean(talk.event || talk.Place),
    `talks[${index}] has neither event nor place`
  );
});

ensureRelativePathExists(data.about_me?.cv?.url, "about_me.cv.url");

(data.visualizations?.simulators || []).forEach((item, index) => {
  ensureRelativePathExists(item.url, `visualizations.simulators[${index}].url`);
  ensureRelativePathExists(
    item.source_url,
    `visualizations.simulators[${index}].source_url`
  );
});

[
  "index.html",
  "for_students.html",
  "cv.html",
  "publications.html",
  "teaching.html",
  "talks.html",
  "timeline.html",
  "visualizations/index.html",
  "assets/site.css",
  "script.js",
  "shared.js",
  "for_students.js",
  "cv.js",
].forEach(
  (file) => {
    assert(fs.existsSync(path.join(rootDir, file)), `missing required file "${file}"`);
  }
);

if (errors.length > 0) {
  console.error("Validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  if (warnings.length > 0) {
    console.error("\nWarnings:");
    warnings.forEach((warning) => console.error(`- ${warning}`));
  }
  process.exit(1);
}

console.log("Validation passed.");

if (warnings.length > 0) {
  console.log("\nWarnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
