"use client";

import { ProjectFocusRow } from "@/lib/analytics";
import { useAppLang } from "./AppLanguageContext";

interface ActiveProjectsCardProps {
  rows: ProjectFocusRow[];
  onOpenProject: (projectId: string) => void;
  onOpenAll: () => void;
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

const SEG_COUNT = 10;

export function ActiveProjectsCard({ rows, onOpenProject, onOpenAll }: ActiveProjectsCardProps) {
  const { t } = useAppLang();
  const maxMin = Math.max(1, ...rows.map((r) => r.totalMin));

  return (
    <div className="ap-card">
      <div className="ap-header">
        <span className="ap-title">{t.home.activeProjectsTitle}</span>
        <button className="ap-open-all" onClick={onOpenAll}>{t.home.openAll}</button>
      </div>

      {rows.length === 0 ? (
        <div className="ap-empty">—</div>
      ) : (
        <div className="ap-rows">
          {rows.map((r) => {
            const pct = r.totalMin / maxMin;
            const filledSegs = Math.round(pct * SEG_COUNT);
            const initial = r.projectName[0]?.toUpperCase() ?? "?";

            return (
              <div key={r.projectId} className="ap-row" onClick={() => onOpenProject(r.projectId)}>
                <div
                  className="ap-avatar"
                  style={{ background: `${r.projectColor}25`, color: r.projectColor }}
                >
                  {initial}
                </div>
                <div className="ap-info">
                  <div className="ap-name">{r.projectName}</div>
                  <div className="ap-sub">{t.home.focusThisWeek}</div>
                </div>
                <div className="ap-stats">
                  <span className="ap-stats-time">{fmtMin(r.totalMin)}</span>
                  <div className="ap-seg-bar">
                    {Array.from({ length: SEG_COUNT }, (_, i) => (
                      <div
                        key={i}
                        className="ap-seg"
                        style={{
                          background: i < filledSegs ? r.projectColor : "var(--bg-stone)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
