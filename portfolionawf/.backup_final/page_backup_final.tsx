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
  { name: 'C64 / APPLE II', css: fontPressStart.style.fontFamily, yOffset: 8, size: 18 },
  { name: 'MODERN TECH', css: fontShareTech.style.fontFamily, yOffset: 0, size: 32 },
  { name: 'VT323', css: fontVt323.style.fontFamily, yOffset: -2, size: 36 }
]

const THEMES = [
  { name: 'WHITE',  fg: '#FFFFFF', bg: '#000000', dim: '#666666', bloom: 0.46, radius: 1.80, thresh: 0.30, burnIn: 0.80, bright: 1.115, satur: 1.24, crush: 0.30, grain: 0.15, curve: 0.20 },
  { name: 'BLUE',   fg: '#88BBFF', bg: '#0A152A', dim: '#446699', bloom: 0.90, radius: 0.90, thresh: 0.30, burnIn: 0.89, bright: 0.80, satur: 0.70, crush: 0.65, grain: 0.08, curve: 0.20 },
  { name: 'GREEN',  fg: '#A8F386', bg: '#182912', dim: '#4A6B32', bloom: 0.70, radius: 0.45, thresh: 0.00, burnIn: 0.50, bright: 0.80, satur: 0.45, crush: 0.80, grain: 0.15, curve: 0.20 },
  { name: 'PINK',   fg: '#FF66FF', bg: '#220022', dim: '#883388', bloom: 0.90, radius: 1.00, thresh: 0.35, burnIn: 0.75, bright: 1.595, satur: 0.30, crush: 0.75, grain: 0.10, curve: 0.20 },
  { name: 'AMBER',  fg: '#F29C27', bg: '#211408', dim: '#855615', bloom: 1.25, radius: 0.50, thresh: 0.20, burnIn: 0.85, bright: 0.69, satur: 0.75, crush: 0.63, grain: 0.13, curve: 0.20 },
  { name: 'PURPLE', fg: '#E080FF', bg: '#1A0A2A', dim: '#663388', bloom: 0.76, radius: 1.00, thresh: 0.30, burnIn: 0.80, bright: 1.30, satur: 0.66, crush: 0.70, grain: 0.10, curve: 0.20 }
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
    uTime: { value: 0 },
    u_curvature: { value: 0.2 },
    u_grain: { value: 0.08 },
    u_downsample: { value: 0.0 },
    u_saturation: { value: 1.0 },
    u_brightness: { value: 1.0 }
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
    uniform float u_curvature;
    uniform float u_grain;
    uniform float u_downsample;
    uniform float u_saturation;
    uniform float u_brightness;
    varying vec2 vUv;


    vec2 distortCoordinates(vec2 coords, float curvature) {
        float frameSize = 0.03; 
        vec2 paddedCoords = coords * (1.0 + frameSize * 2.0) - frameSize;
        vec2 cc = (paddedCoords - 0.5);
        float dist = dot(cc, cc) * curvature;
        return (paddedCoords + cc * (1.0 + dist) * dist);
    }

    void main() {
        vec2 curvatureCoords = distortCoordinates(vUv, u_curvature);
        
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
        finalColor += (staticNoise - 0.5) * u_grain;
        
        vec2 cc = curvatureCoords - 0.5;
        float r = dot(cc, cc);
        float vignette = 1.0 - (r * 1.5);
        vignette = smoothstep(0.0, 0.9, vignette);
        finalColor *= vignette;

        // Radial bloom leak from the physical screen edges
        float distX = max(0.0, max(-curvatureCoords.x, curvatureCoords.x - 1.0));
        float distY = max(0.0, max(-curvatureCoords.y, curvatureCoords.y - 1.0));
        float dist = length(vec2(distX, distY));

        float screenMask = 1.0 - smoothstep(0.0, 0.025, dist);
        vec3 bezelColor = vec3(0.0, 0.0, 0.0);
        finalColor = mix(bezelColor, finalColor, screenMask);

        // OPTICAL CONTROLS
        // 1. Contrast Crush (Downsample)
        // Only apply the Hermite curve (smoothstep) if u_downsample > 0
        float crunch = u_downsample * 0.15; 
        vec3 crushedColor = smoothstep(crunch, 1.0 - crunch, finalColor);
        finalColor = mix(finalColor, crushedColor, u_downsample);

        // 2. Saturation
        const vec3 W = vec3(0.2125, 0.7154, 0.0721);
        vec3 intensity = vec3(dot(finalColor, W));
        finalColor = mix(intensity, finalColor, u_saturation);

        // 3. Brightness
        finalColor *= u_brightness;

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
  selectedIndex, setSelectedIndex, textRef, cursorRef, setRedrawFn, 
  themeIdx, fontIdx, settingsOpen, setSettingsOpen, setThemeIdx, setFontIdx,
  bloomAmt, bloomRadius, bloomThresh, burnIn,
  brightness, setBrightness, saturation, setSaturation,
  curvature, setCurvature, downsample, setDownsample,
  grain, setGrain, settingsCursorIdx, setSettingsCursorIdx,
  gridSizeRef, aspectRatio, setAspectRatio, hoverRef
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
    const ua = navigator.userAgent
    let os = 'UNKNOWN'
    if (ua.indexOf('Mac OS X') !== -1) os = 'macOS'
    else if (ua.indexOf('Windows') !== -1) os = 'Windows'
    else if (ua.indexOf('Linux') !== -1) os = 'Linux'
    return {
      cores: navigator.hardwareConcurrency || 8,
      // @ts-ignore
      mem: navigator.deviceMemory || 16,
      os
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
    
    const getBar = (pct: number, width: number) => {
        const fill = Math.round((pct / 100) * width)
        return '|'.repeat(fill).padEnd(width, ' ')
    }
    
    const cpuBar = getBar(12, 29)
    const memBar = getBar(32, 29)
    const swpBar = getBar(8, 29)
    
    writeStr(2, 2, `CPU [${cpuBar}`, 0)
    writeStr(36, 2, `] 12%  ${sysInfo.cores} Cores`, 3)

    writeStr(2, 3, `MEM [${memBar}`, 0)
    writeStr(36, 3, `] 32%  ${sysInfo.mem} GB`, 3)

    writeStr(2, 4, `SWP [${swpBar}`, 0)
    writeStr(36, 4, `] 08%  OS: ${sysInfo.os}`, 3)
    writeStr(2, 6, `Uptime: 14:22:10   Threads: 142   Procs: 84`, 1)

    const topBarRight = '[ SETTINGS ]  [ ← BACK ]'
    const startX = COLS - topBarRight.length - 2
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    const isHoverSettings = hy === 1 && hx >= startX && hx <= startX + 11
    const isHoverBack = hy === 1 && hx >= startX + 14 && hx <= startX + 23
    
    writeStr(startX, 1, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeStr(startX + 14, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const leftW = Math.floor(COLS * 0.35)
    drawBox(0, 8, leftW, ROWS - 12, 'PROJECTS')
    
    PROJECTS.forEach((proj, idx) => {
      const y = 10 + idx
      const isSelected = idx === selectedIndex
      const padding = settingsOpen ? 1 : leftW - proj.name.length - 4
      const str = ` ${proj.name}` + ' '.repeat(Math.max(0, padding))
      const isHovered = !settingsOpen && hy === y && hx >= 1 && hx < 1 + str.length
      writeStr(1, y, str, isSelected || isHovered ? 2 : 0)
    })

    drawBox(leftW, 8, COLS - leftW, ROWS - 12, 'PROJECT DETAILS')
    const activeProj = PROJECTS[selectedIndex]
    
    writeStr(leftW + 2, 10, `PROJECT: ${activeProj.name.toUpperCase()}`, 0)
    writeStr(leftW + 2, 11, '─'.repeat(COLS - leftW - 4), 1)

    writeStr(leftW + 2, 13, `Status:  ${activeProj.status}`, 0)
    writeStr(leftW + 2, 14, `Stack:   ${activeProj.lang}`, 0)
    writeStr(leftW + 2, 15, `Date:    ${activeProj.date}`, 0)
    
    writeStr(leftW + 2, 17, '─'.repeat(COLS - leftW - 4), 1)

    const descLines = activeProj.desc.split('\n')
    descLines.forEach((line: string, i: number) => {
        writeStr(leftW + 2, 19 + i, line, 1)
    })

    drawBox(0, ROWS - 4, COLS, 4, 'TERMINAL')
    const prefix = '$ '
    const typedText = textRef.current
    writeStr(2, ROWS - 2, prefix + typedText, 0)
    
    if (cursorVisible.current) {
        writeStr(2 + prefix.length + cursorRef.current, ROWS - 2, '█', 0)
    }

    if (settingsOpen) {
       const w = 60; const h = 19;
       const boxX = Math.floor((COLS - w) / 2);
       const boxY = Math.floor((ROWS - h) / 2);
       
       for(let i=0; i<h; i++) {
           writeStr(boxX, boxY+i, ' '.repeat(w), 0); 
       }
       drawBox(boxX, boxY, w, h, 'SETTINGS');
       
       writeStr(boxX + 4, boxY + 2, 'THEME:', 0);
       THEMES.forEach((t, i) => {
          const isMouseHover = hy === boxY + 3 + i && hx >= boxX + 6 && hx <= boxX + 26;
          const isHighlighted = settingsCursorIdx === i || isMouseHover;
          writeStr(boxX + 6, boxY + 3 + i, `[${themeIdx === i ? '*' : ' '}] ${t.name}`, isHighlighted ? 2 : 0);
       });

       writeStr(boxX + 4, boxY + 11, 'FONT:', 0);
       FONTS.forEach((f, i) => {
          const isMouseHover = hy === boxY + 12 + i && hx >= boxX + 6 && hx <= boxX + 26;
          const isHighlighted = settingsCursorIdx === 6 + i || isMouseHover;
          writeStr(boxX + 6, boxY + 12 + i, `[${fontIdx === i ? '*' : ' '}] ${f.name}`, isHighlighted ? 2 : 0);
       });

       const col2HdrX = boxX + 31;
       const col2ItmX = boxX + 33;

       writeStr(col2HdrX, boxY + 2, 'EFFECTS:', 0);
       const SLIDER_CFG = [
         { label: 'SATUR',  val: saturation,  min: 0.0, max: 2.0 },
         { label: 'THRESH', val: bloomThresh, min: 0.0, max: 1.0 },
         { label: 'BLOOM',  val: bloomAmt,    min: 0.0, max: 2.0 },
         { label: 'SPREAD', val: bloomRadius, min: 0.0, max: 2.0 },
         { label: 'BRIGHT', val: brightness,  min: 0.5, max: 2.0 },
         { label: 'CRUSH',  val: downsample,  min: 0.0, max: 1.0 }
       ]
       SLIDER_CFG.forEach((s, i) => {
         const fraction = (s.val - s.min) / (s.max - s.min);
         const trackInside = 8;
         const pos = Math.round(fraction * trackInside);
         let trackStr = '[';
         for(let k=0; k<trackInside; k++) {
             if (k < pos) trackStr += '=';
             else trackStr += '-';
         }
         trackStr += ']';
         const pct = Math.round(fraction * 100);
         const valStr = (pct.toString() + '%').padStart(4, ' ');
         const label = s.label.padEnd(8, ' ');
         const isMouseHover = hy === boxY + 3 + i && hx >= col2ItmX && hx <= col2ItmX + 24;
         const isHighlighted = settingsCursorIdx === 9 + i || isMouseHover;
         writeStr(col2ItmX, boxY + 3 + i, `${label}${trackStr} ${valStr}`, isHighlighted ? 2 : 0);
       });
       
       writeStr(col2HdrX, boxY + 11, 'DISPLAY:', 0);
       const ratios = ['4:3', '5:4', 'FIT SCREEN'];
       ratios.forEach((r, i) => {
           const isSel = aspectRatio === (r === 'FIT SCREEN' ? 'FLUID' : r);
           const str = `[${isSel ? '*' : ' '}] ${r}`;
           const isMouseHover = hy === boxY + 12 + i && hx >= col2ItmX && hx < col2ItmX + str.length;
           const isHighlighted = settingsCursorIdx === 15 + i || isMouseHover;
           writeStr(col2ItmX, boxY + 12 + i, str, isHighlighted ? 2 : 0);
       });

       const isCloseHover = hy === boxY + h - 3 && hx >= boxX + 25 && hx <= boxX + 33;
       const isCloseHighlighted = settingsCursorIdx === 18 || isCloseHover;
       writeStr(boxX + 25, boxY + h - 3, '[ CLOSE ]', isCloseHighlighted ? 2 : 0);
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
  }, [selectedIndex, themeIdx, fontIdx, settingsOpen, bloomAmt, bloomRadius, bloomThresh, burnIn, aspectRatio, brightness, saturation, curvature, downsample, grain, settingsCursorIdx])

  useEffect(() => {
    const interval = setInterval(() => {
      cursorVisible.current = !cursorVisible.current
      drawCanvas()
    }, 500)
    
    document.fonts.ready.then(() => drawCanvas())
    return () => clearInterval(interval)
  }, [selectedIndex, themeIdx, fontIdx, settingsOpen, bloomAmt, bloomRadius, bloomThresh, burnIn, aspectRatio, brightness, saturation, curvature, downsample, grain, settingsCursorIdx])

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
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.u_brightness.value = brightness
      shaderPassRef.current.uniforms.u_saturation.value = saturation
      shaderPassRef.current.uniforms.u_curvature.value = curvature
      shaderPassRef.current.uniforms.u_downsample.value = downsample
      shaderPassRef.current.uniforms.u_grain.value = grain
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
  const [aspectRatio, setAspectRatio] = useState('4:3')
  const hoverRef = useRef({ x: -1, y: -1 })
  
  const [bloomAmt, setBloomAmt] = useState(THEMES[0].bloom)
  const [bloomRadius, setBloomRadius] = useState(THEMES[0].radius)
  const [bloomThresh, setBloomThresh] = useState(THEMES[0].thresh)
  const [burnIn, setBurnIn] = useState(THEMES[0].burnIn)

  const [brightness, setBrightness] = useState(THEMES[0].bright)
  const [saturation, setSaturation] = useState(THEMES[0].satur)
  const [curvature, setCurvature] = useState(THEMES[0].curve)
  const [downsample, setDownsample] = useState(THEMES[0].crush)
  const [grain, setGrain] = useState(THEMES[0].grain)

  const [settingsCursorIdx, setSettingsCursorIdx] = useState(0)
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
    setBurnIn(THEMES[themeIdx].burnIn)
    setBrightness(THEMES[themeIdx].bright)
    setSaturation(THEMES[themeIdx].satur)
    setCurvature(THEMES[themeIdx].curve)
    setDownsample(THEMES[themeIdx].crush)
    setGrain(THEMES[themeIdx].grain)
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
      if (settingsOpen) {
          setSettingsCursorIdx(s => Math.max(0, s - 1))
      } else {
          setSelectedIndex(s => Math.max(0, s - 1))
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (settingsOpen) {
          setSettingsCursorIdx(s => Math.min(18, s + 1))
      } else {
          setSelectedIndex(s => Math.min(PROJECTS.length - 1, s + 1))
      }
    } else if (e.key === 'Escape') {
      setSettingsOpen(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (settingsOpen) {
          if (settingsCursorIdx < 6) {
              setThemeIdx(settingsCursorIdx)
          } else if (settingsCursorIdx < 9) {
              setFontIdx(settingsCursorIdx - 6)
          } else if (settingsCursorIdx >= 15 && settingsCursorIdx < 18) {
              const ratios = ['4:3', '5:4', 'FLUID']
              setAspectRatio(ratios[settingsCursorIdx - 15])
          } else if (settingsCursorIdx === 18) {
              setSettingsOpen(false)
          }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (settingsOpen && settingsCursorIdx >= 9 && settingsCursorIdx < 15) {
          e.preventDefault()
          const sliderIdx = settingsCursorIdx - 9
          const delta = e.key === 'ArrowRight' ? 0.05 : -0.05
          
          const SLIDER_CFG = [
            { min: 0.0, max: 2.0, set: setSaturation },
            { min: 0.0, max: 1.0, set: setBloomThresh },
            { min: 0.0, max: 2.0, set: setBloomAmt },
            { min: 0.0, max: 2.0, set: setBloomRadius },
            { min: 0.5, max: 2.0, set: setBrightness },
            { min: 0.0, max: 1.0, set: setDownsample }
          ]
          const cfg = SLIDER_CFG[sliderIdx]
          cfg.set((prev: number) => Math.max(cfg.min, Math.min(cfg.max, prev + delta)))
      }
    }
  }

  const handlePointerInteraction = (e: any, isClick: boolean) => {
    if (isClick && inputRef.current) {
      inputRef.current.focus()
    }

    const COLS = gridSizeRef.current.cols
    const ROWS = gridSizeRef.current.rows

    const rect = e.currentTarget.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
    
    const mult = 1.15
    const sceneX = nx * mult
    const sceneY = ny * mult
    
    const gridNormX = (sceneX + 1) / 2
    const gridNormY = (-sceneY + 1) / 2
    
    const gridX = Math.floor(gridNormX * COLS)
    const gridY = Math.floor(gridNormY * ROWS)

    const prevHoverX = hoverRef.current.x
    const prevHoverY = hoverRef.current.y
    if (!isClick && (prevHoverX !== gridX || prevHoverY !== gridY)) {
        hoverRef.current = { x: gridX, y: gridY }
        if (setRedrawFn.current) setRedrawFn.current()
    }

    if (settingsOpen) {
        const w = 60; const h = 19;
        const boxX = Math.floor((COLS - w) / 2);
        const boxY = Math.floor((ROWS - h) / 2);
        const col2ItmX = boxX + 33;

       if (activeSliderRef.current >= 0) {
           const trackStart = col2ItmX + 9;
           let fraction = (gridX - trackStart) / 8;
           fraction = Math.max(0, Math.min(1, fraction));
           
           const SLIDER_CFG = [
             { min: 0.0, max: 2.0, set: setSaturation },
             { min: 0.0, max: 1.0, set: setBloomThresh },
             { min: 0.0, max: 2.0, set: setBloomAmt },
             { min: 0.0, max: 2.0, set: setBloomRadius },
             { min: 0.5, max: 2.0, set: setBrightness },
             { min: 0.0, max: 1.0, set: setDownsample }
           ];
           const cfg = SLIDER_CFG[activeSliderRef.current];
           cfg.set(cfg.min + fraction * (cfg.max - cfg.min));
           return;
       }
       
       if (isClick && gridX >= boxX && gridX <= boxX + w && gridY >= boxY && gridY <= boxY + h) {
            for (let i = 0; i < THEMES.length; i++) {
                if (gridY === boxY + 3 + i && gridX >= boxX + 6 && gridX <= boxX + 26) {
                    setThemeIdx(i); return;
                }
            }
             for (let i = 0; i < FONTS.length; i++) {
                 if (gridY === boxY + 12 + i && gridX >= boxX + 6 && gridX <= boxX + 26) {
                     setFontIdx(i); return;
                 }
             }
           if (gridY >= boxY + 3 && gridY <= boxY + 8 && gridX >= col2ItmX && gridX <= col2ItmX + 24) {
                const sliderIdx = gridY - (boxY + 3);
                const SLIDER_CFG = [
                  { min: 0.0, max: 2.0, set: setSaturation },
                  { min: 0.0, max: 1.0, set: setBloomThresh },
                  { min: 0.0, max: 2.0, set: setBloomAmt },
                  { min: 0.0, max: 2.0, set: setBloomRadius },
                  { min: 0.5, max: 2.0, set: setBrightness },
                  { min: 0.0, max: 1.0, set: setDownsample }
                ];
                activeSliderRef.current = sliderIdx;
                const trackStart = col2ItmX + 9;
                let fraction = (gridX - trackStart) / 8;
                fraction = Math.max(0, Math.min(1, fraction));
                const cfg = SLIDER_CFG[sliderIdx];
                cfg.set(cfg.min + fraction * (cfg.max - cfg.min));
                return;
            }
             if (gridY === boxY + h - 3 && gridX >= boxX + 25 && gridX <= boxX + 33) {
                 setSettingsOpen(false); return;
             }
            if (gridY >= boxY + 12 && gridY <= boxY + 14 && gridX >= col2ItmX && gridX <= col2ItmX + 24) {
                 if (gridY === boxY + 12) setAspectRatio('4:3');
                 else if (gridY === boxY + 13) setAspectRatio('5:4');
                 else if (gridY === boxY + 14) setAspectRatio('FLUID');
                 return;
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
      if (gridY >= 10 && gridY < 10 + PROJECTS.length) {
        setSelectedIndex(gridY - 10)
        if (inputRef.current) inputRef.current.focus()
      }
    }
    
    if (isClick && inputRef.current) inputRef.current.focus()
  }

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          maxWidth: aspectRatio === '4:3' ? 'calc(100vh * 4/3)' : aspectRatio === '5:4' ? 'calc(100vh * 5/4)' : 'none',
          maxHeight: aspectRatio === '4:3' ? 'calc(100vw * 3/4)' : aspectRatio === '5:4' ? 'calc(100vw * 4/5)' : 'none',
          aspectRatio: aspectRatio === '4:3' ? '4/3' : aspectRatio === '5:4' ? '5/4' : 'auto'
        }}
        className="relative cursor-none touch-none"
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
            selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}
            themeIdx={themeIdx} setThemeIdx={setThemeIdx}
            fontIdx={fontIdx} setFontIdx={setFontIdx}
            settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen}
            textRef={textRef} cursorRef={cursorRef} setRedrawFn={setRedrawFn}
            bloomAmt={bloomAmt} bloomRadius={bloomRadius} bloomThresh={bloomThresh} burnIn={burnIn}
            brightness={brightness} setBrightness={setBrightness}
            saturation={saturation} setSaturation={setSaturation}
            curvature={curvature} setCurvature={setCurvature}
            downsample={downsample} setDownsample={setDownsample}
            grain={grain} setGrain={setGrain}
            settingsCursorIdx={settingsCursorIdx} setSettingsCursorIdx={setSettingsCursorIdx}
            gridSizeRef={gridSizeRef} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            hoverRef={hoverRef}
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
    </div>
  )
}
