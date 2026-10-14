// Pre-renders every page so the HTML on disk already holds its content.
// Visitors without JavaScript (curl, crawlers, link previews, AI tools) get the
// full page; visitors with JavaScript get the same markup, which the page's own
// scripts then redraw and wire up exactly as before.
//
// How: each page's own module script runs inside jsdom (a simulated browser),
// with fetch() served from local files, and the resulting DOM is written back.
// Pages are re-rendered from their own output on every build, so all renderers
// must replace their container's content rather than append to it.
// Run via `npm run build`; never hand-edit content inside JS-filled containers.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = "https://drdebmath.github.io/";
const PAGES = [
  "index.html",
  "publications.html",
  "teaching.html",
  "talks.html",
  "simulators.html",
  "timeline.html",
  "for_students.html",
  "cv.html",
];

const page = process.argv[2];
if (!page) {
  // Parent: one child process per page, so each gets fresh module state.
  for (const p of PAGES) {
    execFileSync(process.execPath, [fileURLToPath(import.meta.url), p], {
      stdio: "inherit",
    });
  }
} else {
  await renderPage(page);
  process.exit(0); // pages may leave timers or listeners running
}

async function renderPage(file) {
  const { JSDOM } = await import("jsdom");
  const source = readFileSync(path.join(ROOT, file), "utf8");
  const dom = new JSDOM(source, { url: SITE + file, pretendToBeVisual: true });
  const { window } = dom;

  // Browser APIs jsdom lacks. matches:false = the phone layout, which keeps
  // sections in reading order (desktop moves News/Blog into a sidebar at runtime).
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
  window.scrollTo = () => {};
  window.Element.prototype.scrollIntoView = () => {};
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver ??= NoopObserver;
  window.ResizeObserver ??= NoopObserver;

  // Local files come from disk; anything external (e.g. the blog feed) fails,
  // so those sections bake their fallback and load live in the browser.
  let pending = 0;
  const fetchLocal = async (input) => {
    const url = new URL(String(input?.url ?? input), window.location.href);
    if (url.origin + "/" !== SITE) throw new TypeError(`offline: ${url.href}`);
    const filePath = path.join(ROOT, decodeURIComponent(url.pathname));
    // Other projects on this domain (blog, simulators) are not in this repo.
    if (!existsSync(filePath)) throw new TypeError(`offline: ${url.href}`);
    return new Response(readFileSync(filePath), { status: 200 });
  };
  window.fetch = async (input) => {
    pending++;
    try {
      return await fetchLocal(input);
    } finally {
      pending--;
    }
  };
  // Auto-advancing widgets (the news ticker) stay on their first item.
  window.setInterval = () => 0;

  // Expose the window's globals to the page's modules.
  for (const key of Object.getOwnPropertyNames(window)) {
    if (key in globalThis && !["navigator", "location", "fetch", "setInterval"].includes(key)) continue;
    try {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        get: () => window[key],
      });
    } catch {}
  }

  const errors = [];
  process.on("unhandledRejection", (e) => errors.push(e));
  console.error = (...args) => errors.push(args.join(" "));
  console.warn = () => {}; // expected: external feeds are offline at build time

  // Tells renderers they are being baked (e.g. the footer prints a plain date).
  window.__PRERENDER__ = true;

  const scripts = [...window.document.querySelectorAll('script[type="module"][src]')];
  for (const script of scripts) {
    const src = new URL(script.getAttribute("src"), SITE + file);
    await import(pathToFileURL(path.join(ROOT, src.pathname)).href);
  }
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  window.dispatchEvent(new window.Event("load"));

  // Wait for fetches to settle and the DOM to stop changing.
  let last = "";
  let stable = 0;
  for (let i = 0; i < 200 && stable < 5; i++) {
    await new Promise((r) => setTimeout(r, 20));
    const now = window.document.documentElement.outerHTML;
    stable = pending === 0 && now === last ? stable + 1 : 0;
    last = now;
  }

  // Theme is the viewer's choice, applied at runtime; never bake it.
  window.document.documentElement.classList.remove("dark");
  if (window.document.documentElement.getAttribute("class") === "") {
    window.document.documentElement.removeAttribute("class");
  }

  // The parser moves whitespace after </body> inside it; normalise so the
  // output is identical from one build to the next.
  const body = window.document.body;
  while (body.lastChild?.nodeType === 3 && !body.lastChild.textContent.trim()) {
    body.lastChild.remove();
  }
  body.append("\n");

  writeFileSync(path.join(ROOT, file), dom.serialize().trimEnd() + "\n");
  const note = errors.length ? ` (${errors.length} script error(s): ${String(errors[0]).slice(0, 160)})` : "";
  console.log(`prerender: ${file}${note}`);
}
