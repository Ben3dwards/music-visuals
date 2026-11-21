import type { EntityBase } from "../../scene/settings";
import { Slider } from "../controls";
import { AXES } from "./shared";

type Props = {
    entity: EntityBase;
    onChange: (changes: Partial<EntityBase>) => void;
};

//Size and position slidres that work for any item


export default function TransformControls({ entity, onChange }: Props) {
    const positionLabel = entity.attachedTo ? "Offset" : "Position";

    return (
        <>
            <Slider
                label="Size"
                value={entity.scale}
                min={0.25}
                max={3}
                step={0.05}
                onChange={(scale) => onChange({ scale })}
            />

            {AXES.map((axis) => (
                <Slider 
                    key={`position-${axis}`}
                    label={`${positionLabel} ${axis.toUpperCase()}`}
                    value={entity.position[axis]}
                    min={-10}
                    max={10}
                    step={0.1}
                     onChange={(value) => onChange({ position: { ...entity.position, [axis]: value } })}
                />
            ))}
        </>
    );
}