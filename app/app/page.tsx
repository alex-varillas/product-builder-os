"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Sidebar } from "@/components/app/Sidebar";
import { IdeaCanvas } from "@/components/app/IdeaCanvas";
import { MVPScope } from "@/components/app/MVPScope";
import { BuildLog } from "@/components/app/BuildLog";
import { ProjectsView } from "@/components/app/ProjectsView";
import { InboxView } from "@/components/app/InboxView";
import { SearchOverlay } from "@/components/app/SearchOverlay";
import { NewEntryModal } from "@/components/app/NewEntryModal";
import { CreateProjectModal } from "@/components/app/CreateProjectModal";
import { ExportModal } from "@/components/app/ExportModal";
import { EditProjectModal } from "@/components/app/EditProjectModal";
import { TodayView } from "@/components/app/TodayView";
import { HomeView } from "@/components/app/HomeView";
import { PomodoroPage } from "@/components/app/PomodoroPage";
import { PomodoroBar } from "@/components/app/PomodoroBar";
import { AppSkeleton } from "@/components/app/AppSkeleton";
import { Icons } from "@/components/ui/icons";
import { LogEntry, LogType, MVPItem, Project } from "@/lib/app-data";
import { TimeBlock, DbTimeBlock, dbToTimeBlock, dayRange, weekRange, monthRange } from "@/lib/time-blocks";
import { usePomodoro, PomodoroKind, UsePomodoro } from "@/lib/pomodoro";
import { usePreferences } from "@/lib/preferences";
import { useAppLang } from "@/components/app/AppLanguageContext";
import { createClient } from "@/lib/supabase/client";
import { fadeUp, springSoft } from "@/lib/motion";
import { ToastProvider, useToast } from "@/components/app/Toast";
import { OnboardingTour, shouldShowOnboarding } from "@/components/app/OnboardingTour";
import { loadFocusByProject, loadFocusByDay, loadTodayFocusMin, loadRecentLog, ProjectFocusRow, DayFocusRow, RecentLogEntry } from "@/lib/analytics";

export type AppView = "home" | "today" | "projects" | "inbox" | "project" | "pomodoro";
export type TabId = "canvas" | "scope" | "log";

// ─── BoardOS seed ─────────────────────────────────────────────────────────────

async function seedBoardOS(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<DbProject | null> {
  const { data: proj } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: "BoardOS",
      description: "Open-source workspace for builders and founders.",
      color: "#F0620A",
      version: "v0.1",
      stage: "draft",
    })
    .select("id, name, description, color, version, stage")
    .single();
  if (!proj) return null;

  const pid = proj.id;

  await supabase.from("canvas_cards").insert([
    { user_id: userId, project_id: pid, slot: "problem", title: "problem", badge: "core",
      content: "Founders spend hours each week maintaining scattered notes, docs, and Notion pages that don't reflect the current state of their product thinking." },
    { user_id: userId, project_id: pid, slot: "user", title: "user", badge: "hypothesis",
      content: "Solo founders and indie hackers, 0-5 team size, technical or design background. Building SaaS or tools they would use themselves every day." },
    { user_id: userId, project_id: pid, slot: "solution", title: "solution", badge: "core",
      content: "A structured, opinionated workspace that captures product decisions, scopes MVPs, and tracks shipped work — all in one focused, distraction-free view." },
    { user_id: userId, project_id: pid, slot: "context", title: "context", badge: "signal",
      content: "Market moment: AI tools are proliferating but product clarity is getting worse. Builders need structure and intentionality, not more features." },
  ]);

  await supabase.from("mvp_items").insert([
    { user_id: userId, project_id: pid, name: "Idea Canvas view",           column_id: "core-mvp",    position: 0 },
    { user_id: userId, project_id: pid, name: "Project sidebar navigation", column_id: "core-mvp",    position: 1 },
    { user_id: userId, project_id: pid, name: "Inline card editing",        column_id: "core-mvp",    position: 2 },
    { user_id: userId, project_id: pid, name: "Build Log entries",          column_id: "core-mvp",    position: 3 },
    { user_id: userId, project_id: pid, name: "Ideas inbox",                column_id: "later",       position: 4 },
    { user_id: userId, project_id: pid, name: "Export to Markdown",         column_id: "later",       position: 5 },
    { user_id: userId, project_id: pid, name: "AI Reframe",                 column_id: "not-now",     position: 6 },
    { user_id: userId, project_id: pid, name: "Team collaboration",         column_id: "not-now",     position: 7 },
    { user_id: userId, project_id: pid, name: "Public project pages",       column_id: "to-validate", position: 8 },
  ]);

  await supabase.from("log_entries").insert([
    { user_id: userId, project_id: pid, type: "shipped",  text: "Shipped initial sidebar and project navigation. Feeling good about the structure — clean, no clutter." },
    { user_id: userId, project_id: pid, type: "decision", text: "Decided to drop timeline view from v0.2. Too much scope, not enough clarity. Keeping it to Canvas and Scope for now." },
    { user_id: userId, project_id: pid, type: "insight",  text: "First user test with a builder. Biggest insight: people want to see the why alongside the what. Need to surface hypothesis tags more prominently." },
    { user_id: userId, project_id: pid, type: "shipped",  text: "Started building the Idea Canvas. 2×2 grid feels right — Problem, User, Solution, Context. No more, no less." },
  ]);

  return proj;
}

