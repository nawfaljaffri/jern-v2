'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScrollHighlightTextProps {
  text: string
  className?: string
}

export default function ScrollHighlightText({ text, className }: ScrollHighlightTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 50%"]
  })

  const words = text.split(" ")

  return (
    <p 
      ref={containerRef} 
      className={cn('flex flex-wrap gap-x-[0.3em] gap-y-[0.1em]', className)}
    >
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + (1 / words.length)
        
        // Ensure each word gets its own useTransform hook call statically
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        )
      })}
    </p>
  )
}

function Word({ children, progress, range }: { children: React.ReactNode, progress: any, range: number[] }) {
  const opacity = useTransform(progress, range, [0.2, 1])
  return (
    <motion.span style={{ opacity }}>
      {children}
    </motion.span>
  )
}
