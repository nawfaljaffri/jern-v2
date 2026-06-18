"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Word } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Volume2, Loader2, Volume1, ChevronLeft, ChevronRight, Repeat, Eraser } from "lucide-react";
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
    isSpeaking?: boolean;
    isPending?: boolean;
    isIOS?: boolean;
    isPhone?: boolean;
    isAudioRepeat?: boolean;
    penThickness?: number;
    penColor?: string;
    isLooping?: boolean;
    onToggleLoop?: () => void;
}

export default function TypingTest({ word, onComplete, onBack, onMismatch, onSpeak, onStop, isSpeaking, isPending, isIOS, isPhone, isAudioRepeat, penThickness, penColor, isLooping, onToggleLoop }: TypingTestProps) {
    const [userInput, setUserInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(true);
    const [isShaking, setIsShaking] = useState(false);
    const [audioMode, setAudioMode] = useState<"en" | "original">("en");
    const [loopCounter, setLoopCounter] = useState(0);
    const [clearTrigger, setClearTrigger] = useState(0);
    const initialMount = useRef(true);

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
    }, [word, audioMode, isAudioRepeat, onSpeak, onStop]);

    useEffect(() => {
        inputRef.current?.focus();
        setTimeout(() => {
            setUserInput("");
            setIsShaking(false);
        }, 0);
    }, [word]);

    const triggerError = useCallback(() => {
        setIsShaking(true);
        onMismatch?.();
        setTimeout(() => setIsShaking(false), 500);
    }, [onMismatch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
    }, [onComplete, word, triggerError]);

    const normalizedRomanized = React.useMemo(() => {
        return word.romanized.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
    }, [word.romanized]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();

        if (value.length > normalizedRomanized.length) {
            triggerError();
            return;
        }

        const lastIndex = value.length - 1;
        if (lastIndex >= 0 && value[lastIndex] !== normalizedRomanized[lastIndex]) {
            triggerError();
        }

        setUserInput(value);

        if (value === normalizedRomanized) {
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

    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] w-full cursor-text"
            onClick={() => {
                if (!isIOS) inputRef.current?.focus();
            }}
        >
            {/* Drawing canvas for iPad */}
            <div
                className={cn(
                    "absolute inset-0 z-10",
                    isIOS ? "pointer-events-auto" : "pointer-events-none opacity-0"
                )}
            >
                <DrawingCanvas
                    key={`${word.id}-${loopCounter}`}
                    wordId={word.id}
                    penThickness={penThickness}
                    penColor={penColor}
                    isIOS={isIOS}
                    clearTrigger={clearTrigger}
                />
                {(isIOS || isPhone) && (
                    <>
                        <button
                            onClick={() => { onBack?.(); setUserInput(""); }}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 text-muted/50 hover:text-foreground z-30 transition-colors"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={() => { onComplete(); setUserInput(""); }}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 text-muted/50 hover:text-foreground z-30 transition-colors"
                        >
                            <ChevronRight size={28} />
                        </button>
                    </>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    className="absolute opacity-0 pointer-events-none"
                    value={userInput}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus
                />
            </div>

            {/* ── Transliteration (the big typing word) ── */}
            <motion.div
                animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight select-none flex flex-wrap justify-center gap-[0.04em] mb-10 z-0"
                onClick={(e) => {
                    if (isIOS) {
                        e.stopPropagation();
                        inputRef.current?.focus();
                    }
                }}
            >
                {normalizedRomanized.split("").map((char, index) => {
                    let colorClass = "text-foreground/20";
                    if (index < userInput.length) {
                        colorClass = userInput[index] === char.toLowerCase()
                            ? "text-accent"
                            : "text-red-500";
                    }

                    return (
                        <span key={index} className="relative">
                            {isFocused && index === userInput.length && (
                                <div className="absolute -left-[0.04em] top-[0.1em] bottom-[0.1em] w-[3px] bg-accent rounded-full animate-caret" />
                            )}
                            <span className={colorClass}>
                                {char}
                            </span>
                        </span>
                    );
                })}
                {isFocused && userInput.length === normalizedRomanized.length && (
                    <span className="relative">
                        <div className="absolute -left-[0.04em] top-[0.1em] bottom-[0.1em] w-[3px] bg-accent rounded-full animate-caret" />
                    </span>
                )}
            </motion.div>

            {/* ── Original script + Definition ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "flex flex-col items-center gap-3 relative z-20",
                        isIOS ? "pointer-events-none" : "pointer-events-auto"
                    )}
                >
                    <div className={cn(
                        "text-3xl md:text-4xl font-medium text-foreground",
                        word.language === 'ar' || word.language === 'ur' ? "font-arabic" : "font-sans"
                    )} dir={word.language === 'ar' || word.language === 'ur' ? "rtl" : "ltr"}>
                        {word.original}
                    </div>
                    <div className="text-base text-muted font-normal">
                        {word.definition}
                    </div>

                    {/* ── Toolbar ── */}
                    <div className={cn(
                        "flex items-center justify-center text-muted z-10 mt-8",
                        isIOS ? "pointer-events-auto gap-1" : "gap-1"
                    )}>
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
                            {isPending ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : isSpeaking ? (
                                <Volume1 size={15} className="animate-pulse" />
                            ) : (
                                <Volume2 size={15} />
                            )}
                        </button>
                        <button
                            className={cn(
                                "p-2 rounded-lg transition-colors flex items-center justify-center relative",
                                isIOS
                                    ? "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                                    : isLooping
                                        ? "text-accent bg-accent/10"
                                        : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isIOS) {
                                    setClearTrigger(prev => prev + 1);
                                } else {
                                    onToggleLoop?.();
                                }
                            }}
                            title={isIOS ? "Erase Canvas" : "Loop Word"}
                        >
                            {isIOS ? (
                                <Eraser size={15} />
                            ) : (
                                <>
                                    <Repeat size={15} />
                                    {isLooping && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
