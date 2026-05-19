"use client";

import Image from "next/image";
import { Icons } from "@/components/ui/icons";
import { useLanguage } from "./LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-brand">
              <Image
                src="/logo.png"
                alt="BoardOS"
                width={32}
                height={32}
                style={{ borderRadius: 8, flexShrink: 0 }}
              />
              <span>
                Board<span style={{ color: "var(--fg-2)", fontWeight: 400 }}>OS</span>
              </span>
            </a>
            <p className="tagline">{f.tagline}</p>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/alexvarillas/product-builder-os"
              target="_blank"
              rel="noreferrer"
            >
              <Icons.Github />
              GitHub
            </a>
            <a href="#">
              <Icons.Doc />
              {f.docs}
            </a>
            <a href="#">
              <Icons.Scale />
              {f.license}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{f.copyright}</span>
          <span className="pulse-wrap">
            <span className="pulse" />
            {f.status}
          </span>
        </div>
      </div>
    </footer>
  );
}
