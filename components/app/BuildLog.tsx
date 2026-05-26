"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LogEntry, LogType, LOG_TYPE_CFG } from "@/lib/app-data";
import { useAppLang } from "./AppLanguageContext";
import { staggerContainer, fadeUp } from "@/lib/motion";

const LOG_TYPES: LogType[] = ["shipped", "decision", "insight", "idea"];

interface BuildLogProps {
  entries:     LogEntry[];
  onAddEntry:  (text: string, type: LogType) => void;
}

export function BuildLog({ entries, onAddEntry }: BuildLogProps) {
  const { t } = useAppLang();
  const l = t.log;

  const [type, setType] = useState<LogType>("shipped");
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAddEntry(text.trim(), type);
    setText("");
    setType("shipped");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAdd();
  };

  return (
    <div>
      <div className="log-compose">
        <div className="log-compose-types">
          {LOG_TYPES.map((tp) => {
            const cfg = LOG_TYPE_CFG[tp];
            const active = type === tp;
            return (
              <button
                key={tp}
                className={`log-type-chip${active ? " active" : ""}`}
                style={active ? { borderColor: cfg.color, color: cfg.color, background: cfg.color + "18" } : {}}
                onClick={() => setType(tp)}
              >
                {l.types[tp]}
              </button>
            );
          })}
        </div>
        <textarea
          className="log-compose-input"
          placeholder={l.addPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
        />
        <div className="log-compose-foot">
          <span className="log-compose-hint">⌘↵</span>
          <button
            className="app-btn app-btn-primary"
            style={{ fontSize: "12px", padding: "6px 14px" }}
            onClick={handleAdd}
            disabled={!text.trim()}
          >
            {l.add}
          </button>
        </div>
      </div>

      <motion.div className="log-list" variants={staggerContainer} initial="hidden" animate="visible">
        {entries.map((entry) => {
          const cfg = LOG_TYPE_CFG[entry.type];
          return (
            <motion.div key={entry.id} className="log-item" variants={fadeUp} initial="hidden" animate="visible">
              <div className="log-date">{entry.date}</div>
              <div className="log-body">
                <p className="log-text">{entry.text}</p>
                <div className="log-type-badge" style={{ color: cfg.color }}>
                  {l.types[entry.type]}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
