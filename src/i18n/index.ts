/**
 * i18n Configuration - Multi-language & Dialect Support
 *
 * Supports:
 * - English (US, UK)
 * - Arabic (Lebanese, Egyptian, MSA)
 * - Spanish (Castilian, Latin American, Mexican)
 * - French (France, Canadian)
 * - German (Germany, Austrian)
 * - Chinese (Simplified, Traditional)
 * - Portuguese (Brazil, Portugal)
 * 
 * RTL support for Arabic
 * Uses expo-localization for device language detection
 * Uses i18n-js for translation management
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Import all translations
import en from './locales/en';
import ar from './locales/ar';
import ar_LB from './locales/ar_LB';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import zh from './locales/zh';

// Storage keys
const LANGUAGE_KEY = '@mymacroai_language';
const DIALECT_KEY = '@mymacroai_dialect';

// ============================================================================
// LANGUAGE DEFINITIONS
// ============================================================================

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dialects?: Record<string, DialectInfo>;
}

export interface DialectInfo {
  code: string;
  name: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    dialects: {
      en_US: { code: 'en_US', name: 'American English', nativeName: 'American English', region: 'United States' },
      en_GB: { code: 'en_GB', name: 'British English', nativeName: 'British English', region: 'United Kingdom' },
    },
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    dialects: {
      ar_LB: { code: 'ar_LB', name: 'Lebanese Arabic', nativeName: 'لبناني', region: 'Lebanon' },
      ar_EG: { code: 'ar_EG', name: 'Egyptian Arabic', nativeName: 'مصري', region: 'Egypt' },
      ar_SA: { code: 'ar_SA', name: 'Gulf Arabic', nativeName: 'خليجي', region: 'Gulf' },
      ar: { code: 'ar', name: 'Modern Standard Arabic', nativeName: 'فصحى', region: 'Standard' },
    },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    dialects: {
      es_ES: { code: 'es_ES', name: 'Castilian Spanish', nativeName: 'Castellano', region: 'Spain' },
      es_MX: { code: 'es_MX', name: 'Mexican Spanish', nativeName: 'Español Mexicano', region: 'Mexico' },
      es_AR: { code: 'es_AR', name: 'Argentinian Spanish', nativeName: 'Español Rioplatense', region: 'Argentina' },
    },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    dialects: {
      fr_FR: { code: 'fr_FR', name: 'French (France)', nativeName: 'Français (France)', region: 'France' },
      fr_CA: { code: 'fr_CA', name: 'Canadian French', nativeName: 'Français Canadien', region: 'Canada' },
    },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    dialects: {
      de_DE: { code: 'de_DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)', region: 'Germany' },
      de_AT: { code: 'de_AT', name: 'Austrian German', nativeName: 'Österreichisch', region: 'Austria' },
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    dialects: {
      zh_CN: { code: 'zh_CN', name: 'Simplified Chinese', nativeName: '简体中文', region: 'Mainland China' },
      zh_TW: { code: 'zh_TW', name: 'Traditional Chinese', nativeName: '繁體中文', region: 'Taiwan' },
    },
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    dialects: {
      pt_BR: { code: 'pt_BR', name: 'Brazilian Portuguese', nativeName: 'Português Brasileiro', region: 'Brazil' },
      pt_PT: { code: 'pt_PT', name: 'European Portuguese', nativeName: 'Português Europeu', region: 'Portugal' },
    },
  },
};

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// ============================================================================
// I18N INSTANCE
// ============================================================================

// Create i18n instance with all translations
const i18n = new I18n({
  en,
  en_US: en,
  en_GB: en, // Could have specific UK translations
  ar,
  ar_LB,
  ar_EG: ar, // Falls back to MSA, could have Egyptian-specific
  ar_SA: ar, // Falls back to MSA
  es,
  es_ES: es,
  es_MX: es, // Could have Mexican-specific
  es_AR: es, // Could have Argentinian-specific
  fr,
  fr_FR: fr,
  fr_CA: fr, // Could have Canadian-specific
  de,
  de_DE: de,
  de_AT: de, // Could have Austrian-specific
  zh,
  zh_CN: zh,
  zh_TW: zh, // Could have Traditional-specific
});

// Configuration
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// ============================================================================
// RTL SUPPORT
// ============================================================================

/**
 * Check if current language is RTL
 */
