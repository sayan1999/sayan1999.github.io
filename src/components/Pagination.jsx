import React from 'react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="page-nav">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← prev
      </button>
      <span className="page-info">page {page} / {totalPages}</span>
      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        next →
      </button>
    </div>
  )
}
