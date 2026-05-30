"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "boardos:pomodoro:v1";

export type PomodoroKind = "focus" | "break";

export interface PomodoroState {
  running: boolean;
  paused: boolean;
  kind: PomodoroKind;
  durationMin: number;
  startedAt: number;
  pausedAt: number | null;
  pausedMs: number;
  blockId: string | null;
  projectId: string | null;
  blockLabel: string | null;
}

function load(): PomodoroState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PomodoroState) : null;
  } catch { return null; }
}

function save(s: PomodoroState | null) {
  if (typeof window === "undefined") return;
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function calcRemaining(s: PomodoroState): number {
  const pausedMs = s.paused && s.pausedAt != null
    ? s.pausedMs + (Date.now() - s.pausedAt)
    : s.pausedMs;
  const elapsed = (Date.now() - s.startedAt - pausedMs) / 1000;
  return Math.max(0, s.durationMin * 60 - elapsed);
}

export interface StartOpts {
  kind?: PomodoroKind;
  durationMin?: number;
  blockId?: string | null;
  projectId?: string | null;
  blockLabel?: string | null;
}

export interface UsePomodoro {
  pomState: PomodoroState | null;
  remaining: number;
  start: (opts?: StartOpts) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipBreak: () => void;
}

export function usePomodoro(
  onComplete?: (kind: PomodoroKind, blockId: string | null, projectId: string | null) => void
): UsePomodoro {
  const [pomState, setPomState] = useState<PomodoroState | null>(() => {
    const s = load();
    if (!s) return null;
    if (s.running && !s.paused && calcRemaining(s) <= 0) return null;
    return s;
  });

  const [remaining, setRemaining] = useState<number>(() => {
    const s = load();
    if (!s) return 25 * 60;
    return calcRemaining(s);
  });

  const stateRef = useRef(pomState);
  stateRef.current = pomState;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => {
    const s = stateRef.current;
    if (s && s.running && !s.paused) {
      timerRef.current = setInterval(() => {
        const cur = stateRef.current;
        if (!cur || !cur.running || cur.paused) return;
        const rem = calcRemaining(cur);
        setRemaining(rem);
        if (rem <= 0) {
          clearTimer();
          const { kind, blockId, projectId } = cur;
          setPomState(null);
          save(null);
          onCompleteRef.current?.(kind, blockId, projectId);
        }
      }, 500);
    }
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomState?.running, pomState?.paused]);

  const start = useCallback((opts?: StartOpts) => {
    const next: PomodoroState = {
      running: true,
      paused: false,
      kind: opts?.kind ?? "focus",
      durationMin: opts?.durationMin ?? 25,
      startedAt: Date.now(),
      pausedAt: null,
      pausedMs: 0,
      blockId: opts?.blockId ?? null,
      projectId: opts?.projectId ?? null,
      blockLabel: opts?.blockLabel ?? null,
    };
    save(next);
    setPomState(next);
    setRemaining(next.durationMin * 60);
  }, []);

  const pause = useCallback(() => {
    setPomState((prev) => {
      if (!prev || !prev.running || prev.paused) return prev;
      const next = { ...prev, paused: true, pausedAt: Date.now() };
      save(next);
      return next;
    });
  }, []);

  const resume = useCallback(() => {
    setPomState((prev) => {
      if (!prev || !prev.paused || prev.pausedAt == null) return prev;
      const addedMs = Date.now() - prev.pausedAt;
      const next = { ...prev, paused: false, pausedAt: null, pausedMs: prev.pausedMs + addedMs };
      save(next);
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    save(null);
    setPomState(null);
  }, []); // eslint-disable-line

  const skipBreak = useCallback(() => {
    clearTimer();
    save(null);
    setPomState(null);
  }, []); // eslint-disable-line

  return { pomState, remaining, start, pause, resume, stop, skipBreak };
}
