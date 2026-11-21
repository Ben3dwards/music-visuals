import type { Axes, Reaction, TransformReactions } from "./reactions";
import { BACKGROUND_IMAGES } from "./backgroundImages";
import { MODELS } from "./models";

export type ShapeType = "cube" | "sphere" | "model";
export type ShapeReactions = TransformReactions & { glow: Reaction };

export type SceneObject = {
    id: string;
    name: string;
    type: ShapeType;
    finish: ShapeFinish;
    colour: string; // hex
    scale: number;  // 1 = normal size
    bloom: number;
    border:BorderSettings;
    reactions: ShapeReactions;
    modelUrl: string; // which model to show when type is "model"
    rotation: Axes<number>;
    position: Axes<number>;
    visible: boolean; 
    
};

export type ObjectTransform = Pick<SceneObject, "position" | "rotation" | "scale">;

//Spectrum visualisor
export type SpectrumSettings = {
    ring: boolean; 
    grid: boolean;
    colour: string;
    brightness: number;
    bloom: number; // how much the bar glows
    barWidth: number; // 1= bars touching, smaller num = smaller gaps
    height: number; //how tall bars get
    radius: number; // ring size
    fade: number;
    gridSpacing: number; // space between grid bars
}

export type BorderSettings = {
    enabled: boolean;
    colour: string;
    width: number;
}


export type CameraView = "front" | "angled" | "side" | "top";
export type CameraSettings = {
    view: CameraView;
    distance: number;
    orbit: number;
    freeLook: boolean;
    punch: Reaction;
};


export type BackgroundMode = "colour" | "image";

export type BackgroundSettings ={
    mode: BackgroundMode;
    colour: string;
    imageUrl: string;
    brightness: number;
    spin: number; //rotates image
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


export type ShapeFinish = "glow" | "lit";
export type LightType= "ambient" | "point" | "directional";

export type LightingSettings = {
    type: LightType;
    intensity: number;
    glow: number;
    glowSpread: number;
    flash: Reaction;
};


export type VisualSettings = {
    objects: SceneObject[];
    lighting: LightingSettings;
    camera: CameraSettings;
    spectrum: SpectrumSettings;
    background: BackgroundSettings;
    smoke: SmokeSettings
};


//Settings groups, everything except the object list
export type SettingsGroup = Exclude<keyof VisualSettings, "objects">;

// Updates part of one settings group, e.g. updateSettings("smoke", { density: 0.8 }) 
export type UpdateSettings = <K extends SettingsGroup>(
    group: K,
    changes: Partial<VisualSettings[K]>,
) => void;

//Updates part of one object. updateObject(id, { Colour: "00ffff" })
export type UpdateObject = (id: string, changes: Partial<SceneObject>) => void;

const TYPE_NAMES: Record<ShapeType, string> = { cube: "Cube", sphere: "Sphere", model: "Model" };

//readable name for a new object
export function nextObjectName(type: ShapeType, objects: SceneObject[]): string {
    const count = objects.filter((object) => object.type === type).length;
    return `${TYPE_NAMES[type]} ${count + 1}`;
}

export function spawnPosition(index: number): Axes<number> {
    const step = Math.ceil(index / 2) * 2;
    const x = index === 0 ? 0 : index % 2 === 1 ? step : -step;
    return { x, y: 0, z: 0 };
}

//Create a new object with default settings.
export function createObject(type: ShapeType = "cube", overrides: Partial<SceneObject> = {}): SceneObject {
    return {
        id:crypto.randomUUID(),
        name: `${TYPE_NAMES[type]} 1`,
        type,
        modelUrl: MODELS[0].url,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 180, z: 0},
        finish: "glow",
        colour: "#ff0080",
        scale: 1,
        bloom: 1,
        border: { enabled: true, colour: "#000000", width: 0.25},
        reactions: {
            stretch: {
                x: { source: "midBass", amount: 0.5 },
                y: { source: "mid", amount: 0.5 },
                z: { source: "high", amount: 1 },
            },
            spin:{
                x: { source: "none", amount: 0 },
                y: { source: "subBass", amount: 0.3 },
                z: { source: "subBass", amount: 0.3 },
            },
            glow: { source: "midBass", amount: 1 },
        },
        visible: true,
        ...overrides,
    };
}


export const defaultSettings: VisualSettings = {
    objects: [createObject("cube")],
    
    lighting: {
        type: "ambient",
        intensity: 1,
        glow: 0.6,
        glowSpread: 32,
        flash: { source: "none", amount: 0 },
    },

    camera: {
        view: "front",
        distance: 5,
        orbit: 0,
        freeLook: true,
        punch: { source: "none", amount: 0 },
    },

    spectrum: {
        ring: true,
        grid: false,
        colour: "#00e5ff",
        brightness: 0.6,
        bloom: 0.4,
        barWidth: 0.7,
        height: 1,
        radius: 1,
        fade: 0.85,
        gridSpacing: 1,
    },

    background: { 
        mode: "colour",
        colour: "#000000",
        imageUrl: BACKGROUND_IMAGES[0].url,
        brightness: 1,
        spin: 0,
    },
    
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