import { ButtonGroup, Slider } from "../controls";
import ReactionControl from "../ReactionControl";
import Section from "./Section";
import { LIGHT_OPTIONS, type PanelSectionProps } from "./shared";

export default function LightingSection({ settings, onChange }: PanelSectionProps) {
    const { lighting } = settings;

    return (
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
    );
}