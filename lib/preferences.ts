"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserPreferences {
  pomodoroFocusMin: number;
  pomodoroBreakMin: number;
  pomodoroLongBreakMin: number;
  pomodoroSessionsToLongBreak: number;
  dailyFocusGoalMin: number;
}

export const DEFAULT_PREFS: UserPreferences = {
  pomodoroFocusMin: 25,
  pomodoroBreakMin: 5,
  pomodoroLongBreakMin: 15,
  pomodoroSessionsToLongBreak: 4,
  dailyFocusGoalMin: 240,
};

const CACHE_KEY = "boardos:prefs:v1";

function loadCache(): UserPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCache(p: UserPreferences) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(p)); } catch {}
}

function dbRowToPrefs(row: Record<string, unknown>): UserPreferences {
  return {
    pomodoroFocusMin:           (row.pomodoro_focus_min as number)            ?? DEFAULT_PREFS.pomodoroFocusMin,
    pomodoroBreakMin:           (row.pomodoro_break_min as number)            ?? DEFAULT_PREFS.pomodoroBreakMin,
    pomodoroLongBreakMin:       (row.pomodoro_long_break as number)           ?? DEFAULT_PREFS.pomodoroLongBreakMin,
    pomodoroSessionsToLongBreak:(row.pomodoro_sessions_to_long_break as number) ?? DEFAULT_PREFS.pomodoroSessionsToLongBreak,
    dailyFocusGoalMin:          (row.daily_focus_goal_min as number)          ?? DEFAULT_PREFS.dailyFocusGoalMin,
  };
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<UserPreferences>(() => loadCache() ?? DEFAULT_PREFS);
  const loadedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        const p = dbRowToPrefs(data as Record<string, unknown>);
        setPrefsState(p);
        saveCache(p);
      }
    })();
  }, [supabase]);

  const setPrefs = useCallback(async (next: UserPreferences) => {
    setPrefsState(next);
    saveCache(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      pomodoro_focus_min: next.pomodoroFocusMin,
      pomodoro_break_min: next.pomodoroBreakMin,
      pomodoro_long_break: next.pomodoroLongBreakMin,
      pomodoro_sessions_to_long_break: next.pomodoroSessionsToLongBreak,
      daily_focus_goal_min: next.dailyFocusGoalMin,
    }, { onConflict: "user_id" });
  }, [supabase]);

  return { prefs, setPrefs };
}
