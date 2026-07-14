import React, { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import * as pdfjsLib from 'pdfjs-dist'
import ShareMenu from './ShareMenu'
import DISCUSS_PROMPT_TEMPLATE from '../prompts/discuss-article-prompt.md?raw'

const favicon = d => `https://www.google.com/s2/favicons?domain=${d}&sz=64`
const BOTS = [
  { id: 'chatgpt',    label: 'ChatGPT',    icon: favicon('chatgpt.com'),       url: p => `https://chatgpt.com/?prompt=${p}&hints=search&utm_source=aiwithsayan` },
  { id: 'claude',     label: 'Claude',     icon: favicon('claude.ai'),         url: p => `https://claude.ai/new?q=${p}&utm_source=aiwithsayan` },
  { id: 'grok',       label: 'Grok',       icon: favicon('grok.com'),          url: p => `https://grok.com/?q=${p}&utm_source=aiwithsayan` },
  { id: 'perplexity', label: 'Perplexity', icon: favicon('perplexity.ai'),     url: p => `https://www.perplexity.ai/search?q=${p}&utm_source=aiwithsayan` },
  { id: 'googleai',   label: 'Google AI',  icon: favicon('gemini.google.com'), url: p => `https://www.google.com/search?udm=50&aep=11&q=${p}&utm_source=aiwithsayan` },
  { id: 'mistral',    label: 'Mistral',    icon: favicon('mistral.ai'),        url: p => `https://chat.mistral.ai/chat?q=${p}&utm_source=aiwithsayan` },
]

function TalkToAI({ slug, title }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const shareUrl = window.location.origin + '/post/' + slug + '/'
  const prompt = DISCUSS_PROMPT_TEMPLATE
    .replace('{{TITLE}}', title)
    .replace('{{ARTICLE_URL}}', shareUrl)
    .trim()

  useEffect(() => {
    function onDoc(e) { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  function launch(bot) {
    window.open(bot.url(encodeURIComponent(prompt)), '_blank', 'noopener')
    setOpen(false)
  }

  return (
    <div className="talk-ai-wrap" ref={wrapRef}>
      <button className="talk-ai-btn" onClick={() => setOpen(v => !v)}>
        ✨ discuss this article
      </button>
      {open && (
        <div className="talk-ai-menu">
          <div className="talk-ai-label">discuss with</div>
          {BOTS.map(bot => (
            <button key={bot.id} className="cp-bot-card" onClick={() => launch(bot)}>
              <img className="cp-bot-avatar" src={bot.icon} alt={bot.label} />
              <span className="cp-bot-name">{bot.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const HASHTAG_RE = /^(#\w+\s*)+$/

function PdfSlide({ pdfDoc, pageNum }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !pdfDoc || !canvasRef.current) return
    let cancelled = false
    async function render() {
      try {
        const page = await pdfDoc.getPage(pageNum)
        if (cancelled || !canvasRef.current) return
        const canvas = canvasRef.current
        const DPR = Math.min(window.devicePixelRatio || 1, 2)
        const maxW = wrapRef.current ? wrapRef.current.clientWidth : 680
        const baseVP = page.getViewport({ scale: 1 })
        const vp = page.getViewport({ scale: (maxW / baseVP.width) * DPR })
        canvas.width = vp.width
        canvas.height = vp.height
        canvas.style.width = `${Math.round(vp.width / DPR)}px`
        canvas.style.height = `${Math.round(vp.height / DPR)}px`
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
        if (!cancelled) setLoaded(true)
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') console.error(e)
      }
    }
    render()
    return () => { cancelled = true }
  }, [visible, pdfDoc, pageNum])

  return (
    <div className="pdf-slide-inline" ref={wrapRef}>
      {!loaded && (
        <div className="pdf-slide-spinner">
          <div className="pdf-spinner-ring" />
        </div>
      )}
      <canvas ref={canvasRef} style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }} />
    </div>
  )
}

export default function ArticlePage({ post, globalIdx, onBack, onFilterTag }) {
  const { slug, title, date, description } = post
  const [sections, setSections] = useState(null)
  const [hashtagRows, setHashtagRows] = useState([])
  const [tags, setTags] = useState(post.tags || [])
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pdfPageCount, setPdfPageCount] = useState(0)
  const [error, setError] = useState(false)

  const dateStr = date ? formatDate(date) : ''

  useEffect(() => {
    fetch(`/content-lab/${slug}/article.md`)
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(md => {
        const stripped = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
        const html = marked.parse(stripped)
        const div = document.createElement('div')
        div.innerHTML = html

        const foundTags = []
        const foundHashtagRows = []
        div.querySelectorAll('p').forEach(p => {
          const txt = p.textContent.trim()
          if (HASHTAG_RE.test(txt)) {
            const tagList = txt.split(/\s+/).filter(Boolean)
            foundTags.push(...tagList.slice(0, 5).map(t => t.replace('#', '')))
            foundHashtagRows.push(tagList)
            p.remove()
          }
        })

        if (foundTags.length > 0) {
          setTags(foundTags.slice(0, 5))
          post.tags = foundTags
          window.__rebuildSearchFuse?.()
        }
        setHashtagRows(foundHashtagRows)

        // Each --- in the markdown becomes a slide boundary
        const parts = div.innerHTML.split(/<hr\s*\/?>/)
        setSections(parts.filter(p => p.trim()))
      })
      .catch(() => setError(true))
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false
    pdfjsLib.getDocument(`/content-lab/${slug}/artifact.pdf`).promise
      .then(pdf => {
        if (cancelled) return
        setPdfDoc(pdf)
        setPdfPageCount(pdf.numPages)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [slug])

  function handleTagClick(tag) {
    onBack()
    onFilterTag?.(tag)
  }

  return (
    <article className="article-page">
      <button className="art-back-btn" onClick={onBack}>← All articles</button>

      <div className="art-header">
        <div className="art-actions">
          <TalkToAI slug={slug} title={title} />
          <ShareMenu slug={slug} title={title} />
        </div>
        <div className="art-meta-row">
          <div className="art-num">{String(globalIdx).padStart(2, '0')}</div>
          {dateStr && (
            <>
              <span className="art-meta-sep">·</span>
              <div className="art-date">{dateStr}</div>
            </>
          )}
        </div>
        <div className="art-tags">
          {tags.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="atag-dash">—</span>}
              <span className="atag" onClick={() => handleTagClick(tag)}>{tag}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="art-title">{title}</h1>
        {description && <p className="art-desc">{description}</p>}
      </div>

      <div className="art-body">
        {error ? (
          <p style={{ color: 'var(--text3)', fontFamily: 'monospace', fontSize: '.85rem' }}>
            content unavailable
          </p>
        ) : sections === null ? (
          <>
            <div className="skel" />
            <div className="skel" style={{ width: '88%' }} />
            <div className="skel" style={{ width: '72%' }} />
            <div className="skel" />
            <div className="skel" style={{ width: '82%' }} />
          </>
        ) : (
          <>
            {sections.map((html, i) => (
              <React.Fragment key={i}>
                <div dangerouslySetInnerHTML={{ __html: html }} />
                {pdfDoc && i < pdfPageCount && (
                  <PdfSlide pdfDoc={pdfDoc} pageNum={i + 1} />
                )}
              </React.Fragment>
            ))}
            {pdfDoc && pdfPageCount > sections.length && (
              Array.from({ length: pdfPageCount - sections.length }, (_, i) => (
                <PdfSlide key={`tail-${i}`} pdfDoc={pdfDoc} pageNum={sections.length + i + 1} />
              ))
            )}
            {hashtagRows.map((tagList, ri) => (
              <div key={ri} className="hashtag-row">
                {tagList.map(t => {
                  const word = t.replace('#', '')
                  return (
                    <span key={t} className="htag" onClick={() => handleTagClick(word)}>
                      {t}
                    </span>
                  )
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </article>
  )
}
