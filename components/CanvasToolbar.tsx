import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue } from "framer-motion";
import { Undo2, Redo2, Eraser, Trash2, GripHorizontal, GripVertical } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ToolbarPosition =
    | "top-center"
    | "bottom-center"
    | "left-top"
    | "left-bottom"
    | "right-top"
    | "right-bottom";

interface CanvasToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    isErasing: boolean;
    onToggleEraser: () => void;
}

const ZONES: { id: ToolbarPosition; boxClass: string }[] = [
    { id: "top-center", boxClass: "top-28 left-1/2 -translate-x-1/2 w-[364px] h-[76px]" },
    { id: "bottom-center", boxClass: "bottom-8 left-1/2 -translate-x-1/2 w-[364px] h-[76px]" },
    { id: "left-top", boxClass: "top-32 left-8 w-[76px] h-[330px]" },
    { id: "left-bottom", boxClass: "bottom-8 left-8 w-[76px] h-[330px]" },
    { id: "right-top", boxClass: "top-32 right-8 w-[76px] h-[330px]" },
    { id: "right-bottom", boxClass: "bottom-8 right-8 w-[76px] h-[330px]" },
];

export function CanvasToolbar({
    onUndo,
    onRedo,
    onClear,
    isErasing,
    onToggleEraser
}: CanvasToolbarProps) {
    const [position, setPosition] = useState<ToolbarPosition>("bottom-center");
    const [isDragging, setIsDragging] = useState(false);
    const [activeZone, setActiveZone] = useState<ToolbarPosition | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const isVertical = position.includes("left") || position.includes("right");

    const calculateZone = (clientX: number, clientY: number): ToolbarPosition | null => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.parentElement?.getBoundingClientRect();
        if (!rect) return null;

        const cx = clientX - rect.left;
        const cy = clientY - rect.top;
        const w = rect.width;
        const h = rect.height;

        const targetPoints = [
            { id: "top-center", x: w / 2, y: 112 },
            { id: "bottom-center", x: w / 2, y: h - 50 },
            { id: "left-top", x: 50, y: 200 },
            { id: "left-bottom", x: 50, y: h - 200 },
            { id: "right-top", x: w - 50, y: 200 },
            { id: "right-bottom", x: w - 50, y: h - 200 },
        ];

        let closestZone: ToolbarPosition = "bottom-center";
        let minDist = Infinity;

        for (const pt of targetPoints) {
            const dist = Math.pow(pt.x - cx, 2) + Math.pow(pt.y - cy, 2);
            if (dist < minDist) {
                minDist = dist;
                closestZone = pt.id as ToolbarPosition;
            }
        }
        
        return closestZone;
    };

    const getPositionClasses = (pos: ToolbarPosition) => {
        switch (pos) {
            case "top-center": return "top-28 left-1/2 -translate-x-1/2";
            case "bottom-center": return "bottom-8 left-1/2 -translate-x-1/2";
            case "left-top": return "top-32 left-8";
            case "left-bottom": return "bottom-8 left-8";
            case "right-top": return "top-32 right-8";
            case "right-bottom": return "bottom-8 right-8";
            default: return "bottom-8 left-1/2 -translate-x-1/2";
        }
    };

    const grabberClass = position.includes("right") 
        ? (isVertical ? "w-full h-12 order-first mb-1 border-b border-neutral-100" : "w-12 h-full order-first mr-1 border-r border-neutral-100") 
        : (isVertical ? "w-full h-12 order-first mb-1 border-b border-neutral-100" : "w-12 h-full order-last ml-1 border-l border-neutral-100");

    return (
        <div className="absolute inset-0 pointer-events-none z-40" ref={containerRef}>
            {/* Drop Zones Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        {ZONES.map(zone => (
                            <div
                                key={zone.id}
                                className={cn(
                                    "absolute border-2 border-dashed rounded-[2.5rem] transition-all duration-200",
                                    zone.boxClass,
                                    activeZone === zone.id 
                                        ? "border-emerald-400 bg-emerald-400/20 scale-105" 
                                        : "border-neutral-300 bg-neutral-200/20"
                                )}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                drag
                dragConstraints={containerRef}
                dragElastic={0.1}
                style={{ x, y }}
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDrag={(e, info) => {
                    const zone = calculateZone(info.point.x, info.point.y);
                    if (zone) setActiveZone(zone);
                }}
                onDragEnd={(e, info) => {
                    setIsDragging(false);
                    setActiveZone(null);
                    const zone = calculateZone(info.point.x, info.point.y);
                    if (zone) setPosition(zone);
                    // Explicitly reset drag offset to 0 so it snaps instantly to the exact CSS position
                    x.set(0);
                    y.set(0);
                }}
                className={cn(
                    "absolute pointer-events-auto flex gap-2 p-2.5 bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-neutral-200 shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-shadow",
                    getPositionClasses(position),
                    isVertical ? "flex-col items-center w-[76px] h-[330px]" : "flex-row items-center w-[364px] h-[76px]",
                    isDragging ? "cursor-grabbing scale-105 shadow-2xl z-50" : "cursor-grab"
                )}
            >
                {/* Grabber Handle */}
                <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: "none" }}
                    className={cn(
                        "flex items-center justify-center text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 rounded-2xl active:bg-neutral-200 transition-colors shrink-0",
                        grabberClass
                    )}
                >
                    {isVertical ? <GripHorizontal size={24} /> : <GripVertical size={24} />}
                </div>

                <div className={cn("flex gap-2 w-full h-full items-center justify-center", isVertical ? "flex-col" : "flex-row")}>
                    <button
                        onClick={onUndo}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all active:bg-emerald-600 active:text-white shadow-sm border border-neutral-100 shrink-0"
                        aria-label="Undo stroke"
                    >
                        <Undo2 size={22} strokeWidth={2} />
                    </button>
                    <button
                        onClick={onRedo}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all active:bg-emerald-600 active:text-white shadow-sm border border-neutral-100 shrink-0"
                        aria-label="Redo stroke"
                    >
                        <Redo2 size={22} strokeWidth={2} />
                    </button>
                    <button
                        onClick={onToggleEraser}
                        className={cn(
                            "w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-sm border shrink-0",
                            isErasing 
                                ? "bg-rose-50 text-rose-500 border-rose-100" 
                                : "bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 border-neutral-100 active:bg-emerald-600 active:text-white"
                        )}
                        aria-label="Toggle Eraser"
                    >
                        <Eraser size={22} strokeWidth={2} />
                    </button>
                    
                    <div className={cn("bg-neutral-200 shrink-0", isVertical ? "w-8 h-px my-1 mx-auto" : "w-px h-8 mx-1")} />
                    
                    <button
                        onClick={onClear}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl bg-white text-neutral-400 hover:text-rose-500 hover:bg-rose-50 font-medium transition-all active:scale-95 active:bg-rose-500 active:text-white active:border-rose-500 shadow-sm border border-neutral-100 shrink-0",
                            isVertical ? "w-14 h-14" : "w-[90px] h-14"
                        )}
                        aria-label="Clear Canvas"
                    >
                        <Trash2 size={20} strokeWidth={2} />
                        {!isVertical && <span className="text-[17px]">Clear</span>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
