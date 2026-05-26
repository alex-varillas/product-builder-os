"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";
import { fadeIn, modalSpring } from "@/lib/motion";

const COLORS = ["#F0620A", "#6D28D9", "#15803D", "#0D9488", "#2563EB", "#A09D97"];

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (name: string, desc: string, color: string) => void;
}

export function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const { t } = useAppLang();
  const m = t.newProject;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  return (
    <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={onClose}>
      <motion.div className="modal" variants={modalSpring} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{m.title}</span>
          <button className="modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>

        <div className="create-proj-field">
          <div className="color-row">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch${color === c ? " active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <input
            className="modal-input"
            placeholder={m.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="modal-input"
            placeholder={m.descPlaceholder}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="modal-foot">
          <button className="app-btn" onClick={onClose}>{m.cancel}</button>
          <button
            className="app-btn app-btn-primary"
            onClick={() => onCreate(name, desc, color)}
            disabled={!name.trim()}
          >
            {m.create}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
