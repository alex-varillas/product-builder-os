"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";

export function Navbar() {
  const { t } = useLanguage();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lnav${hidden ? " lnav--hidden" : ""}`}>
      <div className="lnav-inner">
        <a className="lnav-brand" href="/">
          <Image src="/logo.png" alt="BoardOS" width={58} height={19} priority />
        </a>

        <nav className="lnav-links">
          <a href="#workspace">{t.nav.workspace}</a>
          <a href="#open-source">{t.nav.openSource}</a>
          <a
            href="https://github.com/alex-varillas/product-builder-os"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="lnav-actions">
          <a className="lnav-signin" href="/login">Sign in</a>
          <a className="btn-pill btn-pill-primary btn-pill-sm" href="/signup">
            {t.nav.startBuilding}
          </a>
        </div>
      </div>
    </header>
  );
}
