import React, { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import SYSTEM_PROMPT_TEMPLATE from '../prompts/ask-ai-prompt.md?raw'

const BOTS = [
  { id: 'chatgpt',    label: 'ChatGPT',    url: p => `https://chatgpt.com/?prompt=${p}&hints=search&utm_source=aiwithsayan` },
  { id: 'grok',       label: 'Grok',       url: p => `https://grok.com/?q=${p}&utm_source=aiwithsayan` },
  { id: 'perplexity', label: 'Perplexity', url: p => `https://www.perplexity.ai/search?q=${p}&utm_source=aiwithsayan` },
  { id: 'claude',     label: 'Claude',     url: p => `https://claude.ai/new?q=${p}&utm_source=aiwithsayan` },
  { id: 'googleai',   label: 'Google AI',  url: p => `https://www.google.com/search?udm=50&aep=11&q=${p}&utm_source=aiwithsayan` },
  { id: 'mistral',    label: 'Mistral',    url: p => `https://chat.mistral.ai/chat?q=${p}&utm_source=aiwithsayan` },
]

const AI_SUGGESTIONS = [
  'How do I eval my AI agent when no exceptions fire but users are churning?',
  'My model scored 95% in CV but only 60% in prod — what went wrong?',
  'My RAG is missing relevant docs — when should I switch from bi-encoders to ColBERT?',
  'How do I build an AI writing tool that remembers my style corrections across sessions?',
]

const fuseOptions = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'body', weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

function buildPrompt(userQuery) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace(/\{\{SITE_URL\}\}/g, 'https://sayan1999.github.io')
    .replace('{{USER_QUERY}}', userQuery)
}

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const IconGitHub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

export default function Hero({ allPosts = [], searchQuery = '', onSearch }) {
  const [value, setValue] = useState(searchQuery)
  const [focused, setFocused] = useState(false)
  const [showBotPopover, setShowBotPopover] = useState(false)

  const inputRef = useRef(null)
  const wrapRef = useRef(null)
  const searchRef = useRef(null)
  const fuseRef = useRef(null)
  const blurTimerRef = useRef(null)

  useEffect(() => { setValue(searchQuery) }, [searchQuery])

  useEffect(() => {
    if (allPosts.length > 0) {
      fuseRef.current = new Fuse(allPosts, fuseOptions)
      const urlQ = new URLSearchParams(window.location.search).get('q')
      if (urlQ) {
        setValue(urlQ)
        const hits = fuseRef.current.search(urlQ).map(h => h.item)
        onSearch?.(urlQ, hits)
      }
    }
    window.__rebuildSearchFuse = () => {
      if (allPosts.length > 0) fuseRef.current = new Fuse(allPosts, fuseOptions)
    }
    window.__heroSearch = (q) => {
      if (!q || !fuseRef.current) { onSearch?.('', []); return }
      setValue(q)
      const hits = fuseRef.current.search(q).map(h => h.item)
      onSearch?.(q, hits)
    }
    return () => { delete window.__rebuildSearchFuse; delete window.__heroSearch }
  }, [allPosts, onSearch])

  // Close popover on outside click
  useEffect(() => {
    const handler = e => {
      if (!wrapRef.current?.contains(e.target)) {
        clearTimeout(blurTimerRef.current)
        setFocused(false)
        setShowBotPopover(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // '/' shortcut
  useEffect(() => {
    const handler = e => {
      const inInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (e.key === '/' && !inInput) { e.preventDefault(); inputRef.current?.focus() }
      if (e.key === 'Escape') { setFocused(false); setShowBotPopover(false); inputRef.current?.blur() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  function commitSearch(q) {
    if (!q || !fuseRef.current) { onSearch?.('', []); return }
    const hits = fuseRef.current.search(q).map(h => h.item)
    onSearch?.(q, hits)
    window.gtag?.('event', 'search', { search_term: q, result_count: hits.length })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim()) { commitSearch(value); setFocused(false); inputRef.current?.blur() }
    }
    if (e.key === 'Escape') {
      if (showBotPopover) { setShowBotPopover(false); return }
      setValue(''); onSearch?.('', []); setFocused(false); inputRef.current?.blur()
    }
  }

  function handleClear() {
    setValue(''); onSearch?.('', []); setShowBotPopover(false)
    inputRef.current?.focus()
  }

  function launchBot(bot) {
    const full = buildPrompt(value)
    window.open(bot.url(encodeURIComponent(full)), '_blank', 'noopener')
    setShowBotPopover(false); setFocused(false)
    window.gtag?.('event', 'ask_ai_launch', { bot: bot.label, query: value.trim().slice(0, 100) })
  }

  const dropdownOpen = focused && !showBotPopover

  return (
    <>
      <header className="site-header" ref={wrapRef}>
        <a className="site-logo" href="/">AI with Sayan</a>

        <div className="header-search" ref={searchRef}>
          <div className="header-search-pill">
          <div className="header-search-inner">
            <input
              ref={inputRef}
              className="header-search-input"
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => { clearTimeout(blurTimerRef.current); setFocused(true); setShowBotPopover(false) }}
              onBlur={() => { blurTimerRef.current = setTimeout(() => setFocused(false), 160) }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
            />
            {!value && !focused && (
              <div className="header-search-placeholder visible">
                search articles — or ask AI anything
              </div>
            )}
            {value && (
              <button className="header-search-clear" onMouseDown={e => e.preventDefault()} onClick={handleClear}>×</button>
            )}
          </div>
          </div>

          {dropdownOpen && (
            <div className="header-search-dropdown">
              <div className="header-dropdown-label">✨ Ask AI</div>
              <div className="header-suggestions-wrap">
                {value.trim() ? (
                  <button
                    className="header-suggestion"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setFocused(false); setShowBotPopover(v => !v); inputRef.current?.blur() }}
                  >
                    {value}
                  </button>
                ) : (
                  AI_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="header-suggestion"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setValue(s)
                        clearTimeout(blurTimerRef.current)
                        setFocused(false)
                        setShowBotPopover(true)
                        inputRef.current?.blur()
                      }}
                    >
                      {s}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {showBotPopover && (
            <div className="header-bot-picker">
              <div className="header-dropdown-label">Ask AI via —</div>
              <div className="header-bot-list">
                {BOTS.map(bot => (
                  <button key={bot.id} className="header-bot-row" onMouseDown={e => e.preventDefault()} onClick={() => launchBot(bot)}>
                    {bot.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <nav className="site-header-nav">
          <a href="https://instagram.com/shy_on_day" target="_blank" rel="noopener" aria-label="Instagram" className="site-nav-icon"><IconInstagram /></a>
          <a href="https://linkedin.com/in/sdey" target="_blank" rel="noopener" aria-label="LinkedIn" className="site-nav-icon"><IconLinkedIn /></a>
          <a href="https://github.com/sayan1999" target="_blank" rel="noopener" aria-label="GitHub" className="site-nav-icon"><IconGitHub /></a>
        </nav>
      </header>
    </>
  )
}
