'use client'

import React, { useState } from 'react'
import NameCycler from '@/components/canvas/NameCycler'
import HalftoneImage from '@/components/ui/HalftoneImage'
import ProjectTabs from '@/components/ui/ProjectTabs'
import MarqueeBanner from '@/components/ui/MarqueeBanner'
import ScatteredSquares from '@/components/ui/ScatteredSquares'
import ScrollHighlightText from '@/components/typography/ScrollHighlightText'

export default function Home() {
  const [activeTab, setActiveTab] = useState('noter')

  return (
    <main className="relative min-h-screen bg-white text-black selection:bg-cobalt selection:text-white pb-32">
      
      {/* Scattered 1975 Squares - Fixed across whole page */}
      <ScatteredSquares />

      {/* Typographic Artifacts (Background) - Heavily Subdued */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden text-[6vw] font-black leading-none uppercase text-justify text-[#E5E5E5] opacity-20 select-none break-all">
        do not stimulate avoid frivolous protect chasti give alms pray humble do not stimulate avoid frivolous protect chasti give alms pray humble
      </div>

      <MarqueeBanner text="AVAILABLE FOR FREELANCE WORK 2026 — GRAPHIC DESIGN — ART DIRECTION — WEB DESIGN — BRANDING — " />

      {/* Navigation - Stark Monochrome */}
      <nav className="relative z-50 w-full bg-white text-black p-4 md:px-8 flex flex-col md:flex-row md:justify-between gap-4 text-xs md:text-sm font-bold tracking-widest uppercase">
        <div className="flex gap-8">
          <span className="opacity-50">Nawfal®</span>
          <span className="opacity-50">UAE, Dubai</span>
        </div>
        <div className="flex gap-8">
          <a href="#projects" className="hover:text-cobalt transition-colors">Projects</a>
          <a href="#about" className="hover:text-cobalt transition-colors">About</a>
          <a href="/coding" className="hover:text-cobalt transition-colors">Coding</a>
          <a href="#contact" className="hover:text-cobalt transition-colors">Contact</a>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-cobalt transition-colors">X (Twitter)</a>
          <a href="#" className="hover:text-cobalt transition-colors">Instagram</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-white z-10 overflow-hidden">
        <NameCycler className="w-full" />
      </section>

      {/* Intro Block / Zine Layout */}
      <section id="about" className="relative z-10 grid grid-cols-1 md:grid-cols-12 border-t border-gray-200 bg-white">
        
        {/* Clean, sparse left column */}
        <div className="col-span-1 md:col-span-3 border-b md:border-b-0 md:border-r border-gray-200 p-8 md:p-16 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4">
              About me
            </h2>
            <p className="font-medium text-sm text-gray-400">
              Nawfal Jaffri
            </p>
          </div>
          <div className="hidden md:flex mt-32 w-20 h-20 border border-gray-200 rounded-3xl items-center justify-center shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer">
            <span className="text-xs font-bold uppercase text-gray-600">Bio</span>
          </div>
        </div>

        {/* Spacious right column */}
        <div className="col-span-1 md:col-span-9 p-8 md:p-24 flex flex-col gap-16 relative">
          
          <ScrollHighlightText 
            text="Hi, I'm Nawfal Jaffri. A 20-year-old student at University Of Birmingham Dubai studying Artificial Intelligence with Computer Science. I have a wide range of skillsets such as brand development, events management, marketing, graphic, UI and UX design."
            className="text-3xl md:text-5xl font-medium tracking-tight leading-snug max-w-4xl"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-8 max-w-4xl">
            <div className="text-lg md:text-xl font-medium leading-relaxed text-gray-500">
              I care about building digital experiences that people actually want to use. Whether it&apos;s a brand website or a product interface, my approach is guided by curiosity, simplicity, and a constant search for better ways to communicate ideas through design.
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 inline-block">Services</h4>
                <ul className="space-y-2 text-gray-400 font-medium">
                  <li>Creative Direction</li>
                  <li>Brand Identity</li>
                  <li>Strategy &amp; Concepts</li>
                  <li>Digital Product Design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 inline-block">Featured</h4>
                <ul className="space-y-2 text-gray-400 font-medium">
                  <li>Adobe</li>
                  <li>Facebook</li>
                  <li>Nike</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative z-10 w-full mx-auto px-4 md:px-16 py-32 bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter">
            Selected
            <br />
            Works
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest max-w-xs text-right text-gray-400">
            A curated archive of digital, physical, and conceptual projects. 2024—Present.
          </p>
        </div>
        
        {/* Rebuilt Project Tabs Component */}
        <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </section>

      {/* Footer */}
      <footer id="contact" className="relative z-10 w-full border-t border-gray-200 bg-white p-8 md:p-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <p className="font-bold text-sm">Nawfal ©2026</p>
          <p className="text-sm text-gray-400">All rights reserved</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">Interested to work with me?</p>
          <a href="mailto:nawfaljaffri@gmail.com" className="text-sm text-gray-400 hover:text-cobalt transition-colors underline underline-offset-4">nawfaljaffri@gmail.com</a>
        </div>
      </footer>

    </main>
  )
}
