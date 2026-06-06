'use client'

import React, { useRef } from 'react'
import Sticker from '@/components/ui/Sticker'

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
      {/* ── Global SVG Filters ── */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="ink-bleed">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blurred" />
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feDisplacementMap in="blurred" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feComponentTransfer in="displaced">
              <feFuncA type="linear" slope="5" intercept="-1.5" />
            </feComponentTransfer>
          </filter>
          <filter id="ink-bleed-sm">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="blurred" />
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feDisplacementMap in="blurred" in2="noise" scale="1.0" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feComponentTransfer in="displaced">
              <feFuncA type="linear" slope="5" intercept="-1.5" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* ── Left Side: Pure Editorial Spread ── */}
      <div
        style={{
          width: '50%',
          height: '100%',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', 
          padding: '4vw',
          fontFamily: "'Helvetica Neue', 'Inter', 'Arial', sans-serif",
        }}
      >
        {/* HEADER SECTION */}
        <div>
          <div style={{ fontSize: '1vw', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1vw', marginBottom: '2vw' }}>
            CONTENTS
          </div>
          
          <div style={{ fontSize: '0.85vw', opacity: 0.5, marginBottom: '1vw', letterSpacing: '0.1em' }}>
            [ PAGE 01 // OVERVIEW ]
          </div>
          
          <div style={{ 
            fontSize: '5vw', 
            fontWeight: 800, 
            lineHeight: 0.9, 
            letterSpacing: '-0.03em', 
            marginBottom: '1.5vw',
            textAlign: 'justify',
            textAlignLast: 'justify',
            width: '100%'
          }}>
            NAWFAL JAFFRI
          </div>
          
          <div style={{ 
            fontSize: '1.3vw', 
            lineHeight: 1.5, 
            fontWeight: 400, 
            opacity: 0.8,
            textAlign: 'justify' 
          }}>
            Multidisciplinary Creative & Computer Scientist.<br/>
            Currently blending algorithmic logic with editorial aesthetics.
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3vw' }}>
          <div>
            <div style={{ fontSize: '0.85vw', opacity: 0.5, letterSpacing: '0.1em' }}>
              [ SELECTED WORKS ]
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85vw', opacity: 0.5, marginBottom: '1.5vw', letterSpacing: '0.1em' }}>
              [ ARCHIVE ]
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw', fontSize: '1.2vw' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5vw' }}>
                <span style={{ fontWeight: 600 }}>04. ARTWORKS</span>
                <span style={{ opacity: 0.6, fontSize: '1vw' }}>Poster Collection & Graphic Design.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5vw' }}>
                <span style={{ fontWeight: 600 }}>05. CODING</span>
                <span style={{ opacity: 0.6, fontSize: '1vw' }}>Lab & Experiments.</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85vw', opacity: 0.5, letterSpacing: '0.1em' }}>
              [ EXPERIENCE ]
            </div>
          </div>
        </div>

        {/* FOOTER SECTION */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1vw' }}>
          <div style={{ fontSize: '0.85vw', opacity: 0.5, marginBottom: '0.5vw', letterSpacing: '0.1em' }}>
            [ NAVIGATE ]
          </div>
          <div style={{ fontSize: '1vw', letterSpacing: '0.1em', fontWeight: 500, opacity: 0.8 }}>
            SCROLL TO ACCESS ARCHIVE
          </div>
        </div>
      </div>

      {/* ── Right Side: Navigation & Stretched Typography ("Inverted L") ── */}
      <div
        style={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Navigation Area */}
        <div 
          style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '20px',
            position: 'relative',
            zIndex: 100,
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
                fontSize: '1.25rem',
                textTransform: 'lowercase',
                transform: 'scaleY(2.2) scaleX(0.9)',
                transformOrigin: 'right center',
                filter: 'url(#ink-bleed)'
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

          {/* Render the <Sticker /> components over NAWFAL text */}
          <Sticker
            fillColor="#D94A4A" // Red
            rotation={-10}
            top="40%"
            left="30%"
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
            top="70%"
            left="20%"
            parentRef={heroRef}
          />
        </div>
      </div>
    </div>
  )
}
