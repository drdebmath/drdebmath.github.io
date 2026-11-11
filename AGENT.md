# drdebmath.github.io — Design Language & Conventions

Static academic homepage (GitHub Pages). No framework: plain HTML pages + ES modules + Tailwind
(compiled to `assets/site.css` via `npm run build`). All content lives in `data.json`; JS renders it.
**Never hardcode in HTML what `data.json` already holds.**

## Build & validate

```sh
npm run build      # tailwind → assets/site.css, gen-seo.mjs (JSON-LD + sitemap),
                   # gen-llms.mjs (llms.txt), gen-version.mjs assets (cache-busting ?v= hashes),
                   # prerender.mjs (bakes content into the pages), gen-version.mjs stamp (last updated)
node validate-site.mjs
```

Run both after any change to HTML/JS/`data.json`. `assets/site.css` and `llms.txt` are generated — never edit by hand.

**Versions and "Last updated".** Every local script, stylesheet and `data.json` reference
carries `?v=<content hash>`, rewritten by the build (including the `./shared.js` imports and
`fetch("data.json")` calls inside the page scripts) — never edit those strings by hand, and add
any new page script to `PAGE_SCRIPTS` in `gen-version.mjs`. `build-info.json` records when the
built site last changed; the footer shows it relative ("3 days ago") in the browser and as a
plain date in pre-rendered HTML. Rebuilding without changes keeps the date.

**Pre-rendering.** `prerender.mjs` runs each page's own scripts in jsdom and writes the
rendered DOM back into the `.html` file, so the pages read fully without JavaScript (curl,
crawlers, link previews). In the browser the same scripts redraw everything as before.
Consequences:
- Content inside JS-filled containers is build output. Edit `data.json` or the renderer, then rebuild.
- Every renderer must *replace* its container's content (`innerHTML = …` or clear first), never
  append to what is there, because each build renders from the previous build's output.
- Browser-only state (dark mode, desktop sidebar placement, live blog feed, d3 map) is applied at
  runtime and never baked; the bake uses the phone layout and offline external fetches.

## Design idea

