import React from 'react'

export default function CabinetHeader({ oxygen }) {
  const powerLedStyle = {
    backgroundColor: oxygen < 35 ? '#ffcc00' : '#ff3b30',
    boxShadow: oxygen < 35 ? '0 0 8px #ffcc00' : '0 0 8px #ff3b30',
  }

  return (
    <div className="cabinet-header">
      <div className="speaker-grille">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <div className="brand-badge">NAUTILUS 6400</div>
      <div className="power-led-group">
        <div className="power-led" id="power-indicator" style={powerLedStyle}></div>
        <span className="led-label">POWER</span>
      </div>
    </div>
  )
}
