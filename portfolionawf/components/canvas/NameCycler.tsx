'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

const NAME = 'NAWFAL'
const LETTERS = NAME.split('')
const CYCLE_INTERVAL_MS = 60
const STAGGER_BASE_MS = 400
const STAGGER_STEP_MS = 200
const LERP_FACTOR = 0.08
const PARALLAX_STRENGTH = 15 // max px shift

interface NameCyclerProps {
  className?: string
}

function getOtherLetters(index: number): string[] {
  return LETTERS.filter((_, i) => i !== index)
}

export default function NameCycler({ className }: NameCyclerProps) {
  const [displayed, setDisplayed] = useState<string[]>(() => [...LETTERS])
  const [settled, setSettled] = useState<boolean[]>(() => LETTERS.map(() => true))
  const hasMounted = useRef(false)
  const hasAnimated = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse parallax state kept in refs to avoid re-renders on every frame
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)
  const transformRef = useRef<HTMLDivElement>(null)

  // ---------- letter cycling ----------
  const startCycling = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    // Reset settled state and scramble
    setSettled(LETTERS.map(() => false))

    LETTERS.forEach((correctLetter, idx) => {
      const others = getOtherLetters(idx)
      let tick = 0

      const interval = setInterval(() => {
        setDisplayed((prev) => {
          const next = [...prev]
          next[idx] = others[tick % others.length]
          return next
        })
        tick++
      }, CYCLE_INTERVAL_MS)

      // Settle after staggered delay
      setTimeout(() => {
        clearInterval(interval)
        setDisplayed((prev) => {
          const next = [...prev]
          next[idx] = correctLetter
          return next
        })
        setSettled((prev) => {
          const next = [...prev]
          next[idx] = true
          return next
        })
      }, STAGGER_BASE_MS + idx * STAGGER_STEP_MS)
    })
  }, [])

  // Intersection observer: trigger on first appearance
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          startCycling()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [startCycling])

  // ---------- mouse parallax ----------
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      // Normalise to -1…1
      mouseTarget.current = {
        x: ((e.clientX - cx) / cx) * PARALLAX_STRENGTH,
        y: ((e.clientY - cy) / cy) * PARALLAX_STRENGTH,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const tick = () => {
      mouseCurrent.current.x +=
        (mouseTarget.current.x - mouseCurrent.current.x) * LERP_FACTOR
      mouseCurrent.current.y +=
        (mouseTarget.current.y - mouseCurrent.current.y) * LERP_FACTOR

      if (transformRef.current) {
        transformRef.current.style.transform = `translate(${mouseCurrent.current.x}px, ${mouseCurrent.current.y}px)`
      }

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden select-none',
        className
      )}
    >
      <div ref={transformRef} className="will-change-transform">
        <div
          className="flex items-center justify-center"
          style={{
            fontSize: '15vw',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#000',
          }}
        >
          {displayed.map((letter, idx) => (
            <span
              key={idx}
              className={cn(
                'inline-block transition-opacity duration-200',
                settled[idx] ? 'opacity-100' : 'opacity-80'
              )}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
