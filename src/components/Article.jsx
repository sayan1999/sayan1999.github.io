import React from 'react'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Article({ post, globalIdx, onOpen, onFilterTag }) {
  const { title, date, description, tags = [] } = post
  const dateStr = date ? formatDate(date) : ''

  return (
    <div className="post-card" onClick={() => onOpen(post)}>
      <div className="post-card-meta">
        <span className="art-num">{String(globalIdx).padStart(2, '0')}</span>
        {dateStr && (
          <>
            <span className="art-meta-sep">·</span>
            <span className="art-date">{dateStr}</span>
          </>
        )}
      </div>
      {tags.length > 0 && (
        <div className="art-tags">
          {tags.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="atag-dash">—</span>}
              <span
                className="atag"
                onClick={e => { e.stopPropagation(); onFilterTag(tag) }}
              >{tag}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <h2 className="post-card-title">{title}</h2>
      {description && <p className="post-card-desc">{description}</p>}
      <span className="post-card-read">Read →</span>
    </div>
  )
}
