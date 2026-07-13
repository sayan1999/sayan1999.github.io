Find every slug folder under public/content-lab/ that is missing an article.md and create one for each.

## PDF slide awareness

Each `---` separator in article.md marks a slide boundary. The article page renders: text section → PDF slide → text section → PDF slide → …

When creating a stub, count the slides in `slides.md` (count `## Slide N` headings) and generate exactly that many `---` separated sections so every slide has a matching text block.

## Steps

1. Run: `for d in public/content-lab/*/; do [ ! -f "$d/article.md" ] && echo "$d"; done`
2. For each folder missing article.md:
   a. Read `slides.md` if it exists — count the number of slides (`## Slide N` headings).
   b. Create `public/content-lab/<slug>/article.md` with this structure:

```
---
title: ""
date: "YYYY-MM-DD"
description: ""
---

<!-- Section 1: caption for Slide 1 (hook / cover text) -->

---

<!-- Section 2: caption for Slide 2 -->

---

<!-- Section N: caption for Slide N — close with a discussion question -->

#Tag1 #Tag2
```

   - Generate one section per slide, separated by `---`
   - If slides.md doesn't exist, generate 5 sections as a default (typical carousel length)
   - Use the slide headlines from slides.md as inline comments to guide writing
   - Use the folder name as a hint for the title (convert hyphens to spaces, title-case it)
   - Use today's date for the date field
   - Leave title, description, and body text as placeholders

3. Report which files were created and which folders already had article.md.
