'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface StretchedTextProps {
  text: string
  className?: string
}

export default function StretchedText({ text, className }: StretchedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1, // Smooth scrubbing
      },
    })

    // Animate scaleX and scaleY based on scroll
    tl.fromTo(
      textRef.current,
      { scaleX: 1.5, scaleY: 0.8, transformOrigin: 'center center' },
      { scaleX: 0.8, scaleY: 1.5, ease: 'none' }
    )

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('overflow-hidden flex items-center justify-center w-full', className)}>
      <h1 ref={textRef} className="uppercase font-black tracking-tighter text-6xl md:text-9xl whitespace-nowrap">
        {text}
      </h1>
    </div>
  )
}
