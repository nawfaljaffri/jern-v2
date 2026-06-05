'use client'

import React, { useRef } from 'react'
import Sticker from '@/components/ui/Sticker'
import AsciiCanvas from '@/components/AsciiCanvas'

export default function EditorialHero() {
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={heroRef}
      className="relative"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
      }}
    >
      {/* ── Ink Bleed Filter ── */}
      <svg style={{ width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="ink-bleed">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blurred" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feDisplacementMap in="blurred" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feComponentTransfer in="displaced">
              <feFuncA type="linear" slope="5" intercept="-1.5" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* ── Left Side: Live WebGL ASCII Canvas ── */}
        <div
          style={{
            width: '50%',
            height: '100%',
            backgroundColor: '#1A1A1A',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '2rem',
          }}
        >
          {/* Archived for now as requested:
          <AsciiCanvas />
          */}

          {/* ── Scroll Indicator ── */}
          <div 
            className="flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity animate-bounce"
            style={{ 
              color: 'white',
              fontFamily: "'Helvetica Neue', 'Arial Narrow', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            <span>Scroll to explore</span>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
        </div>

      {/* ── Right Side: Navigation & Stretched Typography ("Inverted L") ── */}
      <div
        style={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navigation Area - Transparent, showing #1A1A1A */}
        <div 
          style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '20px',
            position: 'relative',
            zIndex: 100, // Ensure nav is clickable
          }}
        >
          <nav
            style={{
              color: 'white',
              fontFamily: "'Helvetica Neue', 'Arial Narrow', sans-serif",
            }}
          >
            <div 
              className="flex gap-4 md:gap-6 tracking-tighter font-bold"
              style={{
                fontSize: '1.25rem', // Enlarged text
                transform: 'scaleY(2.2) scaleX(0.9)',
                transformOrigin: 'right center',
                filter: 'url(#ink-bleed)',
              }}
            >
              <a href="#" className="hover:opacity-60 transition-opacity">home</a>
              <a href="#projects" className="hover:opacity-60 transition-opacity">artworks</a>
              <a href="/coding" className="hover:opacity-60 transition-opacity">coding</a>
              <a href="#education" className="hover:opacity-60 transition-opacity">education</a>
              <a href="#projects" className="hover:opacity-60 transition-opacity">work</a>
              <a href="#cv" className="hover:opacity-60 transition-opacity">cv</a>
              <a href="#about" className="hover:opacity-60 transition-opacity">about</a>
            </div>
          </nav>
        </div>

        {/* White Box with SVG Typography */}
        <div
          style={{
            flex: 1,
            position: 'relative', 
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            height: '100%', 
            minHeight: 'calc(100vh - 60px)',
          }}
        >
          {/* 
            SOLUTION A (VECTOR PATH NUKE): 
            Bypassing all OS-level font rendering and Safari WebKit text clipping bugs 
            by using pure mathematical geometry. These paths exactly bound 0 to 590 (X) 
            and 0 to 100 (Y). 
          */}
          <svg 
            preserveAspectRatio="none"
            viewBox="7.47 38.48 462.06 71.58" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              display: 'block',
            }}
          >
            <path 
              fill="#1A1A1A" 
              fillRule="evenodd" 
              d="M7.47 110.06L7.47 38.48L28.13 38.48L55.08 78.08L55.08 38.48L75.93 38.48L75.93 110.06L55.08 110.06L28.27 70.75L28.27 110.06L7.47 110.06ZM138.18 110.06L134.67 98.24L109.47 98.24L106.01 110.06L83.40 110.06L110.30 38.48L134.42 38.48L161.33 110.06L138.18 110.06ZM114.26 82.76L130.03 82.76L122.12 57.03L114.26 82.76ZM176.95 110.06L161.04 38.48L182.03 38.48L189.60 78.47L200.63 38.48L221.58 38.48L232.67 78.47L240.23 38.48L261.13 38.48L245.36 110.06L223.68 110.06L211.13 64.99L198.63 110.06L176.95 110.06ZM268.51 110.06L268.51 38.48L323.19 38.48L323.19 53.86L290.72 53.86L290.72 66.36L318.46 66.36L318.46 80.81L290.72 80.81L290.72 110.06L268.51 110.06ZM382.67 110.06L379.15 98.24L353.96 98.24L350.49 110.06L327.88 110.06L354.79 38.48L378.91 38.48L405.81 110.06L382.67 110.06ZM358.74 82.76L374.51 82.76L366.60 57.03L358.74 82.76ZM412.89 110.06L412.89 38.48L435.01 38.48L435.01 92.43L469.53 92.43L469.53 110.06L412.89 110.06Z"
            />
          </svg>

          {/* Render the <Sticker /> components HERE. */}
          <Sticker
            fillColor="#D94A4A" // Red
            rotation={-10}
            top="30%"
            left="10%"
            parentRef={heroRef}
          />
          <Sticker
            fillColor="#DDA0DD" // Pink
            rotation={15}
            top="15%"
            left="65%"
            parentRef={heroRef}
          />
          <Sticker
            fillColor="#4A76D2" // Blue
            rotation={-5}
            top="80%"
            left="40%"
            parentRef={heroRef}
          />
        </div>
      </div>
    </div>
  )
}






