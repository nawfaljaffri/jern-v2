"use client";

import React, { useState, useMemo } from "react";
import TypingTest from "@/components/TypingTest";
import SettingsModal from "@/components/SettingsModal";
import InfoModal from "@/components/InfoModal";
import LexiconPanel from "@/components/LexiconPanel";
import { LANGUAGES, DEFAULT_ARABIC_FONT } from "@/lib/constants";
import { SessionSettings, ArabicFont } from "@/lib/types";
import { useTTS } from "@/hooks/useTTS";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useJernSession } from "@/hooks/useJernSession";
import { Settings, History, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function getArabicFontClass(font: ArabicFont): string {
    const map: Record<ArabicFont, string> = {
        system: "font-arabic",
        cairo: "font-arabic",
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

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const { speak, stop, unlockAudio, voices, isSpeaking, isPending } = useTTS();
    const { isIOS, isPhone, isIPad } = useDeviceDetection();
    const { 
        dataPack, 
        upcomingWords, 
        setUpcomingWords, 
        history, 
        isLoading, 
        currentWord, 
        handleComplete, 
        handleBack 
    } = useJernSession(settings);

    React.useEffect(() => {
        if (isIPad) setSettings(prev => ({ ...prev, audioRepeat: true }));
    }, [isIPad]);

    React.useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.setAttribute("data-arabic-font", settings.arabicFont ?? DEFAULT_ARABIC_FONT);
    }, [settings.arabicFont]);

    const isVoiceMissing = useMemo(() => {
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

            <div className={cn(
                "flex-1 flex flex-col justify-center relative select-none mx-auto w-full",
                isIOS ? "items-center max-w-4xl px-0" : "max-w-2xl px-4"
            )}>
                <AnimatePresence mode="wait">
                    {currentWord ? (
                        <TypingTest
                            key={currentWord.id + settings.language}
                            word={currentWord}
                            onComplete={() => handleComplete()}
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
