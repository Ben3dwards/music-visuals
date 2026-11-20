import { MODELS } from "../../scene/models";
import type { SceneObject } from "../../scene/settings";
import { ButtonGroup, ColourPicker, FileButton, Select, Slider, Toggle, type Option } from "../controls";
import Section from "./Section";
import { AXES, FINISH_OPTIONS, SHAPE_OPTIONS, type PanelSectionProps } from "./shared";


export default function ShapeSection({ settings, selectedId, onObjectChange }: PanelSectionProps) {
    //find the object being edited, nothing selected - show nothing
    const shape = settings.objects.find((object) => object.id === selectedId);
    if (!shape) return null; 

    const update = (changes: Partial<SceneObject>) => onObjectChange(shape.id, changes);

    // Built-in models, plus the user's upload if they've picked one
    const isCustomModel = !MODELS.some((model) => model.url === shape.modelUrl);
    const modelOptions: Option<string>[] = [
        ...MODELS.map(({ label, url }) => ({ value: url, label })),
        ...(isCustomModel ? [{ value: shape.modelUrl, label: "Your model" }] : []),
    ];

    function uploadModel(file: File) {
        if (shape!.modelUrl.startsWith("blob:")) URL.revokeObjectURL(shape!.modelUrl);
        update({ type: "model", modelUrl: URL.createObjectURL(file) });
    }

    return (
        <Section title="Shape" defaultOpen>
            <ButtonGroup 
                label="Type"
                options={SHAPE_OPTIONS}
                value={shape.type}
                onChange={(type) => update({ type })}
            />

            {shape.type === "model" && (
                <>
                    <Select 
                        label="Model"
                        options={modelOptions}
                        value={shape.modelUrl}
                        onChange={(modelUrl) => update({ modelUrl })}
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
                            onChange={(degrees) => update({ rotation: { ...shape.rotation, [axis]: degrees } })}
                        />
                    ))}
                </>
            )}

            <ButtonGroup
                label="Finish"
                options={FINISH_OPTIONS}
                value={shape.finish}
                onChange={(finish) => update({ finish })}
            />

            <ColourPicker
                label="Colour"
                value={shape.colour}
                 onChange={(colour) => update({ colour })}
                disabled={shape.type === "model"}
            />

            <Slider
                label="Size"
                value={shape.scale}
                min={0.25}
                max={3}
                step={0.05}
                onChange={(scale) => update({ scale })}
            />

            <Slider
                label="Bloom"
                value={shape.bloom}
                min={0}
                max={2}
                step={0.05}
                onChange={(bloom) => update({ bloom })}
            />

            <Toggle
                label="Border"
                checked={shape.border.enabled}
                onChange={(enabled) => update({ border: { ...shape.border, enabled } })}
            />

            <ColourPicker
                label="Border colour"
                value={shape.border.colour}
                onChange={(colour) => update({ border: { ...shape.border, colour } })}
                disabled={!shape.border.enabled}
            />

            <Slider
                label="Border width"
                value={shape.border.width}
                min={0}
                max={1}
                step={0.05}
                onChange={(width) => update({ border: { ...shape.border, width } })}
                disabled={!shape.border.enabled}
            />
        </Section>
    );
}