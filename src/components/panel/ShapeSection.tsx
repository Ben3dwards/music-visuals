import { MODELS } from "../../scene/models";
import { ButtonGroup, ColourPicker, FileButton, Select, Slider, Toggle, type Option } from "../controls";
import Section from "./Section";
import { AXES, FINISH_OPTIONS, SHAPE_OPTIONS, type PanelSectionProps } from "./shared";


export default function ShapeSection({ settings, onChange }: PanelSectionProps) {
    const { shape } = settings;

    // Built-in models, plus the user's upload if they've picked one
    const isCustomModel = !MODELS.some((model) => model.url === shape.modelUrl);
    const modelOptions: Option<string>[] = [
        ...MODELS.map(({ label, url }) => ({ value: url, label })),
        ...(isCustomModel ? [{ value: shape.modelUrl, label: "Your model" }] : []),
    ];

    function uploadModel(file: File) {
        if (shape.modelUrl.startsWith("blob:")) URL.revokeObjectURL(shape.modelUrl);
        onChange("shape", { type: "model", modelUrl: URL.createObjectURL(file) });
    }

    return (
        <Section title="Shape" defaultOpen>
            <ButtonGroup 
                label="Type"
                options={SHAPE_OPTIONS}
                value={shape.type}
                onChange={(type) => onChange("shape", { type })}
            />

            {shape.type === "model" && (
                <>
                    <Select 
                        label="Model"
                        options={modelOptions}
                        value={shape.modelUrl}
                        onChange={(modelUrl) => onChange("shape", { modelUrl })}
                    />
                    <FileButton label="Upload .glb…" accept=".glb" onFile={uploadModel} />
                    {AXES.map((axis) => (
                        <Slider
                            key={`rotate-${axis}`}
                            label={`Rotate ${axis.toUpperCase()}`}
                            value={shape.rotation[axis]}
                            min={-180}
                            max={180}
                            step={15}
                            onChange={(degrees) => onChange("shape", { rotation: { ...shape.rotation, [axis]: degrees } })}
                        />
                    ))}
                </>
            )}

            <ButtonGroup
                label="Finish"
                options={FINISH_OPTIONS}
                value={shape.finish}
                onChange={(finish) => onChange("shape", { finish })}
            />

            <ColourPicker
                label="Colour"
                value={shape.colour}
                onChange={(colour) => onChange("shape", { colour })}
                disabled={shape.type === "model"}
            />

            <Slider
                label="Size"
                value={shape.scale}
                min={0.25}
                max={3}
                step={0.05}
                onChange={(scale) => onChange("shape", { scale })}
            />

            <Slider
                label="Bloom"
                value={shape.bloom}
                min={0}
                max={2}
                step={0.05}
                onChange={(bloom) => onChange("shape", { bloom })}
            />

            <Toggle
                label="Border"
                checked={shape.border.enabled}
                onChange={(enabled) => onChange("shape", { border: { ...shape.border, enabled } })}
            />

            <ColourPicker
                label="Border colour"
                value={shape.border.colour}
                onChange={(colour) => onChange("shape", { border: { ...shape.border, colour } })}
                disabled={!shape.border.enabled}
            />

            <Slider
                label="Border width"
                value={shape.border.width}
                min={0}
                max={1}
                step={0.05}
                onChange={(width) => onChange("shape", { border: { ...shape.border, width } })}
                disabled={!shape.border.enabled}
            />
        </Section>
    );
}