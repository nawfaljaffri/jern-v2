import React from "react";
import { Volume1, Volume2, Loader2, Repeat, RefreshCcw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AudioToolbarProps {
    audioMode: "en" | "original";
    setAudioMode: (mode: "en" | "original") => void;
    wordLanguage: string;
    isAudioRepeat: boolean;
    onToggleAudioRepeat?: () => void;
    isSpeaking: boolean;
    isPending: boolean;
    onSpeakClick: () => void;
    isLooping?: boolean;
    onToggleLoop?: () => void;
    variant: "ipad" | "laptop";
}

export function AudioToolbar({
    audioMode,
    setAudioMode,
    wordLanguage,
    isAudioRepeat,
    onToggleAudioRepeat,
    isSpeaking,
    isPending,
    onSpeakClick,
    isLooping,
    onToggleLoop,
    variant
}: AudioToolbarProps) {
    if (variant === "ipad") {
        return (
            <div className="mt-auto flex items-center justify-between p-2 bg-neutral-50 rounded-2xl border border-neutral-100 lg:mb-10">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setAudioMode("en")}
                        className={cn(
                            "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:bg-emerald-600 active:text-white",
                            audioMode === "en"
                                ? "bg-white text-foreground shadow-sm"
                                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 active:bg-emerald-600 active:text-white"
                        )}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setAudioMode("original")}
                        className={cn(
                            "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:bg-emerald-600 active:text-white",
                            audioMode === "original"
                                ? "bg-white text-foreground shadow-sm"
                                : "text-neutral-400 hover:text-neutral-600"
                        )}
                    >
                        {(wordLanguage || "EN").toUpperCase()}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleAudioRepeat}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-95",
                            isAudioRepeat ? "text-accent bg-accent/10" : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500"
                        )}
                        title={isAudioRepeat ? "Continuous Audio On" : "Continuous Audio Off"}
                    >
                        <Repeat size={18} />
                    </button>
                    <button
                        onClick={onSpeakClick}
                        disabled={isPending}
                        className={cn(
                            "flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 active:scale-95",
                            isSpeaking
                                ? "bg-accent text-white shadow-md"
                                : "bg-white text-accent hover:bg-accent hover:text-white shadow-sm border border-neutral-100"
                        )}
                    >
                        {isPending ? <Loader2 size={24} className="animate-spin" /> : isSpeaking ? <Volume1 size={24} className="animate-pulse" /> : <Volume2 size={24} />}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center text-muted z-10 mt-8 gap-1">
            <button
                onClick={(e) => { e.stopPropagation(); setAudioMode("en"); }}
                className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    audioMode === "en" ? "bg-accent/10 text-accent" : "hover:bg-extra-muted/50 text-muted"
                )}
            >
                EN
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setAudioMode("original"); }}
                className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    audioMode === "original" ? "bg-accent/10 text-accent" : "hover:bg-extra-muted/50 text-muted"
                )}
            >
                {(wordLanguage || "EN").toUpperCase()}
            </button>

            <div className="w-px h-4 bg-extra-muted mx-1" />

            <button
                className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                    isSpeaking ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                )}
                onClick={(e) => { e.stopPropagation(); onSpeakClick(); }}
                disabled={isPending}
                title="Play Audio"
            >
                {isPending
                    ? <Loader2 size={15} className="animate-spin" />
                    : isSpeaking
                        ? <Volume1 size={15} className="animate-pulse" />
                        : <Volume2 size={15} />}
            </button>

            <button
                className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center relative",
                    isAudioRepeat ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                )}
                onClick={(e) => { e.stopPropagation(); onToggleAudioRepeat?.(); }}
                title="Continuous Audio"
            >
                <Repeat size={15} />
                {isAudioRepeat && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
            </button>

            <div className="w-px h-4 bg-extra-muted mx-1" />

            <button
                className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center relative",
                    isLooping ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                )}
                onClick={(e) => { e.stopPropagation(); onToggleLoop?.(); }}
                title="Loop Word Practice"
            >
                <RefreshCcw size={15} />
                {isLooping && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
            </button>
        </div>
    );
}
