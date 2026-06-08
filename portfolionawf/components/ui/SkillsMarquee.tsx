'use client'

import React from 'react'
import { motion } from 'framer-motion'

const skills = [
  "Python", "Java", "HTML", "CSS", "C++", "Assembly", "Three.js", "WebGL", "SQL",
  "Affinity", "Illustrator", "Canva", "DaVinci", "Figma", "Framer", "Blender", "Unity", "Autodesk"
]

export default function SkillsMarquee() {
  return (
    <section className="w-full py-24 overflow-hidden bg-white flex flex-col justify-center">
      <div className="mb-12 px-6 md:px-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest opacity-40 text-[#111]">Toolkit & Languages</span>
      </div>
      
      <div className="relative flex overflow-x-hidden w-full">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-4 px-4">
          {[...skills, ...skills, ...skills].map((skill, index) => (
            <span 
              key={index} 
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 rounded-full text-2xl font-medium text-[#111] cursor-default whitespace-nowrap"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
