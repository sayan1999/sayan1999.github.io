# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal GitHub Pages site for **@aiwithsayan**. Built with **React + Vite**. Deploy via `npm run deploy` (builds to `dist/`, pushes to `gh-pages` branch via the `gh-pages` npm package).

To preview locally: `npm run dev` (Vite dev server). Social share previews are handled by `public/articles/share.html` which injects OG/Twitter meta tags before redirecting — test share links via this route, not directly via `/?post=slug`.

Google Analytics is loaded in `index.html` (tags: `GT-MR298GD`, `G-SR2TBD4NDF`). No changes needed for new posts — pageview tracking is automatic.

## Site Philosophy

Quality over volume — cookbook-style deep dives, not spam. Every post earns its place. UI is intentionally minimal and clean: dark theme, no animations for the sake of it, no badges/counters/engagement bait, no decorative clutter. When touching `index.html`, preserve this restraint — add only what's functionally necessary.

## Architecture: Data-Template Pattern

**Content is never hardcoded.** `App.jsx` fetches `manifest.json` at runtime and dynamically renders every post via React components. Adding a new article requires only:

1. Create `public/content-lab/<slug>/article.md` and `public/content-lab/<slug>/artifact.pdf`
2. Add an entry to `public/content-lab/manifest.json`

The app automatically handles rendering, search, pagination, tagging, and sharing — no changes to React source needed.

## File Map

| File/Folder | Purpose |
|---|---|
| `index.html` | Vite entry point — GA tags, meta, fonts |
| `src/App.jsx` | Root component — manifest fetch, pagination state, permalink handling |
| `src/components/` | Hero, Sidebar, SearchBar, Article, PdfStrip, ShareMenu, Pagination |
| `src/index.css` | All styles — CSS custom properties (--bg, --cyan, --gold, etc.) |
| `public/content-lab/manifest.json` | Registry of all posts (`slug`, `title`, `date`, `description`) |
| `public/content-lab/<slug>/article.md` | Post caption; hashtag lines auto-extracted as tags |
| `public/content-lab/<slug>/artifact.pdf` | Carousel slides (1080×1350 px, 4:5) rendered via pdf.js |
| `public/articles/share.html` + `share.js` | OG/Twitter meta injection; redirects to `/?post=<slug>` |
| `public/assets/logo/` | Favicons, webmanifest |

**Editorial-only files** (not served by the app):
`context.md`, `pitch.md`, `slides.md`, `linkedin-caption.md` — see `public/content-lab/CLAUDE.md` for the full content creation workflow.

## Key Conventions

- **Tags** are auto-extracted from lines matching `/^(#\w+\s*)+$/` in `article.md` — hashtags must be on their own paragraph.
- **Social sharing** routes through `articles/share.html?slug=X` to inject OG meta before redirecting to `/?post=X`.
- **PDF rendering** upscales by `devicePixelRatio` for retina sharpness. Worker loaded from CDN: `pdf.js` v3.11.174.
- npm packages: `pdfjs-dist`, `marked`, `fuse.js` (no CDN needed for these in React).
- Do not duplicate content between `manifest.json` (title/description/date) and `article.md` (caption/tags) — each field has exactly one source of truth.
