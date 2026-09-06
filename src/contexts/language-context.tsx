"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';
import bn from '@/locales/bn.json';
import bho from '@/locales/bho.json';
import pa from '@/locales/pa.json';

const translations: Record<string, any> = { en, hi, kn, bn, bho, pa };

export type Language = 'en' | 'hi' | 'kn' | 'bn' | 'bho' | 'pa';

const LANGUAGE_STORAGE_KEY = 'beejmantra_preferred_lang';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile, loading: authLoading, updateUserProfile } = useAuth();
  
  // 1. Initialize language state with immediate local storage lookup
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
        if (saved && ['en', 'hi', 'kn', 'bn', 'bho', 'pa'].includes(saved)) {
          return saved;
        }
      } catch {}
    }
    return 'hi';
  });

  // 2. Client-side hydration check
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (savedLang && ['en', 'hi', 'kn', 'bn', 'bho', 'pa'].includes(savedLang)) {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      }
    } catch {
      // Storage access blocked
    }
  }, []);

  // 3. Central setLanguage that immediately updates state and persists
  const setLanguage = useCallback((newLang: Language) => {
    if (!['en', 'hi', 'kn', 'bn', 'bho', 'pa'].includes(newLang)) return;
    
    setLanguageState(newLang);
    
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {}

    if (updateUserProfile) {
      updateUserProfile({ language: newLang }).catch(() => {});
    }
  }, [updateUserProfile]);

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    const langFile = translations[language] || translations.hi || translations.en;
    
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
        if (acc && typeof acc === 'object' && acc[currentKey] !== undefined) {
            return acc[currentKey];
        }
        return undefined;
    }, langFile as any);

    // Fallback to English if missing in current language
    if (result === undefined && language !== 'en') {
      result = keys.reduce((acc, currentKey) => {
        if (acc && typeof acc === 'object' && acc[currentKey] !== undefined) {
          return acc[currentKey];
        }
        return undefined;
      }, translations.en as any);
    }

    if (result === undefined) {
        return key;
    }
    
    if (typeof result === 'string') {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            result = result.replace(regex, String(replacements[placeholder]));
        });
    }

    return result;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};