"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Icons } from "@/components/ui/icons";
import { AppSelect } from "@/components/ui/AppSelect";
import { Project } from "@/lib/app-data";
import { TimeBlock, toTimeInput, fromTimeInput } from "@/lib/time-blocks";
import { modalSpring } from "@/lib/motion";
import { useAppLang } from "./AppLanguageContext";

const BLOCK_COLORS = [
  "#F0620A", "#6D28D9", "#15803D", "#0D9488",
  "#2563EB", "#DC2626", "#F59E0B", "#A09D97",
];

const TIME_OPTIONS = Array.from({ length: 24 * 6 }, (_, i) => {
  const h = Math.floor(i / 6);
  const m = (i % 6) * 10;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return { value: `${hh}:${mm}`, label: `${hh}:${mm}` };
});

interface TimeBlockModalProps {
  open: boolean;
  projects: Project[];
  editBlock?: TimeBlock | null;
  initialHour?: number | null;
  onClose: () => void;
  onSave: (data: {
    label: string;
    projectId: string | null;
    startAt: Date;
    endAt: Date;
    color: string;
  }) => void;
  onDelete?: (id: string) => void;
}

export function TimeBlockModal({ open, projects, editBlock, initialHour, onClose, onSave, onDelete }: TimeBlockModalProps) {
  const { t } = useAppLang();
  const tb = t.timeBlock;
  const labelRef = useRef<HTMLInputElement>(null);

  const defaultStart = () => {
    const d = new Date();
    if (initialHour != null) {
      d.setHours(initialHour, 0, 0, 0);
    } else {
      d.setMinutes(Math.round(d.getMinutes() / 10) * 10, 0, 0);
      if (d.getMinutes() === 60) { d.setMinutes(0); d.setHours(d.getHours() + 1); }
    }
    return d;
  };

  const defaultEnd = (start: Date) => {
    const e = new Date(start);
    e.setHours(e.getHours() + 1);
    return e;
  };

  const [label, setLabel] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [startStr, setStartStr] = useState("09:00");
  const [endStr, setEndStr] = useState("10:00");
  const [color, setColor] = useState(BLOCK_COLORS[1]);

  useEffect(() => {
    if (!open) return;
    if (editBlock) {
      setLabel(editBlock.label);
      setProjectId(editBlock.projectId);
      setStartStr(toTimeInput(editBlock.startAt));
      setEndStr(toTimeInput(editBlock.endAt));
      setColor(editBlock.color);
    } else {
      const s = defaultStart();
      const e = defaultEnd(s);
      setLabel("");
      setProjectId(null);
      setStartStr(toTimeInput(s));
      setEndStr(toTimeInput(e));
      setColor(BLOCK_COLORS[1]);
    }
    setTimeout(() => labelRef.current?.focus(), 80);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editBlock?.id, initialHour]);

  // Inherit project color when project changes
  useEffect(() => {
    if (!editBlock) {
      const proj = projects.find((p) => p.id === projectId);
      if (proj) setColor(proj.color);
    }
  }, [projectId, projects, editBlock]);

  const handleSave = () => {
    if (!label.trim()) return;
    const today = new Date();
    const startAt = fromTimeInput(today, startStr);
    const endAt = fromTimeInput(today, endStr);
    if (endAt <= startAt) endAt.setDate(endAt.getDate() + 1);
    onSave({ label: label.trim(), projectId, startAt, endAt, color });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave();
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }}
          initial="hidden" animate="visible" exit="exit"
          transition={{ duration: 0.15 }}
          onClick={onClose}
          onKeyDown={handleKey}
        >
          <motion.div
            className="modal"
            style={{ width: 420 }}
            variants={modalSpring}
            initial="hidden" animate="visible" exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <span className="modal-title">{editBlock ? tb.editTitle : tb.newTitle}</span>
              <button className="modal-close" onClick={onClose}><Icons.Close /></button>
            </div>

            {/* Label */}
            <div style={{ marginBottom: 14 }}>
              {!editBlock && (
                <div className="tb-presets">
                  {tb.blockPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`tb-preset-pill${label === preset ? " active" : ""}`}
                      onClick={() => setLabel(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
              <input
                ref={labelRef}
                className="modal-input"
                placeholder={tb.labelPlaceholder}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            {/* Project */}
            <div style={{ marginBottom: 14 }}>
              <div className="detail-section-label">{tb.project}</div>
              <AppSelect
                value={projectId ?? ""}
                onChange={(v) => setProjectId(v || null)}
                options={[
                  { value: "", label: tb.noProject },
                  ...projects.map((p) => ({ value: p.id, label: p.name, color: p.color })),
                ]}
              />
            </div>

            {/* Time */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div className="detail-section-label">{tb.start}</div>
                <AppSelect value={startStr} onChange={setStartStr} options={TIME_OPTIONS} hideDot />
              </div>
              <div style={{ flex: 1 }}>
                <div className="detail-section-label">{tb.end}</div>
                <AppSelect value={endStr} onChange={setEndStr} options={TIME_OPTIONS} hideDot />
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 18 }}>
              <div className="detail-section-label" style={{ marginBottom: 8 }}>Color</div>
              <div className="color-row">
                {BLOCK_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`color-swatch${color === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="modal-foot" style={{ justifyContent: editBlock ? "space-between" : "flex-end" }}>
              {editBlock && onDelete && (
                <button
                  className="app-btn"
                  style={{ color: "#c0392b", borderColor: "#e8b4b0" }}
                  onClick={() => onDelete(editBlock.id)}
                >
                  <Icons.Trash />{tb.deleteBlock}
                </button>
              )}
              <div style={{ display: "flex", gap: 7 }}>
                <button className="app-btn" onClick={onClose}>{tb.cancel}</button>
                <button
                  className="app-btn app-btn-primary"
                  onClick={handleSave}
                  disabled={!label.trim()}
                >
                  {tb.save}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
