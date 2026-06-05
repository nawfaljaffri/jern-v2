'use client'
import Lenis from '@studio-freight/lenis'
import { useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Skip Lenis on the /coding CRT page
    if (pathname === '/coding') return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    } as any)

    lenis.on('scroll', ScrollTrigger.update)

    const tickCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickCallback)
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger after navigation
    ScrollTrigger.refresh()

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tickCallback)
      ScrollTrigger.refresh()
      
      // Force clean up overflow styles that Lenis might have left behind
      document.documentElement.style.removeProperty('overflow')
      document.body.style.removeProperty('overflow')
    }
  }, [pathname])

  return <>{children}</>
}
