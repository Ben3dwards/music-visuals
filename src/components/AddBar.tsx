import type { ShapeType } from "../scene/settings";

type AddItem = {
    label: string;
    shape: ShapeType | null; //null is not available yet
};

//Items that can go in a scene
const ITEMS: AddItem[] = [
    { label: "Cube", shape: "cube" },
    { label: "Sphere", shape: "sphere" },
    { label: "Model", shape: "model" },
    { label: "Light", shape: null },
    { label: "Camera", shape: null },
    { label: "Spectrum", shape: null }
];

type Props = {
    onAdd: (shape: ShapeType) => void;
}

export default function AddBar({ onAdd }: Props) {
    return (
        <nav className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-lg bg-black/60 p-1 text-sm text-white backdrop-blur">
            {ITEMS.map(({ label, shape }) =>
                shape ? (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onAdd(shape)}
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