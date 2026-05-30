"use client";

import { RecentLogEntry } from "@/lib/analytics";
import { useAppLang } from "./AppLanguageContext";

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  shipped:  { bg: "rgba(21,128,61,0.12)",   color: "#15803D" },
  decision: { bg: "rgba(109,40,217,0.10)",  color: "#6D28D9" },
  insight:  { bg: "rgba(240,98,10,0.10)",   color: "#F0620A" },
  idea:     { bg: "rgba(160,157,151,0.12)", color: "#A09D97" },
};

function relTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export function BuildLogPreviewCard({ entries, onViewAll }: {
  entries: RecentLogEntry[];
  onViewAll: () => void;
}) {
  const { t } = useAppLang();
  const h = t.home;

  return (
    <div className="bl-card">
      <div className="bl-header">
        <span className="bl-title">{h.recentLogTitle}</span>
        <button className="bl-view-all" onClick={onViewAll}>{h.viewAll} →</button>
      </div>
      <div className="bl-rows">
        {entries.length === 0 ? (
          <div className="bl-empty">No log entries yet</div>
        ) : entries.map((e) => {
          const ts = TYPE_STYLES[e.type] ?? TYPE_STYLES.idea;
          return (
            <div key={e.id} className="bl-row">
              <div className="bl-row-top">
                <span className="bl-type" style={{ background: ts.bg, color: ts.color }}>
                  {t.log.types[e.type as keyof typeof t.log.types] ?? e.type}
                </span>
                <span className="bl-proj">
                  <span className="bl-proj-dot" style={{ background: e.projectColor }} />
                  {e.projectName}
                </span>
                <span className="bl-time">{relTime(e.createdAt)}</span>
              </div>
              <div className="bl-content">{e.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
