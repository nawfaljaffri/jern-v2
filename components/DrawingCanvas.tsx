"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Word } from "@/lib/types";

interface Point { x: number; y: number; pressure: number }
interface Path { points: Point[]; thickness: number; color: string }

interface DrawingCanvasProps {
    word: Word;
    onComplete: () => void;
    onError: () => void;
    penThickness?: number;
    penColor?: string;
    isIOS?: boolean;
    clearTrigger?: number;
    checkTrigger?: number;
    undoTrigger?: number;
    redoTrigger?: number;
    targetFontClass?: string;
}

export default function DrawingCanvas({
    word, onComplete, onError, penThickness, penColor,
    isIOS, clearTrigger = 0, checkTrigger = 0, undoTrigger = 0, redoTrigger = 0, targetFontClass
}: DrawingCanvasProps) {
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const isDrawingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    
    const [paths, setPaths] = useState<Path[]>([]);
    const [redoStack, setRedoStack] = useState<Path[]>([]);
    const currentPathRef = useRef<Point[]>([]);

    const getDrawCtx = useCallback(() => drawCanvasRef.current?.getContext("2d", { willReadFrequently: true }), []);
    
    const redrawAllPaths = useCallback(() => {
        const canvas = drawCanvasRef.current;
        const ctx = getDrawCtx();
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        paths.forEach(path => {
            if (path.points.length < 2) return;
            ctx.strokeStyle = path.color;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            for (let i = 1; i < path.points.length; i++) {
                const prev = path.points[i - 1];
                const curr = path.points[i];
                
                const minW = Math.max(8, path.thickness * 0.8);
                const maxW = path.thickness * 1.5;
                ctx.lineWidth = minW + (maxW - minW) * Math.min(1, curr.pressure);
                
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.stroke();
            }
        });
    }, [paths, getDrawCtx]);

    const clearDrawCanvas = useCallback(() => {
        setPaths([]);
        setRedoStack([]);
        currentPathRef.current = [];
        hasCompletedRef.current = false;
        
        const canvas = drawCanvasRef.current;
        const ctx = getDrawCtx();
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
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

        // NEW HIERARCHY: Tracing text (Romanized) is large and on top.
        const romFontSize = Math.max(70, Math.min(160, rect.width * 0.18));
        const arabicFontSize = Math.max(40, Math.min(80, rect.width * 0.08));
        
        // Use weight 500 for Arabic so it's not too thick
        const arFont = `500 ${arabicFontSize}px ${getArabicFontString()}`;
        const romFont = `800 ${romFontSize}px sans-serif`;
        const romFontHidden = `800 ${romFontSize * dpr}px sans-serif`;

        const topY = rect.height / 2 - (rect.height * 0.05);
        const bottomY = rect.height / 2 + (rect.height * 0.20);
        const hTopY = h / 2 - (h * 0.05);

        bgCtx.textAlign = "center";
        bgCtx.textBaseline = "middle";
        bgCtx.lineJoin = "round";
        bgCtx.lineCap = "round";

        // Neutral gray
        const traceColor = "#f5f5f5";
        
        // Top text (Romanized)
        bgCtx.font = romFont;
        bgCtx.fillStyle = traceColor;
        bgCtx.fillText(word.romanized, x, topY);

        // Bottom text (Arabic)
        bgCtx.font = arFont;
        const isAr = word.language === 'ar' || word.language === 'ur';
        bgCtx.fillText(isAr ? word.original : "", x, bottomY);

        // Hidden Mask (for validation against Romanized)
        hCtx.textAlign = "center";
        hCtx.textBaseline = "middle";
        hCtx.lineJoin = "round";
        hCtx.lineCap = "round";
        
        hCtx.fillStyle = "black";
        hCtx.strokeStyle = "black";
        hCtx.lineWidth = 70 * dpr; 

        hCtx.font = romFontHidden;
        hCtx.fillText(word.romanized, hX, hTopY);
        hCtx.strokeText(word.romanized, hX, hTopY);

        // Make sure drawings scale correctly when resized
        redrawAllPaths();

    }, [word, targetFontClass, redrawAllPaths]);

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
        if (undoTrigger === 0) return;
        setPaths(p => {
            if (p.length === 0) return p;
            const newPaths = [...p];
            const popped = newPaths.pop();
            if (popped) setRedoStack(r => [...r, popped]);
            return newPaths;
        });
    }, [undoTrigger]);

    useEffect(() => {
        if (redoTrigger === 0) return;
        setRedoStack(r => {
            if (r.length === 0) return r;
            const newStack = [...r];
            const popped = newStack.pop();
            if (popped) setPaths(p => [...p, popped]);
            return newStack;
        });
    }, [redoTrigger]);

    useEffect(() => {
        redrawAllPaths();
    }, [paths, redrawAllPaths]);

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
        } else if (drawnPixels > 100) { // Require at least some drawing
            hasCompletedRef.current = true;
            onComplete();
        } else {
            onError();
        }
        
    }, [checkTrigger, onComplete, onError]);

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = drawCanvasRef.current;
        if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure || 0.5 };
    };

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (hasCompletedRef.current) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        isDrawingRef.current = true;
        const pos = getPos(e);
        currentPathRef.current = [pos];

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || hasCompletedRef.current) return;
        e.preventDefault();
        const currentPos = getPos(e);
        
        const prevPos = currentPathRef.current[currentPathRef.current.length - 1];
        currentPathRef.current.push(currentPos);
        
        const ctx = getDrawCtx();
        if (ctx && prevPos) {
            ctx.strokeStyle = penColor || "#059669"; // emerald-600
            const base = penThickness || 16;
            const minW = Math.max(8, base * 0.8);
            const maxW = base * 1.5;
            ctx.lineWidth = minW + (maxW - minW) * Math.min(1, currentPos.pressure);

            ctx.beginPath();
            ctx.moveTo(prevPos.x, prevPos.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
        }

    }, [getDrawCtx, penThickness, penColor]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        
        const newPath = [...currentPathRef.current];
        if (newPath.length > 0) {
            setPaths(p => [...p, {
                points: newPath,
                thickness: penThickness || 16,
                color: penColor || "#059669"
            }]);
            setRedoStack([]); // Clear redo stack on new action
        }
        currentPathRef.current = [];

        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    }, [penThickness, penColor]);

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
