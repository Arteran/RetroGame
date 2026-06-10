import React from 'react'

export default function GameHUD({ score, depth, oxygen, lives }) {
  return (
    <div className="hud-panel">
      <div className="hud-row-top">
        <div className="hud-item" id="hud-depth">
          DEPTH: <span>{String(depth).padStart(4, '0')}</span>M
        </div>
        <div className={`hud-item ${oxygen < 35 ? 'blink-text' : ''}`} id="hud-oxygen">
          OXY: <span>{oxygen}</span>%
        </div>
        <div className="hud-item" id="hud-score">
          SCORE: <span>{String(score).padStart(5, '0')}</span>
        </div>
      </div>
      <div className="hud-row-bottom">
        <div className="hud-item" id="hud-lives">
          HP:{' '}
          {Array.from({ length: lives }).map((_, idx) => (
            <span key={idx} className="heart">❤️</span>
          ))}
        </div>
      </div>
    </div>
  )
}
