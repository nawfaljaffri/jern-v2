'use client'

import React from 'react'

/**
 * Scattered squares inspired by The 1975 "I Like It When You Sleep" album cover.
 * Colors matched from the actual cover art:
 * - Dark navy/black squares
 * - Cyan/teal
 * - Red/magenta
 * - Lime/green
 * - Yellow
 * - Pink/salmon
 */

const SQUARES = [
  // Cluster top-left area
  { top: '8%', left: '6%', color: '#1a1a2e' },
  { top: '12%', left: '14%', color: '#00CED1' },
  { top: '5%', left: '22%', color: '#FF1493' },
  { top: '18%', left: '8%', color: '#32CD32' },
  { top: '15%', left: '25%', color: '#FFD700' },
  
  // Scattered mid-left
  { top: '28%', left: '3%', color: '#32CD32' },
  { top: '35%', left: '11%', color: '#FFD700' },
  { top: '42%', left: '6%', color: '#FF1493' },
  { top: '30%', left: '18%', color: '#00CED1' },
  
  // Top-right cluster
  { top: '6%', left: '78%', color: '#FF6B6B' },
  { top: '10%', left: '85%', color: '#00CED1' },
  { top: '14%', left: '92%', color: '#1a1a2e' },
  { top: '8%', left: '95%', color: '#FFD700' },
  { top: '20%', left: '82%', color: '#32CD32' },
  
  // Mid-right
  { top: '42%', left: '88%', color: '#FF1493' },
  { top: '38%', left: '94%', color: '#32CD32' },
  { top: '48%', left: '80%', color: '#1a1a2e' },
  { top: '32%', left: '76%', color: '#FFD700' },
  
  // Center area — sparse
  { top: '22%', left: '52%', color: '#FFD700' },
  { top: '55%', left: '45%', color: '#1a1a2e' },
  { top: '48%', left: '62%', color: '#00CED1' },
  { top: '38%', left: '38%', color: '#FF6B6B' },
  { top: '15%', left: '48%', color: '#FF1493' },
  
  // Lower left
  { top: '65%', left: '8%', color: '#FF6B6B' },
  { top: '72%', left: '15%', color: '#FFD700' },
  { top: '68%', left: '25%', color: '#1a1a2e' },
  { top: '82%', left: '5%', color: '#00CED1' },
  { top: '78%', left: '20%', color: '#FF1493' },
  
  // Lower right cluster
  { top: '75%', left: '82%', color: '#32CD32' },
  { top: '70%', left: '90%', color: '#FF1493' },
  { top: '80%', left: '76%', color: '#00CED1' },
  { top: '85%', left: '88%', color: '#FFD700' },
  { top: '68%', left: '95%', color: '#1a1a2e' },
  
  // Bottom scattered
  { top: '88%', left: '35%', color: '#1a1a2e' },
  { top: '92%', left: '55%', color: '#FFD700' },
  { top: '85%', left: '65%', color: '#FF6B6B' },
  { top: '95%', left: '42%', color: '#32CD32' },
  { top: '88%', left: '72%', color: '#00CED1' },
]

export default function ScatteredSquares() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {SQUARES.map((sq, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: sq.top,
            left: sq.left,
            width: '7px',
            height: '7px',
            backgroundColor: sq.color,
          }}
        />
      ))}
    </div>
  )
}
