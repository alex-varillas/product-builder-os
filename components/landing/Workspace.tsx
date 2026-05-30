"use client";

import { useLanguage } from "./LanguageContext";
import { WordReveal } from "./WordReveal";
import { MiniProjectOverview, MiniToday, MiniPomo } from "./ModuleMockups";

export function Workspace() {
  const { t } = useLanguage();
  const w = t.workspace;

  const rows = [
    { key: "home",  mock: <MiniProjectOverview />,  tag: w.home.tag,  title: w.home.title,  desc: w.home.desc  },
    { key: "today", mock: <MiniToday />, tag: w.today.tag, title: w.today.title, desc: w.today.desc },
    { key: "pomo",  mock: <MiniPomo />,  tag: w.pomo.tag,  title: w.pomo.title,  desc: w.pomo.desc  },
  ];

  return (
    <section className="section" id="workspace">
      <div className="container">
        <div className="section-head" data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {w.badge}
          </span>
          <WordReveal as="h2" className="h2">{w.h2}</WordReveal>
          <p className="lede" style={{ textAlign: "center" }}>{w.subtext}</p>
        </div>

        <div className="ws-frame" data-fade="" data-fade-delay="1">
          {rows.map((row) => (
            <div key={row.key} className="ws-row">
              <div className="ws-text">
                <span className="ws-tag">{row.tag}</span>
                <h3 className="ws-row-title">{row.title}</h3>
                <p className="ws-row-desc">{row.desc}</p>
                <a className="ws-explore" href="/signup">
                  Explore {row.tag} <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="ws-visual">
                {row.mock}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
