"use client";

import { Icons } from "@/components/ui/icons";
import type { UsePomodoro } from "@/lib/pomodoro";
import { useAppLang } from "./AppLanguageContext";

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface PomodoroBarProps {
  pomo: UsePomodoro;
  focusMin: number;
}

export function PomodoroBar({ pomo, focusMin }: PomodoroBarProps) {
  const { t } = useAppLang();
  const p = t.pomodoro;
  const { pomState, remaining, start, pause, resume, stop, skipBreak } = pomo;

  const totalSecs = pomState ? pomState.durationMin * 60 : focusMin * 60;
  const progress = pomState ? Math.max(0, 1 - remaining / totalSecs) : 0;

  if (!pomState) {
    return (
      <div className="pomodoro-bar">
        <div className="pomo-idle">
          <Icons.Timer style={{ color: "var(--fg-3)", flexShrink: 0 }} />
          <span className="pomo-idle-label">{focusMin} {p.min} · {p.startFocus}</span>
          <button
            className="app-btn app-btn-primary"
            style={{ fontSize: "12px", padding: "6px 14px" }}
            onClick={() => start({ kind: "focus", durationMin: focusMin })}
          >
            <Icons.Play />{p.startFocus}
          </button>
        </div>
      </div>
    );
  }

  const isBreak = pomState.kind === "break";
  const kindLabel = isBreak ? p.break : (pomState.paused ? p.paused : p.focus);

  return (
    <div className="pomodoro-bar">
      <div className="pomo-timer">
        <span className="pomo-countdown">{fmt(remaining)}</span>

        <div className="pomo-context">
          <span className="pomo-kind" style={{ color: isBreak ? "#0D9488" : "var(--orange)" }}>
            {kindLabel}
          </span>
          {pomState.blockLabel && (
            <span className="pomo-label">{pomState.blockLabel}</span>
          )}
        </div>

        <div className="pomo-progress">
          <div className="pomo-progress-fill" style={{ width: `${progress * 100}%`, background: isBreak ? "#0D9488" : "var(--orange)" }} />
        </div>
      </div>

      <div className="pomo-actions">
        {isBreak ? (
          <button className="app-btn" style={{ fontSize: "12px" }} onClick={skipBreak}>
            {p.left === "left" ? "Skip break" : "Saltar descanso"}
          </button>
        ) : (
          <>
            {pomState.paused ? (
              <button className="app-btn" style={{ fontSize: "12px" }} onClick={resume}>
                <Icons.Play />{p.left === "left" ? "Resume" : "Reanudar"}
              </button>
            ) : (
              <button className="app-btn" style={{ fontSize: "12px" }} onClick={pause}>
                <Icons.Pause />{p.left === "left" ? "Pause" : "Pausar"}
              </button>
            )}
          </>
        )}
        <button className="app-btn" style={{ fontSize: "12px" }} onClick={stop} title="Stop">
          <Icons.Stop />
        </button>
      </div>
    </div>
  );
}
