# drdebmath.github.io — Design Language & Conventions

Static academic homepage (GitHub Pages). No framework: plain HTML pages + ES modules + Tailwind
(compiled to `assets/site.css` via `npm run build`). All content lives in `data.json`; JS renders it.
**Never hardcode in HTML what `data.json` already holds.**

## Build & validate

```sh
npm run build      # tailwind → assets/site.css, then gen-seo.mjs (JSON-LD + sitemap)
node validate-site.mjs
```

Run both after any change to HTML/JS/`data.json`. `assets/site.css` is generated — never edit by hand.

## Page anatomy (every page, in order)

1. Skip link → first content section.
2. `<nav class="sticky top-0 z-40 bg-blue-600/95 dark:bg-blue-800/90 backdrop-blur shadow-lg">`
   with inner `<div class="page-shell flex items-center justify-between gap-3 py-2.5">`.
   The `<ul id="navbar">` is filled by JS via `setupPrimaryNav(data)` from `shared.js`
   — same six links everywhere (Home · Publications · Teaching · Talks · For Students · CV),
   active page gets `bg-blue-700 dark:bg-blue-900` + `aria-current="page"`. Never hand-build a nav.
3. Header band `bg-blue-700 dark:bg-blue-900 text-white py-8 shadow`, inner `page-shell`.
   - **Profile pages** (index, cv): photo + name + position. Photo frame:
     `w-32 h-48 md:w-40 md:h-60 rounded-3xl overflow-hidden ring-2 ring-white/30 shadow-2xl`
     (squared-circular portrait, never a circle).
   - **Subpages**: eyebrow `text-sm uppercase tracking-[0.25em] text-blue-200` ("Academic Portfolio"),
     `<h1 class="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">`, one-sentence
     description `mt-3 max-w-2xl text-blue-100`.
4. `<main class="page-shell py-10 md:py-12">`, sections spaced `space-y-10 md:space-y-12`.
5. `<footer id="site_footer" class="mt-12 bg-blue-800 dark:bg-blue-950 text-white">` — rendered by
   `renderSiteFooter(data)`.
6. Go-to-top button (`#goToTop`, blue-600 round FAB) + dark-mode toggle in nav (`#darkModeToggle`).

`<body>` always: `data-page="<home|publications|teaching|talks|for-students|cv>"` and
`bg-gray-100 text-gray-900 dark:bg-dark-bg dark:text-dark-text transition-colors duration-200 font-sans`.

## Layout tokens (defined in `src/tailwind.css`)

| Class | Use |
|---|---|
| `.page-shell` | The only page-width wrapper (`max-w-screen-xl` + gutters). No other `mx-auto max-w-*` shells. |
| `.surface-panel` | Every content section: white/gray-800 rounded-2xl card with border + soft shadow. |
| `.panel-header` | Section header strip: `h2.section-heading` + optional `p.mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300`. Header-right action links: `text-sm text-blue-700 dark:text-blue-300 hover:underline`. |
| `.panel-body` | Section content padding. |
| `.section-heading` | All section `h2`s. Never restyle headings ad hoc. |
| `.surface-card-hover` | Interactive cards (hover lift). Inner cards inside a panel instead use `rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40`. |
| `.surface-chip` | Small chips/badges (always `rounded-full`). |

## Color roles

- **Blue** is the brand: chrome (nav/header/footer bands), links (`text-blue-600 dark:text-blue-400 hover:underline`), primary actions, active states. Base canvas gray-100 / dark `dark-bg`; surfaces white / gray-800.
- Accents are **semantic and reserved**: amber = awards, emerald = grants/past teaching, teal = current teaching, purple = talks, violet = admin service. Don't introduce new accent hues; don't use slate (gray is the neutral).
- Accent card pattern: `surface-card-hover h-full p-4 !rounded-xl border-l-4 border-<accent>-500 bg-<accent>-50 dark:bg-<accent>-950/40 flex flex-col`, footer pinned with `mt-auto`. Never size cards by title length or fixed widths — the parent is a `grid gap-4 sm:grid-cols-2 …`.
- No gradients on chrome. A subtle blue-family gradient inside one featured panel body is the ceiling.

## Recurring pieces

- Primary button: `rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all`. On blue bands, invert: `bg-white text-blue-700`.
- Segmented control (e.g., publications grouping): container `inline-flex rounded-full border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 shadow-md overflow-hidden`; active segment `bg-blue-600 text-white`, inactive `text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700`. Toggle with `aria-pressed`.
- Social icon links: white circular chips `h-11 w-11 rounded-full bg-white shadow-md` (shared default in `renderProfileHeader` — don't override).
- Empty states: `text-sm text-gray-500 dark:text-gray-400 italic`.

## Content ownership (avoid redundancy)

| Content | Canonical page | Elsewhere |
|---|---|---|
| Bio, news, research themes | index | CV shows condensed profile |
| Publications (full, groupable) | publications.html | index shows selected per theme |
| Talks (full) | talks.html | index shows 3 recent; CV lists for the record |
| Teaching (full) | teaching.html | CV lists for the record |
| Students (full list) | for_students.html | CV shows counts + link |
| Simulators (all) | for_students.html | index shows `featured_on_homepage` subset + link |
| Awards, grants, service | data.json → rendered via shared helpers on index & CV | |
| Chronology (everything by month) | timeline.html — eras (education/positions) as sticky cards, point events (pubs/talks/teaching/news) on a monthly rail | CV shows a compact era timeline |

Shared renderers live in `shared.js` (`renderAwardsList`, `renderGrantsList`,
`renderStudentsSectionHtml`, `renderSimulatorCardsHtml`, `renderSiteFooter`, `setupPrimaryNav`).
If two pages need the same widget, move the renderer to `shared.js` — never copy markup.

## Accessibility & misc

- Dark mode is class-based (`dark` on `<html>`, persisted in localStorage) — every color utility needs its `dark:` pair.
- All external links via `createLinkHtml` (adds `target="_blank" rel="noopener noreferrer"`); all user data through `escapeHtml`.
- In-page anchor targets need `scroll-mt` (handled globally for `section[id]`).
- Keep KaTeX/Leaflet CDN includes only on pages that use them.
