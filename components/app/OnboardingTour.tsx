"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppLang } from "./AppLanguageContext";
import { modalSpring, springSoft } from "@/lib/motion";

const STORAGE_KEY = "boardos:onboarding:v3";

// data-tour attribute values → map to their DOM selector
const TOUR_TARGETS = [
  "data-tour=\"home\"",
  "data-tour=\"today\"",
  "data-tour=\"pomodoro\"",
  "data-tour=\"projects\"",
];

interface Rect { top: number; left: number; width: number; height: number; }

interface OnboardingTourProps {
  onDone: () => void;
}

export function OnboardingTour({ onDone }: OnboardingTourProps) {
  const { t } = useAppLang();
  const steps = t.onboarding.steps;
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const resizeRef = useRef<ResizeObserver | null>(null);

  const measureTarget = (stepIndex: number) => {
    const selector = `[${TOUR_TARGETS[stepIndex]}]`;
    const el = document.querySelector(selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  };

  useLayoutEffect(() => {
    measureTarget(step);
    const handler = () => measureTarget(step);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [step]);

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, "done");
    onDone();
  };

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else complete();
  };

  const back = () => { if (step > 0) setStep((s) => s - 1); };

  const PAD = 8;
  const hasRect = rect !== null;

  // Tooltip positioning: prefer below the spotlight, fallback above
  const tooltipTop = hasRect
    ? rect!.top + rect!.height + PAD + 10
    : window.innerHeight / 2 - 60;
  const tooltipLeft = hasRect
    ? Math.max(16, Math.min(rect!.left, window.innerWidth - 320))
    : window.innerWidth / 2 - 150;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none" }}>
      {/* Dimmed backdrop with spotlight hole via SVG */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "all" }}
        onClick={complete}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {hasRect && (
              <rect
                x={rect!.left - PAD}
                y={rect!.top - PAD}
                width={rect!.width + PAD * 2}
                height={rect!.height + PAD * 2}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(26, 23, 20, 0.55)"
          mask="url(#spotlight-mask)"
        />
        {/* Spotlight border ring */}
        {hasRect && (
          <rect
            x={rect!.left - PAD}
            y={rect!.top - PAD}
            width={rect!.width + PAD * 2}
            height={rect!.height + PAD * 2}
            rx={10}
            fill="none"
            stroke="rgba(240,98,10,0.5)"
            strokeWidth={1.5}
          />
        )}
      </svg>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: springSoft }}
          exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.15 } }}
          style={{
            position: "absolute",
            top: tooltipTop,
            left: tooltipLeft,
            width: 300,
            background: "#FFFFFF",
            border: "1px solid #E2DDD4",
            borderRadius: 14,
            padding: "18px 20px 16px",
            boxShadow: "0 12px 40px rgba(26,23,20,0.14)",
            pointerEvents: "all",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === step ? "#F0620A" : "#E2DDD4",
                  transition: "width 0.2s, background 0.2s",
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1714", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {steps[step].title}
          </p>
          <p style={{ fontSize: 12.5, color: "#6B6760", margin: "0 0 16px", lineHeight: 1.55 }}>
            {steps[step].body}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {step > 0 && (
                <button
                  className="app-btn"
                  style={{ fontSize: "11.5px", padding: "5px 12px" }}
                  onClick={back}
                >
                  {t.onboarding.back}
                </button>
              )}
              <button
                className="app-btn"
                style={{ fontSize: "11.5px", padding: "5px 12px", color: "var(--fg-3)" }}
                onClick={complete}
              >
                {t.onboarding.skip}
              </button>
            </div>
            <motion.button
              className="app-btn app-btn-primary"
              style={{ fontSize: "11.5px", padding: "5px 14px" }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
            >
              {step === steps.length - 1 ? t.onboarding.done : t.onboarding.next}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  // Users who completed v1 or v2 don't need to see v3
  if (localStorage.getItem("boardos:onboarding:v1") === "done") return false;
  if (localStorage.getItem("boardos:onboarding:v2") === "done") return false;
  return localStorage.getItem(STORAGE_KEY) !== "done";
}
