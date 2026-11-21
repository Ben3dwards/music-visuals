import { Engine, Scene, PointerEventTypes  } from "@babylonjs/core";
import { createLighting } from "./lighting";
import { createAudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { createBackground } from "./background";
import { createObjects } from "./objects";
import { createSmoke } from "./smoke";
import type { VisualSettings, ObjectTransform } from "./settings";
import { createCamera } from "./camera";
import { createSpectrum } from "./spectrum";
import { createGizmos, type GizmoMode } from "./gizmos";

type VisualiserOptions = {
    onSelect: (id: string | null) => void;
    onTransformEnd: (id: string, transform: ObjectTransform) => void; //after a gizmo drag
};


export function createVisualiser(canvas: HTMLCanvasElement, { onSelect, onTransformEnd }: VisualiserOptions) {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const audioFeatures = createAudioFeatures();
    const objects = createObjects(scene);

    //every visual effect in the scene. Adding a new one = addig to this list
    const effects: Effect[] = [
        createCamera(scene, canvas),
        createBackground(scene),
        createLighting(scene),
        objects,
        createSpectrum(scene),
        createSmoke(scene),
    ];

    let selectedId: string | null = null;
    const gizmos = createGizmos(scene, (transform) => {
        if (selectedId) onTransformEnd(selectedId, transform);
    });

      scene.onPointerObservable.add((info) => {
            if (info.type !== PointerEventTypes.POINTERTAP) return;
            const picked = info.pickInfo?.pickedMesh;
            onSelect(picked?.metadata?.objectId ?? null);
        });

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

        select(id: string | null) {
            selectedId = id;
            objects.select(id);
            gizmos.attach(id ? objects.getNode(id) : null);
        },

        setGizmoMode(mode: GizmoMode) {
            gizmos.setMode(mode);
        },


        dispose() {
            window.removeEventListener("resize", onResize);
            gizmos.dispose();
            for (const effect of effects) effect.dispose();
            engine.dispose();
        },
    };
}

export type Visualiser = ReturnType<typeof createVisualiser>;