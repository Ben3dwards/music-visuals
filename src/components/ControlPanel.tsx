import type { ReactNode } from "react";
import type { BackgroundMode, CameraView, LightType, ShapeFinish, ShapeReactions, ShapeType, UpdateSettings, VisualSettings, WindMode } from "../scene/settings";
import ReactionControl from "./ReactionControl";
import { ButtonGroup, ColourPicker, FileButton, Select, Slider, Toggle, type Option } from "./controls";
import { BACKGROUND_IMAGES } from "../scene/backgroundImages";
import { MODELS } from "../scene/models";

const AXES = ["x", "y", "z"] as const;

const BACKGROUND_MODE_OPTIONS: Option<BackgroundMode>[] = [
    { value: "colour", label: "Colour" },
    { value: "image", label: "Image" },
];

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

const FINISH_OPTIONS: Option<ShapeFinish>[] =[
    { value: "glow", label: "Glow"},
    { value: "lit", label: "Lit"},
];

const LIGHT_OPTIONS: Option<LightType>[] =[
    { value: "ambient", label: "Ambient" },
    { value: "point", label: "Point" },
    { value: "directional", label: "Directional" },
]

const VIEW_OPTIONS: Option<CameraView>[] = [
    { value: "front", label: "Front" },
    { value: "angled", label: "Angled" },
    { value: "side", label: "Side" },
    { value: "top", label: "Top" },
]


type Props = {
    settings: VisualSettings;
    onChange: UpdateSettings;
};

export default function ControlPanel({ settings, onChange }: Props){
    const { shape, lighting, camera, spectrum, background, smoke } = settings;
    const reactions = shape.reactions;

    function updateReactions(changes: Partial<ShapeReactions>) {
        onChange("shape", { reactions: { ...reactions, ...changes } });
    }

    const isCustomImage = !BACKGROUND_IMAGES.some((image) => image.url === background.imageUrl);
    const imageOptions: Option<string>[] = [
        ...BACKGROUND_IMAGES.map(({ label, url }) => ({ value: url, label })),
        ...(isCustomImage ? [{ value: background.imageUrl, label: "Your image" }] : []),
    ];

    function uploadBackground(file: File) {
        if (background.imageUrl.startsWith("blob:")) URL.revokeObjectURL(background.imageUrl);
        onChange("background", { mode: "image", imageUrl: URL.createObjectURL(file) });
    }

    const isCustomModel = !MODELS.some((model) => model.url === shape.modelUrl);
    const modelOptions: Option<string>[] = [
        ...MODELS.map(({ label, url }) => ({ value: url, label })),
        ...(isCustomModel ? [{ value: shape.modelUrl, label: "Your model" }] : []),
    ];

    function uploadModel(file: File){
        if (shape.modelUrl.startsWith("blob:")) URL.revokeObjectURL(shape.modelUrl);
        onChange("shape", { type: "model", modelUrl: URL.createObjectURL(file) });
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

            <Section title="Lighting">
                <ButtonGroup 
                    label="Light"
                    options={LIGHT_OPTIONS}
                    value={lighting.type}
                    onChange={(type) => onChange("lighting", { type })}
                />

                <Slider 
                    label="Intensity"
                    value={lighting.intensity}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(intensity) => onChange("lighting", { intensity })}
                />

                <Slider 
                    label="Glow"
                    value={lighting.glow}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(glow) => onChange("lighting", { glow })}
                />

                <Slider 
                    label="Glow spread"
                    value={lighting.glowSpread}
                    min={8}
                    max={128}
                    step={1}
                    onChange={(glowSpread) => onChange("lighting", { glowSpread })}
                />

                <ReactionControl 
                    label="Flash"
                    reaction={lighting.flash}
                    onChange={(flash) => onChange("lighting", { flash })}
                />
            </Section>


            <Section title="Camera">
                <ButtonGroup
                    label="View"
                    options={VIEW_OPTIONS}
                    value={camera.view}
                    onChange={(view) => onChange("camera", { view })}
                />

                <Slider
                    label="Distance"
                    value={camera.distance}
                    min={2}
                    max={15}
                    step={0.1}
                    onChange={(distance) => onChange("camera", { distance })}
                />

                <Slider
                    label="Orbit"
                    value={camera.orbit}
                    min={-2}
                    max={2}
                    step={0.05}
                    onChange={(orbit) => onChange("camera", { orbit })}
                />

                <Toggle
                    label="Free look (drag)"
                    checked={camera.freeLook}
                    onChange={(freeLook) => onChange("camera", { freeLook })}
                />

                <ReactionControl
                    label="Punch"
                    reaction={camera.punch}
                    onChange={(punch) => onChange("camera", { punch })}
                />

            </Section>


            <Section title="Spectrum">
                <Toggle 
                    label="Ring"
                    checked={spectrum.ring}
                    onChange={(ring) => onChange("spectrum", { ring })}
                />
                <Toggle 
                    label="Grid"
                    checked={spectrum.grid}
                    onChange={(grid) => onChange("spectrum", { grid })}
                />

                <ColourPicker 
                    label="Colour"
                    value={spectrum.colour}
                    onChange={(colour) => onChange("spectrum", { colour })}
                />

                <Slider 
                    label="Brightness"
                    value={spectrum.brightness}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(brightness) => onChange("spectrum", { brightness })}
                />

                <Slider 
                    label="Bloom"
                    value={spectrum.bloom}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(bloom) => onChange("spectrum", { bloom })}
                />

                <Slider 
                    label="Bar width"
                    value={spectrum.barWidth}
                    min={0.2}
                    max={1.5}
                    step={0.05}
                    onChange={(barWidth) => onChange("spectrum", { barWidth })}
                />

                <Slider 
                    label="Bar height"
                    value={spectrum.height}
                    min={0.25}
                    max={3}
                    step={0.05}
                    onChange={(height) => onChange("spectrum", { height })}
                />

                <Slider 
                    label="Grid Spacing"
                    value={spectrum.gridSpacing}
                    min={0.5}
                    max={3}
                    step={0.05}
                    onChange={(gridSpacing) => onChange("spectrum", { gridSpacing })}
                    disabled={!spectrum.grid}
                />

                <Slider 
                    label="Depth fade"
                    value={spectrum.fade}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(fade) => onChange("spectrum", { fade })}
                    disabled={!spectrum.grid}
                />

                <Slider 
                    label="Ring size"
                    value={spectrum.radius}
                    min={0.5}
                    max={3}
                    step={0.05}
                    onChange={(radius) => onChange("spectrum", { radius })}
                    disabled={!spectrum.ring}
                />

            </Section>

            <Section title="Background">
                <ButtonGroup
                    label="Type"
                    options={BACKGROUND_MODE_OPTIONS}
                    value={background.mode}
                    onChange={(mode) => onChange("background", { mode })}
                />
                <ColourPicker
                    label="Colour"
                    value={background.colour}
                    onChange={(colour) => onChange("background", { colour })}
                />
                {background.mode === "image" && (
                    <>
                        <Select
                            label="Image"
                            options={imageOptions}
                            value={background.imageUrl}
                            onChange={(imageUrl) => onChange("background", { imageUrl })}
                        />
                        <FileButton label="Upload your own…" accept="image/*" onFile={uploadBackground} />
                        <Slider
                            label="Brightness"
                            value={background.brightness}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(brightness) => onChange("background", { brightness })}
                        />
                        <Slider
                            label="Spin"
                            value={background.spin}
                            min={-2}
                            max={2}
                            step={0.05}
                            onChange={(spin) => onChange("background", { spin })}
                        />
                    </>
                )}
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