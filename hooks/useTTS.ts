"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export function useTTS() {
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const repeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    // Cache resolved voices per language to avoid scanning 50+ voices every speak() call
    const voiceCacheRef = useRef<Map<string, SpeechSynthesisVoice>>(new Map());

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const stop = useCallback(() => {
        if (repeatTimeoutRef.current) {
            clearTimeout(repeatTimeoutRef.current);
            repeatTimeoutRef.current = null;
        }
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        currentUtteranceRef.current = null;
        setIsSpeaking(false);
        setIsPending(false);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
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

            // Warm up the synth engine with a silent utterance to eliminate first-call latency
            const warmup = new SpeechSynthesisUtterance("");
            warmup.volume = 0;
            window.speechSynthesis.speak(warmup);

            const handleVisibilityChange = () => {
                if (document.visibilityState === 'hidden') {
                    stop();
                    window.speechSynthesis.cancel();
                }
            };

            const handleBeforeUnload = () => {
                stop();
                window.speechSynthesis.cancel();
            };

            window.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                window.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('beforeunload', handleBeforeUnload);
                stop();
            };
        }
        return () => { stop(); };
    }, [stop]);

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

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;

        setIsPending(true);

        const voice = resolveVoice(lang);
        if (voice) utterance.voice = voice;

        currentUtteranceRef.current = utterance;

        utterance.onstart = () => {
            if (currentUtteranceRef.current === utterance) {
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
                            synthRef.current?.speak(utterance);
                        }
                    }, 1500);
                }
            }
        };

        utterance.onerror = (e) => {
            if (currentUtteranceRef.current === utterance) {
                setIsPending(false);
                setIsSpeaking(false);
                console.error("Speech Synthesis Error:", e);
            }
        };

        synthRef.current.speak(utterance);
    }, [stop, resolveVoice]);

    return { speak, stop, voices, isSpeaking, isPending };
}
