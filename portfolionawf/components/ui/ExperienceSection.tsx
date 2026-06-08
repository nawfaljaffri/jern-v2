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
    <section id="experience" className="w-full max-w-4xl mx-auto px-6 md:px-12 py-32 bg-white text-[#111]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-24 text-center"
      >
        <h3 className="text-5xl md:text-7xl font-semibold tracking-tight mb-4">Experience</h3>
      </motion.div>

      <div className="flex flex-col gap-16 md:gap-24">
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
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-6">
              <h4 className="text-3xl md:text-4xl font-semibold tracking-tight">{item.company}</h4>
              <span className="text-sm font-semibold uppercase tracking-widest opacity-40 mt-2 md:mt-0">{item.location}</span>
            </div>
            
            {/* Roles */}
            <div className="flex flex-col gap-4">
              {item.roles.map((role, roleIdx) => (
                <div key={roleIdx} className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xl font-medium opacity-90">{role.title}</p>
                  <span className="text-sm font-semibold opacity-50 mt-1 md:mt-0 bg-white px-3 py-1 rounded-full shadow-sm">{role.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
