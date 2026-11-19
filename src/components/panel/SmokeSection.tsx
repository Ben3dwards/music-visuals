import { ButtonGroup, ColourPicker, Slider, Toggle } from "../controls";
import Section from "./Section";
import { WIND_OPTIONS, type PanelSectionProps } from "./shared";

export default function SmokeSection({ settings, onChange }: PanelSectionProps) {
    const { smoke } = settings;

    return(
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
                label="Wind"
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
    );
}