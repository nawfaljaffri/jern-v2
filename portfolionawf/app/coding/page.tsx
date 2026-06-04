"use client"

import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import * as THREE from 'three'
import { ShaderPass, UnrealBloomPass, AfterimagePass } from 'three-stdlib'
import { VT323, Press_Start_2P, Share_Tech_Mono } from 'next/font/google'

const fontVt323 = VT323({ weight: '400', subsets: ['latin'] })
const fontPressStart = Press_Start_2P({ weight: '400', subsets: ['latin'] })
const fontShareTech = Share_Tech_Mono({ weight: '400', subsets: ['latin'] })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      afterimagePass: any
      unrealBloomPass: any
      shaderPass: any
    }
  }
}

const FONTS = [
  { name: 'VT323', css: fontVt323.style.fontFamily, yOffset: -2, size: 36 },
  { name: 'C64 / APPLE II', css: fontPressStart.style.fontFamily, yOffset: 8, size: 18 },
  { name: 'MODERN TECH', css: fontShareTech.style.fontFamily, yOffset: 0, size: 32 }
]

const THEMES = [
  { name: 'WHITE',  fg: '#FFFFFF', bg: '#000000', dim: '#666666', bloom: 0.40, radius: 1.40, thresh: 0.40 },
  { name: 'AMBER',  fg: '#F29C27', bg: '#211408', dim: '#855615', bloom: 0.7, radius: 0.5, thresh: 0.2 },
  { name: 'GREEN',  fg: '#A8F386', bg: '#182912', dim: '#4A6B32', bloom: 0.7, radius: 0.5, thresh: 0.2 },
  { name: 'PINK',   fg: '#FF66FF', bg: '#220022', dim: '#883388', bloom: 0.7, radius: 0.5, thresh: 0.2 },
  { name: 'PURPLE', fg: '#E080FF', bg: '#1A0A2A', dim: '#663388', bloom: 0.7, radius: 0.5, thresh: 0.2 },
  { name: 'RED',    fg: '#FF5555', bg: '#2A0A0A', dim: '#883333', bloom: 0.7, radius: 0.5, thresh: 0.2 },
  { name: 'BLUE',   fg: '#88BBFF', bg: '#0A152A', dim: '#446699', bloom: 0.7, radius: 0.5, thresh: 0.2 }
]

extend({ ShaderPass, UnrealBloomPass, AfterimagePass })

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

