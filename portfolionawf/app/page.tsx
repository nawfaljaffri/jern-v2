'use client'

import React, { useState } from 'react'
import EditorialHero from '@/components/hero/EditorialHero'
import ProjectTabs from '@/components/ui/ProjectTabs'
import ScrollHighlightText from '@/components/typography/ScrollHighlightText'

export default function Home() {
  const [activeTab, setActiveTab] = useState('noter')

  return (
    <main className="relative min-h-screen bg-white text-black selection:bg-black selection:text-white pb-32 overflow-hidden">

      {/* Hero Section - Full viewport dark split layout */}
      <section className="relative w-full z-10">
        <EditorialHero />
      </section>


      {/* Intro Block / Editorial Layout */}
      <section id="about" className="relative z-10 grid grid-cols-1 md:grid-cols-12 border-b border-black bg-white">
        
        {/* Clean, sparse left column */}
        <div className="col-span-1 md:col-span-3 border-b md:border-b-0 md:border-r border-black p-8 md:p-16 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4">
              About me
            </h2>
            <p className="font-bold text-xs text-black">
              Nawfal Jaffri
            </p>
          </div>
          <div className="hidden md:flex mt-32 w-16 h-16 border-2 border-black rounded-full items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
            <span className="text-xs font-black uppercase">Bio</span>
          </div>
        </div>

        {/* Spacious right column */}
        <div className="col-span-1 md:col-span-9 p-8 md:p-24 flex flex-col gap-16 relative">
          
          <ScrollHighlightText 
            text="Hi, I'm Nawfal Jaffri. A 20-year-old student at University Of Birmingham Dubai studying Artificial Intelligence with Computer Science. I have a wide range of skillsets such as brand development, events management, marketing, graphic, UI and UX design."
            className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] max-w-5xl uppercase"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-8 max-w-5xl border-t border-black pt-8">
            <div className="text-lg md:text-xl font-medium leading-relaxed text-black">
              I care about building digital experiences that people actually want to use. Whether it&apos;s a brand website or a product interface, my approach is guided by curiosity, simplicity, and a constant search for better ways to communicate ideas through design.
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-bold uppercase tracking-widest mb-4 border-b border-black pb-2 inline-block">Services</h4>
                <ul className="space-y-2 text-black font-medium">
                  <li>Creative Direction</li>
                  <li>Brand Identity</li>
                  <li>Strategy &amp; Concepts</li>
                  <li>Digital Product Design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest mb-4 border-b border-black pb-2 inline-block">Featured</h4>
                <ul className="space-y-2 text-black font-medium">
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-black pb-8">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter">
            Selected
            <br />
            Works
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest max-w-xs text-right text-black">
            A curated archive of digital, physical, and conceptual projects. 2024—Present.
          </p>
        </div>
        
        {/* Rebuilt Project Tabs Component */}
        <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </section>

      {/* Footer */}
      <footer id="contact" className="relative z-10 w-full border-t border-black bg-white p-8 md:p-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <p className="font-black text-sm uppercase">Nawfal ©2026</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">All rights reserved</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm uppercase">Interested to work with me?</p>
          <a href="mailto:nawfaljaffri@gmail.com" className="text-sm font-black uppercase hover:underline transition-colors mt-1 inline-block">nawfaljaffri@gmail.com</a>
        </div>
      </footer>

    </main>
  )
}
