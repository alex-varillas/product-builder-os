"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icons } from "@/components/ui/icons";
import { UsePomodoro, PomodoroKind } from "@/lib/pomodoro";
import { UserPreferences } from "@/lib/preferences";
import { useAppLang } from "./AppLanguageContext";
import { PomodoroSettingsModal } from "./PomodoroSettingsModal";
import { Project } from "@/lib/app-data";

interface PomodoroPageProps {
  pomo: UsePomodoro;
  prefs: UserPreferences;
  projects: Project[];
  onSavePrefs: (next: UserPreferences) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

function fmt(secs: number): string {
  const m = Math.floor(Math.max(0, secs) / 60).toString().padStart(2, "0");
  const s = Math.floor(Math.max(0, secs) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function PomodoroPage({ pomo, prefs, projects, onSavePrefs, theme, onToggleTheme }: PomodoroPageProps) {
  const { t } = useAppLang();
  const pp = t.pomoPage;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedKind, setSelectedKind] = useState<PomodoroKind>("focus");

  const isRunning = !!pomo.pomState?.running && !pomo.pomState?.paused;
  const isPaused  = !!pomo.pomState?.paused;
  const activeKind = pomo.pomState?.kind ?? selectedKind;

  // When idle, show the configured duration for the selected kind — not the stale remaining
  const displaySecs = pomo.pomState
    ? pomo.remaining
    : (selectedKind === "focus"
        ? prefs.pomodoroFocusMin * 60
        : prefs.pomodoroBreakMin * 60);

  const subtitle = () => {
    if (isPaused) return t.pomodoro.paused;
    return activeKind === "focus" ? pp.timeToFocus : pp.breakTime;
  };

  const projColor = pomo.pomState?.projectId
    ? (projects.find((p) => p.id === pomo.pomState?.projectId)?.color ?? "#A09D97")
    : "#A09D97";

  const handleStartPause = () => {
    if (isRunning) { pomo.pause(); return; }
    if (isPaused)  { pomo.resume(); return; }
    pomo.start({
      kind: selectedKind,
      durationMin: selectedKind === "focus" ? prefs.pomodoroFocusMin : prefs.pomodoroBreakMin,
    });
  };

  const handleReset = () => {
    pomo.stop();
    // selectedKind stays — user sees the idle state for the same kind
  };

  return (
    <div className="pomo-page" data-theme={theme}>
      <div className="pomo-page-topbar">
        <span />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="pomo-icon-btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
          </button>
          <button className="pomo-icon-btn" onClick={() => setSettingsOpen(true)} title="Settings">
            <Icons.Cog />
          </button>
        </div>
      </div>

      <div className="pomo-page-body">
        <div className="pomo-page-card">
          {/* Tabs */}
          <div className="pomo-tabs">
            <button
              className={`pomo-tab${activeKind === "focus" ? " active" : ""}`}
              onClick={() => { if (!pomo.pomState?.running) setSelectedKind("focus"); }}
              disabled={!!pomo.pomState?.running}
            >
              {pp.focusTab}
            </button>
            <button
              className={`pomo-tab${activeKind === "break" ? " active" : ""}`}
              onClick={() => { if (!pomo.pomState?.running) setSelectedKind("break"); }}
              disabled={!!pomo.pomState?.running}
            >
              {pp.restTab}
            </button>
          </div>

          {/* Countdown */}
          <AnimatePresence mode="wait">
            <motion.div
              key={fmt(displaySecs)}
              className="pomo-page-countdown"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {fmt(displaySecs)}
            </motion.div>
          </AnimatePresence>

          <p className="pomo-page-subtitle">{subtitle()}</p>

          {/* Actions */}
          <div className="pomo-page-actions">
            <motion.button
              className="app-btn app-btn-primary pomo-start-btn"
              whileTap={{ scale: 0.97 }}
              onClick={handleStartPause}
            >
              {isRunning ? pp.pause : isPaused ? pp.start : pp.start}
            </motion.button>
            {pomo.pomState && (
              <button className="app-btn pomo-reset-btn" onClick={handleReset}>
                {pp.reset}
              </button>
            )}
          </div>

          {/* Context */}
          {pomo.pomState?.blockLabel && (
            <div className="pomo-page-context">
              <span className="pomo-context-dot" style={{ background: projColor }} />
              <span>{pomo.pomState.blockLabel}</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {settingsOpen && (
          <PomodoroSettingsModal
            prefs={prefs}
            onSave={onSavePrefs}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
