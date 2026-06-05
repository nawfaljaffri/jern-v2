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

    const words = Array.from(containerRef.current.querySelectorAll('span.word'))

    // Set initial state — very faded gray
    gsap.set(words, { color: '#D4D4D4' })

    gsap.to(words, {
      color: '#0000FF', // Cobalt blue highlight
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true,
      }
    })
  }, [])

  const splitWords = text.split(' ').map((word, i) => (
    <span key={i} className="word inline-block mr-[0.25em]">
      {word}
    </span>
  ))

  return (
    <p ref={containerRef} className={cn('flex flex-wrap', className)}>
      {splitWords}
    </p>
  )
}
