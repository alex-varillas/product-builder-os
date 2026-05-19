import { Icons } from "@/components/ui/icons";

export function MiniCanvas() {
  const rows = [
    { lbl: "Problem", val: "Users sign up and never ship their first project." },
    { lbl: "User", val: "Solo builders in their first week." },
    { lbl: "Solution", val: "3-step canvas ending with a real artifact." },
    { lbl: "Context", val: "Activation beats acquisition every time." },
  ];
  return (
    <div className="mini-l">
      {rows.map((r) => (
        <div className="mini-r" key={r.lbl}>
          <span className="mini-lbl">{r.lbl}</span>
          <span className="mini-val">{r.val}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniScope() {
  return (
    <div className="mini-sc-grid">
      <div className="mini-sc-col">
        <div className="mini-sc-h">In MVP</div>
        <div className="mini-sc-item done">
          <span className="c"><Icons.Check /></span>
          <span>Empty-state CTA</span>
        </div>
        <div className="mini-sc-item done">
          <span className="c"><Icons.Check /></span>
          <span>Canvas wizard</span>
        </div>
        <div className="mini-sc-item">
          <span className="c" />
          <span>Draft persistence</span>
        </div>
        <div className="mini-sc-item">
          <span className="c" />
          <span>Share success link</span>
        </div>
      </div>
      <div className="mini-sc-col">
        <div className="mini-sc-h">Later</div>
        <div className="mini-sc-item">
          <span className="c" />
          <span>Collaborative mode</span>
        </div>
        <div className="mini-sc-item">
          <span className="c" />
          <span>AI reframing</span>
        </div>
        <div className="mini-sc-item">
          <span className="c" />
          <span>Template market</span>
        </div>
        <div className="mini-sc-item">
          <span className="c" />
          <span>Mobile redesign</span>
        </div>
      </div>
    </div>
  );
}

export function MiniLog() {
  const rows = [
    { d: "May 17", m: "Drop welcome video, show canvas first.", tag: "violet" as const, tl: "decision" },
    { d: "May 16", m: "Step transitions fixed, drop-off gone.", tag: "green" as const, tl: "shipped" },
    { d: "May 15", m: "6/8 testers skip Problem field.", tag: "orange" as const, tl: "learning" },
    { d: "May 14", m: "Try inline examples in fields.", tag: "" as const, tl: "next" },
  ];
  return (
    <div className="mini-log-l">
      {rows.map((r, i) => (
        <div className="mini-lr" key={i}>
          <span className="d">{r.d}</span>
          <span className="m">{r.m}</span>
          <span className={`tag ${r.tag}`}>{r.tl}</span>
        </div>
      ))}
    </div>
  );
}
