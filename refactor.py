import re

with open("components/TypingTest.tsx", "r") as f:
    content = f.read()

# 1. Add imports
content = content.replace('import DictionaryCard from "./DictionaryCard";', 
                          'import DictionaryCard from "./DictionaryCard";\nimport { useTypingInput } from "@/hooks/useTypingInput";\nimport { AudioToolbar } from "./AudioToolbar";')

# 2. Replace state variables and hooks
old_state = """    const [userInput, setUserInput] = useState("");
    const [isErasing, setIsErasing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(true);
    const [isShaking, setIsShaking] = useState(false);
    const [audioMode, setAudioMode] = useState<"en" | "original">("en");
    const [loopCounter, setLoopCounter] = useState(0);
    const canvasRef = useRef<DrawingCanvasRef>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const isRightHanded = handedness === 'right';
    const initialMount = useRef(true);
    const hasUnlockedRef = useRef(false);
    const isCompletingRef = useRef(false);"""

new_state = """    const [isErasing, setIsErasing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [audioMode, setAudioMode] = useState<"en" | "original">("en");
    const canvasRef = useRef<DrawingCanvasRef>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const isRightHanded = handedness === 'right';
    const initialMount = useRef(true);
    const hasUnlockedRef = useRef(false);
    const isCompletingRef = useRef(false);

    const {
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
    } = useTypingInput({
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
    });"""

content = content.replace(old_state, new_state)

# 3. Replace the block from // ── Focus & reset to the end of handleInputChange
old_focus_reset = """    // ── Focus & reset on word change ─────────────────────────────────────
    useEffect(() => {
        isCompletingRef.current = false;
        if (!isIOS) inputRef.current?.focus();
        setUserInput("");
        setIsShaking(false);
    }, [word, isIOS]);

    const normalizedRomanized = useMemo(() => {
        return word.romanized
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/gi, "")
            .toLowerCase()
            .trim();
    }, [word.romanized]);

    const triggerError = useCallback(() => {
        setIsShaking(true);
        onMismatch?.();
        setTimeout(() => setIsShaking(false), 500);
    }, [onMismatch]);

    // ── Keyboard shortcuts (laptop) ──────────────────────────────────────
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
                    handleSpeak();
                } else {
                    onComplete();
                    setUserInput("");
                }
            }, 150);
        }
    };"""

new_focus_reset = """    // ── Focus & reset on word change ─────────────────────────────────────
    useEffect(() => {
        isCompletingRef.current = false;
        if (!isIOS) inputRef.current?.focus();
    }, [word, isIOS]);"""

content = content.replace(old_focus_reset, new_focus_reset)

# 4. Replace AudioToolbar for iPad
ipad_audio = """                    <div className="mt-auto flex items-center justify-between p-2 bg-neutral-50 rounded-2xl border border-neutral-100 lg:mb-10">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setAudioMode("en")}
                                className={cn(
                                    "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:bg-emerald-600 active:text-white",
                                    audioMode === "en"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 active:bg-emerald-600 active:text-white"
                                )}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setAudioMode("original")}
                                className={cn(
                                    "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:bg-emerald-600 active:text-white",
                                    audioMode === "original"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-neutral-400 hover:text-neutral-600"
                                )}
                            >
                                {(word.language || "EN").toUpperCase()}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onToggleAudioRepeat}
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-95",
                                    isAudioRepeat ? "text-accent bg-accent/10" : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500"
                                )}
                                title={isAudioRepeat ? "Continuous Audio On" : "Continuous Audio Off"}
                            >
                                <Repeat size={18} />
                            </button>
                            <button
                                onClick={() => handleSpeak()}
                                disabled={isPending}
                                className={cn(
                                    "flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 active:scale-95",
                                    isSpeaking
                                        ? "bg-accent text-white shadow-md"
                                        : "bg-white text-accent hover:bg-accent hover:text-white shadow-sm border border-neutral-100"
                                )}
                            >
                                {isPending ? <Loader2 size={24} className="animate-spin" /> : isSpeaking ? <Volume1 size={24} className="animate-pulse" /> : <Volume2 size={24} />}
                            </button>
                        </div>
                    </div>"""

new_ipad_audio = """                    <AudioToolbar 
                        variant="ipad"
                        audioMode={audioMode} 
                        setAudioMode={setAudioMode} 
                        wordLanguage={word.language || "EN"} 
                        isAudioRepeat={isAudioRepeat} 
                        onToggleAudioRepeat={onToggleAudioRepeat}
                        isSpeaking={isSpeaking}
                        isPending={isPending}
                        onSpeakClick={() => handleSpeak()}
                    />"""

content = content.replace(ipad_audio, new_ipad_audio)

# 5. Replace AudioToolbar for Laptop
laptop_audio = """                    {/* Toolbar */}
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
                            onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
                            disabled={isPending}
                            title="Play Audio"
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
                                isAudioRepeat ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                            )}
                            onClick={(e) => { e.stopPropagation(); onToggleAudioRepeat?.(); }}
                            title="Continuous Audio"
                        >
                            <Repeat size={15} />
                            {isAudioRepeat && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
                        </button>

                        <div className="w-px h-4 bg-extra-muted mx-1" />

                        <button
                            className={cn(
                                "p-2 rounded-lg transition-colors flex items-center justify-center relative",
                                isLooping ? "text-accent bg-accent/10" : "hover:bg-extra-muted/50 text-muted hover:text-foreground"
                            )}
                            onClick={(e) => { e.stopPropagation(); onToggleLoop?.(); }}
                            title="Loop Word Practice"
                        >
                            <RefreshCcw size={15} />
                            {isLooping && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />}
                        </button>
                    </div>"""

new_laptop_audio = """                    {/* Toolbar */}
                    <AudioToolbar 
                        variant="laptop"
                        audioMode={audioMode} 
                        setAudioMode={setAudioMode} 
                        wordLanguage={word.language || "EN"} 
                        isAudioRepeat={isAudioRepeat} 
                        onToggleAudioRepeat={onToggleAudioRepeat}
                        isSpeaking={isSpeaking}
                        isPending={isPending}
                        onSpeakClick={() => handleSpeak()}
                        isLooping={isLooping}
                        onToggleLoop={onToggleLoop}
                    />"""

content = content.replace(laptop_audio, new_laptop_audio)

with open("components/TypingTest.tsx", "w") as f:
    f.write(content)
