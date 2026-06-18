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
        label: "System Default",
        value: "system",
        cssVar: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        preview: "مرحبا",
        description: "Native",
    },
    {
        label: "Cairo",
        value: "cairo",
        cssVar: "var(--font-cairo)",
        preview: "مرحبا",
        description: "Modern",
    },
    {
        label: "Scheherazade",
        value: "scheherazade",
        cssVar: "var(--font-scheherazade)",
        preview: "مرحبا",
        description: "Traditional",
    },
];

export const DEFAULT_ARABIC_FONT: ArabicFont = "system";