// ─── DB row shapes ─────────────────────────────────────────────────────────────

interface DbProject {
  id: string;
  name: string;
  description: string;
  color: string;
  version: string;
  stage: string;
}

interface DbMvpItem {
  id: string;
  name: string;
  column_id: string;
  priority: string;
  why: string;
  done?: boolean;
}

interface DbLogEntry {
  id: string;
  text: string;
  type: string;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function dbToProject(r: DbProject): Project {
  return {
    id: r.id,
    name: r.name,
    desc: r.description,
    color: r.color,
    version: r.version,
    stage: r.stage as Project["stage"],
  };
}

function dbToMvpItem(r: DbMvpItem): MVPItem {
  return {
    id: r.id,
    name: r.name,
    column: r.column_id as MVPItem["column"],
    priority: (r.priority ?? "P3") as MVPItem["priority"],
    why: r.why ?? "",
    done: r.done ?? false,
  };
}

function dbToLogEntry(r: DbLogEntry): LogEntry {
  const d = new Date(r.created_at);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    id: r.id,
    date,
    rawDate: r.created_at.slice(0, 10),
    text: r.text,
    type: r.type as LogEntry["type"],
  };
}

// ─── Pomodoro bell ────────────────────────────────────────────────────────────

function playBell(freq: number) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
    osc.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppPage() {
  return (
    <ToastProvider>
      <AppPageInner />
    </ToastProvider>
  );
}

