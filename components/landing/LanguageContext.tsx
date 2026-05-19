"use client";

import { createContext, useContext, useState } from "react";
import { translations, type Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  t: typeof translations.en;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: translations[lang] as typeof translations.en,
        toggle: () => setLang((l) => (l === "en" ? "es" : "en")),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
