import type { AddType } from "../scene/settings";

type AddItem = {
    label: string;
      type: AddType | null; // null = not available yet
};

//Items that can go in a scene
const ITEMS: AddItem[] = [
    { label: "Cube", type: "cube" },
    { label: "Sphere", type: "sphere" },
    { label: "Model", type: "model" },
    { label: "Spectrum", type: "spectrum" },
    { label: "Smoke", type: "smoke" },
    { label: "Light", type: "light" },
    { label: "Camera", type: "camera" },

];

type Props = {
    onAdd: (type: AddType) => void;
}

export default function AddBar({ onAdd }: Props) {
    return (
        <nav className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-lg bg-black/60 p-1 text-sm text-white backdrop-blur">
            {ITEMS.map(({ label, type }) =>
                type ? (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onAdd(type)}
                        className="rounded px-3 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                        + {label}
                    </button>
                ) : (
                    <button key={label} type="button" disabled title="Coming soon" className="cursor-not-allowed rounded px-3 py-2 text-white/30">
                        {label}
                    </button>
                ),
            )}
        </nav>
    );
}