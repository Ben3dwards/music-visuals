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
    currentShape: ShapeType;
    onPickShape: (shape: ShapeType) => void;
}

export default function AddBar({ currentShape, onPickShape }: Props) {
    return (
        <nav className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-lg bg-black/60 p-1 text-sm text-white backdrop-blur">
            {ITEMS.map(({ label, shape }) => {
                if (!shape) {
                    return (
                        <button key={label} type="button" disabled title="Coming soon" className="cursor-not-allowed rounded px-3 py-2 text-white/30">
                            {label}
                        </button>
                    );
                }

                const active = shape === currentShape;
                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onPickShape(shape)}
                        className={`rounded px-3 py-2 transition ${active ? "bg-white/20" : "text-white/70 hover:text-white"}`}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}