import React, { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import PdfStrip from './PdfStrip'
import ShareMenu from './ShareMenu'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const HASHTAG_RE = /^(#\w+\s*)+$/

export default function Article({ post, idx, globalIdx, onFilterTag, scrollTarget }) {
  const { slug, title, date, description } = post
  const [tags, setTags] = useState([])
  const [bodyHtml, setBodyHtml] = useState(null)
  const [hashtagRows, setHashtagRows] = useState([])
  const [captionError, setCaptionError] = useState(false)
  const articleRef = useRef(null)

  const dateStr = date ? formatDate(date) : ''
  const postId = `post-${idx}`

  // Scroll to this article when it's the target
  useEffect(() => {
    if (scrollTarget === postId && articleRef.current) {
      let timer
      const ro = new ResizeObserver(() => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          ro.disconnect()
          articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
      })
      ro.observe(articleRef.current)
      // Hard fallback
      const fallback = setTimeout(() => {
        ro.disconnect()
        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 3000)
      return () => {
        ro.disconnect()
        clearTimeout(timer)
        clearTimeout(fallback)
      }
    }
  }, [scrollTarget, postId])

  useEffect(() => {
    fetch(`/content-lab/${slug}/article.md`)
      .then(r => { if (!r.ok) throw new Error('not ok'); return r.text() })
      .then(md => {
        const stripped = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
        const html = marked.parse(stripped)

        // Parse the HTML to extract hashtag paragraphs
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

        setTags(foundTags.slice(0, 5))
        setHashtagRows(foundHashtagRows)
        setBodyHtml(div.innerHTML)

        // Update the post object with tags so search can find them
        if (foundTags.length > 0) {
          post.tags = foundTags
          window.__rebuildSearchFuse?.()
        }
      })
      .catch(() => {
        setCaptionError(true)
      })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <article className="article" id={postId} ref={articleRef}>
      {/* Header */}
      <div className="art-header">
        <ShareMenu slug={slug} title={title} />
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
          {tags.length === 0 ? null : tags.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="atag-dash">—</span>}
              <span className="atag" onClick={() => onFilterTag(tag)}>{tag}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="art-title">{title}</h1>
        {description && <p className="art-desc">{description}</p>}
      </div>

      {/* PDF Carousel */}
      <PdfStrip slug={slug} />

      {/* Body */}
      <div className="art-body">
        {captionError ? (
          <p style={{ color: 'var(--text3)', fontFamily: 'monospace', fontSize: '.85rem' }}>
            caption unavailable
          </p>
        ) : bodyHtml === null ? (
          <>
            <div className="skel"></div>
            <div className="skel" style={{ width: '88%' }}></div>
            <div className="skel" style={{ width: '72%' }}></div>
            <div className="skel"></div>
            <div className="skel" style={{ width: '82%' }}></div>
          </>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            {hashtagRows.map((tagList, ri) => (
              <div key={ri} className="hashtag-row">
                {tagList.map(t => {
                  const word = t.replace('#', '')
                  return (
                    <span key={t} className="htag" onClick={() => onFilterTag(word)}>
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
