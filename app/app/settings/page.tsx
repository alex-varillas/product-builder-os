"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "@/components/app/AppLanguageContext";
import { AppLang } from "@/lib/app-i18n";

const LANGS: { id: AppLang; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "es", label: "Spanish", native: "Español" },
];

export default function SettingsPage() {
  const { lang, setLang, t } = useAppLang();
  const s = t.settings;

  return (
    <div className="settings-shell">
      <aside className="settings-sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.92)" />
              <rect x="7" y="1" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.55)" />
              <rect x="1" y="7" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.55)" />
              <rect x="7" y="7" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.28)" />
            </svg>
          </div>
          <div className="sb-brand-name">Board<em>OS</em></div>
        </div>

        <Link href="/app" className="sb-row settings-back-row">
          <Icons.Arrow style={{ transform: "rotate(180deg)" }} />
          {s.back}
        </Link>

        <div className="sb-divider" />

        <div className="sb-row active">
          <Icons.Layers />
          {s.title}
        </div>
      </aside>

      <div className="settings-main">
        <div className="settings-content">
          <h1 className="settings-page-title">{s.title}</h1>

          <section className="settings-section">
            <h2 className="settings-section-title">{s.preferences}</h2>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">{s.language}</div>
                <div className="settings-row-desc">{s.languageDesc}</div>
              </div>
              <div className="lang-pills">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    className={`lang-pill${lang === l.id ? " active" : ""}`}
                    onClick={() => setLang(l.id)}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="settings-section-title">{s.account}</h2>
            <div className="settings-placeholder">
              <p>{s.accountDesc}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
