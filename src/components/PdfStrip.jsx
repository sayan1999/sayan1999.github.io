import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

function SlideModal({ pdfRef, totalPages, initialPage, onClose }) {
  const canvasRef = useRef(null)
  const [page, setPage] = useState(initialPage)
  const [rendering, setRendering] = useState(false)
  const renderTaskRef = useRef(null)

  const renderPage = useCallback(async (pageNum) => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    setRendering(true)
    const p = await pdf.getPage(pageNum)
    const DPR = Math.min(window.devicePixelRatio || 1, 3)
    const maxW = Math.min(window.innerWidth * 0.9, 540)
    const vp = p.getViewport({ scale: (maxW / p.getViewport({ scale: 1 }).width) * DPR })
    canvas.width = vp.width
    canvas.height = vp.height
    canvas.style.width = `${Math.round(vp.width / DPR)}px`
    canvas.style.height = `${Math.round(vp.height / DPR)}px`
    const task = p.render({ canvasContext: canvas.getContext('2d'), viewport: vp })
    renderTaskRef.current = task
    try {
      await task.promise
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e)
    }
    setRendering(false)
  }, [pdfRef])

  useEffect(() => { renderPage(page) }, [page, renderPage])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setPage(p => Math.min(p + 1, totalPages))
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setPage(p => Math.max(p - 1, 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, totalPages])

  const touchRef = useRef({ startX: 0, startY: 0 })

  function onTouchStart(e) {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY }
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX
    const dy = e.changedTouches[0].clientY - touchRef.current.startY
    if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) setPage(p => Math.min(p + 1, totalPages))
    else setPage(p => Math.max(p - 1, 1))
  }

  return (
    <div className="slide-modal-backdrop" onClick={onClose}>
      <div className="slide-modal" onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button className="slide-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="slide-modal-canvas-wrap">
          {rendering && <div className="slide-modal-spinner" />}
          <canvas ref={canvasRef} />
        </div>
        <div className="slide-modal-nav">
          <button
            className="slide-modal-btn"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >&#8249;</button>
          <span className="slide-modal-counter">{page} / {totalPages}</span>
          <button
            className="slide-modal-btn"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
          >&#8250;</button>
        </div>
      </div>
    </div>
  )
}

export default function PdfStrip({ slug }) {
  const trackRef = useRef(null)
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const pdfRef = useRef(null)
  const [slideCount, setSlideCount] = useState(null)
  const [error, setError] = useState(false)
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)
  const [modalPage, setModalPage] = useState(null)

  const dragRef = useRef({ down: false, startX: 0, scrollX: 0, moved: false })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let cancelled = false

    async function load() {
      try {
        const pdf = await pdfjsLib.getDocument(`/content-lab/${slug}/artifact.pdf`).promise
        if (cancelled) return
        pdfRef.current = pdf

        const n = pdf.numPages
        setSlideCount(n)
        setNextDisabled(false)

        track.innerHTML = ''

        const DPR = Math.min(window.devicePixelRatio || 1, 3)
        const isMobile = window.innerWidth <= 640
        const CARD_W = isMobile
          ? Math.min(300, Math.max(220, window.innerWidth * 0.68))
          : Math.min(400, Math.max(280, window.innerWidth * 0.30))
        const firstPage = await pdf.getPage(1)
        if (cancelled) return
        const baseVP = firstPage.getViewport({ scale: 1 })
        const SCALE = (CARD_W / baseVP.width) * DPR

        const renderJobs = []
        for (let p = 1; p <= n; p++) {
          const card = document.createElement('div')
          card.className = 'slide-card'
          card.style.cursor = 'zoom-in'
          const num = document.createElement('span')
          num.className = 'slide-card-num'
          num.textContent = String(p).padStart(2, '0')
          const canvas = document.createElement('canvas')
          card.appendChild(canvas)
          card.appendChild(num)
          track.appendChild(card)

          const pageNum = p
          card.addEventListener('click', () => {
            if (dragRef.current.moved) return
            setModalPage(pageNum)
          })

          renderJobs.push({ pdf, p, canvas, scale: SCALE, dpr: DPR })
        }

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

  function onMouseDown(e) {
    const track = trackRef.current
    if (!track) return
    dragRef.current = { down: true, startX: e.pageX, scrollX: track.scrollLeft, moved: false }
    track.classList.add('grabbing')
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragRef.current.down) return
      const track = trackRef.current
      if (!track) return
      const dx = e.pageX - dragRef.current.startX
      if (Math.abs(dx) > 4) dragRef.current.moved = true
      track.scrollLeft = dragRef.current.scrollX - dx
    }
    function onMouseUp() {
      dragRef.current.down = false
      trackRef.current?.classList.remove('grabbing')
      setTimeout(() => { dragRef.current.moved = false }, 50)
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
    <>
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

      {modalPage !== null && (
        <SlideModal
          pdfRef={pdfRef}
          totalPages={slideCount}
          initialPage={modalPage}
          onClose={() => setModalPage(null)}
        />
      )}
    </>
  )
}
