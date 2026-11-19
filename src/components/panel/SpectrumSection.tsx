import { ColourPicker, Slider, Toggle } from "../controls";
import Section from "./Section";
import type { PanelSectionProps } from "./shared";

export default function SpectrumSection({ settings, onChange }: PanelSectionProps) {
    const { spectrum } = settings;

    return (
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
                label="Grid spacing"
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
    );
}