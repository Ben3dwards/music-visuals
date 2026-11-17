import { Scene, Color3 } from "@babylonjs/core";
import type { Effect } from "./effect";
import type { VisualSettings } from "./settings";

export function createBackground(scene: Scene): Effect{
    return {
        apply({ background }: VisualSettings) {
            scene.clearColor = Color3.FromHexString(background.colour).toColor4(1);
        },

        dispose(){
            //nothing to clean up yet - for importing backgrounds
        },
    };
}