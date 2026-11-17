import { Scene, TransformNode, MeshBuilder, StandardMaterial, Color3, ImportMeshAsync, AbstractMesh } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { AudioFeatures } from "../audio/audioFeatures";
import { applyTransformReactions, readReaction } from "./reactions";
import type { ShapeReactions, ShapeType } from "./settings";

export function createShapes(scene: Scene){
    const pivot = new TransformNode("shapePivot", scene);

    let reactions: ShapeReactions | null = null;
    let current: AbstractMesh | null = null;
    let currentType: ShapeType | null = null;
    let material: StandardMaterial | null = null;
    let colour = new Color3(1, 0, 0.5);
    let baseScale = 1;
    let loadId = 0; //used to ignore model loads that finish after the user swaps shape

    async function build(type: ShapeType): Promise<AbstractMesh | null> {
        if (type === "model"){
            try {
                const result = await ImportMeshAsync("/public/models/mr._burns_body.glb", scene);
                const root = result.meshes[0];
                root.normalizeToUnitCube();
                return root;
            } catch (error){
                console.error("Could not load model", error);
                return null;
            }
        }

        const mesh = 
        type === "cube"
            ? MeshBuilder.CreateBox("cube", { size: 1 }, scene)
            : MeshBuilder.CreateSphere("sphere", { diameter: 1.2 }, scene);

        if (type === "cube"){
            mesh.enableEdgesRendering()
            mesh.edgesWidth = 2;
            mesh.edgesColor = Color3.Black().toColor4(1);
        }

        return mesh;
    }

    return {
        async setShape(type: ShapeType){
            if (type === currentType) return;
            currentType = type;
            const id = ++loadId;

            //remove old shape
            current?.dispose(false, true);
            current = null;
            material = null;

            const mesh = await build(type);
            if (!mesh) return;

            //if user picked somthing else while thisis loading, throw this one away
            if (id !== loadId || scene.isDisposed) {
                mesh.dispose(false, true);
                return;
            }

            if (type !== "model") {
                material = new StandardMaterial(`${type}Material`, scene);
                mesh.material = material;
            }

            mesh.parent = pivot;
            current = mesh;
        },

        setColour(hex: string){
            colour = Color3.FromHexString(hex);
        },

        setScale(scale: number){
            baseScale = scale;
        },

        setReactions(value: ShapeReactions){
            reactions = value;
        },

        update(features: AudioFeatures) {
            if (!reactions) return;

            applyTransformReactions(pivot, reactions, features, baseScale);

            //glow
            if (material) {
                const glow = readReaction(reactions.glow, features);
                colour.scaleToRef(0.3 + glow * 0.7, material.emissiveColor); 
            }
        },
    };
}