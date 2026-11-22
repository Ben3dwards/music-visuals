import { Scene, TransformNode, UniversalCamera, Vector3, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import { applyEntityTransform, type EntityInstance } from "./entity";
import { setGlowStrength } from "./glow";
import { readReaction, type Reaction } from "./reactions";
import type { SceneObject } from "./settings";


const MAX_PUNCH = 1.5;
const TRACK_PUNCH = 0.3;
const ORBIT_SPEED = 0.01;
const MAX_ORBIT_BOOST = 2;

//On camera item
export function createCameraItem(
  scene: Scene,
  id: string,
  canvas: HTMLCanvasElement,
  getNode: (id: string) => TransformNode | null, //finds other items, for Look at
): EntityInstance {

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

    //Settings

    let punch: Reaction = { source: "none", amount: 0 };
    let freeLook = false;
    let lookAt: string | null = null;
    let orbit = 0;
    let orbitReaction: Reaction = { source: "none", amount: 0 };

    //State
    
    let live = false;
    let editing = true;
    let controlling = false;
    let tracking = false;
    let angle = 0;  
    const centre = new Vector3();
    const offset = new Vector3();

    //Marker shows while editing except when looking through it
    function updateMarker() {
        const show = editing && !live;
        for (const mesh of [body, lens]) {
            mesh.isVisible = show;
            mesh.isPickable = show;
        }
    }

    function updateControl() {
        const want = live && freeLook && !tracking;
        if (want === controlling) return;
        controlling = want;
        if (want) camera.attachControl(canvas, true);
        else camera.detachControl();
    }

    //Fixed shots ride on the node
    //Tracking shots are placed in the world by hand every frame

    function setTracking(value: boolean) {
        if (value === tracking) return;
        tracking = value;
        camera.parent = value ? null : transform;
        camera.position.setAll(0);
        camera.rotation.setAll(0);
        camera.rotationQuaternion = null;
        if (!value) angle = 0;
        updateControl();
    }

    return {
        node: transform,
        camera,

        apply(object: SceneObject) {
            if (object.kind !== "camera") return;
            applyEntityTransform(transform, object);

            const settings = object.camera;
            camera.fov = (object.camera.fov * Math.PI) / 180;
            punch = settings.punch;
            freeLook = settings.freeLook;
            lookAt = settings.lookAt;
            orbit = settings.orbit;
            orbitReaction = settings.orbitReaction;

            setTracking(lookAt !== null || orbit !== 0 || orbitReaction.source !== "none");
            updateControl();
        },

         update(features: AudioFeatures) {
            const punchAmount = readReaction(punch, features);

            if (!tracking) {
                camera.position.z = punchAmount * MAX_PUNCH;
                return;
            }

            const target = lookAt ? getNode(lookAt) : null;
            if (target) {
                target.computeWorldMatrix(true);
                centre.copyFrom(target.getAbsolutePosition());
            } else {
                centre.setAll(0);
            }

            const boost = readReaction(orbitReaction, features) * MAX_ORBIT_BOOST;
            angle += (orbit + (orbit < 0 ? -boost : boost)) * ORBIT_SPEED;

            transform.computeWorldMatrix(true);
            transform.getAbsolutePosition().subtractToRef(centre, offset);
            if (offset.lengthSquared() < 0.0001) return;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = offset.x * cos - offset.z * sin;
            const z = offset.x * sin + offset.z * cos;

            const pull = 1 - punchAmount * TRACK_PUNCH;
            camera.position.set(centre.x + x * pull, centre.y + offset.y * pull, centre.z + z * pull);
            camera.setTarget(centre);
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
