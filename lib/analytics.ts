import { SupabaseClient } from "@supabase/supabase-js";

export interface RecentLogEntry {
  id: string;
  text: string;
  type: "shipped" | "decision" | "insight" | "idea";
  createdAt: string;
  projectName: string;
  projectColor: string;
  projectId: string;
}

export async function loadRecentLog(
  supabase: SupabaseClient,
  limit = 4
): Promise<RecentLogEntry[]> {
  const { data } = await supabase
    .from("log_entries")
    .select("id, text, type, created_at, project_id, project:projects(name, color)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return (data as unknown as Array<{
    id: string;
    text: string;
    type: string;
    created_at: string;
    project_id: string;
    project: { name: string; color: string } | null;
  }>).map((e) => ({
    id: e.id,
    text: e.text,
    type: e.type as RecentLogEntry["type"],
    createdAt: e.created_at,
    projectId: e.project_id,
    projectName: e.project?.name ?? "",
    projectColor: e.project?.color ?? "#A09D97",
  }));
}

export interface ProjectFocusRow {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalMin: number;
}

export interface DayFocusRow {
  date: string; // YYYY-MM-DD
  totalMin: number;
}

export async function loadFocusByProject(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<ProjectFocusRow[]> {
  const { data } = await supabase
    .from("pomodoro_sessions")
    .select("project_id, duration_min, projects(id, name, color)")
    .eq("kind", "focus")
    .eq("completed", true)
    .gte("ended_at", start.toISOString())
    .lte("ended_at", end.toISOString());

  if (!data) return [];

  const map = new Map<string, { name: string; color: string; totalMin: number }>();
  for (const row of data as unknown as Array<{ project_id: string | null; duration_min: number; projects: { id: string; name: string; color: string } | null }>) {
    if (!row.project_id || !row.projects) continue;
    const existing = map.get(row.project_id);
    if (existing) {
      existing.totalMin += row.duration_min ?? 0;
    } else {
      map.set(row.project_id, {
        name: row.projects.name,
        color: row.projects.color,
        totalMin: row.duration_min ?? 0,
      });
    }
  }

  return Array.from(map.entries()).map(([id, v]) => ({
    projectId: id,
    projectName: v.name,
    projectColor: v.color,
    totalMin: v.totalMin,
  })).sort((a, b) => b.totalMin - a.totalMin);
}

export async function loadFocusByDay(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<DayFocusRow[]> {
  const { data } = await supabase
    .from("pomodoro_sessions")
    .select("ended_at, duration_min")
    .eq("kind", "focus")
    .eq("completed", true)
    .gte("ended_at", start.toISOString())
    .lte("ended_at", end.toISOString());

  if (!data) return [];

  const map = new Map<string, number>();
  for (const row of data as Array<{ ended_at: string; duration_min: number }>) {
    const day = row.ended_at.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + (row.duration_min ?? 0));
  }

  return Array.from(map.entries())
    .map(([date, totalMin]) => ({ date, totalMin }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function loadTodayFocusMin(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<number> {
  const { data } = await supabase
    .from("pomodoro_sessions")
    .select("duration_min")
    .eq("kind", "focus")
    .eq("completed", true)
    .gte("ended_at", start.toISOString())
    .lte("ended_at", end.toISOString());
  return (data ?? []).reduce((sum: number, r: { duration_min: number }) => sum + (r.duration_min ?? 0), 0);
}
