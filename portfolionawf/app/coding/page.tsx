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
import { initAudio, toggleMute, isMuted, playClack, playTick, playEnter, playBootUp, playPowerOff, playModalOpen, playModalClose, startHum } from '../../utils/audioEngine'

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

const SNAKE_COLORS = [
  '#FF1A1A', '#FF6600', '#FFFF00', '#1AFF1A', '#00FFFF', 
  '#3333FF', '#FF00FF'
];

extend({ ShaderPass, UnrealBloomPass, AfterimagePass })

// ---- DATA ----
const DIRECTORY: any[] = [
  {
    name: 'PROJECTS',
    type: 'folder',
    children: [
      {
        name: 'neural-net-arch',
        type: 'project',
        date: '2024-03-15',
        lang: 'Python / PyTorch',
        status: 'ONLINE',
        desc: 'Neural architecture search experiments.\nExplores evolutionary algorithms to\noptimize network topologies for low-power\nedge devices.',
        links: '[GitHub] [Live Demo]'
      },
      {
        name: 'spatial-os-web',
        type: 'project',
        date: '2024-02-28',
        lang: 'TypeScript / WebGL',
        status: 'ONLINE',
        desc: 'Browser-based operating system interface relying solely on canvas rendering.\nBuilt with custom shaders and immediate mode GUI concepts.',
        links: '[GitHub]'
      },
      {
        name: 'poster-series-1',
        type: 'project',
        date: '2024-05-12',
        lang: 'Illustrator / PS',
        status: 'PUBLISHED',
        desc: 'A series of brutalist posters exploring\nthe dichotomy of brutalism and digital noise.\nExhibited at Dubai Design Week.'
      }
    ]
  },
  {
    name: 'EXPERIENCE',
    type: 'page',
    content: [
      "EDUCATION",
      "University Of Birmingham: BSc. Artificial Intelligence and Computer Science (01/2025-06/2028)",
      "Language Proficiency: IELTS 8.5/9 Band - C2 CEFR Level (06/2024)",
      "",
      "PROFESSIONAL EXPERIENCE",
      "Susty (Dubai, UAE) | Application Content Developer (05/2025-Present)",
      "- Developed over 70+ interactive sustainability experiences.",
      "- Increased new users by 53% and engagement by 48%.",
      "- Collaborated with 40+ local brands, partners, and universities.",
      "",
      "AIESEC in UAE (Abu Dhabi) | Marketing Local Vice President (05/2026-Present)",
      "- Host workshops on Branding, Marketing, & Graphic Design.",
      "- Led the state-level rebranding of the organization.",
      "",
      "University Of Birmingham Dubai | Founder & VP, Food and Health Society (09/2025-Present)",
      "- Led first-of-its-kind campus event: 500+ tickets sold, 10,000+ AED earned.",
      "- Managed marketing, finance, communications, design, and business development.",
      "",
      "University Of Birmingham Dubai | Lead Graphic Designer, Student Association (09/2025-Present)",
      "- Managed social media marketing and designed posters for all university events.",
      "",
      "Alyx Society (Dubai, UAE) | Director of Event Management (10/2023-11/2024)",
      "- Secured partnerships with GITEX, Unipreneur Inc, and AIESEC.",
      "- Handled logistics, staffing, finance, branding, and social media strategies.",
      "- Streamlined recruitment by screening 50+ applicants and conducting interviews.",
      "",
      "Alyx Society (Dubai, UAE) | Media and Marketing Co-Head (04/2023-10/2023)",
      "- Drafted/presented event proposals with Indus Hospital for cancer patient fundraising.",
      "- Led brand design & content creation, resulting in 121,000+ views (783% increase), 450+ applications, and 40,000 AED in sponsorship funding.",
      "",
      "Unipreneur Inc. (Dubai, UAE) | Event Co-ordinator & Ambassador (10/2023-12/2024)",
      "- Co-led management & Emcee hosted at Logimotion'24 (DWTC).",
      "- Youth speaker at AIIC (GETEX '24) and MUN Roundtable Speaker (GITEX '23).",
      "",
      "QuixMun (Dubai, UAE) | Head of Business Development (08/2023-06/2024)",
      "- Developed brand USP, rules of procedure, and departmental setup.",
      "- Secured 800+ applications (435% above cap) and raised 1,200 AED for charity.",
      "",
      "AWARDS, PARTICIPATION & VOLUNTEERING",
      "Bread - Project Aizah: UI & UX Designer (Antler)",
      "Nikon Green Film Festival Dubai: 1st Place",
      "Google Developers Club UOBD: Lead Organizer",
      "AsiesMun'24: Best Head Chair and Committee (UNESCO)",
      "AuschoolMun'24: Best Delegate (UNEP)",
      "WsdMun'23: Best Speaker (DISEC)",
      "Emirates Literature Foundation LitFest: Volunteer",
      "Arab Unity School: Economics Student Teacher"
    ]
  },
  {
    name: 'ABOUT',
    type: 'page',
    content: [
      'I am a 1st-year AI and Computer Science student at the',
      'University of Birmingham Dubai. My work is defined by',
      'a hybrid methodology: the logical rigor of artificial',
      'intelligence and the emotional resonance of graphic design.',
      '',
      'Whether I am leading a team as a Vice President at AIESEC,',
      'leading the google developers group at Uni of Birmingham',
      'Dubai, or Teaching people, I am driven by the same goal:',
      'turning abstract data into meaningful human experiences.'
    ]
  }
];

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
        float crunch = u_downsample * 0.15; 
        vec3 crushedColor = smoothstep(crunch, 1.0 - crunch, finalColor);
        finalColor = mix(finalColor, crushedColor, u_downsample);

        const vec3 W = vec3(0.2125, 0.7154, 0.0721);
        vec3 intensity = vec3(dot(finalColor, W));
        finalColor = mix(intensity, finalColor, u_saturation);

        finalColor *= u_brightness;

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

