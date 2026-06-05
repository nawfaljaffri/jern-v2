'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface ScrollHighlightTextProps {
  text: string
  className?: string
}

export default function ScrollHighlightText({ text, className }: ScrollHighlightTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Animate the background position
    gsap.to(containerRef.current, {
      backgroundPositionX: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true,
      }
    })
  }, [])

  return (
    <p 
      ref={containerRef} 
      className={cn('inline-block !leading-snug', className)}
      style={{
        backgroundImage: 'linear-gradient(to right, black 50%, #D4D4D4 50%)',
        backgroundSize: '200% 100%',
        backgroundPositionX: '0%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {text}
    </p>
  )
}
