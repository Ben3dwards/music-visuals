import { Scene, TransformNode, MeshBuilder, StandardMaterial, Color3, ImportMeshAsync, AbstractMesh } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { applyTransformReactions, readReaction } from "./reactions";
import type { ShapeReactions, ShapeType, VisualSettings, ShapeFinish, BorderSettings } from "./settings";
import { setGlowStrength } from "./glow";


function centreOnOrigin(root: AbstractMesh){
    root.computeWorldMatrix(true);
    const { min, max } = root.getHierarchyBoundingVectors();
    const centre = min.add(max).scaleInPlace(0.5);
    root.position.subtractInPlace(centre);
}

export function createShapes(scene: Scene): Effect{
    const pivot = new TransformNode("shapePivot", scene);
    const orientation = new TransformNode("shapeOrientation", scene);
    orientation.parent = pivot

    let finish: ShapeFinish = "glow";
    let reactions: ShapeReactions | null = null;
    let current: AbstractMesh | null = null;
    let currentType: ShapeType | null = null;
    let material: StandardMaterial | null = null;
    let colour = new Color3(1, 0, 0.5);
    let baseScale = 1;
    let loadId = 0; //used to ignore model loads that finish after the user swaps shape
    let bloom = 1;
    let border: BorderSettings = { enabled: true, colour: "#000000", width: 0.25 };
    let modelUrl = "";
    let currentModelUrl: string | null = null;

    async function build(type: ShapeType): Promise<AbstractMesh | null> {
        if (type === "model"){
            try {
                const result = await ImportMeshAsync(modelUrl, scene, { pluginExtension: ".glb" });
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

        return mesh;
    }

    //Applies the border and bloom settings to the current shape. including every part of an imported model.
    function applyStyle() {
        if (!current) return;

        const borderColour = Color3.FromHexString(border.colour);
        const meshes = [current, ...current.getChildMeshes()];

        for (const mesh of meshes) {
            setGlowStrength(mesh, bloom);
            
            if (currentType === "cube") {
                // Cubes get lines along every edge
                if (border.enabled) {
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = 1 + border.width * 8;
                    mesh.edgesColor = borderColour.toColor4(1);
                } else {
                    mesh.disableEdgesRendering();
                }
            } else {
                //Spheres and models get an outline around their silhouette
                mesh.renderOutline = border.enabled;
                mesh.outlineWidth = border.width * 0.05;
                mesh.outlineColor = borderColour;
            }
        }
    }


    async function setShape(type: ShapeType) {
        const isSame = type === currentType && (type !== "model" || modelUrl === currentModelUrl);
        if (isSame) return;
        currentType = type;
        currentModelUrl = type === "model" ? modelUrl : null;
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

        mesh.parent = orientation;
        current = mesh;
        applyStyle();

    }

    return {
        apply({ shape }: VisualSettings) {
            const toRadians = Math.PI / 180;
            orientation.rotation.set(
                shape.rotation.x * toRadians,
                shape.rotation.y * toRadians,
                shape.rotation.z * toRadians,
            );
            modelUrl = shape.modelUrl;
            void setShape(shape.type);
            colour = Color3.FromHexString(shape.colour);
            baseScale = shape.scale;
            reactions = shape.reactions;
            finish = shape.finish;
            bloom = shape.bloom;
            border = shape.border;
            applyStyle();
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