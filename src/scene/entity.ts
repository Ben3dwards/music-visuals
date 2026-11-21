import type { TransformNode } from "@babylonjs/core";
import type { AudioFeatures } from "../audio/audioFeatures";
import type { EntityBase, SceneObject } from "./settings";

// What every kind of scene item looks like on the Babylon side
export type EntityInstance = {
    node: TransformNode;                         
    apply(object: SceneObject): void;            
    update(features: AudioFeatures): void;       
    setSelected(selected: boolean): void;        
    dispose(): void;
};

// Puts the users position, rotation, size and visibility onto an item's node.
export function applyEntityTransform(node: TransformNode, entity: EntityBase) {
    const toRadians = Math.PI / 180;
    node.rotationQuaternion = null;
    node.position.set(entity.position.x, entity.position.y, entity.position.z);
    node.rotation.set(entity.rotation.x * toRadians, entity.rotation.y * toRadians, entity.rotation.z * toRadians);
    node.scaling.setAll(entity.scale);
    node.setEnabled(entity.visible);
}