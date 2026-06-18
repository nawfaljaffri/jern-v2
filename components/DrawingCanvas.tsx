"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Word } from "@/lib/types";

interface DrawingCanvasProps {
    word: Word;
    onComplete: () => void;
    onError: () => void;
    penThickness?: number;
    penColor?: string;
    isIOS?: boolean;
    clearTrigger?: number;
    checkTrigger?: number;
    targetFontClass?: string;
}

export default function DrawingCanvas({
    word, onComplete, onError, penThickness, penColor,
    isIOS, clearTrigger = 0, checkTrigger = 0, targetFontClass
}: DrawingCanvasProps) {
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const isDrawingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    const getDrawCtx = useCallback(() => drawCanvasRef.current?.getContext("2d", { willReadFrequently: true }), []);
    
    const clearDrawCanvas = useCallback(() => {
        const canvas = drawCanvasRef.current;
        const ctx = getDrawCtx();
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasCompletedRef.current = false;
    }, [getDrawCtx]);

    const getArabicFontString = () => {
        const isAr = word.language === 'ar' || word.language === 'ur';
        if (!isAr) return "sans-serif";
        if (targetFontClass?.includes("font-arabic")) {
            if (typeof window !== "undefined") {
                const computed = getComputedStyle(document.body).getPropertyValue('--font-arabic');
                if (computed) return computed;
            }
        }
        return "sans-serif";
    };

    const renderCanvases = useCallback(() => {
        const bgCanvas = bgCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;
        if (!bgCanvas || !drawCanvas || !bgCanvas.parentElement) return;

        const rect = bgCanvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

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

        bgCtx.clearRect(0, 0, rect.width, rect.height);
        hCtx.clearRect(0, 0, w, h);

        const x = rect.width / 2;
        const hX = w / 2;

        // Sizing based on viewport width (or container width)
        const isAr = word.language === 'ar' || word.language === 'ur';
        const arabicFontSize = Math.max(70, Math.min(160, rect.width * 0.18));
        const romFontSize = Math.max(50, Math.min(90, rect.width * 0.1));
        
        const arFont = `800 ${arabicFontSize}px ${getArabicFontString()}`;
        const arFontHidden = `800 ${arabicFontSize * dpr}px ${getArabicFontString()}`;
        const romFont = `800 ${romFontSize}px sans-serif`;
        const romFontHidden = `800 ${romFontSize * dpr}px sans-serif`;

        const topText = isAr ? word.original : word.romanized;
        
        const topY = rect.height / 2 - (rect.height * 0.05);
        const bottomY = rect.height / 2 + (rect.height * 0.15);
        const hTopY = h / 2 - (h * 0.05);
        const hBottomY = h / 2 + (h * 0.15);

        bgCtx.textAlign = "center";
        bgCtx.textBaseline = "middle";
        bgCtx.lineJoin = "round";
        bgCtx.lineCap = "round";

        // Light gray solid fill
        const traceColor = "#e2e8f0"; // slate-200
        
        // Top text
        bgCtx.font = arFont;
        bgCtx.fillStyle = traceColor;
        bgCtx.fillText(topText, x, topY);

        // Bottom text (Romanized)
        bgCtx.font = romFont;
        bgCtx.fillText(word.romanized, x, bottomY);

        // Hidden Mask
        hCtx.textAlign = "center";
        hCtx.textBaseline = "middle";
        hCtx.lineJoin = "round";
        hCtx.lineCap = "round";
        
        hCtx.fillStyle = "black";
        hCtx.strokeStyle = "black";
        hCtx.lineWidth = 70 * dpr; 

        hCtx.font = arFontHidden;
        hCtx.fillText(topText, hX, hTopY);
        hCtx.strokeText(topText, hX, hTopY);

        hCtx.font = romFontHidden;
        hCtx.lineWidth = 50 * dpr;
        hCtx.fillText(word.romanized, hX, hBottomY);
        hCtx.strokeText(word.romanized, hX, hBottomY);

    }, [word, targetFontClass]);

    useEffect(() => {
        renderCanvases();
        const timer = setTimeout(renderCanvases, 150);
        window.addEventListener("resize", renderCanvases);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", renderCanvases);
        };
    }, [renderCanvases]);

    useEffect(() => {
        if (clearTrigger > 0) clearDrawCanvas();
    }, [clearTrigger, clearDrawCanvas]);

    useEffect(() => {
        if (checkTrigger === 0) return;
        
        const drawCanvas = drawCanvasRef.current;
        const hCanvas = hiddenCanvasRef.current;
        const ctx = drawCanvas?.getContext("2d", { willReadFrequently: true });
        const hCtx = hCanvas?.getContext("2d", { willReadFrequently: true });
        
        if (!drawCanvas || !hCanvas || !ctx || !hCtx) return;

        const w = drawCanvas.width;
        const h = drawCanvas.height;

        const drawData = ctx.getImageData(0, 0, w, h);
        const maskData = hCtx.getImageData(0, 0, w, h);

        let outOfBoundsPixels = 0;
        let drawnPixels = 0;

        for (let i = 0; i < drawData.data.length; i += 4) {
            if (drawData.data[i + 3] > 0) {
                if (drawData.data[i] === 255 && drawData.data[i+1] === 0 && drawData.data[i+2] === 0) {
                    continue; 
                }
                drawnPixels++;
                if (maskData.data[i + 3] === 0) {
                    outOfBoundsPixels++;
                    drawData.data[i] = 255;   // R
                    drawData.data[i + 1] = 0; // G
                    drawData.data[i + 2] = 0; // B
                    drawData.data[i + 3] = 255; // A
                }
            }
        }

        if (outOfBoundsPixels > 50) {
            ctx.putImageData(drawData, 0, 0);
            onError();
        } else if (drawnPixels > 200) {
            hasCompletedRef.current = true;
            onComplete();
        } else {
            onError();
        }
        
    }, [checkTrigger, onComplete, onError]);

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
        
        const ctx = getDrawCtx();
        if (ctx) {
            ctx.strokeStyle = penColor || "#059669"; // emerald-600
            const base = penThickness || 16;
            const minW = Math.max(8, base * 0.8);
            const maxW = base * 1.5;
            ctx.lineWidth = minW + (maxW - minW) * Math.min(1, e.pressure || 0.5);

            ctx.beginPath();
            ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
        }

        lastPosRef.current = currentPos;
    }, [getDrawCtx, penThickness, penColor]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = false;
        lastPosRef.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <canvas
                ref={bgCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />
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
        </div>
    );
}
