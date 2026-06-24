import React from "react";
import { Undo2, Redo2, Eraser, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CanvasToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    isErasing: boolean;
    onToggleEraser: () => void;
}

export function CanvasToolbar({
    onUndo,
    onRedo,
    onClear,
    isErasing,
    onToggleEraser
}: CanvasToolbarProps) {
    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            <div className="absolute pointer-events-auto flex items-center gap-2 p-2.5 bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-neutral-200 shadow-[0_16px_40px_rgba(0,0,0,0.08)] bottom-8 left-1/2 -translate-x-1/2">
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
                
                <div className="bg-neutral-200 w-px h-8 mx-1 shrink-0" />
                
                <button
                    onClick={onClear}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white text-neutral-400 hover:text-rose-500 hover:bg-rose-50 font-medium transition-all active:scale-95 active:bg-rose-500 active:text-white active:border-rose-500 shadow-sm border border-neutral-100 px-6 h-14 shrink-0"
                    aria-label="Clear Canvas"
                >
                    <Trash2 size={20} strokeWidth={2} />
                    <span className="text-[17px]">Clear</span>
                </button>
            </div>
        </div>
    );
}
