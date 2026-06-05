"use client"

import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
// @ts-ignore
import { CRTTerminal } from 'cool-retro-term-renderer'

interface TerminalProps {
  color?: string
}

export default function Terminal({ color = '#FFB000' }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const crtRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || !hiddenRef.current) return

    // Initialize the CRT renderer
    const crt = new CRTTerminal({
      container: containerRef.current,
      fontColor: color,
      backgroundColor: '#000000',
      screenCurvature: 0.2,
      bloom: 0.6,
      burnIn: 0.3,
      rasterizationMode: 1,
      rasterizationIntensity: 0.5,
      flickering: 0.05,
      horizontalSync: 0.05,
      staticNoise: 0.1,
    })
    
    crtRef.current = crt

    // Create and configure XTerm instance
    const xterm = new XTerm({
      cols: 90,
      rows: 28,
      cursorBlink: true,
    })
    
    xtermRef.current = xterm
    xterm.open(hiddenRef.current)
    
    // Sync XTerm size if CRT resizes
    const gridSize = crt.getTerminalText().getGridSize()
    if (gridSize.cols > 0 && gridSize.rows > 0) {
      xterm.resize(gridSize.cols, gridSize.rows)
    }
    crt.getTerminalText().onGridSizeChange((cols: number, rows: number) => {
      if (cols > 0 && rows > 0) xterm.resize(cols, rows)
    })

    // Attach XTerm to CRT
    crt.attachXTerm(xterm)
    
    // Initial Render Output
    xterm.write(`\x1b[38;2;${hexToRgb(color)}m`) // Set color
    xterm.write('┌────────────────────────────────────────────────────────┐\r\n')
    xterm.write('│                   SYSTEM INITIALIZED                   │\r\n')
    xterm.write('└────────────────────────────────────────────────────────┘\r\n')
    xterm.write('\r\n')
    xterm.write(`Profile loaded: ${color}\r\n`)
    xterm.write('Uptime: 00:00:14  Procs: 42\r\n\r\n')
    
    xterm.write('Projects:\r\n')
    xterm.write(' - neural-net-arch  [ONLINE]\r\n')
    xterm.write(' - portfolio-site   [ACTIVE]\r\n')
    xterm.write(' - noter-app        [DEPRECATED]\r\n\r\n')

    xterm.write('$ ')

    // Setup input handling
    xterm.onData((data) => {
      // Basic local echo for demonstration (no backspace handling for simplicity in demo)
      xterm.write(data)
    })

    return () => {
      xterm.dispose()
      crt.dispose()
    }
  }, [color])

  // Helper to convert hex to RGB for xterm ANSI colors
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? 
      `${parseInt(result[1], 16)};${parseInt(result[2], 16)};${parseInt(result[3], 16)}` 
      : '255;176;0'
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* The CRT canvas container */}
      <div ref={containerRef} className="w-full h-full max-w-[1280px] max-h-[800px] border border-white/5 rounded-2xl shadow-2xl overflow-hidden" />
      
      {/* Hidden container for XTerm inputs */}
      <div 
        ref={hiddenRef} 
        className="absolute left-[-9999px] top-[-9999px]" 
      />
    </div>
  )
}
