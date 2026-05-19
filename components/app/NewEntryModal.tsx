"use client";

import { useState } from "react";
import { LogType, LOG_TYPE_CFG } from "@/lib/app-data";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";

const LOG_TYPES: LogType[] = ["shipped", "decision", "insight", "idea"];

interface NewEntryModalProps {
  onClose: () => void;
  onAdd:   (text: string, type: LogType) => void;
}

export function NewEntryModal({ onClose, onAdd }: NewEntryModalProps) {
  const { t } = useAppLang();
  const [type, setType] = useState<LogType>("shipped");
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), type);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{t.modal.newEntry}</span>
          <button className="modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>

        <div className="type-pills">
          {LOG_TYPES.map((tp) => {
            const cfg = LOG_TYPE_CFG[tp];
            const active = type === tp;
            return (
              <button
                key={tp}
                className={`type-pill${active ? " active" : ""}`}
                style={active ? { borderColor: cfg.color, color: cfg.color, background: cfg.color + "18" } : {}}
                onClick={() => setType(tp)}
              >
                {t.modal.types[tp]}
              </button>
            );
          })}
        </div>

        <textarea
          className="modal-textarea"
          placeholder={t.modal.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />

        <div className="modal-foot">
          <button className="app-btn" onClick={onClose}>{t.modal.cancel}</button>
          <button
            className="app-btn app-btn-primary"
            onClick={handleAdd}
            disabled={!text.trim()}
          >
            {t.modal.add}
          </button>
        </div>
      </div>
    </div>
  );
}
