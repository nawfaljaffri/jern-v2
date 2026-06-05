'use client'

import React, { useEffect, useRef } from 'react'

export default function AsciiParticles() {
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
      radius: 150
    }

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    canvas.addEventListener('mousemove', (event) => {
      mouse.x = event.x
      mouse.y = event.y
    })
    canvas.addEventListener('mouseleave', () => {
      mouse.x = null
      mouse.y = null
    })

    ctx.font = 'bold 30px Courier New'
    ctx.fillStyle = 'white'
    ctx.fillText('NAWFAL', 0, 40) // Temporarily draw text to get image data
    
    // We will scatter particles to form the word NAWFAL
    const textCoordinates = ctx.getImageData(0, 0, 150, 50)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    class Particle {
      x: number
      y: number
      size: number
      baseX: number
      baseY: number
      density: number
      char: string

      constructor(x: number, y: number) {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = 3
        this.baseX = x
        this.baseY = y
        this.density = (Math.random() * 30) + 1
        this.char = Math.random() > 0.5 ? '0' : '1'
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = 'white'
        ctx.font = '10px Courier New'
        ctx.fillText(this.char, this.x, this.y)
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
          let directionX = forceDirectionX * force * this.density
          let directionY = forceDirectionY * force * this.density

          if (distance < mouse.radius) {
            this.x -= directionX
            this.y -= directionY
          } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX
              this.x -= dx / 10
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY
              this.y -= dy / 10
            }
          }
        } else {
          // Return to base position
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX
            this.x -= dx / 10
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY
            this.y -= dy / 10
          }
        }
      }
    }

    const init = () => {
      particlesArray = []
      // Center the text coordinates in the canvas
      let offsetX = canvas!.width / 2 - (150 * 5) / 2
      let offsetY = canvas!.height / 2 - (50 * 5) / 2

      for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
          // If opacity is > 128 (meaning text is there)
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            let positionX = x * 5 + offsetX
            let positionY = y * 5 + offsetY
            particlesArray.push(new Particle(positionX, positionY))
          }
        }
      }
    }
    init()

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw()
        particlesArray[i].update()
      }
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-auto mix-blend-difference" 
      style={{ zIndex: 0 }}
    />
  )
}
