import type { Reaction } from "../../scene/reactions";
import { ButtonGroup, ColourPicker, Slider, Toggle } from "../controls";
import ReactionControl from "../ReactionControl";
import type { ControlDef } from "./controlTypes";

type Props<T> = {
    value: T;                                 //the settings these controls edit
    controls: ControlDef<T>[];                //the descriptions
    onChange: (changes: Partial<T>) => void;  //how to save a change
};

export default function ControlList<T>({ value, controls, onChange }: Props<T>) {
    return (
        <>
        {controls.map((control) => {
            const disabled = control.disabled?.(value) ?? false;
            const current = value[control.key as keyof T];
            const set = (fieldValue: unknown) => onChange({ [control.key]: fieldValue } as Partial<T>);

            switch (control.type) {
            case "slider":
                return (
                    <Slider
                        key={control.key}
                        label={control.label}
                        value={current as number}
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        onChange={set}
                        disabled={disabled}
                    />
                );
            case "toggle":
                return <Toggle key={control.key} label={control.label} checked={current as boolean} onChange={set} />;
            case "colour":
                return (
                <ColourPicker key={control.key} label={control.label} value={current as string} onChange={set} disabled={disabled} />
                );
            case "buttons":
                return (
                <ButtonGroup key={control.key} label={control.label} options={control.options} value={current as string} onChange={set} />
                );
            case "reaction":
                return (
                <ReactionControl
                    key={control.key}
                    label={control.label}
                    reaction={current as Reaction}
                    minAmount={control.minAmount}
                    onChange={set}
                />
                );
            }
        })}
        </>
  );
}