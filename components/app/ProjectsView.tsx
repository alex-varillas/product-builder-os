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
              {/* Colored cover with folder icon */}
              <div className="proj-card-cover" style={{ background: proj.color }}>
                <svg className="proj-card-folder" viewBox="0 0 72 56" fill="none">
                  <path d="M4 18 L4 10 Q4 6 8 6 L24 6 L30 14 L68 14 Q72 14 72 18 Z" fill="rgba(255,255,255,0.38)" />
                  <path d="M4 18 L68 18 Q72 18 72 22 L72 50 Q72 54 68 54 L8 54 Q4 54 4 50 Z" fill="rgba(255,255,255,0.24)" />
                  <line x1="14" y1="30" x2="58" y2="30" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="14" y1="38" x2="46" y2="38" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {proj.version && (
                  <span className="proj-cover-badge">
                    {proj.version}{proj.stage ? ` ${p.stage[proj.stage as "draft" | "shipped"]}` : ""}
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

              <div className="proj-card-body">
                <div className="proj-card-name">{proj.name}</div>
                {proj.desc && <p className="proj-card-desc">{proj.desc}</p>}
                <button className="app-btn proj-card-btn" onClick={() => onOpenProject(i)}>
                  {p.openProject} &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
