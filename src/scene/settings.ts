import type { Axes, Reaction, TransformReactions } from "./reactions";
import { BACKGROUND_IMAGES } from "./backgroundImages";
import { MODELS } from "./models";

//Shared building blocks
export type ShapeType = "cube" | "sphere" | "model";
export type ShapeFinish = "glow" | "lit";
export type ShapeReactions = TransformReactions & { glow: Reaction };

export type BorderSettings = {
    enabled: boolean;
    colour: string; //hex
    width: number;
};

export type SpectrumSettings = {
    ring: boolean;
    grid: boolean;
    colour: string;
    brightness: number;
    bloom: number;
    barWidth: number;
    height: number;
    radius: number;      //ring size
    fade: number;        //grid depth fade
    gridSpacing: number;
};

export type WindMode = "random" | "left" | "right" | "up" | "down";

export type SmokeSettings = {
    enabled: boolean;
    density: number;
    spread: number;
    size: number;
    colourA: string;
    colourB: string;
    windMode: WindMode;
    wind: number;
};


//Scene items
export type EntityBase = {
    id: string;
    name: string;
    position: Axes<number>;
    rotation: Axes<number>; // degrees
    scale: number;
    visible: boolean;
};

export type ShapeObject = EntityBase & {
    kind: "shape";
    type: ShapeType;
    modelUrl: string;
    finish: ShapeFinish;
    colour: string;
    bloom: number;
    border: BorderSettings;
    reactions: ShapeReactions;
};

export type SpectrumObject = EntityBase & {
    kind: "spectrum";
    spectrum: SpectrumSettings;
};

export type SmokeObject = EntityBase & {
    kind: "smoke";
    smoke: SmokeSettings;
};


export type SceneObject = ShapeObject | SpectrumObject | SmokeObject;

export type AddType = ShapeType | "spectrum" | "smoke";

export type ObjectTransform = Pick<EntityBase, "position" | "rotation" | "scale">;



//Scene wide settings

export type CameraView = "front" | "angled" | "side" | "top";
export type CameraSettings = {
    view: CameraView;
    distance: number;
    orbit: number;
    freeLook: boolean;
    punch: Reaction;
};

export type BackgroundMode = "colour" | "image";
export type BackgroundSettings = {
    mode: BackgroundMode;
    colour: string;
    imageUrl: string;
    brightness: number;
    spin: number;
};

export type LightType = "ambient" | "point" | "directional";
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
    background: BackgroundSettings;
};

export type SettingsGroup = Exclude<keyof VisualSettings, "objects">;

export type UpdateSettings = <K extends SettingsGroup>(group: K, changes: Partial<VisualSettings[K]>) => void;

export type UpdateObject = (id: string, changes: Partial<SceneObject>) => void;



//Defaults and factories

export const DEFAULT_SPECTRUM: SpectrumSettings = {
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
};

export const DEFAULT_SMOKE: SmokeSettings = {
    enabled: true,
    density: 0.5,
    spread: 1,
    size: 1,
    colourA: "#ff0080",
    colourB: "#4d00ff",
    windMode: "random",
    wind: 1,
};

const TYPE_NAMES: Record<AddType, string> = {
    cube: "Cube",
    sphere: "Sphere",
    model: "Model",
    spectrum: "Spectrum",
    smoke: "Smoke",
};


function baseEntity(type: AddType): EntityBase {
    return {
        id: crypto.randomUUID(),
        name: `${TYPE_NAMES[type]} 1`,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        visible: true,
    };
}

/** Creates a new shape with default settings */
export function createObject(type: ShapeType = "cube", overrides: Partial<ShapeObject> = {}): ShapeObject {
    return {
        ...baseEntity(type),
        kind: "shape",
        type,
        modelUrl: MODELS[0].url,
        rotation: { x: 0, y: 180, z: 0 }, // so models face the camera
        finish: "glow",
        colour: "#ff0080",
        bloom: 1,
        border: { enabled: true, colour: "#000000", width: 0.25 },
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
                glow: { source: "midBass", amount: 1 },
            },
        ...overrides,
    };
}

/** Creates a new spectrum with default settings. */
export function createSpectrumObject(overrides: Partial<SpectrumObject> = {}): SpectrumObject {
    return { ...baseEntity("spectrum"), kind: "spectrum", spectrum: { ...DEFAULT_SPECTRUM }, ...overrides };
}

/** Creates a new smoke source with default settings. */
export function createSmokeObject(overrides: Partial<SmokeObject> = {}): SmokeObject {
    return { ...baseEntity("smoke"), kind: "smoke", smoke: { ...DEFAULT_SMOKE }, ...overrides };
}

/** Creates whatever the add bar asked for. */
export function createByType(type: AddType, overrides: Partial<EntityBase> = {}): SceneObject {
    if (type === "spectrum") return createSpectrumObject(overrides);
    if (type === "smoke") return createSmokeObject(overrides);
    return createObject(type, overrides);
}

/** A readable name for a new item, e.g. the third cube becomes "Cube 3". */
export function nextObjectName(type: AddType, objects: SceneObject[]): string {
    const count = objects.filter((object) => (object.kind === "shape" ? object.type : object.kind) === type).length;
    return `${TYPE_NAMES[type]} ${count + 1}`;
}


export function spawnPosition(index: number): Axes<number> {
    const step = Math.ceil(index / 2) * 2;
    const x = index === 0 ? 0 : index % 2 === 1 ? step : -step;
    return { x, y: 0, z: 0 };
}

export const defaultSettings: VisualSettings = {

    objects: [createObject("cube"), createSpectrumObject(), createSmokeObject()],

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

    background: {
    mode: "colour",
    colour: "#000000",
    imageUrl: BACKGROUND_IMAGES[0].url,
    brightness: 1,
    spin: 0,
    },
};