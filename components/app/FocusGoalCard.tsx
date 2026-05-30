"use client";

import { useState } from "react";
import { AppSelect } from "@/components/ui/AppSelect";
import { useAppLang } from "./AppLanguageContext";

const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => ({ value: String(i), label: `${i}h` }));
const MIN_OPTIONS = [0, 15, 30, 45].map((m) => ({ value: String(m), label: `${m}m` }));

interface FocusGoalCardProps {
  todayMin: number;
  goalMin: number;
  onSaveGoal: (newGoalMin: number) => void;
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

const R = 72;
const ARC_LEN = Math.PI * R; // ≈ 226.2
const TRACK_PATH = `M 8 90 A ${R} ${R} 0 0 1 152 90`;

export function FocusGoalCard({ todayMin, goalMin, onSaveGoal }: FocusGoalCardProps) {
  const { t } = useAppLang();
  const h = t.home;

  const [editing, setEditing] = useState(false);
  const [draftH, setDraftH] = useState(0);
  const [draftM, setDraftM] = useState(0);

  const progress = Math.min(1, goalMin > 0 ? todayMin / goalMin : 0);
  const fillLen = ARC_LEN * progress;

  const handleEdit = () => {
    setDraftH(Math.floor(goalMin / 60));
    setDraftM(Math.round((goalMin % 60) / 15) * 15 % 60);
    setEditing(true);
  };

  const handleSave = () => {
    const total = draftH * 60 + draftM;
    if (total > 0) onSaveGoal(total);
    setEditing(false);
  };

  return (
    <div className="fg-card">
      <div className="fg-info">
        <div className="fg-info-top">
          <p className="fg-title">{h.focusTodayTitle}</p>
          <p className="fg-subtitle">{h.keepFocused}</p>
        </div>
        <div className="fg-stats">
          <span className="fg-time-big">{fmtMin(todayMin)}</span>
        </div>
        <div className="fg-goal-action">
          {editing ? (
            <div className="fg-goal-edit">
              <AppSelect
                value={String(draftH)}
                onChange={(v) => setDraftH(parseInt(v, 10))}
                options={HOUR_OPTIONS}
                hideDot
              />
              <AppSelect
                value={String(draftM)}
                onChange={(v) => setDraftM(parseInt(v, 10))}
                options={MIN_OPTIONS}
                hideDot
              />
              <button className="fg-goal-save" onClick={handleSave}>{h.saveGoal}</button>
            </div>
          ) : (
            <button className="fg-change-goal-btn" onClick={handleEdit}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-3 .5.5-3L8.5 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {h.changeGoal}
            </button>
          )}
        </div>
      </div>

      <div className="fg-gauge-wrap">
        <svg viewBox="0 0 160 90">
          <defs>
            <linearGradient id="fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A1714" />
              <stop offset="100%" stopColor="#6B7280" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Fill — always rendered so CSS transition fires on first increment */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="url(#fg-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${fillLen} ${ARC_LEN}`}
            style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.23, 1, 0.32, 1)" }}
          />
        </svg>
        <div className="fg-gauge-center">
          <span className="fg-gauge-goal-label">{h.dailyGoal}</span>
          <span className="fg-gauge-goal-val">{fmtMin(goalMin)}</span>
        </div>
      </div>
    </div>
  );
}
