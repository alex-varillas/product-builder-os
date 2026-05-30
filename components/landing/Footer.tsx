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
                width={72}
                height={24}
                style={{ flexShrink: 0 }}
              />
            </a>
            <p className="tagline">{f.tagline}</p>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/alex-varillas/product-builder-os"
              target="_blank"
              rel="noreferrer"
            >
              <Icons.Github />
              GitHub
            </a>
            <a
              href="https://github.com/alex-varillas/product-builder-os#readme"
              target="_blank"
              rel="noreferrer"
            >
              <Icons.Doc />
              {f.docs}
            </a>
            <a
              href="https://github.com/alex-varillas/product-builder-os/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
            >
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
