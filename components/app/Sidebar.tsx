"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import type { Project } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";

type AppView = "projects" | "inbox" | "project";

interface SidebarProps {
  activeView: AppView;
  activeProj: number;
  projects: Project[];
  onSelectView: (v: AppView) => void;
  onSelectProj: (i: number) => void;
  onLogout: () => void;
}

export function Sidebar({ activeView, activeProj, projects, onSelectView, onSelectProj, onLogout }: SidebarProps) {
  const { t } = useAppLang();

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.92)" />
            <rect x="7" y="1" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.55)" />
            <rect x="1" y="7" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.55)" />
            <rect x="7" y="7" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.28)" />
          </svg>
        </div>
        <div className="sb-brand-name">
          Board<em>OS</em>
        </div>
      </div>

      <div className="sb-section">{t.sidebar.workspace}</div>
      <div
        className={`sb-row${activeView === "projects" ? " active" : ""}`}
        onClick={() => onSelectView("projects")}
      >
        <Icons.Folder />
        {t.sidebar.allProjects}
      </div>
      <div
        className={`sb-row${activeView === "inbox" ? " active" : ""}`}
        onClick={() => onSelectView("inbox")}
      >
        <Icons.Sparkles />
        {t.sidebar.ideasInbox}
      </div>

      <div className="sb-divider" />

      <div className="sb-section">{t.sidebar.projects}</div>
      {projects.map((p, i) => (
        <div
          key={p.id}
          className={`sb-row${activeView === "project" && activeProj === i ? " active" : ""}`}
          onClick={() => { onSelectView("project"); onSelectProj(i); }}
        >
          <div className="sb-dot" style={{ background: p.color }} />
          {p.name}
        </div>
      ))}

      <div className="sb-spacer" />

      <div className="sb-divider" />
      <Link href="/app/settings" className="sb-row sb-settings-row">
        <Icons.Layers />
        {t.sidebar.settings}
      </Link>
      <button className="sb-row sb-logout-btn" onClick={onLogout}>
        <Icons.LogOut />
        Sign out
      </button>
    </aside>
  );
}
