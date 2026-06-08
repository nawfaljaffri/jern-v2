'use client'

import React from 'react'
import { motion } from 'framer-motion'
import ScrollHighlightText from '../typography/ScrollHighlightText'

export default function AboutSection() {
  return (
    <section id="about" className="relative w-full min-h-screen bg-white text-[#111] py-32 flex items-center">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        
        {/* Left: Text & Bio */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">About Me</span>
          </div>
          
          <ScrollHighlightText 
            text="Hi, I'm Nawfal Jaffri. A 20-year-old student at University Of Birmingham Dubai studying Artificial Intelligence with Computer Science."
            className="text-4xl md:text-5xl lg:text-7xl font-medium tracking-tighter leading-[1.1] mb-8"
          />

          <p className="text-xl md:text-3xl font-medium leading-relaxed opacity-60 max-w-3xl">
            I have a wide range of skillsets such as brand development, events management, marketing, graphic, UI and UX design.
          </p>
        </div>

        {/* Right: Profile Picture Reveal */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm aspect-[3/4] bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
            <img 
              src="/profile.jpg" 
              alt="Nawfal Jaffri" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center -z-10">
              <span className="text-xs uppercase tracking-widest font-bold opacity-30">Image Pending</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
