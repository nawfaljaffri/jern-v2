"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Word } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    Volume2, Loader2, Volume1, ChevronLeft, ChevronRight,
    Repeat, Eraser, Settings, Check, BookOpen, X
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
    arabicFontClass?: string;
    mobileInputMode?: 'touch' | 'keyboard';
}

export default function TypingTest({
    word, onComplete, onBack, onMismatch, onSpeak, onStop,
    onUnlockAudio, isSpeaking, isPending, isIOS, isPhone,
    isAudioRepeat, penThickness, penColor, isLooping, onToggleLoop,
    onOpenSettings, arabicFontClass, mobileInputMode = 'touch',
}: TypingTestProps) {
    const [userInput, setUserInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(true);
    const [isShaking, setIsShaking] = useState(false);
    const [audioMode, setAudioMode] = useState<"en" | "original">("en");
    const [loopCounter, setLoopCounter] = useState(0);
    const [clearTrigger, setClearTrigger] = useState(0);
    const [checkTrigger, setCheckTrigger] = useState(0);
    const [isExplainerOpen, setIsExplainerOpen] = useState(false);
    const [wiktionaryData, setWiktionaryData] = useState<string | null>(null);
    const [isFetchingWiktionary, setIsFetchingWiktionary] = useState(false);
    const initialMount = useRef(true);
    const hasUnlockedRef = useRef(false);

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

    // ── Wiktionary Fetcher ────────────────────────────────────────────────
    useEffect(() => {
        if (!isExplainerOpen || wiktionaryData !== null) return;
        let isMounted = true;
        
        async function fetchInfo() {
            setIsFetchingWiktionary(true);
            try {
                // Wiktionary REST API for definition
                const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.original)}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                
                // Extract first meaningful text
                let extracted = "No detailed etymology found.";
                if (data && data[word.language === 'ar' ? 'Arabic' : 'English']) {
                    const langData = data[word.language === 'ar' ? 'Arabic' : 'English'];
                    if (langData.length > 0 && langData[0].definitions) {
                        // Strip HTML from definitions
                        const rawHtml = langData[0].definitions[0].definition;
                        const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
                        extracted = doc.body.textContent || "";
                    }
                }
                if (isMounted) setWiktionaryData(extracted);
            } catch (err) {
                if (isMounted) setWiktionaryData("Could not load detailed dictionary information for this word.");
            } finally {
                if (isMounted) setIsFetchingWiktionary(false);
            }
        }
        
        fetchInfo();
        
        return () => { isMounted = false; };
    }, [isExplainerOpen, word.original, word.language, wiktionaryData]);

    // ── Normalized target (strip diacritics, keep only [a-z0-9]) ─────────
    // BUG FIX: computed once per word, never stale
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
            // ArrowLeft: go back to previous word
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onBack?.();
                setUserInput("");
                return;
            }
            // Tab / Escape / ArrowRight: skip word (counts as error)
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

    // ── Input handler — validates full prefix, not just last char ─────────
    // BUG FIX: validates every character from 0..value.length to prevent
    // stuck-green state after backspace sequences
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.toLowerCase();

        // iOS audio unlock — first interaction with the hidden input
        if (!hasUnlockedRef.current) {
            onUnlockAudio?.();
            hasUnlockedRef.current = true;
        }

        // Don't accept input longer than the target
        if (raw.length > normalizedRomanized.length) {
            triggerError();
            return;
        }

        // BUG FIX: Validate the *entire* prefix, not just the last character.
        // This prevents the "stuck green after backspace" state because we only
        // accept the new value if it is a valid prefix of the target word.
        for (let i = 0; i < raw.length; i++) {
            if (raw[i] !== normalizedRomanized[i]) {
                triggerError();
                // Accept the backspace (shorter string) but reject new incorrect chars
                // Only reject if this is a new character being appended
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

    // ── Character coloring ─────────────────────────────────────────────────
    const chars = normalizedRomanized.split("");
    const renderChars = chars.map((char, index) => {
        let colorClass = "text-foreground/20";
        if (index < userInput.length) {
            // BUG FIX: compare from full input, not just last — eliminates
            // stale green chars after complex backspace + retype sequences
            colorClass = userInput[index] === char
                ? "text-accent"
                : "text-red-500";
        }
        return { char, colorClass };
    });

    // ─────────────────────────────────────────────────────────────────────────
    // ── Touch Layout (iPad & Phone hybrid) ──────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    const useTouchLayout = (isIOS && !isPhone) || (isPhone && mobileInputMode === "touch");

    if (useTouchLayout) {
        return (
            <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
                {/* ── Drawing canvas (full viewport) ── */}
                <div className="absolute inset-0 z-10 pointer-events-auto">
                    <DrawingCanvas
                        key={`${word.id}-${loopCounter}`}
                        word={word}
                        onComplete={() => {
                            setTimeout(() => {
                                if (isLooping) {
                                    setLoopCounter(p => p + 1);
                                    const text = audioMode === "en" ? word.definition : word.original;
                                    const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");
                                    onSpeak(text, lang || "en-US", !!isAudioRepeat);
                                } else {
                                    onComplete();
                                }
                            }, 600); // Wait so they can see green result
                        }}
                        onError={triggerError}
                        penThickness={penThickness}
                        penColor={penColor}
                        isIOS={isIOS}
                        clearTrigger={clearTrigger}
                        checkTrigger={checkTrigger}
                        targetFontClass={targetFontClass}
                    />
                </div>

                {/* ── Definition display (Top) ── */}
                <div className="absolute top-[8%] left-0 right-0 flex flex-col items-center justify-center px-8 z-20 pointer-events-none">
                    <div className="text-[clamp(1.1rem,2vw,1.4rem)] text-neutral-400 font-medium text-center max-w-xl leading-relaxed bg-white/40 backdrop-blur-md px-6 py-2 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/50">
                        {word.definition}
                    </div>
                </div>

                {/* ── Left / Right navigation — Flex Container ── */}
                <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-4 z-30">
                    <button
                        onClick={() => { onBack?.(); setUserInput(""); }}
                        aria-label="Previous word"
                        className="w-16 h-32 flex items-center justify-center group pointer-events-auto"
                    >
                        <span className="flex items-center justify-center w-12 h-24 rounded-[20px] bg-white/70 backdrop-blur-xl border border-black/[0.04] shadow-[0_8px_24px_rgba(0,0,0,0.06)] text-neutral-400 group-hover:text-neutral-700 group-active:scale-90 transition-all duration-200">
                            <ChevronLeft size={32} strokeWidth={2.5} />
                        </span>
                    </button>
                    <button
                        onClick={() => { onComplete(); setUserInput(""); }}
                        aria-label="Skip word"
                        className="w-16 h-32 flex items-center justify-center group pointer-events-auto"
                    >
                        <span className="flex items-center justify-center w-12 h-24 rounded-[20px] bg-white/70 backdrop-blur-xl border border-black/[0.04] shadow-[0_8px_24px_rgba(0,0,0,0.06)] text-neutral-400 group-hover:text-neutral-700 group-active:scale-90 transition-all duration-200">
                            <ChevronRight size={32} strokeWidth={2.5} />
                        </span>
                    </button>
                </div>

                {/* ── Bottom Toolbar — ultra tactile ── */}
                <div className="absolute bottom-6 left-0 right-0 z-30 pointer-events-auto flex justify-center">
                    <div className="flex items-center justify-between gap-3 p-2 bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                        
                        {/* Audio Controls (Grouped) */}
                        <div className="flex items-center p-1.5 bg-neutral-100/80 rounded-2xl">
                            <div className="flex items-center gap-1 mr-2">
                                <button
                                    onClick={() => setAudioMode("en")}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95",
                                        audioMode === "en"
                                            ? "bg-white text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                                            : "text-neutral-400 hover:text-neutral-600"
                                    )}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setAudioMode("original")}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95",
                                        audioMode === "original"
                                            ? "bg-white text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                                            : "text-neutral-400 hover:text-neutral-600"
                                    )}
                                >
                                    {(word.language || "EN").toUpperCase()}
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    onUnlockAudio?.();
                                    const text = audioMode === "en" ? word.definition : word.original;
                                    const lang = audioMode === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");
                                    onSpeak(text, lang || "en-US", !!isAudioRepeat);
                                }}
                                disabled={isPending}
                                className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 active:scale-95",
                                    isSpeaking
                                        ? "bg-accent text-white shadow-md"
                                        : "bg-white text-neutral-500 hover:text-foreground shadow-sm"
                                )}
                            >
                                {isPending ? <Loader2 size={20} className="animate-spin" /> : isSpeaking ? <Volume1 size={20} className="animate-pulse" /> : <Volume2 size={20} />}
                            </button>
                        </div>

                        {/* Check / Clear */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCheckTrigger(p => p + 1)}
                                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold bg-accent text-white hover:bg-accent/90 transition-all duration-200 active:scale-95 shadow-[0_8px_20px_rgba(7,150,105,0.25)]"
                            >
                                <Check size={22} />
                                <span>Check</span>
                            </button>
                            <button
                                onClick={() => setClearTrigger(p => p + 1)}
                                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-neutral-500 hover:text-red-500 transition-all duration-200 active:scale-95 shadow-sm border border-neutral-100"
                            >
                                <Eraser size={22} />
                            </button>
                        </div>

                        {/* Explainer */}
                        <button
                            onClick={() => setIsExplainerOpen(true)}
                            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-neutral-500 hover:text-neutral-800 transition-all duration-200 active:scale-95 shadow-sm border border-neutral-100"
                            aria-label="Explain Word"
                        >
                            <BookOpen size={22} />
                        </button>

                        {/* Settings */}
                        <button
                            onClick={onOpenSettings}
                            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-neutral-500 hover:text-neutral-800 transition-all duration-200 active:scale-95 shadow-sm border border-neutral-100"
                            aria-label="Settings"
                        >
                            <Settings size={22} />
                        </button>
                    </div>
                </div>

                {/* ── Explainer Side Panel ── */}
                <AnimatePresence>
                    {isExplainerOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
                                onClick={() => setIsExplainerOpen(false)}
                            />
                            <motion.div
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col pointer-events-auto"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-extra-muted">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                        <BookOpen size={20} className="text-accent" />
                                        Explainer
                                    </h2>
                                    <button onClick={() => setIsExplainerOpen(false)} className="text-muted hover:text-foreground bg-extra-muted/30 p-2 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    <div className="space-y-2">
                                        <div className={cn("text-4xl font-medium", targetFontClass)} dir={isArabicScript ? "rtl" : "ltr"}>
                                            {word.original}
                                        </div>
                                        <div className="text-lg text-accent font-medium">{word.romanized}</div>
                                        <div className="text-base text-neutral-600">{word.definition}</div>
                                    </div>
                                    
                                    <div className="p-5 bg-extra-muted/20 rounded-2xl space-y-3 border border-extra-muted/50">
                                        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Dictionary Data</h3>
                                        {isFetchingWiktionary ? (
                                            <div className="flex items-center gap-2 text-muted text-sm">
                                                <Loader2 size={16} className="animate-spin" /> Fetching Wiktionary...
                                            </div>
                                        ) : (
                                            <p className="text-sm text-neutral-700 leading-relaxed">
                                                {wiktionaryData}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── Laptop / Desktop Layout — unchanged structure ───────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] w-full cursor-text"
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
            <div className="absolute top-[12%] left-0 right-0 flex flex-col items-center justify-center px-8 z-0 select-none pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={word.id}
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.22, ease: [0.32, 0, 0.2, 1] }}
                        className="flex flex-col items-center gap-2 w-full"
                    >
                        <div className="text-[clamp(1.2rem,2.5vw,1.6rem)] text-neutral-400 font-medium text-center max-w-2xl leading-relaxed">
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
                            "text-3xl md:text-4xl font-medium text-foreground",
                            targetFontClass
                        )}
                        dir={isArabicScript ? "rtl" : "ltr"}
                    >
                        {word.original}
                    </div>
                    <div className="text-base text-muted font-normal">{word.definition}</div>

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
