import { Scene, Color3 } from "@babylonjs/core";

export function createBackground(scene: Scene){
    return {
        setColour(hex: string){
            scene.clearColor = Color3.FromHexString(hex).toColor4(1);
        },
    };
}