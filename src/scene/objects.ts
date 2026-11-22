import type { Camera, Scene, TransformNode } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { Effect } from "./effect";
import type { EntityInstance } from "./entity";
import { createSceneObject } from "./sceneObject";
import { createSmoke } from "./smoke";
import { createSpectrum } from "./spectrum";
import type { SceneObject, VisualSettings } from "./settings";
import { createLight } from "./light";
import { createCameraItem } from "./cameraItem";

function createInstance(scene: Scene, canvas: HTMLCanvasElement, object: SceneObject): EntityInstance {
    switch (object.kind) {
        case "shape":
            return createSceneObject(scene, object.id);
        case "spectrum":
            return createSpectrum(scene, object.id);
        case "smoke":
            return createSmoke(scene, object.id);
        case "light":
            return createLight(scene, object.id);
        case "camera":
            return createCameraItem(scene, object.id, canvas);
    }
}

//Keeps scene items in sync with the settings

export function createObjects(scene: Scene, canvas: HTMLCanvasElement): Effect & {
  select(id: string | null): void;
  getNode(id: string): TransformNode | null;
  setEditing(editing: boolean): void;
  getCamera(id: string): Camera | null;
  setLiveCamera(id: string | null): void;
} {
    const instances = new Map<string, EntityInstance>();
    let selectedId: string | null = null;
    let editing = true;

    return {
        apply({ objects }: VisualSettings) {
            const ids = new Set(objects.map((object) => object.id));

             for (const object of objects) {
                let instance = instances.get(object.id);
                    if (!instance) {
                        instance = createInstance(scene, canvas, object);
                        instance.setSelected(object.id === selectedId);
                        instance.setEditing?.(editing);
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

        setEditing(value: boolean) {
            editing = value;
            for (const instance of instances.values()) instance.setEditing?.(value);
        },


        getNode(id: string) {
            return instances.get(id)?.node ?? null;
        },
        getCamera(id: string) {
            return instances.get(id)?.camera ?? null;
        },

        setLiveCamera(id: string | null) {
            for (const [instanceId, instance] of instances) instance.setLive?.(instanceId === id);
        },

        dispose() {
            for (const instance of instances.values()) instance.dispose();
            instances.clear();
        },
    };
}