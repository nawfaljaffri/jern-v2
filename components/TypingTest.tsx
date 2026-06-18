"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Word } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    Volume2, Loader2, Volume1, ChevronLeft, ChevronRight,
    Repeat, Eraser, Settings, Check, BookOpen, X, Undo2, Redo2, History
} from "lucide-react";
import DrawingCanvas from "./DrawingCanvas";

const TTS_LANG_MAP: Record<string, string> = {
    ar: "ar-SA",
    ur: "ur",
    zh: "zh",
    ru: "ru",
    es: "es",
    de: "de",
    fr: "fr",
    ko: "ko",
    ja: "ja",
};

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TypingTestProps {
    word: Word;
    onComplete: () => void;
    onBack?: () => void;
    onMismatch?: () => void;
    onSpeak: (text: string, lang: string, repeat?: boolean) => void;
    onStop?: () => void;
    onUnlockAudio?: () => void;
    isSpeaking?: boolean;
    isPending?: boolean;
    isIOS?: boolean;
    isPhone?: boolean;
    isAudioRepeat?: boolean;
    penThickness?: number;
    penColor?: string;
    isLooping?: boolean;
    onToggleLoop?: () => void;
    onOpenSettings?: () => void;
    onOpenHistory?: () => void;
    arabicFontClass?: string;
    handedness: 'left' | 'right';
    mobileInputMode?: 'touch' | 'keyboard';
}

