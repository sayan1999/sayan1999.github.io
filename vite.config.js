import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { removeStopwords, eng } from 'stopword'

function parseFrontmatter(src) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    result[key] = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '')
  }
  return result
}

function extractTags(src) {
  const body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const tags = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (/^(#\w+\s*)+$/.test(trimmed)) {
      trimmed.split(/\s+/).filter(Boolean).forEach(t => tags.push(t.replace('#', '')))
    }
  }
  return [...new Set(tags)].slice(0, 5)
}

function extractBody(src) {
  const body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const noTags = body.split('\n').filter(line => !/^(#\w+\s*)+$/.test(line.trim())).join(' ')
  const noPunct = noTags.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = noPunct.toLowerCase().split(' ').filter(Boolean)
  return removeStopwords(words, eng).join(' ')
}

function buildManifest(contentDir) {
  const posts = []
  for (const name of readdirSync(contentDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)) {
    const mdPath = join(contentDir, name, 'article.md')
    if (!existsSync(mdPath)) continue
    const src = readFileSync(mdPath, 'utf8')
    const fm = parseFrontmatter(src)
    if (!fm.title || !fm.date) continue
    posts.push({
      slug: name,
      title: fm.title,
      date: fm.date,
      description: fm.description || '',
      tags: extractTags(src),
      body: extractBody(src),
    })
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

function buildSitemap(siteUrl, posts) {
  const staticUrls = [
    { loc: siteUrl + '/', priority: '1.0', changefreq: 'weekly' },
  ]
  const articleUrls = posts.map(p => ({
    loc: `${siteUrl}/?post=${p.slug}`,
    lastmod: p.date,
    priority: '0.8',
    changefreq: 'monthly',
  }))
  const all = [...staticUrls, ...articleUrls]
  const urlEntries = all.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
}

function manifestPlugin(siteUrl) {
  const virtualId = '/content-lab/manifest.json'
  const contentDir = join(process.cwd(), 'public/content-lab')

  return {
    name: 'manifest-generator',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== virtualId) return next()
        const posts = buildManifest(contentDir)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(posts, null, 2))
      })
    },

    generateBundle() {
      const posts = buildManifest(contentDir)
      this.emitFile({
        type: 'asset',
        fileName: 'content-lab/manifest.json',
        source: JSON.stringify(posts, null, 2) + '\n',
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: buildSitemap(siteUrl, posts),
      })
    },

    writeBundle(options) {
      const outDir = options.dir || join(process.cwd(), 'dist')
      for (const rel of ['robots.txt', 'llms.txt']) {
        const p = join(outDir, rel)
        if (existsSync(p))
          writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__SITE_URL__', siteUrl))
      }
    },
  }
}

export default defineConfig(() => {
  const siteUrl = process.env.VITE_SITE_URL || 'http://localhost:5173'

  return {
    base: '/',
    plugins: [react(), manifestPlugin(siteUrl)],
  }
})
