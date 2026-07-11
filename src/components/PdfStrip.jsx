import React, { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

export default function PdfStrip({ slug }) {
  const trackRef = useRef(null)
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const [slideCount, setSlideCount] = useState(null)
  const [error, setError] = useState(false)
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)

  // Drag-to-scroll state
  const dragRef = useRef({ down: false, startX: 0, scrollX: 0 })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let cancelled = false

    async function load() {
      try {
        const pdf = await pdfjsLib.getDocument(`/content-lab/${slug}/artifact.pdf`).promise
        if (cancelled) return

        const n = pdf.numPages
        setSlideCount(n)
        setNextDisabled(false)

        // Clear loading placeholder
        track.innerHTML = ''

        const DPR = Math.min(window.devicePixelRatio || 1, 3)
        const CARD_W = Math.min(400, Math.max(280, window.innerWidth * 0.30))
        const firstPage = await pdf.getPage(1)
        if (cancelled) return
        const baseVP = firstPage.getViewport({ scale: 1 })
        const SCALE = (CARD_W / baseVP.width) * DPR

        // Create DOM elements first
        const renderJobs = []
        for (let p = 1; p <= n; p++) {
          const card = document.createElement('div')
          card.className = 'slide-card'
          const num = document.createElement('span')
          num.className = 'slide-card-num'
          num.textContent = String(p).padStart(2, '0')
          const canvas = document.createElement('canvas')
          card.appendChild(canvas)
          card.appendChild(num)
          track.appendChild(card)
          renderJobs.push({ pdf, p, canvas, scale: SCALE, dpr: DPR })
        }

        // Fire all renders in parallel
        renderJobs.forEach(async ({ pdf, p, canvas, scale, dpr }) => {
          if (cancelled) return
          const page = await pdf.getPage(p)
          if (cancelled) return
          const vp = page.getViewport({ scale })
          canvas.width = vp.width
          canvas.height = vp.height
          canvas.style.width = `${Math.round(vp.width / dpr)}px`
          canvas.style.height = `${Math.round(vp.height / dpr)}px`
          page.render({ canvasContext: canvas.getContext('2d'), viewport: vp })
        })

      } catch (e) {
        if (!cancelled) setError(true)
      }
    }

    load()

    return () => { cancelled = true }
  }, [slug])

  function updateBtns() {
    const track = trackRef.current
    if (!track) return
    setPrevDisabled(track.scrollLeft <= 4)
    setNextDisabled(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4)
  }

  function scroll(dir) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.slide-card')
    const w = card ? card.offsetWidth + 10 : 270
    track.scrollBy({ left: dir * w * 2 })
    setTimeout(updateBtns, 350)
  }

  function onWheel(e) {
    const track = trackRef.current
    if (!track) return
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault()
      track.scrollBy({ left: e.shiftKey ? e.deltaY * 2 : e.deltaX * 2 })
      setTimeout(updateBtns, 100)
    }
  }

  // Drag-to-scroll handlers
  function onMouseDown(e) {
    const track = trackRef.current
    if (!track) return
    dragRef.current = { down: true, startX: e.pageX, scrollX: track.scrollLeft }
    track.classList.add('grabbing')
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragRef.current.down) return
      const track = trackRef.current
      if (!track) return
      track.scrollLeft = dragRef.current.scrollX - (e.pageX - dragRef.current.startX)
    }
    function onMouseUp() {
      dragRef.current.down = false
      trackRef.current?.classList.remove('grabbing')
    }
    const track = trackRef.current
    const handleWheel = (e) => onWheel(e)
    if (track) track.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      if (track) track.removeEventListener('wheel', handleWheel)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className="strip-section">
      <div className="strip-container">
        <button
          ref={prevRef}
          className="float-arrow float-arrow-l"
          onClick={() => scroll(-1)}
          disabled={prevDisabled}
        >
          &#8249;
        </button>
        <div
          ref={trackRef}
          className="strip-track"
          onMouseDown={onMouseDown}
          onScroll={updateBtns}
        >
          {error ? (
            <div className="slide-loading" style={{ animation: 'none', color: 'var(--text3)' }}>
              unavailable
            </div>
          ) : (
            <div className="slide-loading">rendering…</div>
          )}
        </div>
        <button
          ref={nextRef}
          className="float-arrow float-arrow-r"
          onClick={() => scroll(1)}
          disabled={nextDisabled}
        >
          &#8250;
        </button>
      </div>
    </div>
  )
}
