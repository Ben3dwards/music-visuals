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
    attachedTo: string | null;
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

export type LightObject = EntityBase & {
    kind: "light";
    light: LightSettings;
}


//Settings for one camera
export type CameraItemSettings = {
    fov: number;
    freeLook: boolean;
    punch: Reaction;
    lookAt: string | null;  
    orbit: number;    
    orbitReaction: Reaction;
};

export type CameraObject = EntityBase & {
    kind: "camera";
    camera: CameraItemSettings;
}

export type SceneObject = ShapeObject | SpectrumObject | SmokeObject | LightObject | CameraObject;

export type AddType = ShapeType | "spectrum" | "smoke" | "light" | "camera";

export type ObjectTransform = Pick<EntityBase, "position" | "rotation" | "scale">;



//Scene wide settings

export type CameraView = "front" | "angled" | "side" | "top";
export type CameraSettings = {
    view: CameraView;
    distance: number;
    orbit: number;
    freeLook: boolean;
    punch: Reaction;
    liveCameraId: string | null;
};

export type BackgroundMode = "colour" | "image";
export type BackgroundSettings = {
    mode: BackgroundMode;
    colour: string;
    imageUrl: string;
    brightness: number;
    spin: number;
};

//Settigns for one light
export type LightKind = "point" | "directional" | "spot";
export type LightSettings = {
    type: LightKind;
    colour: string;
    intensity: number;
    flash: Reaction;
    showMarker: boolean;
};

//Scene wide lighting
export type LightingSettings = {
    ambient: number;
    glow: number;
    glowSpread: number;
}


export type VisualSettings = {
    mode: SceneMode;
    objects: SceneObject[];
    lighting: LightingSettings;
    camera: CameraSettings;
    background: BackgroundSettings;
    wormhole: WormholeSettings;
};

export type SettingsGroup = Exclude<keyof VisualSettings, "objects" | "mode">;

export type UpdateSettings = <K extends SettingsGroup>(group: K, changes: Partial<VisualSettings[K]>) => void;

export type UpdateObject = (id: string, changes: Partial<SceneObject>) => void;


//Worm holes - very very heavy AI coded as i dont really understand graphics
export type SceneMode = "scene" | "wormhole";
export type WormholeSettings = {
seed: string;             // the tunnel's character: same seed, same tunnel
    speed: number;            // how fast the walls stream towards you
    speedReaction: Reaction;  // the music pushes the speed up
    twist: number;            // turns the pattern into spirals (negative = the other way)
    density: number;          // how tightly the pattern repeats
    radius: number;           // tunnel size, 1 = default
    brightness: number;
    useSeedColours: boolean;  // let the seed pick the colours instead of A and B
    colourA: string;
    colourB: string;
    warp: number;             //how much the whole picture twirls
    warpReaction: Reaction;   //the music drives the twirl
};

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

export const DEFAULT_LIGHT: LightSettings = {
    type: "point",
    colour: "#ffffff",
    intensity: 1,
    flash: { source: "none", amount: 0 },
    showMarker: true,
};

//creates new light above and in front of scene
export function createLightObject(overrides: Partial<LightObject> = {}): LightObject {
    return {
        ...baseEntity("light"),
        kind: "light",
        position: { x: 0, y: 3, z: -3 },
        rotation: { x: 30, y: 0, z: 0 },
        light: { ...DEFAULT_LIGHT, flash: { ...DEFAULT_LIGHT.flash } },
        ...overrides,
    };
}

export const DEFAULT_CAMERA_ITEM: CameraItemSettings = {
    fov: 50,
    freeLook: false,
    punch: { source: "none", amount: 0 },
    lookAt: null,
    orbit: 0,
    orbitReaction: { source: "none", amount: 0 },
};

export function createCameraObject(overrides: Partial<CameraObject> = {}): CameraObject {
    return {
        ...baseEntity("camera"),
        kind: "camera",
        position: { x: 0, y: 0.5, z: -6 },
        camera: { ...DEFAULT_CAMERA_ITEM, punch: { ...DEFAULT_CAMERA_ITEM.punch }, orbitReaction: { ...DEFAULT_CAMERA_ITEM.orbitReaction },},
        ...overrides,
    };
}

const TYPE_NAMES: Record<AddType, string> = {
    cube: "Cube",
    sphere: "Sphere",
    model: "Model",
    spectrum: "Spectrum",
    smoke: "Smoke",
    light: "Light",
    camera: "Camera"
};


function baseEntity(type: AddType): EntityBase {
    return {
        id: crypto.randomUUID(),
        name: `${TYPE_NAMES[type]} 1`,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        visible: true,
        attachedTo: null,
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
    if (type === "light") return createLightObject(overrides);
    if (type === "camera") return createCameraObject(overrides);
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

export function withoutObject(objects: SceneObject[], id: string): SceneObject[] {
    return objects
        .filter((object) => object.id !== id)
        .map((object) => (object.attachedTo === id ? { ...object, attachedTo: null } : object));
}

export function removeObject(settings: VisualSettings, id: string): VisualSettings {
    const objects = withoutObject(settings.objects, id).map((object) =>
        object.kind === "camera" && object.camera.lookAt === id
        ? { ...object, camera: { ...object.camera, lookAt: null } }
        : object,
    );
    return {
        ...settings,
        objects,
        camera: {
            ...settings.camera,
            liveCameraId: settings.camera.liveCameraId === id ? null : settings.camera.liveCameraId,
        },
    };
}

const startingCube = createObject("cube");
export const defaultSettings: VisualSettings = {
    mode: "scene",

    objects: [startingCube, createSpectrumObject({ attachedTo: startingCube.id }),createSmokeObject({ attachedTo: startingCube.id }),],

    lighting: {
        ambient: 1,
        glow: 0.6,
        glowSpread: 32,
    },

    camera: {
    view: "front",
    distance: 5,
    orbit: 0,
    freeLook: true,
    punch: { source: "none", amount: 0 },
    liveCameraId: null,
    },

    background: {
    mode: "colour",
    colour: "#000000",
    imageUrl: BACKGROUND_IMAGES[0].url,
    brightness: 1,
    spin: 0,
    },

    wormhole: {
        seed: "Mr Happy",
        speed: 1,
        speedReaction: { source: "subBass", amount: 0.6 },
        twist: 1,
        density: 1,
        radius: 1,
        brightness: 0.8,
        useSeedColours: false,
        colourA: "#ff0080",
        colourB: "#00e5ff",
        warp: 0.2,
        warpReaction: { source: "kickPulse", amount: 0.5 },
    },
};