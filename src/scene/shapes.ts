import { Scene, TransformNode, MeshBuilder, StandardMaterial, Color3, ImportMeshAsync, AbstractMesh } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { applyTransformReactions, readReaction } from "./reactions";
import type { ShapeReactions, ShapeType, VisualSettings, ShapeFinish } from "./settings";

const MODEL_URL = "/public/models/mr._burns_body.glb"

function centreOnOrigin(root: AbstractMesh){
    root.computeWorldMatrix(true);
    const { min, max } = root.getHierarchyBoundingVectors();
    const centre = min.add(max).scaleInPlace(0.5);
    root.position.subtractInPlace(centre);
}

export function createShapes(scene: Scene): Effect{
    const pivot = new TransformNode("shapePivot", scene);

    let finish: ShapeFinish = "glow";
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
                const result = await ImportMeshAsync(MODEL_URL, scene);
                const root = result.meshes[0];
                root.normalizeToUnitCube();
                centreOnOrigin(root);
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

    async function setShape(type: ShapeType) {
        if (type === currentType) return;
        currentType = type;
        const id = ++loadId;

        //Remove old shape
        current?.dispose(false, true);
        current = null;
        material = null;

        const mesh = await build(type);
        if (!mesh) return;

        //If user picked something else while this was loading, throw this one away
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
    }

    return {
        apply({ shape }: VisualSettings) {
            void setShape(shape.type);
            colour = Color3.FromHexString(shape.colour);
            baseScale = shape.scale;
            reactions = shape.reactions;
            finish = shape.finish
        },

        update(features: AudioFeatures) {
            if (!reactions) return;

            applyTransformReactions(pivot, reactions, features, baseScale);

            // Glow
            if (material) {
                const glow = readReaction(reactions.glow, features);

                if (finish === "glow"){
                    //self lit: neon colour, brighter with music
                    material.diffuseColor.set(0,0,0);
                    colour.scaleToRef(0.3 + glow * 0.7, material.emissiveColor);
                }else{
                    //lit by the scenes light with a little glow added by the music
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