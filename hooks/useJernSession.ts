"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Word, Language, SessionSettings } from "@/lib/types";
import { transliterate } from "@/lib/transliterate";
import { FREQUENCY_TIERS } from "@/lib/constants";

export function useJernSession(settings: SessionSettings) {
    const [dataPack, setDataPack] = useState<Word[]>([]);
    const [dictionary, setDictionary] = useState<Record<string, import("@/lib/types").DictionaryEntry>>({});
    const [upcomingWords, setUpcomingWords] = useState<Word[]>([]);
    const [history, setHistory] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const wordsSinceRecallRef = useRef(0);

    // Load History
    useEffect(() => {
        try {
            const saved = localStorage.getItem("jern-history");
            if (saved) setHistory(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    // Load Data Pack & Dictionary
    const loadDataPack = useCallback(async (lang: Language) => {
        setIsLoading(true);
        try {
            const filePath = (lang === "ar" || lang === "fr") ? `/data/${lang}_cleaned.json` : `/data/${lang}.json`;
            const [res, dictRes] = await Promise.all([
                fetch(filePath + "?v=4"),
                (lang === "ar" || lang === "fr") ? fetch(`/data/${lang}_dictionary.json?v=4`) : Promise.resolve(null)
            ]);
            const data = await res.json();
            if (dictRes) {
                const dictData = await dictRes.json();
                setDictionary(dictData);
            } else {
                setDictionary({});
            }
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

    // Refill Queue
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

    const handleComplete = useCallback(() => {
        const currentWord = upcomingWords[0];
        if (!currentWord) return;
        setHistory(prev => {
            if (prev.find(w => w.id === currentWord.id)) return prev;
            const updated = [currentWord, ...prev].slice(0, 500);
            localStorage.setItem("jern-history", JSON.stringify(updated));
            return updated;
        });
        setUpcomingWords(prev => prev.slice(1));
    }, [upcomingWords]);

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

    return {
        dataPack,
        dictionary,
        upcomingWords,
        setUpcomingWords,
        history,
        isLoading,
        currentWord: upcomingWords[0],
        handleComplete,
        handleBack
    };
}
