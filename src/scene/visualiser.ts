import { Engine, Scene } from "@babylonjs/core";
import { createLighting } from "./lighting";
import { createAudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { createBackground } from "./background";
import { createShapes } from "./shapes";
import { createSmoke } from "./smoke";
import type { VisualSettings } from "./settings";
import { createCamera } from "./camera";
import { createSpectrum } from "./spectrum";


export function createVisualiser(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const audioFeatures = createAudioFeatures();

    //every visual effect in the scene. Adding a new one = addig to this list
    const effects: Effect[] = [
        createCamera(scene, canvas),
        createBackground(scene),
        createLighting(scene),
        createShapes(scene),
        createSpectrum(scene),
        createSmoke(scene),
    ];

    engine.runRenderLoop(() => {
        const features = audioFeatures.update();
        for (const effect of effects) effect.update?.(features);
        scene.render();
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return{
        applySettings(settings: VisualSettings) {
            for (const effect of effects) effect.apply(settings);
        },

        dispose() {
            window.removeEventListener("resize", onResize);
            for (const effect of effects) effect.dispose();
            engine.dispose();
        },
    };
}

export type Visualiser = ReturnType<typeof createVisualiser>;