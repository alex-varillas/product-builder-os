"use client";

import { useLanguage } from "./LanguageContext";
import { WordReveal } from "./WordReveal";

export function Steps() {
  const { t } = useLanguage();
  const s = t.steps;

  return (
    <section className="section section-warm">
      <div className="container">
        <div className="section-head" data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {s.badge}
          </span>
          <WordReveal as="h2" className="h2">{s.h2}</WordReveal>
          <p className="lede">{s.subtext}</p>
        </div>

        <div className="stp-flow" data-fade="" data-fade-delay="1">
          {/* Track row: animated connecting line + numbered nodes */}
          <div className="stp-row">
            <div className="stp-line" aria-hidden="true">
              <div className="stp-pulse" />
            </div>
            {s.items.map((step) => (
              <div key={step.n} className="stp-cell">
                <div className="stp-node">{step.n}</div>
              </div>
            ))}
          </div>

          {/* Text labels aligned with nodes above */}
          <div className="stp-labels">
            {s.items.map((step) => (
              <div key={step.n} className="stp-label">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
