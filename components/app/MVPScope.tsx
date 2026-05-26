"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { MVPItem, KanbanColumn, KANBAN_COLUMNS } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";
import { Icons } from "@/components/ui/icons";
import { staggerContainer, fadeUp, fadeIn, modalSpring } from "@/lib/motion";
import { useToast } from "./Toast";

const PRIORITIES = ["P1", "P2", "P3"] as const;
type Priority = "P1" | "P2" | "P3";

interface MVPScopeProps {
  items:         MVPItem[];
  onItemsChange: (items: MVPItem[]) => void;
  addTrigger:    number;
}

// ── Draggable card ─────────────────────────────────────────────────────────────

function DraggableCard({
  item,
  col,
  onOpen,
  isMarkingDone,
  onMarkDone,
}: {
  item: MVPItem;
  col: typeof KANBAN_COLUMNS[number];
  onOpen: (item: MVPItem) => void;
  isMarkingDone: boolean;
  onMarkDone: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });

  return (
    <motion.div
      ref={setNodeRef}
      className={`kanban-card${isDragging ? " is-dragging" : ""}${isMarkingDone ? " is-marking-done" : ""}`}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.88, y: -6, transition: { duration: 0.22, ease: "easeIn" } }}
      style={{ opacity: isDragging ? 0.28 : 1 }}
      onClick={() => onOpen(item)}
      {...attributes}
      {...listeners}
    >
      <div className="kanban-card-name-wrap">
        <span className="kanban-card-name">{item.name}</span>
        {isMarkingDone && (
          <motion.div
            className="kanban-strikethrough"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            style={{ originX: 0 }}
          />
        )}
      </div>

      <div className="kanban-card-foot">
        <span className="kanban-pri" style={{ color: col.color }}>{item.priority}</span>
        <div className="kanban-card-foot-right">
          {item.why && <span className="kanban-has-why">why</span>}
          <button
            className={`kanban-card-check${isMarkingDone ? " is-done" : ""}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMarkDone(); }}
            title="Mark as done"
          >
            <Icons.Check />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Droppable column ───────────────────────────────────────────────────────────

function DroppableColumn({
  colId,
  children,
}: {
  colId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colId });
  return (
    <div ref={setNodeRef} className={`kanban-col${isOver ? " drop-over" : ""}`}>
      {children}
    </div>
  );
}

// ── MVPScope ───────────────────────────────────────────────────────────────────

export function MVPScope({ items, onItemsChange, addTrigger }: MVPScopeProps) {
  const { t } = useAppLang();
  const { toast } = useToast();
  const s = t.scope;

  /* ─ Detail modal ─ */
  const [selected,  setSelected]  = useState<MVPItem | null>(null);
  const [editName,  setEditName]  = useState("");
  const [editWhy,   setEditWhy]   = useState("");

  /* ─ Add feature modal ─ */
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalCol,  setAddModalCol]  = useState<KanbanColumn>("core-mvp");
  const [newItemName,  setNewItemName]  = useState("");
  const [newItemPri,   setNewItemPri]   = useState<Priority>("P3");
  const [newItemWhy,   setNewItemWhy]   = useState("");

  /* ─ Done section ─ */
  const [doneOpen, setDoneOpen] = useState(false);

  /* ─ Drag state ─ */
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ─ Mark-done animation ─ */
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Track the last handled trigger so remounting with a stale trigger doesn't reopen the modal
  const handledTrigger = useRef(addTrigger);

  useEffect(() => {
    if (addTrigger !== handledTrigger.current) {
      handledTrigger.current = addTrigger;
      openAddModal("core-mvp");
    }
  }, [addTrigger]);

  /* ── Add feature ── */
  const openAddModal = (col: KanbanColumn) => {
    setAddModalCol(col);
    setNewItemName("");
    setNewItemWhy("");
    setNewItemPri("P3");
    setShowAddModal(true);
  };

  const handleAddFeature = () => {
    if (!newItemName.trim()) return;
    const newItem: MVPItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      column: addModalCol,
      priority: newItemPri,
      why: newItemWhy.trim(),
      done: false,
    };
    onItemsChange([...items, newItem]);
    setShowAddModal(false);
    toast("Feature added");
  };

  /* ── Detail ── */
  const openDetail = (item: MVPItem) => {
    setSelected(item);
    setEditName(item.name);
    setEditWhy(item.why);
  };

  const closeDetail = () => setSelected(null);

  const saveDetail = () => {
    if (!selected) return;
    onItemsChange(items.map((i) => i.id === selected.id ? { ...i, name: editName, why: editWhy } : i));
    closeDetail();
    toast("Feature saved");
  };

  const moveItem = (col: KanbanColumn) => {
    if (!selected) return;
    const id = selected.id;
    setSelected((prev) => prev ? { ...prev, column: col } : prev);
    onItemsChange(items.map((i) => i.id === id ? { ...i, column: col } : i));
  };

  const toggleDone = () => {
    if (!selected) return;
    const id       = selected.id;
    const nextDone = !selected.done;
    setSelected((prev) => prev ? { ...prev, done: nextDone } : prev);
    onItemsChange(items.map((i) => i.id === id ? { ...i, done: nextDone } : i));
    if (nextDone) { setDoneOpen(true); closeDetail(); }
  };

  /* ── Mark done (card quick-action) ── */
  const handleMarkDone = (id: string) => {
    if (markingDoneId) return;
    setMarkingDoneId(id);
    // Commit the done state — card exits with green + strikethrough still visible
    setTimeout(() => {
      onItemsChange(items.map((i) => i.id === id ? { ...i, done: true } : i));
      setDoneOpen(true);
    }, 580);
    // Clear the animation state after the exit animation finishes (580 + 260ms)
    setTimeout(() => setMarkingDoneId(null), 840);
  };

  /* ── Drag handlers ── */
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const draggedItem = items.find((i) => i.id === active.id);
    if (!draggedItem) return;
    const targetCol = over.id as KanbanColumn;
    if (draggedItem.column === targetCol) return;
    onItemsChange(items.map((i) => i.id === active.id ? { ...i, column: targetCol } : i));
    toast("Feature moved");
  };

  const doneItems   = items.filter((i) => i.done);
  const activeItems = items.filter((i) => !i.done);

  const overlayItem = activeId ? items.find((i) => i.id === activeId) : null;
  const overlayCol  = overlayItem ? KANBAN_COLUMNS.find((c) => c.id === overlayItem.column) : null;

  return (
    <>
      {/* ── Board ── */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {KANBAN_COLUMNS.map((col) => {
            const colItems = activeItems.filter((i) => i.column === col.id);
            return (
              <DroppableColumn key={col.id} colId={col.id}>
                <div className="kanban-col-header">
                  <span className="kanban-col-dot" style={{ background: col.color }} />
                  <span className="kanban-col-name">{s.columns[col.id]}</span>
                  <span className="kanban-col-count">{colItems.length}</span>
                </div>
                <motion.div className="kanban-cards" variants={staggerContainer} initial="hidden" animate="visible">
                  <AnimatePresence>
                    {colItems.map((item) => (
                      <DraggableCard
                        key={item.id}
                        item={item}
                        col={col}
                        onOpen={openDetail}
                        isMarkingDone={markingDoneId === item.id}
                        onMarkDone={() => handleMarkDone(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                  <button className="kanban-add" onClick={() => openAddModal(col.id)}>
                    + {s.detail.addFeature}
                  </button>
                </motion.div>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {overlayItem && overlayCol && (
            <div className="kanban-card drag-overlay-card">
              <div className="kanban-card-name-wrap">
                <span className="kanban-card-name">{overlayItem.name}</span>
              </div>
              <div className="kanban-card-foot">
                <span className="kanban-pri" style={{ color: overlayCol.color }}>{overlayItem.priority}</span>
                <div className="kanban-card-foot-right">
                  {overlayItem.why && <span className="kanban-has-why">why</span>}
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ── Done section ── */}
      {doneItems.length > 0 && (
        <div className="kanban-done-section">
          <button className="kanban-done-toggle" onClick={() => setDoneOpen((o) => !o)}>
            <span className="kanban-done-caret">{doneOpen ? "▼" : "▶"}</span>
            {s.done} ({doneItems.length})
          </button>
          {doneOpen && (
            <div className="kanban-done-list">
              {doneItems.map((item) => {
                const originalCol = KANBAN_COLUMNS.find((c) => c.id === item.column);
                return (
                  <div key={item.id} className="kanban-done-card" onClick={() => openDetail(item)}>
                    <span className="kanban-done-name">{item.name}</span>
                    <div className="kanban-done-meta">
                      {originalCol && (
                        <span
                          className="kanban-done-badge"
                          style={{ color: originalCol.color, background: originalCol.color + "18" }}
                        >
                          {s.columns[item.column]}
                        </span>
                      )}
                      <span className="kanban-pri" style={{ color: originalCol?.color }}>{item.priority}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add feature modal (portal → covers full screen) ── */}
      {createPortal(
        <AnimatePresence>
          {showAddModal && (
        <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={() => setShowAddModal(false)}>
          <motion.div className="modal" variants={modalSpring} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{s.detail.addFeature}</span>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <Icons.Close />
              </button>
            </div>

            <div className="create-proj-field">
              <input
                className="modal-input"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={s.detail.newFeaturePlaceholder}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddFeature(); }}
              />

              <div>
                <div className="detail-section-label">{s.detail.moveTo}</div>
                <div className="detail-move-pills">
                  {KANBAN_COLUMNS.map((col) => {
                    const isActive = addModalCol === col.id;
                    return (
                      <button
                        key={col.id}
                        className={`detail-col-pill${isActive ? " active" : ""}`}
                        style={isActive ? { borderColor: col.color, color: col.color, background: col.color + "18" } : {}}
                        onClick={() => setAddModalCol(col.id)}
                      >
                        {s.columns[col.id]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="detail-section-label">{s.detail.priority}</div>
                <div className="kanban-inline-pri">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      className={`kanban-inline-pri-btn${newItemPri === p ? " active" : ""}`}
                      onClick={() => setNewItemPri(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="detail-section-label">{s.detail.why}</div>
                <textarea
                  className="modal-textarea detail-why-input"
                  value={newItemWhy}
                  onChange={(e) => setNewItemWhy(e.target.value)}
                  placeholder={s.detail.whyPlaceholder}
                />
              </div>
            </div>

            <div className="modal-foot">
              <button className="app-btn" onClick={() => setShowAddModal(false)}>
                {s.detail.cancel}
              </button>
              <button
                className="app-btn app-btn-primary"
                onClick={handleAddFeature}
                disabled={!newItemName.trim()}
              >
                {s.detail.add}
              </button>
            </div>
          </motion.div>
        </motion.div>
          )}
        </AnimatePresence>
      , document.body)}

      {/* ── Detail modal (portal → covers full screen) ── */}
      {createPortal(
        <AnimatePresence>
          {selected && (
        <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={closeDetail}>
          <motion.div className="modal kanban-detail" variants={modalSpring} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{editName || selected.name}</span>
              <button className="modal-close" onClick={closeDetail}><Icons.Close /></button>
            </div>

            <div className="create-proj-field">
              <input
                className="modal-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={s.detail.name}
              />

              <div>
                <div className="detail-section-label">{s.detail.why}</div>
                <textarea
                  className="modal-textarea detail-why-input"
                  value={editWhy}
                  onChange={(e) => setEditWhy(e.target.value)}
                  placeholder={s.detail.whyPlaceholder}
                />
              </div>

              {!selected.done && (
                <div>
                  <div className="detail-section-label">{s.detail.moveTo}</div>
                  <div className="detail-move-pills">
                    {KANBAN_COLUMNS.map((col) => {
                      const isActive = selected.column === col.id;
                      return (
                        <button
                          key={col.id}
                          className={`detail-col-pill${isActive ? " active" : ""}`}
                          style={isActive ? { borderColor: col.color, color: col.color, background: col.color + "18" } : {}}
                          onClick={() => moveItem(col.id)}
                        >
                          {s.columns[col.id]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selected.done && (
                <div className="detail-original-col">
                  <span className="detail-section-label">{s.detail.originalCol}:</span>
                  {(() => {
                    const col = KANBAN_COLUMNS.find((c) => c.id === selected.column);
                    return col ? (
                      <span
                        className="kanban-done-badge"
                        style={{ color: col.color, background: col.color + "18" }}
                      >
                        {s.columns[selected.column]}
                      </span>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="modal-foot detail-foot">
              <button
                className={`app-btn detail-done-btn${selected.done ? " detail-done-btn-active" : ""}`}
                onClick={toggleDone}
              >
                {selected.done ? s.detail.markActive : s.detail.markDone}
              </button>
              <div className="detail-foot-right">
                <button className="app-btn" onClick={closeDetail}>{s.detail.close}</button>
                <button className="app-btn app-btn-primary" onClick={saveDetail}>{s.detail.save}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
          )}
        </AnimatePresence>
      , document.body)}
    </>
  );
}
