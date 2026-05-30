"use client";

import { Icons } from "@/components/ui/icons";
import { HeroMockup } from "./HeroMockup";
import { WordReveal } from "./WordReveal";
import { useLanguage } from "./LanguageContext";

export function Hero() {
  const { t } = useLanguage();
  const h = t.hero;

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {h.badge}
          </span>
        </div>

        <h1
          className="h1 hero-h1"
          aria-label={`${h.h1[0]} ${h.h1[1]} ${h.h1[2]}`}
          style={{ maxWidth: "14ch", margin: "0 auto", textAlign: "center" }}
        >
          <WordReveal as="span" className="hero-h1-line" delay={0.04}>{h.h1[0]}</WordReveal>
          <WordReveal as="span" className="hero-h1-line" delay={0.18}>{h.h1[1]}</WordReveal>
          <WordReveal as="span" className="hero-h1-line" delay={0.30}>{h.h1[2]}</WordReveal>
        </h1>

        <p
          className="lede"
          data-fade=""
          data-fade-delay="2"
          style={{ textAlign: "center", maxWidth: "48ch" }}
        >
          {h.subtext}
        </p>

        <div className="hero-ctas" data-fade="" data-fade-delay="3">
          <a className="btn-pill btn-pill-primary btn-pill-lg" href="/signup">
            {h.ctaPrimary} <Icons.Arrow />
          </a>
          <a
            className="btn-pill btn-pill-secondary btn-pill-lg"
            href="https://github.com/alex-varillas/product-builder-os"
            target="_blank"
            rel="noreferrer"
          >
            <Icons.Github /> {h.ctaGithub}
          </a>
        </div>

        <div className="hero-proof" data-fade="" data-fade-delay="4">
          <span>{h.proof[0]}</span>
          <span className="sep" />
          <span>{h.proof[1]}</span>
          <span className="sep" />
          <span>{h.proof[2]}</span>
        </div>

        <div className="hero-frame" data-fade="" data-fade-delay="5">
          <div className="mockup-shadow">
            <HeroMockup />
          </div>
          <div className="hero-mockup-pill">
            <span className="hmp-dot" />
            <span>Focus</span>
            <span className="hmp-sep" />
            <span className="hmp-timer">24:38 left</span>
            <span className="hmp-sep" />
            <span className="hmp-muted">BoardOS · Build log</span>
          </div>
        </div>
      </div>
    </section>
  );
}