export const isRTL = (): boolean => {
  const lang = getBaseLanguage(i18n.locale);
  return SUPPORTED_LANGUAGES[lang]?.rtl || false;
};

/**
 * Apply RTL settings
 */
export const applyRTL = (language: string): void => {
  const lang = getBaseLanguage(language);
  const shouldBeRTL = SUPPORTED_LANGUAGES[lang]?.rtl || false;
  
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    // Note: App restart may be required for full RTL change
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get base language from locale (e.g., 'ar_LB' -> 'ar')
 */
export const getBaseLanguage = (locale: string): string => {
  return locale.split('_')[0];
};

/**
 * Get device language
 */
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales.length > 0) {
    const { languageCode, regionCode } = locales[0];
    const lang = languageCode || 'en';
    // Try to match with dialect first
    const dialectCode = regionCode ? `${lang}_${regionCode}` : lang;
    
    // Check if we have this specific dialect
    const baseLang = SUPPORTED_LANGUAGES[lang];
    if (baseLang?.dialects?.[dialectCode]) {
      return dialectCode;
    }
    
    // Fall back to base language
    return lang;
  }
  return 'en';
};

// Initialize locale
const deviceLanguage = getDeviceLanguage();
i18n.locale = Object.keys(SUPPORTED_LANGUAGES).includes(getBaseLanguage(deviceLanguage))
  ? deviceLanguage
  : 'en';

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get the current language code (including dialect)
 */
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

/**
 * Get the current base language (without dialect)
 */
export const getCurrentBaseLanguage = (): SupportedLanguage => {
  return getBaseLanguage(i18n.locale) as SupportedLanguage;
};

/**
 * Get language info for current language
 */
export const getCurrentLanguageInfo = (): LanguageInfo | undefined => {
  return SUPPORTED_LANGUAGES[getCurrentBaseLanguage()];
};

/**
 * Set the app language (with optional dialect)
 * @param language - Language code (e.g., 'en', 'ar', 'ar_LB')
 */
export const setLanguage = async (language: string): Promise<void> => {
  const baseLang = getBaseLanguage(language);
  
  if (Object.keys(SUPPORTED_LANGUAGES).includes(baseLang)) {
    i18n.locale = language;
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    
    // Apply RTL if needed
    applyRTL(language);
  }
};

/**
 * Load saved language preference from storage
 */
export const loadSavedLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      const baseLang = getBaseLanguage(savedLanguage);
      if (Object.keys(SUPPORTED_LANGUAGES).includes(baseLang)) {
        i18n.locale = savedLanguage;
        applyRTL(savedLanguage);
        return savedLanguage;
      }
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

/**
 * Get all available languages
 */
export const getAvailableLanguages = (): LanguageInfo[] => {
  return Object.values(SUPPORTED_LANGUAGES);
};

/**
 * Get dialects for a language
 */
export const getDialectsForLanguage = (languageCode: SupportedLanguage): DialectInfo[] => {
  const lang = SUPPORTED_LANGUAGES[languageCode];
  if (lang?.dialects) {
    return Object.values(lang.dialects);
  }
  return [];
};

/**
 * Get the native name for current language
 */
export const getCurrentLanguageNativeName = (): string => {
  const langInfo = getCurrentLanguageInfo();
  const dialect = langInfo?.dialects?.[i18n.locale];
  return dialect?.nativeName || langInfo?.nativeName || 'English';
};

/**
 * Format date according to current locale
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const locale = i18n.locale.replace('_', '-');
  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Format number according to current locale
 */
export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  const locale = i18n.locale.replace('_', '-');
  return new Intl.NumberFormat(locale, options).format(num);
};

/**
 * Get language prompt for AI (to respond in user's language)
 */
export const getAILanguagePrompt = (): string => {
  const langInfo = getCurrentLanguageInfo();
  const dialect = langInfo?.dialects?.[i18n.locale];
  
  if (!langInfo) return '';
  
  if (dialect) {
    return `IMPORTANT: Respond in ${dialect.nativeName} (${dialect.name}). Use natural ${langInfo.name} as spoken in ${dialect.region}. Be culturally appropriate and use local expressions.`;
  }
  
  return `IMPORTANT: Respond in ${langInfo.nativeName} (${langInfo.name}). Be culturally appropriate.`;
};

export default i18n;
