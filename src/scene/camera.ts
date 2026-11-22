import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { readReaction, type Reaction } from "./reactions";
import type { CameraView, VisualSettings } from "./settings";


//where each preset puts the camera. alpha = angle around the scene, beta = angle down from overhead
const VIEWS: Record<CameraView, { alpha: number; beta: number }> = {
    front: { alpha: -Math.PI / 2, beta: Math.PI / 2 },
    angled: { alpha: -Math.PI / 4, beta: Math.PI / 3 },
    side: { alpha: 0, beta: Math.PI / 2 },
    top: { alpha: -Math.PI / 2, beta: 0.01 },
};


const ORBIT_SPEED = 0.01;
const MAX_PUNCH = 0.3;


export function createCamera(scene: Scene, canvas: HTMLCanvasElement): Effect & {camera: ArcRotateCamera;setActive(active: boolean): void; resetView(): void;} {
    const { alpha, beta } = VIEWS.front;
    const camera = new ArcRotateCamera("editorCamera", alpha, beta, 5, Vector3.Zero(), scene);

    let currentView: CameraView | null = null;
    let currentDistance: number | null = null;
    let freeLook = true;
    let active = true;     
    let controlling = false;
    let orbit = 0;
    let punch: Reaction = { source: "none", amount: 0 };
    let punchOffset = 0; 

    function setView(view: CameraView) {
        if (view === currentView) return;
        currentView = view;
        camera.alpha = VIEWS[view].alpha;
        camera.beta = VIEWS[view].beta;
    }

    //jumps to a distance when the slider changes.
    function setDistance(distance: number) {
        if (distance === currentDistance) return;
        currentDistance = distance;
        camera.radius = distance;
        punchOffset = 0;
    }

    function updateControl() {
        const want = active && freeLook;
        if (want === controlling) return;
        controlling = want;
        if (want) camera.attachControl(canvas, true);
        else camera.detachControl();
    }

    return {
        camera,

        apply({ camera: settings }: VisualSettings) {
            setView(settings.view);
            setDistance(settings.distance);
            freeLook = settings.freeLook;
            updateControl();
            orbit = settings.orbit;
            punch = settings.punch;
        },
        
        update(features: AudioFeatures) {
            camera.alpha += orbit * ORBIT_SPEED;

            const userDistance = camera.radius + punchOffset;
            punchOffset = userDistance * readReaction(punch, features) * MAX_PUNCH;
            camera.radius = userDistance - punchOffset;
        },

        setActive(value: boolean) {
            active = value;
            updateControl();
        },

        resetView() {
        if (currentView) {
                camera.alpha = VIEWS[currentView].alpha;
                camera.beta = VIEWS[currentView].beta;
            }
            if (currentDistance !== null) camera.radius = currentDistance;
            punchOffset = 0;
        },

        dispose(){
            camera.dispose();
        },
    };
}