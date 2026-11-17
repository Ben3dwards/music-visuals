import type { Reaction, TransformReactions } from "./reactions";

export type ShapeType = "cube" | "sphere" | "model";

export type ShapeReactions = TransformReactions & { glow: Reaction };

export type VisualSettings = {
    shape: ShapeType;
    shapeColour: string;
    scale: number;
    shapeReactions: ShapeReactions;
    backgroundColour: string;
    smokeEnabled: boolean;
    smokeDensity: number;
}

export const defaultSettings: VisualSettings = {
    shape: "cube",
    shapeColour: "#ff0080",
    scale: 1,
    shapeReactions: {
        stretch: {
            x: { source: "midBass", amount: 0.5 },
            y: { source: "mid", amount: 0.5 },
            z: { source: "high", amount: 1 },
        },
        spin: {
            x: { source: "none", amount: 0 },
            y: { source: "subBass", amount: 0.3 },
            z: { source: "subBass", amount: 0.3 },
        },
        glow: { source: "midBass", amount: 1},
    },
    backgroundColour: "#000000",
    smokeEnabled: true,
    smokeDensity: 0.5,
};