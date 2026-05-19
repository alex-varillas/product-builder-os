"use client";

import { useLanguage } from "./LanguageContext";

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
          <h2 className="h2">{s.h2}</h2>
        </div>

        <div className="steps-grid">
          {s.items.map((step, i) => (
            <div
              className="step-card"
              key={step.n}
              data-fade=""
              data-fade-delay={String(i + 1)}
            >
              <div className="step-n">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