// ---- HELPER CLASSES & FUNCS ----
class TextBuffer {
  cols: number;
  rows: number;
  buffer: string[][];
  colorBuffer: any[][];

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.buffer = Array.from({ length: rows }, () => Array(cols).fill(' '));
    this.colorBuffer = Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  writeStr(x: number, y: number, str: string, color: any = 0) {
    x = Math.floor(x); y = Math.floor(y);
    if (y < 0 || y >= this.rows) return;
    for (let i = 0; i < str.length; i++) {
      if (x + i < 0 || x + i >= this.cols) continue;
      this.buffer[y][x + i] = str[i];
      this.colorBuffer[y][x + i] = color;
    }
  }

  drawBox(x: number, y: number, w: number, h: number, title = '') {
    x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h);
    if (w <= 0 || h <= 0) return;
    this.writeStr(x, y, '┌' + '─'.repeat(Math.max(0, w - 2)) + '┐', 1);
    if (title) this.writeStr(x + 2, y, `┤${title}├`, 0);
    this.writeStr(x, y + h - 1, '└' + '─'.repeat(Math.max(0, w - 2)) + '┘', 1);
    for (let i = 1; i < h - 1; i++) {
      this.writeStr(x, y + i, '│', 1);
      this.writeStr(x + w - 1, y + i, '│', 1);
    }
  }

  renderToCanvas(ctx: CanvasRenderingContext2D, charW: number, charH: number, activeFont: any, activeTheme: any) {
    const colorFg = activeTheme.fg;
    const colorDim = activeTheme.dim;
    const colorInvertedBg = activeTheme.fg;
    const colorInvertedFg = activeTheme.bg;

    ctx.fillStyle = activeTheme.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < this.rows; y++) {
      let currentString = '';
      let currentColor = -1;
      let startX = 0;

      const renderSegment = () => {
        if (currentString.length > 0) {
          if (currentColor === 2) { 
              ctx.shadowBlur = 0;
              ctx.fillStyle = colorInvertedBg;
              ctx.fillRect(startX * charW, y * charH - 2, currentString.length * charW, charH + 4);
              ctx.fillStyle = colorInvertedFg;
          } else if (currentColor === 1) { 
              ctx.fillStyle = colorDim;
          } else if (typeof currentColor === 'string') {
              ctx.fillStyle = currentColor;
          } else { 
              ctx.fillStyle = colorFg;
          }
          ctx.shadowBlur = 0;
          ctx.fillText(currentString, startX * charW, y * charH + activeFont.yOffset);
        }
      }

      for (let x = 0; x < this.cols; x++) {
        const char = this.buffer[y][x];
        const col = this.colorBuffer[y][x];

        if (col !== currentColor) {
          renderSegment();
          currentString = char;
          currentColor = col;
          startX = x;
        } else {
          currentString += char;
        }
      }
      renderSegment();
    }
  }
}

