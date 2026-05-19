"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { appTranslations, AppLang, AppT } from "@/lib/app-i18n";

interface AppLangCtx {
  lang: AppLang;
  t: AppT;
  setLang: (l: AppLang) => void;
}

const Ctx = createContext<AppLangCtx | null>(null);

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("boardos-lang") as AppLang | null;
    if (stored === "en" || stored === "es") setLangState(stored);
  }, []);

  const setLang = (l: AppLang) => {
    setLangState(l);
    localStorage.setItem("boardos-lang", l);
  };

  return (
    <Ctx.Provider value={{ lang, t: appTranslations[lang] as AppT, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppLang must be used inside AppLanguageProvider");
  return ctx;
}
