To push source and deploy GitHub Pages:

```bash
# 1. Make sure main (source repo) is up to date
git add -A
git commit -m "your message"
git push origin main

# 2. Build and deploy to gh-pages (what the site actually serves)
npm run deploy
```

`npm run deploy` runs `vite build` then pushes `dist/` to the `gh-pages` branch via the `gh-pages` npm package.

Always push to `main` first — `gh-pages` only holds the built output, never source code.

If `gh-pages` is missing from origin after deploy, push it manually:
```bash
git push origin gh-pages --force
```
