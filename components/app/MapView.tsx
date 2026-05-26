"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide,
  SimulationNodeDatum, SimulationLinkDatum,
} from "d3-force";
import { buildGraph, GraphNode, GraphEdge, CanvasCardInput, MVPItemInput, LogEntryInput, NodeLinkInput } from "@/lib/graph";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./Toast";

type TabId = "canvas" | "scope" | "log";

interface MapViewProps {
  projectId: string;
  projectName: string;
  onNavigate: (tab: TabId) => void;
}

type SimNode = GraphNode & SimulationNodeDatum & { x: number; y: number };
type SimLink = Omit<GraphEdge, "source" | "target"> & SimulationLinkDatum<SimNode>;

const EDGE_STYLE: Record<string, { stroke: string; opacity: number; dashed: boolean; width: number }> = {
  structural: { stroke: "#B8B3AC", opacity: 0.7,  dashed: false, width: 1.5 },
  affinity:   { stroke: "#F0620A", opacity: 0.5,  dashed: true,  width: 1.5 },
  manual:     { stroke: "#6D28D9", opacity: 0.85, dashed: false, width: 2   },
};

const KIND_COLOR: Record<string, string> = {
  canvas: "#F0620A",
  mvp:    "#6D28D9",
  log:    "#15803D",
  hub:    "#A09D97",
  root:   "#1A1714",
};

const COLLISION_R: Record<string, number> = {
  root: 80, hub: 65, canvas: 105, mvp: 105, log: 105,
};

// SVG extent: ±this many px from world origin; all d3 nodes stay well within
const SVG_HALF = 6000;

