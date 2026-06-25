import React from "react";
import { BookOpen } from "lucide-react";
import { Word, DictionaryEntry } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DictionaryCardProps {
    word: Word;
    entry?: DictionaryEntry;
    arabicFontClass?: string;
}

export default function DictionaryCard({ word, entry, arabicFontClass = "" }: DictionaryCardProps) {
    return (
        <div className="p-6 bg-neutral-50/80 rounded-3xl space-y-5 border border-neutral-100/60 flex-1 relative overflow-hidden">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={16} /> Dictionary
            </h3>
            
            {entry ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* English Definition */}
                    {entry.definition && (
                        <div className="space-y-1">
                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Definition</div>
                            <div className="text-[15px] text-neutral-700 leading-relaxed font-medium">
                                {entry.definition}
                            </div>
                        </div>
                    )}

                    {/* Middle Row: Grammar Tag & Pronunciation */}
                    <div className="flex flex-col gap-4 pt-2">
                        {entry.grammar_tag && (
                            <div className="space-y-1 min-w-0">
                                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Grammar</div>
                                <div className="text-[15px] text-neutral-700 leading-relaxed font-medium">
                                    {entry.grammar_tag}
                                </div>
                            </div>
                        )}
                        {entry.syllables && (
                            <div className="space-y-1 min-w-0">
                                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Syllables</div>
                                <div className="text-[15px] text-neutral-700 leading-relaxed font-medium">
                                    {entry.syllables}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Word Origin (Root Letters & Meaning grouped together) */}
                    {(entry.root_letters || entry.root_meaning) && (
                        <div className="pt-4 mt-4 border-t border-neutral-200/50 space-y-4">
                            {entry.root_letters && (
                                <div className="space-y-2">
                                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Root Letters</div>
                                    <div className={cn("text-lg font-bold text-accent text-left", arabicFontClass)} dir="rtl">
                                        {entry.root_letters}
                                    </div>
                                </div>
                            )}
                            {entry.root_meaning && (
                                <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Root Meaning</div>
                                    <div className="text-[15px] text-neutral-700 leading-relaxed font-medium">
                                        {entry.root_meaning}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-base text-neutral-500 leading-relaxed">
                    {word.notes || "No detailed dictionary notes found for this word."}
                </p>
            )}
        </div>
    );
}
