Find every slug folder under public/content-lab/ that is missing an article.md and create one for each.

Steps:
1. Run: `for d in public/content-lab/*/; do [ ! -f "$d/article.md" ] && echo "$d"; done`
2. For each folder missing article.md, create a stub at `public/content-lab/<slug>/article.md` with this structure:
   ```
   ---
   title: ""
   date: "YYYY-MM-DD"
   description: ""
   ---

   <!-- Caption body here -->

   #Tag1 #Tag2
   ```
   Use the folder name as a hint for the title (convert hyphens to spaces, title-case it). Use today's date for the date field. Leave description and body as placeholders.
3. Report which files were created and which folders already had article.md.
