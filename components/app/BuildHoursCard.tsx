"use client";

import { useRef, useState } from "react";
import { ProjectFocusRow } from "@/lib/analytics";
import { useAppLang } from "./AppLanguageContext";

interface BuildHoursCardProps {
  rows: ProjectFocusRow[];
  onOpenPomodoro: () => void;
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface Blob { id: string; name: string; color: string; min: number; r: number; cx: number; cy: number; }

// Triangular cluster: largest center-left, two smaller upper/lower right
const BASE_POS = [
  { cx: 0.40, cy: 0.50 },
  { cx: 0.66, cy: 0.27 },
  { cx: 0.64, cy: 0.73 },
  { cx: 0.52, cy: 0.50 },
];

function buildBlobs(rows: ProjectFocusRow[], w: number, h: number): Blob[] {
  if (!rows.length) return [];
  const sorted = [...rows].sort((a, b) => b.totalMin - a.totalMin);
  const maxMin = sorted[0].totalMin;
  const MAX_R = Math.min(w, h) * 0.40;
  const MIN_R = MAX_R * 0.28;
  return sorted.map((r, i) => {
    const pos = BASE_POS[Math.min(i, BASE_POS.length - 1)];
    return {
      id: r.projectId,
      name: r.projectName,
      color: r.projectColor,
      min: r.totalMin,
      r: MIN_R + (MAX_R - MIN_R) * Math.sqrt(r.totalMin / maxMin),
      cx: w * pos.cx,
      cy: h * pos.cy,
    };
  });
}

function getBlobOffset(b: Blob, i: number, mouse: { x: number; y: number } | null) {
  if (!mouse) return { dx: 0, dy: 0 };
  const vx = mouse.x - b.cx;
  const vy = mouse.y - b.cy;
  const dist = Math.sqrt(vx * vx + vy * vy) || 1;
  const range = 200;
  if (dist > range) return { dx: 0, dy: 0 };
  // Larger blobs (i=0) have more inertia — move less
  const strength = ((range - dist) / range) * (9 - i * 2.5);
  return { dx: (vx / dist) * strength, dy: (vy / dist) * strength };
}

export function BuildHoursCard({ rows, onOpenPomodoro }: BuildHoursCardProps) {
  const { t } = useAppLang();
  const h = t.home;

  const W = 320;
  const H = 240;
  const blobs = buildBlobs(rows, W, H);
  const totalMin = rows.reduce((s, r) => s + r.totalMin, 0);

  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width)  * W,
      y: ((e.clientY - rect.top)  / rect.height) * H,
    });
  };

  return (
    <div className="bh-card">
      <div className="bh-header">
        <span className="bh-title">{h.buildHoursTitle}</span>
        {totalMin > 0 && (
          <div className="bh-header-right">
            <span className="bh-total-val">{fmtMin(totalMin)}</span>
            <span className="bh-total-label">{h.buildHoursRange}</span>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="bh-empty">
          <p>{h.noFocusEmpty}</p>
          <button className="app-btn app-btn-primary" style={{ marginTop: 10, fontSize: "12px" }} onClick={onOpenPomodoro}>
            {h.openPomodoro}
          </button>
        </div>
      ) : (
        <div className="bh-body">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="bh-svg-main"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMouse(null)}
          >
            <defs>
              {blobs.map((b, i) => (
                <radialGradient key={i} id={`bh-rg-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={b.color} stopOpacity="0.88" />
                  <stop offset="45%"  stopColor={b.color} stopOpacity="0.60" />
                  <stop offset="80%"  stopColor={b.color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={b.color} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {blobs.map((b, i) => {
              const { dx, dy } = getBlobOffset(b, i, mouse);
              return (
                <g
                  key={b.id}
                  style={{
                    transform: `translate(${dx}px, ${dy}px)`,
                    transition: mouse
                      ? "transform 0.4s cubic-bezier(0.22, 0.68, 0, 1.2)"
                      : "transform 0.6s cubic-bezier(0.22, 0.68, 0, 1.2)",
                  }}
                >
                  {/* Soft glow blob */}
                  <ellipse
                    cx={b.cx}
                    cy={b.cy}
                    rx={b.r * 1.38}
                    ry={b.r * 1.18}
                    fill={`url(#bh-rg-${i})`}
                  />
                  {/* Time label */}
                  <text
                    x={b.cx}
                    y={b.cy - 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="bh-blob-val"
                  >
                    {fmtMin(b.min)}
                  </text>
                  {/* Project name */}
                  <text
                    x={b.cx}
                    y={b.cy + 10}
                    textAnchor="middle"
                    className="bh-blob-name"
                  >
                    {b.name.length > 10 ? b.name.slice(0, 10) + "…" : b.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="bh-legend">
            {rows.map((r) => (
              <div key={r.projectId} className="bh-legend-row">
                <span className="bh-legend-dot" style={{ background: r.projectColor }} />
                <span className="bh-legend-name">{r.projectName}</span>
                <span className="bh-legend-time">{fmtMin(r.totalMin)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
