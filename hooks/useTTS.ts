"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export function useTTS() {
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const repeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    // Cache resolved voices per language to avoid scanning 50+ voices every speak() call
    const voiceCacheRef = useRef<Map<string, SpeechSynthesisVoice>>(new Map());
    // Track if audio context has been unlocked via user gesture
    const audioUnlockedRef = useRef(false);

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const stop = useCallback(() => {
        if (repeatTimeoutRef.current) {
            clearTimeout(repeatTimeoutRef.current);
            repeatTimeoutRef.current = null;
        }
        if (pendingTimeoutRef.current) {
            clearTimeout(pendingTimeoutRef.current);
            pendingTimeoutRef.current = null;
        }
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        currentUtteranceRef.current = null;
        setIsSpeaking(false);
        setIsPending(false);
    }, []);

    // Unlock audio context — must be called from a user gesture
    const unlockAudio = useCallback(() => {
        if (!synthRef.current || audioUnlockedRef.current) return;
        try {
            // Speak a silent utterance to warm up the audio context on Safari
            const warmup = new SpeechSynthesisUtterance(" ");
            warmup.volume = 0;
            warmup.rate = 2;
            synthRef.current.cancel();
            synthRef.current.speak(warmup);
            audioUnlockedRef.current = true;
        } catch {
            // Ignore — not all browsers support this
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        synthRef.current = window.speechSynthesis;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                voiceCacheRef.current.clear(); // Invalidate cache when voices change
            }
        };

        loadVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Initial warm-up utterance (may be blocked on Safari without user gesture,
        // but we also attach gesture listeners below to handle that case)
        try {
            const warmup = new SpeechSynthesisUtterance(" ");
            warmup.volume = 0;
            warmup.rate = 2;
            window.speechSynthesis.speak(warmup);
        } catch {
            // Expected to fail silently on Safari before user gesture
        }

        // Safari/iOS: resume synthesis after any user interaction
        const handleUserGesture = () => {
            if (!audioUnlockedRef.current && synthRef.current) {
                unlockAudio();
            }
        };

        // iOS suspends speech synthesis when tab goes to background — resume on focus
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                synthRef.current?.resume();
            } else {
                stop();
                synthRef.current?.cancel();
            }
        };

        const handleBeforeUnload = () => {
            stop();
            window.speechSynthesis.cancel();
        };

        window.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });
        window.addEventListener("pointerdown", handleUserGesture, { once: true, passive: true });
        window.addEventListener("click", handleUserGesture, { once: true, passive: true });
        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("touchstart", handleUserGesture);
            window.removeEventListener("pointerdown", handleUserGesture);
            window.removeEventListener("click", handleUserGesture);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            stop();
        };
    }, [stop, unlockAudio]);

    // Memoized voice resolver with cache
    const resolveVoice = useCallback((lang: string): SpeechSynthesisVoice | undefined => {
        // Check cache first
        const cached = voiceCacheRef.current.get(lang);
        if (cached) return cached;

        if (voices.length === 0) return undefined;

        let matchedVoice: SpeechSynthesisVoice | undefined;

        if (lang.startsWith("en")) {
            const preferredUSNames = ["Samantha", "Ava", "Allison", "Susan", "Siri", "Google US English"];
            matchedVoice = voices.find(v => v.lang === "en-US" && preferredUSNames.some(name => v.name.includes(name)) && (v.name.includes("Premium") || v.name.includes("Enhanced")));
            if (!matchedVoice) matchedVoice = voices.find(v => v.lang === "en-US" && preferredUSNames.some(name => v.name.includes(name)));
            if (!matchedVoice) matchedVoice = voices.find(v => v.lang === "en-US" && (v.name.includes("Premium") || v.name.includes("Enhanced")));
            if (!matchedVoice) matchedVoice = voices.find(v => v.lang === "en-US");
            if (!matchedVoice) matchedVoice = voices.find(v => v.lang.startsWith("en"));
        } else {
            matchedVoice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
            if (!matchedVoice) {
                const baseLang = lang.split('-')[0].toLowerCase();
                matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(baseLang));
            }
        }

        // Cache the result
        if (matchedVoice) voiceCacheRef.current.set(lang, matchedVoice);
        return matchedVoice;
    }, [voices]);

    const speak = useCallback((text: string, lang: string = "en-US", repeat: boolean = false) => {
        if (!synthRef.current) return;

        stop();

        // Safari iOS: must call resume() before each speak() to prevent
        // the synthesis from getting stuck in a paused state
        try {
            synthRef.current.resume();
        } catch {
            // ignore
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;

        setIsPending(true);

        const voice = resolveVoice(lang);
        if (voice) utterance.voice = voice;

        currentUtteranceRef.current = utterance;

        utterance.onstart = () => {
            if (currentUtteranceRef.current === utterance) {
                if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
                setIsPending(false);
                setIsSpeaking(true);
            }
        };

        utterance.onend = () => {
            if (currentUtteranceRef.current === utterance) {
                setIsSpeaking(false);
                if (repeat) {
                    repeatTimeoutRef.current = setTimeout(() => {
                        if (currentUtteranceRef.current === utterance) {
                            try { synthRef.current?.resume(); } catch { /* ignore */ }
                            synthRef.current?.speak(utterance);
                        }
                    }, 1500);
                }
            }
        };

        utterance.onerror = (e) => {
            // 'interrupted' is a normal cancellation, not an error
            if (e.error === "interrupted" || e.error === "canceled") return;
            if (currentUtteranceRef.current === utterance) {
                setIsPending(false);
                setIsSpeaking(false);
                console.warn("Speech Synthesis:", e.error);
            }
        };

        synthRef.current.speak(utterance);

        // Safety net: if isPending stays true >4s, the audio context is stuck —
        // reset to idle so the UI doesn't freeze on "loading" forever
        pendingTimeoutRef.current = setTimeout(() => {
            if (currentUtteranceRef.current === utterance) {
                setIsPending(false);
                setIsSpeaking(false);
            }
        }, 4000);
    }, [stop, resolveVoice]);

    return { speak, stop, unlockAudio, voices, isSpeaking, isPending };
}
