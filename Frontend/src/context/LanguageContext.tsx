import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.pt) => string;
  getLocalized: (item: any, fieldPrefix: string) => string;
  getLocalizedArray: (item: any, fieldPrefix: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pgg_lang') as Language;
    return saved && ['pt', 'en', 'fr'].includes(saved) ? saved : 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pgg_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations.pt): string => {
    const dict = translations[language] || translations.pt;
    return (dict as any)[key] || translations.pt[key] || String(key);
  };

  const getLocalized = (item: any, fieldPrefix: string): string => {
    if (!item) return '';
    const localizedKey = `${fieldPrefix}_${language}`;
    const fallbackKey = `${fieldPrefix}_pt`;
    return item[localizedKey] || item[fallbackKey] || '';
  };

  const getLocalizedArray = (item: any, fieldPrefix: string): string[] => {
    if (!item) return [];
    const localizedKey = `${fieldPrefix}_${language}`;
    const fallbackKey = `${fieldPrefix}_pt`;
    return item[localizedKey] || item[fallbackKey] || [];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized, getLocalizedArray }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
