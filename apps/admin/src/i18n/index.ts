import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import ko from './locales/ko.json';
import en from './locales/en.json';

export const SUPPORTED_LANGS = ['ko', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ko: { translation: ko },
            en: { translation: en },
        },
        fallbackLng: 'ko',
        supportedLngs: [...SUPPORTED_LANGS],
        interpolation: { escapeValue: false }, // React already escapes
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'repoint.lang',
        },
    });

export default i18n;
