"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IDEA_CARDS, IdeaCard, CustomCard } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";
import { Icons } from "@/components/ui/icons";

type FixedCardId = "problem" | "user" | "solution" | "context";

interface BadgeOption {
  label: string;
  color: string;
  bg: string;
}

const BADGE_OPTIONS: BadgeOption[] = [
  { label: "core",       color: "#F0620A", bg: "#FEF0E8" },
  { label: "hypothesis", color: "#6D28D9", bg: "#F0EAFF" },
  { label: "signal",     color: "#15803D", bg: "#E8F5EE" },
  { label: "validated",  color: "#0D9488", bg: "#E6F7F5" },
  { label: "draft",      color: "#A09D97", bg: "#F3EFE7" },
  { label: "insight",    color: "#2563EB", bg: "#EFF4FF" },
];

interface IdeaCanvasProps {
  addTrigger: number;
}

export function IdeaCanvas({ addTrigger }: IdeaCanvasProps) {
  const { t } = useAppLang();
  const c = t.canvas;

  const [cards,         setCards]         = useState<IdeaCard[]>(IDEA_CARDS);
  const [customCards,   setCustomCards]   = useState<CustomCard[]>([]);
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [editText,      setEditText]      = useState("");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [newCardName,   setNewCardName]   = useState("");
  const [newCardText,   setNewCardText]   = useState("");
  const [badgePopover,  setBadgePopover]  = useState<string | null>(null);

  const handledTrigger = useRef(addTrigger);

  useEffect(() => {
    if (addTrigger !== handledTrigger.current) {
      handledTrigger.current = addTrigger;
      openAddModal();
    }
  }, [addTrigger]);

  const openAddModal = () => {
    setNewCardName("");
    setNewCardText("");
    setShowAddModal(true);
  };

  const handleAddCard = () => {
    if (!newCardName.trim()) return;
    const newCard: CustomCard = {
      id: `custom-${Date.now()}`,
      name: newCardName.trim(),
      text: newCardText.trim(),
      updated: "just now",
    };
    setCustomCards((prev) => [...prev, newCard]);
    setShowAddModal(false);
  };

  const isFixed = (id: string) => IDEA_CARDS.some((fc) => fc.id === id);

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
    setBadgePopover(null);
  };

  const saveEdit = (id: string) => {
    if (isFixed(id)) {
      setCards((prev) =>
        prev.map((card) => card.id === id ? { ...card, text: editText, updated: "just now" } : card)
      );
    } else {
      setCustomCards((prev) =>
        prev.map((card) => card.id === id ? { ...card, text: editText, updated: "just now" } : card)
      );
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const deleteCustomCard = (id: string) => {
    setCustomCards((prev) => prev.filter((card) => card.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateCustomName = (id: string, name: string) => {
    setCustomCards((prev) =>
      prev.map((card) => card.id === id ? { ...card, name } : card)
    );
  };

  const setBadge = (cardId: string, badge: BadgeOption) => {
    setCards((prev) =>
      prev.map((card) => card.id === cardId ? { ...card, tag: badge } : card)
    );
    setBadgePopover(null);
  };

  return (
    <>
      <div className="canvas-grid">
        {cards.map((card) => {
          const isEditing = editingId === card.id;
          const popoverOpen = badgePopover === card.id;
          return (
            <div
              key={card.id}
              className={`canvas-card${isEditing ? " editing" : ""}`}
              onClick={() => !isEditing && startEdit(card.id, card.text)}
            >
              <div className="card-head">
                <span className="card-label">{c[card.id as FixedCardId]}</span>

                {/* Badge with popover */}
                <div className="badge-wrap">
                  <span
                    className="app-tag badge-clickable"
                    style={{ color: card.tag.color, background: card.tag.bg }}
                    onClick={(e) => { e.stopPropagation(); setBadgePopover(popoverOpen ? null : card.id); }}
                  >
                    {card.tag.label}
                  </span>

                  {popoverOpen && (
                    <>
                      <div
                        className="badge-backdrop"
                        onClick={(e) => { e.stopPropagation(); setBadgePopover(null); }}
                      />
                      <div className="badge-popover" onClick={(e) => e.stopPropagation()}>
                        {BADGE_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            className={`badge-option${card.tag.label === opt.label ? " active" : ""}`}
                            onClick={() => setBadge(card.id, opt)}
                          >
                            <span className="badge-option-dot" style={{ background: opt.color }} />
                            <span style={{ color: opt.color }}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <>
                  <textarea
                    className="card-content-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder={c.cardContentPlaceholder}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="card-edit-foot">
                    <button
                      className="app-btn"
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                    >
                      {t.modal.cancel}
                    </button>
                    <button
                      className="app-btn app-btn-primary"
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); saveEdit(card.id); }}
                    >
                      {c.save}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="card-text">{card.text}</p>
                  <div className="card-foot">
                    <span className="card-meta">{c.updated} {card.updated}</span>
                    <button
                      className="card-edit"
                      onClick={(e) => { e.stopPropagation(); startEdit(card.id, card.text); }}
                    >
                      {c.edit} &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {customCards.map((card) => {
          const isEditing = editingId === card.id;
          return (
            <div
              key={card.id}
              className={`canvas-card canvas-card-custom${isEditing ? " editing" : ""}`}
              onClick={() => !isEditing && startEdit(card.id, card.text)}
            >
              <div className="card-head">
                <input
                  className="card-custom-name-input"
                  value={card.name}
                  onChange={(e) => updateCustomName(card.id, e.target.value)}
                  placeholder={c.newCardName}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="card-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteCustomCard(card.id); }}
                >
                  <Icons.Close />
                </button>
              </div>

              {isEditing ? (
                <>
                  <textarea
                    className="card-content-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder={c.cardContentPlaceholder}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="card-edit-foot">
                    <button
                      className="app-btn"
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                    >
                      {t.modal.cancel}
                    </button>
                    <button
                      className="app-btn app-btn-primary"
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                      onClick={(e) => { e.stopPropagation(); saveEdit(card.id); }}
                    >
                      {c.save}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {card.text ? (
                    <p className="card-text">{card.text}</p>
                  ) : (
                    <p className="card-text card-text-empty">{c.cardContentPlaceholder}</p>
                  )}
                  <div className="card-foot">
                    <span className="card-meta">{c.updated} {card.updated}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <button className="canvas-card-add" onClick={openAddModal}>
          <Icons.Plus />
          <span>{c.addCard}</span>
        </button>
      </div>

      {showAddModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{t.toolbar.newCard}</span>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="create-proj-field">
              <input
                className="modal-input"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder={c.newCardName}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCard(); }}
              />
              <textarea
                className="modal-textarea"
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                placeholder={c.cardContentPlaceholder}
              />
            </div>
            <div className="modal-foot">
              <button className="app-btn" onClick={() => setShowAddModal(false)}>
                {t.modal.cancel}
              </button>
              <button
                className="app-btn app-btn-primary"
                onClick={handleAddCard}
                disabled={!newCardName.trim()}
              >
                {c.addCard}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
