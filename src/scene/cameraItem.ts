import { Scene, TransformNode, UniversalCamera, Vector3, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import { applyEntityTransform, type EntityInstance } from "./entity";
import { setGlowStrength } from "./glow";
import { readReaction, type Reaction } from "./reactions";
import type { SceneObject } from "./settings";

const MAX_PUNCH = 1.5;
//On camera item
export function createCameraItem(scene: Scene, id: string, canvas: HTMLCanvasElement): EntityInstance {
    const transform = new TransformNode(`transform-${id}`, scene);

    //real camera looks along its node
    const camera = new UniversalCamera(`camera-${id}`, Vector3.Zero(), scene);
    camera.parent = transform;
    camera.minZ = 0.1;
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

    //marker
    const markerMaterial = new StandardMaterial(`cameraMarker-${id}`, scene);
    markerMaterial.disableLighting = true;
    markerMaterial.emissiveColor = new Color3(0.8, 0.8, 0.8);

    const body = MeshBuilder.CreateBox(`cameraBody-${id}`, { width: 0.4, height: 0.3, depth: 0.3 }, scene);
    const lens = MeshBuilder.CreateCylinder(`cameraLens-${id}`, { height: 0.25, diameterTop: 0.25, diameterBottom: 0.08 }, scene);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.27;

    for (const mesh of [body, lens]) {
        mesh.parent = transform;
        mesh.material = markerMaterial;
        mesh.metadata = { objectId: id };
        setGlowStrength(mesh, 0.2);
    }

    let punch: Reaction = { source: "none", amount: 0 };
    let freeLook = false;
    let live = false;
    let editing = true;
    let controlling = false;

    //Marker shows while editing except when looking through it
    function updateMarker() {
        const show = editing && !live;
        for (const mesh of [body, lens]) {
            mesh.isVisible = show;
            mesh.isPickable = show;
        }
    }

    function updateControl() {
        const want = live && freeLook;
        if (want === controlling) return;
        controlling = want;
        if (want) camera.attachControl(canvas, true);
        else camera.detachControl();
    }

    return {
        node: transform,
        camera,

        apply(object: SceneObject) {
            if (object.kind !== "camera") return;
            applyEntityTransform(transform, object);

            camera.fov = (object.camera.fov * Math.PI) / 180;
            punch = object.camera.punch;
            freeLook = object.camera.freeLook;
            updateControl();
        },

         update(features: AudioFeatures) {
            camera.position.z = readReaction(punch, features) * MAX_PUNCH;
        },

        setSelected(selected: boolean) {
            body.showBoundingBox = selected;
        },

         setEditing(value: boolean) {
            editing = value;
            updateMarker();
        },

        setLive(value: boolean) {
            live = value;
        updateMarker();
        updateControl();
        },

         dispose() {
            camera.detachControl();
            camera.dispose();
            markerMaterial.dispose();
            transform.dispose();
        },
    };
}
