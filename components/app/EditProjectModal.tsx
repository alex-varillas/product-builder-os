"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Project } from "@/lib/app-data";
import { Icons } from "@/components/ui/icons";
import { useAppLang } from "./AppLanguageContext";
import { fadeIn, modalSpring } from "@/lib/motion";

const COLORS = ["#F0620A", "#6D28D9", "#15803D", "#0D9488", "#2563EB", "#A09D97"];

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (name: string, desc: string, color: string, version: string, stage: Project["stage"]) => void;
  onDelete: () => void;
}

export function EditProjectModal({ project, onClose, onSave, onDelete }: EditProjectModalProps) {
  const { t } = useAppLang();
  const p = t.projects;
  const np = t.newProject;

  const [name,       setName]       = useState(project.name);
  const [desc,       setDesc]       = useState(project.desc ?? "");
  const [color,      setColor]      = useState(project.color);
  const [version,    setVersion]    = useState(project.version ?? "");
  const [stage,      setStage]      = useState<Project["stage"]>(project.stage ?? "");
  const [confirming, setConfirming] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), desc.trim(), color, version.trim(), stage);
  };

  return (
    <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onClick={onClose}>
      <motion.div className="modal" variants={modalSpring} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{confirming ? p.deleteTitle : p.edit}</span>
          <button className="modal-close" onClick={onClose}><Icons.Close /></button>
        </div>

        {confirming ? (
          <div className="create-proj-field">
            <p className="proj-delete-text">
              {p.deleteConfirm} <strong>{project.name}</strong>. {p.deleteWarning}
            </p>
          </div>
        ) : (
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
              placeholder={np.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <input
              className="modal-input"
              placeholder={np.descPlaceholder}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <div className="edit-proj-meta">
              <input
                className="modal-input edit-proj-version"
                placeholder="Version (e.g. v0.1)"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
              <div className="edit-proj-stage-pills">
                {(["", "draft", "shipped"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`tb-preset-pill${stage === s ? " active" : ""}`}
                    onClick={() => setStage(s)}
                  >
                    {s === "" ? "—" : p.stage[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="modal-foot detail-foot">
          {confirming ? (
            <>
              <button className="app-btn" onClick={() => setConfirming(false)}>
                {p.back}
              </button>
              <div className="detail-foot-right">
                <button className="app-btn" onClick={onClose}>{t.modal.cancel}</button>
                <button className="app-btn app-btn-danger" onClick={onDelete}>{p.delete}</button>
              </div>
            </>
          ) : (
            <>
              <button className="app-btn app-btn-danger-outline" onClick={() => setConfirming(true)}>
                {p.deleteTitle}
              </button>
              <div className="detail-foot-right">
                <button className="app-btn" onClick={onClose}>{t.modal.cancel}</button>
                <button
                  className="app-btn app-btn-primary"
                  onClick={handleSave}
                  disabled={!name.trim()}
                >
                  {p.save}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
