import type { ReactNode } from "react";
import type { ShapeReactions, ShapeType, VisualSettings } from "../scene/settings";
import ReactionControl from "./ReactionControl";
import { ButtonGroup, ColourPicker, Slider, Toggle } from "./controls";

const AXES = ["x", "y", "z"] as const;

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
    const reactions = settings.shapeReactions;

    function updateReactions(changes: Partial<ShapeReactions>) {
        onChange({ shapeReactions: { ...reactions, ...changes } });
    }

    return (
        <aside className="absolute right-4 top-4 flex max-h-[calc(100vh-2rem)] w-64 flex-col gap-5 overflow-y-auto rounded-lg bg-black/60 p-4 text-white backdrop-blur">
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


            <Section title="Reactions">
                {AXES.map((axis) => (
                    <ReactionControl
                        key={`stretch-${axis}`}
                        label={`Stretch ${axis.toUpperCase()}`}
                        reaction={reactions.stretch[axis]}
                        onChange={(reaction) => updateReactions({ stretch: { ...reactions.stretch, [axis]: reaction } })}
                    />
                ))}
                {AXES.map((axis) => (
                    <ReactionControl
                        key={`spin-${axis}`}
                        label={`Spin ${axis.toUpperCase()}`}
                        reaction={reactions.spin[axis]}
                        onChange={(reaction) => updateReactions({ spin: { ...reactions.spin, [axis]: reaction } })}
                    />
                ))}
                <ReactionControl 
                    label="Glow" 
                    reaction={reactions.glow}
                    onChange={(glow) => updateReactions({ glow })}
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