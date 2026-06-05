'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface MarqueeBannerProps {
  text: string
}

export default function MarqueeBanner({ text }: MarqueeBannerProps) {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!marqueeRef.current) return
    const el = marqueeRef.current
    const totalWidth = el.scrollWidth / 2

    gsap.to(el, {
      x: -totalWidth,
      ease: 'none',
      duration: 20,
      repeat: -1,
    })
  }, [])

  return (
    <div className="w-full h-8 flex items-center bg-cobalt text-white overflow-hidden whitespace-nowrap select-none">
      <div ref={marqueeRef} className="inline-block">
        <span className="text-xs font-bold uppercase tracking-widest px-4">{text}</span>
        <span className="text-xs font-bold uppercase tracking-widest px-4">{text}</span>
        {/* Double it again to ensure no visible gap when looping */}
        <span className="text-xs font-bold uppercase tracking-widest px-4">{text}</span>
        <span className="text-xs font-bold uppercase tracking-widest px-4">{text}</span>
      </div>
    </div>
  )
}
