# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal GitHub Pages **AI System Designs for Production** site for **@aiwithsayan**. Built with **React + Vite**. Deploy via `npm run deploy` (builds to `dist/`, pushes to `gh-pages` branch via the `gh-pages` npm package).

To preview locally: `npm run dev` (Vite dev server at `localhost:5173`). Social share previews are handled by `public/articles/share.html` which injects OG/Twitter meta tags before redirecting — test share links via this route, not directly via `/?post=slug`.

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
| `src/App.jsx`                             | Root component — manifest fetch, pagination state, permalink handling                                  |
| `src/components/`                         | Hero, Sidebar, SearchBar, Article, PdfStrip, ShareMenu, Pagination, ChatWithAI (AskAI)                 |
| `src/prompts/system-prompt.md`            | Template for the Ask AI prompt — 3 sections: static context, `{{ARTICLE_LIST}}`, `{{USER_QUERY}}`     |
| `src/index.css`                           | All styles — CSS custom properties (--bg, --cyan, --gold, etc.)                                        |
| `public/content-lab/manifest.json`        | **Auto-generated** by the Vite plugin in `vite.config.js` — not in git, never edit manually            |
| `public/content-lab/<slug>/article.md`    | YAML frontmatter (`title`, `date`, `description`) + post caption; hashtag lines auto-extracted as tags |
| `public/content-lab/<slug>/artifact.pdf`  | Carousel slides (1080×1350 px, 4:5) rendered via pdf.js                                                |
| `public/articles/share.html` + `share.js` | OG/Twitter meta injection; redirects to `/?post=<slug>`                                                |
| `public/assets/logo/`                     | Favicons, webmanifest                                                                                  |

**Editorial-only files** (not served by the app):
`context.md`, `pitch.md`, `slides.md`, `linkedin-caption.md` — see `public/content-lab/CLAUDE.md` for the full content creation workflow.

## Key Conventions

- **Tags** are auto-extracted from lines matching `/^(#\w+\s*)+$/` in `article.md` — hashtags must be on their own paragraph.
- **Social sharing** routes through `articles/share.html?slug=X` to inject OG meta before redirecting to `/?post=X`.
- **PDF rendering** upscales by `devicePixelRatio` for retina sharpness. Worker loaded from CDN: `pdf.js` v3.11.174.
- npm packages: `pdfjs-dist`, `marked`, `fuse.js`. The pdf.js worker is loaded from CDN (`cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`) to avoid bundling issues.
- Do not duplicate content between `manifest.json` (title/description/date) and `article.md` (caption/tags) — each field has exactly one source of truth.

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

2. Add `public/content-lab/<slug>/artifact.pdf` (1080×1350 px slides)

`manifest.json` is auto-generated — `npm run dev` or `npm run deploy` picks it up automatically. No other changes needed.

### Developement mode testing

```bash
npm run dev
```

### Deploying to GitHub Pages

```bash
npm run deploy    # runs: npm run build && gh-pages -d dist
```

This builds the app into `dist/` and force-pushes it to the `gh-pages` branch. GitHub Pages serves from that branch. The `main` branch holds source only — never push `dist/` to `main`.

### Updating dependencies

```bash
npm update        # patch/minor updates
npm install <pkg> # add a new package
```

After any `package.json` change, commit both `package.json` and `package-lock.json`.
