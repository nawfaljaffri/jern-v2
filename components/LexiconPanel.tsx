import React, { useState, useRef } from "react";
import { X, Search, ChevronUp, ChevronDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Flag from "react-world-flags";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Word, Language } from "@/lib/types";
import { LANGUAGES } from "@/lib/constants";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function VirtualList({ words, arabicFontClass, onSelectWord }: { words: Word[]; arabicFontClass?: string; onSelectWord?: (w: Word) => void }) {
    const parentRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: words.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="max-h-[50vh] overflow-y-auto px-3 pb-3 custom-scrollbar">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const word = words[virtualRow.index];
                    const isAr = word.language === "ar" || word.language === "ur";
                    return (
                        <div
                            key={virtualRow.index}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="py-0.5"
                        >
                            <div 
                                onClick={() => onSelectWord?.(word)}
                                className={cn("flex items-center justify-between p-3 rounded-lg hover:bg-extra-muted/30 transition-colors h-full", onSelectWord && "cursor-pointer")}
                            >
                                <div>
                                    <div
                                        className={cn("text-base font-medium", isAr ? (arabicFontClass || "font-arabic") : "font-sans")}
                                        dir={isAr ? "rtl" : "ltr"}
                                    >
                                        {word.original}
                                    </div>
                                    <div className="text-xs text-muted">{word.romanized}</div>
                                </div>
                                <div className="text-xs text-muted max-w-[100px] text-right truncate">{word.definition}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface LexiconPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: Word[];
    onSelectWord: (word: Word) => void;
    arabicFontClass: string;
}

export default function LexiconPanel({
    isOpen,
    onClose,
    history,
    onSelectWord,
    arabicFontClass
}: LexiconPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedLangInHistory, setExpandedLangInHistory] = useState<Language | null>("ar");

    const groupedHistory = LANGUAGES.map(lang => ({
        ...lang,
        words: history.filter(w => w.language === lang.value || w.id.startsWith(lang.value)),
    })).filter(g => g.words.length > 0);

    return (
        <>
            <div
                className={cn("lexicon-overlay cursor-pointer", isOpen && "open")}
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={cn("lexicon-panel bg-white border-l border-neutral-100 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]", isOpen && "open")}>
                <div className="flex items-center justify-between p-5 shrink-0">
                    <h2 className="text-lg font-semibold">History</h2>
                    <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={18} /></button>
                </div>
                <div className="px-5 pb-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-extra-muted/30 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-10 custom-scrollbar space-y-3">
                    {groupedHistory.length === 0 && (
                        <p className="text-muted text-sm py-10 text-center">No words mastered yet.</p>
                    )}
                    {groupedHistory.map(group => (
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
                                {expandedLangInHistory === group.value
                                    ? <ChevronUp size={16} className="text-muted" />
                                    : <ChevronDown size={16} className="text-muted" />}
                            </button>

                            {expandedLangInHistory === group.value && (
                                <VirtualList
                                    words={group.words.filter(w =>
                                        w.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        w.romanized.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        w.definition.toLowerCase().includes(searchQuery.toLowerCase())
                                    )}
                                    arabicFontClass={arabicFontClass}
                                    onSelectWord={onSelectWord}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
