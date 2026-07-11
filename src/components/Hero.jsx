import React from 'react'

export default function Hero() {
  return (
    <header className="site-hero">
      <div className="hero-eyebrow">@aiwithsayan</div>
      <h1 className="hero-title">AI System <em>Designs</em><br/>for Production</h1>
      <p className="hero-subtitle">Engineering playbooks for modern AI stacks.</p>
      <p className="hero-desc">
        Practical breakdowns of retrieval systems, evaluation mechanics, and autonomous agents.
        Focused strictly on system design, deterministic testing, and edge cases.
        Built for engineers moving models from prototype to production.
      </p>
      <div className="hero-divider"></div>
      <div className="hero-meta">
        <span>Sayan Dey</span>
        <span className="hero-sep">·</span>
        <a href="https://linkedin.com/in/sdey" target="_blank" rel="noopener">linkedin</a>
        <span className="hero-sep">·</span>
        <a href="https://github.com/sayan1999" target="_blank" rel="noopener">github</a>
      </div>
    </header>
  )
}
