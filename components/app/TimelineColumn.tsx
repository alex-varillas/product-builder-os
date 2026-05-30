"use client";

import { useEffect, useRef, useState } from "react";
import {
  TimeBlock,
  TIMELINE_START_HOUR,
  TIMELINE_END_HOUR,
  PX_PER_MINUTE,
  minutesFromStart,
  computeColumns,
} from "@/lib/time-blocks";
import { Project } from "@/lib/app-data";
import { Icons } from "@/components/ui/icons";
import { TimeBlockCard } from "./TimeBlockCard";
import { useAppLang } from "./AppLanguageContext";
import { StartOpts } from "@/lib/pomodoro";

const HOURS = Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }, (_, i) => TIMELINE_START_HOUR + i);
const TOTAL_MINS = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;
const TOTAL_HEIGHT = TOTAL_MINS * PX_PER_MINUTE;

interface TimelineColumnProps {
  blocks: TimeBlock[];
  projects: Project[];
  activeBlockId: string | null;
  onOpenBlock: (hour?: number) => void;
  onEditBlock: (block: TimeBlock) => void;
  onMarkDone: (id: string) => void;
  onStartFocus: (opts: StartOpts) => void;
  onDragUpdate: (id: string, newStartAt: Date, newEndAt: Date) => void;
}

export function TimelineColumn({
  blocks,
  projects,
  activeBlockId,
  onOpenBlock,
  onEditBlock,
  onMarkDone,
  onStartFocus,
  onDragUpdate,
}: TimelineColumnProps) {
  const { t } = useAppLang();
  const wrapRef = useRef<HTMLDivElement>(null);
  const blocksAreaRef = useRef<HTMLDivElement>(null);
  const [areaWidth, setAreaWidth] = useState(0);
  const [nowTop, setNowTop] = useState<number | null>(null);
  const [nowLabel, setNowLabel] = useState("");

  useEffect(() => {
    const el = blocksAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAreaWidth(el.clientWidth - 8));
    ro.observe(el);
    setAreaWidth(el.clientWidth - 8);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (now.getHours() < TIMELINE_START_HOUR || now.getHours() >= TIMELINE_END_HOUR) {
        setNowTop(null);
        return;
      }
      setNowTop(minutesFromStart(now) * PX_PER_MINUTE);
      setNowLabel(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || nowTop == null) return;
    wrap.scrollTop = Math.max(0, nowTop - 160);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = computeColumns(blocks);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".time-block-card")) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const mins = Math.round(y / PX_PER_MINUTE / 15) * 15;
    const hour = TIMELINE_START_HOUR + Math.floor(mins / 60);
    onOpenBlock(Math.min(Math.max(hour, TIMELINE_START_HOUR), TIMELINE_END_HOUR - 1));
  };

  return (
    <div className="timeline-wrap" ref={wrapRef}>
      <div className="timeline-grid" style={{ height: TOTAL_HEIGHT + 56 }}>

        {/* Hour labels */}
        <div className="timeline-labels" style={{ height: TOTAL_HEIGHT }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="timeline-hour-label"
              style={{ top: (h - TIMELINE_START_HOUR) * 60 * PX_PER_MINUTE }}
            >
              {h.toString().padStart(2, "0")}
            </div>
          ))}
          {nowTop != null && (
            <div className="timeline-now-label" style={{ top: nowTop }}>{nowLabel}</div>
          )}
        </div>

        {/* Rail: continuous line + sun/moon + per-block markers */}
        <div className="timeline-rail" style={{ height: TOTAL_HEIGHT }}>
          <div className="tl-rail-line" />
          <div className="tl-sun" style={{ top: 0 }}><Icons.Sun /></div>
          {blocks.map((block) => (
            <div
              key={block.id}
              className="tl-marker"
              style={{
                top: minutesFromStart(block.startAt) * PX_PER_MINUTE,
                background: block.color,
              }}
            />
          ))}
          <div className="tl-moon" style={{ top: TOTAL_HEIGHT }}><Icons.Moon /></div>
        </div>

        {/* Blocks area */}
        <div
          className="timeline-blocks-area"
          ref={blocksAreaRef}
          style={{ height: TOTAL_HEIGHT }}
          onClick={handleAreaClick}
        >
          {/* Hour grid lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="timeline-hour-line"
              style={{ top: (h - TIMELINE_START_HOUR) * 60 * PX_PER_MINUTE }}
            />
          ))}
          {/* Half-hour lines */}
          {HOURS.slice(0, -1).map((h) => (
            <div
              key={`half-${h}`}
              className="timeline-half-line"
              style={{ top: ((h - TIMELINE_START_HOUR) * 60 + 30) * PX_PER_MINUTE }}
            />
          ))}

          {/* Current time */}
          {nowTop != null && (
            <div className="timeline-now" style={{ top: nowTop }} />
          )}

          {/* Blocks */}
          {areaWidth > 0 && blocks.map((block) => {
            const layout = columns.get(block.id) ?? { col: 0, totalCols: 1 };
            return (
              <TimeBlockCard
                key={block.id}
                block={block}
                layout={layout}
                containerWidth={areaWidth}
                projects={projects}
                activeBlockId={activeBlockId}
                onEdit={onEditBlock}
                onMarkDone={onMarkDone}
                onStartFocus={onStartFocus}
                onDragUpdate={onDragUpdate}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
}
