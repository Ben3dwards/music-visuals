import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3 } from "@babylonjs/core";
import { audio } from "../audio/audioAnalyser";
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

    const background = createBackground(scene);
    const shapes = createShapes(scene);
    const smoke = createSmoke(scene);

    engine.runRenderLoop(() => {
        const bands = audio.getBands();
        shapes.update(bands);
        smoke.update(bands);
        scene.render();
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return{
        applySettings(settings: VisualSettings){
            background.setColour(settings.backgroundColour);
            void shapes.setShape(settings.shape);
            shapes.setColour(settings.shapeColour);
            shapes.setScale(settings.scale);
            smoke.setEnabled(settings.smokeEnabled);
            smoke.setDensity(settings.smokeDensity);
        },

        dispose() {
            window.removeEventListener("resize", onResize);
            engine.dispose();
        },
    };
}

export type Visualisor = ReturnType<typeof createVisualiser>;