"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";

interface Idea {
  id: number;
  text: string;
  createdAt: string;
}

const SAMPLE_IDEAS: Idea[] = [
  { id: 1, text: "What if the Build Log could be exported as a Twitter/X thread automatically?", createdAt: "2d ago" },
  { id: 2, text: "Let users pin one card from the Idea Canvas to the project overview.", createdAt: "4d ago" },
  { id: 3, text: "A weekly digest email summarizing all decisions made in the Build Log.", createdAt: "1w ago" },
];

export function InboxView() {
  const { t } = useAppLang();
  const [ideas, setIdeas] = useState<Idea[]>(SAMPLE_IDEAS);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const inbox = t.inbox;

  const addIdea = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setIdeas([{ id: Date.now(), text: trimmed, createdAt: "just now" }, ...ideas]);
    setDraft("");
  };

  const deleteIdea = (id: number) => setIdeas((prev) => prev.filter((i) => i.id !== id));

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.text);
  };

  const saveEdit = (id: number) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setIdeas((prev) => prev.map((i) => i.id === id ? { ...i, text: trimmed } : i));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addIdea();
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">{inbox.title}</h1>
      </div>

      <div className="inbox-compose">
        <textarea
          className="inbox-input"
          placeholder={inbox.placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
        />
        <div className="inbox-compose-foot">
          <span className="inbox-hint">⌘ + Enter</span>
          <button
            className="app-btn app-btn-primary"
            onClick={addIdea}
            disabled={!draft.trim()}
          >
            {inbox.add}
          </button>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">{inbox.empty}</p>
          <p className="empty-hint">{inbox.emptyHint}</p>
        </div>
      ) : (
        <div className="inbox-list">
          {ideas.map((idea) => (
            <div key={idea.id} className={`inbox-item${editingId === idea.id ? " editing" : ""}`}>
              {editingId === idea.id ? (
                <>
                  <textarea
                    className="inbox-edit-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
                  />
                  <div className="inbox-edit-actions">
                    <button className="app-btn" onClick={cancelEdit}>{inbox.cancel}</button>
                    <button
                      className="app-btn app-btn-primary"
                      onClick={() => saveEdit(idea.id)}
                      disabled={!editText.trim()}
                    >
                      {inbox.save}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="inbox-item-text">{idea.text}</p>
                  <div className="inbox-item-right">
                    <span className="inbox-item-meta">{idea.createdAt}</span>
                    <button className="inbox-item-edit-btn" onClick={() => startEdit(idea)}>
                      <Icons.Pencil />
                    </button>
                    <button className="inbox-item-delete" onClick={() => deleteIdea(idea.id)}>
                      <Icons.Close />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
