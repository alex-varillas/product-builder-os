"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { UserPreferences } from "@/lib/preferences";
import { useAppLang } from "./AppLanguageContext";
import { modalSpring, fadeIn } from "@/lib/motion";

interface PomodoroSettingsModalProps {
  prefs: UserPreferences;
  onSave: (next: UserPreferences) => void;
  onClose: () => void;
}

function NumInput({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="pref-field">
      <label className="pref-label">{label}</label>
      <div className="pref-input-row">
        <button
          className="pref-stepper"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
        >−</button>
        <span className="pref-value">{value}</span>
        <button
          className="pref-stepper"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
        >+</button>
      </div>
    </div>
  );
}

export function PomodoroSettingsModal({ prefs, onSave, onClose }: PomodoroSettingsModalProps) {
  const { t } = useAppLang();
  const p = t.prefs;

  const [local, setLocal] = useState<UserPreferences>({ ...prefs });

  const set = <K extends keyof UserPreferences>(k: K, v: UserPreferences[K]) =>
    setLocal((prev) => ({ ...prev, [k]: v }));

  return (
    <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={onClose}>
      <motion.div
        className="modal"
        variants={modalSpring}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 className="modal-title">{p.title}</h3>
        </div>

        <div className="pref-fields">
          <NumInput label={`${p.focusDuration} (${p.min})`} value={local.pomodoroFocusMin}
            min={5} max={90} step={5} onChange={(v) => set("pomodoroFocusMin", v)} />
          <NumInput label={`${p.breakDuration} (${p.min})`} value={local.pomodoroBreakMin}
            min={1} max={30} step={1} onChange={(v) => set("pomodoroBreakMin", v)} />
          <NumInput label={`${p.longBreak} (${p.min})`} value={local.pomodoroLongBreakMin}
            min={5} max={60} step={5} onChange={(v) => set("pomodoroLongBreakMin", v)} />
          <NumInput label={p.sessionsBeforeLong} value={local.pomodoroSessionsToLongBreak}
            min={2} max={8} step={1} onChange={(v) => set("pomodoroSessionsToLongBreak", v)} />
          <NumInput label={`${p.dailyGoal} (${p.min})`} value={local.dailyFocusGoalMin}
            min={30} max={720} step={30} onChange={(v) => set("dailyFocusGoalMin", v)} />
        </div>

        <div className="modal-foot">
          <button className="app-btn" onClick={onClose}>{p.cancel}</button>
          <button className="app-btn app-btn-primary" onClick={() => { onSave(local); onClose(); }}>{p.save}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
