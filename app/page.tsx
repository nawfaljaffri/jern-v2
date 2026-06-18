"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TypingTest from "@/components/TypingTest";
import { LANGUAGES, FREQUENCY_TIERS } from "@/lib/constants";
import { Word, Language, Difficulty, SessionSettings } from "@/lib/types";
import { transliterate } from "@/lib/transliterate";
import { useTTS } from "@/hooks/useTTS";
import { Settings, History, Volume2, Globe, ChevronRight, ChevronDown, CheckCircle2, RotateCcw, Search, Info, X } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useVirtualizer } from "@tanstack/react-virtual";
import Flag from "react-world-flags";


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {

  const [settings, setSettings] = useState<SessionSettings>({
    language: 'ar',
    difficulty: 'beginner',
    audioRepeat: false,
    activeRecall: true
  });

  const [dataPack, setDataPack] = useState<Word[]>([]);
  const [upcomingWords, setUpcomingWords] = useState<Word[]>([]);
  const [history, setHistory] = useState<Word[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [expandedLangInHistory, setExpandedLangInHistory] = useState<Language | null>('ar');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { speak, stop, voices, isSpeaking, isPending } = useTTS();
  const [isIOS, setIsIOS] = useState(false);
  const [isPhone, setIsPhone] = useState(false);


  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      const ipad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const iphone = /iPhone|iPod/i.test(ua);
      const androidPhone = /Android/i.test(ua) && /Mobile/i.test(ua);

      setIsIOS(ipad || iphone);
      setIsPhone(iphone || androidPhone || window.innerWidth < 768);

      if (ipad) {
        setSettings(prev => ({ ...prev, audioRepeat: true }));
      }
    }
  }, []);
  const wordsSinceRecallRef = useRef(0);

  const isVoiceMissing = React.useMemo(() => {
    if (!isIOS) return false;
    if (voices.length === 0) return false;
    const langCode = LANGUAGES.find(l => l.value === settings.language)?.ttsLocale || "en-US";
    let matchedVoice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (!matchedVoice) {
      const baseLang = langCode.split('-')[0].toLowerCase();
      matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(baseLang));
    }
    return !matchedVoice;
  }, [voices, settings.language, isIOS]);

  // 1. Data Loader
  const loadDataPack = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/data/${lang}.json`);
      const data = await response.json();
      setDataPack(data);
      setUpcomingWords([]);
    } catch (error) {
      console.error("Failed to load data pack:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataPack(settings.language);
  }, [settings.language, loadDataPack]);

  // 3. Pre-fetching Logic
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
          const filtered = dataPack.filter(w =>
            (w.frequency || 0) >= tier.min &&
            (w.frequency || 0) <= tier.max &&
            !fullExclude.includes(w.id)
          );

          let pool = filtered;
          if (pool.length === 0) {
            pool = dataPack.filter(w =>
              (w.frequency || 0) >= tier.min &&
              (w.frequency || 0) <= tier.max &&
              !excludeIds.includes(w.id)
            );
            if (pool.length === 0) {
              pool = dataPack.filter(w => !excludeIds.includes(w.id));
            }
            if (pool.length === 0) {
              pool = dataPack;
            }
          }

          if (pool.length > 0) {
            const nextWord = pool[Math.floor(Math.random() * pool.length)];
            newWords.push({
              ...nextWord,
              romanized: nextWord.romanized || transliterate(nextWord.original, settings.language)
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
    if (dataPack.length > 0 && upcomingWords.length < 3) {
      refillUpcoming(history);
    }
  }, [dataPack, refillUpcoming, history, upcomingWords.length]);

  const currentWord = upcomingWords[0];

  const handleComplete = useCallback(() => {
    if (!currentWord) return;
    setHistory(prev => {
      if (prev.find(w => w.id === currentWord.id)) return prev;
      const updated = [currentWord, ...prev].slice(0, 500);
      localStorage.setItem('jern-history', JSON.stringify(updated));
      return updated;
    });
    setUpcomingWords(prev => prev.slice(1));
  }, [currentWord]);

  const handleBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const lastMastered = prev[0];
      setUpcomingWords(currentQueue => [lastMastered, ...currentQueue]);
      const newHistory = prev.slice(1);
      localStorage.setItem('jern-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const updateSettings = (updates: Partial<SessionSettings>) => {
    setSettings(prev => {
      const isQueueReset = (updates.language && updates.language !== prev.language) ||
        (updates.difficulty && updates.difficulty !== prev.difficulty);
      if (isQueueReset) {
        setUpcomingWords([]);
      }
      return { ...prev, ...updates };
    });
    if (updates.audioRepeat === false) {
      stop();
    }
  };

  const groupedHistory = LANGUAGES.map(lang => ({
    ...lang,
    words: history.filter(w => w.language === lang.value || (w.id.startsWith(lang.value)))
  })).filter(group => group.words.length > 0);

  if (isLoading && upcomingWords.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* ── Header ── */}
      <header className="px-6 md:px-8 py-5 flex justify-between items-center z-20">
        <div className="flex items-center cursor-pointer group" onClick={() => window.location.reload()}>
          <h1 className="text-xl font-bold tracking-tight text-foreground group-hover:opacity-70 transition-opacity">JERN<span className="text-accent">.</span></h1>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={() => setIsInfoOpen(true)} className="text-muted hover:text-foreground transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <button onClick={() => setIsHistoryOpen(true)} className="text-muted hover:text-foreground transition-colors relative">
            <History className="w-5 h-5" />
            {history.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="text-muted hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Status bar ── */}
      {!isIOS && (
        <div className="flex justify-between items-center px-6 md:px-8 pb-2 z-10">
          <span className="text-sm text-muted/50 font-medium capitalize">{LANGUAGES.find(l => l.value === settings.language)?.label} · {settings.difficulty}</span>
          <span className="text-sm text-muted/50 font-medium">{history.length} mastered</span>
        </div>
      )}

      {/* ── Main Content ── */}
      <div
        className={cn(
          "flex-1 flex flex-col justify-center relative select-none mx-auto w-full",
          isIOS ? "items-center max-w-4xl px-6" : "max-w-2xl px-4"
        )}
      >
        {isIOS ? (
          <div className="absolute top-0 sm:top-8 w-full flex-col flex items-center pointer-events-none z-10 pt-4">
            <div className="w-full flex justify-between items-center pointer-events-auto px-6">
              <span className="text-sm text-muted/50 font-medium capitalize">{LANGUAGES.find(l => l.value === settings.language)?.label} · {settings.difficulty}</span>
              <span className="text-sm text-muted/50 font-medium">{history.length} mastered</span>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 w-full text-center pointer-events-auto px-4 top-10 absolute">
              <AnimatePresence>
                {['ja', 'ko'].includes(settings.language) && (
                  <motion.div
                    key="unstable-warning"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-orange-600/80 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl text-center"
                  >
                    ⚠️ This language is under development and may be unstable.
                  </motion.div>
                )}
                {settings.language === 'ur' && isIOS && (
                  <motion.div
                    key="urdu-ios-warning"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-red-600/80 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center max-w-lg"
                  >
                    🔇 iOS doesn't support Urdu TTS natively. Audio may only work on Android or desktop.
                  </motion.div>
                )}
                {isVoiceMissing && settings.language !== 'ur' && (
                  <motion.div
                    key="missing-voice-warning"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-red-600/80 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center max-w-lg"
                  >
                    🔇 Missing voice data. Download the {LANGUAGES.find(l => l.value === settings.language)?.label} voice in device settings.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="absolute top-4 w-full flex flex-col items-center gap-2 text-center pointer-events-auto px-4 z-10 left-0 right-0">
            <AnimatePresence>
              {['ja', 'ko'].includes(settings.language) && (
                <motion.div
                  key="unstable-warning-web"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-orange-600/80 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl text-center max-w-max mx-auto"
                >
                  ⚠️ This language is under development.
                </motion.div>
              )}
              {isVoiceMissing && settings.language !== 'ur' && (
                <motion.div
                  key="missing-voice-warning-web"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-red-600/80 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center max-w-md mx-auto"
                >
                  🔇 Missing voice data. Download the {LANGUAGES.find(l => l.value === settings.language)?.label} voice in device settings.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentWord ? (
            <TypingTest
              key={currentWord.id + settings.language}
              word={currentWord}
              onComplete={handleComplete}
              onBack={handleBack}
              onSpeak={speak}
              onStop={stop}
              isSpeaking={isSpeaking}
              isPending={isPending}
              isIOS={isIOS}
              isPhone={isPhone}
              isAudioRepeat={settings.audioRepeat}
              penThickness={settings.penThickness}
              penColor={settings.penColor}
              isLooping={settings.loopWord}
              onToggleLoop={() => updateSettings({ loopWord: !settings.loopWord })}
            />
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ── Settings Modal ── */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="bg-background rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-lg font-semibold">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-muted hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Languages */}
                <div>
                  <p className="text-xs font-medium text-muted mb-3">Language</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => updateSettings({ language: lang.value })}
                        className={cn(
                          "p-3 rounded-xl flex flex-col items-center gap-2 transition-all text-sm font-medium",
                          settings.language === lang.value
                            ? "ring-2 ring-accent bg-accent/5 text-foreground"
                            : "bg-extra-muted/30 text-foreground hover:bg-extra-muted/50"
                        )}
                      >
                        <Flag code={lang.countryCode} className="h-5 rounded-sm" />
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <p className="text-xs font-medium text-muted mb-3">Difficulty</p>
                  <LayoutGroup>
                    <div className="flex p-1 bg-extra-muted/40 rounded-xl relative">
                      {(['beginner', 'intermediate', 'hard'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => updateSettings({ difficulty: d })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors relative z-10",
                            settings.difficulty === d ? "text-white" : "text-muted hover:text-foreground"
                          )}
                        >
                          {settings.difficulty === d && (
                            <motion.div
                              layoutId="difficulty-pill"
                              className="absolute inset-0 bg-accent rounded-lg"
                              style={{ zIndex: -1 }}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                          )}
                          {d}
                        </button>
                      ))}
                    </div>
                  </LayoutGroup>
                </div>

                {/* Feedback */}
                <div>
                  <p className="text-xs font-medium text-muted mb-3">Feedback</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateSettings({ audioRepeat: !settings.audioRepeat })}
                      className="w-full p-4 rounded-xl bg-extra-muted/20 hover:bg-extra-muted/40 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Volume2 size={16} className={settings.audioRepeat ? "text-accent" : "text-muted"} />
                        <span className="text-sm font-medium">Continuous Pronunciation</span>
                      </div>
                      <div className={cn("w-9 h-5 rounded-full relative transition-colors", settings.audioRepeat ? "bg-accent" : "bg-extra-muted")}>
                        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", settings.audioRepeat ? "right-0.5" : "left-0.5")} />
                      </div>
                    </button>

                    <button
                      onClick={() => updateSettings({ activeRecall: !settings.activeRecall })}
                      className="w-full p-4 rounded-xl bg-extra-muted/20 hover:bg-extra-muted/40 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw size={16} className={settings.activeRecall ? "text-accent" : "text-muted"} />
                        <span className="text-sm font-medium">Spaced Repetition</span>
                      </div>
                      <div className={cn("w-9 h-5 rounded-full relative transition-colors", settings.activeRecall ? "bg-accent" : "bg-extra-muted")}>
                        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", settings.activeRecall ? "right-0.5" : "left-0.5")} />
                      </div>
                    </button>
                  </div>
                </div>

                {isIOS && (
                  <div>
                    <p className="text-xs font-medium text-muted mb-3">Apple Pencil</p>
                    <div className="p-4 rounded-xl bg-extra-muted/20">
                      <span className="text-sm font-medium mb-2 block">Thickness</span>
                      <input
                        type="range"
                        min="1" max="20"
                        value={settings.penThickness || 6}
                        onChange={(e) => updateSettings({ penThickness: parseInt(e.target.value) })}
                        className="w-full accent-accent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════ */}
      {/* ── Info Modal ── */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isInfoOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsInfoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">About JERN</h2>
                <button onClick={() => setIsInfoOpen(false)} className="text-muted hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-muted leading-relaxed">
                JERN is a focused environment for deep linguistic association, built on Dual Coding and Multisensory Integration. True learning happens when typing, listening, and reading converge on a single point — creating a loop that accelerates memory encoding.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-accent/10 text-accent rounded-lg mt-0.5 shrink-0"><Globe size={14} /></div>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">100% Local & Private</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Runs entirely in your browser. No data leaves your device. Works offline after first load.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-accent/10 text-accent rounded-lg mt-0.5 shrink-0"><RotateCcw size={14} /></div>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">Spaced Repetition</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Tracks mastered words and reinjects tricky vocabulary into your queue without breaking flow.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-accent/10 text-accent rounded-lg mt-0.5 shrink-0"><Volume2 size={14} /></div>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">Dual-Language Audio</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Toggle pronunciation between English and the target language, or enable continuous mode in settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-extra-muted text-center">
                <p className="text-xs text-muted">
                  Made by <a href="https://www.linkedin.com/in/nawfaljafri/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors font-medium">Nawfal Jafri</a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════ */}
      {/* ── Lexicon Sidebar ── */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5">
              <h2 className="text-lg font-semibold">Lexicon</h2>
              <button onClick={() => setIsHistoryOpen(false)} className="text-muted hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-extra-muted/30 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-10 custom-scrollbar space-y-3">
              {groupedHistory.length === 0 && <p className="text-muted text-sm py-10 text-center">No words mastered yet.</p>}
              {groupedHistory.map((group) => (
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
                    {expandedLangInHistory === group.value ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                  </button>

                  <AnimatePresence>
                    {expandedLangInHistory === group.value && (
                      <VirtualList words={group.words.filter(w =>
                        w.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        w.romanized.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        w.definition.toLowerCase().includes(searchQuery.toLowerCase())
                      )} />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function VirtualList({ words }: { words: Word[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: words.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  return (
    <motion.div
      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
      className="bg-background"
    >
      <div
        ref={parentRef}
        className="max-h-[50vh] overflow-y-auto px-3 pb-3 custom-scrollbar"
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const word = words[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="py-0.5"
              >
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-extra-muted/30 transition-colors h-full">
                  <div>
                    <div className={cn(
                      "text-base font-medium",
                      word.language === 'ar' || word.language === 'ur' ? "font-arabic" : "font-sans"
                    )} dir={word.language === 'ar' || word.language === 'ur' ? "rtl" : "ltr"}>
                      {word.original}
                    </div>
                    <div className="text-xs text-muted">{word.romanized}</div>
                  </div>
                  <div className="text-xs text-muted max-w-[100px] text-right truncate">
                    {word.definition}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
