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

["index.html", "for_students.html", "cv.html", "script.js", "shared.js", "for_students.js", "cv.js"].forEach(
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
