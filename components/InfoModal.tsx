import React from "react";
import { X, Globe, RotateCcw, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

function InfoRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="p-2 bg-accent/10 text-accent rounded-lg mt-0.5 shrink-0">{icon}</div>
            <div>
                <h3 className="text-sm font-semibold mb-0.5">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{body}</p>
            </div>
        </div>
    );
}

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
    if (!isOpen) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 8 }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-neutral-100 max-w-md w-full p-6 space-y-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">About JERN</h2>
                    <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={18} /></button>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                    JERN is a focused environment for deep linguistic association, built on Dual Coding and Multisensory Integration. True learning happens when typing, listening, and reading converge on a single point — creating a loop that accelerates memory encoding.
                </p>
                <div className="space-y-4">
                    <InfoRow icon={<Globe size={14} />} title="100% Local & Private" body="Runs entirely in your browser. No data leaves your device. Works offline after first load." />
                    <InfoRow icon={<RotateCcw size={14} />} title="Spaced Repetition" body="Tracks mastered words and reinjects tricky vocabulary into your queue without breaking flow." />
                    <InfoRow icon={<Volume2 size={14} />} title="Dual-Language Audio" body="Toggle pronunciation between English and the target language, or enable continuous mode in settings." />
                </div>
                <div className="pt-4 border-t border-extra-muted text-center">
                    <p className="text-xs text-muted">
                        Made by{" "}
                        <a href="https://www.linkedin.com/in/nawfaljafri/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors font-medium">
                            Nawfal Jafri
                        </a>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
