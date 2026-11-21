import type { Scene, TransformNode } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import type { EntityInstance } from "./entity";
import { createSceneObject } from "./sceneObject";
import { createSmoke } from "./smoke";
import { createSpectrum } from "./spectrum";
import type { SceneObject, VisualSettings } from "./settings";

function createInstance(scene: Scene, object: SceneObject): EntityInstance {
    switch (object.kind) {
        case "shape":
            return createSceneObject(scene, object.id);
        case "spectrum":
            return createSpectrum(scene, object.id);
        case "smoke":
            return createSmoke(scene, object.id);
    }
}

//Keeps scene items in sync with the settings

export function createObjects(scene: Scene): Effect & {select(id: string | null): void; getNode(id: string): TransformNode | null;} {
    const instances = new Map<string, EntityInstance>();
    let selectedId: string | null = null;

    return {
        apply({ objects }: VisualSettings) {
            const ids = new Set(objects.map((object) => object.id));

             for (const object of objects) {
                let instance = instances.get(object.id);
                    if (!instance) {
                        instance = createInstance(scene, object);
                        instance.setSelected(object.id === selectedId);
                        instances.set(object.id, instance);
                    }
                 instance.apply(object);
            }

            for (const object of objects) {
                const instance = instances.get(object.id)!;
                const target = object.attachedTo && ids.has(object.attachedTo) ? instances.get(object.attachedTo) : undefined;
                const parent = target?.node ?? null;
                if (instance.node.parent !== parent) instance.node.parent = parent;
            }

            for (const [id, instance] of instances) {
                if (!ids.has(id)) {
                    instance.dispose();
                    instances.delete(id);

                }
            }
        },

        update(features: AudioFeatures) {
            for (const instance of instances.values()) instance.update(features);
        },

        select(id: string | null) {
            selectedId = id;
            for (const [instanceId, instance] of instances) {
            instance.setSelected(instanceId === id);
            }
        },

        getNode(id: string) {
            return instances.get(id)?.node ?? null;
        },

        dispose() {
            for (const instance of instances.values()) instance.dispose();
            instances.clear();
        },
    };
}