"use client";

import { Icons } from "@/components/ui/icons";
import { useLanguage } from "./LanguageContext";

export function FinalCta() {
  const { t } = useLanguage();
  const c = t.cta;

  return (
    <section className="section" id="cta">
      <div className="container">
        <div className="cta-wrap" data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {c.badge}
          </span>
          <h2 className="h2" style={{ marginTop: 22, fontWeight: 600 }}>{c.h2}</h2>
          <p>{c.subtext}</p>
          <a className="btn btn-primary btn-xl" href="#">
            {c.cta} <Icons.Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
