'use client';

// Define the translations object
const translations = {
  en: { releaseToClose: 'Release to Close' },
  // Add more locales if needed
};

// Define the keys available in translations
type TranslationKeys = keyof (typeof translations)['en'];

// Define the locales available in translations
type Locale = keyof typeof translations;

export function t(key: TranslationKeys, locale: Locale = 'en'): string {
  return translations[locale]?.[key] || key;
}

// src/app/i18n/index.ts
