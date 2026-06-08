'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringText, setIsHoveringText] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    // Quick hack to detect if hovering over links or massive text to change cursor state
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, span')) {
        setIsHoveringText(true)
      } else {
        setIsHoveringText(false)
      }
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 w-24 h-24 rounded-full bg-black pointer-events-none z-50 flex items-center justify-center mix-blend-difference hidden md:flex"
      animate={{
        x: mousePosition.x - 48, // 48 is half of w-24 (96px)
        y: mousePosition.y - 48,
        scale: isHoveringText ? 0.5 : 1,
      }}
      transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
    >
      <motion.span 
        className="text-white text-2xl font-bold"
        animate={{ opacity: isHoveringText ? 0 : 1, y: [0, 5, 0] }}
        transition={{ y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } }}
      >
        ↓
      </motion.span>
    </motion.div>
  )
}
