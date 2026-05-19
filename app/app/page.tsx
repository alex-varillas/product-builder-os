"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

type AppView = "projects" | "inbox" | "project";
export type TabId = "canvas" | "scope" | "log";

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
  const { t } = useAppLang();
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
  const [scopeAddTrigger,  setScopeAddTrigger]  = useState(0);
  const [loading,          setLoading]          = useState(true);

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
      setProjects([]);
    }
    setLoading(false);
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
    }
    setNewProjOpen(false);
  };

  const handleSaveProject = async (i: number, name: string, desc: string, color: string) => {
    const proj = projects[i];
    if (!proj) return;
    await supabase.from("projects").update({ name, description: desc, color }).eq("id", proj.id);
    setProjects((prev) => prev.map((p, idx) => idx === i ? { ...p, name, desc, color } : p));
    setEditingProjIndex(null);
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
    { id: "canvas" as TabId, label: t.tabs.ideaCanvas, count: 4 },
    { id: "scope"  as TabId, label: t.tabs.mvpScope,   count: mvpItems.filter((i) => !i.done).length },
    { id: "log"    as TabId, label: t.tabs.buildLog,   count: logEntries.length },
  ];

  const changeTab  = (tab: TabId) => { setActiveTab(tab); setContentKey((k) => k + 1); };
  const openProject = (i: number) => {
    setActiveProj(i);
    setActiveView("project");
    setActiveTab("canvas");
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
        <span style={{ color: "var(--fg-3)", fontSize: "13px" }}>Loading…</span>
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
                <button className="app-btn app-btn-primary" onClick={handleNewEntry}>
                  <Icons.Plus />{newEntryLabel()}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="app-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`app-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => changeTab(tab.id)}
                >
                  {tab.label}
                  <span className="tab-count">{tab.count}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Content */}
        <div className="app-content">
          <div key={contentKey} className="content-fade">
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
              <>
                {activeTab === "canvas" && <IdeaCanvas addTrigger={canvasAddTrigger} />}
                {activeTab === "scope"  && (
                  <MVPScope
                    items={mvpItems}
                    onItemsChange={handleMvpItemsChange}
                    addTrigger={scopeAddTrigger}
                  />
                )}
                {activeTab === "log" && (
                  <BuildLog entries={logEntries} onAddEntry={addLogEntry} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

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
      {entryOpen   && <NewEntryModal onClose={() => setEntryOpen(false)} onAdd={addLogEntry} />}
      {newProjOpen && <CreateProjectModal onClose={() => setNewProjOpen(false)} onCreate={handleCreateProject} />}
      {editingProjIndex !== null && projects[editingProjIndex] && (
        <EditProjectModal
          project={projects[editingProjIndex]}
          onClose={() => setEditingProjIndex(null)}
          onSave={(name, desc, color) => handleSaveProject(editingProjIndex, name, desc, color)}
          onDelete={() => { handleDeleteProject(editingProjIndex); setEditingProjIndex(null); }}
        />
      )}
      {exportOpen && proj && (
        <ExportModal
          project={proj}
          mvpItems={mvpItems}
          logEntries={logEntries}
          onClose={() => setExportOpen(false)}
        />
      )}
    </>
  );
}
