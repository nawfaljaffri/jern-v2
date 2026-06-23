"use client";

import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { Word } from "@/lib/types";

interface Point { x: number; y: number; pressure: number }
interface Path { points: Point[]; thickness: number; color: string }

export interface DrawingCanvasRef {
    clear: () => void;
    undo: () => void;
    redo: () => void;
    check: () => void;
}

interface DrawingCanvasProps {
    word: Word;
    onComplete: () => void;
    onError: () => void;
    penThickness?: number;
    penColor?: string;
    isIOS?: boolean;
    targetFontClass?: string;
    arabicFont?: string;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
    word, onComplete, onError, penThickness, penColor,
    isIOS, targetFontClass, arabicFont
}, ref) => {
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const isDrawingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    
    const [paths, setPaths] = useState<Path[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [redoStack, setRedoStack] = useState<Path[]>([]);
    const currentPathRef = useRef<Point[]>([]);
    const lastDimsRef = useRef({ w: 0, h: 0 });

    const getDrawCtx = useCallback(() => drawCanvasRef.current?.getContext("2d", { willReadFrequently: true }), []);
    
    const redrawAllPaths = useCallback(() => {
        const canvas = drawCanvasRef.current;
        const ctx = getDrawCtx();
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        paths.forEach(path => {
            if (path.points.length < 2) return;
            
            const isErase = path.color === "erase";
            ctx.globalCompositeOperation = isErase ? "destination-out" : "source-over";
            ctx.strokeStyle = isErase ? "rgba(0,0,0,1)" : path.color;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = isErase ? path.thickness * 4 : path.thickness;
            
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let i = 1; i < path.points.length; i++) {
                const prev = path.points[i - 1];
                const curr = path.points[i];
                
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;
                
                ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }
            
            const last = path.points[path.points.length - 1];
            ctx.lineTo(last.x, last.y);
            ctx.stroke();
        });
        
        ctx.globalCompositeOperation = "source-over";
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

    const renderCanvases = useCallback(() => {
        const getArabicFontString = () => {
            const isAr = word.language === 'ar' || word.language === 'ur';
            if (!isAr) return "sans-serif";
            
            switch (arabicFont) {
                case "system": return "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
                case "cairo": return '"Cairo", sans-serif';
                case "scheherazade": return '"Scheherazade New", serif';
                default: return "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
            }
        };
        const bgCanvas = bgCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;
        if (!bgCanvas || !drawCanvas || !bgCanvas.parentElement) return;

        const rect = bgCanvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        if (lastDimsRef.current.w > 0) {
            const dw = Math.abs(lastDimsRef.current.w - w);
            const dh = Math.abs(lastDimsRef.current.h - h);
            // If dimensions changed significantly (e.g. rotation), clear the canvas
            if (dw > 100 || dh > 100) {
                setPaths([]);
                setRedoStack([]);
                currentPathRef.current = [];
            }
        }
        lastDimsRef.current = { w, h };

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

        const isAr = word.language === 'ar' || word.language === 'ur';
        const baseRomFont = `800 ${Math.max(70, Math.min(160, rect.width * 0.18))}px sans-serif`;
        const baseArFont = `500 ${Math.max(55, Math.min(100, rect.width * 0.11))}px ${getArabicFontString()}`;

        const fontsToLoad = [document.fonts.load(baseRomFont)];
        if (isAr) fontsToLoad.push(document.fonts.load(baseArFont));

        Promise.all(fontsToLoad).then(() => {
            if (!bgCanvasRef.current || !drawCanvasRef.current) return;

            bgCtx.clearRect(0, 0, rect.width, rect.height);
            hCtx.clearRect(0, 0, w, h);

            const x = rect.width / 2;
            const hX = w / 2;

            let romFontSize = Math.max(70, Math.min(160, rect.width * 0.18));
            bgCtx.font = `800 ${romFontSize}px sans-serif`;
            const textWidth = bgCtx.measureText(word.romanized).width;
            if (textWidth > rect.width * 0.65) {
                romFontSize = Math.max(30, romFontSize * ((rect.width * 0.65) / textWidth));
            }

            let arabicFontSize = Math.max(55, Math.min(100, rect.width * 0.11));
            if (isAr) {
                bgCtx.font = `500 ${arabicFontSize}px ${getArabicFontString()}`;
                const arTextWidth = bgCtx.measureText(word.original).width;
                if (arTextWidth > rect.width * 0.65) {
                    arabicFontSize = Math.max(20, arabicFontSize * ((rect.width * 0.65) / arTextWidth));
                }
            }
            
            const arFont = `500 ${arabicFontSize}px ${getArabicFontString()}`;
            const romFont = `800 ${romFontSize}px sans-serif`;
            const romFontHidden = `800 ${romFontSize * dpr}px sans-serif`;

            const topY = rect.height / 2 - (rect.height * 0.05);
            const bottomY = rect.height / 2 + (rect.height * 0.17);
            const hTopY = h / 2 - (h * 0.05);

            bgCtx.textAlign = "center";
            bgCtx.textBaseline = "middle";
            bgCtx.lineJoin = "round";
            bgCtx.lineCap = "round";

            // Neutral gray (slightly darker)
            const traceColor = "#ebebeb";
            
            // Top text (Romanized)
            bgCtx.font = romFont;
            bgCtx.fillStyle = traceColor;
            bgCtx.fillText(word.romanized, x, topY);

            // Bottom text (Arabic)
            bgCtx.font = arFont;
            bgCtx.fillText(isAr ? word.original : "", x, bottomY);

            // Hidden Mask (for validation against Romanized)
            hCtx.textAlign = "center";
            hCtx.textBaseline = "middle";
            hCtx.lineJoin = "round";
            hCtx.lineCap = "round";
            
            hCtx.fillStyle = "black";
            hCtx.strokeStyle = "black";
            hCtx.lineWidth = (romFontSize * 0.45) * dpr; 

            hCtx.font = romFontHidden;
            hCtx.fillText(word.romanized, hX, hTopY);
            hCtx.strokeText(word.romanized, hX, hTopY);

            // Make sure drawings scale correctly when resized
            redrawAllPaths();
        });

    }, [word, targetFontClass, arabicFont, redrawAllPaths]);

    useEffect(() => {
        const initTimer = setTimeout(renderCanvases, 0);
        const timer = setTimeout(renderCanvases, 150);
        window.addEventListener("resize", renderCanvases);
        return () => {
            clearTimeout(initTimer);
            clearTimeout(timer);
            window.removeEventListener("resize", renderCanvases);
        };
    }, [renderCanvases]);

    const handleUndo = useCallback(() => {
        setPaths(p => {
            if (p.length === 0) return p;
            const newPaths = [...p];
            const popped = newPaths.pop();
            if (popped) setRedoStack(r => [...r, popped]);
            return newPaths;
        });
    }, []);

    const handleRedo = useCallback(() => {
        setRedoStack(r => {
            if (r.length === 0) return r;
            const newStack = [...r];
            const popped = newStack.pop();
            if (popped) setPaths(p => [...p, popped]);
            return newStack;
        });
    }, []);

    const handleCheck = useCallback(() => {
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
    }, [onComplete, onError]);

    useImperativeHandle(ref, () => ({
        clear: clearDrawCanvas,
        undo: handleUndo,
        redo: handleRedo,
        check: handleCheck
    }), [clearDrawCanvas, handleUndo, handleRedo, handleCheck]);

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
        
        const pathLen = currentPathRef.current.length;
        const prevPos = currentPathRef.current[pathLen - 1];
        currentPathRef.current.push(currentPos);
        
        const ctx = getDrawCtx();
        if (ctx && prevPos) {
            const isErase = penColor === "erase";
            ctx.globalCompositeOperation = isErase ? "destination-out" : "source-over";
            ctx.strokeStyle = isErase ? "rgba(0,0,0,1)" : (penColor || "#059669");
            ctx.lineWidth = isErase ? (penThickness || 8) * 4 : (penThickness || 8);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.beginPath();
            const prevPrev = pathLen >= 2 ? currentPathRef.current[pathLen - 2] : null;
            
            if (!prevPrev) {
                ctx.moveTo(prevPos.x, prevPos.y);
                ctx.lineTo(currentPos.x, currentPos.y);
            } else {
                const midX = (prevPos.x + currentPos.x) / 2;
                const midY = (prevPos.y + currentPos.y) / 2;
                
                ctx.moveTo(prevPrev.x, prevPrev.y);
                ctx.quadraticCurveTo(prevPos.x, prevPos.y, midX, midY);
            }
            ctx.stroke();
            
            // reset composite
            ctx.globalCompositeOperation = "source-over";
        }

    }, [getDrawCtx, penThickness, penColor]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        
        const newPath = [...currentPathRef.current];
        if (newPath.length > 0) {
            setPaths(p => [...p, {
                points: newPath,
                thickness: penThickness || 8,
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
});

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;
