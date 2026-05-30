"use client";

import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import type { Project } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";

type AppView = "home" | "today" | "projects" | "inbox" | "project" | "pomodoro";

interface SidebarProps {
  activeView: AppView;
  activeProj: number;
  projects: Project[];
  onSelectView: (v: AppView) => void;
  onSelectProj: (i: number) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeView, activeProj, projects, onSelectView, onSelectProj, onLogout, collapsed, onToggleCollapse }: SidebarProps) {
  const { t } = useAppLang();

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sb-brand">
        {collapsed ? (
          <Image src="/logo2.png" alt="BoardOS" width={40} height={26} className="sb-logo" />
        ) : (
          <Image src="/logo.png" alt="BoardOS" width={66} height={22} className="sb-logo" />
        )}
        <button className="sb-toggle" onClick={onToggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <Icons.ChevronLeft style={{ transform: collapsed ? "rotate(180deg)" : undefined, transition: "transform 0.22s" }} />
        </button>
      </div>

      <div className="sb-section"><span className="sb-row-text">{t.sidebar.workspace}</span></div>
      <div
        className={`sb-row${activeView === "home" ? " active" : ""}`}
        onClick={() => onSelectView("home")}
        data-tour="home"
        title={collapsed ? t.sidebar.home : undefined}
      >
        <Icons.Home />
        <span className="sb-row-text">{t.sidebar.home}</span>
      </div>
      <div
        className={`sb-row${activeView === "today" ? " active" : ""}`}
        onClick={() => onSelectView("today")}
        data-tour="today"
        title={collapsed ? t.sidebar.today : undefined}
      >
        <Icons.Sun />
        <span className="sb-row-text">{t.sidebar.today}</span>
      </div>
      <div
        className={`sb-row${activeView === "pomodoro" ? " active" : ""}`}
        onClick={() => onSelectView("pomodoro")}
        data-tour="pomodoro"
        title={collapsed ? t.sidebar.pomodoro : undefined}
      >
        <Icons.Timer />
        <span className="sb-row-text">{t.sidebar.pomodoro}</span>
      </div>
      <div
        className={`sb-row${activeView === "projects" ? " active" : ""}`}
        onClick={() => onSelectView("projects")}
        title={collapsed ? t.sidebar.allProjects : undefined}
      >
        <Icons.Folder />
        <span className="sb-row-text">{t.sidebar.allProjects}</span>
      </div>
      <div
        className={`sb-row${activeView === "inbox" ? " active" : ""}`}
        onClick={() => onSelectView("inbox")}
        title={collapsed ? t.sidebar.ideasInbox : undefined}
      >
        <Icons.Sparkles />
        <span className="sb-row-text">{t.sidebar.ideasInbox}</span>
      </div>

      <div className="sb-divider" />

      <div className="sb-section" data-tour="projects"><span className="sb-row-text">{t.sidebar.projects}</span></div>
      {projects.map((p, i) => (
        <div
          key={p.id}
          className={`sb-row${activeView === "project" && activeProj === i ? " active" : ""}`}
          onClick={() => { onSelectView("project"); onSelectProj(i); }}
          title={collapsed ? p.name : undefined}
        >
          <div className="sb-proj-icon" style={{ background: p.color }}>{p.name.charAt(0).toUpperCase()}</div>
          <span className="sb-row-text">{p.name}</span>
        </div>
      ))}

      <div className="sb-spacer" />

      <div className="sb-divider" />
      <Link href="/app/settings" className="sb-row sb-settings-row" title={collapsed ? t.sidebar.settings : undefined}>
        <Icons.Layers />
        <span className="sb-row-text">{t.sidebar.settings}</span>
      </Link>
      <button className="sb-row sb-logout-btn" onClick={onLogout} title={collapsed ? "Sign out" : undefined}>
        <Icons.LogOut />
        <span className="sb-row-text">Sign out</span>
      </button>
    </aside>
  );
}
