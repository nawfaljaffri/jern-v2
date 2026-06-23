import re

with open("components/TypingTest.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace('import DictionaryCard from "./DictionaryCard";',
                          'import DictionaryCard from "./DictionaryCard";\nimport { useTypingInput } from "@/hooks/useTypingInput";')

# 2. State to hook
state_pattern = r'    const \[userInput, setUserInput\] = useState\(""\);\s*const \[isErasing, setIsErasing\] = useState\(false\);\s*const inputRef = useRef<HTMLInputElement>\(null\);\s*const \[isFocused, setIsFocused\] = useState\(true\);\s*const \[isShaking, setIsShaking\] = useState\(false\);\s*const \[audioMode, setAudioMode\] = useState<"en" \| "original">\("en"\);\s*const \[loopCounter, setLoopCounter\] = useState\(0\);'

new_state = """    const [isErasing, setIsErasing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [audioMode, setAudioMode] = useState<"en" | "original">("en");

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

content = re.sub(state_pattern, new_state, content)


# 3. Focus and Reset, triggerError, normalizedRomanized, handleKeyDown, handleInputChange
# This spans from `// ── Focus & reset on word change ─` to the end of `handleInputChange`.
# We'll match from `// ── Focus & reset on word change` up to `if \(raw === normalizedRomanized\).*?\}\n    \};\n`
huge_block_pattern = r'    // ── Focus & reset on word change ─.*?handleInputChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?if \(raw === normalizedRomanized\) \{.*?\n        \}\n    \};\n'

new_huge_block = """    // ── Focus & reset on word change ─────────────────────────────────────
    useEffect(() => {
        isCompletingRef.current = false;
        if (!isIOS) inputRef.current?.focus();
    }, [word, isIOS]);
"""

content = re.sub(huge_block_pattern, new_huge_block, content, flags=re.DOTALL)

with open("components/TypingTest.tsx", "w") as f:
    f.write(content)
