import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Undo2, Redo2, Eraser, Trash2, GripHorizontal, GripVertical } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ToolbarPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "left-center"
    | "right-center"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";

interface CanvasToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    isErasing: boolean;
    onToggleEraser: () => void;
}

const ZONES: { id: ToolbarPosition; boxClass: string }[] = [
    { id: "top-left", boxClass: "top-4 left-4 w-32 h-32" },
    { id: "top-center", boxClass: "top-4 left-1/3 right-1/3 h-24" },
    { id: "top-right", boxClass: "top-4 right-4 w-32 h-32" },
    { id: "left-center", boxClass: "top-1/3 bottom-1/3 left-4 w-24" },
    { id: "right-center", boxClass: "top-1/3 bottom-1/3 right-4 w-24" },
    { id: "bottom-left", boxClass: "bottom-4 left-4 w-32 h-32" },
    { id: "bottom-center", boxClass: "bottom-4 left-1/3 right-1/3 h-24" },
    { id: "bottom-right", boxClass: "bottom-4 right-4 w-32 h-32" },
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

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem("jern-toolbar-pos");
        if (saved) setPosition(saved as ToolbarPosition);
    }, []);

    useEffect(() => {
        if (position) localStorage.setItem("jern-toolbar-pos", position);
    }, [position]);

    const isVertical = position === "left-center" || position === "right-center";

    const calculateZone = (clientX: number, clientY: number): ToolbarPosition | null => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.parentElement?.getBoundingClientRect();
        if (!rect) return null;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const w = rect.width;
        const h = rect.height;

        const col = x < w / 3 ? "left" : x > (2 * w) / 3 ? "right" : "center";
        const row = y < h / 3 ? "top" : y > (2 * h) / 3 ? "bottom" : "center";

        if (row === "center" && col === "center") return position; // default to current if middle
        if (row === "center") return `${col}-center` as ToolbarPosition;
        if (col === "center") return `${row}-center` as ToolbarPosition;
        return `${row}-${col}` as ToolbarPosition;
    };

    const getPositionClasses = (pos: ToolbarPosition) => {
        switch (pos) {
            case "top-left": return "top-8 left-8";
            case "top-center": return "top-8 left-1/2 -translate-x-1/2";
            case "top-right": return "top-8 right-8";
            case "left-center": return "top-1/2 -translate-y-1/2 left-8";
            case "right-center": return "top-1/2 -translate-y-1/2 right-8";
            case "bottom-left": return "bottom-8 left-8";
            case "bottom-center": return "bottom-8 left-1/2 -translate-x-1/2";
            case "bottom-right": return "bottom-8 right-8";
            default: return "bottom-8 left-1/2 -translate-x-1/2";
        }
    };

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
                                    "absolute border-2 border-dashed rounded-2xl transition-all duration-200",
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
                layout
                drag
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
                }}
                // We use transform: none to prevent framer-motion from keeping the drag offset!
                // Wait, if we drag, framer-motion applies x and y transform.
                // We want layout animations to take over on drop.
                // We can set style={{ x: 0, y: 0 }} when not dragging.
                animate={{ x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                    "absolute pointer-events-auto flex gap-2 p-2.5 bg-white/90 backdrop-blur-md rounded-[2rem] border border-neutral-200 shadow-[0_16px_40px_rgba(0,0,0,0.08)]",
                    getPositionClasses(position),
                    isVertical ? "flex-col items-center" : "flex-row items-center",
                    isDragging ? "cursor-grabbing scale-105 shadow-2xl z-50" : "cursor-grab"
                )}
            >
                {/* Grabber Handle */}
                <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: "none" }}
                    className={cn(
                        "flex items-center justify-center text-neutral-300 hover:text-neutral-500",
                        isVertical ? "w-full h-6 order-last mt-1 border-t border-neutral-100" : "w-6 h-full order-last ml-1 border-l border-neutral-100"
                    )}
                >
                    {isVertical ? <GripHorizontal size={18} /> : <GripVertical size={18} />}
                </div>

                <div className={cn("flex gap-2", isVertical ? "flex-col" : "flex-row")}>
                    <button
                        onClick={onUndo}
                        className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all active:bg-emerald-600 active:text-white shadow-sm border border-neutral-100"
                        aria-label="Undo stroke"
                    >
                        <Undo2 size={22} strokeWidth={2} />
                    </button>
                    <button
                        onClick={onRedo}
                        className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all active:bg-emerald-600 active:text-white shadow-sm border border-neutral-100"
                        aria-label="Redo stroke"
                    >
                        <Redo2 size={22} strokeWidth={2} />
                    </button>
                    <button
                        onClick={onToggleEraser}
                        className={cn(
                            "w-14 h-14 flex items-center justify-center rounded-[1.25rem] transition-all shadow-sm border",
                            isErasing 
                                ? "bg-rose-50 text-rose-500 border-rose-100" 
                                : "bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 border-neutral-100 active:bg-emerald-600 active:text-white"
                        )}
                        aria-label="Toggle Eraser"
                    >
                        <Eraser size={22} strokeWidth={2} />
                    </button>
                    
                    <div className={cn("bg-neutral-200", isVertical ? "w-8 h-px my-1 mx-auto" : "w-px h-8 mx-1")} />
                    
                    <button
                        onClick={onClear}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-[1.25rem] bg-white text-neutral-400 hover:text-rose-500 hover:bg-rose-50 font-medium transition-all active:scale-95 active:bg-rose-500 active:text-white active:border-rose-500 shadow-sm border border-neutral-100",
                            isVertical ? "w-14 h-14" : "px-6 h-14"
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
