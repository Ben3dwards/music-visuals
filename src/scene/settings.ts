import type { Reaction, TransformReactions } from "./reactions";

export type ShapeType = "cube" | "sphere" | "model";
export type ShapeReactions = TransformReactions & { glow: Reaction };

export type ShapeSettings = {
    type: ShapeType;
    colour: string; // hex
    scale: number;  // 1 = normal size
    reactions: ShapeReactions;
};

export type BackgroundSettings ={
    colour: string;
}

export type WindMode = "random" | "left" | "right" | "up" | "down";


export type SmokeSettings = {
    enabled: boolean;
    density: number; //0-2
    spread: number; //how far out it spawns
    size: number; //puff size
    colourA: string;
    colourB: string;
    windMode: WindMode;
    wind: number;
};


export type VisualSettings = {
    shape: ShapeSettings;
    background: BackgroundSettings;
    smoke: SmokeSettings
};

// Updates part of one settings group, e.g. updateSettings("smoke", { density: 0.8 }) 
export type UpdateSettings = <K extends keyof VisualSettings>(
    group: K,
    changes: Partial<VisualSettings[K]>,
) => void;

export const defaultSettings: VisualSettings = {
    shape: {
        type: "cube",
        colour: "#ff0080",
        scale: 1,
        reactions: {
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
    },

    background: { colour: "#000000", },
    
    smoke: {
        enabled: true, 
        density: 0.5, 
        spread: 1, 
        size: 1,
        colourA: "#ff0080",
        colourB: "#4d00ff",
        windMode: "random",
        wind: 1,
    },
};