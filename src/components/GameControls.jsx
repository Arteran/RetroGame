import React from 'react'

export default function GameControls({
  onDpadClick,
  onSelectClick,
  onStartClick,
  onBtnAClick,
  onBtnBClick
}) {
  return (
    <div className="cabinet-controls">
      {/* Left: D-Pad Control */}
      <div className="dpad-container">
        <div className="dpad">
          <div className="dpad-button up" id="dpad-up" onClick={() => onDpadClick('up')}></div>
          <div className="dpad-button left" id="dpad-left" onClick={() => onDpadClick('left')}></div>
          <div className="dpad-button center"></div>
          <div className="dpad-button right" id="dpad-right" onClick={() => onDpadClick('right')}></div>
          <div className="dpad-button down" id="dpad-down" onClick={() => onDpadClick('down')}></div>
        </div>
        <span className="control-label">D-PAD VIEW</span>
      </div>

      {/* Center: Select/Start Buttons */}
      <div className="center-buttons">
        <div className="select-start-group">
          <div className="pill-button" id="select-btn" onClick={onSelectClick}></div>
          <div className="pill-button" id="start-btn" onClick={onStartClick}></div>
        </div>
        <div className="pill-labels">
          <span>SELECT</span>
          <span>START</span>
        </div>
      </div>

      {/* Right: A/B Action Buttons */}
      <div className="action-buttons">
        <div className="action-btn-group">
          <div className="round-button btn-b" id="btn-b" onClick={onBtnBClick}>
            <span className="btn-letter">B</span>
          </div>
          <div className="round-button btn-a" id="btn-a" onClick={onBtnAClick}>
            <span className="btn-letter">A</span>
          </div>
        </div>
        <span className="control-label font-arcade">ACTIONS</span>
      </div>
    </div>
  )
}
