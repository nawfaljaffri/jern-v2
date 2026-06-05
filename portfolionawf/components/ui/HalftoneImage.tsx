import React from 'react'
import { cn } from '@/lib/utils'

interface HalftoneImageProps {
  src: string
  alt: string
  className?: string
}

export default function HalftoneImage({ src, alt, className }: HalftoneImageProps) {
  return (
    <div className={cn('relative overflow-hidden bg-white', className)}>
      {/* SVG Halftone Filter Definition */}
      <svg className="absolute w-0 h-0">
        <filter id="halftone">
          <feColorMatrix type="matrix" values="
            0.2126 0.7152 0.0722 0 0
            0.2126 0.7152 0.0722 0 0
            0.2126 0.7152 0.0722 0 0
            0 0 0 1 0" 
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 1"/>
            <feFuncG type="discrete" tableValues="0 1"/>
            <feFuncB type="discrete" tableValues="0 1"/>
          </feComponentTransfer>
        </filter>
      </svg>
      
      {/* 
        To get a true halftone effect without complex canvas, we combine 
        high contrast grayscale with a radial gradient dot pattern mask.
        For a simpler CSS approach that looks like a Xerox:
      */}
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover mix-blend-multiply filter contrast-[2] grayscale"
      />
      
      {/* Overlay dot matrix pattern */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1.5px)',
          backgroundSize: '4px 4px',
        }}
      />
    </div>
  )
}
