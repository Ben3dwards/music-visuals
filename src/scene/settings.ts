export type ShapeType = "cube" | "sphere" | "model";

export type VisualSettings = {
    shape: ShapeType;
    shapeColour: string;
    scale: number;
    backgroundColour: string;
    smokeEnabled: boolean;
    smokeDensity: number;
}

export const defaultSettings: VisualSettings = {
    shape: "cube",
    shapeColour: "#ff0080",
    scale: 1,
    backgroundColour: "#000000",
    smokeEnabled: true,
    smokeDensity: 0.5,
};