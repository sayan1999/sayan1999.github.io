import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

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

function buildManifest(contentDir) {
  const posts = []
  for (const name of readdirSync(contentDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)) {
    const mdPath = join(contentDir, name, 'article.md')
    if (!existsSync(mdPath)) continue
    const fm = parseFrontmatter(readFileSync(mdPath, 'utf8'))
    if (!fm.title || !fm.date) continue
    posts.push({ slug: name, title: fm.title, date: fm.date, description: fm.description || '' })
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

function manifestPlugin() {
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
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), manifestPlugin()],
})
