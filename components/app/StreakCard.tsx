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

// Returns cells for the current month aligned Mon–Sun.
// null = empty cell (before the 1st or after the last day).
function monthGrid(): ({ date: string; future: boolean } | null)[] {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const year  = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mon=0

  const cells: ({ date: string; future: boolean } | null)[] = Array(startOffset).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d).toISOString().slice(0, 10);
    cells.push({ date, future: date > todayKey });
  }

  // Pad last row to a full week
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function StreakCard({ focusByDay }: StreakCardProps) {
  const { t } = useAppLang();
  const h = t.home;

  const focusMap = new Map<string, number>();
  for (const r of focusByDay) focusMap.set(r.date, r.totalMin);

  const streak = computeStreak(focusByDay);
  const cells  = monthGrid();
  const today  = new Date().toISOString().slice(0, 10);

  // Split into rows of 7 (Mon–Sun)
  const weeks: (typeof cells[number])[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="streak-card">
      <div className="streak-left">
        <span className="streak-title">{h.buildStreak}</span>
        <span className="streak-num">{streak}</span>
        <span className="streak-label">{h.consecutiveDays}</span>
      </div>
      <div className="streak-grid-wrap">
        {/* Day-of-week header */}
        <div className="streak-grid-header">
          {DOW_LABELS.map((d, i) => (
            <span key={i} className="streak-grid-dow">{d}</span>
          ))}
        </div>
        {/* Month grid */}
        <div className="streak-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="streak-grid-row">
              {week.map((cell, ci) => {
                if (!cell) return <div key={ci} className="streak-grid-cell streak-cell-empty" />;
                const { date, future } = cell;
                const hasActivity = (focusMap.get(date) ?? 0) > 0;
                const isToday = date === today;
                let cls = "streak-grid-cell";
                if (future)           cls += " streak-cell-future";
                else if (isToday)     cls += " streak-cell-today";
                else if (hasActivity) cls += " streak-cell-active";
                return <div key={date} className={cls} title={date} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
