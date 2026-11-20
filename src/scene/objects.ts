import type { Scene } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import { createSceneObject, type SceneObjectInstance } from "./sceneObject";
import type { VisualSettings } from "./settings";


// Keeps the scenes objets in sync with the settings list
export function createObjects(scene: Scene): Effect {
    const instances = new Map<string, SceneObjectInstance>();

    return{
        apply({ objects }: VisualSettings) {
            //Remove objects no longer in the list
            const ids = new Set(objects.map((object) => object.id));
            for (const [id, instance] of instances) {
                if (!ids.has(id)) {
                    instance.dispose();
                    instances.delete(id);
                }
            }

            //Create new objects and update every object with its settings
            for (const object of objects) {
                let instance = instances.get(object.id);
                if (!instance) {
                    instance = createSceneObject(scene, object.id);
                    instances.set(object.id, instance);
                }
                instance.apply(object);
            }
        },

        update(features: AudioFeatures) {
            for (const instance of instances.values()) instance.update(features);
        },

        dispose() {
            for (const instance of instances.values()) instance.dispose();
            instances.clear();
        },
    };
}