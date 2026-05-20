"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Project, MVPItem, LogEntry, KANBAN_COLUMNS, KanbanColumn, LogType } from "@/lib/app-data";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";
import { createClient } from "@/lib/supabase/client";

type FixedCardId = "problem" | "user" | "solution" | "context";
const FIXED_SLOTS: FixedCardId[] = ["problem", "user", "solution", "context"];

interface CanvasCard {
  slot:    string;
  title:   string;
  content: string;
  badge:   string;
}

interface ExportModalProps {
  project:    Project;
  mvpItems:   MVPItem[];
  logEntries: LogEntry[];
  onClose:    () => void;
}

interface Sections { canvas: boolean; scope: boolean; log: boolean; }

// ─── Logo ─────────────────────────────────────────────────────────────────────

async function fetchLogoBase64(): Promise<string> {
  try {
    const res  = await fetch("/logo.png");
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { return ""; }
}

// ─── Markdown ─────────────────────────────────────────────────────────────────

function generateMarkdown(
  project:     Project,
  canvasCards: CanvasCard[],
  mvpItems:    MVPItem[],
  logEntries:  LogEntry[],
  sections:    Sections,
  colNames:    Record<KanbanColumn, string>,
  logTypes:    Record<LogType, string>,
  cardLabels:  Record<FixedCardId, string>
): string {
  const lines: string[] = [];
  lines.push(`# ${project.name}${project.version ? " " + project.version : ""}`, "");
  if (project.stage) lines.push(`*${project.stage}*`, "");

  if (sections.canvas) {
    lines.push("## Idea Canvas", "");
    // Fixed slots in canonical order
    FIXED_SLOTS.forEach((slot) => {
      const card  = canvasCards.find((c) => c.slot === slot);
      const label = cardLabels[slot];
      lines.push(`### ${label}`, "", card?.content || "*Empty*", "");
    });
    // Custom cards
    canvasCards
      .filter((c) => !FIXED_SLOTS.includes(c.slot as FixedCardId))
      .forEach((c) => lines.push(`### ${c.title || c.slot}`, "", c.content || "*Empty*", ""));
  }
  if (sections.scope) {
    lines.push("## MVP Scope", "");
    const active = mvpItems.filter((i) => !i.done);
    KANBAN_COLUMNS.forEach((col) => {
      const items = active.filter((i) => i.column === col.id);
      if (!items.length) return;
      lines.push(`### ${colNames[col.id]}`, "");
      items.forEach((item) => {
        lines.push(`- **${item.name}** (${item.priority})`);
        if (item.why) lines.push(`  > ${item.why}`);
      });
      lines.push("");
    });
    const done = mvpItems.filter((i) => i.done);
    if (done.length) {
      lines.push("### Done", "");
      done.forEach((item) => lines.push(`- ~~${item.name}~~ (${item.priority}) — ${colNames[item.column]}`));
      lines.push("");
    }
  }
  if (sections.log) {
    lines.push("## Build Log", "");
    logEntries.forEach((e) => lines.push(`### ${e.date} — ${logTypes[e.type]}`, "", e.text, ""));
  }
  return lines.join("\n");
}

// ─── PDF content ──────────────────────────────────────────────────────────────
// All layouts use <table> — reliable in html2canvas.
// All styles are inline — no class-based CSS, no conflicts with the app styles.
// Returns a plain HTML string (no <html>/<body> wrapper); downloadPDF wraps it.

function generatePDFContent(
  project:     Project,
  canvasCards: CanvasCard[],
  mvpItems:    MVPItem[],
  logEntries:  LogEntry[],
  sections:    Sections,
  colNames:    Record<KanbanColumn, string>,
  logTypes:    Record<LogType, string>,
  cardLabels:  Record<FixedCardId, string>
): string {
  const activeItems = mvpItems.filter((i) => !i.done);
  const doneItems   = mvpItems.filter((i) => i.done);

  const colColors: Record<KanbanColumn, string> = {
    "core-mvp": "#F0620A", "later": "#6D28D9", "not-now": "#A09D97", "to-validate": "#0D9488",
  };
  const logColors: Record<LogType, string> = {
    shipped: "#15803D", decision: "#6D28D9", insight: "#F0620A", idea: "#0D9488",
  };
  const tagColors: Record<string, { color: string; bg: string }> = {
    core:       { color: "#F0620A", bg: "#FEF0E8" },
    hypothesis: { color: "#6D28D9", bg: "#F0EAFF" },
    signal:     { color: "#15803D", bg: "#E8F5EE" },
  };

  const SEC_TITLE = "display:block;font-family:monospace;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#A09D97;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #E2DDD4;";
  const SEC_WRAP  = "margin-bottom:36px;";

  // ── Canvas ──
  let canvasSection = "";
  if (sections.canvas) {
    // Fixed slots in canonical order, then custom cards
    const orderedCards: CanvasCard[] = [
      ...FIXED_SLOTS.map((slot) => canvasCards.find((c) => c.slot === slot) ?? { slot, title: slot, content: "", badge: "core" }),
      ...canvasCards.filter((c) => !FIXED_SLOTS.includes(c.slot as FixedCardId)),
    ];

    const cells = orderedCards.map((card) => {
      const isFixed = FIXED_SLOTS.includes(card.slot as FixedCardId);
      const label   = isFixed ? cardLabels[card.slot as FixedCardId] : (card.title || card.slot);
      const tag     = tagColors[card.badge] ?? { color: "#A09D97", bg: "#F3EFE7" };
      return `<td style="width:50%;padding:5px;vertical-align:top;">
        <div style="background:#fff;border:1px solid #E2DDD4;border-radius:16px;padding:18px 20px;height:100%;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px;"><tr>
            <td style="font-family:monospace;font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#A09D97;vertical-align:middle;">${label}</td>
            <td style="text-align:right;vertical-align:middle;white-space:nowrap;">
              <span style="display:inline-block;font-size:9.5px;font-weight:500;padding:2px 8px;border-radius:20px;color:${tag.color};background:${tag.bg};">${card.badge}</span>
            </td>
          </tr></table>
          <p style="font-size:12.5px;line-height:1.7;color:${card.content ? "#1A1714" : "#A09D97"};margin:0;">${card.content || "Empty"}</p>
        </div>
      </td>`;
    });
    const rows: string[] = [];
    for (let i = 0; i < cells.length; i += 2) {
      rows.push(`<tr>${cells[i]}${cells[i + 1] ?? "<td style='width:50%;'></td>"}</tr>`);
    }
    canvasSection = `<div style="${SEC_WRAP}">
      <span style="${SEC_TITLE}">Idea Canvas</span>
      <table style="width:100%;border-collapse:collapse;">${rows.join("")}</table>
    </div>`;
  }

  // ── Scope ──
  let scopeSection = "";
  if (sections.scope) {
    const colCells = KANBAN_COLUMNS.map((col) => {
      const items = activeItems.filter((i) => i.column === col.id);
      if (!items.length) return null;
      const itemsHTML = items.map((item) => `
        <div style="padding:8px 0;border-bottom:1px solid #f5f3f0;">
          <table style="width:100%;border-collapse:collapse;"><tr>
            <td style="font-size:12px;color:#1A1714;vertical-align:middle;">${item.name}</td>
            <td style="text-align:right;white-space:nowrap;font-family:monospace;font-size:9.5px;font-weight:700;color:${colColors[col.id]};vertical-align:middle;">${item.priority ?? ""}</td>
          </tr></table>
          ${item.why ? `<div style="font-size:10.5px;color:#6B6760;margin-top:3px;">${item.why}</div>` : ""}
        </div>`).join("");
      return `<td style="width:50%;padding:0 8px;vertical-align:top;">
        <div style="margin-bottom:10px;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${colColors[col.id]};vertical-align:middle;margin-right:6px;"></span>
          <span style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#1A1714;vertical-align:middle;">${colNames[col.id]}</span>
        </div>
        ${itemsHTML}
      </td>`;
    }).filter(Boolean) as string[];

    const scopeRows: string[] = [];
    for (let i = 0; i < colCells.length; i += 2) {
      scopeRows.push(`<tr>${colCells[i]}${colCells[i + 1] ?? "<td style='width:50%;'></td>"}</tr>`);
    }

    const doneHTML = doneItems.length ? `<div style="margin-top:16px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#A09D97;margin-bottom:8px;">Done</div>
      ${doneItems.map((item) => `
        <div style="padding:6px 0;border-bottom:1px solid #f5f3f0;">
          <table style="width:100%;border-collapse:collapse;"><tr>
            <td style="font-size:12px;color:#A09D97;text-decoration:line-through;">${item.name}</td>
            <td style="text-align:right;white-space:nowrap;">
              <span style="font-size:9.5px;color:${colColors[item.column]};background:${colColors[item.column]}18;padding:1px 7px;border-radius:20px;font-weight:500;">${colNames[item.column]}</span>
            </td>
          </tr></table>
        </div>`).join("")}
    </div>` : "";

    scopeSection = `<div style="${SEC_WRAP}">
      <span style="${SEC_TITLE}">MVP Scope</span>
      <table style="width:100%;border-collapse:collapse;">${scopeRows.join("")}</table>
      ${doneHTML}
    </div>`;
  }

  // ── Log ──
  let logSection = "";
  if (sections.log) {
    const entriesHTML = logEntries.map((e) => `
      <div style="padding:12px 0;border-bottom:1px solid #f5f3f0;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="width:60px;font-family:monospace;font-size:10px;color:#A09D97;vertical-align:top;padding-top:2px;white-space:nowrap;">${e.date}</td>
          <td style="padding-left:16px;vertical-align:top;">
            <p style="font-size:13px;line-height:1.65;color:#1A1714;margin:0 0 5px;">${e.text}</p>
            <span style="font-size:10px;font-weight:600;color:${logColors[e.type]};">${logTypes[e.type]}</span>
          </td>
        </tr></table>
      </div>`).join("");

    logSection = `<div style="${SEC_WRAP}">
      <span style="${SEC_TITLE}">Build Log</span>
      ${entriesHTML}
    </div>`;
  }

  const meta   = [project.version, project.stage].filter(Boolean).join(" · ");
  const header = `<div style="text-align:center;padding:32px 0 28px;margin-bottom:36px;border-bottom:1px solid #E2DDD4;">
    <div style="font-size:26px;font-weight:700;letter-spacing:-.03em;color:#1A1714;">${project.name}</div>
    ${meta ? `<div style="font-size:12px;color:#A09D97;margin-top:6px;">${meta}</div>` : ""}
  </div>`;

  // ── Footer ──
  const date   = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const footer = `<div style="margin-top:48px;padding-top:18px;border-top:1px solid #E2DDD4;">
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="font-size:10.5px;font-weight:500;color:#6B6760;vertical-align:middle;">Generated by BoardOS</td>
      <td style="text-align:right;font-family:monospace;font-size:10px;color:#A09D97;vertical-align:middle;">${date}</td>
    </tr></table>
  </div>`;

  return `${header}${canvasSection}${scopeSection}${logSection}${footer}`;
}

// ─── Download helpers ──────────────────────────────────────────────────────────

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

async function downloadPDF(content: string, filename: string) {
  const { default: html2pdf } = await import("html2pdf.js" as any);

  // Wrap with body-level styles. Using .from(string, "string") so html2pdf
  // mounts the container at position:fixed (0,0) — the only place where
  // html2canvas reliably captures content.
  const wrapped = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:#FAFAF8;color:#1A1714;padding:48px;box-sizing:border-box;">${content}</div>`;

  await html2pdf()
    .set({
      margin:      [0, 0, 0, 0],
      filename,
      image:       { type: "jpeg", quality: 0.97 },
      html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 860 },
      jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak:   { mode: ["css", "legacy"] },
    })
    .from(wrapped, "string")
    .save();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportModal({ project, mvpItems, logEntries, onClose }: ExportModalProps) {
  const { t } = useAppLang();
  const ex = t.export;
  const c  = t.canvas;
  const s  = t.scope;
  const l  = t.log;

  const [format,    setFormat]    = useState<"markdown" | "pdf">("markdown");
  const [sections,  setSections]  = useState<Sections>({ canvas: true, scope: true, log: true });
  const [exporting, setExporting] = useState(false);

  const toggle = (key: keyof Sections) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const cardLabels: Record<FixedCardId, string> = {
    problem: c.problem, user: c.user, solution: c.solution, context: c.context,
  };
  const colNames = s.columns as Record<KanbanColumn, string>;
  const logTypes = l.types   as Record<LogType, string>;

  const filename = `${project.name.toLowerCase().replace(/\s+/g, "-")}-export`;

  const handleExport = async () => {
    setExporting(true);
    try {
      // Always load the real canvas cards from Supabase
      const supabase = createClient();
      const { data } = await supabase
        .from("canvas_cards")
        .select("slot, title, content, badge")
        .eq("project_id", project.id)
        .order("updated_at");
      const canvasCards: CanvasCard[] = data ?? [];

      if (format === "markdown") {
        const md = generateMarkdown(project, canvasCards, mvpItems, logEntries, sections, colNames, logTypes, cardLabels);
        downloadMarkdown(md, `${filename}.md`);
        onClose();
      } else {
        const content = generatePDFContent(project, canvasCards, mvpItems, logEntries, sections, colNames, logTypes, cardLabels);
        await downloadPDF(content, `${filename}.pdf`);
        onClose();
      }
    } finally {
      setExporting(false);
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
              <input type="checkbox" checked={sections[key]} onChange={() => toggle(key)} />
              {label}
            </label>
          ))}
        </div>

        <div className="modal-foot">
          <button className="app-btn" onClick={onClose}>{ex.cancel}</button>
          <button
            className="app-btn app-btn-primary"
            onClick={handleExport}
            disabled={!anySelected || exporting}
          >
            <Icons.Download />
            {exporting ? "Generating…" : ex.download}
          </button>
        </div>
      </div>
    </div>
  );
}
