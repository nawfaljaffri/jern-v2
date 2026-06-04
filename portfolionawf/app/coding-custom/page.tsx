"use client"

import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import * as THREE from 'three'
import { ShaderPass, UnrealBloomPass, AfterimagePass } from 'three-stdlib'

extend({ ShaderPass, UnrealBloomPass, AfterimagePass })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      afterimagePass: any
      unrealBloomPass: any
      shaderPass: any
    }
  }
}

// ---- DATA ----
const PROJECTS = [
  {
    name: 'neural-net-arch',
    date: '2024-03-15',
    lang: 'Python / PyTorch',
    status: 'ONLINE',
    desc: 'Neural architecture search experiments.\nExplores evolutionary algorithms to\noptimize network topologies for low-power\nedge devices.'
  },
  {
    name: 'noter-app',
    date: '2024-01-20',
    lang: 'TypeScript / React',
    status: 'DEPRECATED',
    desc: 'A minimal note-taking PWA.\nFeatures offline-first sync using IndexedDB\nand CRDTs for conflict resolution.'
  },
  {
    name: 'portfolio-site',
    date: '2024-06-01',
    lang: 'Next.js / WebGL',
    status: 'ACTIVE',
    desc: 'This very website. Swiss Punk graphic\ndesign meets high-performance React\narchitecture.'
  },
  {
    name: 'game-engine',
    date: '2024-04-10',
    lang: 'C++ / OpenGL',
    status: 'ARCHIVED',
    desc: 'Custom 2D game engine built from scratch.\nImplements an Entity Component System (ECS)\nand custom physics solvers.'
  },
]

