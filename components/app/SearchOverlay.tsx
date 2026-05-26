"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Icons } from "@/components/ui/icons";
import { Project, MVPItem, LogEntry, LOG_TYPE_CFG } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";
import { fadeIn, modalSpring } from "@/lib/motion";

type TabId = "canvas" | "scope" | "log";

interface EnrichedResult {
  item: string;
  proj: string;
  type: string;
  color: string;
  projIndex: number;
  tab: TabId;
}

interface SearchOverlayProps {
  onClose: () => void;
  onNavigate: (projIndex: number, tab: TabId) => void;
  projects: Project[];
  mvpItems: MVPItem[];
  logEntries: LogEntry[];
  activeProj: number;
}

export function SearchOverlay({ onClose, onNavigate, projects, mvpItems, logEntries, activeProj }: SearchOverlayProps) {
  const { t } = useAppLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => { inputRef.current?.focus(); }, []);

  const suggestions = useMemo<EnrichedResult[]>(() =>
    projects.map((proj, i) => ({
      item: proj.name,
      proj: proj.name,
      type: "Project",
      color: proj.color,
      projIndex: i,
      tab: "canvas" as TabId,
    }))
  , [projects]);

  const allResults = useMemo<EnrichedResult[]>(() => {
    const rs: EnrichedResult[] = [];
    projects.forEach((proj, i) =>
      rs.push({ item: proj.name, proj: proj.name, type: "Project", color: proj.color, projIndex: i, tab: "canvas" })
    );
    mvpItems.forEach((item) =>
      rs.push({ item: item.name, proj: projects[activeProj]?.name ?? "", type: "MVP Scope", color: "#F0620A", projIndex: activeProj, tab: "scope" })
    );
    logEntries.forEach((e) =>
      rs.push({
        item: e.text.length > 70 ? e.text.slice(0, 70) + "…" : e.text,
        proj: projects[activeProj]?.name ?? "",
        type: "Build Log",
        color: LOG_TYPE_CFG[e.type].color,
        projIndex: activeProj,
        tab: "log",
      })
    );
    return rs;
  }, [projects, mvpItems, logEntries, activeProj]);

  const results = q
    ? allResults.filter(
        (r) =>
          r.item.toLowerCase().includes(q.toLowerCase()) ||
          r.proj.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  const displayResults = q ? results : suggestions;

  const renderResult = (r: EnrichedResult, i: number) => (
    <div
      key={i}
      className="search-result"
      onClick={() => { onNavigate(r.projIndex, r.tab); onClose(); }}
    >
      <div className="sb-dot" style={{ background: r.color, borderRadius: 2 }} />
      <div>
        <div className="search-result-name">{r.item}</div>
        <div className="search-result-meta">{r.proj} &middot; {r.type}</div>
      </div>
    </div>
  );

  return (
    <motion.div className="app-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={onClose}>
      <motion.div className="search-box" variants={modalSpring} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <Icons.Search />
          <input
            ref={inputRef}
            className="search-input"
            placeholder={t.search.placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="search-hint">{t.search.esc}</span>
        </div>

        <div className="search-results">
          {!q && (
            <div className="search-section-label">Projects</div>
          )}
          {displayResults.length > 0 ? (
            displayResults.map((r, i) => renderResult(r, i))
          ) : q ? (
            <div className="search-empty">{t.search.noResults} &quot;{q}&quot;</div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
