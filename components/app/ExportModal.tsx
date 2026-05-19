"use client";

import { useState } from "react";
import { Project, MVPItem, LogEntry, IDEA_CARDS, KANBAN_COLUMNS, KanbanColumn, LogType } from "@/lib/app-data";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";

type FixedCardId = "problem" | "user" | "solution" | "context";

interface ExportModalProps {
  project:    Project;
  mvpItems:   MVPItem[];
  logEntries: LogEntry[];
  onClose:    () => void;
}

interface Sections {
  canvas: boolean;
  scope:  boolean;
  log:    boolean;
}

function generateMarkdown(
  project:    Project,
  mvpItems:   MVPItem[],
  logEntries: LogEntry[],
  sections:   Sections,
  colNames:   Record<KanbanColumn, string>,
  logTypes:   Record<LogType, string>,
  cardLabels: Record<FixedCardId, string>
): string {
  const lines: string[] = [];

  lines.push(`# ${project.name}${project.version ? " " + project.version : ""}`, "");
  if (project.stage) lines.push(`*${project.stage}*`, "");

  if (sections.canvas) {
    lines.push("## Idea Canvas", "");
    IDEA_CARDS.forEach((card) => {
      const label = cardLabels[card.id as FixedCardId] ?? card.id;
      lines.push(`### ${label}`, "", card.text, "");
    });
  }

  if (sections.scope) {
    lines.push("## MVP Scope", "");
    const activeItems = mvpItems.filter((i) => !i.done);
    KANBAN_COLUMNS.forEach((col) => {
      const colItems = activeItems.filter((i) => i.column === col.id);
      if (!colItems.length) return;
      lines.push(`### ${colNames[col.id]}`, "");
      colItems.forEach((item) => {
        lines.push(`- **${item.name}** (${item.priority})`);
        if (item.why) lines.push(`  > ${item.why}`);
      });
      lines.push("");
    });
    const doneItems = mvpItems.filter((i) => i.done);
    if (doneItems.length) {
      lines.push("### Done", "");
      doneItems.forEach((item) => {
        lines.push(`- ~~${item.name}~~ (${item.priority}) — ${colNames[item.column]}`);
      });
      lines.push("");
    }
  }

  if (sections.log) {
    lines.push("## Build Log", "");
    logEntries.forEach((entry) => {
      lines.push(`### ${entry.date} — ${logTypes[entry.type]}`, "", entry.text, "");
    });
  }

  return lines.join("\n");
}

