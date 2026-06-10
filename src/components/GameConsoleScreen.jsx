import React from 'react'
import GameHUD from './GameHUD'

export default function GameConsoleScreen({
  canvasRef,
  scrollViewportRef,
  screenContainerRef,
  formRef,
  score,
  depth,
  oxygen,
  lives,
  screenMode,
  terminalActive,
  scrollPercent,
  onSubmitScore,
}) {
  const getScreenFilter = () => {
    if (screenMode === 'green') return 'sepia(1) saturate(3) hue-rotate(90deg) contrast(1.1)'
    if (screenMode === 'amber') return 'sepia(1) saturate(4) hue-rotate(5deg) contrast(1.2)'
    return 'none'
  }

  const getScreenBgColor = () => {
    // Surface: `#1b4d40` (27, 77, 64) -> Abyss: `#040810` (4, 8, 16)
    const r = Math.round(27 - (27 - 4) * scrollPercent)
    const g = Math.round(77 - (77 - 8) * scrollPercent)
    const b = Math.round(64 - (64 - 16) * scrollPercent)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div
      id="screen-container"
      ref={screenContainerRef}
      style={{
        backgroundColor: getScreenBgColor(),
        filter: getScreenFilter(),
      }}
    >
      {/* CRT Screen Bezel Shadow & Glare */}
      <div className="screen-glare"></div>
      <div className="screen-scanlines"></div>

      {/* HUD overlay */}
      <GameHUD score={score} depth={depth} oxygen={oxygen} lives={lives} />

      {/* Three.js Canvas Container */}
      <div id="canvas-container">
        <canvas ref={canvasRef} id="bg"></canvas>
      </div>

      {/* Scrollable Content Viewport */}
      <div className="screen-scroll-container" id="scroll-viewport" ref={scrollViewportRef}>
        
        {/* Stage 1: Sunlit Shallows (0m - 1000m) */}
        <section className="screen-section" id="stage-shallows">
          <div className="section-glitch-title">AQUA QUEST</div>
          <div className="section-subtitle">SPECIMEN-402 PROTOCOL</div>
          
          <div className="console-box">
            <p className="status-ok">&gt; SYSTEM BOOT: OK</p>
            <p className="status-ok">&gt; CLOWNFISH LOCATED IN SUB-VECTOR</p>
            <p className="status-text">&gt; INSTRUCTION: SPECIMEN TRACKS KINETIC INPUTS. MOVE YOUR CURSOR ACROSS THE SCREEN SCREEN TO ATTRACT THE SPECIMEN.</p>
          </div>

          <div className="scroll-prompt">
            <span className="blink-text">▼ ROLL WHEEL TO DIVE ▼</span>
          </div>
        </section>

        {/* Stage 2: Twilight Stratum (1000m - 3000m) */}
        <section className="screen-section" id="stage-twilight">
          <div className="stage-tag">STAGE 02</div>
          <h2 className="section-title">TWILIGHT ZONE</h2>
          <div className="console-box warning">
            <p className="status-warn">&gt; WARNING: SOLAR RADIANCE &lt; 1.0%</p>
            <p className="status-text">&gt; SPECIMEN METABOLISM DETECTED.</p>
            <p className="status-text">&gt; DEPTH INCREASING. HYDROSTATIC PRESSURE LEVELS INTENSIFYING.</p>
          </div>
          
          <div className="info-grid">
            <div className="info-card">
              <h3>CLAW VECTOR</h3>
              <p>SPECIMEN-402 IS DYNAMICALLY ANIMATED. KEYBOARD OVERRIDES ALLOW ANIMATION SWITCHES: 1 (SWIM), 2 (BITE), 3 (IDLE).</p>
            </div>
            <div className="info-card">
              <h3>DEEP METRICS</h3>
              <p>AMBIENT LIGHTING DIMINISHES PROPORTIONALLY WITH EXPEDITION DEPTH. KEEP EXPEDITION ACTIVE.</p>
            </div>
          </div>
        </section>

        {/* Stage 3: Abyssal Plain (3000m - 4000m) */}
        <section className="screen-section" id="stage-abyss">
          <div className="stage-tag">STAGE 03</div>
          <h2 className="section-title">ABYSSAL FLOOR</h2>
          
          <div className="console-box danger">
            <p className="status-danger">&gt; CRITICAL DEPTH REACHED: 4000M</p>
            <p className="status-danger">&gt; ANOMALY LOCKBOX REVEALED ON SEA FLOOR</p>
            <p className="status-text">&gt; ACTION REQUIRED: CLICK LOCKBOX TO DISPENSE SPECIMEN FEED STIMULANT.</p>
          </div>

          {/* Secret Terminal (Transmission Form) */}
          <div className={`transmission-terminal ${terminalActive ? 'active' : ''}`} id="terminal-form">
            <div className="terminal-header">
              <span>NEW HIGH SCORE! TRANSMIT DATA</span>
            </div>
            <form id="expedition-form" ref={formRef} onSubmit={onSubmitScore}>
              <div className="form-group">
                <label htmlFor="explorer-name">&gt; EXPLORER CALLSIGN:</label>
                <input type="text" id="explorer-name" required placeholder="E.G. NEMO_01" autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="explorer-freq">&gt; FREQUENCY (EMAIL):</label>
                <input type="email" id="explorer-freq" required placeholder="EXPLORER@SURFACE.NET" autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="explorer-log">&gt; LOG DATA (MESSAGE):</label>
                <textarea id="explorer-log" required placeholder="REPORT YOUR DISCOVERIES IN THE ABYSS..." rows={3}></textarea>
              </div>
              <button type="submit" className="arcade-btn-submit">TRANSMIT TRANSCRIPTS</button>
            </form>
          </div>

          <div className="scroll-spacer"></div>
        </section>

      </div>
    </div>
  )
}
