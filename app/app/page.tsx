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
import { Icons } from "@/components/ui/icons";
import { LogEntry, LogType, MVPItem, Project } from "@/lib/app-data";
import { useAppLang } from "@/components/app/AppLanguageContext";
import { createClient } from "@/lib/supabase/client";
import { fadeUp, springSoft } from "@/lib/motion";
import { ToastProvider, useToast } from "@/components/app/Toast";
import { OnboardingTour, shouldShowOnboarding } from "@/components/app/OnboardingTour";

type AppView = "projects" | "inbox" | "project";
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
    text: r.text,
    type: r.type as LogEntry["type"],
  };
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
  const [activeView,       setActiveView]       = useState<AppView>("projects");
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

  const proj = projects[activeProj];

  // ─── Load projects ────────────────────────────────────────────────────────

  const loadProjects = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, name, description, color, version, stage")
      .order("created_at");
    if (data && data.length > 0) {
      setProjects(data.map(dbToProject));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const seeded = await seedBoardOS(supabase, user.id);
        if (seeded) setProjects([dbToProject(seeded)]);
      }
    }
    setLoading(false);
    setShowTour(shouldShowOnboarding());
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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

  const handleSaveProject = async (i: number, name: string, desc: string, color: string) => {
    const proj = projects[i];
    if (!proj) return;
    await supabase.from("projects").update({ name, description: desc, color }).eq("id", proj.id);
    setProjects((prev) => prev.map((p, idx) => idx === i ? { ...p, name, desc, color } : p));
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

    // Reload to get real UUIDs for newly inserted items
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

  // ─── Search + navigation ──────────────────────────────────────────────────

  const handleSearchNavigate = (projIndex: number, tab: TabId) => {
    setActiveProj(projIndex);
    setActiveView("project");
    setActiveTab(tab);
    setContentKey((k) => k + 1);
  };

  // ─── Toolbar helpers ──────────────────────────────────────────────────────

  const newEntryLabel = () => {
    switch (activeTab) {
      case "canvas": return t.toolbar.newCard;
      case "scope":  return t.toolbar.addFeature;
      default:       return t.toolbar.newEntry;
    }
  };

  const handleNewEntry = () => {
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
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="app-spinner" />
          <span style={{ color: "var(--fg-3)", fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-geist-mono), monospace" }}>
            Loading
          </span>
        </div>
      </div>
    );
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
      />

      <MotionConfig reducedMotion="user">
      <div className="app-main">
        {activeView === "project" && proj && (
          <>
            {/* Toolbar */}
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

            {/* Tabs */}
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
              style={{ width: "100%" }}
            >
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
            onSave={(name, desc, color) => handleSaveProject(editingProjIndex, name, desc, color)}
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
