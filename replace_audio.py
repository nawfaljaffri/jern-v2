import re

with open("components/TypingTest.tsx", "r") as f:
    content = f.read()

# Add handleSpeak
if "const handleSpeak = useCallback" not in content:
    content = content.replace('    const isArabicScript = word.language === "ar" || word.language === "ur";',
                              '    const handleSpeak = React.useCallback((overrideMode?: "en" | "original", repeat?: boolean) => {\n        const modeToUse = overrideMode || audioMode;\n        const text = modeToUse === "en" ? word.definition : word.original;\n        const lang = modeToUse === "en" ? "en-US" : (word.language ? TTS_LANG_MAP[word.language] : "en-US");\n        onSpeak(text, lang || "en-US", repeat || isAudioRepeat);\n    }, [audioMode, word, onSpeak, isAudioRepeat]);\n\n    const isArabicScript = word.language === "ar" || word.language === "ur";')

# Replace iPad Audio Toolbar
ipad_regex = re.compile(r'<div className="mt-auto flex items-center justify-between p-2 bg-neutral-50 rounded-2xl border border-neutral-100 lg:mb-10">.*?</div>\s*</div>', re.DOTALL)
if ipad_regex.search(content):
    content = ipad_regex.sub('<AudioToolbar variant="ipad" audioMode={audioMode} setAudioMode={setAudioMode} wordLanguage={word.language || "EN"} isAudioRepeat={!!isAudioRepeat} onToggleAudioRepeat={onToggleAudioRepeat} isSpeaking={!!isSpeaking} isPending={!!isPending} onSpeakClick={() => handleSpeak()} />', content)

# Replace Laptop Audio Toolbar
laptop_regex = re.compile(r'\{\/\* Toolbar \*\/\}\s*<div className="flex items-center justify-center text-muted z-10 mt-8 gap-1">.*?</div>', re.DOTALL)
if laptop_regex.search(content):
    content = laptop_regex.sub('{/* Toolbar */}\n                    <AudioToolbar variant="laptop" audioMode={audioMode} setAudioMode={setAudioMode} wordLanguage={word.language || "EN"} isAudioRepeat={!!isAudioRepeat} onToggleAudioRepeat={onToggleAudioRepeat} isSpeaking={!!isSpeaking} isPending={!!isPending} onSpeakClick={() => handleSpeak()} isLooping={!!isLooping} onToggleLoop={onToggleLoop} />', content)

# The trailing syntax error was because the python script replaced something wrongly at the end of the file.
# Wait, "error TS1128: Declaration or statement expected." at line 669.
# Let's see the end of the file.
