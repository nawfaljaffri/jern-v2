"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TypingTest from "@/components/TypingTest";
import SettingsModal from "@/components/SettingsModal";
import InfoModal from "@/components/InfoModal";
import LexiconPanel from "@/components/LexiconPanel";
import { LANGUAGES, FREQUENCY_TIERS, DEFAULT_ARABIC_FONT } from "@/lib/constants";
import { Word, Language, SessionSettings, ArabicFont } from "@/lib/types";
import { transliterate } from "@/lib/transliterate";
import { useTTS } from "@/hooks/useTTS";
import { Settings, History, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
    const [isLoading, setIsLoading] = useState(true);

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
                    <span className="text-sm text-muted/50 font-medium capitalize flex items-center gap-2">
                        <span>{LANGUAGES.find(l => l.value === settings.language)?.label} · {settings.difficulty}</span>
                        {["ja", "ko"].includes(settings.language) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-extra-muted/30 text-muted text-[10px] font-bold uppercase tracking-widest">
                                Beta
                            </span>
                        )}
                    </span>
                    <span className="text-sm text-muted/50 font-medium">{history.length} practiced</span>
                </div>
            )}

            {/* ─── iPad: top bar (language + mastered) ─────────────────────── */}
            {isIOS && (
                <div className={`fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-10 pt-[max(env(safe-area-inset-top),32px)] pb-4 pointer-events-none ${!isPhone ? (settings.handedness === 'left' ? "lg:pr-[450px]" : "lg:pl-[450px]") : ""}`}>
                    <span className="text-base font-semibold text-neutral-400 capitalize tracking-wide flex items-center gap-2">
                        <span>{LANGUAGES.find(l => l.value === settings.language)?.label} · {settings.difficulty}</span>
                        {["ja", "ko"].includes(settings.language) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-extra-muted/30 text-muted text-[10px] font-bold uppercase tracking-widest">
                                Beta
                            </span>
                        )}
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
                            allWords={dataPack}
                            onSearchSelect={(w) => setUpcomingWords(prev => [w, ...prev.slice(1)])}
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
                            arabicFont={settings.arabicFont ?? DEFAULT_ARABIC_FONT}
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

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                updateSettings={updateSettings}
                isIOS={isIOS}
                isPhone={isPhone}
            />

            <InfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
            />

            <LexiconPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onSelectWord={(w) => {
                    setUpcomingWords(prev => {
                        const filtered = prev.filter(word => word.id !== w.id);
                        return [w, ...filtered];
                    });
                    setIsHistoryOpen(false);
                }}
                arabicFontClass={arabicFontClass}
            />
        </main>
    );
}