function generatePDFHTML(
  project:    Project,
  mvpItems:   MVPItem[],
  logEntries: LogEntry[],
  sections:   Sections,
  colNames:   Record<KanbanColumn, string>,
  logTypes:   Record<LogType, string>,
  cardLabels: Record<FixedCardId, string>
): string {
  const activeItems = mvpItems.filter((i) => !i.done);
  const doneItems   = mvpItems.filter((i) => i.done);

  const colColors: Record<KanbanColumn, string> = {
    "core-mvp":    "#F0620A",
    "later":       "#6D28D9",
    "not-now":     "#A09D97",
    "to-validate": "#0D9488",
  };

  const logColors: Record<LogType, string> = {
    shipped:  "#15803D",
    decision: "#6D28D9",
    insight:  "#F0620A",
    idea:     "#0D9488",
  };

  const tagColors: Record<string, { color: string; bg: string }> = {
    core:       { color: "#F0620A", bg: "#FEF0E8" },
    hypothesis: { color: "#6D28D9", bg: "#F0EAFF" },
    signal:     { color: "#15803D", bg: "#E8F5EE" },
  };

  let canvasSection = "";
  if (sections.canvas) {
    const cards = IDEA_CARDS.map((card) => {
      const label = cardLabels[card.id as FixedCardId] ?? card.id;
      const tag = tagColors[card.tag.label] ?? { color: "#A09D97", bg: "#f0ede8" };
      return `
        <div style="background:#fff;border:1px solid #E2DDD4;border-radius:16px;padding:18px 20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <span style="font-family:monospace;font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#A09D97;">${label}</span>
            <span style="font-size:9.5px;font-weight:500;padding:2px 8px;border-radius:20px;color:${tag.color};background:${tag.bg};">${card.tag.label}</span>
          </div>
          <p style="font-size:12.5px;line-height:1.7;color:#1A1714;margin:0;">${card.text}</p>
        </div>`;
    }).join("");

    canvasSection = `
      <div class="section">
        <div class="section-title">Idea Canvas</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${cards}</div>
      </div>`;
  }

  let scopeSection = "";
  if (sections.scope) {
    const colsHTML = KANBAN_COLUMNS.map((col) => {
      const colItems = activeItems.filter((i) => i.column === col.id);
      if (!colItems.length) return "";
      const itemsHTML = colItems.map((item) => `
        <div style="padding:8px 0;border-bottom:1px solid #f5f3f0;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:12px;color:#1A1714;">${item.name}</span>
            <span style="font-family:monospace;font-size:9.5px;font-weight:700;color:${colColors[col.id]};">${item.priority}</span>
          </div>
          ${item.why ? `<div style="font-size:10.5px;color:#6B6760;margin-top:3px;">${item.why}</div>` : ""}
        </div>`).join("");
      return `
        <div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${colColors[col.id]};display:inline-block;"></span>
            <span style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#1A1714;">${colNames[col.id]}</span>
          </div>
          ${itemsHTML}
        </div>`;
    }).filter(Boolean).join("");

    const doneHTML = doneItems.length ? `
      <div style="margin-top:16px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#A09D97;margin-bottom:8px;">Done</div>
        ${doneItems.map((item) => `
          <div style="padding:6px 0;border-bottom:1px solid #f5f3f0;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:12px;color:#A09D97;text-decoration:line-through;">${item.name}</span>
            <span style="font-size:9.5px;color:${colColors[item.column]};background:${colColors[item.column]}18;padding:1px 7px;border-radius:20px;font-weight:500;">${colNames[item.column]}</span>
          </div>`).join("")}
      </div>` : "";

    scopeSection = `
      <div class="section">
        <div class="section-title">MVP Scope</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;">${colsHTML}</div>
        ${doneHTML}
      </div>`;
  }

  let logSection = "";
  if (sections.log) {
    const entriesHTML = logEntries.map((entry) => `
      <div style="display:grid;grid-template-columns:60px 1fr;gap:16px;padding:12px 0;border-bottom:1px solid #f5f3f0;">
        <div style="font-family:monospace;font-size:10px;color:#A09D97;padding-top:2px;">${entry.date}</div>
        <div>
          <p style="font-size:13px;line-height:1.65;color:#1A1714;margin:0 0 5px;">${entry.text}</p>
          <span style="font-size:10px;font-weight:600;color:${logColors[entry.type]};">${logTypes[entry.type]}</span>
        </div>
      </div>`).join("");

    logSection = `
      <div class="section">
        <div class="section-title">Build Log</div>
        ${entriesHTML}
      </div>`;
  }

  const meta = [project.version, project.stage].filter(Boolean).join(" · ");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${project.name} — Export</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #FAFAF8;
    color: #1A1714;
    padding: 48px;
    max-width: 860px;
    margin: 0 auto;
  }
  .header {
    text-align: center;
    padding: 36px 0 32px;
    margin-bottom: 36px;
    border-bottom: 1px solid #E2DDD4;
  }
  .logo-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #F0620A;
    border-radius: 11px;
    margin-bottom: 12px;
    box-shadow: 0 4px 14px rgba(240,98,10,.28);
  }
  .proj-name { font-size: 24px; font-weight: 700; letter-spacing: -.03em; color: #1A1714; }
  .proj-meta { font-size: 12px; color: #A09D97; margin-top: 6px; letter-spacing: .01em; }
  .section { margin-bottom: 36px; }
  .section-title {
    font-family: monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #A09D97;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #E2DDD4;
  }
  .footer {
    margin-top: 48px;
    padding-top: 18px;
    border-top: 1px solid #E2DDD4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10.5px;
    color: #A09D97;
  }
  .footer-brand { display: flex; align-items: center; gap: 7px; font-weight: 500; color: #6B6760; }
  .footer-date  { font-family: monospace; font-size: 10px; }
  @media print {
    body { padding: 0; background: #fff; }
    @page { margin: 1.4cm 1.6cm; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-box">
      <svg width="22" height="22" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.93)"/>
        <rect x="7" y="1" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.56)"/>
        <rect x="1" y="7" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.56)"/>
        <rect x="7" y="7" width="4" height="4" rx="1.2" fill="rgba(255,255,255,.28)"/>
      </svg>
    </div>
    <div class="proj-name">${project.name}</div>
    ${meta ? `<div class="proj-meta">${meta}</div>` : ""}
  </div>
  ${canvasSection}
  ${scopeSection}
  ${logSection}
  <div class="footer">
    <div class="footer-brand">
      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="4" height="4" rx="1.2" fill="#F0620A"/>
        <rect x="7" y="1" width="4" height="4" rx="1.2" fill="#F0620A" opacity=".55"/>
        <rect x="1" y="7" width="4" height="4" rx="1.2" fill="#F0620A" opacity=".55"/>
        <rect x="7" y="7" width="4" height="4" rx="1.2" fill="#F0620A" opacity=".28"/>
      </svg>
      Generated by BoardOS
    </div>
    <div class="footer-date">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</body>
</html>`;
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

function printViaIframe(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 8000);
  }, 400);
}

export function ExportModal({ project, mvpItems, logEntries, onClose }: ExportModalProps) {
  const { t } = useAppLang();
  const ex = t.export;
  const c  = t.canvas;
  const s  = t.scope;
  const l  = t.log;

  const [format,   setFormat]   = useState<"markdown" | "pdf">("markdown");
  const [sections, setSections] = useState<Sections>({ canvas: true, scope: true, log: true });

  const toggle = (key: keyof Sections) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const cardLabels: Record<FixedCardId, string> = {
    problem:  c.problem,
    user:     c.user,
    solution: c.solution,
    context:  c.context,
  };

  const colNames = s.columns as Record<KanbanColumn, string>;
  const logTypes = l.types as Record<LogType, string>;

  const handleExport = () => {
    if (format === "markdown") {
      const content  = generateMarkdown(project, mvpItems, logEntries, sections, colNames, logTypes, cardLabels);
      const filename = `${project.name.toLowerCase().replace(/\s+/g, "-")}-export.md`;
      downloadMarkdown(content, filename);
      onClose();
    } else {
      const html = generatePDFHTML(project, mvpItems, logEntries, sections, colNames, logTypes, cardLabels);
      printViaIframe(html);
      onClose();
    }
  };

  const anySelected = sections.canvas || sections.scope || sections.log;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{ex.title}</span>
          <button className="modal-close" onClick={onClose}><Icons.Close /></button>
        </div>

        <div className="export-section-label">{ex.format}</div>
        <div className="export-format-row">
          {(["markdown", "pdf"] as const).map((f) => (
            <button
              key={f}
              className={`export-format-btn${format === f ? " active" : ""}`}
              onClick={() => setFormat(f)}
            >
              {f === "markdown" ? ex.markdown : ex.pdf}
            </button>
          ))}
        </div>

        <div className="export-section-label">{ex.sections}</div>
        <div className="export-checks">
          {([
            { key: "canvas", label: ex.canvas },
            { key: "scope",  label: ex.scope  },
            { key: "log",    label: ex.log    },
          ] as const).map(({ key, label }) => (
            <label key={key} className="export-check-row">
              <input
                type="checkbox"
                checked={sections[key]}
                onChange={() => toggle(key)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="modal-foot">
          <button className="app-btn" onClick={onClose}>{ex.cancel}</button>
          <button
            className="app-btn app-btn-primary"
            onClick={handleExport}
            disabled={!anySelected}
          >
            <Icons.Download />{ex.download}
          </button>
        </div>
      </div>
    </div>
  );
}
