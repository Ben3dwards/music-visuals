import type { GizmoMode } from "../scene/gizmos";

const MODES: { mode: GizmoMode; label: string; key: string }[] = [
    { mode: "move", label: "Move", key: "W" },
    { mode: "rotate", label: "Rotate", key: "E" },
    { mode: "scale", label: "Scale", key: "R" },
];

type Props = {
    mode: GizmoMode;
    onChange: (mode: GizmoMode) => void;
};

export default function GizmoToolbar({ mode, onChange }: Props) {
     return (
        <div className="absolute left-64 top-16 flex gap-1 rounded-lg bg-black/60 p-1 text-sm text-white backdrop-blur">
            {MODES.map((item) => (
                <button
                    key={item.mode}
                    type="button"
                    title={`${item.label} (${item.key})`}
                    onClick={() => onChange(item.mode)}
                    className={`rounded px-3 py-1.5 transition ${item.mode === mode ? "bg-white/20" : "text-white/60 hover:text-white"}`}
                >
                    {item.label}
                </button>
            ))}
        </div>
     );
}