import React, { useState, useEffect, useCallback } from 'react'
import Hero from './components/Hero'
import Footer from './components/Footer'
import Article from './components/Article'
import ArticlePage from './components/ArticlePage'
import Pagination from './components/Pagination'

const PAGE_SIZE = 10

export default function App() {
  const [allPosts, setAllPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPost, setCurrentPost] = useState(null)
  const [feedSearch, setFeedSearch] = useState({ query: '', posts: [] })

  useEffect(() => {
    fetch('/content-lab/manifest.json')
      .then(r => r.json())
      .then(posts => {
        const sorted = posts.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        setAllPosts(sorted)

        const pathMatch = window.location.pathname.match(/^\/post\/([^/]+)\/?$/)
        const permalinkSlug = pathMatch?.[1]
        if (permalinkSlug) {
          const pIdx = sorted.findIndex(p => p.slug === permalinkSlug)
          if (pIdx !== -1) setCurrentPost({ ...sorted[pIdx], globalIdx: pIdx + 1 })
        }
        // Restore search from URL — Hero will run Fuse once allPosts is set
        // We store the raw query; Hero rebuilds results via its own Fuse
      })
      .catch(e => console.error('manifest error', e))
  }, [])

  const openPost = useCallback((post, globalIdx) => {
    setCurrentPost({ ...post, globalIdx })
    const url = new URL(window.location)
    url.pathname = '/post/' + post.slug + '/'
    url.search = ''
    window.history.pushState({}, '', url)
    window.scrollTo({ top: 0 })
    window.gtag?.('event', 'article_open', { slug: post.slug, title: post.title })
  }, [])

  const closePost = useCallback(() => {
    setCurrentPost(null)
    const url = new URL(window.location)
    url.pathname = '/'
    url.search = ''
    window.history.pushState({}, '', url)
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    function onPopState() {
      const pathMatch = window.location.pathname.match(/^\/post\/([^/]+)\/?$/)
      const slug = pathMatch?.[1]
      if (slug) {
        setAllPosts(prev => {
          const pIdx = prev.findIndex(p => p.slug === slug)
          if (pIdx !== -1) setCurrentPost({ ...prev[pIdx], globalIdx: pIdx + 1 })
          return prev
        })
      } else {
        setCurrentPost(null)
      }
      const params = new URLSearchParams(window.location.search)
      if (!params.get('q')) setFeedSearch({ query: '', posts: [] })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleSearch = useCallback((q, posts) => {
    setFeedSearch({ query: q, posts: posts || [] })
    setCurrentPost(null)
    const url = new URL(window.location)
    if (q) {
      url.searchParams.set('q', q)
      url.searchParams.delete('post')
    } else {
      url.searchParams.delete('q')
    }
    window.history.pushState({}, '', url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const isSearchActive = Boolean(feedSearch.query)
  const feedPosts = isSearchActive ? feedSearch.posts : allPosts.slice(start, start + PAGE_SIZE)

  const hero = (
    <Hero
      allPosts={allPosts}
      searchQuery={feedSearch.query}
      onSearch={handleSearch}
    />
  )

  if (currentPost) {
    return (
      <div className="shell shell--article">
        <div className="content">
          {hero}
          <ArticlePage
            post={currentPost}
            globalIdx={currentPost.globalIdx}
            onBack={closePost}
            onFilterTag={(tag) => window.__heroSearch?.(tag)}
          />
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <div className="content">
        {hero}
        {isSearchActive && (
          <div className="feed-search-header">
            <span>{feedSearch.posts.length} result{feedSearch.posts.length !== 1 ? 's' : ''} for <em>"{feedSearch.query}"</em></span>
            <button className="feed-search-clear" onClick={() => handleSearch('', [])}>clear</button>
          </div>
        )}
        <div id="feed">
          {feedPosts.map((post, i) => {
            const gIdx = isSearchActive
              ? allPosts.findIndex(p => p.slug === post.slug) + 1
              : start + i + 1
            return (
              <Article
                key={post.slug}
                post={post}
                globalIdx={gIdx}
                onOpen={(p) => openPost(p, gIdx)}
                onFilterTag={(tag) => window.__heroSearch?.(tag)}
              />
            )
          })}
        </div>
        {!isSearchActive && (
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
        <Footer />
      </div>
    </div>
  )
}
