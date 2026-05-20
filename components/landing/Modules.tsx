"use client";

import { Icons } from "@/components/ui/icons";
import { useLanguage } from "./LanguageContext";
import { MiniCanvas, MiniScope, MiniLog } from "./ModuleMockups";

export function Modules() {
  const { t } = useLanguage();
  const m = t.modules;

  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head" data-fade="">
          <span className="eyebrow">
            <span className="dot" />
            {m.badge}
          </span>
          <h2 className="h2">{m.h2}</h2>
          <p className="lede" style={{ textAlign: "center" }}>
            {(() => {
              const idx = m.subtext.indexOf("idea →");
              if (idx === -1) return m.subtext;
              return (
                <>
                  {m.subtext.slice(0, idx)}
                  <br />
                  <span style={{ whiteSpace: "nowrap" }}>{m.subtext.slice(idx)}</span>
                </>
              );
            })()}
          </p>
        </div>

        <div className="mosaic">
          <article className="mod-card m-wide" data-accent="orange" data-fade="">
            <div className="mod-card-top">
              <div className="mod-num">Module 01</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="mod-icon orange"><Icons.Compass /></span>
                  <span className="mod-tag">{m.m1.tag}</span>
                </div>
                <h3>{m.m1.title}</h3>
                <p style={{ marginTop: 8 }}>{m.m1.desc}</p>
              </div>
            </div>
            <div className="mod-visual"><MiniCanvas /></div>
          </article>

          <article className="mod-card m-tall" data-accent="green" data-fade="" data-fade-delay="1">
            <div className="mod-card-top">
              <div className="mod-num">Module 03</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="mod-icon green"><Icons.Notebook /></span>
                  <span className="mod-tag">{m.m3.tag}</span>
                </div>
                <h3>{m.m3.title}</h3>
                <p style={{ marginTop: 8 }}>{m.m3.desc}</p>
              </div>
            </div>
            <div className="mod-visual"><MiniLog /></div>
          </article>

          <article className="mod-card m-bottom" data-accent="violet" data-fade="" data-fade-delay="2">
            <div className="mod-card-top">
              <div className="mod-num">Module 02</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="mod-icon violet"><Icons.Target /></span>
                  <span className="mod-tag">{m.m2.tag}</span>
                </div>
                <h3>{m.m2.title}</h3>
                <p style={{ marginTop: 8 }}>{m.m2.desc}</p>
              </div>
            </div>
            <div className="mod-visual"><MiniScope /></div>
          </article>
        </div>
      </div>
    </section>
  );
}
