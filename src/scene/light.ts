import { Scene, TransformNode, PointLight, DirectionalLight, SpotLight, Vector3, MeshBuilder, StandardMaterial, Color3, type Light } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import { applyEntityTransform, type EntityInstance } from "./entity";
import { setGlowStrength } from "./glow";
import { readReaction, type Reaction } from "./reactions";
import type { LightKind, SceneObject } from "./settings";


const MAX_FLASH = 2;

function buildLight(type: LightKind, id: string, scene: Scene): Light {
    switch (type) {
        case "point":
            return new PointLight(`light-${id}`, Vector3.Zero(), scene);
        case "directional":
            return new DirectionalLight(`light-${id}`, new Vector3(0, 0, 1), scene);
        case "spot":
            return new SpotLight(`light-${id}`, Vector3.Zero(), new Vector3(0, 0, 1), Math.PI / 3, 2, scene);
    }
}


//One light item plus a marker you can see

export function createLight(scene: Scene, id: string): EntityInstance {
    const transform = new TransformNode(`transform-${id}`, scene);

    //The marker
    const markerMaterial = new StandardMaterial(`lightMarker-${id}`, scene);
    markerMaterial.disableLighting = true;
    const bulb = MeshBuilder.CreateSphere(`lightBulb-${id}`, { diameter: 0.25 }, scene);
    const pointer = MeshBuilder.CreateCylinder(`lightPointer-${id}`, { height: 0.5, diameterTop: 0, diameterBottom: 0.12 }, scene);
    pointer.rotation.x = Math.PI / 2;
    pointer.position.z = 0.35;

      for (const mesh of [bulb, pointer]) {
        mesh.parent = transform;
        mesh.material = markerMaterial;
        mesh.metadata = { objectId: id }; //clicking the marker selects this light
        setGlowStrength(mesh, 0.3);
      }

    let light: Light | null = null;
    let currentType: LightKind | null = null;
    let baseIntensity = 1;
    let flash: Reaction = { source: "none", amount: 0 };
    let markerWanted = true; //the users Show marker setting
    let editing = true;      //false during performance

    function setType(type: LightKind) {
         if (type === currentType) return;
        currentType = type;
        light?.dispose();
        light = buildLight(type, id, scene);
        light.parent = transform; //light moves and turns with its node
    }

    //Show marker only while edititing or if the user wants it
    function updateMarker() {
        const show = markerWanted && editing;
        bulb.isVisible = show;
        bulb.isPickable = show;
        pointer.isVisible = show && currentType !== "point";
        pointer.isPickable = pointer.isVisible;
    }

    return {
        node: transform,
        apply(object: SceneObject) {
            if (object.kind !== "light") return;
            applyEntityTransform(transform, object);

            const settings = object.light;
            setType(settings.type);

            const colour = Color3.FromHexString(settings.colour);
            light!.diffuse = colour;
            light!.specular = colour;
            markerMaterial.emissiveColor = colour;

            baseIntensity = settings.intensity;
            flash = settings.flash;
            markerWanted = settings.showMarker;
            updateMarker();
        },

        update(features: AudioFeatures) {
            if (light) light.intensity = baseIntensity * (1 + readReaction(flash, features) * MAX_FLASH);
        },

        setSelected(selected: boolean) {
            bulb.showBoundingBox = selected;
        },

        setEditing(value: boolean){
            editing = value;
            updateMarker();
        },

        dispose(){
            light?.dispose();
            markerMaterial.dispose();
            transform.dispose();
        },
    };
}