// ---- POST-PROCESSING CRT SHADER ----
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

    vec2 distortCoordinates(vec2 coords) {
        float frameSize = 0.03; 
        vec2 paddedCoords = coords * (1.0 + frameSize * 2.0) - frameSize;
        vec2 cc = (paddedCoords - 0.5);
        float dist = dot(cc, cc) * 0.2;
        return (paddedCoords + cc * (1.0 + dist) * dist);
    }

    void main() {
        vec2 curvatureCoords = distortCoordinates(vUv);
        
        float rgbShift = 0.0015;
        vec2 displacement = vec2(rgbShift, 0.0);
        
        vec3 txt_color = texture2D(tDiffuse, curvatureCoords).rgb;
        vec3 rightColor = texture2D(tDiffuse, curvatureCoords + displacement).rgb;
        vec3 leftColor = texture2D(tDiffuse, curvatureCoords - displacement).rgb;
        
        vec3 finalColor;
        finalColor.r = leftColor.r * 0.10 + rightColor.r * 0.30 + txt_color.r * 0.60;
        finalColor.g = leftColor.g * 0.20 + rightColor.g * 0.20 + txt_color.g * 0.60;
        finalColor.b = leftColor.b * 0.30 + rightColor.b * 0.10 + txt_color.b * 0.60;

        float scanline = sin(curvatureCoords.y * 512.0 * 3.14159) * 0.15;
        finalColor -= scanline;

        float glare = smoothstep(0.8, 0.0, distance(curvatureCoords, vec2(0.5, 0.8)));
        finalColor += glare * vec3(0.1, 0.08, 0.05);

        float staticNoise = fract(sin(dot(curvatureCoords * uTime, vec2(12.9898,78.233))) * 43758.5453);
        finalColor += (staticNoise - 0.5) * 0.08;
        
        vec2 cc = curvatureCoords - 0.5;
        float r = dot(cc, cc);
        float vignette = 1.0 - (r * 1.5);
        vignette = smoothstep(0.0, 0.9, vignette);
        finalColor *= vignette;

        // Radial bloom leak from the physical screen edges
        float distX = max(0.0, max(-curvatureCoords.x, curvatureCoords.x - 1.0));
        float distY = max(0.0, max(-curvatureCoords.y, curvatureCoords.y - 1.0));
        float dist = length(vec2(distX, distY));

        // Soft screen boundary. Over a short distance (0.025), the screen organically fades into the bezel.
        // This creates a glowing light leak radially around the CRT glass edge without streaking.
        float screenMask = 1.0 - smoothstep(0.0, 0.025, dist);

        vec3 bezelColor = vec3(0.02, 0.015, 0.01);
        
        finalColor = mix(bezelColor, finalColor, screenMask);

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

function MouseCursor({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()

  useFrame(({ pointer }) => {
    if (meshRef.current) {
      const mult = 1.15
      meshRef.current.position.x += (pointer.x * (viewport.width / 2) * mult - meshRef.current.position.x) * 0.4
      meshRef.current.position.y += (pointer.y * (viewport.height / 2) * mult - meshRef.current.position.y) * 0.4
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0.1]}>
      <planeGeometry args={[0.3, 0.5]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  )
}

function CRTScreen({ 
  selectedIndex, textRef, cursorRef, setRedrawFn, 
  themeIdx, fontIdx, settingsOpen, setSettingsOpen, setThemeIdx, setFontIdx,
  bloomAmt, bloomRadius, bloomThresh, burnIn,
  gridSizeRef
}: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const { viewport } = useThree()
  
  const shaderPassRef = useRef<any>(null)
  const bloomRef = useRef<any>(null)
  const afterimageRef = useRef<any>(null)
  const cursorVisible = useRef(true)

  const activeTheme = THEMES[themeIdx]
  const activeFont = FONTS[fontIdx]

  const sysInfo = useMemo(() => {
    if (typeof window === 'undefined') return { cores: 4, mem: 8, os: 'UNKNOWN' }
    return {
      cores: navigator.hardwareConcurrency || 8,
      // @ts-ignore
      mem: navigator.deviceMemory || 16,
      os: navigator.userAgent.substring(0, 45) + '...'
    }
  }, [])

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

  const drawCanvas = () => {
    if (!canvasRef.current || !textureRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const W = canvasRef.current.width
    const H = canvasRef.current.height

    const colorBg = activeTheme.bg
    const colorFg = activeTheme.fg
    const colorDim = activeTheme.dim
    const colorInvertedBg = activeTheme.fg
    const colorInvertedFg = activeTheme.bg

    ctx.font = `${activeFont.size}px ${activeFont.css}`
    const charW = ctx.measureText('M').width
    const charH = 32
    
    const COLS = Math.floor(W / charW)
    const ROWS = Math.floor(H / charH)
    
    gridSizeRef.current = { cols: COLS, rows: ROWS, charW, charH }

    ctx.fillStyle = colorBg
    ctx.fillRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = false
    ctx.textBaseline = 'top'

    const buffer = Array.from({ length: ROWS }, () => Array(COLS).fill(' '))
    const colorBuffer = Array.from({ length: ROWS }, () => Array(COLS).fill(0))

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

    const topBarRight = '[ SETTINGS ]  [ ← BACK ]'
    writeStr(COLS - topBarRight.length - 2, 1, topBarRight, 0)

    const leftW = Math.floor(COLS * 0.35)
    drawBox(0, 8, leftW, ROWS - 12, 'projects')
    
    PROJECTS.forEach((proj, idx) => {
      const y = 10 + idx * 2
      const isSelected = idx === selectedIndex
      const padding = leftW - proj.name.length - 4
      const str = ` ${proj.name}` + ' '.repeat(Math.max(0, padding))
      writeStr(1, y, str, isSelected ? 2 : 0)
    })

    drawBox(leftW, 8, COLS - leftW, ROWS - 12, 'details')
    const activeProj = PROJECTS[selectedIndex]
    
    writeStr(leftW + 2, 10, `Project: ${activeProj.name}`, 0)
    writeStr(leftW + 2, 12, `Status:  ${activeProj.status}`, 0)
    writeStr(leftW + 2, 13, `Stack:   ${activeProj.lang}`, 0)
    writeStr(leftW + 2, 14, `Date:    ${activeProj.date}`, 0)
    
    const descLines = activeProj.desc.split('\n')
    descLines.forEach((line: string, i: number) => {
        writeStr(leftW + 2, 16 + i, line, 1)
    })

    drawBox(0, ROWS - 4, COLS, 4, 'terminal')
    const prefix = '$ '
    const typedText = textRef.current
    writeStr(2, ROWS - 2, prefix + typedText, 0)
    
    if (cursorVisible.current) {
        writeStr(2 + prefix.length + cursorRef.current, ROWS - 2, '█', 0)
    }

    if (settingsOpen) {
       const w = 40; const h = 24;
       const boxX = Math.floor((COLS - w) / 2);
       const boxY = Math.floor((ROWS - h) / 2);
       
       for(let i=0; i<h; i++) {
           writeStr(boxX, boxY+i, ' '.repeat(w), 0); 
       }
       drawBox(boxX, boxY, w, h, 'SETTINGS');
       
       writeStr(boxX + 2, boxY + 2, 'THEME:', 0);
       THEMES.forEach((t, i) => {
          writeStr(boxX + 4, boxY + 3 + i, `[${themeIdx === i ? '*' : ' '}] ${t.name}`, themeIdx === i ? 2 : 0);
       });

       writeStr(boxX + 2, boxY + 11, 'FONT:', 0);
       FONTS.forEach((f, i) => {
          writeStr(boxX + 4, boxY + 12 + i, `[${fontIdx === i ? '*' : ' '}] ${f.name}`, fontIdx === i ? 2 : 0);
       });

       writeStr(boxX + 2, boxY + 16, 'EFFECTS:', 0);
       const SLIDER_CFG = [
         { label: 'BLOOM',  val: bloomAmt,    min: 0, max: 2 },
         { label: 'THRESH', val: bloomThresh, min: 0, max: 1 },
         { label: 'RADIUS', val: bloomRadius, min: 0, max: 2 },
         { label: 'BURN IN',val: burnIn,      min: 0, max: 0.99 }
       ]
       SLIDER_CFG.forEach((s, i) => {
         const fraction = (s.val - s.min) / (s.max - s.min);
         const trackLen = 20;
         const pos = Math.round(fraction * trackLen);
         let trackStr = '[';
         for(let k=0; k<=trackLen; k++) {
             if (k === pos) trackStr += '█';
             else if (k < pos) trackStr += '=';
             else trackStr += '-';
         }
         trackStr += ']';
         const valStr = s.val.toFixed(2);
         const label = s.label.padEnd(8, ' ');
         writeStr(boxX + 4, boxY + 17 + i, `${label} ${trackStr} ${valStr}`, 0);
       });
       
       writeStr(boxX + w - 12, boxY + h - 2, '[ CLOSE ]', 2);
    }

    for (let y = 0; y < ROWS; y++) {
      let currentString = ''
      let currentColor = -1
      let startX = 0

      const renderSegment = () => {
        if (currentString.length > 0) {
          if (currentColor === 2) { 
              ctx.shadowBlur = 0
              ctx.fillStyle = colorInvertedBg
              ctx.fillRect(startX * charW, y * charH - 2, currentString.length * charW, charH + 4)
              ctx.fillStyle = colorInvertedFg
          } else if (currentColor === 1) { 
              ctx.fillStyle = colorDim
          } else { 
              ctx.fillStyle = colorFg
          }

          ctx.shadowBlur = 0
          ctx.fillText(currentString, startX * charW, y * charH + activeFont.yOffset)
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
      renderSegment() 
    }

    textureRef.current.needsUpdate = true
  }

  useEffect(() => {
    setRedrawFn.current = drawCanvas
    drawCanvas()
  }, [selectedIndex, themeIdx, fontIdx, settingsOpen, bloomAmt, bloomRadius, bloomThresh, burnIn])

  useEffect(() => {
    const interval = setInterval(() => {
      cursorVisible.current = !cursorVisible.current
      drawCanvas()
    }, 500)
    
    document.fonts.ready.then(() => drawCanvas())
    return () => clearInterval(interval)
  }, [selectedIndex, themeIdx, fontIdx, settingsOpen, bloomAmt, bloomRadius, bloomThresh, burnIn])

  useFrame((state) => {
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (bloomRef.current) {
      bloomRef.current.strength = bloomAmt
      bloomRef.current.radius = bloomRadius
      bloomRef.current.threshold = bloomThresh
    }
    if (afterimageRef.current) {
      afterimageRef.current.uniforms.damp.value = burnIn
    }
  })

  return (
    <>
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={textureRef.current} />
      </mesh>

      <MouseCursor color={activeTheme.fg} />

      <Effects disableGamma>
        {/* @ts-ignore */}
        <afterimagePass ref={afterimageRef} args={[0.85]} />
        {/* @ts-ignore */}
        <unrealBloomPass ref={bloomRef} args={[undefined, bloomAmt, bloomRadius, bloomThresh]} />
        {/* @ts-ignore */}
        <shaderPass ref={shaderPassRef} args={[CRTShader]} />
      </Effects>
    </>
  )
}

export default function WebGLTerminalPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [themeIdx, setThemeIdx] = useState(0)
  const [fontIdx, setFontIdx] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const [bloomAmt, setBloomAmt] = useState(THEMES[0].bloom)
  const [bloomRadius, setBloomRadius] = useState(THEMES[0].radius)
  const [bloomThresh, setBloomThresh] = useState(THEMES[0].thresh)
  const [burnIn, setBurnIn] = useState(0.85)

  const activeSliderRef = useRef(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const textRef = useRef('')
  const cursorRef = useRef(0)
  const setRedrawFn = useRef<(() => void) | null>(null)
  const gridSizeRef = useRef({ cols: 142, rows: 32, charW: 14.4, charH: 32 })

  useEffect(() => {
    setBloomAmt(THEMES[themeIdx].bloom)
    setBloomRadius(THEMES[themeIdx].radius)
    setBloomThresh(THEMES[themeIdx].thresh)
  }, [themeIdx])

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
      if (settingsOpen) return
      setSelectedIndex(s => Math.max(0, s - 1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (settingsOpen) return
      setSelectedIndex(s => Math.min(PROJECTS.length - 1, s + 1))
    } else if (e.key === 'Escape') {
      setSettingsOpen(false)
    }
  }

  const handlePointerInteraction = (e: any, isClick: boolean) => {
    if (isClick && inputRef.current) {
      inputRef.current.focus()
    }

    const COLS = gridSizeRef.current.cols
    const ROWS = gridSizeRef.current.rows

    const nx = (e.clientX / window.innerWidth) * 2 - 1
    const ny = -(e.clientY / window.innerHeight) * 2 + 1
    
    const mult = 1.15
    const sceneX = nx * mult
    const sceneY = ny * mult
    
    const gridNormX = (sceneX + 1) / 2
    const gridNormY = (-sceneY + 1) / 2
    
    const gridX = Math.floor(gridNormX * COLS)
    const gridY = Math.floor(gridNormY * ROWS)

    if (settingsOpen) {
       const w = 40; const h = 24;
       const boxX = Math.floor((COLS - w) / 2);
       const boxY = Math.floor((ROWS - h) / 2);

       if (activeSliderRef.current >= 0) {
           const trackStart = boxX + 14;
           let fraction = (gridX - trackStart) / 20;
           fraction = Math.max(0, Math.min(1, fraction));
           
           const SLIDER_CFG = [
             { min: 0, max: 2, set: setBloomAmt },
             { min: 0, max: 1, set: setBloomThresh },
             { min: 0, max: 2, set: setBloomRadius },
             { min: 0, max: 0.99, set: setBurnIn }
           ];
           const cfg = SLIDER_CFG[activeSliderRef.current];
           cfg.set(cfg.min + fraction * (cfg.max - cfg.min));
           return;
       }
       
       if (isClick && gridX >= boxX && gridX <= boxX + w && gridY >= boxY && gridY <= boxY + h) {
           for (let i = 0; i < THEMES.length; i++) {
               if (gridY === boxY + 3 + i && gridX >= boxX + 4 && gridX <= boxX + 24) {
                   setThemeIdx(i); return;
               }
           }
           for (let i = 0; i < FONTS.length; i++) {
               if (gridY === boxY + 12 + i && gridX >= boxX + 4 && gridX <= boxX + 24) {
                   setFontIdx(i); return;
               }
           }
           if (gridY >= boxY + 17 && gridY <= boxY + 20) {
               const sliderIdx = gridY - (boxY + 17);
               activeSliderRef.current = sliderIdx;
               const trackStart = boxX + 14;
               let fraction = (gridX - trackStart) / 20;
               fraction = Math.max(0, Math.min(1, fraction));
               const SLIDER_CFG = [
                 { min: 0, max: 2, set: setBloomAmt },
                 { min: 0, max: 1, set: setBloomThresh },
                 { min: 0, max: 2, set: setBloomRadius },
                 { min: 0, max: 0.99, set: setBurnIn }
               ];
               const cfg = SLIDER_CFG[sliderIdx];
               cfg.set(cfg.min + fraction * (cfg.max - cfg.min));
               return;
           }
           if (gridY === boxY + h - 2 && gridX >= boxX + w - 12 && gridX <= boxX + w - 3) {
               setSettingsOpen(false); return;
           }
           return; 
       }
    }

    const topBarRight = '[ SETTINGS ]  [ ← BACK ]'
    const startX = COLS - topBarRight.length - 2
    if (gridY === 1 && isClick) {
       if (gridX >= startX + 14 && gridX <= startX + 23) {
           window.location.href = '/'
           return
       }
       if (gridX >= startX && gridX <= startX + 11) {
           setSettingsOpen(true)
           return
       }
    }

    const leftW = Math.floor(COLS * 0.35)
    if (isClick && !settingsOpen && gridX > 0 && gridX < leftW) {
      for (let idx = 0; idx < PROJECTS.length; idx++) {
        const projY = 10 + idx * 2
        if (gridY === projY || gridY === projY + 1) {
          setSelectedIndex(idx)
          if (inputRef.current) inputRef.current.focus()
          break
        }
      }
    }
    
    if (isClick && inputRef.current) inputRef.current.focus()
  }

  return (
    <div 
      className="w-screen h-screen bg-[#0A0500] overflow-hidden relative cursor-none touch-none"
      onPointerDown={(e) => handlePointerInteraction(e, true)}
      onPointerMove={(e) => handlePointerInteraction(e, false)}
      onPointerUp={() => { 
        activeSliderRef.current = -1;
        if (inputRef.current) inputRef.current.focus();
      }}
      onPointerLeave={() => { activeSliderRef.current = -1 }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <CRTScreen 
          selectedIndex={selectedIndex} 
          textRef={textRef} 
          cursorRef={cursorRef} 
          setRedrawFn={setRedrawFn}
          themeIdx={themeIdx}
          fontIdx={fontIdx}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          setThemeIdx={setThemeIdx}
          setFontIdx={setFontIdx}
          bloomAmt={bloomAmt}
          bloomRadius={bloomRadius}
          bloomThresh={bloomThresh}
          burnIn={burnIn}
          gridSizeRef={gridSizeRef}
        />
      </Canvas>

      <input
        ref={inputRef}
        type="text"
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={syncCursor}
        onClick={syncCursor}
        className="absolute left-[-9999px] top-[-9999px] opacity-0"
        autoFocus
        spellCheck={false}
      />
    </div>
  )
}
