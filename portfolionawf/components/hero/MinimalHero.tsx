'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'

export default function MinimalHero() {
  const firstName = "Nawfal".split("")
  const lastName = "Jaffri".split("")

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  }

  const item: Variants = {
    hidden: { y: "100%", opacity: 0 },
    show: { y: "0%", opacity: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="relative w-full h-screen min-h-screen bg-white text-[#111] overflow-hidden flex flex-col justify-between pt-8">
      {/* Top Nav */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-widest z-20"
      >
        <div className="col-span-1">
          <span className="font-black text-sm tracking-tight normal-case">Nawfal®</span>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <a href="#projects" className="hover:opacity-50 transition-opacity">Projects</a>
          <a href="#about" className="hover:opacity-50 transition-opacity">About</a>
          <a href="mailto:nawfaljaffri@gmail.com" className="hover:opacity-50 transition-opacity">Contact</a>
          <Link href="/coding" className="hover:opacity-50 transition-opacity text-gray-500">Terminal</Link>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <a href="#" className="hover:opacity-50 transition-opacity">LinkedIn</a>
          <a href="#" className="hover:opacity-50 transition-opacity">Instagram</a>
        </div>
        <div className="col-span-1 text-right flex flex-col gap-2">
          <span>UAE, Dubai</span>
          <span className="opacity-50">Local Time</span>
        </div>
      </motion.nav>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-xs font-bold uppercase tracking-[0.2em] opacity-40 z-10"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="mt-4"
        >
          ↓
        </motion.div>
        <span className="mt-2 text-[10px]">Scroll to explore</span>
      </motion.div>

      {/* Massive Bottom Typography */}
      <div className="w-full flex justify-center overflow-hidden pb-4 md:pb-8 z-20 px-4">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="font-black text-[#111] leading-none tracking-tighter flex gap-8 md:gap-16 cursor-default"
          style={{ 
            fontSize: 'clamp(5rem, 18vw, 25rem)',
            transform: 'scaleY(1.1)' 
          }}
        >
          <div className="flex overflow-hidden">
            {firstName.map((letter, i) => (
              <motion.span 
                key={`first-${i}`} 
                variants={item}
                className="inline-block hover:text-gray-300 hover:-translate-y-4 transition-all duration-300"
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {lastName.map((letter, i) => (
              <motion.span 
                key={`last-${i}`} 
                variants={item}
                className="inline-block hover:text-gray-300 hover:-translate-y-4 transition-all duration-300"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
