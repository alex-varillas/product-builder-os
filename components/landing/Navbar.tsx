"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "./LanguageContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-wrap${scrolled ? " scrolled" : ""}`}>
      <div className="container nav">
        <a href="#" className="nav-brand">
          <Image
            src="/logo.png"
            alt="BoardOS"
            width={28}
            height={30}
            style={{ borderRadius: 9, flexShrink: 0 }}
            priority
          />
          <span>
            Board<span style={{ color: "var(--fg-2)", fontWeight: 400 }}>OS</span>
          </span>
        </a>

        <nav className="nav-links">
          <a className="nav-link" href="#features">{t.nav.features}</a>
          <a className="nav-link" href="#open-source">{t.nav.openSource}</a>
          <a
            className="nav-link"
            href="https://github.com/alex-varillas/product-builder-os"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="nav-right">
          <a className="btn btn-ghost-border nav-signin" href="/login">
            Sign in
          </a>
          <a className="btn btn-primary" href="#cta">
            {t.nav.startBuilding}
          </a>
        </div>
      </div>
    </header>
  );
}
