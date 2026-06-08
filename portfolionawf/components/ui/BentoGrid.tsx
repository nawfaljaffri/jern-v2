'use client'

import React from 'react'
import { motion } from 'framer-motion'

type Project = {
  id: string
  title: string
  category: string
  description: string
  color: string
  colSpan?: string
  rowSpan?: string
  imageLayout?: 'mockup-iphone' | 'mockup-ipad' | 'full' | 'pixel-art' | 'terminal'
}

const projects: Project[] = [
  {
    id: '1',
    title: 'School Bus Tracker',
    category: 'Map Integration',
    description: 'Traffic control & parent booking system to track children securely on their school routes.',
    color: 'bg-blue-50',
    colSpan: 'md:col-span-2',
    rowSpan: 'md:row-span-1',
    imageLayout: 'full'
  },
  {
    id: '2',
    title: 'Language Learner',
    category: 'iOS / iPadOS',
    description: 'Immersive language learning application built for dual-screen environments.',
    color: 'bg-green-50',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-2',
    imageLayout: 'mockup-ipad'
  },
  {
    id: '3',
    title: 'Social Questionnaire',
    category: 'Social App',
    description: 'Tinder-style card swipe mechanics for friends to ask deep questions and connect.',
    color: 'bg-yellow-50',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1',
    imageLayout: 'mockup-iphone'
  },
  {
    id: '4',
    title: 'Finance Tracker',
    category: 'Fintech',
    description: 'Clean financial tracking and budgeting with a minimalist approach.',
    color: 'bg-purple-50',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1',
    imageLayout: 'mockup-iphone'
  },
  {
    id: '5',
    title: '8-Bit Adventure',
    category: 'Game Dev',
    description: 'Custom pixel-art game exploring algorithmic logic and physics.',
    color: 'bg-red-50',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1',
    imageLayout: 'pixel-art'
  },
  {
    id: '6',
    title: 'CRT Terminal OS',
    category: 'Web Dev',
    description: 'Fully functional retro operating system built in React with interactive command line mechanics.',
    color: 'bg-orange-50 text-[#111]',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1',
    imageLayout: 'terminal'
  }
]

export default function BentoGrid() {
  return (
    <section id="projects" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-32 bg-white text-[#111]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-4 mb-4">Computer Science & Design</h2>
        <h3 className="text-4xl md:text-6xl font-medium tracking-tight">Selected Works</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col justify-between ${project.color} ${project.colSpan} ${project.rowSpan} transition-shadow duration-500 hover:shadow-xl cursor-pointer`}
          >
            {/* Text Content */}
            <div className="z-10 relative">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">
                {project.category}
              </span>
              <h4 className="text-2xl font-bold tracking-tight mb-3">
                {project.title}
              </h4>
              <p className="text-sm font-medium opacity-80 max-w-sm">
                {project.description}
              </p>
            </div>

            {/* Abstract Graphic Placeholder for Apps */}
            {project.imageLayout !== 'terminal' && (
              <div className="absolute -bottom-10 -right-10 w-3/4 h-3/4 bg-black/5 rounded-tl-[3rem] transform group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 ease-out" />
            )}

            {project.imageLayout === 'terminal' && (
              <div className="absolute -bottom-4 -right-4 w-64 h-48 bg-black border-[4px] border-gray-700 rounded-xl shadow-2xl transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-700 ease-out flex flex-col overflow-hidden">
                <div className="h-6 w-full bg-gray-800 flex items-center px-2 gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-black p-2 text-green-500 font-mono text-[8px] leading-tight opacity-80">
                  guest@nawfal:~$ boot<br/>
                  Loading system modules...<br/>
                  [OK] Kernel init<br/>
                  [OK] UI loaded<br/>
                  guest@nawfal:~$ _
                </div>
              </div>
            )}
            
            {project.imageLayout === 'mockup-iphone' && (
              <div className="absolute -bottom-16 right-8 w-40 h-80 bg-white border-[6px] border-black rounded-[2.5rem] shadow-lg transform group-hover:-translate-y-4 transition-transform duration-700 ease-out" />
            )}
            
            {project.imageLayout === 'mockup-ipad' && (
              <div className="absolute -bottom-20 -right-10 w-72 h-96 bg-white border-[8px] border-black rounded-[1.5rem] shadow-lg transform group-hover:-translate-y-6 transition-transform duration-700 ease-out" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
