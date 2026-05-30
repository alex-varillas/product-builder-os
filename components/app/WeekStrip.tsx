"use client";

import { Icons } from "@/components/ui/icons";
import { isSameDay, weekRange } from "@/lib/time-blocks";
import { useAppLang } from "./AppLanguageContext";

interface WeekStripProps {
  selectedDate: Date;
  blockCountsByDay: Map<string, number>; // "YYYY-MM-DD" → count
  onSelectDate: (d: Date) => void;
}

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function WeekStrip({ selectedDate, blockCountsByDay, onSelectDate }: WeekStripProps) {
  const { t } = useAppLang();
  const dayLabels = t.weekStrip.days;
  const today = new Date();

  const { start: weekStart } = weekRange(selectedDate);
  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    onSelectDate(d);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    onSelectDate(d);
  };

  const goToToday = () => onSelectDate(new Date());
  const isCurrentWeek = isSameDay(weekStart, weekRange(today).start);

  return (
    <div className="week-strip">
      <button className="ws-nav-btn" onClick={prevWeek} aria-label="Previous week">
        <Icons.ChevronLeft />
      </button>

      <div className="ws-days">
        {days.map((day, i) => {
          const key = toKey(day);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const hasBlocks = (blockCountsByDay.get(key) ?? 0) > 0;

          return (
            <button
              key={key}
              className={`ws-day${isSelected ? " ws-day-selected" : ""}${isToday ? " ws-day-today" : ""}`}
              onClick={() => onSelectDate(day)}
            >
              <span className="ws-day-label">{dayLabels[i]}</span>
              <span className="ws-day-num">{day.getDate()}</span>
              <span className={`ws-day-dot${hasBlocks ? " has-blocks" : ""}`} />
            </button>
          );
        })}
      </div>

      <button className="ws-nav-btn" onClick={nextWeek} aria-label="Next week">
        <Icons.ChevronRight />
      </button>

      {!isCurrentWeek && (
        <button className="ws-today-pill" onClick={goToToday}>
          {t.weekStrip.goToToday}
        </button>
      )}
    </div>
  );
}