The site is typeset like a paper in the field. One typeface, **Latin Modern** (LaTeX's own),
on a white page. The top of every page is a **blue band with a coordinate grid** (`.site-band`);
the grid appears nowhere else. On the homepage that band is the paper's first page: name,
affiliation, an *Abstract* (the tagline) and **Figure 1**, a real simulator run in an `<iframe>`.
Below it: the featured project set as a theorem-like block (`.theorem`), then plain
sections (`.section-heading`). Blue is the only colour besides the four theme dots and
amber award tags. No shadows, no rounded cards, no decoration that a paper would not have.

> The sections below (tokens, colour roles, recurring pieces) predate this version in places;
> `tailwind.config.cjs` and `src/tailwind.css` are the source of truth.

## Page anatomy (every page, in order)

1. Skip link → first content section.
2. `<nav class="site-nav">` with inner `<div class="page-shell flex items-center justify-between gap-3 py-2.5">`.
   The `<ul id="navbar">` is filled by JS via `setupPrimaryNav(data)` from `shared.js`
   — the same links everywhere, in the order `getPrimarySiteLinks` builds them
   (Home · Publications · CS103 · Talks · Timeline · For Students · Simulators · CV · Teaching · Blog · Mobility Matters;
   CS103, CV, Blog and Mobility Matters appear only when `data.json` supplies their URLs — the blog is
   `about_me.blog`, also listed in the footer). Links are `.nav-link`; the active page gets
   `.nav-link-active` + `aria-current="page"`. Never hand-build a nav.
3. Header: `<header class="site-band">` (blue, with the grid), inner `page-shell`.
   - **Home**: portrait beside the name, Odia name and position; the *Abstract*
     (`about_me.tagline`); Publications/CV buttons and profile icons; beside it **Figure 1**, the
     simulator `<iframe>` whose runs (`hero_simulations`) change on their own every 20 s until
     the visitor picks one.
   - **Subpages**: just `h1.band-title`. No label above it, no description below it.
   - **CV**: the large portrait, name, position, office.
4. `<main class="page-shell …">`. Home sections are open: a `.section-rule` row
   (`h2.section-heading` + optional `.more-link`s) and then content. Headings are not numbered.
   The featured project (`about_me.mobility_matters`) is a `.theorem` block; research themes
   are `.surface-card`s. Subpages may group content in `.surface-panel`.
5. `<footer id="site_footer" class="site-footer …">` — rendered by `renderSiteFooter(data)`.
6. Go-to-top button (`#goToTop`) + dark-mode toggle in nav (`#darkModeToggle`).

`<body>` always: `data-page="<home|publications|teaching|talks|for-students|simulators|cv>"` and
`bg-gray-100 text-gray-900 dark:bg-dark-bg dark:text-dark-text transition-colors duration-200 font-sans`.

## Tokens (defined in `tailwind.config.cjs` and `src/tailwind.css`)

`gray` is **overridden** in `tailwind.config.cjs`: it is the warm paper/ink neutral (gray-100
is the page). `blue` is Tailwind's own blue and is the brand colour. Every `gray-*`/`blue-*`
utility therefore already follows the palette — don't reach for other neutrals (no slate/stone/zinc).

| Class | Use |
|---|---|
| `.page-shell` | The only page-width wrapper (`max-w-screen-xl` + gutters). |
| `font-display` | Source Serif 4: names, page titles, section and card headings, paper titles, the bio. Inter (`font-sans`) for everything else. |
| `.section-heading` | All section `h2`s. Never restyle headings ad hoc. |
| `.section-rule` | Ruled heading row that opens a home section. |
| `.eyebrow` | Small uppercase label above a title. |
| `.more-link` / `.meta-link` | "All … →" links in heading rows / small inline links (arXiv, versions, slides). |
| `.btn-primary` / `.btn-quiet` | The two buttons: ink-filled and outlined. Square-ish (`rounded-md`), never pills. |
| `.tag` / `.tag-award` | Small outlined label (type, role, keyword) / amber award label with ★. |
| `.light-dot` | Theme light; colour comes from `text-light-N dark:text-lightd-N`. |
| `.surface-panel`, `.panel-header`, `.panel-body` | Subpage content group: white sheet, hairline border, no shadow. |
| `.surface-card`, `.surface-card-hover` | Cards (simulators, talks): hairline border, no shadow; hover darkens the border. |

## Colour roles

- **Paper** carries the content; **blue** carries the chrome (`.site-nav`, `.site-band`, `.site-footer`),
  `.btn-primary`, `.section-rule`, links, focus and active states. Text written for paper that sits
  inside `.site-band` is turned light by rules in `src/tailwind.css`.
- **Theme lights** `light-1…4` (dark mode: `lightd-1…4`) = the four `research_themes`, in order:
  blue, teal, rust, violet. Use them for the theme rule and its dot — nowhere else.
- Small semantic accents stay: amber = awards (★, `.tag-award`), emerald = grants, violet = talks
  (top rule on talk cards), teal/emerald = current/past teaching. Don't add hues.
- No drop shadows on content and no gradients. Depth comes from rules and spacing.

## Recurring pieces

- **Publication row** (`displayAsCard` in `script.js`): serif title, venue short name at the right,
  authors (own name in ink semibold), then a meta line of `.tag` type, full venue, `.tag-award`,
  "To appear", arXiv, Abstract; earlier versions fold under it in a `<details>`. Groups (year or
  type) are ruled rows with a sticky label in the left margin. Keep the `.publication-card`,
  `data-publication-key`, `data-card-index` and `data-group-index` hooks — abstracts, search deep
  links (`?pub=`) and highlighting depend on them.
- **Selected paper** on the home page (`renderSelectedPaperRow`): title, then venue + year and links.
- Segmented control (publications grouping): `inline-flex rounded-md border`, active segment
  `bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900`. Toggle with `aria-pressed`.
- Profile icon links: white round chips with a hairline border (shared default in `renderProfileHeader`).
- Empty states: `text-sm text-gray-500 dark:text-gray-400 italic`.

## The hero simulation

The hero figure is an `<iframe>` of the LCM simulator in its `?embed` mode. The scenes are the
`hero_simulations` list in `data.json` (`label`, `title`, `description`, `embed_url`);
`setupHeroSimulation` in `script.js` builds the tabs, appends `theme=light|dark`, and sets the
iframe `src` only after the page's own `load` event, so the simulator never delays the page.
Only the LCM simulator has an embed mode; add one to another simulator before listing it here.

## Loading speed

- Nothing render-blocking comes from another host: fonts are self-hosted in `assets/fonts/`
  (declared in `src/tailwind.css`), KaTeX is fetched by `renderMath` only when text contains `$`.
- Each page's `<head>` sets the dark class inline, and preloads its module, `shared.js`,
  `data.json` and the Inter font.
- `gen-seo.mjs` prerenders the hero's name, eyebrow and tagline into `index.html`.

## Content ownership (avoid redundancy)

| Content | Canonical page | Elsewhere |
|---|---|---|
| Bio, tagline (`about_me.tagline`), news (latest 6), research themes | index | CV shows condensed profile |
| Publications (full, groupable) | publications.html — versions linked by `see_also` stack under the latest full journal/conference version (`buildPublicationStacks`) | index shows selected per theme, headed by the stack head |
| Talks (full) | talks.html | index shows 3 recent; CV lists for the record |
| Teaching (full) | teaching.html | CV lists for the record |
| Students (full list) | for_students.html | CV shows counts + link |
| Simulators (all) + Black Hole embed | simulators.html | index shows `featured_on_homepage` subset + link; for_students links out |
| Blog posts | the blog itself (`about_me.blog.feed` RSS) | index shows the latest 3 (`renderLatestBlogPosts`) |
| Awards, grants, service | data.json → rendered via shared helpers on index & CV | |
| Chronology (everything by month) | timeline.html — eras (education/positions) as sticky cards, point events (pubs/talks/teaching/news) on a monthly rail | CV shows a compact era timeline |

Shared renderers live in `shared.js` (`renderAwardsList`, `renderGrantsList`,
`renderStudentsSectionHtml`, `renderSimulatorCardsHtml`, `renderSiteFooter`, `setupPrimaryNav`).
If two pages need the same widget, move the renderer to `shared.js` — never copy markup.

## Accessibility & misc

- Dark mode is class-based (`dark` on `<html>`); it follows the system setting until the visitor uses the toggle, which is then remembered in localStorage — every color utility needs its `dark:` pair.
- All external links via `createLinkHtml` (adds `target="_blank" rel="noopener noreferrer"`); all user data through `escapeHtml`.
- In-page anchor targets need `scroll-mt` (handled globally for `section[id]`).
- KaTeX has no `<head>` include (see Loading speed). Keep d3 CDN includes only on pages that use them (d3 + topojson draw the static collaborator map on for_students).
