import type { Option } from "../controls";
import type {
    BackgroundMode,
    CameraView,
    LightType,
    ShapeFinish,
    ShapeType,
    UpdateSettings,
    VisualSettings,
    WindMode,

} from "../../scene/settings";


//What every panel extion recieves
export type PanelSectionProps = {
    settings: VisualSettings;
    onChange: UpdateSettings;
};


export const AXES = ["x", "y", "z"] as const;

export const SHAPE_OPTIONS: Option<ShapeType>[] = [
    { value: "cube", label: "Cube" },
    { value: "sphere", label: "Sphere" },
    { value: "model", label: "Model" },
];

export const FINISH_OPTIONS: Option<ShapeFinish>[] = [
    { value: "glow", label: "Glow" },
    { value: "lit", label: "Lit" },
];

export const LIGHT_OPTIONS: Option<LightType>[] = [
    { value: "ambient", label: "Ambient" },
    { value: "point", label: "Point" },
    { value: "directional", label: "Directional" },
];

export const VIEW_OPTIONS: Option<CameraView>[] = [
    { value: "front", label: "Front" },
    { value: "angled", label: "Angled" },
    { value: "side", label: "Side" },
    { value: "top", label: "Top" },
];

export const BACKGROUND_MODE_OPTIONS: Option<BackgroundMode>[] = [
    { value: "colour", label: "Colour" },
    { value: "image", label: "Image" },
];

export const WIND_OPTIONS: Option<WindMode>[] = [
    { value: "random", label: "Random" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "up", label: "Up" },
    { value: "down", label: "Down" },
];