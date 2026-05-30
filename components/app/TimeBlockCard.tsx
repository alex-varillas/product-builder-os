"use client";

import { useRef } from "react";
import { Icons } from "@/components/ui/icons";
import { TimeBlock, minutesFromStart, durationMins, formatDuration, PX_PER_MINUTE, TIMELINE_START_HOUR, TIMELINE_END_HOUR, BlockColumn } from "@/lib/time-blocks";
import { Project } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";

interface TimeBlockCardProps {
  block: TimeBlock;
  layout: BlockColumn;
  containerWidth: number;
  projects: Project[];
  activeBlockId: string | null;
  onEdit: (block: TimeBlock) => void;
  onMarkDone: (id: string) => void;
  onStartFocus: (opts: { blockId: string; projectId: string | null; blockLabel: string }) => void;
  onDragUpdate: (id: string, newStartAt: Date, newEndAt: Date) => void;
}

const GAP = 4;

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#1A1714" : "#FFFFFF";
}

export function TimeBlockCard({
  block,
  layout,
  containerWidth,
  projects,
  activeBlockId,
  onEdit,
  onMarkDone,
  onStartFocus,
  onDragUpdate,
}: TimeBlockCardProps) {
  const { t } = useAppLang();
  const project = projects.find((p) => p.id === block.projectId);
  const now = new Date();
  const isPast = block.endAt < now;

  const top = minutesFromStart(block.startAt) * PX_PER_MINUTE;
  const height = Math.max(24, durationMins(block.startAt, block.endAt) * PX_PER_MINUTE);
  const colW = (containerWidth - GAP * (layout.totalCols - 1)) / layout.totalCols;
  const left = layout.col * (colW + GAP);

  const dragRef = useRef<{
    startY: number;
    origStart: Date;
    origEnd: Date;
    duration: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const dur = block.endAt.getTime() - block.startAt.getTime();
    dragRef.current = {
      startY: e.clientY,
      origStart: new Date(block.startAt),
      origEnd: new Date(block.endAt),
      duration: dur,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const deltaY = e.clientY - dragRef.current.startY;
    const deltaMs = Math.round(deltaY / PX_PER_MINUTE / 15) * 15 * 60000;
    const newStart = new Date(dragRef.current.origStart.getTime() + deltaMs);
    const newEnd = new Date(newStart.getTime() + dragRef.current.duration);

    const minStart = new Date(newStart);
    minStart.setHours(TIMELINE_START_HOUR, 0, 0, 0);
    const maxEnd = new Date(newEnd);
    maxEnd.setHours(TIMELINE_END_HOUR, 0, 0, 0);

    if (newStart.getHours() < TIMELINE_START_HOUR || newEnd.getHours() > TIMELINE_END_HOUR) return;
    onDragUpdate(block.id, newStart, newEnd);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const isActive = activeBlockId === block.id;
  const duration = formatDuration(durationMins(block.startAt, block.endAt));
  const textColor = getTextColor(block.color);
  const textMuted = textColor === "#FFFFFF" ? "rgba(255,255,255,0.7)" : "rgba(26,23,20,0.55)";

  return (
    <div
      className={`time-block-card${block.done ? " is-done" : ""}${isPast && !block.done ? " is-past" : ""}`}
      style={{
        top,
        height,
        left,
        width: colW,
        ["--block-color" as string]: block.color,
        ["--block-text" as string]: textColor,
        ["--block-text-muted" as string]: textMuted,
        boxShadow: isActive ? `0 0 0 2px ${textColor}` : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className={`tbc-label${block.done ? " is-done" : ""}`}>{block.label}</span>
      {project && (
        <span className="tbc-project">
          <span className="tbc-project-dot" style={{ background: project.color }} />
          {project.name}
        </span>
      )}
      {height > 44 && (
        <span className="tbc-time">
          {block.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          {" – "}
          {block.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          {" "}({duration})
        </span>
      )}

      {/* Always-on checkbox */}
      <button
        className={`tbc-checkbox${block.done ? " done" : ""}`}
        title={block.done ? "Mark active" : "Mark done"}
        onClick={(e) => { e.stopPropagation(); onMarkDone(block.id); }}
      >
        {block.done && <Icons.Check style={{ width: 11, height: 11, color: "var(--block-color)" }} />}
      </button>

      {/* Hover actions */}
      <div className="tbc-actions">
        {!block.done && (
          <button
            className="tbc-action-btn"
            title={t.pomodoro.startFocus}
            onClick={(e) => { e.stopPropagation(); onStartFocus({ blockId: block.id, projectId: block.projectId, blockLabel: block.label }); }}
          >
            <Icons.Play style={{ width: 10, height: 10 }} />
          </button>
        )}
        <button
          className="tbc-action-btn"
          title="Edit"
          onClick={(e) => { e.stopPropagation(); onEdit(block); }}
        >
          <Icons.Pencil style={{ width: 10, height: 10 }} />
        </button>
      </div>
    </div>
  );
}
