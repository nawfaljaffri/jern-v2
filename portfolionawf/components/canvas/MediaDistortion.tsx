'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

// Custom Shader for Halftone / RGB Split / Glitch
const distortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uHover: { value: 0 }, // 0 to 1
    uResolution: { value: new THREE.Vector2() },
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
    uniform float uHover;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simple pseudo-random function
    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      // RGB Split intensity based on hover
      float splitAmount = 0.05 * uHover;
      
      // Glitch offset
      float glitchAmount = uHover * 0.1 * step(0.95, rand(vec2(uTime * 0.1, uv.y)));
      uv.x += glitchAmount;

      vec4 texColorR = texture2D(tDiffuse, vec2(uv.x + splitAmount, uv.y));
      vec4 texColorG = texture2D(tDiffuse, uv);
      vec4 texColorB = texture2D(tDiffuse, vec2(uv.x - splitAmount, uv.y));
      
      vec4 finalColor = vec4(texColorR.r, texColorG.g, texColorB.b, texColorG.a);

      // Halftone effect
      vec2 center = uv * uResolution - uResolution * 0.5;
      float angle = 0.785398;
      float scale = 4.0;
      float s = sin(angle), c = cos(angle);
      vec2 rotated = vec2(center.x * c - center.y * s, center.x * s + center.y * c);
      float pattern = cos(rotated.x / scale) * cos(rotated.y / scale);
      
      // Mix halftone pattern based on hover
      float luminance = dot(finalColor.rgb, vec3(0.299, 0.587, 0.114));
      vec3 halftoneColor = vec3(step(pattern * 0.5 + 0.5, luminance));
      
      finalColor.rgb = mix(finalColor.rgb, halftoneColor, uHover * 0.3);

      gl_FragColor = finalColor;
    }
  `
}

function ImagePlane({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const texture = useTexture(imageUrl)
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      
      // Smooth hover interpolation can be added here
      // For now, let's just make it auto-glitch over time for a brutalist feel
      materialRef.current.uniforms.uHover.value = Math.sin(state.clock.elapsedTime * 2.0) * 0.5 + 0.5;
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={distortionShader.vertexShader}
        fragmentShader={distortionShader.fragmentShader}
        uniforms={{
          ...distortionShader.uniforms,
          tDiffuse: { value: texture },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }}
      />
    </mesh>
  )
}

interface MediaDistortionProps {
  imageUrl: string
  className?: string
}

export default function MediaDistortion({ imageUrl, className }: MediaDistortionProps) {
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 45 }} // simple orthographic-like projection could also be used
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <ImagePlane imageUrl={imageUrl} />
      </Canvas>
    </div>
  )
}
