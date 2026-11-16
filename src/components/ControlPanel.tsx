import type { ReactNode } from "react";
import type { ShapeType, VisualSettings } from "../scene/settings";
import { ButtonGroup, ColourPicker, Slider, Toggle } from "./controls";

const SHAPE_OPTIONS: { value: ShapeType; label: string }[] = [
    { value: "cube", label: "Cube" },
    { value: "sphere", label: "Sphere" },
    { value: "model", label: "Model" },
];


type Props = {
    settings: VisualSettings;
    onChange: (changes: Partial<VisualSettings>) => void;
};

export default function ControlPanel({ settings, onChange }: Props){
    return (
        <aside className="absolute right-4 top-4 flex w-64 flex-col gap-5 rounded-lg bg-black/60 p-4 text-white backdrop-blur">
            <Section title="Shape">
                <ButtonGroup 
                    label="Type"
                    options={SHAPE_OPTIONS}
                    value={settings.shape}
                    onChange={(shape) => onChange({ shape })}    
                />
                <ColourPicker 
                    label="Colour"
                    value={settings.shapeColour}
                    onChange={(shapeColour) => onChange({ shapeColour })}
                    disabled={settings.shape === "model"}   
                />
                <Slider
                    label="Size"
                    value={settings.scale}
                    min={0.25}
                    max={3}
                    step={0.05}
                    onChange={(scale) => onChange({ scale })}
                />      
            </Section>

            <Section title="Background">
                <ColourPicker
                    label="Colour"
                    value={settings.backgroundColour}
                    onChange={(backgroundColour) => onChange({ backgroundColour })}
                />
            </Section>  

            <Section title="Smoke">
                <Toggle
                    label="Enabled"
                    checked={settings.smokeEnabled}
                    onChange={(smokeEnabled) => onChange({ smokeEnabled })}
                />
                <Slider
                    label="Density"
                    value={settings.smokeDensity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(smokeDensity) => onChange({ smokeDensity })}
                    disabled={!settings.smokeEnabled}
                />
            </Section>
        </aside>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">{title}</h2>
            {children}
        </section>
    );
}