"use client";

import { Icons } from "@/components/ui/icons";
import { useLanguage } from "./LanguageContext";
import { WordReveal } from "./WordReveal";

export function FinalCta() {
  const { t } = useLanguage();
  const c = t.cta;

  return (
    <section className="section" id="cta">
      <div className="container">
        <div className="cta-wrap" data-fade="">
          {/* Geometric angular lines decoration */}
          <svg className="cta-geo" aria-hidden="true" viewBox="0 0 1280 420" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <path d="M 0 70 L 210 380 L 0 380" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
            <path d="M 0 140 L 130 380 L 0 380" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
            <path d="M 0 20 L 280 400 L 0 400" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
            <path d="M 1280 70 L 1070 380 L 1280 380" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
            <path d="M 1280 140 L 1150 380 L 1280 380" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
            <path d="M 1280 20 L 1000 400 L 1280 400" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
          </svg>

          <span className="cta-hook" aria-hidden="true">✦</span>
          <span className="eyebrow">
            <span className="dot" />
            {c.badge}
          </span>
          <WordReveal as="h2" className="h2" style={{ marginTop: 22 }}>{c.h2}</WordReveal>
          <p>{c.subtext}</p>
          <a className="btn-pill btn-pill-primary btn-pill-xl" href="/signup">
            {c.cta} <Icons.Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
