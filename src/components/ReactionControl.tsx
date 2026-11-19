import type { AudioSource, Reaction } from "../scene/reactions";
import { Select, Slider, type Option } from "./controls";

const SOURCE_OPTIONS: Option<AudioSource>[] = [
    { value: "none", label: "None" },
    { value: "subBass", label: "Sub bass" },
    { value: "midBass", label: "Mid bass" },
    { value: "snareBody", label: "Snare body" },
    { value: "snare", label: "Snare crack" },
    { value: "mid", label: "Mids" },
    { value: "high", label: "Highs" },
    { value: "kickPulse", label: "Kick hits" },
    { value: "snarePulse", label: "Snare hits" },
];

type Props = {
    label: string;
    reaction: Reaction;
    onChange: (reaction: Reaction) => void;
    minAmount?: number; //lowest the amount goes, for reversing such as spin direction
};

export default function ReactionControl({ label, reaction, onChange, minAmount = 0 }: Props) {
    return (
        <div className="flex flex-col gap-1 rounded bg-white/5 p-2">
            <Select
                label={label}
                options={SOURCE_OPTIONS}
                value={reaction.source}
                onChange={(source) => onChange({ ...reaction, source })}
            />
            <Slider
                label="Amount"
                value={reaction.amount}
                min={minAmount}
                max={1}
                step={0.05}
                disabled={reaction.source === "none"}
                onChange={(amount) => onChange({ ...reaction, amount })}
            />
        </div>
    );
}
