'use client'

import React, { useEffect } from 'react'
import MinimalHero from '@/components/hero/MinimalHero'
import AboutSection from '@/components/ui/AboutSection'
import BentoGrid from '@/components/ui/BentoGrid'

export default function Home() {
  
  // Ensure the page loads at the very top (fixing the scroll bug)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="relative min-h-screen bg-white text-[#111] selection:bg-black selection:text-white pb-32">
      
      {/* New Minimal Framer Hero */}
      <MinimalHero />

      {/* About Section with Scroll Highlight */}
      <AboutSection />

      {/* Projects Section (Bento Grid) */}
      <BentoGrid />

      {/* Footer */}
      <footer id="contact" className="w-full max-w-7xl mx-auto border-t border-gray-200 bg-white px-6 md:px-12 py-16 mt-32 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <p className="font-black text-lg tracking-tight">Nawfal ©2026</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">All rights reserved</p>
        </div>
        <div className="text-left md:text-right flex flex-col items-start md:items-end">
          <p className="font-bold text-sm uppercase tracking-widest opacity-60">Interested to work with me?</p>
          <a href="mailto:nawfaljaffri@gmail.com" className="text-xl md:text-3xl font-black tracking-tighter hover:opacity-50 transition-opacity mt-2 inline-block">
            nawfaljaffri@gmail.com
          </a>
        </div>
      </footer>

    </main>
  )
}
