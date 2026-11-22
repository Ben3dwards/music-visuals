import { randomSeed } from "../../scene/random";
import { defaultSettings } from "../../scene/settings";
import { TextInput } from "../controls";
import ControlList from "./ControlList";
import { WORMHOLE_CONTROLS } from "./definitions";
import Section from "./Section";
import type { PanelSectionProps } from "./shared";

export default function WormholeSection({ settings, onChange }: PanelSectionProps) {
    if (settings.mode !== "wormhole") return null;
    const { wormhole } = settings;

    return (
        <Section title="Wormhole" defaultOpen onReset={() => onChange("wormhole", defaultSettings.wormhole)}>
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <TextInput label="Seed" value={wormhole.seed} onChange={(seed) => onChange("wormhole", { seed })} />
            </div>
            <button
            type="button"
            title="Surprise me: a random seed"
            onClick={() => onChange("wormhole", { seed: randomSeed() })}
            className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
            >
            🎲
            </button>
        </div>

        <ControlList value={wormhole} controls={WORMHOLE_CONTROLS} onChange={(changes) => onChange("wormhole", changes)} />
        </Section>
    );
}