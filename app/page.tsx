"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TypingTest from "@/components/TypingTest";
import { LANGUAGES, FREQUENCY_TIERS, ARABIC_FONTS, DEFAULT_ARABIC_FONT } from "@/lib/constants";
import { Word, Language, Difficulty, SessionSettings, ArabicFont } from "@/lib/types";
import { transliterate } from "@/lib/transliterate";
import { useTTS } from "@/hooks/useTTS";
import {
    Settings, History, Volume2, Globe, ChevronRight, ChevronDown,
    RotateCcw, Search, Info, X, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useVirtualizer } from "@tanstack/react-virtual";
import Flag from "react-world-flags";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Returns the Tailwind / CSS utility class for the selected Arabic font
function getArabicFontClass(font: ArabicFont): string {
    const map: Record<ArabicFont, string> = {
        system: "font-arabic",
        cairo: "font-arabic", // default — overridden by data attr
        amiri: "font-arabic",
        kufam: "font-arabic",
        "noto-kufi": "font-arabic",
        tajawal: "font-arabic",
        scheherazade: "font-arabic",
    };
    return map[font] ?? "font-arabic";
}

export default function Home() {
    const [settings, setSettings] = useState<SessionSettings>({
        language: "ar",
        difficulty: "beginner",
        audioRepeat: false,
        activeRecall: true,
        arabicFont: DEFAULT_ARABIC_FONT,
        mobileInputMode: "touch",
    });

    const [dataPack, setDataPack] = useState<Word[]>([]);
    const [upcomingWords, setUpcomingWords] = useState<Word[]>([]);
    const [history, setHistory] = useState<Word[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [expandedLangInHistory, setExpandedLangInHistory] = useState<Language | null>("ar");
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const { speak, stop, unlockAudio, voices, isSpeaking, isPending } = useTTS();
    const [isIOS, setIsIOS] = useState(false);
    const [isPhone, setIsPhone] = useState(false);

    const wordsSinceRecallRef = useRef(0);

    // ── Device detection ──────────────────────────────────────────────────
    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const ua = navigator.userAgent;
        const ipad = /iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const iphone = /iPhone|iPod/i.test(ua);
        const androidPhone = /Android/i.test(ua) && /Mobile/i.test(ua);
        setIsIOS(ipad || iphone);
        setIsPhone(iphone || androidPhone || window.innerWidth < 768);
        if (ipad) setSettings(prev => ({ ...prev, audioRepeat: true }));
    }, []);

    // ── Apply Arabic font to body data attribute ──────────────────────────
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.setAttribute("data-arabic-font", settings.arabicFont ?? DEFAULT_ARABIC_FONT);
    }, [settings.arabicFont]);

    // ── History from localStorage ─────────────────────────────────────────
    useEffect(() => {
        try {
            const saved = localStorage.getItem("jern-history");
            if (saved) setHistory(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    // ── Voice check for iOS ───────────────────────────────────────────────
    const isVoiceMissing = React.useMemo(() => {
        if (!isIOS) return false;
        if (voices.length === 0) return false;
        const langCode = LANGUAGES.find(l => l.value === settings.language)?.ttsLocale || "en-US";
        let matched = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
        if (!matched) {
            const base = langCode.split("-")[0].toLowerCase();
            matched = voices.find(v => v.lang.toLowerCase().startsWith(base));
        }
        return !matched;
    }, [voices, settings.language, isIOS]);

    // ── Data loader ───────────────────────────────────────────────────────
    const loadDataPack = useCallback(async (lang: Language) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/data/${lang}.json`);
            const data = await res.json();
            setDataPack(data);
            setUpcomingWords([]);
        } catch (err) {
            console.error("Failed to load data pack:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDataPack(settings.language);
    }, [settings.language, loadDataPack]);

    // ── Word queue refill ─────────────────────────────────────────────────
    const refillUpcoming = useCallback((currentHistory: Word[]) => {
        if (dataPack.length === 0) return;

        setUpcomingWords(prev => {
            const needed = 6 - prev.length;
            if (needed <= 0) return prev;

            const newWords: Word[] = [];
            const excludeIds = [...prev.map(w => w.id)];
            const langHistory = currentHistory.filter(w => w.language === settings.language);
            const historyExclusionLimit = dataPack.length < 50 ? 5 : langHistory.length;
            const historyToExclude = langHistory.slice(0, historyExclusionLimit).map(w => w.id);
            const fullExclude = [...excludeIds, ...historyToExclude];

            for (let i = 0; i < needed; i++) {
                if (settings.activeRecall && langHistory.length > 0 && wordsSinceRecallRef.current >= 5) {
                    const recallWord = langHistory[Math.floor(Math.random() * langHistory.length)];
                    newWords.push(recallWord);
                    fullExclude.push(recallWord.id);
                    excludeIds.push(recallWord.id);
                    wordsSinceRecallRef.current = 0;
                } else {
                    const tier = FREQUENCY_TIERS[settings.difficulty];
                    let pool = dataPack.filter(w =>
                        (w.frequency || 0) >= tier.min &&
                        (w.frequency || 0) <= tier.max &&
                        !fullExclude.includes(w.id)
                    );

                    if (pool.length === 0) {
                        pool = dataPack.filter(w =>
                            (w.frequency || 0) >= tier.min &&
                            (w.frequency || 0) <= tier.max &&
                            !excludeIds.includes(w.id)
                        );
                    }
                    if (pool.length === 0) pool = dataPack.filter(w => !excludeIds.includes(w.id));
                    if (pool.length === 0) pool = dataPack;

                    if (pool.length > 0) {
                        const nextWord = pool[Math.floor(Math.random() * pool.length)];
                        newWords.push({
                            ...nextWord,
                            romanized: nextWord.romanized || transliterate(nextWord.original, settings.language),
                        });
                        fullExclude.push(nextWord.id);
                        excludeIds.push(nextWord.id);
                        wordsSinceRecallRef.current += 1;
                    }
                }
            }
            return [...prev, ...newWords];
        });
    }, [dataPack, settings.difficulty, settings.activeRecall, settings.language]);

    useEffect(() => {
        if (dataPack.length > 0 && upcomingWords.length < 3) refillUpcoming(history);
    }, [dataPack, refillUpcoming, history, upcomingWords.length]);

    const currentWord = upcomingWords[0];

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleComplete = useCallback(() => {
        if (!currentWord) return;
        setHistory(prev => {
            if (prev.find(w => w.id === currentWord.id)) return prev;
            const updated = [currentWord, ...prev].slice(0, 500);
            localStorage.setItem("jern-history", JSON.stringify(updated));
            return updated;
        });
        setUpcomingWords(prev => prev.slice(1));
    }, [currentWord]);

    const handleBack = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const lastMastered = prev[0];
            setUpcomingWords(q => [lastMastered, ...q]);
            const newHistory = prev.slice(1);
            localStorage.setItem("jern-history", JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const updateSettings = (updates: Partial<SessionSettings>) => {
        setSettings(prev => {
            const isQueueReset =
                (updates.language && updates.language !== prev.language) ||
                (updates.difficulty && updates.difficulty !== prev.difficulty);
            if (isQueueReset) setUpcomingWords([]);
            return { ...prev, ...updates };
        });
        if (updates.audioRepeat === false) stop();
    };

    const groupedHistory = LANGUAGES.map(lang => ({
        ...lang,
        words: history.filter(w => w.language === lang.value || w.id.startsWith(lang.value)),
    })).filter(g => g.words.length > 0);

    const arabicFontClass = getArabicFontClass(settings.arabicFont ?? DEFAULT_ARABIC_FONT);

    // ── Loading screen ────────────────────────────────────────────────────
    if (isLoading && upcomingWords.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-1.5">
                    {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <main className={cn(
            "min-h-screen bg-background text-foreground flex flex-col font-sans",
            isIOS ? "overflow-hidden" : "overflow-hidden"
        )}>
            {/* ─── Header (laptop only) ─────────────────────────────────────── */}
            {!isIOS && (
                <header className="px-6 md:px-8 py-5 flex justify-between items-center z-20 shrink-0">
                    <div className="flex items-center cursor-pointer group" onClick={() => window.location.reload()}>
                        <h1 className="text-xl font-bold tracking-tight text-foreground group-hover:opacity-70 transition-opacity">
                            JERN<span className="text-accent">.</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-5">
                        <button onClick={() => setIsInfoOpen(true)} className="text-muted hover:text-foreground transition-colors" aria-label="About">
                            <Info className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsHistoryOpen(true)} className="text-muted hover:text-foreground transition-colors relative" aria-label="Lexicon">
                            <History className="w-5 h-5" />
                            {history.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
                        </button>
                        <button onClick={() => setIsSettingsOpen(true)} className="text-muted hover:text-foreground transition-colors" aria-label="Settings">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>
            )}

            {/* ─── Status bar (laptop only) ─────────────────────────────────── */}
            {!isIOS && (
                <div className="flex justify-between items-center px-6 md:px-8 pb-2 z-10 shrink-0">
                    <span className="text-sm text-muted/50 font-medium capitalize">
                        {LANGUAGES.find(l => l.value === settings.language)?.label} · {settings.difficulty}
                    </span>
                    <span className="text-sm text-muted/50 font-medium">{history.length} practiced</span>
                </div>
            )}

            {/* ─── iPad: top bar (language + mastered) ─────────────────────── */}
            {isIOS && (
                <div className={`fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-10 pt-[max(env(safe-area-inset-top),32px)] pb-4 pointer-events-none ${!isPhone ? (settings.handedness === 'left' ? "lg:pr-[450px]" : "lg:pl-[450px]") : ""}`}>
                    <span className="text-base font-semibold text-neutral-400 capitalize tracking-wide">
                        {LANGUAGES.find(l => l.value === settings.language)?.label} · {settings.difficulty}
                    </span>
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <button
                                className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md border border-black/[0.06] shadow-sm text-neutral-500 hover:text-neutral-800 transition-all active:scale-95"
                                onClick={() => setIsHistoryOpen(true)}
                                aria-label="History"
                            >
                                <History size={20} />
                            </button>
                            {history.length > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-accent rounded-full text-[11px] font-bold text-white flex items-center justify-center border-[2px] border-white shadow-sm pointer-events-none">
                                    {history.length}
                                </span>
                            )}
                        </div>
                        <button
                            className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md border border-black/[0.06] shadow-sm text-neutral-500 hover:text-neutral-800 transition-all active:scale-95"
                            onClick={() => setIsInfoOpen(true)}
                            aria-label="About"
                        >
                            <Info size={20} />
                        </button>
                        <button
                            className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md border border-black/[0.06] shadow-sm text-neutral-500 hover:text-neutral-800 transition-all active:scale-95"
                            onClick={() => setIsSettingsOpen(true)}
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Warning banners (laptop) ─────────────────────────────────── */}
            {!isIOS && (
                <div className="absolute top-20 w-full flex flex-col items-center gap-2 px-4 z-10 left-0 right-0 pointer-events-none">
                    <AnimatePresence>
                        {["ja", "ko"].includes(settings.language) && (
                            <motion.div
                                key="unstable"
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="text-xs text-orange-600/80 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl text-center max-w-max mx-auto pointer-events-auto"
                            >
                                ⚠️ This language is under development.
                            </motion.div>
                        )}
                        {isVoiceMissing && settings.language !== "ur" && (
                            <motion.div
                                key="voice-missing"
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="text-xs text-red-600/80 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center max-w-md mx-auto pointer-events-auto"
                            >
                                🔇 Missing voice. Download {LANGUAGES.find(l => l.value === settings.language)?.label} in device settings.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ─── Main content ─────────────────────────────────────────────── */}
            <div className={cn(
                "flex-1 flex flex-col justify-center relative select-none mx-auto w-full",
                isIOS ? "items-center max-w-4xl px-0" : "max-w-2xl px-4"
            )}>
                <AnimatePresence mode="wait">
                    {currentWord ? (
                        <TypingTest
                            key={currentWord.id + settings.language}
                            word={currentWord}
                            onComplete={handleComplete}
                            onBack={handleBack}
                            onSpeak={speak}
                            onStop={stop}
                            onUnlockAudio={unlockAudio}
                            isSpeaking={isSpeaking}
                            isPending={isPending}
                            isIOS={isIOS}
                            isPhone={isPhone}
                            isAudioRepeat={settings.audioRepeat}
                            onToggleAudioRepeat={() => updateSettings({ audioRepeat: !settings.audioRepeat })}
                            mobileInputMode={settings.mobileInputMode}
                            penThickness={settings.penThickness}
                            penColor={settings.penColor}
                            isLooping={settings.loopWord}
                            onToggleLoop={() => updateSettings({ loopWord: !settings.loopWord })}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                            onOpenHistory={() => setIsHistoryOpen(true)}
                            arabicFontClass={arabicFontClass}
                            handedness={settings.handedness || 'right'}
                        />
                    ) : (
                        <div className="flex items-center justify-center gap-1.5 min-h-[400px]">
                            {[0, 150, 300].map(d => (
                                <div key={d} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}ms` }} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── Settings Modal ────────────────────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/25 backdrop-blur-sm"
                        onClick={() => setIsSettingsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.97, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.97, opacity: 0, y: 16 }}
                            transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
                            className="bg-[#fafafa] rounded-t-3xl sm:rounded-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)] w-full sm:max-w-[420px] max-h-[92vh] overflow-y-auto custom-scrollbar pb-safe"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drag handle (mobile) */}
                            <div className="flex justify-center pt-3 pb-1 sm:hidden">
                                <div className="w-10 h-1 rounded-full bg-neutral-200" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-4 pb-2">
                                <h2 className="text-[22px] font-bold tracking-tight">Settings</h2>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                                >
                                    <X size={15} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="px-6 pb-8 space-y-7 mt-2">

                                {/* ── Language ── */}
                                <div>
                                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Language</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x" style={{ scrollbarWidth: 'none' }}>
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang.value}
                                                onClick={() => updateSettings({ language: lang.value })}
                                                className={cn(
                                                    "snap-start shrink-0 h-11 px-5 rounded-2xl text-[15px] font-semibold transition-all duration-200",
                                                    settings.language === lang.value
                                                        ? "bg-accent text-white"
                                                        : "bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                                                )}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Difficulty ── */}
                                <div>
                                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Difficulty</p>
                                    <LayoutGroup id="settings-difficulty">
                                        <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                            {(["beginner", "intermediate", "hard"] as Difficulty[]).map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => updateSettings({ difficulty: d })}
                                                    className={cn(
                                                        "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                        settings.difficulty === d ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                                    )}
                                                >
                                                    {settings.difficulty === d && (
                                                        <motion.div
                                                            layoutId="settings-difficulty-pill"
                                                            className="absolute inset-0 bg-accent rounded-xl"
                                                            style={{ zIndex: -1 }}
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                        />
                                                    )}
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </LayoutGroup>
                                </div>

                                {/* ── Arabic Typeface ── */}
                                {(settings.language === "ar" || settings.language === "ur") && (
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Script Style</p>
                                        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x" style={{ scrollbarWidth: 'none' }}>
                                            {ARABIC_FONTS.map(font => (
                                                <button
                                                    key={font.value}
                                                    onClick={() => updateSettings({ arabicFont: font.value })}
                                                    className={cn(
                                                        "snap-start shrink-0 w-[96px] h-[86px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200",
                                                        (settings.arabicFont ?? DEFAULT_ARABIC_FONT) === font.value
                                                            ? "border-accent bg-accent/8"
                                                            : "border-neutral-200 bg-white hover:border-neutral-300"
                                                    )}
                                                >
                                                    <span
                                                        className="text-[22px] leading-none"
                                                        style={{ fontFamily: font.cssVar }}
                                                    >
                                                        {font.preview}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold tracking-wider uppercase",
                                                        (settings.arabicFont ?? DEFAULT_ARABIC_FONT) === font.value ? "text-accent" : "text-neutral-400"
                                                    )}>
                                                        {font.description.split('·')[0].trim()}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Divider ── */}
                                <div className="h-px bg-neutral-100" />

                                {/* ── Handedness (iPad only) ── */}
                                {isIOS && !isPhone && (
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Writing Hand</p>
                                        <LayoutGroup id="settings-handed">
                                            <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                                {(["left", "right"] as const).map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => updateSettings({ handedness: m })}
                                                        className={cn(
                                                            "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                            (settings.handedness || 'right') === m ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                                        )}
                                                    >
                                                        {(settings.handedness || 'right') === m && (
                                                            <motion.div
                                                                layoutId="settings-handed-pill"
                                                                className="absolute inset-0 bg-accent rounded-xl"
                                                                style={{ zIndex: -1 }}
                                                                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                            />
                                                        )}
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </LayoutGroup>
                                    </div>
                                )}

                                {/* ── Pencil Thickness (iPad only) ── */}
                                {isIOS && (
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Pen Weight</p>
                                        <LayoutGroup id="settings-pencil">
                                            <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                                {[
                                                    { label: "Fine", val: 3 },
                                                    { label: "Regular", val: 6 },
                                                    { label: "Bold", val: 12 }
                                                ].map(m => (
                                                    <button
                                                        key={m.label}
                                                        onClick={() => updateSettings({ penThickness: m.val })}
                                                        className={cn(
                                                            "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                            (settings.penThickness || 6) === m.val ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                                        )}
                                                    >
                                                        {(settings.penThickness || 6) === m.val && (
                                                            <motion.div
                                                                layoutId="settings-pencil-pill"
                                                                className="absolute inset-0 bg-accent rounded-xl"
                                                                style={{ zIndex: -1 }}
                                                                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                            />
                                                        )}
                                                        {m.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </LayoutGroup>
                                    </div>
                                )}

                                {/* ── Phone Input Mode (Phone only) ── */}
                                {isPhone && (
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Input Mode</p>
                                        <LayoutGroup id="settings-mobile">
                                            <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                                {(["touch", "keyboard"] as const).map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => updateSettings({ mobileInputMode: m })}
                                                        className={cn(
                                                            "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                            settings.mobileInputMode === m ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                                        )}
                                                    >
                                                        {settings.mobileInputMode === m && (
                                                            <motion.div
                                                                layoutId="settings-mobile-pill"
                                                                className="absolute inset-0 bg-accent rounded-xl"
                                                                style={{ zIndex: -1 }}
                                                                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                            />
                                                        )}
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </LayoutGroup>
                                    </div>
                                )}

                                {/* ── Divider ── */}
                                <div className="h-px bg-neutral-100" />

                                {/* ── Spaced Repetition toggle ── */}
                                <button
                                    onClick={() => updateSettings({ activeRecall: !settings.activeRecall })}
                                    className="w-full flex items-center justify-between group"
                                >
                                    <div className="flex flex-col items-start gap-0.5 text-left">
                                        <span className="text-[16px] font-semibold text-neutral-800">Spaced Repetition</span>
                                        <span className="text-[13px] text-neutral-400 leading-snug">Revisit words you found harder, more often</span>
                                    </div>
                                    <div className={cn(
                                        "relative flex-shrink-0 ml-4 w-12 h-7 rounded-full transition-colors duration-300",
                                        settings.activeRecall ? "bg-accent" : "bg-neutral-200"
                                    )}>
                                        <motion.div
                                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
                                            animate={{ x: settings.activeRecall ? 22 : 4 }}
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
                                        />
                                    </div>
                                </button>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── Info Modal ────────────────────────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isInfoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsInfoOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 8 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 8 }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                            className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-neutral-100 max-w-md w-full p-6 space-y-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">About JERN</h2>
                                <button onClick={() => setIsInfoOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={18} /></button>
                            </div>
                            <p className="text-sm text-muted leading-relaxed">
                                JERN is a focused environment for deep linguistic association, built on Dual Coding and Multisensory Integration. True learning happens when typing, listening, and reading converge on a single point — creating a loop that accelerates memory encoding.
                            </p>
                            <div className="space-y-4">
                                <InfoRow icon={<Globe size={14} />} title="100% Local & Private" body="Runs entirely in your browser. No data leaves your device. Works offline after first load." />
                                <InfoRow icon={<RotateCcw size={14} />} title="Spaced Repetition" body="Tracks mastered words and reinjects tricky vocabulary into your queue without breaking flow." />
                                <InfoRow icon={<Volume2 size={14} />} title="Dual-Language Audio" body="Toggle pronunciation between English and the target language, or enable continuous mode in settings." />
                            </div>
                            <div className="pt-4 border-t border-extra-muted text-center">
                                <p className="text-xs text-muted">
                                    Made by{" "}
                                    <a href="https://www.linkedin.com/in/nawfaljafri/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors font-medium">
                                        Nawfal Jafri
                                    </a>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── Lexicon Sidebar — GPU-composited CSS slide ────────────── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Overlay */}
            <div
                className={cn("lexicon-overlay cursor-pointer", isHistoryOpen && "open")}
                onClick={() => setIsHistoryOpen(false)}
                aria-hidden="true"
            />
            {/* Panel — always in DOM, toggled via CSS class for GPU compositing */}
            <div className={cn("lexicon-panel bg-white border-l border-neutral-100 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]", isHistoryOpen && "open")}>
                <div className="flex items-center justify-between p-5 shrink-0">
                    <h2 className="text-lg font-semibold">History</h2>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={18} /></button>
                </div>
                <div className="px-5 pb-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-extra-muted/30 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-10 custom-scrollbar space-y-3">
                    {groupedHistory.length === 0 && (
                        <p className="text-muted text-sm py-10 text-center">No words mastered yet.</p>
                    )}
                    {groupedHistory.map(group => (
                        <div key={group.value} className="rounded-xl overflow-hidden bg-extra-muted/20">
                            <button
                                onClick={() => setExpandedLangInHistory(expandedLangInHistory === group.value ? null : group.value)}
                                className="w-full flex items-center justify-between p-3.5 hover:bg-extra-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Flag code={group.countryCode} className="h-4 rounded-sm" />
                                    <span className="font-medium text-sm">{group.label}</span>
                                    <span className="text-[10px] text-muted bg-extra-muted/60 px-1.5 py-0.5 rounded-md font-medium">{group.words.length}</span>
                                </div>
                                {expandedLangInHistory === group.value
                                    ? <ChevronUp size={16} className="text-muted" />
                                    : <ChevronDown size={16} className="text-muted" />}
                            </button>

                            {expandedLangInHistory === group.value && (
                                <VirtualList
                                    words={group.words.filter(w =>
                                        w.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        w.romanized.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        w.definition.toLowerCase().includes(searchQuery.toLowerCase())
                                    )}
                                    arabicFontClass={arabicFontClass}
                                    onSelectWord={(word) => {
                                        setUpcomingWords(prev => {
                                            const filtered = prev.filter(w => w.id !== word.id);
                                            return [word, ...filtered];
                                        });
                                        setIsHistoryOpen(false);
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────

function ToggleRow({ icon, label, active, onToggle }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="w-full p-4 rounded-xl bg-extra-muted/20 hover:bg-extra-muted/40 flex items-center justify-between transition-colors"
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-[15px] font-medium">{label}</span>
            </div>
            <div className={cn("w-9 h-5 rounded-full relative transition-colors", active ? "bg-accent" : "bg-extra-muted")}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", active ? "right-0.5" : "left-0.5")} />
            </div>
        </button>
    );
}

function InfoRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="p-2 bg-accent/10 text-accent rounded-lg mt-0.5 shrink-0">{icon}</div>
            <div>
                <h3 className="text-sm font-semibold mb-0.5">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{body}</p>
            </div>
        </div>
    );
}

function VirtualList({ words, arabicFontClass, onSelectWord }: { words: Word[]; arabicFontClass?: string; onSelectWord?: (w: Word) => void }) {
    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: words.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="max-h-[50vh] overflow-y-auto px-3 pb-3 custom-scrollbar">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const word = words[virtualRow.index];
                    const isAr = word.language === "ar" || word.language === "ur";
                    return (
                        <div
                            key={virtualRow.index}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="py-0.5"
                        >
                            <div 
                                onClick={() => onSelectWord?.(word)}
                                className={cn("flex items-center justify-between p-3 rounded-lg hover:bg-extra-muted/30 transition-colors h-full", onSelectWord && "cursor-pointer")}
                            >
                                <div>
                                    <div
                                        className={cn("text-base font-medium", isAr ? (arabicFontClass || "font-arabic") : "font-sans")}
                                        dir={isAr ? "rtl" : "ltr"}
                                    >
                                        {word.original}
                                    </div>
                                    <div className="text-xs text-muted">{word.romanized}</div>
                                </div>
                                <div className="text-xs text-muted max-w-[100px] text-right truncate">{word.definition}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
