"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { useLanguage } from "./LanguageContext";
import { WordReveal } from "./WordReveal";

const SNIPPET =
  "git clone https://github.com/alex-varillas/product-builder-os.git\nnpm install && npm run dev";

export function OpenSource() {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const os = t.openSource;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <section className="section" id="open-source">
      <div className="container os-wrap">
        <div className="os-left" data-fade-left="">
          <span className="eyebrow">
            <span
              className="dot"
              style={{
                background: "var(--green)",
                boxShadow: "0 0 0 3px var(--green-ring)",
              }}
            />
            {os.badge}
          </span>

          <div>
            <WordReveal as="h2" className="h2" delay={0}>{os.h2[0]}</WordReveal>
            <WordReveal as="h2" className="h2" delay={0.1}>{os.h2[1]}</WordReveal>
          </div>

          <p className="lede">{os.subtext}</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              className="btn btn-primary"
              href="https://github.com/alex-varillas/product-builder-os"
              target="_blank"
              rel="noreferrer"
            >
              <Icons.Github /> {os.ctaGithub} <Icons.Arrow />
            </a>
            <a
              className="btn btn-secondary"
              href="https://github.com/alex-varillas/product-builder-os#readme"
              target="_blank"
              rel="noreferrer"
            >
              <Icons.Doc />
              {os.ctaDocs}
            </a>
          </div>

          <div className="os-stats">
            <div className="os-stat">
              <div className="n">0</div>
              <div className="l">{os.stats[0]}</div>
            </div>
            <div className="os-stat">
              <div className="n">0</div>
              <div className="l">{os.stats[1]}</div>
            </div>
            <div className="os-stat">
              <div className="n">MIT</div>
              <div className="l">{os.stats[2]}</div>
            </div>
          </div>
        </div>

        <div data-fade-right="" data-fade-delay="1">
          <div className="terminal terminal-brown">
            <div className="terminal-bar">
              <div className="tl-dots">
                <span className="tl-dot r" />
                <span className="tl-dot y" />
                <span className="tl-dot g" />
              </div>
              <span className="ttl">~ / boardos — zsh</span>
              <button
                className={`copy-btn${copied ? " ok" : ""}`}
                onClick={onCopy}
              >
                <Icons.Copy />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="terminal-body">
              <div>
                <span className="p">$ </span>
                <span className="c">
                  git clone https://github.com/alex-varillas/product-builder-os.git
                </span>
              </div>
              <div className="o">Cloning into &apos;product-builder-os&apos;...</div>
              <div className="o">remote: Enumerating objects: 4,219, done.</div>
              <div className="o">Resolving deltas: 100% (2,184/2,184), done.</div>
              <div>
                <span className="p">$ </span>
                <span className="c">cd product-builder-os</span>
              </div>
              <div>
                <span className="p">$ </span>
                <span className="c">npm install &amp;&amp; npm run dev</span>
              </div>
              <div className="o">added 412 packages in 9s</div>
              <div>
                <span className="ok">✓</span>{" "}
                <span className="o">ready in</span>{" "}
                <span className="ac"> 820ms</span>
              </div>
              <div className="o">
                → Local:&nbsp;&nbsp;
                <span style={{ color: "rgba(255,255,255,0.75)" }}>
                  http://localhost:3000
                </span>
                <span className="cursor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
