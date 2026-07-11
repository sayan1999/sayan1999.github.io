Audit the current repo and sync CLAUDE.md so it accurately reflects the actual architecture.

Steps:
1. Read the current CLAUDE.md
2. Read vite.config.js, package.json, src/App.jsx, and list src/components/
3. Check public/ structure (content-lab, articles, assets)
4. Compare what CLAUDE.md says against what actually exists — look for:
   - File paths or folder names that have changed
   - New components or scripts not yet documented
   - Removed files still mentioned
   - Workflow steps that are outdated (e.g. deploy commands, how to add a post)
5. Update CLAUDE.md in-place with only what changed — preserve the tone and brevity, do not pad or rewrite sections that are still accurate
