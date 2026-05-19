"use client";

import { useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";

const TABS = [
  { id: "canvas", label: "Idea Canvas", count: 4 },
  { id: "scope", label: "MVP Scope", count: 12 },
  { id: "log", label: "Build Log", count: 18 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CanvasView() {
  const cells = [
    { k: "Problem", tag: "orange" as const, tl: "core", v: "New users sign up and never complete their first project. Empty state has no forward momentum." },
    { k: "User", tag: "" as const, tl: "segment", v: "Solo builders and small product teams in their first week with the tool." },
    { k: "Solution", tag: "violet" as const, tl: "hypothesis", v: "Guided 3-step onboarding ending with a real artifact: an Idea Canvas, scoped and saved." },
    { k: "Context", tag: "" as const, tl: "constraint", v: "Churn peaks on day 1. Activation > acquisition. Keep friction below 90 seconds." },
  ];
  return (
    <div className="canvas-grid">
      {cells.map((c) => (
        <div className="cv-cell" key={c.k}>
          <h5>
            {c.k}
            <span className={`tag ${c.tag}`}>{c.tl}</span>
          </h5>
          <p>{c.v}</p>
        </div>
      ))}
    </div>
  );
}

function ScopeView() {
  const inMvp = [
    { t: "Empty-state CTA on dashboard", tag: "orange" as const, tl: "P0", done: true },
    { t: "Three-step canvas wizard", tag: "orange" as const, tl: "P0", done: true },
    { t: "Persist draft to localStorage", tag: "" as const, tl: "P1", done: false },
    { t: "Success screen + share link", tag: "" as const, tl: "P1", done: false },
  ];
  const later = [
    { t: "Team collaborative canvas", tag: "violet" as const, tl: "v2" },
    { t: "AI-assisted problem reframing", tag: "violet" as const, tl: "v2" },
    { t: "Template marketplace", tag: "" as const, tl: "later" },
    { t: "Mobile drawer redesign", tag: "" as const, tl: "later" },
  ];
  return (
    <div className="scope-cols">
      <div className="sc-col">
        <div className="head">
          <span>In MVP</span>
          <span className="tag">4</span>
        </div>
        {inMvp.map((r, i) => (
          <div key={i} className={`sc-row${r.done ? " done" : ""}`}>
            <span className="sc-check">{r.done && <Icons.Check />}</span>
            <span>{r.t}</span>
            <span className={`tag ${r.tag}`}>{r.tl}</span>
          </div>
        ))}
      </div>
      <div className="sc-col">
        <div className="head">
          <span>Later</span>
          <span className="tag">4</span>
        </div>
        {later.map((r, i) => (
          <div key={i} className="sc-row">
            <span className="sc-check" />
            <span>{r.t}</span>
            <span className={`tag ${r.tag}`}>{r.tl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogView() {
  const rows = [
    { d: "May 17", m: "Drop the welcome video. Show the canvas immediately.", tag: "violet" as const, tl: "decision" },
    { d: "May 16", m: "Wired step 1→2 transitions. 60% drop-off fixed.", tag: "green" as const, tl: "shipped" },
    { d: "May 15", m: "6/8 testers skipped Problem field. Move below the fold?", tag: "orange" as const, tl: "learning" },
    { d: "May 14", m: "Try inline examples instead of empty placeholder fields.", tag: "" as const, tl: "next" },
  ];
  return (
    <div className="log-list">
      {rows.map((r, i) => (
        <div className="log-row" key={i}>
          <span className="d">{r.d}</span>
          <span className="m">{r.m}</span>
          <span className={`tag ${r.tag}`}>{r.tl}</span>
        </div>
      ))}
    </div>
  );
}

export function HeroMockup() {
  const [tab, setTab] = useState<TabId>("canvas");

  return (
    <div className="app-mock">
      <div className="app-bar">
        <div className="tl-dots">
          <span className="tl-dot r" />
          <span className="tl-dot y" />
          <span className="tl-dot g" />
        </div>
        <div className="app-url">
          <span className="lock">
            <Icons.Lock />
          </span>
          app.boardos.io&nbsp;/&nbsp;handhold-onboarding
        </div>
        <div style={{ color: "var(--fg-3)" }}>
          <Icons.Dots />
        </div>
      </div>

      <div className="happ">
        <aside className="happ-sb">
          <div className="sb-brand-l">
            <Image
              src="/logo.png"
              alt="BoardOS"
              width={22}
              height={22}
              style={{ borderRadius: 6, flexShrink: 0 }}
            />
            <span className="name sb-text">BoardOS</span>
          </div>

          <div>
            <div className="sb-sec sb-label">Workspace</div>
            <div className="sb-list">
              <div className="sb-row">
                <Icons.Folder />
                <span className="sb-text">All projects</span>
              </div>
              <div className="sb-row">
                <Icons.Sparkles />
                <span className="sb-text">Ideas inbox</span>
              </div>
            </div>
          </div>

          <div>
            <div className="sb-sec sb-label">Projects</div>
            <div className="sb-list">
              <div className="sb-row active">
                <span className="sb-dot" />
                <span className="sb-text">Handhold onboarding</span>
              </div>
              <div className="sb-row">
                <span className="sb-dot v" />
                <span className="sb-text">Inventory v2</span>
              </div>
              <div className="sb-row">
                <span className="sb-dot g" />
                <span className="sb-text">Email digest</span>
              </div>
              <div className="sb-row">
                <span className="sb-dot m" />
                <span className="sb-text">Pricing experiments</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="happ-main">
          <div className="happ-toolbar">
            <div className="crumbs">
              <span>Projects</span>
              <span className="sep">
                <Icons.Chevron />
              </span>
              <span className="cur">Handhold onboarding</span>
              <span className="tag">v0.2 draft</span>
            </div>
            <div className="spacer" />
            <button className="tbtn">
              <Icons.Search />
              Search
            </button>
            <button className="tbtn">
              <Icons.Sparkles />
              Reframe
            </button>
            <button className="tbtn primary">
              <Icons.Plus />
              New entry
            </button>
          </div>

          <div className="happ-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`h-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span className="ct">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="happ-body">
            {tab === "canvas" && <CanvasView />}
            {tab === "scope" && <ScopeView />}
            {tab === "log" && <LogView />}
          </div>
        </main>
      </div>
    </div>
  );
}
