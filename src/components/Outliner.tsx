import { useState } from "react";
import type { SceneObject } from "../scene/settings";

type Props = {
    objects: SceneObject[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onRename: (id: string, name: string) => void;
    onSetVisible: (id: string, visible: boolean) => void;
    onDelete: (id: string) => void;
};

export default function Outliner({ objects, selectedId, onSelect, onRename, onSetVisible, onDelete }: Props) {
    //which row is being renamed
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");

    function startRename(object: SceneObject) {
        setEditingId(object.id);
        setDraft(object.name);
    }

    function finishRename() {
        if (editingId && draft.trim()) onRename(editingId, draft.trim());
        setEditingId(null);
    }

    return (
    <aside className="absolute left-4 top-16 flex max-h-[calc(100vh-5rem)] w-56 flex-col gap-1 overflow-y-auto rounded-lg bg-black/60 p-2 text-sm text-white backdrop-blur">
      <h2 className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white/50">Scene</h2>

      {objects.length === 0 && <p className="px-2 py-1 text-white/40">Empty. Add something below.</p>}

      {objects.map((object) => {
        const selected = object.id === selectedId;
        const attachedToName = object.attachedTo
            ? objects.find((o) => o.id === object.attachedTo)?.name
            : null;

        return (
          <div
            key={object.id}
            onClick={() => onSelect(object.id)}
            className={`flex items-center gap-1 rounded px-2 py-1 ${selected ? "bg-white/20" : "hover:bg-white/10"} ${object.visible ? "" : "opacity-40"}`}
          >
            {editingId === object.id ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") finishRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1 rounded bg-white/10 px-1 text-white outline-none"
              />
            ) : (
              <span onDoubleClick={() => startRename(object)} title="Double-click to rename" className="flex min-w-0 flex-1 items-baseline gap-1">
                <span className="truncate">{object.name}</span>
                {attachedToName && <span className="shrink-0 text-xs text-white/40">on {attachedToName}</span>}
              </span>
            )}

            <button
              type="button"
              title={object.visible ? "Hide" : "Show"}
              onClick={(e) => {
                e.stopPropagation();
                onSetVisible(object.id, !object.visible);
              }}
              className="rounded px-1 text-white/50 hover:text-white"
            >
              {object.visible ? "◉" : "○"}
            </button>

            <button
              type="button"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(object.id);
              }}
              className="rounded px-1 text-white/50 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        );
      })}
    </aside>
  );
}