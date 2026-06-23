import React from "react";
import { X } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LANGUAGES, ARABIC_FONTS, DEFAULT_ARABIC_FONT } from "@/lib/constants";
import { SessionSettings, Difficulty } from "@/lib/types";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SessionSettings;
    updateSettings: (updates: Partial<SessionSettings>) => void;
    isIOS: boolean;
    isPhone: boolean;
}

export default function SettingsModal({
    isOpen,
    onClose,
    settings,
    updateSettings,
    isIOS,
    isPhone
}: SettingsModalProps) {
    if (!isOpen) return null;
    
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/25 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 16 }}
                transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
                className="bg-[#fafafa] rounded-t-3xl sm:rounded-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)] w-full sm:max-w-[420px] max-h-[92vh] overflow-y-auto custom-scrollbar pb-safe"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-neutral-200" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <h2 className="text-[22px] font-bold tracking-tight">Settings</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                    >
                        <X size={15} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-6 pb-8 space-y-7 mt-2">

                    {/* ── Language ── */}
                    <div>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Language</p>
                        <LayoutGroup id="settings-language">
                            <div className="bg-neutral-100 rounded-2xl p-1 -mx-1">
                                <div className="flex overflow-x-auto snap-x" style={{ scrollbarWidth: 'none' }}>
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.value}
                                            onClick={() => updateSettings({ language: lang.value })}
                                            className={cn(
                                                "snap-start shrink-0 px-4 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                settings.language === lang.value ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                            )}
                                        >
                                            {settings.language === lang.value && (
                                                <motion.div
                                                    layoutId="settings-language-pill"
                                                    className="absolute inset-0 bg-accent rounded-xl"
                                                    style={{ zIndex: -1 }}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                />
                                            )}
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </LayoutGroup>
                    </div>

                    {/* ── Difficulty ── */}
                    <div>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Difficulty</p>
                        <LayoutGroup id="settings-difficulty">
                            <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                {(["beginner", "intermediate", "hard"] as Difficulty[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => updateSettings({ difficulty: d })}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                            settings.difficulty === d ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                        )}
                                    >
                                        {settings.difficulty === d && (
                                            <motion.div
                                                layoutId="settings-difficulty-pill"
                                                className="absolute inset-0 bg-accent rounded-xl"
                                                style={{ zIndex: -1 }}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                            />
                                        )}
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </LayoutGroup>
                    </div>

                    {/* ── Arabic Typeface ── */}
                    {(settings.language === "ar" || settings.language === "ur") && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Script Style</p>
                            <LayoutGroup id="settings-script">
                                <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                    {ARABIC_FONTS.map(font => (
                                        <button
                                            key={font.value}
                                            onClick={() => updateSettings({ arabicFont: font.value })}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                (settings.arabicFont ?? DEFAULT_ARABIC_FONT) === font.value ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                            )}
                                        >
                                            {(settings.arabicFont ?? DEFAULT_ARABIC_FONT) === font.value && (
                                                <motion.div
                                                    layoutId="settings-script-pill"
                                                    className="absolute inset-0 bg-accent rounded-xl"
                                                    style={{ zIndex: -1 }}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                />
                                            )}
                                            {font.description}
                                        </button>
                                    ))}
                                </div>
                            </LayoutGroup>
                        </div>
                    )}

                    {/* ── Handedness (iPad only) ── */}
                    {isIOS && !isPhone && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Writing Hand</p>
                            <LayoutGroup id="settings-handed">
                                <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                    {(["left", "right"] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => updateSettings({ handedness: m })}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                (settings.handedness || 'right') === m ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                            )}
                                        >
                                            {(settings.handedness || 'right') === m && (
                                                <motion.div
                                                    layoutId="settings-handed-pill"
                                                    className="absolute inset-0 bg-accent rounded-xl"
                                                    style={{ zIndex: -1 }}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                />
                                            )}
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </LayoutGroup>
                        </div>
                    )}

                    {/* ── Pencil Thickness (iPad only) ── */}
                    {isIOS && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Pen Weight</p>
                            <LayoutGroup id="settings-pencil">
                                <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                    {[
                                        { label: "Fine", val: 3 },
                                        { label: "Regular", val: 6 },
                                        { label: "Bold", val: 12 }
                                    ].map(m => (
                                        <button
                                            key={m.label}
                                            onClick={() => updateSettings({ penThickness: m.val })}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                (settings.penThickness || 6) === m.val ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                            )}
                                        >
                                            {(settings.penThickness || 6) === m.val && (
                                                <motion.div
                                                    layoutId="settings-pencil-pill"
                                                    className="absolute inset-0 bg-accent rounded-xl"
                                                    style={{ zIndex: -1 }}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                />
                                            )}
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </LayoutGroup>
                        </div>
                    )}

                    {/* ── Phone Input Mode (Phone only) ── */}
                    {isPhone && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">Input Mode</p>
                            <LayoutGroup id="settings-mobile">
                                <div className="flex p-1 bg-neutral-100 rounded-2xl -mx-1">
                                    {(["touch", "keyboard"] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => updateSettings({ mobileInputMode: m })}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-colors relative z-10",
                                                settings.mobileInputMode === m ? "text-white" : "text-neutral-400 hover:text-neutral-600"
                                            )}
                                        >
                                            {settings.mobileInputMode === m && (
                                                <motion.div
                                                    layoutId="settings-mobile-pill"
                                                    className="absolute inset-0 bg-accent rounded-xl"
                                                    style={{ zIndex: -1 }}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                                />
                                            )}
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </LayoutGroup>
                        </div>
                    )}


                    {/* ── Spaced Repetition toggle ── */}
                    <button
                        onClick={() => updateSettings({ activeRecall: !settings.activeRecall })}
                        className="w-full flex items-center justify-between group"
                    >
                        <div className="flex flex-col items-start gap-0.5 text-left">
                            <span className="text-[16px] font-semibold text-neutral-800">Spaced Repetition</span>
                            <span className="text-[13px] text-neutral-400 leading-snug">Revisit words you found harder, more often</span>
                        </div>
                        <div className={cn(
                            "relative flex-shrink-0 ml-4 w-12 h-7 rounded-full transition-colors duration-300",
                            settings.activeRecall ? "bg-accent" : "bg-neutral-200"
                        )}>
                            <motion.div
                                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
                                animate={{ x: settings.activeRecall ? 22 : 4 }}
                                transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
                            />
                        </div>
                    </button>

                </div>
            </motion.div>
        </motion.div>
    );
}