const getSliders = (effects: any, setEffects: any) => [
  { label: 'SATUR',  val: effects.saturation,  min: 0.0, max: 2.0, set: (v: number) => setEffects((e: any) => ({...e, saturation: v})) },
  { label: 'THRESH', val: effects.bloomThresh, min: 0.0, max: 1.0, set: (v: number) => setEffects((e: any) => ({...e, bloomThresh: v})) },
  { label: 'BLOOM',  val: effects.bloomAmt,    min: 0.0, max: 2.0, set: (v: number) => setEffects((e: any) => ({...e, bloomAmt: v})) },
  { label: 'SPREAD', val: effects.bloomRadius, min: 0.0, max: 2.0, set: (v: number) => setEffects((e: any) => ({...e, bloomRadius: v})) },
  { label: 'BRIGHT', val: effects.brightness,  min: 0.5, max: 2.0, set: (v: number) => setEffects((e: any) => ({...e, brightness: v})) },
  { label: 'CRUSH',  val: effects.downsample,  min: 0.0, max: 1.0, set: (v: number) => setEffects((e: any) => ({...e, downsample: v})) }
];

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
  uiState, setUiState, effects, setEffects,
  textRef, cursorRef, setRedrawFn, gridSizeRef, hoverRef
}: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const { viewport } = useThree()
  
  const shaderPassRef = useRef<any>(null)
  const bloomRef = useRef<any>(null)
  const afterimageRef = useRef<any>(null)
  const cursorVisible = useRef(true)
    const snakeState = useRef({ 
      body: [
        {x: 10, y: 10, color: SNAKE_COLORS[Math.floor(Math.random() * SNAKE_COLORS.length)]}, 
        {x: 9, y: 10, color: SNAKE_COLORS[Math.floor(Math.random() * SNAKE_COLORS.length)]}, 
        {x: 8, y: 10, color: SNAKE_COLORS[Math.floor(Math.random() * SNAKE_COLORS.length)]}
      ], 
      dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 
    });

  const activeTheme = THEMES[uiState.themeIdx]
  const activeFont = FONTS[uiState.fontIdx]

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

    ctx.font = `${activeFont.size}px ${activeFont.css}`
    const charW = ctx.measureText('M').width
    const charH = 32
    
    const COLS = Math.floor(W / charW)
    const ROWS = Math.floor(H / charH)
    
    gridSizeRef.current = { cols: COLS, rows: ROWS, charW, charH }

    ctx.imageSmoothingEnabled = false
    ctx.textBaseline = 'top'

    const buffer = new TextBuffer(COLS, ROWS);
    const offsetY = Math.max(0, Math.floor((ROWS - 30) / 2));
    const writeUI = (x: number, y: number, str: string, col: number) => buffer.writeStr(x, y + offsetY, str, col);
    const drawBoxUI = (x: number, y: number, w: number, h: number, title?: string) => buffer.drawBox(x, y + offsetY, w, h, title);

    if (!uiState.isBooted) {
        // Draw Snake
        const s = snakeState.current;
        s.body.forEach((segment: any) => {
            buffer.writeStr(segment.x, segment.y, '█', segment.color);
        });
        buffer.writeStr(s.food.x, s.food.y, '●', 0);

        // Draw Title
        const titleStr = "NAWFAL JAFFRI";
        const titleX = Math.floor((COLS - titleStr.length) / 2);
        const titleY = Math.floor(ROWS / 2) - 1;
        buffer.writeStr(titleX, titleY, titleStr, 0);
        
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        
        // Draw pulsing prompt (text only, no solid background to prevent bloom bleeding)
        const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
        const px = Math.floor((COLS - promptStr.length) / 2) * charW;
        const py = Math.floor(ROWS / 2 + 1) * charH + activeFont.yOffset;
        
        const hex2rgb = (hex: string) => {
            const v = parseInt(hex.replace('#', ''), 16);
            return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        };
        const fgRgb = hex2rgb(activeTheme.fg);
        const pulse = Math.abs(Math.sin(Date.now() / 500));
        
        ctx.font = `${activeFont.size}px ${activeFont.css}`;
        ctx.fillStyle = `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, ${pulse})`;
        ctx.fillText(promptStr, px, py);
        
        textureRef.current.needsUpdate = true;
        return;
    }

    drawBoxUI(0, 0, COLS, 8, 'IDENTITY')
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
    writeUI(COLS / 2 - 4, 0, `┤${timeStr}├`, 0)
    
    const contactX = COLS - 30;
    writeUI(contactX, 3, `nawfaljaffri@gmail.com`, 0)
    writeUI(contactX, 4, `+971 50 4945990`, 0)
    writeUI(contactX, 5, `linkedin.com/in/nawfaljaffri`, 0)
    writeUI(contactX, 6, `Location: Dubai, UAE`, 1)

    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startX = COLS - topBarRight.length - 2
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    const isHoverSettings = hy === 1 && hx >= startX && hx <= startX + 11
    const isHoverSound = hy === 1 && hx >= startX + 14 && hx < startX + 14 + soundText.length
    const isHoverBack = hy === 1 && hx >= startX + 14 + soundText.length + 2 && hx < startX + 14 + soundText.length + 2 + 10
    
    writeUI(startX, 1, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startX + 14, 1, soundText, isHoverSound ? 2 : 0)
    writeUI(startX + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const colW = 20;
    
    drawBoxUI(0, 8, colW, 18, 'CONTENTS');
    
    DIRECTORY.forEach((item, idx) => {
        const y = 10 + idx;
        const isSelected = uiState.navPath[0] === idx;
        const isHovered = !uiState.settingsOpen && hy === y && hx >= 1 && hx < colW - 1;
        
        let prefix = '';
        if (item.type === 'folder' && !isSelected) prefix = '+';
        
        const textContent = `${prefix}${item.name}`;
        const str = ` ${textContent}`.padEnd(colW - 1, ' ');
        
        let color = 0;
        if (isSelected) color = 2;
        else if (isHovered) color = 1;

        writeUI(1, y, str, color);
    });

    const previewW = COLS - colW;
    drawBoxUI(colW, 8, previewW, 18, 'PREVIEW');
    
    const wrapText = (text: string, maxLen: number) => {
        const lines: string[] = [];
        const words = text.split(' ');
        let currentLine = '';
        words.forEach(word => {
            if ((currentLine + word).length > maxLen) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        if (currentLine) lines.push(currentLine.trim());
        return lines;
    };

    const rootNode = uiState.navPath.length > 0 ? DIRECTORY[uiState.navPath[0]] : null;
    if (rootNode) {
        if (rootNode.type === 'folder') {
            const listW = 24;
            const detailX = colW + listW;
            const detailW = previewW - listW;

            writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
            writeUI(colW + 2, 11, '─'.repeat(listW - 4), 1);
            
            if (rootNode.children) {
                rootNode.children.forEach((child: any, idx: number) => {
                    const y = 12 + idx; // Reduced gap
                    const isSelected = uiState.navPath.length === 2 && uiState.navPath[1] === idx;
                    const isHovered = !uiState.settingsOpen && hy === y && hx >= colW + 2 && hx < colW + listW - 2;
                    const prefix = isSelected ? '[>]' : '[ ]';
                    let color = 0;
                    if (isSelected) color = 2;
                    else if (isHovered) color = 1;
                    writeUI(colW + 2, y, `${prefix} ${child.name}`, color);
                });
            }

            if (uiState.navPath.length === 2 && rootNode.children) {
                const projectNode = rootNode.children[uiState.navPath[1]];
                if (projectNode) {
                    writeUI(detailX + 2, 10, `:: ${projectNode.name} ::`, 0);
                    writeUI(detailX + 2, 11, '─'.repeat(detailW - 4), 1);
                    
                    const boxH = 7; // Reduced box height to give text more vertical room
                    const bx = detailX + 2;
                    const by = 12; // Start immediately after divider
                    const bw = detailW - 4;
                    // Draw patterned box
                    for (let i = 0; i < bw; i++) {
                        writeUI(bx + i, by, '░', 1);
                        writeUI(bx + i, by + boxH - 1, '░', 1);
                    }
                    for (let j = 0; j < boxH; j++) {
                        writeUI(bx, by + j, '░', 1);
                        writeUI(bx + bw - 1, by + j, '░', 1);
                    }
                    
                    const renderZoneStr = '[ VISUAL ASSET RENDER ZONE ]';
                    writeUI(bx + Math.floor((bw - renderZoneStr.length) / 2), by + Math.floor(boxH / 2), renderZoneStr, 1);

                    writeUI(detailX + 2, 12 + boxH, '─'.repeat(detailW - 4), 1);
                    
                    // Wrap the description text
                    const allLines: string[] = [];
                    const rawDescLines = projectNode.desc.split('\n');
                    rawDescLines.forEach((rawLine: string) => {
                        const wrapped = wrapText(rawLine, detailW - 8);
                        allLines.push(...wrapped);
                    });
                    const stackWrapped = wrapText(`Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`, detailW - 8);
                    allLines.push(...stackWrapped);

                    const maxVisible = 26 - (12 + boxH + 1);
                    const maxScroll = Math.max(0, allLines.length - maxVisible);
                    const scroll = Math.floor(Math.min(uiState.scrollOffset, maxScroll));
                    const currentY = 12 + boxH + 1;
                    
                    for (let i = 0; i < maxVisible && i + scroll < allLines.length; i++) {
                        writeUI(detailX + 2, currentY + i, allLines[i + scroll], 0);
                    }
                    if (maxScroll > 0) {
                        const sbH = maxVisible;
                        const sbThumbH = Math.max(1, Math.floor(sbH * (maxVisible / allLines.length)));
                        const sbThumbY = Math.floor((sbH - sbThumbH) * (scroll / maxScroll));
                        for (let i = 0; i < sbH; i++) {
                            const isThumb = i >= sbThumbY && i < sbThumbY + sbThumbH;
                            writeUI(COLS - 2, currentY + i, isThumb ? '█' : '│', 1);
                        }
                    }
                }
            }
        } else if (rootNode.type === 'page') {
            const isPageFocused = uiState.focusDepth === 1;
            writeUI(colW + 2, 10, `${isPageFocused ? '[>]' : '::'} ${rootNode.name} ${isPageFocused ? '' : '::'}`, isPageFocused ? 2 : 0);
            writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
            if (rootNode.content) {
                const allLines: string[] = [];
                rootNode.content.forEach((rawLine: string) => {
                    const wrapped = wrapText(rawLine, previewW - 8);
                    allLines.push(...wrapped);
                });
                const maxVisible = 13;
                const maxScroll = Math.max(0, allLines.length - maxVisible);
                const scroll = Math.floor(Math.min(uiState.scrollOffset, maxScroll));
                for (let i = 0; i < maxVisible && i + scroll < allLines.length; i++) {
                    writeUI(colW + 2, 12 + i, allLines[i + scroll], 0);
                }
                if (maxScroll > 0) {
                    const sbH = maxVisible;
                    const sbThumbH = Math.max(1, Math.floor(sbH * (maxVisible / allLines.length)));
                    const sbThumbY = Math.floor((sbH - sbThumbH) * (scroll / maxScroll));
                    for (let i = 0; i < sbH; i++) {
                        const isThumb = i >= sbThumbY && i < sbThumbY + sbThumbH;
                        writeUI(COLS - 2, 12 + i, isThumb ? '█' : '│', 1);
                    }
                }

            }
        }
    }

    drawBoxUI(0, 26, COLS, 4, 'TERMINAL')
    const prefix = '$ '
    const typedText = textRef.current
    writeUI(2, 28, prefix + typedText, 0)
    
    if (cursorVisible.current) {
        writeUI(2 + prefix.length + cursorRef.current, 28, '█', 0)
    }

    if (uiState.settingsOpen) {
       const w = 60; const h = 19;
       const boxX = Math.floor((COLS - w) / 2);
       const boxY = Math.floor((30 - h) / 2);
       
       for(let i=0; i<h; i++) {
           writeUI(boxX, boxY+i, ' '.repeat(w), 0); 
       }
       drawBoxUI(boxX, boxY, w, h, 'SETTINGS');
       
       writeUI(boxX + 4, boxY + 2, 'THEME:', 0);
       THEMES.forEach((t, i) => {
          const isMouseHover = hy === boxY + 3 + i && hx >= boxX + 6 && hx <= boxX + 26;
          const isHighlighted = uiState.settingsCursorIdx === i || isMouseHover;
          writeUI(boxX + 6, boxY + 3 + i, `[${uiState.themeIdx === i ? '*' : ' '}] ${t.name}`, isHighlighted ? 2 : 0);
       });

       writeUI(boxX + 4, boxY + 11, 'FONT:', 0);
       FONTS.forEach((f, i) => {
          const isMouseHover = hy === boxY + 12 + i && hx >= boxX + 6 && hx <= boxX + 26;
          const isHighlighted = uiState.settingsCursorIdx === 6 + i || isMouseHover;
          writeUI(boxX + 6, boxY + 12 + i, `[${uiState.fontIdx === i ? '*' : ' '}] ${f.name}`, isHighlighted ? 2 : 0);
       });

       const col2HdrX = boxX + 31;
       const col2ItmX = boxX + 33;

       writeUI(col2HdrX, boxY + 2, 'EFFECTS:', 0);
       const SLIDER_CFG = getSliders(effects, setEffects);
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
         const isHighlighted = uiState.settingsCursorIdx === 9 + i || isMouseHover;
         writeUI(col2ItmX, boxY + 3 + i, `${label}${trackStr} ${valStr}`, isHighlighted ? 2 : 0);
       });
       
       writeUI(col2HdrX, boxY + 11, 'DISPLAY:', 0);
       const ratios = ['4:3', '5:4', 'FIT SCREEN'];
       ratios.forEach((r, i) => {
           const isSel = uiState.aspectRatio === (r === 'FIT SCREEN' ? 'FLUID' : r);
           const str = `[${isSel ? '*' : ' '}] ${r}`;
           const isMouseHover = hy === boxY + 12 + i && hx >= col2ItmX && hx < col2ItmX + str.length;
           const isHighlighted = uiState.settingsCursorIdx === 15 + i || isMouseHover;
           writeUI(col2ItmX, boxY + 12 + i, str, isHighlighted ? 2 : 0);
       });

       const isCloseHover = hy === boxY + h - 3 && hx >= boxX + 25 && hx <= boxX + 33;
       const isCloseHighlighted = uiState.settingsCursorIdx === 18 || isCloseHover;
       writeUI(boxX + 25, boxY + h - 3, '[ CLOSE ]', isCloseHighlighted ? 2 : 0);
    }

    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);

    // Draw ASCII Logo bypass
    if (uiState.isBooted && !uiState.showBootPrompt) {
        ctx.save();
        ctx.font = `12px ${activeFont.css}`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = activeTheme.fg;
        const asciiArt = [
            " _   _   ___   _    _  _____   ___   _     ",
            "| \\ | | / _ \\ | |  | ||  ___| / _ \\ | |    ",
            "|  \\| |/ /_\\ \\| |  | || |_   / /_\\ \\| |    ",
            "| . ` ||  _  || |/\\| ||  _|  |  _  || |    ",
            "| |\\  || | | |\\  /\\  /| |    | | | || |____",
            "\\_| \\_/\\_| |_/ \\/  \\/ \\_|    \\_| |_/\\_____/"
        ];
        const logoX = 2 * charW;
        const logoY = 1.5 * charH;
        asciiArt.forEach((line, idx) => {
            ctx.fillText(line, logoX, logoY + (idx * 14));
        });
        
        ctx.fillStyle = activeTheme.dim;
        ctx.fillText("                  [ CREATIVE / ENGINEER ]", logoX, logoY + (6 * 14) + 4);
        ctx.restore();
    }

    textureRef.current.needsUpdate = true
  }

  useEffect(() => {
    setRedrawFn.current = drawCanvas
    drawCanvas()
  }, [uiState, effects])

  useEffect(() => {
    const interval = setInterval(() => {
      cursorVisible.current = !cursorVisible.current
      drawCanvas()
    }, 500)
    
    document.fonts.ready.then(() => drawCanvas())
    return () => clearInterval(interval)
  }, [uiState, effects])

  useFrame((state) => {
    if (!uiState.isBooted) {
        const now = Date.now();
        if (now - snakeState.current.lastMove > 80) {
            snakeState.current.lastMove = now;
            
            const cols = gridSizeRef.current.cols;
            const rows = gridSizeRef.current.rows;
            if (cols > 0 && rows > 0) {
                const s = snakeState.current;
                const head = s.body[0];
                
                // Smart AI to seek food
                const dx = s.food.x - head.x;
                const dy = s.food.y - head.y;
                
                let possibleDirs = [
                    {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
                ];
                
                // Filter out 180 degree turns and self-collisions
                possibleDirs = possibleDirs.filter(d => {
                    if (d.x === -s.dir.x && d.y === -s.dir.y) return false;
                    const checkX = (head.x + d.x + cols) % cols;
                    const checkY = (head.y + d.y + rows) % rows;
                    return !s.body.some((b: any, i: number) => i !== 0 && b.x === checkX && b.y === checkY);
                });
                
                if (possibleDirs.length > 0) {
                    // Sort by distance to food
                    possibleDirs.sort((a, b) => {
                        const distA = Math.abs(head.x + a.x - s.food.x) + Math.abs(head.y + a.y - s.food.y);
                        const distB = Math.abs(head.x + b.x - s.food.x) + Math.abs(head.y + b.y - s.food.y);
                        return distA - distB;
                    });
                    
                    // 90% chance to pick best path, 10% chance to pick random safe path for erratic movement
                    if (Math.random() > 0.1) {
                        s.dir = possibleDirs[0];
                    } else {
                        s.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    }
                }
                
                // Execute move with wrap-around
                let nx = (head.x + s.dir.x + cols) % cols;
                let ny = (head.y + s.dir.y + rows) % rows;
                
                s.body.unshift({
                    x: nx, 
                    y: ny,
                    color: SNAKE_COLORS[Math.floor(Math.random() * SNAKE_COLORS.length)]
                });
                
                if (nx === s.food.x && ny === s.food.y) {
                    s.food = {
                        x: Math.floor(Math.random() * (cols - 2)) + 1,
                        y: Math.floor(Math.random() * (rows - 2)) + 1
                    };
                } else {
                    s.body.pop();
                }
            }
        }
        if (setRedrawFn.current) setRedrawFn.current();
    }
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (bloomRef.current) {
      bloomRef.current.strength = effects.bloomAmt
      bloomRef.current.radius = effects.bloomRadius
      bloomRef.current.threshold = effects.bloomThresh
    }
    if (afterimageRef.current) {
      afterimageRef.current.uniforms.damp.value = effects.burnIn
    }
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.u_brightness.value = effects.brightness
      shaderPassRef.current.uniforms.u_saturation.value = effects.saturation
      shaderPassRef.current.uniforms.u_curvature.value = effects.curvature
      shaderPassRef.current.uniforms.u_downsample.value = effects.downsample
      shaderPassRef.current.uniforms.u_grain.value = effects.grain
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
        <unrealBloomPass ref={bloomRef} args={[undefined, effects.bloomAmt, effects.bloomRadius, effects.bloomThresh]} />
        {/* @ts-ignore */}
        <shaderPass ref={shaderPassRef} args={[CRTShader]} />
      </Effects>
    </>
  )
}

export default function WebGLTerminalPage() {
  const [uiState, setUiState] = useState({
    scrollOffset: 0,
    navPath: [0, 0],
    focusDepth: 0,
    themeIdx: 0,
    fontIdx: 0,
    settingsOpen: false,
    aspectRatio: '4:3',
    settingsCursorIdx: 0,
    isBooted: false,
    soundOn: true
  })

  const [effects, setEffects] = useState({
    bloomAmt: THEMES[0].bloom,
    bloomRadius: THEMES[0].radius,
    bloomThresh: THEMES[0].thresh,
    burnIn: THEMES[0].burnIn,
    brightness: THEMES[0].bright,
    saturation: THEMES[0].satur,
    curvature: THEMES[0].curve,
    downsample: THEMES[0].crush,
    grain: THEMES[0].grain
  })

  const hoverRef = useRef({ x: -1, y: -1 })
  const activeSliderRef = useRef(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const textRef = useRef('')
  const cursorRef = useRef(0)
  const setRedrawFn = useRef<(() => void) | null>(null)
  const gridSizeRef = useRef({ cols: 142, rows: 32, charW: 14.4, charH: 32 })

  useEffect(() => {
    const t = THEMES[uiState.themeIdx]
    setEffects({
      bloomAmt: t.bloom,
      bloomRadius: t.radius,
      bloomThresh: t.thresh,
      burnIn: t.burnIn,
      brightness: t.bright,
      saturation: t.satur,
      curvature: t.curve,
      downsample: t.crush,
      grain: t.grain
    })
  }, [uiState.themeIdx])

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
if (!uiState.isBooted) {
        initAudio();
        playBootUp();
        startHum();
        setUiState(s => ({ ...s, isBooted: true }));
        return;
    }
    if (uiState.isBooted) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            playTick();
        } else if (e.key === 'Enter') {
            playEnter();
        } else if (e.key === 'Escape') {
            playModalClose();
        } else if (e.key.length === 1 || e.key === 'Backspace') {
            playClack();
        }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.max(0, s.settingsCursorIdx - 1) }))
      } else {
          setUiState(s => {
              let currentLevel = DIRECTORY;
              for (let i = 0; i < s.focusDepth; i++) {
                  currentLevel = currentLevel[s.navPath[i]]?.children || [];
              }
              const activeNode = s.focusDepth > 0 ? DIRECTORY[s.navPath[0]] : null;
              if (s.focusDepth === 1 && activeNode && activeNode.type === 'page') {
                  return { ...s, scrollOffset: Math.max(0, s.scrollOffset - 1) };
              }
              const newPath = [...s.navPath];
              newPath[s.focusDepth] = Math.max(0, newPath[s.focusDepth] - 1);
              return { ...s, navPath: newPath, scrollOffset: 0 }
          })
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.min(18, s.settingsCursorIdx + 1) }))
      } else {
          setUiState(s => {
              let currentLevel = DIRECTORY;
              for (let i = 0; i < s.focusDepth; i++) {
                  currentLevel = currentLevel[s.navPath[i]]?.children || [];
              }
              const activeNode = s.focusDepth > 0 ? DIRECTORY[s.navPath[0]] : null;
              if (s.focusDepth === 1 && activeNode && activeNode.type === 'page') {
                  return { ...s, scrollOffset: s.scrollOffset + 1 };
              }
              const newPath = [...s.navPath];
              newPath[s.focusDepth] = Math.min(currentLevel.length - 1, newPath[s.focusDepth] + 1);
              return { ...s, navPath: newPath, scrollOffset: 0 }
          })
      }
    } else if (e.key === 'Escape') {
      setUiState(s => ({ ...s, settingsOpen: false }))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          if (uiState.settingsCursorIdx < 6) {
              setUiState(s => ({ ...s, themeIdx: s.settingsCursorIdx }))
          } else if (uiState.settingsCursorIdx < 9) {
              setUiState(s => ({ ...s, fontIdx: s.settingsCursorIdx - 6 }))
          } else if (uiState.settingsCursorIdx >= 15 && uiState.settingsCursorIdx < 18) {
              const ratios = ['4:3', '5:4', 'FLUID']
              setUiState(s => ({ ...s, aspectRatio: ratios[s.settingsCursorIdx - 15] }))
          } else if (uiState.settingsCursorIdx === 18) {
              playModalClose();
              setUiState(s => ({ ...s, settingsOpen: false }))
          }
      } else {
          // You could map 'Enter' to ArrowRight behavior when a folder is selected
          setUiState(s => {
              let currentLevel = DIRECTORY;
              for (let i = 0; i < s.focusDepth; i++) {
                  currentLevel = currentLevel[s.navPath[i]]?.children || [];
              }
              const activeNode = currentLevel[s.navPath[s.focusDepth]];
              if (activeNode && activeNode.type === 'folder' && activeNode.children) {
                  return { ...s, focusDepth: s.focusDepth + 1, navPath: [...s.navPath.slice(0, s.focusDepth + 1), 0] }
              }
              return s;
          })
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (uiState.settingsOpen && uiState.settingsCursorIdx >= 9 && uiState.settingsCursorIdx < 15) {
          e.preventDefault()
          const sliderIdx = uiState.settingsCursorIdx - 9
          const delta = e.key === 'ArrowRight' ? 0.05 : -0.05
          const SLIDER_CFG = getSliders(effects, setEffects);
          const cfg = SLIDER_CFG[sliderIdx]
          cfg.set(Math.max(cfg.min, Math.min(cfg.max, cfg.val + delta)))
      } else if (!uiState.settingsOpen) {
          e.preventDefault();
          if (e.key === 'ArrowLeft') {
              setUiState(s => {
                  if (s.focusDepth > 0) {
                      return { ...s, focusDepth: s.focusDepth - 1, navPath: s.navPath.slice(0, s.focusDepth), scrollOffset: 0 }
                  }
                  return s;
              });
          } else {
              setUiState(s => {
                  let currentLevel = DIRECTORY;
                  for (let i = 0; i < s.focusDepth; i++) {
                      currentLevel = currentLevel[s.navPath[i]]?.children || [];
                  }
                  const activeNode = currentLevel[s.navPath[s.focusDepth]];
                  if (activeNode) {
                      if (activeNode.type === 'folder' && activeNode.children) {
                          return { ...s, focusDepth: s.focusDepth + 1, navPath: [...s.navPath.slice(0, s.focusDepth + 1), 0] }
                      } else if (activeNode.type === 'page') {
                          return { ...s, focusDepth: s.focusDepth + 1 }
                      }
                  }
                  return s;
              });
          }
      }
    }
  }

  const handlePointerInteraction = (e: any, isClick: boolean) => {
    if (isClick && inputRef.current) inputRef.current.focus()

    const COLS = gridSizeRef.current.cols
    const ROWS = gridSizeRef.current.rows

    const rect = e.currentTarget.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
    
    const mult = 1.15
    const gridX = Math.floor(((nx * mult + 1) / 2) * COLS)
    const offsetY = Math.max(0, Math.floor((ROWS - 30) / 2));
    const gridY = Math.floor(((-ny * mult + 1) / 2) * ROWS) - offsetY;

    const prevHoverX = hoverRef.current.x
    const prevHoverY = hoverRef.current.y
    if (!isClick && (prevHoverX !== gridX || prevHoverY !== gridY)) {
        hoverRef.current = { x: gridX, y: gridY }
        if (setRedrawFn.current) setRedrawFn.current()
    }

if (!uiState.isBooted) {
        if (isClick) {
            initAudio();
            playBootUp();
            startHum();
            setUiState(s => ({ ...s, isBooted: true }));
        }
        return;
    }

    if (uiState.settingsOpen) {
        const w = 60; const h = 19;
        const boxX = Math.floor((COLS - w) / 2);
        const boxY = Math.floor((30 - h) / 2);
        const col2ItmX = boxX + 33;

       if (activeSliderRef.current >= 0) {
           let fraction = Math.max(0, Math.min(1, (gridX - (col2ItmX + 9)) / 8));
           const SLIDER_CFG = getSliders(effects, setEffects);
           const cfg = SLIDER_CFG[activeSliderRef.current];
           cfg.set(cfg.min + fraction * (cfg.max - cfg.min));
           return;
       }
       
       if (isClick && gridX >= boxX && gridX <= boxX + w && gridY >= boxY && gridY <= boxY + h) {
             for (let i = 0; i < THEMES.length; i++) {
                 if (gridY === boxY + 3 + i && gridX >= boxX + 6 && gridX <= boxX + 26) {
                     playTick();
                      setUiState(s => ({ ...s, themeIdx: i })); return;
                 }
             }
             for (let i = 0; i < FONTS.length; i++) {
                 if (gridY === boxY + 12 + i && gridX >= boxX + 6 && gridX <= boxX + 26) {
                     playTick();
                      setUiState(s => ({ ...s, fontIdx: i })); return;
                 }
             }
             if (gridY >= boxY + 3 && gridY <= boxY + 8 && gridX >= col2ItmX && gridX <= col2ItmX + 24) {
                 const sliderIdx = gridY - (boxY + 3);
                 activeSliderRef.current = sliderIdx;
                 playClack();
                 let fraction = Math.max(0, Math.min(1, (gridX - (col2ItmX + 9)) / 8));
                 const SLIDER_CFG = getSliders(effects, setEffects);
                 const cfg = SLIDER_CFG[sliderIdx];
                 cfg.set(cfg.min + fraction * (cfg.max - cfg.min));
                 return;
             }
             if (gridY === boxY + h - 3 && gridX >= boxX + 25 && gridX <= boxX + 33) {
                 playModalClose();
                 setUiState(s => ({ ...s, settingsOpen: false })); return;
             }
             if (gridY >= boxY + 12 && gridY <= boxY + 14 && gridX >= col2ItmX && gridX <= col2ItmX + 24) {
                  const ratios = ['4:3', '5:4', 'FLUID'];
                  playTick();
                  setUiState(s => ({ ...s, aspectRatio: ratios[gridY - (boxY + 12)] }));
                  return;
             }
            return; 
       }
    }

    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRightStr = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startX = COLS - topBarRightStr.length - 2
    if (gridY === 1 && isClick) {
       if (gridX >= startX + 14 + soundText.length + 2 && gridX < startX + 14 + soundText.length + 2 + 10) {
           window.location.href = '/'
           return
       }
       if (gridX >= startX + 14 && gridX < startX + 14 + soundText.length) {
           playTick();
           initAudio();
           startHum();
           toggleMute();
           setUiState(s => ({ ...s, soundOn: !isMuted }));
           return;
       }
       if (gridX >= startX && gridX <= startX + 11) {
           playModalOpen();
           setUiState(s => ({ ...s, settingsOpen: true }))
           return
       }
    }

    const colW = 20;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 10 && gridY < 28) {
            for (let depth = 0; depth <= uiState.navPath.length; depth++) {
                const isProjectsList = depth === 1;
                const startX = isProjectsList ? colW + 2 : 1;
                const hitW = isProjectsList ? 24 : colW - 1;
                
                if (gridX >= startX && gridX < startX + hitW) {
                    let currentLevel: any = DIRECTORY;
                    for (let i = 0; i < depth; i++) {
                        currentLevel = currentLevel?.[uiState.navPath[i]]?.children;
                    }
                    if (currentLevel) {
                        const startY = isProjectsList ? 12 : 10;
                        const idx = gridY - startY;
                        if (idx >= 0 && idx < currentLevel.length) {
                            playTick();
                            setUiState(s => {
                                const newPath = [...s.navPath.slice(0, depth), idx];
                                return { ...s, focusDepth: Math.max(s.focusDepth, depth), navPath: newPath, scrollOffset: 0 }
                            })
                            if (inputRef.current) inputRef.current.focus()
                        }
                    }
                }
            }
        }
    }
  }

  return (
    <div className="w-screen h-[100dvh] bg-black flex items-center justify-center overflow-hidden">
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          maxWidth: uiState.aspectRatio === '4:3' ? 'calc(100vh * 4/3)' : uiState.aspectRatio === '5:4' ? 'calc(100vh * 5/4)' : 'none',
          maxHeight: uiState.aspectRatio === '4:3' ? 'calc(100vw * 3/4)' : uiState.aspectRatio === '5:4' ? 'calc(100vw * 4/5)' : 'none',
          aspectRatio: uiState.aspectRatio === '4:3' ? '4/3' : uiState.aspectRatio === '5:4' ? '5/4' : 'auto'
        }}
        className="relative cursor-none touch-none"
        onWheel={(e) => {
          if (!uiState.settingsOpen) {
            setUiState(s => ({ ...s, scrollOffset: Math.max(0, s.scrollOffset + (e.deltaY > 0 ? 0.3 : -0.3)) }));
          }
        }}
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
            uiState={uiState} setUiState={setUiState}
            effects={effects} setEffects={setEffects}
            textRef={textRef} cursorRef={cursorRef} setRedrawFn={setRedrawFn}
            gridSizeRef={gridSizeRef} hoverRef={hoverRef}
          />
        </Canvas>

      <input
        ref={inputRef}
        type="text"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={syncCursor}
        onMouseUp={syncCursor}
        autoFocus
      />
      </div>
    </div>
  )
}
