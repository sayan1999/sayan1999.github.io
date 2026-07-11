import React, { useEffect, useRef } from 'react'

export default function Sidebar({ posts, startIdx }) {
  const activeRef = useRef(null)

  useEffect(() => {
    if (posts.length === 0) return

    const articles = []
    for (let i = 1; i <= posts.length; i++) {
      const el = document.getElementById(`post-${i}`)
      if (el) articles.push(el)
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const localIdx = parseInt(e.target.id.replace('post-', ''), 10)
        document.querySelectorAll('.snav-item').forEach((a, j) => {
          a.classList.toggle('active', j + 1 === localIdx)
        })
      })
    }, { threshold: 0.15 })

    articles.forEach(a => obs.observe(a))
    return () => obs.disconnect()
  }, [posts])

  return (
    <nav className="sidenav">
      <span className="sidenav-handle">@aiwithsayan</span>
      <div className="snav-posts">
        {posts.map((post, i) => {
          const localIdx = i + 1
          const globalIdx = startIdx + i + 1
          return (
            <a
              key={post.slug}
              className="snav-item"
              id={`snav-${localIdx}`}
              href={`#post-${localIdx}`}
            >
              <span className="snav-num">{String(globalIdx).padStart(2, '0')}</span>
              <div className="snav-tick"></div>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
