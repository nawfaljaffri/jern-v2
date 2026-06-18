import { Language, ArabicFont } from "./types";

export const LANGUAGES: { label: string; value: Language; countryCode: string; ttsLocale: string }[] = [
    { label: "Arabic", value: "ar", countryCode: "AE", ttsLocale: "ar-SA" },
    { label: "Spanish", value: "es", countryCode: "ES", ttsLocale: "es-ES" },
    { label: "Russian", value: "ru", countryCode: "RU", ttsLocale: "ru-RU" },
    { label: "German", value: "de", countryCode: "DE", ttsLocale: "de-DE" },
    { label: "Urdu", value: "ur", countryCode: "PK", ttsLocale: "ur-PK" },
    { label: "Chinese", value: "zh", countryCode: "CN", ttsLocale: "zh-CN" },
    { label: "French", value: "fr", countryCode: "FR", ttsLocale: "fr-FR" },
    { label: "Korean", value: "ko", countryCode: "KR", ttsLocale: "ko-KR" },
    { label: "Japanese", value: "ja", countryCode: "JP", ttsLocale: "ja-JP" },
];

export const FREQUENCY_TIERS = {
    beginner: { min: 1, max: 500 },
    intermediate: { min: 501, max: 2000 },
    hard: { min: 2001, max: 5000 },
};

export const ARABIC_FONTS: { label: string; value: ArabicFont; cssVar: string; preview: string; description: string }[] = [
    {
        label: "Cairo",
        value: "cairo",
        cssVar: "var(--font-cairo)",
        preview: "مرحبا",
        description: "Modern · Geometric",
    },
    {
        label: "Amiri",
        value: "amiri",
        cssVar: "var(--font-amiri)",
        preview: "مرحبا",
        description: "Classical · Elegant",
    },
    {
        label: "Kufam",
        value: "kufam",
        cssVar: "var(--font-kufam)",
        preview: "مرحبا",
        description: "Kufi · Bold",
    },
    {
        label: "Noto Kufi",
        value: "noto-kufi",
        cssVar: "var(--font-noto-kufi)",
        preview: "مرحبا",
        description: "Kufi · Clean",
    },
    {
        label: "Tajawal",
        value: "tajawal",
        cssVar: "var(--font-tajawal)",
        preview: "مرحبا",
        description: "Minimal · Contemporary",
    },
    {
        label: "Scheherazade",
        value: "scheherazade",
        cssVar: "var(--font-scheherazade)",
        preview: "مرحبا",
        description: "Traditional · Refined",
    },
];

export const DEFAULT_ARABIC_FONT: ArabicFont = "cairo";
