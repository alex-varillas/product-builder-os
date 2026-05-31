"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// Three sample projects — real app accent colors (project colors are legit here).
// cx/cy/r in a 160x110 viewBox, mirroring the real BuildHoursCard triangular cluster.
const PROJECTS = [
  { name: "BoardOS", letter: "B", color: "#F0620A", min: 180, cx: 64,  cy: 55, r: 40 },
  { name: "Reflow",  letter: "R", color: "#6D28D9", min: 90,  cx: 104, cy: 32, r: 28 },
  { name: "Nimbus",  letter: "N", color: "#15803D", min: 60,  cx: 100, cy: 78, r: 23 },
] as const;

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

const LOG_ENTRIES = [
  { type: "idea",    bg: "rgba(160,157,151,0.14)", color: "#6B7280", proj: "Reflow",  pColor: "#6D28D9", time: "1d ago",  text: "Ideas de como preparar la siguiente fase" },
  { type: "shipped", bg: "rgba(21,128,61,0.12)",   color: "#15803D", proj: "BoardOS", pColor: "#F0620A", time: "10d ago", text: "Pruebas de logs para documentacion" },
];

// May 2026 — Monday-first. May 1 = Friday (col index 4).
const CAL_ROWS = [
  [0,  0,  0,  0,  1,  2,  3],
  [4,  5,  6,  7,  8,  9,  10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
];
const DONE_DAYS = new Set([29]);
const TODAY_DAY = 30;

// Large semicircle arc gauge — matches the real app's Focus Goal card (empty today).
function FocusArcSVG() {
  const R = 48; const ARC = Math.PI * R;
  const path = `M 10 68 A ${R} ${R} 0 0 1 114 68`;
  const pct = 45 / 75;
  return (
    <svg width="124" height="72" viewBox="0 0 124 72">
      <defs>
        <linearGradient id="hm-fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1A1714" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#E6E8EB" strokeWidth="9" strokeLinecap="round" />
      <path d={path} fill="none" stroke="url(#hm-fg-grad)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${pct * ARC} ${ARC}`} />
      <text x="62" y="54" textAnchor="middle" fontSize="9" fill="var(--fg-3)" fontFamily="var(--font-geist-mono), monospace">Goal</text>
      <text x="62" y="67" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-geist-mono), monospace">1h 15m</text>
    </svg>
  );
}

// Magnetic energy-field blobs — same behavior as the real app's Build Hours card:
// blobs drift toward the cursor (smaller ones react more), settling back on leave.
const VB_W = 160;
const VB_H = 110;

function blobOffset(b: (typeof PROJECTS)[number], i: number, mouse: { x: number; y: number } | null) {
  if (!mouse) return { dx: 0, dy: 0 };
  const vx = mouse.x - b.cx;
  const vy = mouse.y - b.cy;
  const dist = Math.sqrt(vx * vx + vy * vy) || 1;
  const range = 130;
  if (dist > range) return { dx: 0, dy: 0 };
  const strength = ((range - dist) / range) * (7 - i * 2);
  return { dx: (vx / dist) * strength, dy: (vy / dist) * strength };
}

