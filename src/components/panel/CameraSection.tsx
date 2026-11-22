import { defaultSettings } from "../../scene/settings";
import { Select, type Option } from "../controls";
import ControlList from "./ControlList";
import { CAMERA_CONTROLS } from "./definitions";
import Section from "./Section";
import type { PanelSectionProps } from "./shared";

export default function CameraSection({ settings, onChange }: PanelSectionProps) {
    const { camera } = settings;
    const cameraItems = settings.objects.filter((o) => o.kind === "camera");

    const options: Option<string>[] = [
        { value: "", label: "Editor view" },
        ...cameraItems.map((o) => ({ value: o.id, label: o.name })),
    ];

    const liveExists = cameraItems.some((o) => o.id === camera.liveCameraId);

    return (
        <Section title="Camera" onReset={() => onChange("camera", defaultSettings.camera)}>
            <Select
                label="Live camera"
                options={options}
                value={liveExists ? camera.liveCameraId! : ""}
                onChange={(id) => onChange("camera", { liveCameraId: id || null })}
            />
            <ControlList value={camera} controls={CAMERA_CONTROLS} onChange={(changes) => onChange("camera", changes)} />
        </Section>
    );
}