import React, { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'

const PAGE_SIZE = 10

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const fuseOptions = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'slug', weight: 0.5 },
  ],
  threshold: 0.4,
  includeMatches: true,
  minMatchCharLength: 2,
}

export default function SearchBar({ allPosts, onNavigate, externalQuery }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const fuseRef = useRef(null)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (allPosts.length > 0) {
      fuseRef.current = new Fuse(allPosts, fuseOptions)
    }
  }, [allPosts])

  // Re-create fuse when posts update (tags get added async)
  const rebuildFuse = useCallback(() => {
    if (allPosts.length > 0) {
      fuseRef.current = new Fuse(allPosts, fuseOptions)
    }
  }, [allPosts])

  // Expose rebuildFuse so Article can call it after loading tags
  useEffect(() => {
    window.__rebuildSearchFuse = rebuildFuse
    return () => { delete window.__rebuildSearchFuse }
  }, [rebuildFuse])

  // Handle externalQuery (filterByTag)
  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery)
      doSearch(externalQuery)
      setOpen(true)
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        inputRef.current?.focus()
      }, 0)
    }
  }, [externalQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  function doSearch(q) {
    if (!q || !fuseRef.current) {
      setResults([])
      setOpen(false)
      return
    }
    const hits = fuseRef.current.search(q, { limit: 8 })
    setResults(hits)
    setOpen(true)
  }

  function handleInput(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    const q = el.value
    setQuery(q)
    doSearch(q)
  }

  function handleFocus() {
    if (query && results.length > 0) setOpen(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const first = results[0]
      if (first) navigateTo(first)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setOpen(false)
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.focus()
    }
  }

  function navigateTo(hit) {
    const refIndex = allPosts.findIndex(p => p.slug === hit.item.slug)
    if (refIndex === -1) return
    const page = Math.floor(refIndex / PAGE_SIZE) + 1
    const localIdx = (refIndex % PAGE_SIZE) + 1
    setOpen(false)
    setQuery('')
    onNavigate(page, localIdx)
  }

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Global keyboard shortcut
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="search-wrap" ref={wrapRef}>
      <textarea
        ref={inputRef}
        rows={1}
        className="search-input"
        placeholder="/ search articles…"
        autoComplete="off"
        spellCheck="false"
        value={query}
        onChange={handleInput}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      <button
        className="search-clear"
        aria-label="Clear search"
        style={{ display: query ? 'block' : 'none' }}
        onClick={handleClear}
      >
        ×
      </button>
      <div
        className="search-results"
        style={{ display: open ? 'block' : 'none' }}
      >
        {results.length === 0 && query ? (
          <div className="search-empty">no results</div>
        ) : (
          results.map((hit) => {
            const dateStr = hit.item.date ? formatDate(hit.item.date) : ''
            return (
              <div
                key={hit.item.slug}
                className="search-result-item"
                onClick={() => navigateTo(hit)}
              >
                <div className="search-result-title">{hit.item.title}</div>
                {dateStr && <div className="search-result-meta">{dateStr}</div>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
