"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Project } from "@/lib/app-data";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";
import { staggerContainer, fadeUp } from "@/lib/motion";

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (i: number) => void;
  onNewProject: () => void;
  onEditProject: (i: number) => void;
}

export function ProjectsView({ projects, onOpenProject, onNewProject, onEditProject }: ProjectsViewProps) {
  const { t } = useAppLang();
  const p = t.projects;

  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const closeMenu = () => setMenuOpen(null);

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">{p.title}</h1>
        <button className="app-btn app-btn-primary" onClick={onNewProject}>
          + {p.newProject}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">{p.empty}</p>
          <p className="empty-hint">{p.emptyHint}</p>
        </div>
      ) : (
        <motion.div className="projects-grid" variants={staggerContainer} initial="hidden" animate="visible">
          {projects.map((proj, i) => (
            <motion.div key={proj.id} className="proj-card" variants={fadeUp} initial="hidden" animate="visible">
              <div className="proj-card-top">
                <div className="proj-card-dot" style={{ background: proj.color }} />
                <div className="proj-card-top-right">
                  {proj.version && (
                    <span className="bc-badge">
                      {proj.version} {proj.stage ? p.stage[proj.stage as "draft" | "shipped"] : ""}
                    </span>
                  )}
                  <div className="proj-card-menu-wrap">
                    <button
                      className="proj-card-menu-btn"
                      onClick={(e) => { e.stopPropagation(); menuOpen === i ? closeMenu() : setMenuOpen(i); }}
                    >
                      <Icons.Dots />
                    </button>

                    {menuOpen === i && (
                      <>
                        <div className="proj-menu-backdrop" onClick={closeMenu} />
                        <div className="proj-card-menu">
                          <button
                            className="proj-card-menu-item"
                            onClick={() => { closeMenu(); onEditProject(i); }}
                          >
                            {p.edit}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="proj-card-body">
                <div className="proj-card-name">{proj.name}</div>
                {proj.desc && <p className="proj-card-desc">{proj.desc}</p>}
              </div>

              <button className="app-btn proj-card-btn" onClick={() => onOpenProject(i)}>
                {p.openProject} &rarr;
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
