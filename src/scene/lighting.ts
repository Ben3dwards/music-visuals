import { Scene, HemisphericLight, PointLight, DirectionalLight, GlowLayer, Vector3, type Light } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { readReaction, type Reaction } from "./reactions";
import type { LightType, VisualSettings } from "./settings";

const MAX_FLASH = 2;

function createLight(type: LightType, scene: Scene): Light{
    switch (type) {
        case "ambient":
            return new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        case "point":
            return new PointLight("light", new Vector3(2, 2, -3), scene);
        case "directional":
            return new DirectionalLight("light", new Vector3(-0.5, -1, 1), scene);
    }
}

export function createLighting(scene: Scene): Effect {
    //bloom. anything emissive bleeds light into its surroundings
    const glowLayer = new GlowLayer("glow", scene);

    let light: Light | null = null;
    let currentType: LightType | null = null;
    let baseIntensity = 1;
    let flash: Reaction = { source: "none", amount: 0 };

    function setLightType(type: LightType) {
        if (type === currentType) return;
        currentType = type;
        light?.dispose();
        light = createLight(type, scene);
    }

    return {
        apply({ lighting }: VisualSettings) {
            setLightType(lighting.type);
            baseIntensity = lighting.intensity;
            flash = lighting.flash;
            glowLayer.intensity = lighting.glow;
        },

        update(features: AudioFeatures) {
            if (!light) return;
            light.intensity = baseIntensity * (1 + readReaction(flash, features) * MAX_FLASH);
        },

        dispose() {
            light?.dispose();
            glowLayer.dispose();
        },
    };
}