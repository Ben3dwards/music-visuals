import type { ReactNode } from "react";
import type { ShapeReactions, ShapeType, UpdateSettings, VisualSettings, WindMode } from "../scene/settings";
import ReactionControl from "./ReactionControl";
import { ButtonGroup, ColourPicker, Slider, Toggle, type Option } from "./controls";

const AXES = ["x", "y", "z"] as const;

const SHAPE_OPTIONS: Option<ShapeType>[] = [
    { value: "cube", label: "Cube" },
    { value: "sphere", label: "Sphere" },
    { value: "model", label: "Model" },
];

const WIND_OPTIONS: Option<WindMode>[] =[
    { value: "random", label: "Random" },
    { value: "right", label: "Right" },
    { value: "left", label: "Left" },
    { value: "up", label: "Up" },
    { value: "down", label: "Down" },
];


type Props = {
    settings: VisualSettings;
    onChange: UpdateSettings;
};

export default function ControlPanel({ settings, onChange }: Props){
    const { shape, background, smoke } = settings;
    const reactions = shape.reactions;

    function updateReactions(changes: Partial<ShapeReactions>) {
        onChange("shape", { reactions: { ...reactions, ...changes } });
    }

    return (
        <aside className="absolute right-4 top-4 flex max-h-[calc(100vh-2rem)] w-72 flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-lg bg-black/60 p-4 text-white backdrop-blur [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
            <Section title="Shape" defaultOpen>
                <ButtonGroup
                    label="Type"
                    options={SHAPE_OPTIONS}
                    value={shape.type}
                    onChange={(type) => onChange("shape", { type })}  
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
                    value={background.colour}
                    onChange={(colour) => onChange("background", { colour })}
                />
            </Section>  

            <Section title="Smoke">
                <Toggle
                    label="Enabled"
                    checked={smoke.enabled}
                    onChange={(enabled) => onChange("smoke", { enabled })}
                />
                <Slider
                    label="Density"
                    value={smoke.density}
                    min={0}
                    max={2}
                    step={0.05}
                     onChange={(density) => onChange("smoke", { density })}
                    disabled={!smoke.enabled}
                />
                <Slider
                    label="Spread"
                    value={smoke.spread}
                    min={0.5}
                    max={3}
                    step={0.05}
                    onChange={(spread) => onChange("smoke", { spread })}
                    disabled={!smoke.enabled}
                />
                <Slider
                    label="Puff size"
                    value={smoke.size}
                    min={0.25}
                    max={3}
                    step={0.05}
                    onChange={(size) => onChange("smoke", { size })}
                    disabled={!smoke.enabled}
                />
                <ColourPicker
                    label="Colour A"
                    value={smoke.colourA}
                    onChange={(colourA) => onChange("smoke", { colourA })}
                    disabled={!smoke.enabled}
                />
                <ColourPicker
                    label="Colour B"
                    value={smoke.colourB}
                    onChange={(colourB) => onChange("smoke", { colourB })}
                    disabled={!smoke.enabled}
                />
                <ButtonGroup
                label="wind"
                options={WIND_OPTIONS}
                value={smoke.windMode}
                onChange={(windMode) => onChange("smoke", { windMode })}
                />
                <Slider
                    label="Wind strength"
                    value={smoke.wind}
                    min={0}
                    max={3}
                    step={0.05}
                    onChange={(wind) => onChange("smoke", { wind })}
                    disabled={!smoke.enabled}
                />
            </Section>
        </aside>
    );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
    return (
        <details open={defaultOpen} className="group flex flex-col">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white/80">
                {title}
                <span className="transition group-open:rotate-90">›</span>
            </summary>
            <div className="mt-3 flex flex-col gap-3">{children}</div>
        </details>
    );
}