# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal GitHub Pages `AI System Designs for Production` for **@aiwithsayan**. No build step — static files served directly. Deploy by pushing to `git@github.com:sayan1999/sayan1999.github.io.git`.

To preview locally: `python3 -m http.server 8080` from the repo root. Social share previews are handled by `articles/share.html` which injects OG/Twitter meta tags before redirecting — test share links via this route, not directly via `/?post=slug`.

Google Analytics is loaded via CDN in `index.html` (tags: `GT-MR298GD`, `G-SR2TBD4NDF`). No changes needed for new posts — pageview tracking is automatic.

## Site Philosophy

Quality over volume — cookbook-style deep dives, not spam. Every post earns its place. UI is intentionally minimal and clean: dark theme, no animations for the sake of it, no badges/counters/engagement bait, no decorative clutter. When touching `index.html`, preserve this restraint — add only what's functionally necessary.

## Architecture: Data-Template Pattern

**Content is never hardcoded.** `index.html` is a pure template — it reads `content-lab/manifest.json` at runtime and dynamically renders every post. Adding a new article requires only:

1. Create `content-lab/<slug>/article.md` and `content-lab/<slug>/artifact.pdf`
2. Add an entry to `content-lab/manifest.json`

The template automatically handles rendering, search, pagination, tagging, and sharing — no changes to HTML/JS needed.

## File Map

| File                                        | Purpose                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `index.html`                                | Entire SPA — embedded CSS + JS, no framework, no build                         |
| `content-lab/manifest.json`                 | Registry of all posts (`slug`, `title`, `date`, `description`)                 |
| `content-lab/<slug>/article.md`             | Post caption; hashtag lines auto-extracted as tags                             |
| `content-lab/<slug>/artifact.pdf`           | Carousel slides (1080×1350 px, 4:5) rendered via pdf.js                        |
| `articles/share.html` + `articles/share.js` | OG/Twitter meta injection for social share links; redirects to `/?post=<slug>` |
| `assets/logo/site.webmanifest`              | PWA manifest                                                                   |

**Editorial-only files** (not served, used in content-lab workflow):
`context.md`, `pitch.md`, `slides.md`, `linkedin-caption.md` — see `content-lab/CLAUDE.md` for the full content creation workflow.

## Key Conventions

- **Tags** are auto-extracted from lines matching `/^(#\w+\s*)+$/` in `article.md` — hashtags must be on their own paragraph.
- **Social sharing** routes through `articles/share.html?slug=X` to inject OG meta before redirecting to `/?post=X`.
- **PDF rendering** upscales by `devicePixelRatio` for retina sharpness.
- Libraries loaded from CDN: `pdf.js` v3.11.174, `marked.js`, `fuse.js` v7.0.0.
- Do not duplicate content between `manifest.json` (title/description/date) and `article.md` (caption/tags) — each field has exactly one source of truth.
