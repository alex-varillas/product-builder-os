"use client";

import { DayFocusRow } from "@/lib/analytics";
import { useAppLang } from "./AppLanguageContext";

interface StreakCardProps {
  focusByDay: DayFocusRow[];
}

const DOW_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function computeStreak(rows: DayFocusRow[]): number {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.date, r.totalMin);
  const d = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if ((map.get(key) ?? 0) > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      if (i === 0) { d.setDate(d.getDate() - 1); continue; }
      break;
    }
  }
  return streak;
}

function thisWeekKeys(): string[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function StreakCard({ focusByDay }: StreakCardProps) {
  const { t } = useAppLang();
  const h = t.home;

  const focusMap = new Map<string, number>();
  for (const r of focusByDay) focusMap.set(r.date, r.totalMin);

  const streak = computeStreak(focusByDay);
  const weekKeys = thisWeekKeys();
  const maxMins = Math.max(1, ...weekKeys.map((k) => focusMap.get(k) ?? 0));

  return (
    <div className="streak-card">
      <div className="streak-left">
        <span className="streak-title">{h.buildStreak}</span>
        <span className="streak-num">{streak}</span>
        <span className="streak-label">{h.consecutiveDays}</span>
      </div>
      <div className="streak-right">
        <div className="streak-bars">
          {weekKeys.map((key) => {
            const mins = focusMap.get(key) ?? 0;
            return (
              <div key={key} className="streak-bar-col">
                <div
                  className="streak-bar-fill"
                  style={{
                    height: `${Math.max(3, Math.round((mins / maxMins) * 44))}px`,
                    background: mins > 0 ? "var(--orange)" : "var(--bg-stone)",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="streak-week">
          {weekKeys.map((key, i) => (
            <div key={key} className="streak-day">
              <span className="streak-dow">{DOW_LABELS[i]}</span>
              <div
                className={`streak-dot ${
                  (focusMap.get(key) ?? 0) > 0 ? "streak-dot-done" : "streak-dot-empty"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
