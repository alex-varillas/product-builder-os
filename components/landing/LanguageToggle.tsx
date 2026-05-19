"use client";

import { useLanguage } from "./LanguageContext";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();

  return (
    <div className="lang-toggle" role="group" aria-label="Language selector">
      <button
        className={`lang-btn${lang === "en" ? " active" : ""}`}
        onClick={() => lang !== "en" && toggle()}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        className={`lang-btn${lang === "es" ? " active" : ""}`}
        onClick={() => lang !== "es" && toggle()}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
    </div>
  );
}
