"use client";

import { CSSProperties, useEffect, useRef } from "react";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

interface WordRevealProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  as?: Tag;
  delay?: number;
}

export function WordReveal({ children, className = "", style, as: Tag = "h1", delay = 0 }: WordRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLSpanElement>(".wr-word").forEach((span) => {
            span.classList.add("wr-visible");
          });
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = children.split(" ");

  return (
    // @ts-expect-error — dynamic tag ref typing
    <Tag ref={ref} className={`wr-root ${className}`} style={style} aria-label={children}>
      {words.map((word, i) => (
        <span
          key={i}
          className="wr-word"
          aria-hidden="true"
          style={{ transitionDelay: `${(delay + i * 0.055).toFixed(3)}s` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
