"use client";

export function AppSkeleton() {
  return (
    <div className="sk-shell">
      {/* Sidebar */}
      <aside className="sk-sidebar">
        <div className="skel sk-logo" />
        <div className="sk-nav">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skel sk-nav-item" style={{ animationDelay: `${i * 0.09}s` }} />
          ))}
        </div>
      </aside>

      {/* Content */}
      <div className="sk-content">
        {/* Greeting */}
        <div className="sk-greeting">
          <div className="skel sk-greeting-h" />
          <div className="skel sk-greeting-sub" style={{ animationDelay: "0.07s" }} />
        </div>

        {/* Grid */}
        <div className="sk-grid">
          {/* Build Hours */}
          <div className="sk-card sk-cell-bh">
            <div className="skel" style={{ height: 12, width: 110, borderRadius: 6, animationDelay: "0.04s" }} />
            <div className="sk-bh-blobs">
              <div className="skel sk-blob" style={{ width: 120, height: 120, left: "30%", top: "50%", transform: "translate(-50%,-50%)", animationDelay: "0.12s" }} />
              <div className="skel sk-blob" style={{ width: 88,  height: 88,  left: "58%", top: "27%", transform: "translate(-50%,-50%)", animationDelay: "0.22s" }} />
              <div className="skel sk-blob" style={{ width: 78,  height: 78,  left: "61%", top: "70%", transform: "translate(-50%,-50%)", animationDelay: "0.32s" }} />
            </div>
          </div>

          {/* Calendar */}
          <div className="sk-card sk-cell-cal">
            <div className="skel sk-cal-header" style={{ height: 13, width: 100, borderRadius: 6, marginBottom: 10, animationDelay: "0.06s" }} />
            <div className="sk-cal-grid">
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="skel sk-cal-cell" style={{ animationDelay: `${0.05 + i * 0.012}s` }} />
              ))}
            </div>
          </div>

          {/* Focus Goal */}
          <div className="sk-card sk-cell-fg">
            <div className="skel" style={{ height: 12, width: 90, borderRadius: 6, animationDelay: "0.08s" }} />
            <div className="sk-arc-wrap">
              <div className="sk-arc" />
            </div>
          </div>

          {/* Build Log */}
          <div className="sk-card sk-cell-log">
            <div className="skel" style={{ height: 12, width: 80, borderRadius: 6, animationDelay: "0.05s" }} />
            <div className="sk-log-rows">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="skel"
                  style={{ height: 15, borderRadius: 6, width: `${86 - i * 10}%`, animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