function BlobField() {
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * VB_W,
      y: ((e.clientY - rect.top) / rect.height) * VB_H,
    });
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="hm-blob-svg"
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={onMove}
      onMouseLeave={() => setMouse(null)}
    >
      <defs>
        {PROJECTS.map((p, i) => (
          <radialGradient key={i} id={`hm-bl-${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={p.color} stopOpacity="0.9" />
            <stop offset="45%"  stopColor={p.color} stopOpacity="0.6" />
            <stop offset="80%"  stopColor={p.color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {PROJECTS.map((p, i) => {
        const { dx, dy } = blobOffset(p, i, mouse);
        return (
          <g
            key={p.name}
            style={{
              transform: `translate(${dx}px, ${dy}px)`,
              transition: mouse
                ? "transform 0.4s cubic-bezier(0.22, 0.68, 0, 1.2)"
                : "transform 0.65s cubic-bezier(0.22, 0.68, 0, 1.2)",
            }}
          >
            <ellipse cx={p.cx} cy={p.cy} rx={p.r * 1.4} ry={p.r * 1.18} fill={`url(#hm-bl-${i})`} />
            <text x={p.cx} y={p.cy - 1} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--font-geist-mono), monospace"
              style={{ pointerEvents: "none" }}>{fmt(p.min)}</text>
            <text x={p.cx} y={p.cy + 11} textAnchor="middle"
              fontSize="7.5" fill="rgba(255,255,255,0.9)" fontFamily="var(--font-geist-sans), sans-serif"
              style={{ pointerEvents: "none" }}>{p.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SidebarIcon({ d }: { d: string }) {
  return (
    <svg className="hm-sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function HeroMockup() {
  return (
    <div className="app-mock">
      {/* Browser chrome */}
      <div className="app-bar">
        <div className="tl-dots">
          <span className="tl-dot r" /><span className="tl-dot y" /><span className="tl-dot g" />
        </div>
        <div className="app-url">
          <span style={{ color: "var(--green)", display: "flex", alignItems: "center" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          board.os / app
        </div>
      </div>

      {/* App shell */}
      <div className="hm-wrap">
        {/* Sidebar — faithful to the real app */}
        <aside className="hm-sidebar">
          <div className="hm-brand">
            <Image src="/logo.png" alt="BoardOS" width={52} height={18} style={{ flexShrink: 0 }} />
            <span className="hm-collapse">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
          </div>

          <div>
            <div className="hm-section-label hm-sb-label">Workspace</div>
            <div className="hm-sb-list">
              <div className="hm-sb-row active">
                <SidebarIcon d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />
                <span className="hm-sb-text">Home</span>
              </div>
              <div className="hm-sb-row">
                <SidebarIcon d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2" />
                <span className="hm-sb-text">Today</span>
              </div>
              <div className="hm-sb-row">
                <SidebarIcon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" />
                <span className="hm-sb-text">Pomodoro</span>
              </div>
              <div className="hm-sb-row">
                <SidebarIcon d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                <span className="hm-sb-text">All projects</span>
              </div>
              <div className="hm-sb-row">
                <SidebarIcon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                <span className="hm-sb-text">Ideas inbox</span>
              </div>
            </div>
          </div>

          <div>
            <div className="hm-section-label hm-sb-label">Projects</div>
            <div className="hm-sb-list">
              {PROJECTS.map((p) => (
                <div key={p.name} className="hm-sb-row">
                  <span className="hm-sb-avatar" style={{ background: p.color }}>{p.letter}</span>
                  <span className="hm-sb-text">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Settings + Sign out */}
          <div className="hm-sb-bottom">
            <div className="hm-sb-row">
              <SidebarIcon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              <span className="hm-sb-text">Settings</span>
            </div>
            <div className="hm-sb-row">
              <SidebarIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              <span className="hm-sb-text">Sign out</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="hm-main">
          {/* Greeting */}
          <div className="hm-greeting-row">
            <div>
              <p className="hm-greeting-name">Good morning</p>
              <p className="hm-greeting-sub">Let&apos;s see today&apos;s progress</p>
            </div>
            <div className="hm-date">Saturday, May 30 · 2026</div>
          </div>

          {/* 2×2 dashboard grid */}
          <div className="hm-grid">
            {/* Build Hours — top left */}
            <div className="hm-card">
              <div className="hm-card-label">
                <span>Your Build Hours</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", fontFamily: "var(--font-geist-mono),monospace" }}>5h 30m</div>
                  <div style={{ fontSize: "9px", color: "var(--fg-3)" }}>This week</div>
                </div>
              </div>
              <div className="hm-blobs"><BlobField /></div>
              <div className="hm-bh-legend">
                {PROJECTS.map((p) => (
                  <div key={p.name} className="hm-bh-leg-row">
                    <span className="hm-bh-leg-dot" style={{ background: p.color }} />
                    <span className="hm-bh-leg-name">{p.name}</span>
                    <span className="hm-bh-leg-time">{fmt(p.min)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar — top right, dark themed */}
            <div className="hm-card hm-card-dark">
              <div className="hm-cal-header">
                <span className="hm-cal-month">May 2026</span>
                <div className="hm-cal-nav">
                  <span className="hm-cal-nav-btn">‹</span>
                  <span className="hm-cal-nav-btn">›</span>
                </div>
              </div>
              <div className="hm-cal-dow">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} className="hm-cal-dow-c">{d}</span>
                ))}
              </div>
              <div className="hm-cal-num-grid">
                {CAL_ROWS.flat().map((d, i) => (
                  <div
                    key={i}
                    className={`hm-cal-num${!d ? " empty" : d === TODAY_DAY ? " today" : DONE_DAYS.has(d) ? " done" : ""}`}
                  >
                    {d || ""}
                  </div>
                ))}
              </div>
              <div className="hm-cal-legend">
                <span className="hm-cal-leg"><span className="hm-cal-leg-dot" style={{ background: "#fff" }} />Today</span>
                <span className="hm-cal-leg"><span className="hm-cal-leg-dot" style={{ background: "#4ADE80" }} />Done</span>
                <span className="hm-cal-leg"><span className="hm-cal-leg-dot" style={{ background: "#818CF8" }} />Scheduled</span>
              </div>
            </div>

            {/* Focus Goal + Streak stacked — bottom left */}
            <div className="hm-fg-stack">
              {/* Focus today */}
              <div className="hm-card hm-card-row">
                <div className="hm-fg-info">
                  <div className="hm-fg-label">Focus today</div>
                  <div style={{ fontSize: "9px", color: "var(--fg-3)", marginBottom: "4px" }}>Keep your daily goal</div>
                  <div className="hm-fg-val">45m</div>
                  <div className="hm-change-goal">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-3 .5.5-3L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Change Goal
                  </div>
                </div>
                <FocusArcSVG />
              </div>

              {/* Build streak */}
              <div className="hm-card hm-card-row">
                <div className="hm-fg-info">
                  <div className="hm-fg-label">Build Streak</div>
                  <div className="hm-streak-num">9</div>
                  <div className="hm-fg-sub">consecutive days</div>
                </div>
                <div className="hm-streak-right">
                  <div className="hm-streak-dow">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <span key={i} className="hm-streak-d">{d}</span>
                    ))}
                  </div>
                  <div className="hm-streak-grid">
                    {[0, 1, 2, 3].map((row) => (
                      <div key={row} className="hm-streak-grid-row">
                        {[0, 1, 2, 3, 4, 5, 6].map((col) => {
                          const idx = row * 7 + col;
                          // 9-day streak → last 9 cells active (bottom-right cluster)
                          return <div key={col} className={`hm-streak-cell${idx >= 19 ? " on" : ""}`} />;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Log — bottom right */}
            <div className="hm-card">
              <div className="hm-card-label">
                <span>Recent Log</span>
                <span style={{ color: "var(--fg-3)", fontSize: "9px" }}>View all →</span>
              </div>
              <div className="hm-log">
                {LOG_ENTRIES.map((e, i) => (
                  <div key={i} className="hm-log-row">
                    <div className="hm-log-top">
                      <span className="hm-log-type" style={{ background: e.bg, color: e.color }}>{e.type.toUpperCase()}</span>
                      <span className="hm-log-proj"><span className="hm-log-proj-dot" style={{ background: e.pColor }} />{e.proj}</span>
                      <span className="hm-log-time">{e.time}</span>
                    </div>
                    <div className="hm-log-text">{e.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom pomodoro bar — faithful to the real app */}
          <div className="hm-pomo-bar">
            <div className="hm-pomo-left">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>20 min · Start focus</span>
            </div>
            <button className="hm-pomo-btn">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Start focus
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
