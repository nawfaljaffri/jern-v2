'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StickerProps {
  fillColor: string
  rotation?: number
  top: string
  left: string
  parentRef?: React.RefObject<HTMLElement | null>
}

export default function Sticker({ fillColor, rotation = 0, top, left, parentRef }: StickerProps) {
  return (
    <motion.div
      drag
      dragConstraints={parentRef || undefined}
      dragMomentum={true}
      dragElastic={0.1}
      whileDrag={{ scale: 1.12 }}
      className="absolute z-50 cursor-grab active:cursor-grabbing select-none"
      style={{
        top,
        left,
        rotate: `${rotation}deg`,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: '160px',
          height: '70px', // tighter oval
          borderRadius: '50%',
          backgroundColor: fillColor,
          border: '2px solid black', // thin black border
          // Removed the brutalist drop shadow to make it a tight oval sticker
        }}
      >
        <span
          style={{
            fontFamily: 'Arial Black, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '32px',
            color: '#FFF000',
            // Thin black text-shadow/stroke
            WebkitTextStroke: '1px black',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            letterSpacing: '1px',
          }}
        >
          NAWF
        </span>
      </div>
    </motion.div>
  )
}
