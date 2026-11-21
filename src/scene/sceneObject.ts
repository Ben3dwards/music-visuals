import { Scene, TransformNode, MeshBuilder, StandardMaterial, Color3, ImportMeshAsync, AbstractMesh } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { AudioFeatures } from "../audio/audioFeatures";
import { setGlowStrength } from "./glow";
import { applyTransformReactions, readReaction } from "./reactions";
import type { BorderSettings, SceneObject, ShapeFinish, ShapeReactions, ShapeType } from "./settings";



//Moces a model so the centre of its box sits on the origin. rotates around it
function centreOnOrigin(root: AbstractMesh) {
    root.computeWorldMatrix(true);
    const { min, max } = root.getHierarchyBoundingVectors();
    const centre = min.add(max).scaleInPlace(0.5);
    root.position.subtractInPlace(centre);
}

//One object in the scene: Builds the mesh, styles it and makes it react to the music
export function createSceneObject(scene: Scene, id: string) {
    //music moves the pivot
    const pivot = new TransformNode(`pivot-${id}`, scene);
    const orientation = new TransformNode(`orientation-${id}`, scene);
    const stretcher = new TransformNode(`stretch-${id}`, scene); 
    orientation.parent = pivot;
    stretcher.parent = orientation;


    let current: AbstractMesh | null = null;
    let currentType: ShapeType | null = null;
    let currentModelUrl: string | null = null;
    let material: StandardMaterial | null = null;
    let colour = new Color3(1, 0, 0.5);
    let baseScale = 1;
    let reactions: ShapeReactions | null = null;
    let finish: ShapeFinish = "glow";
    let bloom = 1;
    let border: BorderSettings = { enabled: true, colour: "#000000", width: 0.25 };
    let modelUrl = "";
    let loadId = 0; //Ignores model loads that finish after the user switched shape
    let selected = false;

    async function build(type: ShapeType): Promise<AbstractMesh | null> {
        if (type === "model") {
            try{
                const result = await ImportMeshAsync(modelUrl, scene, { pluginExtension: ".glb" });
                const root = result.meshes[0];
                root.normalizeToUnitCube();
                centreOnOrigin(root);
                return root;
            } catch(error){
                console.error("Could not load model", error);
                return null;
            }
        }

        return type === "cube"
            ? MeshBuilder.CreateBox(`cube-${id}`, { size: 1 }, scene)
            : MeshBuilder.CreateSphere(`sphere-${id}`, { diameter: 1.2 }, scene);
    }

    //Apply the border and bloom settings to the current mesh
    function applyStyle() {
        if (!current) return;

        const borderColour = Color3.FromHexString(border.colour);
        const meshes = [current, ...current.getChildMeshes()];

        for (const mesh of meshes) {
            mesh.metadata = { ...mesh.metadata, objectId: id }; //click on this mesh knows which object it belongs to
            mesh.showBoundingBox = selected;   
            setGlowStrength(mesh, bloom);


            if (currentType === "cube") {
                if (border.enabled) {
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = 1 + border.width * 8;
                    mesh.edgesColor = borderColour.toColor4(1);
                } else {
                    mesh.disableEdgesRendering();
                }
            } else {
                mesh.renderOutline = border.enabled;
                mesh.outlineWidth = border.width * 0.05;
                mesh.outlineColor = borderColour;
            }
        }
    }


    async function setShape(type: ShapeType) {
        //Rebuild if the type changed
        const isSame = type === currentType && (type !== "model" || modelUrl === currentModelUrl);
        if (isSame) return;
        currentType = type;
        currentModelUrl = type === "model" ? modelUrl : null;
        const id = ++loadId;

        current?.dispose(false, true);
        current = null;
        material = null;

        const mesh = await build(type);
        if (!mesh) return;

        if (id !== loadId || scene.isDisposed) {
            mesh.dispose(false, true);
            return;
        }

        if (type !== "model") {
            material = new StandardMaterial(`${type}Material-${id}`, scene);
            mesh.material = material;
        }

        mesh.parent = stretcher;
        current = mesh;
        applyStyle();
    }

    return {
        setSelected(value: boolean) {
            selected = value;
            applyStyle();
        },
        
        apply(object: SceneObject) {
            
            modelUrl = object.modelUrl;
            void setShape(object.type);

            colour = Color3.FromHexString(object.colour);
            baseScale = object.scale;
            reactions = object.reactions;
            finish = object.finish;
            bloom = object.bloom;
            border = object.border
            
            const toRadians = Math.PI / 180;
            orientation.rotation.set(
                object.rotation.x * toRadians,
                object.rotation.y * toRadians,
                object.rotation.z * toRadians,
            );
            pivot.position.set(object.position.x, object.position.y, object.position.z);
            pivot.setEnabled(object.visible);
            applyStyle();
        },

        update(features: AudioFeatures) {
            if (!reactions) return;

            applyTransformReactions(pivot, stretcher, reactions, features, baseScale);

            if (material) {
                const glow = readReaction(reactions.glow, features);

                if (finish === "glow") {
                    material.diffuseColor.set(0, 0, 0);
                    colour.scaleToRef(0.3 + glow * 0.7, material.emissiveColor);
                } else {
                    material.diffuseColor.copyFrom(colour);
                    colour.scaleToRef(glow * 0.5, material.emissiveColor);
                }
            }
        },

        dispose() {
            loadId++; // cancels any model still loading
            current?.dispose(false, true);
            pivot.dispose();
        },
    };
}

export type SceneObjectInstance = ReturnType<typeof createSceneObject>;