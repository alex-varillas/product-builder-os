"use client";

import { useEffect, useRef, useState } from "react";
import { TimeBlock } from "@/lib/time-blocks";
import { Project } from "@/lib/app-data";
import { TimelineColumn } from "./TimelineColumn";
import { TimeBlockModal } from "./TimeBlockModal";
import { WeekStrip } from "./WeekStrip";
import { useAppLang } from "./AppLanguageContext";
import { StartOpts } from "@/lib/pomodoro";
import { isSameDay } from "@/lib/time-blocks";

interface TodayViewProps {
  timeBlocks: TimeBlock[];
  projects: Project[];
  todayFocusMins: number;
  activeBlockId: string | null;
  newBlockTrigger: number;
  selectedDate: Date;
  blockCountsByDay: Map<string, number>;
  onSelectDate: (d: Date) => void;
  onCreateBlock: (data: { label: string; projectId: string | null; startAt: Date; endAt: Date; color: string }) => void;
  onUpdateBlock: (id: string, changes: Partial<Pick<TimeBlock, "label" | "projectId" | "startAt" | "endAt" | "color" | "done">>) => void;
  onDeleteBlock: (id: string) => void;
  onStartFocus: (opts: StartOpts) => void;
}

export function TodayView({
  timeBlocks,
  projects,
  todayFocusMins,
  activeBlockId,
  newBlockTrigger,
  selectedDate,
  blockCountsByDay,
  onSelectDate,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  onStartFocus,
}: TodayViewProps) {
  const { t } = useAppLang();
  const td = t.today;

  const [modalOpen, setModalOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<TimeBlock | null>(null);
  const [initialHour, setInitialHour] = useState<number | null>(null);

  const prevTriggerRef = useRef(newBlockTrigger);
  useEffect(() => {
    if (newBlockTrigger > 0 && newBlockTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = newBlockTrigger;
      setEditBlock(null);
      setInitialHour(null);
      setModalOpen(true);
    }
  }, [newBlockTrigger]);

  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  const dateStr = selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const doneCount = timeBlocks.filter((b) => b.done).length;
  const totalCount = timeBlocks.length;

  const focusH = Math.floor(todayFocusMins / 60);
  const focusM = todayFocusMins % 60;
  const focusStr = focusH > 0 ? `${focusH}h ${focusM}m` : `${focusM}m`;

  const handleOpenBlock = (hour?: number) => {
    setEditBlock(null);
    setInitialHour(hour ?? null);
    setModalOpen(true);
  };

  const handleEditBlock = (block: TimeBlock) => {
    setEditBlock(block);
    setInitialHour(null);
    setModalOpen(true);
  };

  const handleSave = (data: { label: string; projectId: string | null; startAt: Date; endAt: Date; color: string }) => {
    if (editBlock) {
      onUpdateBlock(editBlock.id, data);
    } else {
      onCreateBlock(data);
    }
    setModalOpen(false);
    setEditBlock(null);
  };

  const handleMarkDone = (id: string) => {
    const block = timeBlocks.find((b) => b.id === id);
    if (!block) return;
    onUpdateBlock(id, { done: !block.done });
  };

  const handleDragUpdate = (id: string, newStartAt: Date, newEndAt: Date) => {
    onUpdateBlock(id, { startAt: newStartAt, endAt: newEndAt });
  };

  return (
    <div className="today-view">
      {/* Week strip nav */}
      <WeekStrip
        selectedDate={selectedDate}
        blockCountsByDay={blockCountsByDay}
        onSelectDate={onSelectDate}
      />

      {/* Stats row */}
      <div className="today-header">
        <div className="today-date-row">
          <span className="today-date">{isToday ? td.title : dateStr}</span>
          {isToday && <span className="today-weekday">{dateStr}</span>}
        </div>

        {totalCount > 0 && (
          <div className="today-stats">
            <div className="today-stat">
              <span className="today-stat-value">{focusStr}</span>
              <span className="today-stat-label">{td.statFocus}</span>
            </div>
            <div className="today-stat-sep" />
            <div className="today-stat">
              <span className="today-stat-value">{doneCount}/{totalCount}</span>
              <span className="today-stat-label">{td.statBlocks}</span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <TimelineColumn
        blocks={timeBlocks}
        projects={projects}
        activeBlockId={activeBlockId}
        onOpenBlock={handleOpenBlock}
        onEditBlock={handleEditBlock}
        onMarkDone={handleMarkDone}
        onStartFocus={onStartFocus}
        onDragUpdate={handleDragUpdate}
      />

      <TimeBlockModal
        open={modalOpen}
        projects={projects}
        editBlock={editBlock}
        initialHour={initialHour}
        onClose={() => { setModalOpen(false); setEditBlock(null); }}
        onSave={handleSave}
        onDelete={onDeleteBlock}
      />
    </div>
  );
}
