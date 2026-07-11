import React, { useState, useRef } from 'react'
import SYSTEM_PROMPT_TEMPLATE from '../prompts/system-prompt.md?raw'

const favicon = domain => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

const BOTS = [
  { id: 'chatgpt',    label: 'ChatGPT',    bg: '#10a37f', fg: '#fff', icon: favicon('chatgpt.com'),        url: p => `https://chatgpt.com/?prompt=${p}&hints=search` },
  { id: 'grok',       label: 'Grok',       bg: '#e8e8e8', fg: '#111', icon: favicon('grok.com'),           url: p => `https://grok.com/?q=${p}` },
  { id: 'perplexity', label: 'Perplexity', bg: '#1fb8cd', fg: '#fff', icon: favicon('perplexity.ai'),      url: p => `https://www.perplexity.ai/search?q=${p}` },
  { id: 'claude',     label: 'Claude',     bg: '#d97757', fg: '#fff', icon: favicon('claude.ai'),          url: p => `https://claude.ai/new?q=${p}` },
  { id: 'googleai',   label: 'Google AI',  bg: '#4285f4', fg: '#fff', icon: favicon('gemini.google.com'),  url: p => `https://www.google.com/search?udm=50&aep=11&q=${p}` },
  { id: 'mistral',    label: 'Mistral',    bg: '#fa6400', fg: '#fff', icon: favicon('mistral.ai'),         url: p => `https://chat.mistral.ai/chat?q=${p}` },
]

function buildPrompt(allPosts, userQuery) {
  const articleList = allPosts
    .map((p, i) => `${i + 1}. **${p.title}** (${p.date}) — ${p.description}`)
    .join('\n')

  return SYSTEM_PROMPT_TEMPLATE
    .replace('{{ARTICLE_LIST}}', articleList)
    .replace('{{USER_QUERY}}', userQuery)
}

export default function AskAI({ allPosts = [] }) {
  const [prompt, setPrompt] = useState('')
  const inputRef = useRef(null)

  const showBots = prompt.trim().length > 0

  const launch = bot => {
    const full = buildPrompt(allPosts, prompt)
    window.open(bot.url(encodeURIComponent(full)), '_blank', 'noopener')
  }

  return (
    <div className="chai-section">
      <div className="chai-bar">
        <input
          ref={inputRef}
          className="chai-input"
          type="text"
          placeholder="Ask AI..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <span className="chai-ask-label">✦ ASK AI</span>
      </div>

      {showBots && (
        <div className="chai-bots">
          {BOTS.map(bot => (
            <button
              key={bot.id}
              className="chai-bot-card"
              onClick={() => launch(bot)}
              style={{ '--bot-bg': bot.bg, '--bot-fg': bot.fg }}
            >
              <img className="chai-bot-avatar" src={bot.icon} alt={bot.label} />
              <span className="chai-bot-name">{bot.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
