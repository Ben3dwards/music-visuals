import type { ShapeReactions } from "../../scene/settings";
import ReactionControl from "../ReactionControl";
import Section from "./Section";
import { AXES, type PanelSectionProps } from "./shared";

export default function ReactionsSection({ settings, selectedId, onObjectChange }: PanelSectionProps) {
    const object = settings.objects.find((o) => o.id === selectedId);
    if (!object) return null;


    const { id, reactions } = object;


    function updateReactions(changes: Partial<ShapeReactions>) {
        onObjectChange(id, { reactions: { ...reactions, ...changes } });
    }

    return (
        <Section title="Reactions">
            {AXES.map((axis) => (
                <ReactionControl
                key={`stretch-${axis}`}
                label={`Stretch ${axis.toUpperCase()}`}
                reaction={reactions.stretch[axis]}
                onChange={(reaction) => updateReactions({ stretch: { ...reactions.stretch, [axis]: reaction } })}
                />
            ))}
            {AXES.map((axis) => (
                <ReactionControl
                key={`spin-${axis}`}
                label={`Spin ${axis.toUpperCase()}`}
                reaction={reactions.spin[axis]}
                minAmount={-1}
                onChange={(reaction) => updateReactions({ spin: { ...reactions.spin, [axis]: reaction } })}
                />
            ))}
            <ReactionControl
                label="Glow"
                reaction={reactions.glow}
                onChange={(glow) => updateReactions({ glow })}
            />
        </Section>
    );
}