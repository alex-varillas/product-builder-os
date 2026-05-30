"use client";

import { useLanguage } from "./LanguageContext";
import { WordReveal } from "./WordReveal";
import { MiniCanvas, MiniScope, MiniLog } from "./ModuleMockups";

function BulletIcon() {
  return (
    <span className="pp-bullet-icon">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,6 5,9 10,3" />
      </svg>
    </span>
  );
}

export function PerProject() {
  const { t } = useLanguage();
  const pp = t.perProject;

  const rows = [
    { key: "canvas", flip: false, mock: <MiniCanvas />, title: pp.canvas.title, desc: pp.canvas.desc, bullets: pp.canvas.bullets },
    { key: "scope",  flip: true,  mock: <MiniScope />,  title: pp.scope.title,  desc: pp.scope.desc,  bullets: pp.scope.bullets  },
    { key: "log",    flip: false, mock: <MiniLog />,    title: pp.log.title,    desc: pp.log.desc,    bullets: pp.log.bullets    },
  ];

  return (
    <section className="section" id="per-project">
      <div className="container">
        <div className="section-head" data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {pp.badge}
          </span>
          <WordReveal as="h2" className="h2">{pp.h2}</WordReveal>
          <p className="lede" style={{ textAlign: "center" }}>{pp.subtext}</p>
        </div>

        <div className="pp-rows">
          {rows.map((r, i) => (
            <div className={`pp-row${r.flip ? " flip" : ""}`} key={r.key}>
              {/* Mock side — badge is absolute-positioned on this column */}
              <div
                className="pp-mock-col"
                data-fade-left={!r.flip ? "" : undefined}
                data-fade-right={r.flip ? "" : undefined}
              >
                <div className="pp-mock-frame">{r.mock}</div>
                <div className="pp-num-badge">{i + 1}</div>
              </div>

              {/* Text side */}
              <div
                className="pp-text-col"
                data-fade-right={!r.flip ? "" : undefined}
                data-fade-left={r.flip ? "" : undefined}
              >
                <h3 className="pp-title">{r.title}</h3>
                <p className="pp-subtitle">{r.desc}</p>
                <ul className="pp-bullets">
                  {r.bullets.map((b, bi) => (
                    <li className="pp-bullet" key={bi}>
                      <BulletIcon />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
