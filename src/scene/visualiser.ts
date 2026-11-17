import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3 } from "@babylonjs/core";
import { createAudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { createBackground } from "./background";
import { createShapes } from "./shapes";
import { createSmoke } from "./smoke";
import type { VisualSettings } from "./settings";


export function createVisualiser(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 2, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    new HemisphericLight("light", new Vector3(0,1,0), scene);

    const audioFeatures = createAudioFeatures();

    //every visual effect in the scene. Adding a new one = addig to this list
    const effects: Effect[] = [
        createBackground(scene),
        createShapes(scene),
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