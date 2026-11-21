import { defaultSettings, type SettingsGroup, type VisualSettings } from "../../scene/settings";
import ControlList from "./ControlList";
import type { ControlDef } from "./controlTypes";
import Section from "./Section";
import type { PanelSectionProps } from "./shared";

type Props<K extends SettingsGroup> = PanelSectionProps & {
    group: K;
    title: string;
    controls: ControlDef<VisualSettings[K]>[];
};

export default function GroupSection<K extends SettingsGroup>({ settings, onChange, group, title, controls }: Props<K>) {
    return (
        <Section title={title} onReset={() => onChange(group, defaultSettings[group])}>
            <ControlList
                value={settings[group]}
                controls={controls}
                onChange={(changes) => onChange(group, changes)}
            />
        </Section>
    );
}