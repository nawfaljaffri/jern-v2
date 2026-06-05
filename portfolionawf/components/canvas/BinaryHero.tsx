'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BinaryHeroProps {
  className?: string
}

export default function BinaryHero({ className }: BinaryHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let particlesArray: Particle[] = []
    let mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 120
    }

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    const handleResize = () => {
      setCanvasSize()
      init()
    }
    window.addEventListener('resize', handleResize)

    canvas.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    })
    canvas.addEventListener('mouseleave', () => {
      mouse.x = null
      mouse.y = null
    })

    class Particle {
      x: number
      y: number
      size: number
      baseX: number
      baseY: number
      density: number

      constructor(x: number, y: number) {
        this.x = x + (Math.random() * 20 - 10)
        this.y = y + (Math.random() * 20 - 10)
        this.size = 2 // Small sharp blocks
        this.baseX = x
        this.baseY = y
        // Increase density for a snappy spring
        this.density = (Math.random() * 30) + 10
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = '#000000'
        ctx.fillRect(this.x, this.y, this.size, this.size)
      }

      update() {
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x
          let dy = mouse.y - this.y
          let distance = Math.sqrt(dx * dx + dy * dy)
          let forceDirectionX = dx / distance
          let forceDirectionY = dy / distance
          let maxDistance = mouse.radius
          let force = (maxDistance - distance) / maxDistance
          let directionX = forceDirectionX * force * this.density * 5
          let directionY = forceDirectionY * force * this.density * 5

          if (distance < mouse.radius) {
            this.x -= directionX
            this.y -= directionY
          } else {
            // Spring back
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX
              this.x -= dx / 15
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY
              this.y -= dy / 15
            }
          }
        } else {
          // Spring back
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX
            this.x -= dx / 15
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY
            this.y -= dy / 15
          }
        }
      }
    }

    const init = () => {
      particlesArray = []
      
      // Draw text to get pixel data
      ctx.fillStyle = '#000000'
      ctx.font = '900 15vw "Helvetica Now Display", Helvetica, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('NAWFAL', canvas.width / 2, canvas.height / 2)

      const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Subsampling the pixels to create the particle grid
      const step = 6 // step size determines particle density
      for (let y = 0; y < textCoordinates.height; y += step) {
        for (let x = 0; x < textCoordinates.width; x += step) {
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            particlesArray.push(new Particle(x, y))
          }
        }
      }
    }
    
    // Slight delay to ensure fonts are loaded
    setTimeout(init, 100)

    let animationFrameId: number
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw()
        particlesArray[i].update()
      }
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className={cn("absolute inset-0 pointer-events-auto", className)} 
      style={{ zIndex: 10 }}
    />
  )
}
