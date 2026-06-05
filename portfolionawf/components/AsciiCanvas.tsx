'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AsciiCanvas() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        camera.position.z = 600;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Character Atlas (White Text for Black Background)
        const chars = ['N','A','W','F','L','@','#','*','+','!','0','x','?'];
        const atlasSize = 512;
        const charSize = 128;
        const canvas = document.createElement('canvas');
        canvas.width = atlasSize; canvas.height = atlasSize;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 95px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        chars.forEach((char, i) => {
            const x = (i % 4) * charSize + charSize / 2;
            const y = Math.floor(i / 4) * charSize + charSize / 2;
            ctx.fillText(char, x, y);
        });
        
        const atlasTexture = new THREE.CanvasTexture(canvas);
        atlasTexture.magFilter = atlasTexture.minFilter = THREE.NearestFilter;

        // 3. Pixel-Sampled Geometry Generation
        const letters = ['N', 'A', 'W', 'F', 'A', 'L'];
        const letterGeometries: THREE.BufferGeometry[] = [];
        const fontCanvas = document.createElement('canvas');
        const fontCtx = fontCanvas.getContext('2d')!;
        fontCanvas.width = 256; fontCanvas.height = 256;

        letters.forEach(letter => {
            fontCtx.clearRect(0, 0, 256, 256);
            fontCtx.fillStyle = 'white';
            fontCtx.font = 'bold 200px Arial';
            fontCtx.textAlign = 'center';
            fontCtx.textBaseline = 'middle';
            fontCtx.fillText(letter, 128, 128);
            
            const imageData = fontCtx.getImageData(0, 0, 256, 256).data;
            const positions: number[] = [];
            const randoms: number[] = [];
            
            for (let y = 0; y < 256; y += 6) { 
                for (let x = 0; x < 256; x += 6) {
                    const alpha = imageData[(y * 256 + x) * 4 + 3];
                    if (alpha > 180) {
                        positions.push((x - 128) * 1.8, (128 - y) * 1.8, 0);
                        randoms.push(Math.random());
                    }
                }
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('rnd', new THREE.Float32BufferAttribute(randoms, 1));
            letterGeometries.push(geo);
        });

        // 4. Custom Shader Material
        const asciiShaderMaterial = new THREE.ShaderMaterial({
            uniforms: { uAtlas: { value: atlasTexture }, uTime: { value: 0 } },
            vertexShader: `
                attribute float rnd;
                varying float vRnd;
                void main() {
                    vRnd = rnd;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 40.0; 
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D uAtlas;
                uniform float uTime;
                varying float vRnd;
                void main() {
                    float charIndex = floor(mod(vRnd * 100.0 + uTime * 4.0, 14.0));
                    float col = mod(charIndex, 4.0);
                    float row = floor(charIndex / 4.0);
                    vec2 uv = (gl_PointCoord + vec2(col, 3.0 - row)) / 4.0;
                    vec4 tex = texture2D(uAtlas, uv);
                    if (tex.a < 0.5) discard;
                    
                    // Output pure white particles for the black background
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
                }
            `,
            transparent: true
        });

        const pointCloud = new THREE.Points(letterGeometries[0], asciiShaderMaterial);
        scene.add(pointCloud);

        // 5. Interactivity & Container-Aware Mouse Tracking
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            if (!container) return;
            const rect = container.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left - rect.width / 2);
            mouse.y = (e.clientY - rect.top - rect.height / 2);
        };
        window.addEventListener('mousemove', onMouseMove);

        let frameCount = 0;
        let letterIndex = 0;
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            frameCount++;
            asciiShaderMaterial.uniforms.uTime.value = frameCount * 0.05;
            
            // Smoothly rotate toward mouse position
            pointCloud.rotation.y = THREE.MathUtils.lerp(pointCloud.rotation.y, mouse.x / 1200, 0.05);
            pointCloud.rotation.x = THREE.MathUtils.lerp(pointCloud.rotation.x, mouse.y / 1200, 0.05);
            
            // Swap letter geometry every 20 frames
            if (frameCount % 20 === 0) {
                letterIndex = (letterIndex + 1) % letterGeometries.length;
                pointCloud.geometry = letterGeometries[letterIndex];
            }
            renderer.render(scene, camera);
        };

        // 6. Dynamic Resizing
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
        resizeObserver.observe(container);

        animate();

        // 7. Strict Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
        };
    }, []);

    // The container acts as the anchor point for the WebGL canvas
    return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
}
