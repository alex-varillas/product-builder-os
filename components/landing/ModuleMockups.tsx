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
