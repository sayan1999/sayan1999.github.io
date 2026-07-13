import React, { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import SYSTEM_PROMPT_TEMPLATE from '../prompts/ask-ai-prompt.md?raw'

const favicon = domain => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

const BOTS = [
  { id: 'chatgpt',    label: 'ChatGPT',    icon: favicon('chatgpt.com'),       url: p => `https://chatgpt.com/?prompt=${p}&hints=search` },
  { id: 'grok',       label: 'Grok',       icon: favicon('grok.com'),          url: p => `https://grok.com/?q=${p}` },
  { id: 'perplexity', label: 'Perplexity', icon: favicon('perplexity.ai'),     url: p => `https://www.perplexity.ai/search?q=${p}` },
  { id: 'claude',     label: 'Claude',     icon: favicon('claude.ai'),         url: p => `https://claude.ai/new?q=${p}` },
  { id: 'googleai',   label: 'Google AI',  icon: favicon('gemini.google.com'), url: p => `https://www.google.com/search?udm=50&aep=11&q=${p}` },
  { id: 'mistral',    label: 'Mistral',    icon: favicon('mistral.ai'),        url: p => `https://chat.mistral.ai/chat?q=${p}` },
]

const fuseOptions = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'body', weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 2,
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function buildPrompt(userQuery) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace(/\{\{SITE_URL\}\}/g, window.location.origin)
    .replace('{{USER_QUERY}}', userQuery)
}

const SUGGESTIONS = {
  search: [
    'Production evals',
    'ColBERT',
    'Adversarial validation',
    'PAHF',
  ],
  ai: [
    'How do I eval my AI agent when no exceptions fire but users are churning?',
    'My model scored 95% in CV but only 60% in prod — what went wrong?',
    'My RAG is missing relevant docs — when should I switch from bi-encoders to ColBERT?',
    'How do I build an AI writing tool that remembers my style corrections across sessions?',
  ],
}

