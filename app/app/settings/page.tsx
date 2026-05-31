"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "@/components/app/AppLanguageContext";
import { AppLang } from "@/lib/app-i18n";
import { usePreferences } from "@/lib/preferences";
import { requestPermission, getPermission } from "@/lib/notifications";

const LANGS: { id: AppLang; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "es", label: "Spanish", native: "Español" },
];

function NumInput({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}{unit ? ` (${unit})` : ""}</div>
      </div>
      <div className="pref-input-row">
        <button className="pref-stepper" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min}>−</button>
        <span className="pref-value">{value}</span>
        <button className="pref-stepper" onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { lang, setLang, t } = useAppLang();
  const s = t.settings;
  const p = t.prefs;
  const { prefs, setPrefs } = usePreferences();

  const [perm, setPerm] = useState<NotificationPermission>("default");
  useEffect(() => { setPerm(getPermission()); }, []);

  const toggleNotifications = async (on: boolean) => {
    if (on) {
      const result = await requestPermission();
      setPerm(result);
      setPrefs({ ...prefs, desktopNotifications: result === "granted" });
    } else {
      setPrefs({ ...prefs, desktopNotifications: false });
    }
  };

  return (
    <div className="settings-shell">
      <aside className="settings-sidebar">
        <div className="sb-brand">
          <Image src="/logo.png" alt="BoardOS" width={66} height={22} className="sb-logo" />
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        >
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
            <h2 className="settings-section-title">{p.title}</h2>
            <NumInput label={p.focusDuration} value={prefs.pomodoroFocusMin} min={5} max={90} step={5} unit={p.min}
              onChange={(v) => setPrefs({ ...prefs, pomodoroFocusMin: v })} />
            <NumInput label={p.breakDuration} value={prefs.pomodoroBreakMin} min={1} max={30} step={1} unit={p.min}
              onChange={(v) => setPrefs({ ...prefs, pomodoroBreakMin: v })} />
            <NumInput label={p.longBreak} value={prefs.pomodoroLongBreakMin} min={5} max={60} step={5} unit={p.min}
              onChange={(v) => setPrefs({ ...prefs, pomodoroLongBreakMin: v })} />
            <NumInput label={p.sessionsBeforeLong} value={prefs.pomodoroSessionsToLongBreak} min={2} max={8} step={1}
              onChange={(v) => setPrefs({ ...prefs, pomodoroSessionsToLongBreak: v })} />
            <NumInput label={p.dailyGoal} value={prefs.dailyFocusGoalMin} min={30} max={720} step={30} unit={p.min}
              onChange={(v) => setPrefs({ ...prefs, dailyFocusGoalMin: v })} />
          </section>

          <section className="settings-section">
            <h2 className="settings-section-title">{p.notificationsTitle}</h2>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">{p.desktopNotifications}</div>
                <div className="settings-row-desc">
                  {perm === "denied" ? p.permissionDenied : p.desktopNotificationsDesc}
                </div>
              </div>
              <div className="lang-pills">
                <button
                  className={`lang-pill${prefs.desktopNotifications ? " active" : ""}`}
                  onClick={() => toggleNotifications(true)}
                >
                  {p.on}
                </button>
                <button
                  className={`lang-pill${!prefs.desktopNotifications ? " active" : ""}`}
                  onClick={() => toggleNotifications(false)}
                >
                  {p.off}
                </button>
              </div>
            </div>
            {prefs.desktopNotifications && (
              <NumInput label={p.blockReminder} value={prefs.blockReminderMin} min={1} max={30} step={1} unit={p.min}
                onChange={(v) => setPrefs({ ...prefs, blockReminderMin: v })} />
            )}
          </section>

          <section className="settings-section">
            <h2 className="settings-section-title">{s.account}</h2>
            <div className="settings-placeholder">
              <p>{s.accountDesc}</p>
            </div>
          </section>
        </div>
        </motion.div>
      </div>
    </div>
  );
}
