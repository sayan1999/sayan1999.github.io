# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal GitHub Pages **AI System Designs for Production** site for **@aiwithsayan**. Built with **React + Vite**. Deploy via `npm run deploy` (builds to `dist/`, pushes to `gh-pages` branch via the `gh-pages` npm package).

To preview locally: `npm run dev` (Vite dev server at `localhost:5173`).

Google Analytics is loaded in `index.html` (tags: `GT-MR298GD`, `G-SR2TBD4NDF`). No changes needed for new posts — pageview tracking is automatic.

## Site Philosophy

Quality over volume — cookbook-style deep dives, not spam. Every post earns its place. UI is intentionally minimal and clean: dark theme, no animations for the sake of it, no badges/counters/engagement bait, no decorative clutter. When touching components or styles, preserve this restraint — add only what's functionally necessary.

## Architecture: Data-Template Pattern

**Content is never hardcoded.** `App.jsx` fetches `manifest.json` at runtime and dynamically renders every post via React components. Adding a new article requires only:

1. Create `public/content-lab/<slug>/article.md` and `public/content-lab/<slug>/artifact.pdf`

The app automatically handles rendering, search, pagination, tagging, and sharing — no changes to React source needed.

## File Map

| File/Folder                               | Purpose                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `index.html`                              | Vite entry point — GA tags, meta, fonts                                                                |
| `src/App.jsx`                             | Root component — manifest fetch, pagination state, path-based post routing (`/post/<slug>/`)           |
| `src/components/`                         | Hero (search + Ask AI + bot routing), Article, ArticlePage (PDF + share), ShareMenu, Pagination, Footer — `SearchBar.jsx`, `CommandPalette.jsx`, `ChatWithAI.jsx` exist but are unused |
| `src/prompts/ask-ai-prompt.md`            | System prompt template for the Ask AI feature — uses `{{SITE_URL}}` and `{{USER_QUERY}}` placeholders  |
| `src/index.css`                           | All styles — CSS custom properties (--bg, --cyan, --gold, etc.)                                        |
| `public/content-lab/manifest.json`        | **Auto-generated** by the Vite plugin in `vite.config.js` — not in git, never edit manually            |
| `public/content-lab/<slug>/article.md`    | YAML frontmatter (`title`, `date`, `description`) + post caption; hashtag lines auto-extracted as tags |
| `public/content-lab/<slug>/artifact.pdf`  | Slides rendered inline in `ArticlePage.jsx` via pdf.js — one slide per article section, extras appended at the end |
| `public/robots.txt` + `llms.txt`          | SEO/crawler directives; `__SITE_URL__` substituted at build time by the Vite plugin                    |
| `public/assets/logo/`                     | Favicons, webmanifest                                                                                  |

**Editorial-only files** (not served by the app):
`context.md`, `pitch.md`, `slides.md`, `linkedin-caption.md` — see `public/content-lab/CLAUDE.md` for the full content creation workflow.

## Key Conventions

- **Tags** are auto-extracted from lines matching `/^(#\w+\s*)+$/` in `article.md` — hashtags must be on their own paragraph.
- **Hero search bar** (`Hero.jsx`) handles both search and Ask AI. It has three mutually exclusive states driven by `focused` and `showBotPopover`:
  - **idle**: `focused=false, showBotPopover=false` — placeholder visible
  - **typing**: `focused=true, showBotPopover=false` — dropdown open (suggestions or "Ask AI" action)
  - **bot picker**: `showBotPopover=true` — provider list shown, dropdown hidden (`dropdownOpen = focused && !showBotPopover`)

  **Critical invariant:** when transitioning to bot picker, always call `inputRef.current?.blur()` so the input truly loses DOM focus. This ensures clicking the input again fires `onFocus` → `setShowBotPopover(false)`, returning to typing state. Without the blur, `onFocus` never fires (input was already focused) and the bot picker gets stuck.
- **Inline PDF rendering** (`ArticlePage.jsx`): `artifact.pdf` is loaded via `pdfjs-dist` and rendered canvas-by-canvas inline between article sections. Each section gets one matching slide; extra slides are appended after the last section. Worker loaded from CDN: `cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`.
- npm packages: `pdfjs-dist`, `marked`, `fuse.js`, `stopword` (used by the Vite manifest plugin to strip stop-words from the body search index).
- **Vite plugin** (`vite.config.js`) generates `content-lab/manifest.json`, `sitemap.xml`, and performs `__SITE_URL__` string substitution in `robots.txt` and `llms.txt`. It also generates **static HTML pages** at `dist/post/<slug>/index.html` for every post — each page contains the full article content (rendered from `article.md`) plus the React bundle, so crawlers/LLMs get static HTML while real users get the full interactive SPA. Sitemap article URLs point to `/post/<slug>/`. `VITE_SITE_URL` env var must be set for production builds (the `predeploy` script handles this automatically).
- **Never hardcode the site URL** (`https://sayan1999.github.io` or any variant) anywhere in source files. Always use the `__SITE_URL__` placeholder in static files (replaced at build time) or `import.meta.env.VITE_SITE_URL` in JS/JSX. Hardcoding breaks local dev, staging, and any future domain changes.
- Do not duplicate content between `manifest.json` (title/description/date) and `article.md` (caption/tags) — each field has exactly one source of truth.
- **Post URLs use path routing**, not query params. In the SPA, opening a post pushes `/post/<slug>/` to history (never `?post=`). Share links in `ShareMenu.jsx` and `ArticlePage.jsx` use `window.location.origin + '/post/' + slug + '/'`. The static file at `dist/post/<slug>/index.html` is what GitHub Pages actually serves when someone navigates directly to that URL.

## Mobile vs Desktop Behavior

The breakpoint is **640px** (`@media (max-width: 640px)`). Key differences to be aware of when touching layout or components:

| Concern | Desktop | Mobile |
|---|---|---|
| Header layout | Logo + search + icons in one row | Logo + icons on top row; search bar full-width on second row |
| Search input | Inline underline input in header | Same, but full-width on its own row |

## Maintaining & Deploying

### Local development

```bash
npm install       # first time / after pulling new deps
npm run dev       # Vite dev server at http://localhost:5173
```

### Adding a new post

1. Create `public/content-lab/<slug>/article.md` with frontmatter + caption:

   ```markdown
   ---
   title: "Your Post Title"
   date: "YYYY-MM-DD"
   description: "One-line description."
   ---

   Post caption body here...

   #Tag1 #Tag2 #Tag3
   ```

2. Add `public/content-lab/<slug>/artifact.pdf` (slides, 1080×1350 px, 4:5 ratio)

`manifest.json` is auto-generated — `npm run dev` or `npm run deploy` picks it up automatically. No other changes needed.

### Deploying to GitHub Pages

```bash
npm run deploy    # runs predeploy (vite build with VITE_SITE_URL set) then gh-pages -d dist --dotfiles --nojekyll
```

This builds the app into `dist/` and force-pushes it to the `gh-pages` branch. GitHub Pages serves from that branch. The `main` branch holds source only — never push `dist/` to `main`.

### Updating dependencies

```bash
npm update        # patch/minor updates
npm install <pkg> # add a new package
```

After any `package.json` change, commit both `package.json` and `package-lock.json`.