function AppPageInner() {
  const { t } = useAppLang();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [projects,         setProjects]         = useState<Project[]>([]);
  const [activeView,       setActiveView]       = useState<AppView>("home");
  const [activeProj,       setActiveProj]       = useState(0);
  const [activeTab,        setActiveTab]        = useState<TabId>("canvas");
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [entryOpen,        setEntryOpen]        = useState(false);
  const [newProjOpen,      setNewProjOpen]      = useState(false);
  const [exportOpen,       setExportOpen]       = useState(false);
  const [editingProjIndex, setEditingProjIndex] = useState<number | null>(null);
  const [contentKey,       setContentKey]       = useState(0);
  const [logEntries,       setLogEntries]       = useState<LogEntry[]>([]);
  const [mvpItems,         setMvpItems]         = useState<MVPItem[]>([]);
  const [canvasAddTrigger, setCanvasAddTrigger] = useState(0);
  const [canvasCount,      setCanvasCount]      = useState(4);
  const [scopeAddTrigger,  setScopeAddTrigger]  = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [showTour,         setShowTour]         = useState(false);
  const [userName,         setUserName]         = useState("builder");

  // Today / week state
  const [timeBlocks,       setTimeBlocks]       = useState<TimeBlock[]>([]);
  const [todayFocusMins,   setTodayFocusMins]   = useState(0);
  const [newBlockTrigger,  setNewBlockTrigger]  = useState(0);
  const [selectedDate,     setSelectedDate]     = useState<Date>(new Date());
  const [blockCountsByDay, setBlockCountsByDay] = useState<Map<string, number>>(new Map());

  // Home stats
  const [weekFocus,        setWeekFocus]        = useState<ProjectFocusRow[]>([]);
  const [focusByDay,       setFocusByDay]       = useState<DayFocusRow[]>([]);
  const [recentLog,        setRecentLog]        = useState<RecentLogEntry[]>([]);

  // Sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("boardos:sidebar-collapsed") === "true";
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("boardos:sidebar-collapsed", String(next));
      return next;
    });
  };

  // Pomodoro theme (lifted so sidebar inherits dark mode)
  const POMO_THEME_KEY = "boardos:pomo-theme";
  const [pomoTheme, setPomoTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(POMO_THEME_KEY) as "light" | "dark") ?? "light";
  });
  const togglePomoTheme = () => {
    const next = pomoTheme === "light" ? "dark" : "light";
    setPomoTheme(next);
    localStorage.setItem(POMO_THEME_KEY, next);
  };

  const { prefs, setPrefs } = usePreferences();

  const proj = projects[activeProj];

  // ─── Pomodoro ─────────────────────────────────────────────────────────────

  const pomStartRef = useRef<UsePomodoro["start"] | null>(null);
  const lastFocusLoadDate = useRef("");

  const handlePomodoroComplete = useCallback(async (kind: PomodoroKind, blockId: string | null, projectId: string | null) => {
    if (kind === "focus") {
      playBell(528);
      toast(t.pomodoro.focusDone);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const durationMin = prefs.pomodoroFocusMin;
        await supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          time_block_id: blockId,
          project_id: projectId,
          duration_min: durationMin,
          kind: "focus",
          completed: true,
          ended_at: new Date().toISOString(),
        });
        setTodayFocusMins((m) => m + durationMin);
      }
      pomStartRef.current?.({ kind: "break", durationMin: prefs.pomodoroBreakMin, blockId, projectId });
    } else {
      playBell(440);
      toast(t.pomodoro.breakDone);
    }
  }, [supabase, toast, t.pomodoro, prefs]);

  const pomo = usePomodoro(handlePomodoroComplete);

  useEffect(() => {
    pomStartRef.current = pomo.start;
  }, [pomo.start]);

  // Apply dark mode to entire shell (including sidebar) via html attribute
  useEffect(() => {
    const html = document.documentElement;
    if (activeView === "pomodoro" && pomoTheme === "dark") {
      html.setAttribute("data-pomo-theme", "dark");
    } else {
      html.removeAttribute("data-pomo-theme");
    }
  }, [activeView, pomoTheme]);

  const displayTodayMin = todayFocusMins;

  // ─── Load projects + user ─────────────────────────────────────────────────

  const loadProjects = useCallback(async () => {
    const [{ data }, { data: { user } }] = await Promise.all([
      supabase.from("projects").select("id, name, description, color, version, stage").order("created_at"),
      supabase.auth.getUser(),
    ]);

    if (user) {
      const name = user.user_metadata?.full_name
        || user.email?.split("@")[0]
        || "builder";
      setUserName(name.split(" ")[0]);
    }

    let isNewUser = false;
    if (data && data.length > 0) {
      setProjects(data.map(dbToProject));
    } else if (user) {
      const seeded = await seedBoardOS(supabase, user.id);
      if (seeded) {
        setProjects([dbToProject(seeded)]);
        isNewUser = true;
      }
    }
    setLoading(false);
    // New users always see the tour regardless of localStorage state
    setShowTour(isNewUser || shouldShowOnboarding());
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // ─── Load blocks for selected date ───────────────────────────────────────

  const loadBlocksForDate = useCallback(async (date: Date) => {
    const { start, end } = dayRange(date);
    const { data } = await supabase
      .from("time_blocks")
      .select("id, user_id, project_id, mvp_item_id, label, start_at, end_at, color, done, created_at")
      .gte("start_at", start.toISOString())
      .lte("start_at", end.toISOString())
      .order("start_at");
    setTimeBlocks(data ? data.map((r: DbTimeBlock) => dbToTimeBlock(r)) : []);
  }, [supabase]);

  const loadBlockCountsForWeek = useCallback(async (date: Date) => {
    const { start, end } = weekRange(date);
    const { data } = await supabase
      .from("time_blocks")
      .select("start_at")
      .gte("start_at", start.toISOString())
      .lte("start_at", end.toISOString());

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as Array<{ start_at: string }>) {
      const key = row.start_at.slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    setBlockCountsByDay(counts);
  }, [supabase]);

  const loadTodayFocusMins = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { start, end } = dayRange(new Date());
    const total = await loadTodayFocusMin(supabase, start, end);
    setTodayFocusMins(total);
    lastFocusLoadDate.current = today;
  }, [supabase]);

  // Reset focus counter if the calendar day changes while the app is open
  useEffect(() => {
    const checkDayChange = () => {
      const today = new Date().toISOString().slice(0, 10);
      if (lastFocusLoadDate.current && lastFocusLoadDate.current !== today) {
        loadTodayFocusMins();
      }
    };
    document.addEventListener("visibilitychange", checkDayChange);
    window.addEventListener("focus", checkDayChange);
    return () => {
      document.removeEventListener("visibilitychange", checkDayChange);
      window.removeEventListener("focus", checkDayChange);
    };
  }, [loadTodayFocusMins]);

  useEffect(() => {
    if (activeView === "today") {
      loadBlocksForDate(selectedDate);
      loadBlockCountsForWeek(selectedDate);
      loadTodayFocusMins();
    }
  }, [activeView, selectedDate, loadBlocksForDate, loadBlockCountsForWeek, loadTodayFocusMins]);

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    loadBlocksForDate(d);
    loadBlockCountsForWeek(d);
  }, [loadBlocksForDate, loadBlockCountsForWeek]);

  // ─── Load home stats ──────────────────────────────────────────────────────

  const loadHomeStats = useCallback(async () => {
    const now = new Date();
    const week = weekRange(now);
    const month = monthRange(now);
    const [wf, fd, rl] = await Promise.all([
      loadFocusByProject(supabase, week.start, week.end),
      loadFocusByDay(supabase, month.start, month.end),
      loadRecentLog(supabase),
    ]);
    setWeekFocus(wf);
    setFocusByDay(fd);
    setRecentLog(rl);
  }, [supabase]);

  useEffect(() => {
    if (activeView === "home") {
      loadHomeStats();
      loadTodayFocusMins();
    }
  }, [activeView, loadHomeStats, loadTodayFocusMins]);

  // ─── Load items for active project ────────────────────────────────────────

  const loadProjectData = useCallback(async (projId: string) => {
    const [{ data: items }, { data: entries }] = await Promise.all([
      supabase
        .from("mvp_items")
        .select("id, name, column_id, priority, why, done")
        .eq("project_id", projId)
        .order("position"),
      supabase
        .from("log_entries")
        .select("id, text, type, created_at")
        .eq("project_id", projId)
        .order("created_at", { ascending: false }),
    ]);
    setMvpItems(items ? items.map(dbToMvpItem) : []);
    setLogEntries(entries ? entries.map(dbToLogEntry) : []);
  }, [supabase]);

  const activeProjId = proj?.id;
  useEffect(() => {
    if (activeProjId && activeView === "project") {
      loadProjectData(activeProjId);
    }
  }, [activeProjId, activeView, loadProjectData]);

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // ─── Project CRUD ─────────────────────────────────────────────────────────

  const handleCreateProject = async (name: string, desc: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, description: desc, color, version: "v0.1", stage: "draft" })
      .select("id, name, description, color, version, stage")
      .single();
    if (!error && data) {
      setProjects((prev) => [...prev, dbToProject(data)]);
      toast("Project created");
    }
    setNewProjOpen(false);
  };

  const handleSaveProject = async (i: number, name: string, desc: string, color: string, version: string, stage: Project["stage"]) => {
    const proj = projects[i];
    if (!proj) return;
    await supabase.from("projects").update({ name, description: desc, color, version, stage }).eq("id", proj.id);
    setProjects((prev) => prev.map((p, idx) => idx === i ? { ...p, name, desc, color, version, stage } : p));
    setEditingProjIndex(null);
    toast("Project saved");
  };

  const handleDeleteProject = async (i: number) => {
    const proj = projects[i];
    if (!proj) return;
    await supabase.from("projects").delete().eq("id", proj.id);
    setProjects((prev) => prev.filter((_, idx) => idx !== i));
    if (activeView === "project" && activeProj === i) {
      setActiveView("projects");
      setContentKey((k) => k + 1);
    } else if (activeProj > i) {
      setActiveProj((p) => p - 1);
    }
  };

  // ─── Log entries ──────────────────────────────────────────────────────────

  const addLogEntry = async (text: string, type: LogType) => {
    if (!proj) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("log_entries")
      .insert({ user_id: user.id, project_id: proj.id, text, type })
      .select("id, text, type, created_at")
      .single();
    if (!error && data) {
      setLogEntries((prev) => [dbToLogEntry(data), ...prev]);
      toast("Log entry added");
    }
  };

  // ─── MVP items ────────────────────────────────────────────────────────────

  const handleMvpItemsChange = useCallback(async (newItems: MVPItem[]) => {
    if (!proj) { setMvpItems(newItems); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMvpItems(newItems); return; }

    const added   = newItems.filter((n) => !mvpItems.find((o) => o.id === n.id));
    const removed = mvpItems.filter((o) => !newItems.find((n) => n.id === o.id));
    const updated = newItems.filter((n) => {
      const old = mvpItems.find((o) => o.id === n.id);
      return old && (old.column !== n.column || old.done !== n.done || old.name !== n.name || old.why !== n.why);
    });

    const ops: PromiseLike<unknown>[] = [];

    added.forEach((item, idx) => {
      ops.push(
        supabase.from("mvp_items").insert({
          user_id: user.id,
          project_id: proj.id,
          name: item.name,
          column_id: item.column,
          priority: item.priority,
          why: item.why,
          done: item.done ?? false,
          position: mvpItems.length + idx,
        })
      );
    });

    removed.forEach((item) => {
      ops.push(supabase.from("mvp_items").delete().eq("id", item.id));
    });

    updated.forEach((item) => {
      ops.push(
        supabase.from("mvp_items").update({
          name: item.name,
          column_id: item.column,
          done: item.done,
          why: item.why,
        }).eq("id", item.id)
      );
    });

    await Promise.all(ops);

    if (added.length > 0) {
      const { data: fresh } = await supabase
        .from("mvp_items")
        .select("id, name, column_id, priority, why, done")
        .eq("project_id", proj.id)
        .order("position");
      setMvpItems(fresh ? fresh.map(dbToMvpItem) : newItems);
    } else {
      setMvpItems(newItems);
    }
  }, [mvpItems, proj, supabase]);

  // ─── Time blocks ──────────────────────────────────────────────────────────

  const handleCreateBlock = async (data: { label: string; projectId: string | null; startAt: Date; endAt: Date; color: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: row, error } = await supabase
      .from("time_blocks")
      .insert({
        user_id: user.id,
        project_id: data.projectId,
        label: data.label,
        start_at: data.startAt.toISOString(),
        end_at: data.endAt.toISOString(),
        color: data.color,
        done: false,
      })
      .select("id, user_id, project_id, mvp_item_id, label, start_at, end_at, color, done, created_at")
      .single();
    if (!error && row) {
      setTimeBlocks((prev) => [...prev, dbToTimeBlock(row as DbTimeBlock)].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()));
      toast("Block created");
      // Update dot count
      const key = data.startAt.toISOString().slice(0, 10);
      setBlockCountsByDay((prev) => new Map(prev).set(key, (prev.get(key) ?? 0) + 1));
    }
  };

  const handleUpdateBlock = useCallback(async (id: string, changes: Partial<Pick<TimeBlock, "label" | "projectId" | "startAt" | "endAt" | "color" | "done">>) => {
    const updates: Record<string, unknown> = {};
    if (changes.label !== undefined) updates.label = changes.label;
    if (changes.projectId !== undefined) updates.project_id = changes.projectId;
    if (changes.startAt !== undefined) updates.start_at = changes.startAt.toISOString();
    if (changes.endAt !== undefined) updates.end_at = changes.endAt.toISOString();
    if (changes.color !== undefined) updates.color = changes.color;
    if (changes.done !== undefined) updates.done = changes.done;

    await supabase.from("time_blocks").update(updates).eq("id", id);
    setTimeBlocks((prev) =>
      prev.map((b) => b.id === id ? { ...b, ...changes } : b)
          .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    );
    if (!("done" in changes && Object.keys(changes).length === 1) &&
        !("startAt" in changes && "endAt" in changes && Object.keys(changes).length === 2)) {
      toast("Block updated");
    }
  }, [supabase, toast]);

  const handleDeleteBlock = async (id: string) => {
    const block = timeBlocks.find((b) => b.id === id);
    await supabase.from("time_blocks").delete().eq("id", id);
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
    if (block) {
      const key = block.startAt.toISOString().slice(0, 10);
      setBlockCountsByDay((prev) => {
        const next = new Map(prev);
        const cur = next.get(key) ?? 0;
        if (cur <= 1) next.delete(key); else next.set(key, cur - 1);
        return next;
      });
    }
    toast("Block deleted");
  };

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const handleSearchNavigate = (projIndex: number, tab: TabId) => {
    setActiveProj(projIndex);
    setActiveView("project");
    setActiveTab(tab);
    setContentKey((k) => k + 1);
  };

  const handleOpenProjectById = (projectId: string) => {
    const i = projects.findIndex((p) => p.id === projectId);
    if (i === -1) return;
    setActiveProj(i);
    setActiveView("project");
    setActiveTab("canvas");
    setCanvasCount(4);
    setContentKey((k) => k + 1);
  };

  // ─── Toolbar helpers ──────────────────────────────────────────────────────

  const newEntryLabel = () => {
    if (activeView === "today") return t.today.newBlock;
    switch (activeTab) {
      case "canvas": return t.toolbar.newCard;
      case "scope":  return t.toolbar.addFeature;
      default:       return t.toolbar.newEntry;
    }
  };

  const handleNewEntry = () => {
    if (activeView === "today") {
      setNewBlockTrigger((k) => k + 1);
      return;
    }
    switch (activeTab) {
      case "canvas": setCanvasAddTrigger((k) => k + 1); break;
      case "scope":  setScopeAddTrigger((k) => k + 1);  break;
      default:       setEntryOpen(true);
    }
  };

  const tabs = [
    { id: "canvas" as TabId, label: t.tabs.ideaCanvas, count: canvasCount },
    { id: "scope"  as TabId, label: t.tabs.mvpScope,   count: mvpItems.filter((i) => !i.done).length },
    { id: "log"    as TabId, label: t.tabs.buildLog,   count: logEntries.length },
  ];

  const changeTab  = (tab: TabId) => { setActiveTab(tab); };
  const openProject = (i: number) => {
    setActiveProj(i);
    setActiveView("project");
    setActiveTab("canvas");
    setCanvasCount(4);
    setContentKey((k) => k + 1);
  };
  const selectView = (v: AppView) => {
    setActiveView(v);
    setContentKey((k) => k + 1);
  };

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setEntryOpen(false);
        setNewProjOpen(false);
        setExportOpen(false);
        setEditingProjIndex(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return <AppSkeleton />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Sidebar
        activeView={activeView}
        activeProj={activeProj}
        projects={projects}
        onSelectView={selectView}
        onSelectProj={openProject}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onDeleteProject={handleDeleteProject}
      />

      <MotionConfig reducedMotion="user">
      <div className="app-main">

        {/* Toolbar — Today */}
        {activeView === "today" && (
          <div className="app-toolbar">
            <div className="breadcrumb">
              <span className="bc-cur">{t.sidebar.today}</span>
            </div>
            <div className="toolbar-actions">
              <motion.button className="app-btn app-btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleNewEntry}>
                <Icons.Plus />{t.today.newBlock}
              </motion.button>
            </div>
          </div>
        )}

        {/* Toolbar — Project */}
        {activeView === "project" && proj && (
          <>
            <div className="app-toolbar">
              <div className="breadcrumb">
                <span className="bc-link" onClick={() => selectView("projects")}>
                  {t.breadcrumb.projects}
                </span>
                <span className="bc-sep"><Icons.Chevron /></span>
                <span className="bc-cur">{proj.name}</span>
                {proj.version && (
                  <span className="bc-badge">{proj.version} {proj.stage}</span>
                )}
              </div>
              <div className="toolbar-actions">
                <button className="app-btn" onClick={() => setSearchOpen(true)} title="⌘K">
                  <Icons.Search />{t.toolbar.search}
                </button>
                <button className="app-btn app-btn-disabled" disabled title="Coming soon">
                  <Icons.Sparkles />{t.toolbar.reframe}
                </button>
                <button className="app-btn" onClick={() => setExportOpen(true)}>
                  <Icons.Download />{t.toolbar.export}
                </button>
                <motion.button className="app-btn app-btn-primary" whileTap={{ scale: 0.97 }} onClick={handleNewEntry} data-tour="toolbar">
                  <Icons.Plus />{newEntryLabel()}
                </motion.button>
              </div>
            </div>

            <div className="app-tabs" data-tour="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`app-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => changeTab(tab.id)}
                >
                  {tab.label}
                  <span className="tab-count">{tab.count}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-indicator" className="tab-indicator" transition={springSoft} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Content */}
        <div className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={contentKey}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%", height: (activeView === "today" || activeView === "home" || activeView === "pomodoro") ? "100%" : undefined }}
            >
              {activeView === "home" && (
                <HomeView
                  userName={userName}
                  weekFocus={weekFocus}
                  focusByDay={focusByDay}
                  todayFocusMin={displayTodayMin}
                  dailyGoalMin={prefs.dailyFocusGoalMin}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => { handleSelectDate(d); selectView("today"); }}
                  onOpenProject={handleOpenProjectById}
                  onOpenAllProjects={() => selectView("projects")}
                  onOpenPomodoro={() => selectView("pomodoro")}
                  blockCountsByDay={blockCountsByDay}
                  onSaveGoal={(min) => setPrefs({ ...prefs, dailyFocusGoalMin: min })}
                  recentLog={recentLog}
                />
              )}
              {activeView === "today" && (
                <TodayView
                  timeBlocks={timeBlocks}
                  projects={projects}
                  todayFocusMins={todayFocusMins}
                  activeBlockId={pomo.pomState?.blockId ?? null}
                  newBlockTrigger={newBlockTrigger}
                  selectedDate={selectedDate}
                  blockCountsByDay={blockCountsByDay}
                  onSelectDate={handleSelectDate}
                  onCreateBlock={handleCreateBlock}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onStartFocus={(opts) => pomo.start(opts)}
                />
              )}
              {activeView === "pomodoro" && (
                <PomodoroPage
                  pomo={pomo}
                  prefs={prefs}
                  projects={projects}
                  onSavePrefs={setPrefs}
                  theme={pomoTheme}
                  onToggleTheme={togglePomoTheme}
                />
              )}
              {activeView === "projects" && (
                <ProjectsView
                  projects={projects}
                  onOpenProject={openProject}
                  onNewProject={() => setNewProjOpen(true)}
                  onEditProject={setEditingProjIndex}
                />
              )}
              {activeView === "inbox" && <InboxView />}
              {activeView === "project" && proj && (
                <AnimatePresence mode="wait">
                  {activeTab === "canvas" && (
                    <motion.div key="canvas" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                      <IdeaCanvas projectId={proj.id} addTrigger={canvasAddTrigger} onCountChange={setCanvasCount} />
                    </motion.div>
                  )}
                  {activeTab === "scope" && (
                    <motion.div key="scope" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                      <MVPScope
                        items={mvpItems}
                        onItemsChange={handleMvpItemsChange}
                        addTrigger={scopeAddTrigger}
                      />
                    </motion.div>
                  )}
                  {activeTab === "log" && (
                    <motion.div key="log" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                      <BuildLog entries={logEntries} onAddEntry={addLogEntry} />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pomodoro bar — hidden on Pomodoro page */}
        {activeView !== "pomodoro" && <PomodoroBar pomo={pomo} focusMin={prefs.pomodoroFocusMin} />}
      </div>
      </MotionConfig>

      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            onClose={() => setSearchOpen(false)}
            onNavigate={handleSearchNavigate}
            projects={projects}
            mvpItems={mvpItems}
            logEntries={logEntries}
            activeProj={activeProj}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {entryOpen && <NewEntryModal onClose={() => setEntryOpen(false)} onAdd={addLogEntry} />}
      </AnimatePresence>
      <AnimatePresence>
        {newProjOpen && <CreateProjectModal onClose={() => setNewProjOpen(false)} onCreate={handleCreateProject} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingProjIndex !== null && projects[editingProjIndex] && (
          <EditProjectModal
            project={projects[editingProjIndex]}
            onClose={() => setEditingProjIndex(null)}
            onSave={(name, desc, color, version, stage) => handleSaveProject(editingProjIndex, name, desc, color, version, stage)}
            onDelete={() => { handleDeleteProject(editingProjIndex); setEditingProjIndex(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {exportOpen && proj && (
          <ExportModal
            project={proj}
            mvpItems={mvpItems}
            logEntries={logEntries}
            onClose={() => setExportOpen(false)}
          />
        )}
      </AnimatePresence>

      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}
    </>
  );
}
