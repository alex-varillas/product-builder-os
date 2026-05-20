"use client";

import { useCallback, useEffect, useState } from "react";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";
import { createClient } from "@/lib/supabase/client";

interface Idea {
  id: string;
  text: string;
  createdAt: string;
}

function formatTime(iso: string): string {
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

export function InboxView() {
  const { t } = useAppLang();
  const supabase = createClient();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inbox = t.inbox;

  const loadIdeas = useCallback(async () => {
    const { data } = await supabase
      .from("inbox_ideas")
      .select("id, text, created_at")
      .order("created_at", { ascending: false });
    if (data) {
      setIdeas(data.map((r) => ({ id: r.id, text: r.text, createdAt: r.created_at })));
    }
  }, [supabase]);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  const addIdea = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("inbox_ideas")
      .insert({ user_id: user.id, text: trimmed })
      .select("id, text, created_at")
      .single();
    if (data) {
      setIdeas((prev) => [{ id: data.id, text: data.text, createdAt: data.created_at }, ...prev]);
    }
    setDraft("");
  };

  const deleteIdea = async (id: string) => {
    await supabase.from("inbox_ideas").delete().eq("id", id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.text);
  };

  const saveEdit = async (id: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    await supabase.from("inbox_ideas").update({ text: trimmed }).eq("id", id);
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
                    <span className="inbox-item-meta">{formatTime(idea.createdAt)}</span>
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
