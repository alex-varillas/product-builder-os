"use client";

import { Icons } from "@/components/ui/icons";
import { useLanguage } from "./LanguageContext";

const SCATTERED = [
  "Untitled Note (3)",
  "slack-export.txt",
  "/desktop/ideas-2025",
  "voice-memo-04.m4a",
  "v3-final-final.fig",
  "random-google-doc.docx",
];

export function Problem() {
  const { t } = useLanguage();
  const p = t.problem;

  return (
    <section className="section section-warm">
      <div className="container">
        <div className="problem-inner">
          <div data-fade="">
            <span className="eyebrow">
              <span
                className="dot"
                style={{
                  background: "var(--violet)",
                  boxShadow: "0 0 0 3px rgba(109,40,217,0.18)",
                }}
              />
              {p.badge}
            </span>
          </div>

          <h2 className="h2" data-fade="" data-fade-delay="1" style={{ marginTop: 22 }}>
            {p.h2}
          </h2>

          <p
            className="lede"
            data-fade=""
            data-fade-delay="2"
            style={{ margin: "20px auto 0" }}
          >
            {p.subtext}
          </p>

          <div className="problem-scatter" data-fade="" data-fade-delay="3">
            {SCATTERED.map((f) => (
              <span className="scatter-pill" key={f}>
                <Icons.Doc />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
