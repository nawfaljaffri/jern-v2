'use client'

import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface SVGStretchedTextProps {
  text: string
  className?: string
  height?: string
}

export default function SVGStretchedText({ text, className, height = 'h-[40vh]' }: SVGStretchedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return

    // Animate the height of the container to stretch the SVG vertically on scroll
    gsap.to(containerRef.current, {
      height: '80vh', // Stretch massively
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    })
  }, [])

  return (
    <div ref={containerRef} className={cn('w-full relative overflow-hidden', height, className)}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#000000"
          className="font-black uppercase"
          style={{ fontSize: '200px', letterSpacing: '-0.05em' }}
        >
          {text}
        </text>
      </svg>
    </div>
  )
}
