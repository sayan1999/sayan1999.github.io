import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { removeStopwords, eng } from 'stopword'
import { marked } from 'marked'

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
    loc: `${siteUrl}/post/${p.slug}/`,
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

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escJson(str) {
  return String(str ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function buildArticleHtml(siteUrl, post, mdSrc, jsBundle, cssBundle) {
  const stripped = mdSrc.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const withoutHashtags = stripped.split('\n')
    .filter(line => !/^(#\w+\s*)+$/.test(line.trim()))
    .join('\n')
  const bodyHtml = marked.parse(withoutHashtags)
  const pageUrl = `${siteUrl}/post/${post.slug}/`
  const dateStr = post.date
    ? new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const tagsHtml = (post.tags || []).map(t => `<span class="art-tag">${esc(t)}</span>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(post.title)} | AI System Designs for Production</title>
  <meta name="description" content="${esc(post.description)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="AI System Designs for Production">
  <meta property="og:title" content="${esc(post.title)}">
  <meta property="og:description" content="${esc(post.description)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${siteUrl}/assets/logo/og-preview.png">
  ${post.date ? `<meta property="article:published_time" content="${post.date}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@aiwithsayan">
  <meta name="twitter:title" content="${esc(post.title)}">
  <meta name="twitter:description" content="${esc(post.description)}">
  <meta name="twitter:image" content="${siteUrl}/assets/logo/og-preview.png">
  <link rel="canonical" href="${pageUrl}">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/logo/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/logo/favicon-16x16.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${escJson(post.title)}",
    "description": "${escJson(post.description)}",
    "url": "${pageUrl}",
    "datePublished": "${post.date || ''}",
    "author": { "@type": "Person", "name": "Sayan Dey", "url": "${siteUrl}/", "sameAs": ["https://github.com/sayan1999","https://www.linkedin.com/in/aiwithsayan","https://twitter.com/aiwithsayan"] },
    "publisher": { "@type": "Person", "name": "Sayan Dey", "url": "${siteUrl}/" },
    "keywords": ${JSON.stringify(post.tags || [])}
  }
  </script>
  ${cssBundle ? `<link rel="stylesheet" href="/assets/${cssBundle}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"><div class="shell">
    <a class="back-link" href="${siteUrl}/">← all articles</a>
    ${dateStr ? `<div class="art-meta">${dateStr}</div>` : ''}
    <h1 class="art-title">${esc(post.title)}</h1>
    ${post.description ? `<p class="art-desc">${esc(post.description)}</p>` : ''}
    ${tagsHtml ? `<div class="art-tags">${tagsHtml}</div>` : ''}
    <div class="art-body">${bodyHtml}</div>
    <footer class="footer">
      <span class="footer-handle">@aiwithsayan</span>
      <a class="footer-home" href="${siteUrl}/">AI System Designs for Production</a>
    </footer>
  </div></div>
  ${jsBundle ? `<script type="module" src="/assets/${jsBundle}"></script>` : ''}
</body>
</html>`
}

function generateStaticPages(outDir, siteUrl, contentDir, posts) {
  const assetsDir = join(outDir, 'assets')
  const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : []
  const jsBundle = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'))
  const cssBundle = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.css'))

  for (const post of posts) {
    const mdPath = join(contentDir, post.slug, 'article.md')
    if (!existsSync(mdPath)) continue
    const mdSrc = readFileSync(mdPath, 'utf8')
    const html = buildArticleHtml(siteUrl, post, mdSrc, jsBundle, cssBundle)
    const dir = join(outDir, 'post', post.slug)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
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
      generateStaticPages(outDir, siteUrl, contentDir, buildManifest(contentDir))
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
