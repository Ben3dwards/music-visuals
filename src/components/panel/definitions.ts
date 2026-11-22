import type { CameraSettings, CameraItemSettings, LightingSettings, LightSettings, SmokeSettings, SpectrumSettings } from "../../scene/settings";
import type { ControlDef } from "./controlTypes";
import { LIGHT_OPTIONS, VIEW_OPTIONS, WIND_OPTIONS } from "./shared";

export const LIGHTING_CONTROLS: ControlDef<LightingSettings>[] = [
    { type: "slider", label: "Ambient light", key: "ambient", min: 0, max: 2, step: 0.05 },
    { type: "slider", label: "Glow", key: "glow", min: 0, max: 2, step: 0.05 },
    { type: "slider", label: "Glow spread", key: "glowSpread", min: 8, max: 128, step: 1 },
];

export const LIGHT_CONTROLS: ControlDef<LightSettings>[] = [
    { type: "buttons", label: "Type", key: "type", options: LIGHT_OPTIONS },
    { type: "colour", label: "Colour", key: "colour" },
    { type: "slider", label: "Brightness", key: "intensity", min: 0, max: 3, step: 0.05 },
    { type: "toggle", label: "Show marker", key: "showMarker" },
    { type: "reaction", label: "Flash", key: "flash" },
];


export const CAMERA_CONTROLS: ControlDef<CameraSettings>[] = [
    { type: "buttons", label: "View", key: "view", options: VIEW_OPTIONS },
    { type: "slider", label: "Distance", key: "distance", min: 2, max: 15, step: 0.1 },
    { type: "slider", label: "Orbit", key: "orbit", min: -2, max: 2, step: 0.05 },
    { type: "toggle", label: "Free look (drag)", key: "freeLook" },
    { type: "reaction", label: "Punch", key: "punch" },
];

export const CAMERA_ITEM_CONTROLS: ControlDef<CameraItemSettings>[] = [
    { type: "slider", label: "Field of view", key: "fov", min: 20, max: 100, step: 1 },
    { type: "slider", label: "Orbit", key: "orbit", min: -2, max: 2, step: 0.05 },
    { type: "reaction", label: "Orbit boost", key: "orbitReaction" },
    { type: "toggle", label: "Free look (fixed shots only)", key: "freeLook" },
    { type: "reaction", label: "Punch", key: "punch" },
];

const gridOff = (spectrum: SpectrumSettings) => !spectrum.grid;
const ringOff = (spectrum: SpectrumSettings) => !spectrum.ring;

export const SPECTRUM_CONTROLS: ControlDef<SpectrumSettings>[] = [
    { type: "toggle", label: "Ring", key: "ring" },
    { type: "toggle", label: "Grid", key: "grid" },
    { type: "colour", label: "Colour", key: "colour" },
    { type: "slider", label: "Brightness", key: "brightness", min: 0, max: 1, step: 0.05 },
    { type: "slider", label: "Bloom", key: "bloom", min: 0, max: 2, step: 0.05 },
    { type: "slider", label: "Bar width", key: "barWidth", min: 0.2, max: 1.5, step: 0.05 },
    { type: "slider", label: "Bar height", key: "height", min: 0.25, max: 3, step: 0.05 },
    { type: "slider", label: "Grid spacing", key: "gridSpacing", min: 0.5, max: 3, step: 0.05, disabled: gridOff },
    { type: "slider", label: "Depth fade", key: "fade", min: 0, max: 1, step: 0.05, disabled: gridOff },
    { type: "slider", label: "Ring size", key: "radius", min: 0.5, max: 3, step: 0.05, disabled: ringOff },
];

const smokeOff = (smoke: SmokeSettings) => !smoke.enabled;

export const SMOKE_CONTROLS: ControlDef<SmokeSettings>[] = [
    { type: "toggle", label: "Enabled", key: "enabled" },
    { type: "slider", label: "Density", key: "density", min: 0, max: 2, step: 0.05, disabled: smokeOff },
    { type: "slider", label: "Spread", key: "spread", min: 0.5, max: 3, step: 0.05, disabled: smokeOff },
    { type: "slider", label: "Puff size", key: "size", min: 0.25, max: 3, step: 0.05, disabled: smokeOff },
    { type: "colour", label: "Colour A", key: "colourA", disabled: smokeOff },
    { type: "colour", label: "Colour B", key: "colourB", disabled: smokeOff },
    { type: "buttons", label: "Wind", key: "windMode", options: WIND_OPTIONS },
    { type: "slider", label: "Wind strength", key: "wind", min: 0, max: 3, step: 0.05, disabled: smokeOff },
];