import { ButtonGroup, Slider, Toggle } from "../controls";
import ReactionControl from "../ReactionControl";
import Section from "./Section";
import { VIEW_OPTIONS, type PanelSectionProps } from "./shared";

export default function CameraSection({ settings, onChange }: PanelSectionProps) {
    const { camera } = settings;

    return(
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
    );
}
