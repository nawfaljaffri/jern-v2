'use client'

import React from 'react'
import { motion } from 'framer-motion'

const experience = [
  {
    company: "Susty",
    location: "Dubai, UAE",
    roles: [
      { title: "Application Content Developer", date: "05/2025–Present" }
    ]
  },
  {
    company: "AIESEC in UAE",
    location: "Abu Dhabi",
    roles: [
      { title: "Marketing Local Vice President", date: "05/2026–Present" }
    ]
  },
  {
    company: "University Of Birmingham Dubai",
    location: "Dubai, UAE",
    roles: [
      { title: "Google Developer's Group Lead", date: "05/2026–Present" },
      { title: "Founder & VP, Food and Health Society", date: "09/2025–06/2026" },
      { title: "Lead Graphic Designer, Student Association", date: "09/2025–Present" }
    ]
  },
  {
    company: "Alyx Society",
    location: "Dubai, UAE",
    roles: [
      { title: "Director of Event Management", date: "10/2023–11/2024" },
      { title: "Media and Marketing Co-Head", date: "04/2023–10/2023" }
    ]
  },
  {
    company: "Unipreneur Inc.",
    location: "Dubai, UAE",
    roles: [
      { title: "Event Co-ordinator & Ambassador", date: "10/2023–12/2024" }
    ]
  },
  {
    company: "QuixMun",
    location: "Dubai, UAE",
    roles: [
      { title: "Head of Business Development", date: "08/2023–06/2024" }
    ]
  }
]

export default function ExperienceSection() {
  return (
    <section id="experience" className="w-full max-w-5xl mx-auto px-6 md:px-12 pt-16 pb-32 bg-white text-[#111]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-16 md:mb-24"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black/10 pb-4 mb-4 text-left">Timeline</h2>
        <h3 className="text-5xl md:text-7xl font-semibold tracking-tight text-left">Professional Experience</h3>
      </motion.div>

      <div className="flex flex-col gap-20">
        {experience.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {/* Company Info */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-8">
              <h4 className="text-4xl md:text-5xl font-medium tracking-tight">{item.company}</h4>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-2 md:mt-0">{item.location}</span>
            </div>
            
            {/* Roles */}
            <div className="flex flex-col">
              {item.roles.map((role, roleIdx) => (
                <div key={roleIdx} className={`flex flex-col md:flex-row md:justify-between md:items-center py-6 ${roleIdx !== 0 ? 'border-t border-black/5' : ''}`}>
                  <p className="text-2xl font-medium opacity-90">{role.title}</p>
                  <span className="text-sm font-medium opacity-40 mt-1 md:mt-0 tracking-widest uppercase">{role.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
