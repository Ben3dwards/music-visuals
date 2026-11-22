import { Scene, HemisphericLight, GlowLayer, Vector3, Color3, type StandardMaterial } from "@babylonjs/core";
import type { Effect } from "./effect";
import { getGlowStrength } from "./glow";
import type { VisualSettings } from "./settings";

//Scene wide light from above
export function createLighting(scene: Scene): Effect {
    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);

    //Bloom: anything glowing bleeds into its surroundings
    const glowLayer = new GlowLayer("glow", scene);
    glowLayer.customEmissiveColorSelector = (mesh, _subMesh, material, result) => {
        const emissive = (material as StandardMaterial).emissiveColor ?? Color3.Black();
        const strength = getGlowStrength(mesh);
        result.set(emissive.r * strength, emissive.g * strength, emissive.b * strength, 1);
    };

    return {
        apply({ lighting }: VisualSettings) {
            ambient.intensity = lighting.ambient;
            glowLayer.intensity = lighting.glow;
            glowLayer.blurKernelSize = lighting.glowSpread;
        },

        dispose() {
            ambient.dispose();
            glowLayer.dispose();
        },
    };
}