export default function CommandPalette({ allPosts = [], onNavigate, onSearch, externalQuery, externalTrigger }) {
  const [mode, setMode] = useState('ai')
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const [showBotPopover, setShowBotPopover] = useState(false)

  const inputRef = useRef(null)
  const frameRef = useRef(null)
  const fuseRef = useRef(null)
  const blurTimerRef = useRef(null)
const sendWrapRef = useRef(null)
  const botFloatRef = useRef(null)
  const [botPos, setBotPos] = useState(null)

  const dropdownOpen = mode === 'ai' && focused

  useEffect(() => {
    if (showBotPopover && sendWrapRef.current) {
      const rect = sendWrapRef.current.getBoundingClientRect()
      setBotPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
    } else {
      setBotPos(null)
    }
  }, [showBotPopover])

  useEffect(() => {
    if (allPosts.length > 0) fuseRef.current = new Fuse(allPosts, fuseOptions)
  }, [allPosts])

  const rebuildFuse = useCallback(() => {
    if (allPosts.length > 0) fuseRef.current = new Fuse(allPosts, fuseOptions)
  }, [allPosts])

  useEffect(() => {
    window.__rebuildSearchFuse = rebuildFuse
    return () => { delete window.__rebuildSearchFuse }
  }, [rebuildFuse])

  useEffect(() => {
    if (externalQuery) {
      setMode('search')
      setQuery(externalQuery)
      setFocused(true)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [externalQuery, externalTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync textarea height whenever query changes (covers programmatic sets)
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [query])

  // Placeholder always cycles when input not focused — visible even in idle state
  useEffect(() => {
    if (focused) return
    const cycle = () => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % SUGGESTIONS[mode].length)
        setPlaceholderVisible(true)
      }, 300)
    }
    const id = setInterval(cycle, 2800)
    return () => clearInterval(id)
  }, [focused, mode])

  useEffect(() => {
    setPlaceholderIdx(0)
    setPlaceholderVisible(true)
  }, [mode])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      // Check if the click is outside BOTH the frame and the bot float
      if (
        !frameRef.current?.contains(e.target) && 
        !botFloatRef.current?.contains(e.target)
      ) {
        clearTimeout(blurTimerRef.current)
        setFocused(false)
        setShowBotPopover(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // '/' shortcut focuses the input
  useEffect(() => {
    const handler = e => {
      const inInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (e.key === '/' && !inInput) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        if (showBotPopover) setShowBotPopover(false)
        else { setFocused(false); inputRef.current?.blur() }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showBotPopover])

  function commitSearch(q) {
    if (!q || !fuseRef.current) { onSearch?.('', []); return }
    const all = fuseRef.current.search(q).map(h => h.item)
    onSearch?.(q, all)
  }

  function handleInput(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    setQuery(el.value)
    setShowBotPopover(false)
  }

  function handleFocus() {
    clearTimeout(blurTimerRef.current)
    setFocused(true)
  }

  function handleBlur() {
    blurTimerRef.current = setTimeout(() => setFocused(false), 160)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (mode === 'search') {
        if (query.trim()) { commitSearch(query); setFocused(false); inputRef.current?.blur() }
      } else if (query.trim()) {
        setShowBotPopover(true)
      }
    }
    if (e.key === 'Escape') {
      if (showBotPopover) setShowBotPopover(false)
      else { setFocused(false); inputRef.current?.blur() }
    }
  }

function handleSend() {
    if (query.trim()) setShowBotPopover(true)
  }

  function launchBot(bot) {
    const full = buildPrompt(query)
    window.open(bot.url(encodeURIComponent(full)), '_blank', 'noopener')
    setShowBotPopover(false)
    setFocused(false)
    setQuery('')
  }

  function handleSuggestionClick(s) {
    setQuery(s)
    setFocused(true)
    clearTimeout(blurTimerRef.current)
    inputRef.current?.focus()
  }

  function switchMode(m) {
    if (m !== 'search') onSearch?.('', [])
    setMode(m)
    setQuery('')
    setShowBotPopover(false)
    clearTimeout(blurTimerRef.current)
    setFocused(true)
    inputRef.current?.focus()
  }

  const placeholder = SUGGESTIONS[mode][placeholderIdx]

  const dropdownContent = (
    <div className="cp-suggestions">
      {SUGGESTIONS.ai.map((s, i) => (
        <button
          key={i}
          className="cp-suggestion"
          onMouseDown={e => e.preventDefault()}
          onClick={() => handleSuggestionClick(s, mode)}
        >
          {s}
        </button>
      ))}
    </div>
  )

  return (
    <div className="cp-section">
      {showBotPopover && botPos && (
        <div className="cp-bot-float" ref={botFloatRef} style={{ top: botPos.top, right: botPos.right }}>
          {BOTS.map(bot => (
            <button key={bot.id} className="cp-bot-card" onMouseDown={e => e.preventDefault()} onClick={() => launchBot(bot)}>
              <img className="cp-bot-avatar" src={bot.icon} alt={bot.label} />
              <span className="cp-bot-name">{bot.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className={`cp-frame${dropdownOpen || showBotPopover ? ' open' : ''}`} ref={frameRef}>

        {/* Always-visible bar */}
        <div className="cp-bar" onClick={() => { inputRef.current?.focus() }}>
          <div className="cp-input-row">
            <div className="cp-input-wrap">
              <textarea
                ref={inputRef}
                rows={1}
                className="cp-input"
                autoComplete="off"
                spellCheck="false"
                value={query}
                onChange={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
              {!query && !focused && (
                <div className={`cp-placeholder${placeholderVisible ? ' visible' : ' hidden'}`}>
                  {placeholder}
                </div>
              )}
            </div>

            {mode === 'ai' && query.trim() && (
              <div className="cp-send-wrap" ref={sendWrapRef}>
                <button className="cp-send-btn" onMouseDown={e => e.preventDefault()} onClick={e => { e.stopPropagation(); handleSend() }}>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor"/></svg>
                </button>
              </div>
            )}
            {query && (
              <button
                className="cp-clear-btn"
                onMouseDown={e => { e.preventDefault(); setQuery(''); setShowBotPopover(false); onSearch?.('', []); if (inputRef.current) { inputRef.current.style.height = 'auto'; inputRef.current.focus() } }}
              >×</button>
            )}
          </div>

          <div className="cp-toggle">
            <button
              className={`cp-toggle-btn${mode === 'ai' ? ' active' : ''}`}
              onMouseDown={e => { e.preventDefault(); switchMode('ai') }}
            >✨ Ask AI</button>
            <button
              className={`cp-toggle-btn${mode === 'search' ? ' active' : ''}`}
              onMouseDown={e => { e.preventDefault(); switchMode('search') }}
            >🔍 Search</button>
          </div>
        </div>

        {/* Dropdown — extends the frame downward */}
        {dropdownOpen && (
          <div className="cp-dropdown">{dropdownContent}</div>
        )}

      </div>

    </div>
  )
}
