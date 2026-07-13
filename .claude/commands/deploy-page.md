To push source and deploy GitHub Pages:

```bash
# 1. Make sure main (source repo) is up to date
git add -A
git commit -m "your message"
git push origin main

# 2. Build and deploy to gh-pages (what the site actually serves)
npm run deploy
```

`npm run deploy` runs `vite build` then pushes `dist/` to the `gh-pages` branch via the `gh-pages` npm package. The deploy command uses `--nojekyll` so gh-pages automatically creates `.nojekyll` on the branch — this is critical because without it Jekyll processes `article.md` files and returns 404 for raw fetches, breaking captions. Do not remove `--dotfiles --nojekyll` from the deploy script in `package.json`.

Always push to `main` first — `gh-pages` only holds the built output, never source code.

After deploying, GitHub Pages may not rebuild immediately. To force a rebuild:
```bash
gh api -X POST repos/sayan1999/sayan1999.github.io/pages/builds
```

If `gh-pages` is missing from origin after deploy, push it manually:
```bash
git push origin gh-pages --force
```
