import type { TransformNode } from "@babylonjs/core";
import type { Bands } from "../audio/audioAnalyser";
import type { AudioFeatures } from "../audio/audioFeatures";

//anything a reaction can listen to
export type AudioSource = "none" | keyof Bands | "kickPulse" | "snarePulse";

//this source drives a property of this much (0-1)
export type Reaction = { source: AudioSource; amount: number};


export type Axes<T> = { x: T, y: T; z: T};

//reactions that move any object
export type TransformReactions = {
    stretch: Axes<Reaction>;
    spin: Axes<Reaction>;
};

const MAX_STRETCH = 3;  
const MAX_SPIN = 0.1;   // radians per frame at full amount


//How strong a reaction is right now
export function readReaction({ source, amount }: Reaction, features: AudioFeatures): number {
    if (source === "none") return 0;
    if (source === "kickPulse") return features.kickPulse * amount;
    if (source === "snarePulse") return features.snarePulse * amount;
    return features.bands[source] * amount;
}

//applies stratch and spin reactions to any object
export function applyTransformReactions(node: TransformNode, reactions: TransformReactions,features: AudioFeatures,baseScale = 1,) {
    const { stretch, spin } = reactions;

    node.scaling.set(
        baseScale * (1 + readReaction(stretch.x, features) * MAX_STRETCH),
        baseScale * (1 + readReaction(stretch.y, features) * MAX_STRETCH),
        baseScale * (1 + readReaction(stretch.z, features) * MAX_STRETCH),
    );

    node.rotation.x += readReaction(spin.x, features) * MAX_SPIN;
    node.rotation.y += readReaction(spin.y, features) * MAX_SPIN;
    node.rotation.z += readReaction(spin.z, features) * MAX_SPIN;
}