"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAppLang } from "./AppLanguageContext";
import { Icons } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { staggerContainer, fadeUp, fadeIn, modalSpring } from "@/lib/motion";
import { useToast } from "./Toast";

type FixedCardId = "problem" | "user" | "solution" | "context";
const FIXED_SLOTS: FixedCardId[] = ["problem", "user", "solution", "context"];

interface BadgeOption { label: string; color: string; bg: string; }

const BADGE_OPTIONS: BadgeOption[] = [
  { label: "core",       color: "#F0620A", bg: "#FEF0E8" },
  { label: "hypothesis", color: "#6D28D9", bg: "#F0EAFF" },
  { label: "signal",     color: "#15803D", bg: "#E8F5EE" },
  { label: "validated",  color: "#0D9488", bg: "#E6F7F5" },
  { label: "draft",      color: "#A09D97", bg: "#F3EFE7" },
  { label: "insight",    color: "#2563EB", bg: "#EFF4FF" },
];
const DEFAULT_BADGE = BADGE_OPTIONS[0];

function badgeByLabel(label: string): BadgeOption {
  return BADGE_OPTIONS.find((b) => b.label === label) ?? DEFAULT_BADGE;
}

function formatUpdated(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface FixedCard {
  slot: FixedCardId;
  dbId: string | null;
  content: string;
  badge: BadgeOption;
  updatedAt: string;
}

interface CustomCard {
  id: string;
  name: string;
  content: string;
  badge: BadgeOption;
  updatedAt: string;
}

interface IdeaCanvasProps {
  projectId: string;
  addTrigger: number;
  onCountChange?: (count: number) => void;
}

export function IdeaCanvas({ projectId, addTrigger, onCountChange }: IdeaCanvasProps) {
  const { t } = useAppLang();
  const { toast } = useToast();
  const c = t.canvas;
  const supabase = createClient();

  const [fixedCards, setFixedCards] = useState<FixedCard[]>(
    FIXED_SLOTS.map((slot) => ({ slot, dbId: null, content: "", badge: DEFAULT_BADGE, updatedAt: "" }))
  );
  const [customCards, setCustomCards]   = useState<CustomCard[]>([]);
  const [editingId,   setEditingId]     = useState<string | null>(null);
  const [editText,    setEditText]      = useState("");
  const [badgePopover, setBadgePopover] = useState<string | null>(null);

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [newCardName,   setNewCardName]   = useState("");
  const [newCardText,   setNewCardText]   = useState("");
  const [newCardBadge,  setNewCardBadge]  = useState<BadgeOption>(DEFAULT_BADGE);

  const handledTrigger = useRef(addTrigger);

  // ─── Load ───────────────────────────────────────────────────────────────────

  const loadCards = useCallback(async () => {
    const { data } = await supabase
      .from("canvas_cards")
      .select("id, slot, title, content, badge, updated_at")
      .eq("project_id", projectId)
      .order("updated_at");
    if (!data) return;

    setFixedCards(
      FIXED_SLOTS.map((slot) => {
        const row = data.find((r) => r.slot === slot);
        return {
          slot,
          dbId: row?.id ?? null,
          content: row?.content ?? "",
          badge: row ? badgeByLabel(row.badge) : DEFAULT_BADGE,
          updatedAt: row?.updated_at ?? "",
        };
      })
    );

    const customs = data.filter((r) => !(FIXED_SLOTS as string[]).includes(r.slot));
    setCustomCards(
      customs.map((r) => ({
        id: r.id,
        name: r.title ?? r.slot,
        content: r.content ?? "",
        badge: badgeByLabel(r.badge),
        updatedAt: r.updated_at ?? "",
      }))
    );
    onCountChange?.(FIXED_SLOTS.length + customs.length);
  }, [projectId, supabase, onCountChange]);

  useEffect(() => { loadCards(); }, [loadCards]);

  // ─── Trigger ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (addTrigger !== handledTrigger.current) {
      handledTrigger.current = addTrigger;
      openAddModal();
    }
  }, [addTrigger]);

  const openAddModal = () => {
    setNewCardName("");
    setNewCardText("");
    setNewCardBadge(DEFAULT_BADGE);
    setShowAddModal(true);
  };

  // ─── Edit ───────────────────────────────────────────────────────────────────

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
    setBadgePopover(null);
  };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    const isFixed = (FIXED_SLOTS as string[]).includes(id);
    if (isFixed) {
      const slot = id as FixedCardId;
      const card = fixedCards.find((c) => c.slot === slot)!;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (card.dbId) {
        await supabase.from("canvas_cards").update({ content: editText }).eq("id", card.dbId);
        setFixedCards((prev) =>
          prev.map((c) => c.slot === slot ? { ...c, content: editText, updatedAt: new Date().toISOString() } : c)
        );
      } else {
        const { data } = await supabase.from("canvas_cards")
          .insert({ user_id: user.id, project_id: projectId, slot, title: slot, content: editText, badge: card.badge.label })
          .select("id, updated_at").single();
        if (data) {
          setFixedCards((prev) =>
            prev.map((c) => c.slot === slot ? { ...c, dbId: data.id, content: editText, updatedAt: data.updated_at } : c)
          );
        }
      }
    } else {
      await supabase.from("canvas_cards").update({ content: editText }).eq("id", id);
      setCustomCards((prev) =>
        prev.map((c) => c.id === id ? { ...c, content: editText, updatedAt: new Date().toISOString() } : c)
      );
    }
    setEditingId(null);
    toast("Card saved");
  };

  // ─── Badge ──────────────────────────────────────────────────────────────────

  const setBadge = async (id: string, badge: BadgeOption, isFixed: boolean) => {
    if (isFixed) {
      const card = fixedCards.find((c) => c.slot === id);
      if (card?.dbId) {
        await supabase.from("canvas_cards").update({ badge: badge.label }).eq("id", card.dbId);
      }
      setFixedCards((prev) => prev.map((c) => c.slot === id ? { ...c, badge } : c));
    } else {
      await supabase.from("canvas_cards").update({ badge: badge.label }).eq("id", id);
      setCustomCards((prev) => prev.map((c) => c.id === id ? { ...c, badge } : c));
    }
    setBadgePopover(null);
  };

  // ─── Custom card CRUD ────────────────────────────────────────────────────────

  const handleAddCard = async () => {
    if (!newCardName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("canvas_cards")
      .insert({ user_id: user.id, project_id: projectId, slot: "custom", title: newCardName.trim(), content: newCardText.trim(), badge: newCardBadge.label })
      .select("id, updated_at").single();
    if (data) {
      setCustomCards((prev) => {
        const next = [...prev, { id: data.id, name: newCardName.trim(), content: newCardText.trim(), badge: newCardBadge, updatedAt: data.updated_at }];
        onCountChange?.(FIXED_SLOTS.length + next.length);
        return next;
      });
      toast("Card added");
    }
    setShowAddModal(false);
  };

  const updateCustomName = (id: string, name: string) => {
    setCustomCards((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
  };
  const saveCustomName = async (id: string, name: string) => {
    await supabase.from("canvas_cards").update({ title: name }).eq("id", id);
  };

  const deleteCustomCard = async (id: string) => {
    await supabase.from("canvas_cards").delete().eq("id", id);
    setCustomCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      onCountChange?.(FIXED_SLOTS.length + next.length);
      return next;
    });
    if (editingId === id) setEditingId(null);
    toast("Card deleted", "info");
  };

  // ─── Badge popover ──────────────────────────────────────────────────────────

  function BadgePopover({ id, current, isFixed }: { id: string; current: BadgeOption; isFixed: boolean }) {
    return (
      <>
        <div className="badge-backdrop" onClick={(e) => { e.stopPropagation(); setBadgePopover(null); }} />
        <div className="badge-popover" onClick={(e) => e.stopPropagation()}>
          {BADGE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`badge-option${current.label === opt.label ? " active" : ""}`}
              onClick={() => setBadge(id, opt, isFixed)}
            >
              <span className="badge-option-dot" style={{ background: opt.color }} />
              <span style={{ color: opt.color }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <motion.div className="canvas-grid" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Fixed cards */}
        {fixedCards.map((card) => {
          const isEditing  = editingId === card.slot;
          const popoverOpen = badgePopover === card.slot;
          return (
            <motion.div
              key={card.slot}
              className={`canvas-card${isEditing ? " editing" : ""}`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onClick={() => !isEditing && startEdit(card.slot, card.content)}
            >
              <div className="card-head">
                <span className="card-label">{c[card.slot as FixedCardId]}</span>
                <div className="badge-wrap">
                  <span
                    className="app-tag badge-clickable"
                    style={{ color: card.badge.color, background: card.badge.bg }}
                    onClick={(e) => { e.stopPropagation(); setBadgePopover(popoverOpen ? null : card.slot); }}
                  >{card.badge.label}</span>
                  {popoverOpen && <BadgePopover id={card.slot} current={card.badge} isFixed />}
                </div>
              </div>

              {isEditing ? (
                <>
                  <textarea className="card-content-input" value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder={c.cardContentPlaceholder} autoFocus
                    onClick={(e) => e.stopPropagation()} />
                  <div className="card-edit-foot">
                    <button className="app-btn" style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}>{t.modal.cancel}</button>
                    <button className="app-btn app-btn-primary" style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); saveEdit(card.slot); }}>{c.save}</button>
                  </div>
                </>
              ) : (
                <>
                  {card.content
                    ? <p className="card-text">{card.content}</p>
                    : <p className="card-text card-text-empty">{c.cardContentPlaceholder}</p>}
                  <div className="card-foot">
                    {card.updatedAt && <span className="card-meta">{c.updated} {formatUpdated(card.updatedAt)}</span>}
                    <button className="card-edit"
                      onClick={(e) => { e.stopPropagation(); startEdit(card.slot, card.content); }}>
                      {c.edit} &rarr;
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}

        {/* Custom cards */}
        {customCards.map((card) => {
          const isEditing   = editingId === card.id;
          const popoverOpen = badgePopover === card.id;
          return (
            <motion.div
              key={card.id}
              className={`canvas-card canvas-card-custom${isEditing ? " editing" : ""}`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onClick={() => !isEditing && startEdit(card.id, card.content)}
            >
              <div className="card-head">
                <input
                  className="card-custom-name-input"
                  value={card.name}
                  onChange={(e) => updateCustomName(card.id, e.target.value)}
                  onBlur={(e) => saveCustomName(card.id, e.target.value)}
                  placeholder={c.newCardName}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="badge-wrap">
                  <span
                    className="app-tag badge-clickable"
                    style={{ color: card.badge.color, background: card.badge.bg }}
                    onClick={(e) => { e.stopPropagation(); setBadgePopover(popoverOpen ? null : card.id); }}
                  >{card.badge.label}</span>
                  {popoverOpen && <BadgePopover id={card.id} current={card.badge} isFixed={false} />}
                </div>
                <button className="card-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteCustomCard(card.id); }}>
                  <Icons.Close />
                </button>
              </div>

              {isEditing ? (
                <>
                  <textarea className="card-content-input" value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder={c.cardContentPlaceholder} autoFocus
                    onClick={(e) => e.stopPropagation()} />
                  <div className="card-edit-foot">
                    <button className="app-btn" style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}>{t.modal.cancel}</button>
                    <button className="app-btn app-btn-primary" style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); saveEdit(card.id); }}>{c.save}</button>
                  </div>
                </>
              ) : (
                <>
                  {card.content
                    ? <p className="card-text">{card.content}</p>
                    : <p className="card-text card-text-empty">{c.cardContentPlaceholder}</p>}
                  <div className="card-foot">
                    {card.updatedAt && <span className="card-meta">{c.updated} {formatUpdated(card.updatedAt)}</span>}
                    <button className="card-edit"
                      onClick={(e) => { e.stopPropagation(); startEdit(card.id, card.content); }}>
                      {c.edit} &rarr;
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}

        <motion.button className="canvas-card-add" variants={fadeUp} initial="hidden" animate="visible" onClick={openAddModal}>
          <Icons.Plus /><span>{c.addCard}</span>
        </motion.button>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {showAddModal && (
        <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={() => setShowAddModal(false)}>
          <motion.div className="modal" variants={modalSpring} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{t.toolbar.newCard}</span>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><Icons.Close /></button>
            </div>
            <div className="create-proj-field">
              <input className="modal-input" value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder={c.newCardName} autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCard(); }} />
              <textarea className="modal-textarea" value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                placeholder={c.cardContentPlaceholder} />
              <div className="modal-badge-row">
                <span className="modal-badge-label">Badge</span>
                <div className="modal-badge-opts">
                  {BADGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`modal-badge-opt${newCardBadge.label === opt.label ? " active" : ""}`}
                      style={{ color: opt.color, ...(newCardBadge.label === opt.label ? { background: opt.bg, borderColor: opt.color } : {}) }}
                      onClick={() => setNewCardBadge(opt)}
                    >
                      <span className="modal-badge-dot" style={{ background: opt.color }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="app-btn" onClick={() => setShowAddModal(false)}>{t.modal.cancel}</button>
              <button className="app-btn app-btn-primary" onClick={handleAddCard} disabled={!newCardName.trim()}>{c.addCard}</button>
            </div>
          </motion.div>
        </motion.div>
          )}
        </AnimatePresence>
      , document.body)}
    </>
  );
}
