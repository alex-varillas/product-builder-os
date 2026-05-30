/* ─── MiniHome ─── */
const MINI_PROJECTS = [
  { name: "BoardOS", color: "#F0620A", w: 36, h: 36, min: 330 },
  { name: "Asistia", color: "#6D28D9", w: 28, h: 28, min: 495 },
  { name: "Reflow",  color: "#15803D", w: 20, h: 20, min: 60  },
] as const;
const MINI_MAX = Math.max(...MINI_PROJECTS.map((p) => p.min));

const MINI_CAL_ROWS = [
  ["",   "",   "",   "",   "x",  "x",  ""],
  ["",   "",   "f",  "f",  "f",  "",   ""],
  ["",   "",   "f",  "f",  "",   "",   ""],
  ["",   "f",  "f",  "f",  "f",  "",   ""],
  ["f",  "t",  "",   "",   "",   "",   ""],
];

// Semicircle arc gauge — matches the real app
function MiniArcSVG() {
  const R = 22; const ARC = Math.PI * R;
  const path = `M 5 30 A ${R} ${R} 0 0 1 49 30`;
  return (
    <svg width="54" height="34" viewBox="0 0 54 34">
      <defs>
        <linearGradient id="mnh-fg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1A1714" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="var(--border)" strokeWidth="5" strokeLinecap="round" />
      <path d={path} fill="none" stroke="url(#mnh-fg)" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${0.66 * ARC} ${ARC}`} />
    </svg>
  );
}

// Organic overlapping blobs — matches the real app's Build Hours
function MiniBlobs() {
  const blobs = [
    { color: "#6D28D9", cx: 62, cy: 30, r: 22, label: "8h" },
    { color: "#F0620A", cx: 38, cy: 40, r: 18, label: "5h" },
    { color: "#15803D", cx: 58, cy: 56, r: 12, label: "1h" },
  ];
  return (
    <svg viewBox="0 0 110 80" className="mnh-blob-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        {blobs.map((b, i) => (
          <radialGradient key={i} id={`mnh-bl-${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={b.color} stopOpacity="0.9" />
            <stop offset="45%" stopColor={b.color} stopOpacity="0.6" />
            <stop offset="80%" stopColor={b.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={b.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {blobs.map((b, i) => (
        <g key={i}>
          <ellipse className="hm-blob" style={{ animationDelay: `${i * 1.4}s` }}
            cx={b.cx} cy={b.cy} rx={b.r * 1.4} ry={b.r * 1.18} fill={`url(#mnh-bl-${i})`} />
          <text x={b.cx} y={b.cy + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="var(--font-geist-mono), monospace">{b.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function MiniHome() {
  return (
    <div className="mnh-wrap">
      {/* Build Hours */}
      <div className="mnh-cell">
        <div className="mnh-label">Build Hours</div>
        <div className="mnh-blobs"><MiniBlobs /></div>
      </div>
      {/* Mini Calendar — clean light */}
      <div className="mnh-cell">
        <div className="mnh-label">Building Days</div>
        <div className="mnh-cal">
          {MINI_CAL_ROWS.map((row, ri) =>
            row.map((d, ci) => (
              <div key={`${ri}-${ci}`} className={`mnh-dot${d === "f" ? " on" : d === "t" ? " now" : ""}`} />
            ))
          )}
        </div>
      </div>
      {/* Focus Goal */}
      <div className="mnh-cell">
        <div className="mnh-label">Focus</div>
        <div className="mnh-ring-row">
          <MiniArcSVG />
          <div>
            <div className="mnh-ring-val">3h 20m</div>
            <div className="mnh-ring-sub">goal 5h</div>
          </div>
        </div>
      </div>
      {/* Active Projects */}
      <div className="mnh-cell">
        <div className="mnh-label">Projects</div>
        {MINI_PROJECTS.map((p) => (
          <div key={p.name} className="mnh-proj-row">
            <span className="mnh-proj-dot" style={{ background: p.color }} />
            <div className="mnh-proj-bar-wrap">
              <div className="mnh-proj-bar" style={{ width: `${(p.min / MINI_MAX) * 100}%`, background: p.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MiniToday ─── */
const WEEK_DAYS = [
  { label: "M", num: "25" },
  { label: "T", num: "26", active: true },
  { label: "W", num: "27" },
  { label: "T", num: "28" },
  { label: "F", num: "29" },
  { label: "S", num: "30" },
  { label: "S", num: "31" },
] as const;

export function MiniToday() {
  return (
    <div className="mnt-wrap">
      <div className="mnt-week-strip">
        {WEEK_DAYS.map((d) => (
          <div key={d.num} className="mnt-day">
            <span className="mnt-day-label">{d.label}</span>
            <span className={`mnt-day-num${"active" in d && d.active ? " active" : ""}`}>{d.num}</span>
          </div>
        ))}
      </div>
      <div className="mnt-timeline">
        <div className="mnt-block" style={{ background: "#F0620A" }}>Auth flow · 9:00–10:30</div>
        <div className="mnt-block" style={{ background: "#6D28D9" }}>DB schema · 11:00–12:00</div>
        <div className="mnt-block" style={{ background: "#15803D", flex: 1, minHeight: 20 }}>Deploy prep · 14:00–</div>
      </div>
      <div className="mnt-pomo-bar">
        <span className="mnt-pomo-dot hm-pomo-live" />
        <span className="mnt-pomo-txt">Focus session</span>
        <span className="mnt-pomo-time">25:00</span>
      </div>
    </div>
  );
}

/* ─── MiniPomo ─── */
export function MiniPomo() {
  return (
    <div className="mnp-wrap">
      <div className="mnp-tabs">
        <div className="mnp-tab active">Focus</div>
        <div className="mnp-tab">Rest</div>
      </div>
      <div className="mnp-time">24<span className="mnp-colon">:</span>32</div>
      <div className="mnp-btns">
        <div className="mnp-btn mnp-btn-primary">Start</div>
        <div className="mnp-btn mnp-btn-secondary">Reset</div>
      </div>
      <div className="mnp-ctx">BoardOS · Auth flow</div>
    </div>
  );
}

/* ─── MiniProjectOverview ─── */
const PO_CANVAS = [
  { slot: "Problem",  text: "Founders maintain scattered notes that never reflect actual product thinking." },
  { slot: "User",     text: "Solo founders and indie hackers, 0–5 team, building tools they'd use themselves." },
  { slot: "Solution", text: "Structured workspace that captures decisions, scopes MVPs, and tracks shipped work." },
  { slot: "Context",  text: "AI tools are growing but product clarity is getting worse. Builders need structure." },
];
const PO_LOG = [
  { type: "shipped",  tColor: "#15803D", tBg: "#E8F5EE", text: "Connected Supabase auth — email, Google and GitHub all working." },
  { type: "decision", tColor: "#6D28D9", tBg: "#F0EAFF", text: "Dropped timeline view from v0.2. Too much scope, not enough clarity." },
  { type: "insight",  tColor: "#F0620A", tBg: "#FEF0E8", text: "Users want to see the why alongside the what. Surface hypothesis tags." },
];

export function MiniProjectOverview() {
  return (
    <div className="mnpo-wrap">
      <div className="mnpo-header">
        <span className="mnpo-color" style={{ background: "#F0620A" }} />
        <span className="mnpo-name">BoardOS</span>
        <span className="mnpo-badge">Active</span>
      </div>
      <div className="mnpo-body">
        <div className="mnpo-canvas-col">
          <div className="mnpo-section-title">Idea Canvas</div>
          <div className="mnpo-canvas-grid">
            {PO_CANVAS.map((c) => (
              <div key={c.slot} className="mnpo-canvas-card">
                <div className="mnpo-canvas-slot">{c.slot}</div>
                <p className="mnpo-canvas-text">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mnpo-log-col">
          <div className="mnpo-section-title">Build Log</div>
          {PO_LOG.map((e, i) => (
            <div key={i} className="mnpo-log-entry">
              <span className="mnpo-log-type" style={{ color: e.tColor, background: e.tBg }}>{e.type}</span>
              <p className="mnpo-log-text">{e.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Legacy module mockups ─── */

export function MiniCanvas() {
  const cards = [
    { slot: "Problem",  badge: "core",       bColor: "#F0620A", bBg: "#FEF0E8", text: "Founders spend hours maintaining scattered notes that never reflect actual product thinking." },
    { slot: "User",     badge: "hypothesis", bColor: "#6D28D9", bBg: "#F0EAFF", text: "Solo founders and indie hackers, 0–5 team size, building tools they would use themselves." },
    { slot: "Solution", badge: "core",       bColor: "#F0620A", bBg: "#FEF0E8", text: "A structured workspace that captures decisions, scopes MVPs, and tracks shipped work in one view." },
    { slot: "Context",  badge: "signal",     bColor: "#15803D", bBg: "#E8F5EE", text: "AI tools are proliferating but product clarity is getting worse. Builders need structure, not more features." },
  ];

  return (
    <div className="mnc-grid">
      {cards.map((c) => (
        <div className="mnc-card" key={c.slot}>
          <div className="mnc-head">
            <span className="mnc-slot">{c.slot}</span>
            <span className="mnc-badge" style={{ color: c.bColor, background: c.bBg }}>{c.badge}</span>
          </div>
          <p className="mnc-text">{c.text}</p>
          <div className="mnc-foot">
            <span className="mnc-ts">updated just now</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniScope() {
  const cols = [
    {
      label: "Core MVP", color: "#F0620A",
      items: [
        { name: "Idea Canvas view",    pri: "P1", done: true  },
        { name: "Sidebar navigation",  pri: "P1", done: true  },
        { name: "Inline card editing", pri: "P1", done: false },
        { name: "Build Log entries",   pri: "P2", done: false },
      ],
    },
    {
      label: "Later", color: "#6D28D9",
      items: [
        { name: "Ideas inbox",       pri: "P2", done: false },
        { name: "Export Markdown",   pri: "P3", done: false },
      ],
    },
    {
      label: "Not Now", color: "#A09D97",
      items: [
        { name: "AI Reframe",       pri: "P1", done: false },
        { name: "Team collab",      pri: "P2", done: false },
      ],
    },
    {
      label: "To Validate", color: "#0D9488",
      items: [
        { name: "Public pages",    pri: "P2", done: false },
        { name: "Weekly digest",   pri: "P3", done: false },
      ],
    },
  ];

  return (
    <div className="mnsc-board">
      {cols.map((col) => (
        <div className="mnsc-col" key={col.label}>
          <div className="mnsc-head">
            <span className="mnsc-dot" style={{ background: col.color }} />
            <span className="mnsc-label">{col.label}</span>
            <span className="mnsc-count">{col.items.length}</span>
          </div>
          <div className="mnsc-items">
            {col.items.map((item) => (
              <div className={`mnsc-item${item.done ? " done" : ""}`} key={item.name}>
                <span className="mnsc-name">{item.name}</span>
                <span className="mnsc-pri" style={{ color: col.color }}>{item.pri}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniLog() {
  const entries = [
    { date: "May 19", type: "shipped",  tColor: "#15803D", tBg: "#E8F5EE", text: "Connected Supabase auth. Email, Google, and GitHub all working." },
    { date: "May 18", type: "decision", tColor: "#6D28D9", tBg: "#F0EAFF", text: "Dropped timeline view from v0.2. Too much scope, not enough clarity." },
    { date: "May 17", type: "shipped",  tColor: "#15803D", tBg: "#E8F5EE", text: "Shipped sidebar navigation and project switching. Clean, no clutter." },
    { date: "May 15", type: "insight",  tColor: "#F0620A", tBg: "#FEF0E8", text: "Users want to see the why alongside the what. Surface hypothesis tags more." },
    { date: "May 14", type: "idea",     tColor: "#0D9488", tBg: "#E6F7F6", text: "2x2 grid for the canvas feels right. Problem, User, Solution, Context." },
    { date: "May 12", type: "decision", tColor: "#6D28D9", tBg: "#F0EAFF", text: "Keeping MVP scope to 4 columns only. No drag-and-drop in v0.1." },
    { date: "May 10", type: "shipped",  tColor: "#15803D", tBg: "#E8F5EE", text: "First version of Idea Canvas live. Cards are editable with badge picker." },
  ];

  return (
    <div className="mnl-list">
      {entries.map((e, i) => (
        <div className="mnl-entry" key={i}>
          <div className="mnl-entry-top">
            <span className="mnl-type" style={{ color: e.tColor, background: e.tBg }}>{e.type}</span>
            <span className="mnl-date">{e.date}</span>
          </div>
          <p className="mnl-text">{e.text}</p>
        </div>
      ))}
    </div>
  );
}
