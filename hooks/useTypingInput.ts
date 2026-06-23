"use client";
import { useState, useCallback, useMemo, useEffect, MutableRefObject } from "react";
import { Word } from "@/lib/types";

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

interface UseTypingInputProps {
    word: Word;
    isLooping?: boolean;
    audioMode: "en" | "original";
    isAudioRepeat?: boolean;
    onSpeak: (text: string, lang: string, repeat?: boolean) => void;
    onComplete: () => void;
    onUnlockAudio?: () => void;
    isIOS?: boolean;
    onBack?: () => void;
    onMismatch?: () => void;
    hasUnlockedRef: MutableRefObject<boolean>;
}

export function useTypingInput({
    word,
    isLooping,
    audioMode,
    isAudioRepeat,
    onSpeak,
    onComplete,
    onUnlockAudio,
    isIOS,
    onBack,
    onMismatch,
    hasUnlockedRef
}: UseTypingInputProps) {
    const [userInput, setUserInput] = useState("");
    const [isShaking, setIsShaking] = useState(false);
    const [loopCounter, setLoopCounter] = useState(0);
    const [isFocused, setIsFocused] = useState(true);

    const triggerError = useCallback(() => {
        setIsShaking(true);
        onMismatch?.();
        setTimeout(() => setIsShaking(false), 500);
    }, [onMismatch]);

    const normalizedRomanized = useMemo(() => {
        return word.romanized
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/gi, "")
            .toLowerCase()
            .trim();
    }, [word.romanized]);

    // Reset on word change
    useEffect(() => {
        setUserInput("");
        setIsShaking(false);
    }, [word, isIOS]);

    // Keyboard shortcuts for laptop
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

    return {
        userInput,
        setUserInput,
        isShaking,
        triggerError,
        normalizedRomanized,
        loopCounter,
        setLoopCounter,
        isFocused,
        setIsFocused,
        handleInputChange
    };
}