export default function TypingTest({
    word, onComplete, onBack, onMismatch, onSpeak, onStop,
    onUnlockAudio, isSpeaking, isPending, isIOS, isPhone,
    isAudioRepeat, onToggleAudioRepeat, penThickness, penColor, isLooping, onToggleLoop,
    onOpenSettings, onOpenHistory, arabicFontClass = "", handedness, mobileInputMode = 'touch',
} : TypingTestProps & { onToggleAudioRepeat?: () => void }) {
    const [userInput, setUserInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(true);
    const [isShaking, setIsShaking] = useState(false);
    const [audioMode, setAudioMode] = useState<"en" | "original">("en");
    const [loopCounter, setLoopCounter] = useState(0);
    const [clearTrigger, setClearTrigger] = useState(0);
    const [undoTrigger, setUndoTrigger] = useState(0);
    const [redoTrigger, setRedoTrigger] = useState(0);
    const [checkTrigger, setCheckTrigger] = useState(0);
    const [isExplainerOpen, setIsExplainerOpen] = useState(false);
    const isRightHanded = handedness === 'right';
    const initialMount = useRef(true);
    const hasUnlockedRef = useRef(false);
    const isCompletingRef = useRef(false);

    // ── Audio auto-play ───────────────────────────────────────────────────
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const text = audioMode === "en" ? word.definition : word.original;
        const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");

        if (initialMount.current) {
            timeout = setTimeout(() => {
                onSpeak(text, lang || "en-US", !!isAudioRepeat);
                initialMount.current = false;
            }, 400);
        } else {
            onSpeak(text, lang || "en-US", !!isAudioRepeat);
        }

        return () => {
            clearTimeout(timeout);
            onStop?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [word, audioMode, isAudioRepeat]);

    // ── Focus & reset on word change ─────────────────────────────────────
    useEffect(() => {
        isCompletingRef.current = false;
        if (!isIOS) inputRef.current?.focus();
        setUserInput("");
        setIsShaking(false);
    }, [word, isIOS]);

    // ── Error shake ────────────────────────────────────────────────────────
    const triggerError = useCallback(() => {
        setIsShaking(true);
        onMismatch?.();
        setTimeout(() => setIsShaking(false), 500);
    }, [onMismatch]);


    // ── Normalized target (strip diacritics, keep only [a-z0-9]) ─────────
    const normalizedRomanized = React.useMemo(() => {
        return word.romanized
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/gi, "")
            .toLowerCase()
            .trim();
    }, [word.romanized]);

    // ── Keyboard shortcuts (laptop) ────────────────────────────────────────
    useEffect(() => {
        if (isIOS) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onBack?.();
                setUserInput("");
                return;
            }
            if (e.key === "Tab" || e.key === "Escape" || e.key === "ArrowRight") {
                e.preventDefault();
                triggerError();
                setTimeout(() => {
                    onComplete();
                    setUserInput("");
                }, 300);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onComplete, onBack, triggerError, isIOS]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.toLowerCase();

        if (!hasUnlockedRef.current) {
            onUnlockAudio?.();
            hasUnlockedRef.current = true;
        }

        if (raw.length > normalizedRomanized.length) {
            triggerError();
            return;
        }

        for (let i = 0; i < raw.length; i++) {
            if (raw[i] !== normalizedRomanized[i]) {
                triggerError();
                if (raw.length >= userInput.length) return;
                break;
            }
        }

        setUserInput(raw);

        if (raw === normalizedRomanized) {
            setTimeout(() => {
                if (isLooping) {
                    setUserInput("");
                    setLoopCounter(prev => prev + 1);
                    const text = audioMode === "en" ? word.definition : word.original;
                    const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");
                    onSpeak(text, lang || "en-US", !!isAudioRepeat);
                } else {
                    onComplete();
                    setUserInput("");
                }
            }, 150);
        }
    };

    const isArabicScript = word.language === "ar" || word.language === "ur";
    const targetFontClass = isArabicScript ? arabicFontClass || "font-arabic" : "font-sans";

    const chars = normalizedRomanized.split("");
    const renderChars = chars.map((char, index) => {
        let colorClass = "text-foreground/20";
        if (index < userInput.length) {
            colorClass = userInput[index] === char
                ? "text-accent"
                : "text-red-500";
        }
        return { char, colorClass };
    });

    const useTouchLayout = (isIOS && !isPhone) || (isPhone && mobileInputMode === "touch");

    if (useTouchLayout) {
        return (
            <div className="fixed inset-0 overflow-hidden bg-extra-muted/20">
                <div className={cn(
                    "flex h-full w-full",
                    isIOS && !isPhone ? (isRightHanded ? "flex-col-reverse lg:flex-row-reverse" : "flex-col-reverse lg:flex-row") : "flex-col-reverse md:flex-row"
                )}>
                    {/* ── Left Pane: Massive Tracing Canvas (70%) ── */}
                    <div className="flex-1 flex flex-col relative h-full bg-white/50">
                    <div className="absolute inset-0 z-10 pointer-events-auto">
                        <DrawingCanvas
                            key={`${word.id}-${loopCounter}`}
                            word={word}
                            onComplete={() => {
                                if (isCompletingRef.current) return;
                                isCompletingRef.current = true;
                                setTimeout(() => {
                                    if (isLooping) {
                                        setLoopCounter(p => p + 1);
                                        const text = audioMode === "en" ? word.definition : word.original;
                                        const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");
                                        onSpeak(text, lang || "en-US", !!isAudioRepeat);
                                        isCompletingRef.current = false;
                                    } else {
                                        onComplete();
                                    }
                                }, 600);
                            }}
                            onError={triggerError}
                            penThickness={penThickness}
                            penColor={penColor}
                            isIOS={isIOS}
                            clearTrigger={clearTrigger}
                            undoTrigger={undoTrigger}
                            redoTrigger={redoTrigger}
                            checkTrigger={checkTrigger}
                            targetFontClass={targetFontClass}
                        />
                    </div>

                    <div 
                        className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-6 z-30"
                        style={{ transform: "translateY(-5%)" }}
                    >
                        <button
                            onClick={() => { 
                                if (isCompletingRef.current) return;
                                isCompletingRef.current = true;
                                onBack?.(); 
                                setUserInput(""); 
                            }}
                            aria-label="Previous word"
                            className="w-16 h-32 flex items-center justify-center group pointer-events-auto rounded-2xl active:bg-emerald-600 active:text-white transition-colors"
                        >
                            <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-black/5 shadow-sm group-hover:bg-white group-active:bg-transparent transition-all">
                                <ChevronLeft className="w-8 h-8 text-neutral-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
                            </span>
                        </button>
                        <button
                            onClick={() => { 
                                if (isCompletingRef.current) return;
                                isCompletingRef.current = true;
                                onComplete(); 
                                setUserInput(""); 
                            }}
                            aria-label="Skip word"
                            className="w-16 h-32 flex items-center justify-center group pointer-events-auto rounded-2xl active:bg-emerald-600 active:text-white transition-colors"
                        >
                            <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-black/5 shadow-sm group-hover:bg-white group-active:bg-transparent transition-all">
                                <ChevronRight className="w-8 h-8 text-neutral-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
                            </span>
                        </button>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 z-30 pointer-events-auto flex justify-center">
                        <div className="flex items-center gap-2 p-2.5 bg-white rounded-[2rem] border border-neutral-100 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
                            <button
                                onClick={() => setUndoTrigger(p => p + 1)}
                                className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all active:bg-emerald-600 active:text-white shadow-sm border border-neutral-100"
                                aria-label="Undo stroke"
                            >
                                <Undo2 size={22} strokeWidth={2} />
                            </button>
                            <button
                                onClick={() => setRedoTrigger(p => p + 1)}
                                className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-white text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all active:bg-emerald-600 active:text-white shadow-sm border border-neutral-100"
                                aria-label="Redo stroke"
                            >
                                <Redo2 size={22} strokeWidth={2} />
                            </button>
                            <div className="w-px h-8 bg-neutral-200 mx-1" />
                            <button
                                onClick={() => setClearTrigger(p => p + 1)}
                                className="px-8 h-14 flex items-center gap-2 rounded-[1.25rem] bg-white text-neutral-400 hover:text-neutral-600 font-medium transition-all active:scale-95 active:bg-neutral-50 shadow-sm border border-neutral-100"
                            >
                                <Eraser size={20} strokeWidth={2} />
                                <span className="text-[17px]">Clear</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Right Pane: Permanent Explainer (30%) ── */}
                <div className="w-full lg:w-[420px] h-[35%] lg:h-full shrink-0 bg-white border-b lg:border-b-0 lg:border-l border-neutral-100 flex flex-col z-40 relative shadow-sm lg:shadow-none">
                    <div 
                        className="flex-1 overflow-y-auto px-10 custom-scrollbar"
                        style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 32px) + 12px)' }}
                    >
                        <div className="space-y-4 mb-10">
                            <div className="text-base font-semibold tracking-wide text-neutral-400 capitalize pb-2">
                                Dictionary
                            </div>
                            
                            <div className={cn("text-4xl font-medium text-foreground py-2", arabicFontClass)} dir={isArabicScript ? "rtl" : "ltr"}>
                                {word.original}
                            </div>
                            
                            <div className="text-3xl text-accent font-medium">{word.romanized}</div>
                            
                            <div className="text-xl text-neutral-600 leading-relaxed mt-4">{word.definition}</div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-2xl border border-neutral-100 mb-10">
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
                                    {(word.language || "EN").toUpperCase()}
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
                                    onClick={() => {
                                        onUnlockAudio?.();
                                        const text = audioMode === "en" ? word.definition : word.original;
                                        const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");
                                        onSpeak(text, lang || "en-US", !!isAudioRepeat);
                                    }}
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

                        {/* Explainer Notes */}
                        <div className="p-6 bg-neutral-50/80 rounded-3xl space-y-4 border border-neutral-100/60">
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={16} /> Etymology & Notes
                            </h3>
                            <p className="text-base text-neutral-600 leading-relaxed">
                                {word.notes || "No detailed notes found for this word in the database. Add notes to dataPack to see them here."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── Laptop / Desktop Layout — unchanged structure ───────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] w-full cursor-text pb-16 md:pb-24"
            onClick={() => inputRef.current?.focus()}
        >
            <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                value={userInput}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
            />

            {/* ── Definition display (Top) ── */}
            <div className="flex flex-col items-center justify-center px-8 z-0 select-none pointer-events-none mb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={word.id}
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.22, ease: [0.32, 0, 0.2, 1] }}
                        className="flex flex-col items-center gap-2 w-full"
                    >
                        <div className="text-3xl md:text-4xl text-neutral-400 font-medium text-center max-w-2xl leading-relaxed">
                            {word.definition}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Transliteration */}
            <motion.div
                animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight select-none flex flex-wrap justify-center gap-[0.04em] mb-10 z-0"
            >
                {renderChars.map(({ char, colorClass }, index) => (
                    <span key={index} className="relative">
                        {isFocused && index === userInput.length && (
                            <span className="absolute -left-[0.04em] top-[0.1em] bottom-[0.1em] w-[3px] bg-accent rounded-full animate-caret" />
                        )}
                        <span className={colorClass}>{char}</span>
                    </span>
                ))}
                {isFocused && userInput.length === normalizedRomanized.length && (
                    <span className="relative">
                        <span className="absolute -left-[0.04em] top-[0.1em] bottom-[0.1em] w-[3px] bg-accent rounded-full animate-caret" />
                    </span>
                )}
            </motion.div>

            {/* Original script + definition */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-3 z-20"
                >
                    <div
                        className={cn(
                            "text-6xl md:text-7xl lg:text-[5rem] font-normal text-neutral-400",
                            targetFontClass
                        )}
                        dir={isArabicScript ? "rtl" : "ltr"}
                    >
                        {word.original}
                    </div>
                    {/* Toolbar */}
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
                            {(word.language || "EN").toUpperCase()}
                        </button>

                        <div className="w-px h-4 bg-extra-muted mx-1" />

                        <button
                            className={cn(
                                "p-2 rounded-lg transition-colors flex items-center justify-center",
                                isSpeaking ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                const text = audioMode === "en" ? word.definition : word.original;
                                const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");
                                onSpeak(text, lang || "en-US", !!isAudioRepeat);
                            }}
                            disabled={isPending}
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
                                isLooping ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                            )}
                            onClick={(e) => { e.stopPropagation(); onToggleLoop?.(); }}
                            title="Loop Word"
                        >
                            <Repeat size={15} />
                            {isLooping && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
