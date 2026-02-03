/**
 * i18n Configuration - Multi-language Support
 *
 * Supports: English, Spanish, Chinese, French, German
 * Uses expo-localization for device language detection
 * Uses i18n-js for translation management
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all translations
import en from './locales/en';
import es from './locales/es';
import zh from './locales/zh';
import fr from './locales/fr';
import de from './locales/de';

// Storage key for user's language preference
const LANGUAGE_KEY = '@mymacroai_language';

// Supported languages
export const SUPPORTED_LANGUAGES = {
    en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
    es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Create i18n instance
const i18n = new I18n({
    en,
    es,
    zh,
    fr,
    de,
});

// Configuration
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Get device language (first 2 characters, e.g., 'en-US' -> 'en')
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

// Set initial locale to device language if supported, otherwise default to English
i18n.locale = Object.keys(SUPPORTED_LANGUAGES).includes(deviceLanguage)
    ? deviceLanguage
    : 'en';

/**
 * Get the current language code
 */
export const getCurrentLanguage = (): SupportedLanguage => {
    return i18n.locale as SupportedLanguage;
};

/**
 * Set the app language
 * @param language - Language code (en, es, zh, fr, de)
 */
export const setLanguage = async (language: SupportedLanguage): Promise<void> => {
    if (Object.keys(SUPPORTED_LANGUAGES).includes(language)) {
        i18n.locale = language;
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
    }
};

/**
 * Load saved language preference from storage
 */
export const loadSavedLanguage = async (): Promise<SupportedLanguage> => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && Object.keys(SUPPORTED_LANGUAGES).includes(savedLanguage)) {
            i18n.locale = savedLanguage;
            return savedLanguage as SupportedLanguage;
        }
    } catch (error) {
        if (__DEV__) console.error('[i18n] Failed to load saved language:', error);
    }
    return getCurrentLanguage();
};

/**
 * Translate a key with optional interpolation
 * @param key - Translation key (e.g., 'common.save')
 * @param options - Interpolation options
 */
export const t = (key: string, options?: Record<string, string | number>): string => {
    return i18n.t(key, options);
};

export default i18n;
