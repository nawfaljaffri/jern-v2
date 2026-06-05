'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'

export default function InteractiveCollage() {
  const constraintsRef = useRef(null)

  return (
    <motion.div ref={constraintsRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Sticker 1: Blue Graphic Badge */}
      <motion.div 
        drag 
        dragConstraints={constraintsRef} 
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase tracking-widest text-xs pointer-events-auto cursor-grab active:cursor-grabbing shadow-lg"
        whileDrag={{ scale: 1.1, rotate: 10 }}
        initial={{ rotate: -15 }}
      >
        <span className="text-center">Make it<br/>Pop</span>
      </motion.div>

      {/* Sticker 2: Black Tape Arrow */}
      <motion.div 
        drag 
        dragConstraints={constraintsRef} 
        className="absolute top-1/2 right-1/4 pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl bg-black px-6 py-2 text-white font-black text-xl italic"
        whileDrag={{ scale: 1.1, rotate: -5 }}
        initial={{ rotate: 15 }}
      >
        &rarr; START HERE
      </motion.div>

      {/* Sticker 3: Polaroid Placeholder */}
      <motion.div 
        drag 
        dragConstraints={constraintsRef} 
        className="absolute bottom-1/4 left-1/3 w-48 h-56 bg-white p-3 pb-12 shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col border border-gray-200"
        whileDrag={{ scale: 1.05, rotate: 5 }}
        initial={{ rotate: -5 }}
      >
        <div className="w-full flex-grow bg-gray-200"></div>
        <div className="mt-2 text-center text-xs font-mono text-gray-500">IMG_4021.JPG</div>
      </motion.div>

      {/* Sticker 4: Abstract Shape */}
      <motion.div 
        drag 
        dragConstraints={constraintsRef} 
        className="absolute top-1/3 right-1/3 pointer-events-auto cursor-grab active:cursor-grabbing"
        whileDrag={{ scale: 1.1 }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 0L100 25L100 75L50 100L0 75L0 25L50 0Z" fill="#FF4500" />
        </svg>
      </motion.div>

      {/* Sticker 5: Typography Sticker */}
      <motion.div 
        drag 
        dragConstraints={constraintsRef} 
        className="absolute bottom-1/3 right-1/4 bg-white border-2 border-black p-4 pointer-events-auto cursor-grab active:cursor-grabbing shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        whileDrag={{ scale: 1.1, y: -5, x: -5, boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
        initial={{ rotate: 8 }}
      >
        <h3 className="font-black text-2xl uppercase leading-none">Anti-<br/>Design</h3>
      </motion.div>

    </motion.div>
  )
}
