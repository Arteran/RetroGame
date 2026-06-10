import React from 'react'

export default function GameHUD({ score, depth, oxygen, lives }) {
  return (
    <div className="hud-panel">
      <div className="hud-row">
        <div className="hud-item" id="hud-depth">
          DEPTH: <span>{String(depth).padStart(4, '0')}</span>M
        </div>
        <div className="hud-item" id="hud-score">
          SCORE: <span>{String(score).padStart(5, '0')}</span>
        </div>
      </div>
      <div className="hud-row">
        <div className={`hud-item ${oxygen < 35 ? 'blink-text' : ''}`} id="hud-oxygen">
          OXY: <span>{oxygen}</span>%
        </div>
        <div className="hud-item" id="hud-lives">
          HP:{' '}
          {Array.from({ length: lives }).map((_, idx) => (
            <svg key={idx} className="pixel-heart" viewBox="0 0 8 8">
              <path d="M1,0 h2 v1 h-2 z M5,0 h2 v1 h-2 z M0,1 h8 v3 h-8 z M1,4 h6 v1 h-6 z M2,5 h4 v1 h-4 z M3,6 h2 v1 h-2 z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}
