import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { initGame } from './gameEngine'
import CabinetHeader from './components/CabinetHeader'
import CabinetFooter from './components/CabinetFooter'
import GameControls from './components/GameControls'
import GameConsoleScreen from './components/GameConsoleScreen'

export default function App() {
  const [score, setScore] = useState(0)
  const [depth, setDepth] = useState(0)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [oxygen, setOxygen] = useState(99)
  const [lives, setLives] = useState(3)
  const [screenMode, setScreenMode] = useState('standard') // 'standard', 'green', 'amber'
  const [terminalActive, setTerminalActive] = useState(false)

  const canvasRef = useRef(null)
  const scrollViewportRef = useRef(null)
  const screenContainerRef = useRef(null)
  const formRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current && scrollViewportRef.current && screenContainerRef.current) {
      const engine = initGame(
        canvasRef.current,
        scrollViewportRef.current,
        screenContainerRef.current,
        {
          onScoreChange: (newScore) => setScore(newScore),
          onDepthChange: (newDepth, percent) => {
            setDepth(newDepth)
            setScrollPercent(percent)
          },
          onShowTerminal: () => setTerminalActive(true),
        }
      )
      engineRef.current = engine

      return () => {
        if (engine) {
          engine.destroy()
        }
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setOxygen((prev) => {
        const delta = Math.random() > 0.4 ? -1 : 1
        return Math.max(10, Math.min(99, prev + delta))
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])


  const handleDpadClick = (dir) => {
    if (engineRef.current) {
      engineRef.current.applyNudge(dir)
    }
  }

  const handleSelectBtn = () => {
    gsap.fromTo('#select-btn', { scaleY: 0.8 }, { scaleY: 1, duration: 0.1 })
    setScreenMode((prev) => {
      if (prev === 'standard') return 'green'
      if (prev === 'green') return 'amber'
      return 'standard'
    })
  }

  const handleStartBtn = () => {
    gsap.fromTo('#start-btn', { scaleY: 0.8 }, { scaleY: 1, duration: 0.1 })
    
    gsap.fromTo('.screen-scanlines',
      { opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.4)' },
      { opacity: 1, backgroundColor: 'transparent', duration: 0.3 }
    )
    
    setScore(0)
    setTerminalActive(false)
    setOxygen(99)
    if (formRef.current) {
      formRef.current.reset()
    }
    
    if (engineRef.current) {
      engineRef.current.resetGame()
    }

    if (scrollViewportRef.current) {
      gsap.to(scrollViewportRef.current, { scrollTop: 0, duration: 1.5, ease: "power2.inOut" })
    }
  }

  const handleBtnA = useCallback(() => {
    gsap.fromTo('#btn-a', { scale: 0.9 }, { scale: 1, duration: 0.1 })
    if (engineRef.current) {
      engineRef.current.triggerBite()
    }
  }, [])

  const handleBtnB = useCallback(() => {
    gsap.fromTo('#btn-b', { scale: 0.9 }, { scale: 1, duration: 0.1 })
    if (engineRef.current) {
      engineRef.current.triggerBarrelRoll()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
         document.activeElement.tagName === 'TEXTAREA')
      ) {
        return
      }

      if (e.key === '1') {
        handleBtnA()
      } else if (e.key === '2') {
        handleBtnB()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBtnA, handleBtnB])

  const handleSubmitScore = (e) => {
    e.preventDefault()
    alert('Transmission Sent to Surface!')
  }

  return (
    <div id="arcade-cabinet">
      <CabinetHeader oxygen={oxygen} />
      
      <GameConsoleScreen
        canvasRef={canvasRef}
        scrollViewportRef={scrollViewportRef}
        screenContainerRef={screenContainerRef}
        formRef={formRef}
        score={score}
        depth={depth}
        oxygen={oxygen}
        lives={lives}
        screenMode={screenMode}
        terminalActive={terminalActive}
        scrollPercent={scrollPercent}
        onSubmitScore={handleSubmitScore}
      />

      <GameControls
        onDpadClick={handleDpadClick}
        onSelectClick={handleSelectBtn}
        onStartClick={handleStartBtn}
        onBtnAClick={handleBtnA}
        onBtnBClick={handleBtnB}
      />

      <CabinetFooter />
    </div>
  )
}
