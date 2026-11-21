import { DEFAULT_SMOKE, DEFAULT_SPECTRUM } from "../../scene/settings";
import ControlList from "./ControlList";
import { SMOKE_CONTROLS, SPECTRUM_CONTROLS } from "./definitions";
import Section from "./Section";
import TransformControls from "./TransformControls";
import type { PanelSectionProps } from "./shared";

//Settings for a selected spectrum or smoke item
export default function EffectObjectSection({ settings, selectedId, onObjectChange, onDeleteObject }: PanelSectionProps) {
    const object = settings.objects.find((o) => o.id === selectedId);
    if (!object || object.kind === "shape") return null; // shapes have their own section

    const { id } = object;

    function reset() {
        onObjectChange(id, object!.kind === "spectrum" ? { spectrum: { ...DEFAULT_SPECTRUM } } : { smoke: { ...DEFAULT_SMOKE } });
    }

    return (
        <Section title={object.name} defaultOpen onReset={reset}>
            <button
                type="button"
                onClick={() => onDeleteObject(id)}
                className="rounded bg-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/30"
            >
                Delete {object.name}
            </button>

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
        </Section>
    );
}