// ---- POST-PROCESSING CRT SHADER (COOL-RETRO-TERM 1:1) ----
const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;

    // cool-retro-term exact curvature polynomial
    vec2 distortCoordinates(vec2 coords) {
        float frameSize = 0.03; // ~3% padding for bezels
        vec2 paddedCoords = coords * (1.0 + frameSize * 2.0) - frameSize;
        vec2 cc = (paddedCoords - 0.5);
        float dist = dot(cc, cc) * 0.2; // screenCurvature
        return (paddedCoords + cc * (1.0 + dist) * dist);
    }

    void main() {
        vec2 curvatureCoords = distortCoordinates(vUv);
        
        // Mask the rounded screen inside the frame
        float isScreen = min(step(0.0, curvatureCoords.x) - step(1.0, curvatureCoords.x),
                             step(0.0, curvatureCoords.y) - step(1.0, curvatureCoords.y));
        
        // If outside the active CRT area, render a dark plastic bezel
        if (isScreen < 0.5) {
            gl_FragColor = vec4(0.015, 0.01, 0.005, 1.0);
            return;
        }

        // Apply true cool-retro-term asymmetrical Chromatic Aberration kernel
        float rgbShift = 0.0015;
        vec2 displacement = vec2(rgbShift, 0.0);
        
        vec3 txt_color = texture2D(tDiffuse, curvatureCoords).rgb;
        vec3 rightColor = texture2D(tDiffuse, curvatureCoords + displacement).rgb;
        vec3 leftColor = texture2D(tDiffuse, curvatureCoords - displacement).rgb;
        
        vec3 finalColor;
        finalColor.r = leftColor.r * 0.10 + rightColor.r * 0.30 + txt_color.r * 0.60;
        finalColor.g = leftColor.g * 0.20 + rightColor.g * 0.20 + txt_color.g * 0.60;
        finalColor.b = leftColor.b * 0.30 + rightColor.b * 0.10 + txt_color.b * 0.60;

        // Scanlines
        float scanline = sin(curvatureCoords.y * 512.0 * 3.14159) * 0.15;
        finalColor -= scanline;

        // Ambient Glass Glare (Soft top-center reflection)
        float glare = smoothstep(0.8, 0.0, distance(curvatureCoords, vec2(0.5, 0.8)));
        finalColor += glare * vec3(0.1, 0.08, 0.05);

        // Static Noise
        float staticNoise = fract(sin(dot(curvatureCoords * uTime, vec2(12.9898,78.233))) * 43758.5453);
        finalColor += (staticNoise - 0.5) * 0.08;
        
        // Heavy Vignette
        vec2 cc = curvatureCoords - 0.5;
        float r = dot(cc, cc);
        float vignette = 1.0 - (r * 1.5);
        vignette = smoothstep(0.0, 0.9, vignette);
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

// ---- WEBGL COMPONENT ----
function CRTScreen({ selectedIndex, textRef, cursorRef, setRedrawFn }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const { viewport } = useThree()
  
  const shaderPassRef = useRef<any>(null)
  const cursorVisible = useRef(true)

  // Hardware Introspection (Cached)
  const sysInfo = useMemo(() => {
    if (typeof window === 'undefined') return { cores: 4, mem: 8, os: 'UNKNOWN' }
    return {
      cores: navigator.hardwareConcurrency || 8,
      // @ts-ignore
      mem: navigator.deviceMemory || 16,
      os: navigator.userAgent.substring(0, 45) + '...'
    }
  }, [])

  // Initialize Canvas
  useMemo(() => {
    if (typeof window === 'undefined') return
    const cvs = document.createElement('canvas')
    cvs.width = 2048
    cvs.height = 1024
    canvasRef.current = cvs
    
    const tex = new THREE.CanvasTexture(cvs)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    textureRef.current = tex
  }, [])

  // The Master Render Function (Bypasses React State, uses TUI Grid Array)
  const drawCanvas = () => {
    if (!canvasRef.current || !textureRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const W = canvasRef.current.width
    const H = canvasRef.current.height

    const colorBg = '#0D0802'     
    const colorAmber = '#FFB000'  
    const colorDim = '#885D00'
    const colorInvertedBg = '#FFB000'
    const colorInvertedFg = '#0D0802'

    ctx.font = '32px "VT323", monospace'
    // Measure actual character width to prevent grid misalignment
    const charW = ctx.measureText('M').width
    const charH = 32
    
    const COLS = Math.floor(W / charW)
    const ROWS = Math.floor(H / charH)

    ctx.fillStyle = colorBg
    ctx.fillRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = false
    ctx.textBaseline = 'top'

    // Text Grid Buffer
    const buffer = Array.from({ length: ROWS }, () => Array(COLS).fill(' '))
    const colorBuffer = Array.from({ length: ROWS }, () => Array(COLS).fill(0)) // 0:amber, 1:dim, 2:inverted

    const writeStr = (x: number, y: number, str: string, color = 0) => {
      x = Math.floor(x); y = Math.floor(y)
      if (y < 0 || y >= ROWS) return
      for (let i = 0; i < str.length; i++) {
        if (x + i < 0 || x + i >= COLS) continue
        buffer[y][x + i] = str[i]
        colorBuffer[y][x + i] = color
      }
    }

    const drawBox = (x: number, y: number, w: number, h: number, title = '') => {
      x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h)
      if (w <= 0 || h <= 0) return
      writeStr(x, y, '┌' + '─'.repeat(Math.max(0, w - 2)) + '┐', 1)
      if (title) writeStr(x + 2, y, `┤${title}├`, 0)
      writeStr(x, y + h - 1, '└' + '─'.repeat(Math.max(0, w - 2)) + '┘', 1)
      for (let i = 1; i < h - 1; i++) {
        writeStr(x, y + i, '│', 1)
        writeStr(x + w - 1, y + i, '│', 1)
      }
    }

    // --- POPULATE BUFFER (bpytop style) ---

    // Top Pane: System Info
    drawBox(0, 0, COLS, 8, 'cpu & mem')
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
    writeStr(COLS / 2 - 4, 0, `┤${timeStr}├`, 0)
    
    const cpuBar = '■■■■■■■■■■■■■■■■■■■■■■       '
    const memBar = '■■■■■■■■■               '
    const swpBar = '■■                      '
    
    writeStr(2, 2, `CPU [${cpuBar}] 76%  ${sysInfo.cores} Cores`, 0)
    writeStr(2, 3, `MEM [${memBar}] 32%  ${sysInfo.mem} GB`, 0)
    writeStr(2, 4, `SWP [${swpBar}] 08%  OS: ${sysInfo.os}`, 0)
    writeStr(2, 6, `Uptime: 14:22:10   Threads: 142   Procs: 84`, 1)

    // Left Pane: Projects
    const leftW = Math.floor(COLS * 0.35)
    drawBox(0, 8, leftW, ROWS - 12, 'projects')
    
    PROJECTS.forEach((proj, idx) => {
      const y = 10 + idx * 2
      const isSelected = idx === selectedIndex
      const padding = leftW - proj.name.length - 4
      const str = ` ${proj.name}` + ' '.repeat(Math.max(0, padding))
      writeStr(1, y, str, isSelected ? 2 : 0)
    })

    // Right Pane: Details
    drawBox(leftW, 8, COLS - leftW, ROWS - 12, 'details')
    const activeProj = PROJECTS[selectedIndex]
    
    writeStr(leftW + 2, 10, `Project: ${activeProj.name}`, 0)
    writeStr(leftW + 2, 12, `Status:  ${activeProj.status}`, 0)
    writeStr(leftW + 2, 13, `Stack:   ${activeProj.lang}`, 0)
    writeStr(leftW + 2, 14, `Date:    ${activeProj.date}`, 0)
    
    const descLines = activeProj.desc.split('\n')
    descLines.forEach((line, i) => {
        writeStr(leftW + 2, 16 + i, line, 1)
    })

    // Bottom Pane: Terminal
    drawBox(0, ROWS - 4, COLS, 4, 'terminal')
    const prefix = '$ '
    const typedText = textRef.current
    writeStr(2, ROWS - 2, prefix + typedText, 0)
    
    // Hardware Cursor
    if (cursorVisible.current) {
        writeStr(2 + prefix.length + cursorRef.current, ROWS - 2, '█', 0)
    }

    // --- RENDER BUFFER TO CANVAS ---
    for (let y = 0; y < ROWS; y++) {
      let currentString = ''
      let currentColor = -1
      let startX = 0

      const renderSegment = () => {
        if (currentString.length > 0) {
          if (currentColor === 2) { // Inverted
              ctx.fillStyle = colorInvertedBg
              ctx.fillRect(startX * charW, y * charH, currentString.length * charW, charH)
              ctx.fillStyle = colorInvertedFg
          } else if (currentColor === 1) { // Dim
              ctx.fillStyle = colorDim
          } else { // Normal
              ctx.fillStyle = colorAmber
          }
          ctx.fillText(currentString, startX * charW, y * charH)
        }
      }

      for (let x = 0; x < COLS; x++) {
        const char = buffer[y][x]
        const col = colorBuffer[y][x]

        if (col !== currentColor) {
          renderSegment()
          currentString = char
          currentColor = col
          startX = x
        } else {
          currentString += char
        }
      }
      renderSegment() // flush end of row
    }

    textureRef.current.needsUpdate = true
  }

  // Bind the global draw function for the parent to call
  useEffect(() => {
    setRedrawFn.current = drawCanvas
    drawCanvas()
  }, [selectedIndex])

  // Hardware Clock & Blinking Cursor
  useEffect(() => {
    const interval = setInterval(() => {
      cursorVisible.current = !cursorVisible.current
      drawCanvas()
    }, 500)
    
    document.fonts.ready.then(() => drawCanvas())
    return () => clearInterval(interval)
  }, [selectedIndex])

  useFrame((state) => {
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <>
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={textureRef.current} />
      </mesh>

      <Effects disableGamma>
        {/* @ts-ignore */}
        <afterimagePass args={[0.85]} />
        {/* Decreased Bloom strength to fix unreadable washed out text */}
        {/* @ts-ignore */}
        <unrealBloomPass args={[undefined, 0.5, 0.8, 0.1]} />
        {/* @ts-ignore */}
        <shaderPass ref={shaderPassRef} args={[CRTShader]} />
      </Effects>
    </>
  )
}

// ---- MAIN PAGE COMPONENT ----
export default function WebGLTerminalPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const textRef = useRef('')
  const cursorRef = useRef(0)
  const setRedrawFn = useRef<(() => void) | null>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (inputRef.current) inputRef.current.focus()
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    textRef.current = e.target.value
    cursorRef.current = e.target.selectionStart || 0
    if (setRedrawFn.current) setRedrawFn.current()
  }

  const syncCursor = () => {
    if (inputRef.current) {
      cursorRef.current = inputRef.current.selectionStart || 0
      if (setRedrawFn.current) setRedrawFn.current()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(s => Math.max(0, s - 1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(s => Math.min(PROJECTS.length - 1, s + 1))
    }
  }

  return (
    <div 
      className="w-screen h-screen bg-[#0D0802] overflow-hidden relative cursor-crosshair"
      onClick={() => inputRef.current?.focus()}
    >
      <a href="/" className="absolute top-4 left-4 z-[60] text-[#FFB000] border border-[#FFB000] px-4 py-2 hover:bg-[#FFB000] hover:text-black font-mono transition-colors bg-[#0D0802]">
        ← Back to Portfolio
      </a>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <CRTScreen 
          selectedIndex={selectedIndex} 
          textRef={textRef} 
          cursorRef={cursorRef} 
          setRedrawFn={setRedrawFn} 
        />
      </Canvas>

      <input
        ref={inputRef}
        type="text"
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={syncCursor}
        onClick={syncCursor}
        className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-text"
        autoFocus
        spellCheck={false}
      />
    </div>
  )
}
