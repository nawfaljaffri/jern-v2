import React from 'react'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  label: string
  description: string
  tags: string[]
  imageUrl: string
}

const PROJECTS: Project[] = [
  {
    id: 'noter',
    label: 'NOTER',
    description: 'A minimal, distraction-free note-taking PWA built with offline-first architecture. Clean typography, instant sync, zero clutter.',
    tags: ['React', 'PWA', 'IndexedDB'],
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'game',
    label: 'GAME ENGINE',
    description: 'Custom 2D game engine written in C++ with a pixel-art renderer, ECS architecture, and a built-in level editor.',
    tags: ['C++', 'OpenGL', 'ECS'],
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'cwjt',
    label: 'CWJT',
    description: 'Brand identity and digital platform for a cultural event series. Art direction, motion graphics, and responsive web design.',
    tags: ['Branding', 'Web', 'Motion'],
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'masar',
    label: 'MASAR',
    description: 'Wayfinding and navigation app concept for UAE universities. UX research, prototyping, and a full design system.',
    tags: ['UX', 'Figma', 'Research'],
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'bread',
    label: 'BREAD',
    description: 'Experimental brand and packaging design for an artisanal bakery. Tactile print work meets digital storefront.',
    tags: ['Brand', 'Print', 'Packaging'],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop',
  },
]

interface ProjectTabsProps {
  activeTab: string
  onTabChange: (id: string) => void
}

export default function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const activeProject = PROJECTS.find(p => p.id === activeTab) || PROJECTS[0]

  return (
    <div className="w-full">
      {/* Tab row */}
      <div className="flex flex-wrap gap-2 mb-12">
        {PROJECTS.map((project) => {
          const isActive = activeTab === project.id
          return (
            <button
              key={project.id}
              onClick={() => onTabChange(project.id)}
              className={cn(
                'px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer',
                'rounded-full',
                isActive
                  ? 'bg-cobalt text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
              )}
            >
              {project.label}
            </button>
          )
        })}
      </div>

      {/* Project display — visual left, info right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-stretch">
        
        {/* Interactive Visual Area (Bento Box) */}
        <div className="col-span-1 md:col-span-7 bg-gray-50 rounded-[2rem] overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] relative flex items-center justify-center p-8 min-h-[400px]">
          {/* Background image / subtle blur */}
          <div className="absolute inset-0 z-0">
             <img
              src={activeProject.imageUrl}
              alt={activeProject.label}
              className="w-full h-full object-cover opacity-20 blur-2xl saturate-200"
            />
          </div>
          
          {/* Main Visual Placeholder for iframes/apps */}
          <div className="relative z-10 w-full max-w-lg aspect-[4/3] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col items-center justify-center text-center p-8 transition-transform hover:scale-[1.02] duration-500 cursor-pointer">
            <span className="text-4xl mb-4 text-gray-300">✧</span>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Interactive App Display Area</p>
            <p className="text-xs text-gray-400 mt-2">(Ready for iframes, videos, or WebGL)</p>
          </div>
        </div>

        {/* Info area — right aligned, soft styling */}
        <div className="col-span-1 md:col-span-5 flex flex-col justify-center py-8 md:text-right">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {activeProject.label}
            </h3>
            <p className="text-base md:text-lg leading-relaxed text-gray-500 mb-8 max-w-md ml-auto">
              {activeProject.description}
            </p>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {activeProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 text-gray-500 rounded-2xl shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
