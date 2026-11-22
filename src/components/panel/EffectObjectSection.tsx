import { DEFAULT_CAMERA_ITEM, DEFAULT_LIGHT, DEFAULT_SMOKE, DEFAULT_SPECTRUM } from "../../scene/settings";
import { Select, type Option } from "../controls";
import ControlList from "./ControlList";
import { CAMERA_ITEM_CONTROLS, LIGHT_CONTROLS, SMOKE_CONTROLS, SPECTRUM_CONTROLS } from "./definitions";
import Section from "./Section";
import TransformControls from "./TransformControls";
import type { PanelSectionProps } from "./shared";

//Settings for a selected spectrum or smoke item
export default function EffectObjectSection({ settings, selectedId, onObjectChange, onDeleteObject }: PanelSectionProps) {
    const object = settings.objects.find((o) => o.id === selectedId);
    if (!object || object.kind === "shape") return null; // shapes have their own section

    const { id } = object;

    const reset = () => {
        if (object.kind === "spectrum") onObjectChange(id, { spectrum: { ...DEFAULT_SPECTRUM } });
        if (object.kind === "smoke") onObjectChange(id, { smoke: { ...DEFAULT_SMOKE } });
        if (object.kind === "light") onObjectChange(id, { light: { ...DEFAULT_LIGHT, flash: { ...DEFAULT_LIGHT.flash } } });
        if (object.kind === "camera") onObjectChange(id, { camera: { ...DEFAULT_CAMERA_ITEM, punch: { ...DEFAULT_CAMERA_ITEM.punch } } });
        
    }

    const targetOptions: Option<string>[] = [
        { value: "", label: "Nothing (free)" },
        ...settings.objects.filter((o) => o.kind === "shape").map((o) => ({ value: o.id, label: o.name })),
        ];


    const setAttachment = (targetId: string) => {
        if (targetId) {
            // Attach: snap to the object's centre
            onObjectChange(id, { attachedTo: targetId, position: { x: 0, y: 0, z: 0 } });
        }else{
            // Detach: stay where the object is, rather than jumping to the middle of the scene
            const target = settings.objects.find((o) => o.id === object.attachedTo);
            onObjectChange(id, { attachedTo: null, position: target ? { ...target.position } : object.position });
        }
    };

    return (
        <Section title={object.name} defaultOpen onReset={reset}>
            <button
                type="button"
                onClick={() => onDeleteObject(id)}
                className="rounded bg-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/30"
            >
                Delete {object.name}
            </button>

            <Select
                label="Attached to"
                options={targetOptions}
                value={object.attachedTo ?? ""}
                onChange={setAttachment}
            />

            <TransformControls entity={object} onChange={(changes) => onObjectChange(id, changes)} />

            {object.kind === "spectrum" && (
                <ControlList
                value={object.spectrum}
                controls={SPECTRUM_CONTROLS}
                onChange={(changes) => onObjectChange(id, { spectrum: { ...object.spectrum, ...changes } })}
                />
            )}

            {object.kind === "smoke" && (
                <ControlList
                value={object.smoke}
                controls={SMOKE_CONTROLS}
                onChange={(changes) => onObjectChange(id, { smoke: { ...object.smoke, ...changes } })}
                />
            )}

            {object.kind === "light" && (
                <ControlList
                    value={object.light}
                    controls={LIGHT_CONTROLS}
                    onChange={(changes) => onObjectChange(id, { light: { ...object.light, ...changes } })}
                />
            )}

            {object.kind === "camera" && (
                <ControlList
                    value={object.camera}
                    controls={CAMERA_ITEM_CONTROLS}
                    onChange={(changes) => onObjectChange(id, { camera: { ...object.camera, ...changes } })}
                />
            )}
        </Section>
    );
}