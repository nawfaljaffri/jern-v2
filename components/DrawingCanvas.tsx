"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface DrawingCanvasProps {
    word: string;
    onComplete: () => void;
    onError: () => void;
    penThickness?: number;
    penColor?: string;
    isIOS?: boolean;
    clearTrigger?: number;
}

export default function DrawingCanvas({ word, onComplete, onError, penThickness, penColor, isIOS, clearTrigger = 0 }: DrawingCanvasProps) {
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const [progress, setProgress] = useState(0);
    const [bounds, setBounds] = useState({ startX: 0, endX: 0, width: 0 });
    
    const isDrawingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const maxXRef = useRef(0);

    const getDrawCtx = useCallback(() => drawCanvasRef.current?.getContext("2d", { willReadFrequently: true }), []);
    
    const clearDrawCanvas = useCallback(() => {
        const canvas = drawCanvasRef.current;
        const ctx = getDrawCtx();
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setProgress(0);
        maxXRef.current = bounds.startX;
        hasCompletedRef.current = false;
    }, [getDrawCtx, bounds.startX]);

    // Render all 3 canvases (Background dashed, Hidden mask, Visible drawing)
    const renderCanvases = useCallback(() => {
        const bgCanvas = bgCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;
        if (!bgCanvas || !drawCanvas || !bgCanvas.parentElement) return;

        const rect = bgCanvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        // Setup dimensions for all
        [bgCanvas, drawCanvas].forEach(c => {
            if (c.width !== w || c.height !== h) {
                c.width = w;
                c.height = h;
                c.style.width = `${rect.width}px`;
                c.style.height = `${rect.height}px`;
                const ctx = c.getContext("2d");
                if (ctx) {
                    ctx.scale(dpr, dpr);
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                }
            }
        });

        if (!hiddenCanvasRef.current) {
            hiddenCanvasRef.current = document.createElement("canvas");
        }
        const hCanvas = hiddenCanvasRef.current;
        if (hCanvas.width !== w || hCanvas.height !== h) {
            hCanvas.width = w;
            hCanvas.height = h;
        }

        const bgCtx = bgCanvas.getContext("2d");
        const hCtx = hCanvas.getContext("2d", { willReadFrequently: true });
        if (!bgCtx || !hCtx) return;

        // Clear backgrounds
        bgCtx.clearRect(0, 0, rect.width, rect.height);
        hCtx.clearRect(0, 0, w, h);

        // Calculate responsive font size (clamp 3rem to 6rem based on screen width)
        const fontSizePx = Math.max(50, Math.min(100, window.innerWidth * 0.12));
        const fontStr = `800 ${fontSizePx}px sans-serif`;
        const fontStrHidden = `800 ${fontSizePx * dpr}px sans-serif`;
        
        const x = rect.width / 2;
        const y = rect.height / 2 - 20; // Shift up slightly
        const hX = w / 2;
        const hY = h / 2 - 20 * dpr;

        // 1. Draw dashed background
        bgCtx.font = fontStr;
        bgCtx.textBaseline = "middle";
        bgCtx.textAlign = "center";
        bgCtx.lineJoin = "round";
        bgCtx.lineCap = "round";
        bgCtx.strokeStyle = "#cbd5e1"; // slate-300
        bgCtx.lineWidth = 3;
        bgCtx.setLineDash([8, 8]);
        bgCtx.strokeText(word, x, y);

        // 2. Draw thick mask on hidden canvas
        hCtx.font = fontStrHidden;
        hCtx.textBaseline = "middle";
        hCtx.textAlign = "center";
        hCtx.lineJoin = "round";
        hCtx.lineCap = "round";
        hCtx.lineWidth = 44 * dpr; // Very thick hit area
        hCtx.setLineDash([]);
        hCtx.strokeText(word, hX, hY);

        // Calculate bounds for progress tracking
        const metrics = hCtx.measureText(word);
        const startX = hX - metrics.actualBoundingBoxLeft;
        const endX = hX + metrics.actualBoundingBoxRight;
        
        setBounds({ startX, endX, width: endX - startX });
        maxXRef.current = startX;

    }, [word]);

    useEffect(() => {
        renderCanvases();
        const timer = setTimeout(renderCanvases, 0);
        window.addEventListener("resize", renderCanvases);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", renderCanvases);
        };
    }, [renderCanvases]);

    useEffect(() => {
        clearDrawCanvas();
    }, [clearTrigger, clearDrawCanvas]);

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = drawCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (hasCompletedRef.current) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        isDrawingRef.current = true;
        lastPosRef.current = getPos(e);

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || !lastPosRef.current || hasCompletedRef.current) return;
        e.preventDefault();
        const currentPos = getPos(e);
        
        // 1. Validate against mask
        const dpr = window.devicePixelRatio || 1;
        const maskX = Math.round(currentPos.x * dpr);
        const maskY = Math.round(currentPos.y * dpr);
        
        const hCtx = hiddenCanvasRef.current?.getContext("2d");
        if (hCtx) {
            const pixel = hCtx.getImageData(maskX, maskY, 1, 1).data;
            if (pixel[3] === 0) { // Transparent = out of bounds!
                onError();
                isDrawingRef.current = false;
                clearDrawCanvas();
                return;
            }
        }

        // 2. Draw visible stroke
        const ctx = getDrawCtx();
        if (ctx) {
            ctx.strokeStyle = penColor || "#079669";
            const base = penThickness || 12;
            const minW = Math.max(4, base * 0.6);
            const maxW = base * 1.4;
            ctx.lineWidth = minW + (maxW - minW) * Math.min(1, e.pressure || 0.5);

            ctx.beginPath();
            ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
        }

        // 3. Update progress
        if (maskX > maxXRef.current) {
            maxXRef.current = maskX;
            // Pad the requirement slightly so they don't have to perfectly hit the last pixel
            const requiredWidth = bounds.width * 0.96; 
            const currentProgress = Math.max(0, Math.min(1, (maskX - bounds.startX) / requiredWidth));
            setProgress(currentProgress);
            
            if (currentProgress >= 1 && !hasCompletedRef.current) {
                hasCompletedRef.current = true;
                setProgress(1);
                onComplete();
            }
        }

        lastPosRef.current = currentPos;
    }, [getDrawCtx, onError, bounds, penThickness, penColor, onComplete, clearDrawCanvas]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = false;
        lastPosRef.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Background dashed text layer */}
            <canvas
                ref={bgCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />
            
            {/* Interactive Drawing Canvas */}
            <canvas
                ref={drawCanvasRef}
                className="absolute inset-0 w-full h-full touch-none z-10"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onClick={(e) => { if (isIOS) e.stopPropagation(); }}
            />
            
            {/* Global Progress Bar */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-72 h-3.5 bg-neutral-200/60 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-black/[0.04] z-20">
                <div 
                    className="h-full bg-accent transition-all duration-75 ease-out rounded-full shadow-[0_0_10px_rgba(7,150,105,0.4)]"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-400 tracking-widest z-20 uppercase">
                {Math.round(progress * 100)}%
            </div>
        </div>
    );
}
