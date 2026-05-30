"use client";

import { useLanguage } from "./LanguageContext";
import { WordReveal } from "./WordReveal";

const BLOCK_COLORS = ["#2563EB", "#6D28D9", "#F0620A", "#2563EB", "#15803D"];
const PLAN_PATTERN = [
  [1, 0, 1, 0, 1],
  [0, 1, 1, 1, 0],
  [1, 1, 0, 0, 1],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 1],
];

function PlanFocusMockup() {
  const days = ["M", "T", "W", "T", "F"];
  return (
    <div className="ev-plan">
      <div className="ev-week">
        {days.map((day, ci) => (
          <div key={ci} className="ev-day-col">
            <span className="ev-day-label">{day}</span>
            {PLAN_PATTERN.map((row, ri) =>
              row[ci] ? (
                <div key={ri} className="ev-block" style={{ background: BLOCK_COLORS[ri] }} />
              ) : (
                <div key={ri} className="ev-block-empty" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="ev-pomo-row">
        <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
          <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(37,99,235,0.14)" strokeWidth="4.5" />
          <circle cx="22" cy="22" r="17" fill="none" stroke="#2563EB" strokeWidth="4.5"
            strokeLinecap="round" strokeDasharray="107" strokeDashoffset="27"
            transform="rotate(-90 22 22)" />
        </svg>
        <div className="ev-pomo-info">
          <span className="ev-pomo-time">24:38</span>
          <span className="ev-pomo-lbl">Focus session active</span>
        </div>
      </div>
    </div>
  );
}

function ScopeMockup() {
  const cols = [
    { label: "Core MVP", dot: "#F0620A", cards: ["Auth flow", "Dashboard", "Build Log"] },
    { label: "Later", dot: "#6D28D9", cards: ["AI summary", "Export"] },
    { label: "Not Now", dot: "#9CA3AF", cards: ["Mobile app"] },
  ];
  return (
    <div className="ev-scope">
      {cols.map((col) => (
        <div key={col.label} className="ev-scope-col">
          <div className="ev-scope-head">
            <span className="ev-scope-dot" style={{ background: col.dot }} />
            <span className="ev-scope-colname">{col.label}</span>
          </div>
          {col.cards.map((card) => (
            <div key={card} className="ev-scope-card">{card}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BuildLogMockup() {
  const entries = [
    { date: "May 28", title: "Shipped auth flow", tag: "Win", tc: "#15803D", bg: "rgba(21,128,61,0.10)" },
    { date: "May 27", title: "Cut AI from scope", tag: "Decision", tc: "#6D28D9", bg: "rgba(109,40,217,0.10)" },
    { date: "May 26", title: "First user signed up!", tag: "Milestone", tc: "#F0620A", bg: "rgba(240,98,10,0.10)" },
  ];
  return (
    <div className="ev-log">
      {entries.map((e, i) => (
        <div key={i} className="ev-log-entry">
          <div className="ev-log-dot" />
          <div className="ev-log-content">
            <div className="ev-log-top">
              <span className="ev-log-date">{e.date}</span>
              <span className="ev-log-tag" style={{ color: e.tc, background: e.bg }}>{e.tag}</span>
            </div>
            <span className="ev-log-title">{e.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const VISUALS = [PlanFocusMockup, ScopeMockup, BuildLogMockup];

export function EverythingYouNeed() {
  const { t } = useLanguage();
  const e = t.everything;

  return (
    <section className="section everything-section">
      <div className="container">
        <div className="section-head" data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {e.badge}
          </span>
          <WordReveal as="h2" className="h2">{e.h2}</WordReveal>
          <p className="lede">{e.subtext}</p>
        </div>

        <div className="everything-grid">
          {e.items.map((item, i) => {
            const Visual = VISUALS[i];
            return (
              <div
                className="feature-card"
                key={i}
                data-fade-scale=""
                data-fade-delay={String(i + 1)}
              >
                <div className="feature-card-visual">
                  <Visual />
                </div>
                <div className="feature-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