export function MapView({ projectId, projectName, onNavigate }: MapViewProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [edges, setEdges] = useState<SimLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [hovered, setHovered] = useState<string | null>(null);

  // Miro-style drag-to-connect
  const [drawing, setDrawing] = useState<{ id: string; x: number; y: number } | null>(null);
  const [drawCursor, setDrawCursor] = useState({ x: 0, y: 0 });
  const [drawTarget, setDrawTarget] = useState<string | null>(null);

  // Drag refs
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const draggingNode = useRef<{ id: string; smx: number; smy: number; snx: number; sny: number } | null>(null);
  const didDrag = useRef(false);

  // ─── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    const [
      { data: cards },
      { data: items },
      { data: entries },
      { data: links },
    ] = await Promise.all([
      supabase.from("canvas_cards").select("id, slot, title, badge").eq("project_id", projectId),
      supabase.from("mvp_items").select("id, name, column_id").eq("project_id", projectId),
      supabase.from("log_entries").select("id, text, type").eq("project_id", projectId),
      supabase.from("node_links").select("id, source_kind, source_id, target_kind, target_id").eq("project_id", projectId),
    ]);

    const canvasCards: CanvasCardInput[] = (cards ?? []).map((c) => ({
      id: c.id, slot: c.slot, title: c.title ?? c.slot, badge: c.badge ?? "",
    }));
    const mvpItems: MVPItemInput[] = (items ?? []).map((i) => ({
      id: i.id, name: i.name, column: i.column_id,
    }));
    const logEntries: LogEntryInput[] = (entries ?? []).map((e) => ({
      id: e.id, text: e.text, type: e.type,
    }));
    const manualLinks: NodeLinkInput[] = (links ?? []) as NodeLinkInput[];

    const graph = buildGraph(projectName, canvasCards, mvpItems, logEntries, manualLinks);
    const simNodes: SimNode[] = graph.nodes.map((n) => ({ ...n, x: 0, y: 0 }));
    const nodeById = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = graph.edges.map((e) => ({
      ...e,
      source: nodeById.get(e.source) ?? e.source,
      target: nodeById.get(e.target) ?? e.target,
    })) as unknown as SimLink[];

    await new Promise<void>((resolve) => {
      const sim = forceSimulation<SimNode>(simNodes)
        .force("link", forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(200).strength(0.45))
        .force("charge", forceManyBody().strength(-800))
        .force("center", forceCenter(0, 0))
        .force("collide", forceCollide<SimNode>((d) => COLLISION_R[d.kind] ?? 105))
        .stop();
      sim.tick(200);
      resolve();
    });

    setNodes(simNodes);
    setEdges(simLinks);
    setLoading(false);

    requestAnimationFrame(() => {
      const r = containerRef.current?.getBoundingClientRect();
      if (r) setPan({ x: r.width / 2, y: r.height / 2 });
    });
  }, [projectId, projectName, supabase]);

  useEffect(() => { load(); }, [load]);

  // ─── Coordinate conversion ──────────────────────────────────────────────────

  const toWorld = (clientX: number, clientY: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: (clientX - r.left - pan.x) / zoom, y: (clientY - r.top - pan.y) / zoom };
  };

  // ─── Container mouse handlers ────────────────────────────────────────────────

  const onContainerDown = (e: React.MouseEvent) => {
    if (drawing) return;
    const t = e.target as HTMLElement;
    if (t.closest(".map-node-card, .map-node-hub, .map-node-root")) return;
    isPanning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    containerRef.current?.classList.add("is-panning");
  };

  const onContainerMove = (e: React.MouseEvent) => {
    if (drawing) {
      setDrawCursor(toWorld(e.clientX, e.clientY));
      return;
    }
    if (draggingNode.current) {
      const { id, smx, smy, snx, sny } = draggingNode.current;
      const dx = (e.clientX - smx) / zoom;
      const dy = (e.clientY - smy) / zoom;
      if (Math.abs(e.clientX - smx) > 4 || Math.abs(e.clientY - smy) > 4) didDrag.current = true;
      setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: snx + dx, y: sny + dy } : n));
      return;
    }
    if (!isPanning.current) return;
    setPan({
      x: panStart.current.px + (e.clientX - panStart.current.mx),
      y: panStart.current.py + (e.clientY - panStart.current.my),
    });
  };

  const onContainerUp = async (e: React.MouseEvent) => {
    containerRef.current?.classList.remove("is-panning");

    if (drawing) {
      if (drawTarget && drawTarget !== drawing.id) {
        const parseId = (id: string) => {
          const [kind, ...rest] = id.split("-");
          return { kind: kind as "canvas" | "mvp" | "log", rawId: rest.join("-") };
        };
        const src = parseId(drawing.id);
        const tgt = parseId(drawTarget);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from("node_links").insert({
            user_id: user.id, project_id: projectId,
            source_kind: src.kind, source_id: src.rawId,
            target_kind: tgt.kind, target_id: tgt.rawId,
          });
          if (!error) { toast("Link created"); load(); }
        }
      }
      setDrawing(null);
      setDrawTarget(null);
      setHovered(null);
      return;
    }

    isPanning.current = false;
    draggingNode.current = null;
  };

  const onContainerWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const wx = (px - pan.x) / zoom;
    const wy = (py - pan.y) / zoom;
    const nz = Math.max(0.25, Math.min(2.5, zoom * factor));
    setPan({ x: px - wx * nz, y: py - wy * nz });
    setZoom(nz);
  };

  // ─── Node drag (individual cards) ───────────────────────────────────────────

  const startNodeDrag = (e: React.MouseEvent, node: SimNode) => {
    e.stopPropagation();
    didDrag.current = false;
    draggingNode.current = { id: node.id, smx: e.clientX, smy: e.clientY, snx: node.x, sny: node.y };
  };

  // ─── Connector handle: start drawing a link ──────────────────────────────────

  const startDrawing = (e: React.MouseEvent, node: SimNode) => {
    e.stopPropagation();
    e.preventDefault();
    const wc = toWorld(e.clientX, e.clientY);
    setDrawing({ id: node.id, x: node.x, y: node.y });
    setDrawCursor(wc);
  };

  // ─── Node click: navigate ────────────────────────────────────────────────────

  const onNodeClick = (e: React.MouseEvent, node: SimNode) => {
    if (didDrag.current) { didDrag.current = false; return; }
    if (drawing) return;
    if (node.kind === "canvas") onNavigate("canvas");
    else if (node.kind === "mvp") onNavigate("scope");
    else if (node.kind === "log") onNavigate("log");
    else if (node.kind === "hub") {
      if (node.id === "hub-canvas") onNavigate("canvas");
      else if (node.id === "hub-mvp") onNavigate("scope");
      else if (node.id === "hub-log") onNavigate("log");
    }
  };

  // ─── Delete manual link ──────────────────────────────────────────────────────

  const deleteLink = async (edge: SimLink) => {
    if (edge.kind !== "manual") return;
    await supabase.from("node_links").delete().eq("id", edge.id);
    toast("Link removed", "info");
    load();
  };

  const resolveNode = (ep: SimNode | string | number): SimNode | null =>
    typeof ep === "object" && "x" in ep ? (ep as SimNode) : null;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <div className="app-spinner" />
      </div>
    );
  }

  return (
    <div className="map-view">
      {/* Minimal toolbar: just the legend */}
      <div className="map-toolbar">
        <span className="map-legend">
          <span className="map-legend-dot" style={{ background: "#F0620A" }} />Canvas
          <span className="map-legend-dot" style={{ background: "#6D28D9" }} />Scope
          <span className="map-legend-dot" style={{ background: "#15803D" }} />Log
        </span>
        {drawing && (
          <span style={{ fontSize: 12, color: "#6D28D9", fontStyle: "italic" }}>
            Release on a card to connect
          </span>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="map-canvas"
        style={{ cursor: drawing ? "crosshair" : undefined }}
        onMouseDown={onContainerDown}
        onMouseMove={onContainerMove}
        onMouseUp={onContainerUp}
        onMouseLeave={onContainerUp}
        onWheel={onContainerWheel}
      >
        <div
          className="map-world"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {/*
            SVG for edges: uses a large explicit viewport + matching viewBox so
            all node coordinates (centred on 0,0 by d3-force) render correctly.
            Inline style used so the SVG element itself is never zero-sized.
          */}
          <svg
            style={{
              position: "absolute",
              left: -SVG_HALF,
              top: -SVG_HALF,
              width: SVG_HALF * 2,
              height: SVG_HALF * 2,
              pointerEvents: "none",
            }}
            viewBox={`${-SVG_HALF} ${-SVG_HALF} ${SVG_HALF * 2} ${SVG_HALF * 2}`}
          >
            {edges.map((edge) => {
              const src = resolveNode(edge.source);
              const tgt = resolveNode(edge.target);
              if (!src || !tgt) return null;
              const s = EDGE_STYLE[edge.kind] ?? EDGE_STYLE.structural;
              const lit = hovered && (src.id === hovered || tgt.id === hovered);
              const dim = !!(hovered && !lit);
              const mx = (src.x + tgt.x) / 2;
              const my = (src.y + tgt.y) / 2;
              return (
                <g key={edge.id}>
                  <line
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={s.stroke}
                    strokeWidth={s.width}
                    strokeOpacity={dim ? 0.07 : s.opacity}
                    strokeDasharray={s.dashed ? "5 4" : undefined}
                    style={{ transition: "stroke-opacity 0.2s" }}
                  />
                  {/* Delete affordance: × at edge midpoint when hovering an endpoint */}
                  {edge.kind === "manual" && lit && (
                    <g
                      transform={`translate(${mx},${my})`}
                      style={{ cursor: "pointer", pointerEvents: "all" }}
                      onClick={(e) => { e.stopPropagation(); deleteLink(edge); }}
                    >
                      <circle r={10} fill="white" stroke="#E2DDD4" strokeWidth={1.5} />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={13}
                        fill="#A09D97"
                        style={{ pointerEvents: "none" }}
                      >×</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* In-progress link line while dragging from a handle */}
            {drawing && (
              <line
                x1={drawing.x} y1={drawing.y}
                x2={drawCursor.x} y2={drawCursor.y}
                stroke="#6D28D9"
                strokeWidth={2}
                strokeDasharray="5 4"
                strokeOpacity={0.8}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const color = KIND_COLOR[node.kind] ?? "#A09D97";
            const dim = !!(hovered && hovered !== node.id);
            const isItem = node.kind === "canvas" || node.kind === "mvp" || node.kind === "log";
            const isDrawSrc = drawing?.id === node.id;
            const isDrawTgt = drawTarget === node.id;
            const showHandle = hovered === node.id && isItem && !drawing;

            if (node.kind === "root") {
              return (
                <div
                  key={node.id}
                  className="map-node-pos"
                  style={{ left: node.x, top: node.y }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <motion.div
                    className="map-node-root"
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: dim ? 0.15 : 1, scale: 1 }}
                    transition={{ opacity: { duration: 0.18 }, scale: { type: "spring", stiffness: 320, damping: 28 } }}
                  >
                    {node.label}
                  </motion.div>
                </div>
              );
            }

            if (node.kind === "hub") {
              return (
                <div
                  key={node.id}
                  className="map-node-pos"
                  style={{ left: node.x, top: node.y }}
                  onClick={(e) => onNodeClick(e, node)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <motion.div
                    className="map-node-hub"
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: dim ? 0.15 : 1, scale: 1 }}
                    transition={{ opacity: { duration: 0.18 }, scale: { type: "spring", stiffness: 320, damping: 28 } }}
                    whileHover={{ scale: 1.05 }}
                    style={{ background: color + "1A", border: `1.5px solid ${color}55`, color, cursor: "pointer" }}
                  >
                    {node.label}
                  </motion.div>
                </div>
              );
            }

            // Item card
            return (
              <div
                key={node.id}
                className="map-node-pos"
                style={{ left: node.x, top: node.y }}
                onMouseDown={(e) => startNodeDrag(e, node)}
                onMouseEnter={() => {
                  setHovered(node.id);
                  if (drawing && node.id !== drawing.id) setDrawTarget(node.id);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  if (drawTarget === node.id) setDrawTarget(null);
                }}
                onClick={(e) => onNodeClick(e, node)}
              >
                <motion.div
                  className="map-node-card"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: dim ? 0.12 : 1, scale: 1 }}
                  transition={{ opacity: { duration: 0.18 }, scale: { type: "spring", stiffness: 320, damping: 28 } }}
                  whileHover={!drawing ? { scale: 1.04, boxShadow: "0 8px 24px rgba(26,23,20,0.13)" } : undefined}
                  style={{
                    borderLeftColor: isDrawTgt || isDrawSrc ? "#6D28D9" : color,
                    borderLeftWidth: isDrawTgt || isDrawSrc ? "4px" : "3px",
                    outline: isDrawTgt ? "2px solid rgba(109,40,217,0.55)" : isDrawSrc ? "2px solid rgba(109,40,217,0.3)" : "none",
                    outlineOffset: "3px",
                    cursor: drawing ? (isDrawTgt ? "pointer" : "default") : "grab",
                  }}
                >
                  <div className="map-card-title">
                    {node.label.length > 34 ? node.label.slice(0, 34) + "…" : node.label}
                  </div>
                  {node.subLabel && (
                    <div className="map-card-badge" style={{ background: color + "1A", color }}>
                      {node.subLabel}
                    </div>
                  )}
                </motion.div>

                {/* Connector handle – appears on hover, drag it to create a link */}
                {showHandle && (
                  <motion.div
                    className="map-conn-handle"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.12 }}
                    onMouseDown={(e) => startDrawing(e, node)}
                    title="Drag to connect"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="map-hint">
        Scroll to zoom · Drag canvas to pan · Drag cards to reposition · Hover a card → drag the{" "}
        <span style={{ color: "#6D28D9" }}>●</span> handle to connect
      </p>
    </div>
  );
}
