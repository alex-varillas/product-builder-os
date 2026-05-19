"use client";

import { Icons } from "@/components/ui/icons";
import { HeroMockup } from "./HeroMockup";
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

        <h1 className="h1" data-fade="" data-fade-delay="1" style={{ maxWidth: "16ch" }}>
          {h.h1[0]}
          <br />
          {h.h1[1]}
          <br />
          {h.h1[2]}
        </h1>

        <p
          className="lede"
          data-fade=""
          data-fade-delay="2"
          style={{ textAlign: "center", maxWidth: "56ch" }}
        >
          {h.subtext}
        </p>

        <div className="hero-ctas" data-fade="" data-fade-delay="3">
          <a className="btn btn-primary btn-lg" href="#cta">
            {h.ctaPrimary} <Icons.Arrow />
          </a>
          <a
            className="btn btn-secondary btn-lg"
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
        </div>

        <div className="hero-frame" data-fade="" data-fade-delay="5">
          <div className="mockup-shadow">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
