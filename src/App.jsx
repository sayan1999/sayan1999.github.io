import React, { useState, useEffect, useRef, useCallback } from 'react'
import Hero from './components/Hero'
import CommandPalette from './components/CommandPalette'
import Article from './components/Article'
import Pagination from './components/Pagination'
import Sidebar from './components/Sidebar'

const PAGE_SIZE = 10

export default function App() {
  const [allPosts, setAllPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [scrollTarget, setScrollTarget] = useState(null)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterTrigger, setFilterTrigger] = useState(0)
  const snavRef = useRef(null)

  useEffect(() => {
    fetch('/content-lab/manifest.json')
      .then(r => r.json())
      .then(posts => {
        const sorted = posts.slice().sort((a, b) =>
          (b.date || '').localeCompare(a.date || '')
        )
        setAllPosts(sorted)

        const permalinkSlug = new URLSearchParams(window.location.search).get('post')
        if (permalinkSlug) {
          const pIdx = sorted.findIndex(p => p.slug === permalinkSlug)
          if (pIdx !== -1) {
            const page = Math.floor(pIdx / PAGE_SIZE) + 1
            const localIdx = (pIdx % PAGE_SIZE) + 1
            setCurrentPage(page)
            setScrollTarget(`post-${localIdx}`)
            return
          }
        }
        setCurrentPage(1)
      })
      .catch(e => console.error('manifest error', e))
  }, [])

  const handleNavigate = useCallback((page, localIdx) => {
    setCurrentPage(page)
    setScrollTarget(`post-${localIdx}`)
    setFilterQuery('')
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    setScrollTarget(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFilterByTag = useCallback((tag) => {
    setFilterQuery(tag)
    setFilterTrigger(t => t + 1)
  }, [])

  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const pagePosts = allPosts.slice(start, start + PAGE_SIZE)

  return (
    <div className="shell">
      <Sidebar
        posts={pagePosts}
        startIdx={start}
        snavRef={snavRef}
      />
      <div className="content">
        <Hero />
        <CommandPalette
          allPosts={allPosts}
          onNavigate={handleNavigate}
          externalQuery={filterQuery}
          externalTrigger={filterTrigger}
        />
        <div id="feed">
          {pagePosts.map((post, i) => (
            <Article
              key={post.slug}
              post={post}
              idx={i + 1}
              globalIdx={start + i + 1}
              onFilterTag={handleFilterByTag}
              scrollTarget={scrollTarget}
            />
          ))}
        </div>
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
