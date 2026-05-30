"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { DayFocusRow } from "@/lib/analytics";
import { isSameDay } from "@/lib/time-blocks";

interface MiniMonthCalendarProps {
  focusByDay: DayFocusRow[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  blockCountsByDay?: Map<string, number>;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["M","T","W","T","F","S","S"];

export function MiniMonthCalendar({ focusByDay, selectedDate, onSelectDate, blockCountsByDay }: MiniMonthCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const focusMap = new Map<string, number>();
  for (const r of focusByDay) focusMap.set(r.date, r.totalMin);

  const firstDow   = new Date(year, month, 1).getDay();
  const startOff   = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMon  = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOff + daysInMon) / 7) * 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dn = i - startOff + 1;
    cells.push(dn < 1 || dn > daysInMon ? null : new Date(year, month, dn));
  }

  return (
    <div className="mini-cal">
      {/* Header */}
      <div className="mc-header">
        <span className="mc-month-label">{MONTH_NAMES[month]} {year}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button className="mc-nav-btn" onClick={prevMonth}><Icons.ChevronLeft /></button>
          <button className="mc-nav-btn" onClick={nextMonth}><Icons.ChevronRight /></button>
        </div>
      </div>

      {/* Day-of-week row */}
      <div className="mc-dow-row">
        {DAY_LABELS.map((d, i) => <span key={i} className="mc-dow">{d}</span>)}
      </div>

      {/* Day grid */}
      <div className="mc-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="mc-cell mc-cell-empty" />;
          const key      = d.toISOString().slice(0, 10);
          const hasFocus = (focusMap.get(key) ?? 0) > 0;
          const isToday  = isSameDay(d, today);
          const isSel    = isSameDay(d, selectedDate);
          const isPast   = d < today && !isToday;

          const isFuture = !isPast && !isToday;
          const hasBlock = (blockCountsByDay?.get(key) ?? 0) > 0;

          let cellClass = "mc-cell";
          if (isToday)                    cellClass += " mc-today";
          else if (isSel)                 cellClass += " mc-selected";
          else if (hasFocus && isPast)    cellClass += " mc-done";
          else if (hasBlock && isFuture)  cellClass += " mc-scheduled";
          else if (isFuture)              cellClass += " mc-future";

          return (
            <button key={i} className={cellClass} onClick={() => onSelectDate(d)}>
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mc-legend">
        <span className="mc-legend-item"><span className="mc-legend-dot mc-legend-today" />Today</span>
        <span className="mc-legend-item"><span className="mc-legend-dot mc-legend-done" />Done</span>
        <span className="mc-legend-item"><span className="mc-legend-dot mc-legend-scheduled" />Scheduled</span>
      </div>
    </div>
  );
}
