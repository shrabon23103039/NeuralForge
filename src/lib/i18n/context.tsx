'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import enDict from './dictionaries/en.json';
import bnDict from './dictionaries/bn.json';

type Language = 'en' | 'bn';
type DictKey = keyof typeof enDict;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: DictKey | string, fallback?: string) => string;
}

const dictionaries = {
  en: enDict,
  bn: bnDict,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('nirapod_lang') as Language;
    if (saved && (saved === 'en' || saved === 'bn')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('nirapod_lang', newLang);
  };

  const t = (key: DictKey | string, fallback?: string): string => {
    const dict = dictionaries[lang] || dictionaries.en;
    if (key in dict) {
      return (dict as Record<string, string>)[key];
    }
    const enVal = (enDict as Record<string, string>)[key];
    if (enVal) return enVal;
    return fallback || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
