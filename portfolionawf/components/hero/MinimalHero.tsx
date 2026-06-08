'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import CustomCursor from '@/components/ui/CustomCursor'

export default function MinimalHero() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const wordAnim: Variants = {
    hidden: { y: 100, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="relative w-full h-screen min-h-screen bg-white text-[#111] flex flex-col justify-between pt-8 md:pt-12 cursor-none">
      <CustomCursor />
      
      {/* Top Nav */}
      <motion.nav 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="w-full px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-widest z-20"
      >
        <div className="col-span-1">
          <span className="font-black text-sm tracking-tight normal-case">Nawfal®</span>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <a href="#projects" className="hover:opacity-50 transition-opacity cursor-pointer">Selected Works</a>
          <a href="#experience" className="hover:opacity-50 transition-opacity cursor-pointer">Experience</a>
          <a href="#about" className="hover:opacity-50 transition-opacity cursor-pointer">About</a>
          <Link href="/coding" className="hover:opacity-50 transition-opacity text-gray-500 cursor-pointer">Terminal</Link>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <a href="mailto:nawfaljaffri@gmail.com" className="hover:opacity-50 transition-opacity cursor-pointer">Contact</a>
          <a href="https://www.linkedin.com/in/nawfaljaffri/" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity cursor-pointer">LinkedIn</a>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity cursor-pointer">CV / Resume</a>
        </div>
        <div className="col-span-1 text-right flex flex-col gap-2">
          <span>UAE, Dubai</span>
          <span className="opacity-50">Local Time</span>
        </div>
      </motion.nav>

      {/* Massive Bottom Typography (Left Aligned, Equal Padding) */}
      <div className="w-full flex justify-start pb-6 md:pb-12 z-20 px-6 md:px-12 overflow-hidden">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="font-black text-[#111] leading-none tracking-tighter flex flex-wrap gap-x-4 md:gap-x-8 group"
          style={{ fontSize: 'clamp(4rem, 12vw, 15rem)' }}
        >
          <div className="overflow-hidden pb-2 pr-2 md:pr-4">
            <motion.span 
              variants={wordAnim}
              className="inline-block transition-all duration-500 group-hover:text-black/50 hover:!text-black"
            >
              Nawfal
            </motion.span>
          </div>
          <div className="overflow-hidden pb-2 pr-2 md:pr-4">
            <motion.span 
              variants={wordAnim}
              className="inline-block transition-all duration-500 group-hover:text-black/50 hover:!text-black"
            >
              Jaffri
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
