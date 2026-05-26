// Graph build logic for the Map view.
// Auto edges form a structural backbone (item → hub → root) + affinity edges
// (canvas badge label matches log entry type). Manual edges come from node_links.

export type NodeKind = "canvas" | "mvp" | "log" | "hub" | "root";
export type EdgeKind = "structural" | "affinity" | "manual";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  color: string;
  subLabel?: string;
  // Mutable physics position (set by d3-force simulation)
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  // Populated by d3-force after simulation resolves id→node
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CanvasCardInput {
  id: string;
  slot: string;
  title: string;
  badge: string;
}

export interface MVPItemInput {
  id: string;
  name: string;
  column: string;
}

export interface LogEntryInput {
  id: string;
  text: string;
  type: string;
}

export interface NodeLinkInput {
  id: string;
  source_kind: "canvas" | "mvp" | "log";
  source_id: string;
  target_kind: "canvas" | "mvp" | "log";
  target_id: string;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  canvas:  "#F0620A",
  mvp:     "#6D28D9",
  log:     "#15803D",
  hub:     "#A09D97",
  root:    "#1A1714",
};

const FIXED_LABELS: Record<string, string> = {
  problem:  "Problem",
  user:     "User",
  solution: "Solution",
  context:  "Context",
};

// ─── buildGraph ───────────────────────────────────────────────────────────────

export function buildGraph(
  projectName: string,
  canvasCards: CanvasCardInput[],
  mvpItems: MVPItemInput[],
  logEntries: LogEntryInput[],
  manualLinks: NodeLinkInput[],
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  let edgeCounter = 0;
  const edgeId = () => `e${edgeCounter++}`;

  // Hub + root nodes
  const rootId = "root";
  const hubCanvas = "hub-canvas";
  const hubMvp = "hub-mvp";
  const hubLog = "hub-log";

  nodes.push(
    { id: rootId,    kind: "root", label: projectName, color: COLORS.root,   x: 0, y: 0 },
    { id: hubCanvas, kind: "hub",  label: "Canvas",     color: COLORS.canvas, x: -200, y: -100 },
    { id: hubMvp,    kind: "hub",  label: "Scope",      color: COLORS.mvp,   x: 200,  y: -100 },
    { id: hubLog,    kind: "hub",  label: "Log",        color: COLORS.log,   x: 0,    y: 200  },
  );

  // Hub → root structural edges
  edges.push(
    { id: edgeId(), source: hubCanvas, target: rootId, kind: "structural" },
    { id: edgeId(), source: hubMvp,   target: rootId, kind: "structural" },
    { id: edgeId(), source: hubLog,   target: rootId, kind: "structural" },
  );

  // Canvas card nodes
  for (const card of canvasCards) {
    const nodeId = `canvas-${card.id}`;
    const label = FIXED_LABELS[card.slot] ?? card.title ?? card.slot;
    nodes.push({ id: nodeId, kind: "canvas", label, subLabel: card.badge, color: COLORS.canvas, x: 0, y: 0 });
    edges.push({ id: edgeId(), source: nodeId, target: hubCanvas, kind: "structural" });
  }

  // MVP item nodes
  for (const item of mvpItems) {
    const nodeId = `mvp-${item.id}`;
    nodes.push({ id: nodeId, kind: "mvp", label: item.name, subLabel: item.column, color: COLORS.mvp, x: 0, y: 0 });
    edges.push({ id: edgeId(), source: nodeId, target: hubMvp, kind: "structural" });
  }

  // Log entry nodes
  for (const entry of logEntries) {
    const nodeId = `log-${entry.id}`;
    const label = entry.text.length > 40 ? entry.text.slice(0, 40) + "…" : entry.text;
    nodes.push({ id: nodeId, kind: "log", label, subLabel: entry.type, color: COLORS.log, x: 0, y: 0 });
    edges.push({ id: edgeId(), source: nodeId, target: hubLog, kind: "structural" });
  }

  // Affinity edges: canvas badge === log type (e.g., both "insight")
  for (const card of canvasCards) {
    for (const entry of logEntries) {
      if (card.badge && card.badge === entry.type) {
        edges.push({
          id: edgeId(),
          source: `canvas-${card.id}`,
          target: `log-${entry.id}`,
          kind: "affinity",
        });
      }
    }
  }

  // Manual edges from node_links
  for (const link of manualLinks) {
    const sourceId = `${link.source_kind}-${link.source_id}`;
    const targetId = `${link.target_kind}-${link.target_id}`;
    // Only add if both nodes exist in graph
    const sourceExists = nodes.some((n) => n.id === sourceId);
    const targetExists = nodes.some((n) => n.id === targetId);
    if (sourceExists && targetExists) {
      edges.push({ id: link.id, source: sourceId, target: targetId, kind: "manual" });
    }
  }

  return { nodes, edges };
}
