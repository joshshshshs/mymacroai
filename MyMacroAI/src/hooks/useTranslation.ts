/**
 * useTranslation Hook - React hook for i18n integration
 *
 * Provides reactive translation support with language switching
 * Uses i18n-js under the hood with expo-localization
 */

import { useState, useEffect, useCallback } from 'react';
import i18n, {
    t as translate,
    getCurrentLanguage,
    setLanguage,
    loadSavedLanguage,
    SUPPORTED_LANGUAGES,
    SupportedLanguage,
} from '../i18n';

interface UseTranslationReturn {
    /** Translate a key with optional interpolation */
    t: (key: string, options?: Record<string, string | number>) => string;
    /** Current language code */
    locale: SupportedLanguage;
    /** Change the app language */
    changeLanguage: (language: SupportedLanguage) => Promise<void>;
    /** List of supported languages with metadata */
    languages: typeof SUPPORTED_LANGUAGES;
    /** Whether the translation system is ready */
    isReady: boolean;
}

/**
 * Hook for accessing translations in React components
 *
 * @example
 * ```tsx
 * const { t, locale, changeLanguage } = useTranslation();
 *
 * return (
 *   <View>
 *     <Text>{t('common.save')}</Text>
 *     <Text>Current: {locale}</Text>
 *     <Button onPress={() => changeLanguage('es')} title="Español" />
 *   </View>
 * );
 * ```
 */
export function useTranslation(): UseTranslationReturn {
    const [locale, setLocale] = useState<SupportedLanguage>(getCurrentLanguage());
    const [isReady, setIsReady] = useState(false);

    // Load saved language preference on mount
    useEffect(() => {
        loadSavedLanguage().then((savedLocale) => {
            setLocale(savedLocale);
            setIsReady(true);
        });
    }, []);

    // Memoized language change handler
    const changeLanguage = useCallback(async (language: SupportedLanguage) => {
        await setLanguage(language);
        setLocale(language);
    }, []);

    // Memoized translate function that re-renders on locale change
    const t = useCallback(
        (key: string, options?: Record<string, string | number>) => {
            return translate(key, options);
        },
        [locale] // Re-create when locale changes to trigger re-render
    );

    return {
        t,
        locale,
        changeLanguage,
        languages: SUPPORTED_LANGUAGES,
        isReady,
    };
}

/**
 * Get translation without hook (for non-component code)
 * Note: This won't trigger React re-renders on language change
 */
export { translate as t } from '../i18n';

export default useTranslation;
